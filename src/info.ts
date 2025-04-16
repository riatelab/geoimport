import { gdal } from './init';
import { Topology } from 'topojson-specification';
import { FeatureCollection } from 'geojson';

const info = async (
  fileOrFiles: Topology | FeatureCollection | File | FileList | File[],
): Promise<object> => {
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
  return result;
};

export default info;
