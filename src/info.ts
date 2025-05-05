import { Topology } from 'topojson-specification';
import { FeatureCollection } from 'geojson';
import cleanFolder from './cleanFolder';
import { GeoImportError } from './error';
import { gdal } from './init';
import extractZipContent from './zip';

type FieldObject = {
  name: string;
  nullable: boolean;
  type:
    | 'Integer'
    | 'Integer64'
    | 'Real'
    | 'String'
    | 'Date'
    | 'Time'
    | 'DateTime'
    | 'Binary'
    | 'IntegerList'
    | 'Integer64List'
    | 'RealList'
    | 'StringList';
  uniqueConstraint: boolean;
  width?: number;
  precision?: number;
};

type GeometryFieldObject = {
  extent?: [number, number, number, number];
  coordinateSystem: object;
  name: string;
  nullable: boolean;
  type: string;
};

type LayerObject = {
  featureCount: number;
  fields: FieldObject[];
  geometryFields: GeometryFieldObject[];
  metadata: object;
  name: string;
};

type InfoResult = {
  description: string;
  domains: object;
  driverLongName: string;
  driverShortName: string;
  layers: LayerObject[];
  metadata: object;
  relationships: object;
};

/**
 * Get information about a vector dataset amongst the supported formats.
 *
 * This is a wrapper around 'ogrinfo'.
 *
 * @param {Topology | FeatureCollection | File | FileList | File[]} fileOrFiles - The input
 * dataset.
 * @returns {Promise<InfoResult>}
 * @throws {Error} - If the format is not supported or if there is an error while
 * getting info about the input dataset.
 */
const info = async (
  fileOrFiles: Topology | FeatureCollection | File | FileList | File[],
): Promise<InfoResult> => {
  if (
    'type' in fileOrFiles
    && (fileOrFiles.type === 'Topology'
      || fileOrFiles.type === 'FeatureCollection')
  ) {
    // The input may be a TopoJSON Topology or a GeoJSON FeatureCollection
    fileOrFiles = new File([JSON.stringify(fileOrFiles)], 'file.json', {
      type: 'application/json',
    });
  } else if (!('arrayBuffer' in fileOrFiles) && !Array.isArray(fileOrFiles)) {
    throw new GeoImportError('Unexpected input dataset');
  }
  // Handle zipped shapefiles by unpacking them
  if (
    fileOrFiles instanceof File
    && (fileOrFiles.type === 'application/zip'
      || fileOrFiles.name.toLowerCase().endsWith('.zip'))
  ) {
    fileOrFiles = await extractZipContent(fileOrFiles);
  }
  const options = ['-wkt_format', 'WKT1'];
  const input = await gdal!.open(fileOrFiles as File | FileList);
  let result;

  try {
    result = await gdal!.ogrinfo(input.datasets[0], options);
  } catch (e) {
    throw new GeoImportError(
      `Error while getting info about the input dataset.\nError reported by gdal3.js: ${(e as Error).message}`,
    );
  } finally {
    await gdal!.close(input as never);
    cleanFolder('/input');
  }
  return result as InfoResult;
};

export default info;
