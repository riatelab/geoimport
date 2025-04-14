import { gdal } from './init';

const info = async (
  fileOrFiles: File | FileList,
  params: { opts?: string[], openOpts?: string[] } = { opts: [], openOpts: [] },
): Promise<object> => {
  const openOptions = params.openOpts || [];
  const options = params.opts || [];
  const input = await gdal!.open(fileOrFiles, openOptions);
  const result = await gdal!.ogrinfo(input.datasets[0], options);
  await gdal!.close(input as never);
  return result;
};

export default info;
