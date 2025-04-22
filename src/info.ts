import { gdal } from './init';
import { Topology } from 'topojson-specification';
import { FeatureCollection } from 'geojson';

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
 * @retuns {Promise<InfoResult>}
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
    fileOrFiles = new File([JSON.stringify(fileOrFiles)], 'file.topojson', {
      type: 'application/json',
    });
  } else if (!('arrayBuffer' in fileOrFiles) && !Array.isArray(fileOrFiles)) {
    throw new Error('Unexpected input dataset');
  }
  const options = ['-wkt_format', 'WKT1'];
  const input = await gdal!.open(fileOrFiles as File | FileList);
  const result = await gdal!.ogrinfo(input.datasets[0], options);
  await gdal!.close(input as never);
  return result as InfoResult;
};

export default info;
