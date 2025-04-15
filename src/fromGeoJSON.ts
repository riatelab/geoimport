import JSZip from 'jszip';
import { topology } from 'topojson-server';
import type { FeatureCollection } from 'geojson';

import { gdal } from './init';
import {
  SupportedVectorFormat,
  supportedVectorFormats,
} from './supportedFormats';

/**
 * Convert a GeoJSON FeatureCollection to another vector format.
 *
 * @param {FeatureCollection} layer - The GeoJSON FeatureCollection to convert.
 * @param {string} layerName - The name of the layer to create.
 * @param {SupportedVectorFormat} format - The format to convert to.
 * @param {string} [crs="EPSG:4326"] - The coordinate reference system to use for the output file
 * (can be a EPSG code, a PROJ string or a WKT string).
 * @returns {Promise<string | Blob>}
 * @throws {Error} - If the format is not supported or if there is an error creating resulting file.
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
  if (format === 'KML' && crs !== 'EPSG:4326') {
    throw new Error('KML format only supports EPSG:4326 CRS');
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
  if (format === 'GML') {
    options.push('-t_srs', crs);
    // For KML and GML, we only return a text file
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    return new TextDecoder().decode(bytes);
  }
  if (format === 'KML') {
    // For KML and GML, we only return a text file
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    return new TextDecoder().decode(bytes);
  }
  if (format === 'GPKG') {
    options.push('-t_srs', crs);
    // For GPKG, we return the binary file, as blob
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    return new Blob([bytes], { type: 'application/geopackage+sqlite3' });
  }
  if (format === 'FlatGeobuf') {
    options.push('-t_srs', crs);
    // For FlatGeobuf, we return the binary file, as blob
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    // It looks like there is no standard mime type for FlatGeobuf
    return new Blob([bytes], { type: '' }); // Or application/vnd.fgb / application/vnd.flatgeobuf
  }
  if (format === 'Parquet') {
    options.push('-t_srs', crs);
    // For (Geo)Parquet, we return the binary file, as blob
    const output = await gdal!.ogr2ogr(input.datasets[0], options);
    const bytes = await gdal!.getFileBytes(output);
    await gdal!.close(input as never);
    return new Blob([bytes], { type: 'application/vnd.apache.parquet' });
  }
  throw Error('Unsupported format!'); // This should never happen
};

export default fromGeoJSON;
