import { gdal } from './init';

const cleanFolder = (folderOrFolders: string | string[]): void => {
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  // Note that for now this is a no-op if using gdal in a web worker
  // @ts-expect-error We need to check if module exists
  if (!gdal!.Module.FS) {
    return;
  }
  const folders = Array.isArray(folderOrFolders)
    ? folderOrFolders
    : [folderOrFolders];
  folders.forEach((folder) => {
    // @ts-expect-error Module actually exists
    const folderContent = (gdal!.Module.FS.readdir(folder) as string[]).filter(
      (f) => f !== '.' && f !== '..',
    );
    folderContent.map((f) => {
      // @ts-expect-error Module actually exists
      gdal!.Module.FS.unlink(`${folder}/${f}`);
    });
  });
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
};

export default cleanFolder;
