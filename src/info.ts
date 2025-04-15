import { gdal } from './init';
import { Topology } from 'topojson-specification';
import { FeatureCollection } from 'geojson';

const info = async (
  fileOrFiles: Topology | FeatureCollection | File | File[],
): Promise<object> => {
  if (
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    fileOrFiles.toString() !== '[object File]'
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    && fileOrFiles.toString() !== '[object FileList]'
    && 'type' in fileOrFiles
  ) {
    // The input may be a TopoJSON Topology or a GeoJSON FeatureCollection
    if (
      fileOrFiles.type === 'Topology'
      || fileOrFiles.type === 'FeatureCollection'
    ) {
      fileOrFiles = new File([JSON.stringify(fileOrFiles)], 'file.topojson', {
        type: 'application/json',
      });
    } else {
      throw new Error('Unexpected input dataset');
    }
  } else if (
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    fileOrFiles.toString() !== '[object File]'
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    && fileOrFiles.toString() !== '[object FileList]'
    && !Array.isArray(fileOrFiles)
  ) {
    throw new Error('Unexpected input dataset');
  }
  const options = ['-wkt_format', 'WKT1'];
  const input = await gdal!.open(fileOrFiles as File | FileList);
  const result = await gdal!.ogrinfo(input.datasets[0], options);
  await gdal!.close(input as never);
  return result;
};

export default info;
