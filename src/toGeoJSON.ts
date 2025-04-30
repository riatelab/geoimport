import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';

import cleanFolder from './cleanFolder';
import { GeoImportError } from './error';
import { gdal } from './init';
import extractZipContent from './zip';

/**
 * Options for the `toGeoJSON` function.
 */
type ToGeoJSONOptions = {
  // The name of the layer to extract (only for formats that can contain multiple layers
  // such as GeoPackage or TopoJSON). If the input dataset contains multiples layers
  // and this option is not provided, an error is returned).
  layerName?: string;
  // Whether the returned GeoJSON must be RFC7946 compliant.
  // Default to true.
  rfc7946?: boolean;
  // Whether writing bbox at the Feature and FeatureCollection level.
  // Default to false.
  writeBbox?: boolean;
  // Whether to write NaN/Infinity values (note that some JSON parsers don't
  // support these values since they are not strictly valid JSON).
  // Default to false.
  writeNonFiniteValues?: boolean;
};

/**
 * Convert a geospatial vector dataset to a GeoJSON FeatureCollection.
 *
 * This is a wrapper around 'ogr2ogr'.
 *
 * @param {Topology | File | FileList | File[]} fileOrFiles - The dataset to convert
 * to GeoJSON (either a Topology, a File or an array of Files for ESRI Shapefiles for example).
 * @param {ToGeoJSONOptions} [options={}] - The options (such as the name of the layer to convert
 * for formats that can contain multiple layers, whether to write the BBox, etc.).
 * @return {Promise<FeatureCollection>} - The resulting GeoJSON FeatureCollection.
 * @throws {Error} - If the format is not supported or if there is an error while
 * creating resulting file.
 */
const toGeoJSON = async (
  fileOrFiles: Topology | File | FileList | File[],
  options: ToGeoJSONOptions = {},
): Promise<FeatureCollection> => {
  const {
    writeNonFiniteValues = false,
    writeBbox = false,
    rfc7946 = false,
  } = options;

  // Is the input a TopoJSON Topology ?
  if (
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    fileOrFiles.toString() === '[object Object]'
    && 'type' in fileOrFiles
    && (fileOrFiles as Topology).type === 'Topology'
  ) {
    const topo = fileOrFiles as Topology;
    // Is there multiple layers in the TopoJSON ?
    const names = Object.keys(topo.objects);
    if (
      names.length > 1
      && (!options.layerName || typeof options.layerName !== 'string')
    ) {
      throw new GeoImportError(
        `The provided TopoJSON Topology contains multiples layers (${names.join(', ')}) and no layer name was provided`,
      );
    }
    if (names.length > 1 && !names.includes(options.layerName as string)) {
      throw new GeoImportError(
        `The provided TopoJSON Topology does not contain layer name (${options.layerName}) but contains other layers (${names.join(', ')})`,
      );
    }
    const lName = names.length === 1 ? names[0] : (options.layerName as string);
    const obj = feature(topo, topo.objects[lName]);
    // If none of the special options (writeNonFiniteValues=False, rfc7946=true, writeBbox=true)
    // is set, we can return the GeoJSON as it, otherwise, we pass it through GDAL
    // to write it in the expected format
    if (writeNonFiniteValues && !rfc7946 && !writeBbox) {
      return obj as FeatureCollection;
    }
    fileOrFiles = new File([JSON.stringify(obj)], `${lName}.geojson`, {
      type: 'application/geo+json',
    });
  } else if (
    fileOrFiles instanceof File
    && (fileOrFiles.type === 'application/zip'
      || fileOrFiles.name.toLowerCase().endsWith('.zip'))
  ) {
    // Handle zipped shapefiles by unpacking them
    fileOrFiles = await extractZipContent(fileOrFiles);
  }

  fileOrFiles = fileOrFiles as File | FileList;

  const input = await gdal!.open(fileOrFiles);
  const opts = ['-f', 'GeoJSON', '-t_srs', 'EPSG:4326'];
  opts.push(
    '-lco',
    `WRITE_NON_FINITE_VALUES=${writeNonFiniteValues ? 'YES' : 'NO'}`,
  );
  opts.push('-lco', `WRITE_BBOX=${writeBbox ? 'YES' : 'NO'}`);
  opts.push('-lco', `RFC7946=${rfc7946 ? 'YES' : 'NO'}`);
  if (options.layerName) {
    opts.push(
      '-nln',
      `${options.layerName}`,
      '-sql',
      `SELECT * FROM "${options.layerName}"`,
    );
  }
  let bytes;
  try {
    const output = await gdal!.ogr2ogr(input.datasets[0], opts);
    bytes = await gdal!.getFileBytes(output);
  } catch (e) {
    let message = `Error during the conversion to GeoJSON.\nError reported by gdal3.js: ${(e as Error).message}`;
    if (fileOrFiles instanceof File && !options.layerName) {
      message +=
        'If the input dataset contains multiple layers, please provide the layer name.';
    }
    throw new GeoImportError(message);
  } finally {
    await gdal!.close(input as never);
    cleanFolder(['/input', '/output']);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const obj = JSON.parse(new TextDecoder().decode(bytes));
  if (
    typeof obj !== 'object'
    || !('type' in obj)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    || obj.type !== 'FeatureCollection'
  ) {
    throw new GeoImportError(
      'An error occurred during the conversion to GeoJSON: the result is empty or not a FeatureCollection',
    );
  }
  return obj as FeatureCollection;
};

export default toGeoJSON;
