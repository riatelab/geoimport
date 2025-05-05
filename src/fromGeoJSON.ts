import JSZip from 'jszip';
import { topology } from 'topojson-server';
import type { FeatureCollection } from 'geojson';

import cleanFolder from './cleanFolder';
import { GeoImportError } from './error';
import { gdal } from './init';
import {
  type SupportedVectorFormat,
  supportedVectorFormats,
} from './supportedFormats';

/**
 * Convert a GeoJSON FeatureCollection to another vector format.
 *
 * This is a wrapper around 'ogr2ogr'.
 *
 * @param {FeatureCollection} layer - The GeoJSON FeatureCollection to convert.
 * @param {string} layerName - The name of the layer to create.
 * @param {SupportedVectorFormat} format - The format to convert to (among the following
 * values: 'TopoJSON', 'ESRI Shapefile', 'KML', 'GML', 'GPKG', 'GPX' and 'FlatGeoBuf').
 * @param {string} [crs="EPSG:4326"] - The coordinate reference system to use for the output file
 * (can be a EPSG code, a PROJ string or a WKT string).
 * @returns {Promise<string | File>} The resulting layer, either as a String for textual formats
 * (TopoJSON, KML, GML and GPX) or as a File for binary formats (ESRI Shapefile, GPKG, FlatGeobuf).
 * @throws {Error} - If the format is not supported or if there is an error while creating resulting file.
 */
const fromGeoJSON = async (
  layer: FeatureCollection,
  layerName: string,
  format: SupportedVectorFormat,
  crs: string = 'EPSG:4326',
): Promise<string | File> => {
  // Check the various parameters
  if (!supportedVectorFormats.includes(format)) {
    throw new GeoImportError(`Unsupported format! ${format}`);
  }
  if (
    (format === 'KML' || format === 'GPX' || format === 'TopoJSON')
    && crs !== 'EPSG:4326'
  ) {
    throw new GeoImportError(`${format} format only supports EPSG:4326 CRS`);
  }

  // If the format is TopoJSON, we use the topology function,
  // and so we don't need to use gdal
  if (format === 'TopoJSON') {
    const topo = topology({ [layerName]: layer });
    return JSON.stringify(topo);
  }

  // Store the input GeoJSON in a temporary file
  const inputFile = new File([JSON.stringify(layer)], `${layerName}.geojson`, {
    type: 'application/geo+json',
  });
  // Open the GeoJSON file
  const input = await gdal!.open(inputFile);
  // Set the options for the conversion
  const options = ['-f', format];
  if (format === 'ESRI Shapefile') {
    options.push('-t_srs', crs);
    options.push('-lco', 'ENCODING=UTF-8');
  } else if (format === 'GPX') {
    options.push('-dsco', 'GPX_USE_EXTENSIONS=YES');
  } else if (format === 'GPKG' || format === 'FlatGeobuf' || format === 'GML') {
    options.push('-t_srs', crs);
  }

  // Try to convert the GeoJSON to the requested format
  let output;
  try {
    output = await gdal!.ogr2ogr(input.datasets[0], options);
    if (!output.all || !Array.isArray(output.all) || output.all.length < 1) {
      throw new GeoImportError(`Error creating ${format} file`);
    }
  } catch (e) {
    await gdal!.close(input as never);
    cleanFolder(['/input', '/output']);
    // @ts-expect-error No problem here
    if (e.name && e.name === 'GeoImportError') {
      throw e;
    } else {
      throw new GeoImportError(
        `Error while converting the input dataset to ${format}.\nError reported by gdal3.js: ${(e as Error).message}`,
      );
    }
  }

  if (format === 'ESRI Shapefile') {
    // We will return a zip file (encoded in base 64) containing all the shapefile files
    const zip = new JSZip();
    // Add the other files
    for (let i = 0; i < output.all.length; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const rawData = await gdal!.getFileBytes(output.all[i]);
      const blob = new Blob([rawData], { type: '' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const fileName = (output.all[i].local as string).replace('/output/', '');
      zip.file(fileName, blob, { binary: true });
    }
    await gdal!.close(input as never);
    cleanFolder(['/input', '/output']);
    // Generate the zip file (as a Blob)
    const blob = await zip.generateAsync({ type: 'blob' });
    return new File([blob], `${layerName}.zip`, { type: 'application/zip' });
  }

  if (format === 'GML' || format === 'KML' || format === 'GPX') {
    // For KML, GML and GPX, we only return a text file
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    cleanFolder(['/input', '/output']);
    return new TextDecoder().decode(bytes);
  }

  if (format === 'GPKG' || format === 'FlatGeobuf') {
    // For GPKG and FlatGeobuf, we return the binary file, as blob
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    cleanFolder(['/input', '/output']);
    // It looks like there is no standard mimeType for FlatGeobuf,
    // but maybe we should use
    // application/vnd.fgb or application/vnd.flatgeobuf
    const mimeType = format === 'GPKG' ? 'application/geopackage+sqlite3' : '';
    const extension = format === 'GPKG' ? 'gpkg' : 'fgb';
    const blob = new Blob([bytes], { type: mimeType });
    return new File([blob], `${layerName}.${extension}`, { type: blob.type });
  }

  throw new GeoImportError('Unsupported format!'); // This should never happen
};

export default fromGeoJSON;
