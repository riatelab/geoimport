import JSZip from 'jszip';
import { topology } from 'topojson-server';
import type { FeatureCollection } from 'geojson';

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
 * @param {SupportedVectorFormat} format - The format to convert to.
 * @param {string} [crs="EPSG:4326"] - The coordinate reference system to use for the output file
 * (can be a EPSG code, a PROJ string or a WKT string).
 * @returns {Promise<string | Blob>} The resulting layer, either as a String for textual formats
 * (TopoJSON, KML, GML and GPX) or as a Blob for binary formats (ESRI Shapefile, GPKG, FlatGeobuf).
 * @throws {Error} - If the format is not supported or if there is an error while creating resulting file.
 */
const fromGeoJSON = async (
  layer: FeatureCollection,
  layerName: string,
  format: SupportedVectorFormat,
  crs: string = 'EPSG:4326',
): Promise<string | Blob> => {
  // Check the various parameters
  if (!supportedVectorFormats.includes(format)) {
    throw new Error(`Unsupported format! ${format}`);
  }
  if (
    (format === 'KML' || format === 'GPX' || format === 'TopoJSON')
    && crs !== 'EPSG:4326'
  ) {
    throw new Error(`${format} format only supports EPSG:4326 CRS`);
  }

  // If the format is TopoJSON, we will use the topology function,
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
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    if (!output.all || !Array.isArray(output.all)) {
      throw new Error('Error creating shapefile');
    }
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
    // Generate the zip file (as a Blob)
    return zip.generateAsync({ type: 'blob' });
  }
  if (format === 'GML' || format === 'KML' || format === 'GPX') {
    if (format === 'GML') {
      options.push('-t_srs', crs);
    }
    // For KML, GML and GPX, we only return a text file
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    return new TextDecoder().decode(bytes);
  }
  if (format === 'GPKG' || format === 'FlatGeobuf') {
    options.push('-t_srs', crs);
    // For GPKG and FlatGeobuf, we return the binary file, as blob
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    // It look likes there is no standard mimeType for FlatGeobuf
    // but maybe we should use
    // application/vnd.fgb or application/vnd.flatgeobuf
    const mimeType = format === 'GPKG' ? 'application/geopackage+sqlite3' : '';
    return new Blob([bytes], { type: mimeType });
  }
  throw Error('Unsupported format!'); // This should never happen
};

export default fromGeoJSON;
