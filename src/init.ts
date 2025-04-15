import initGdalJs from 'gdal3.js';

export let gdal: Gdal | null = null;

type InitGdalJsOptions = {
  path?: string;
  useWorker?: boolean;
};

/**
 * This is a wrapper around initGdalJs function
 */
const initGeoImport = async (
  options: InitGdalJsOptions = {},
): Promise<void> => {
  if (!gdal) {
    const path = options.path || 'static';
    const useWorker = path.includes('cdn')
      ? false
      : typeof options.useWorker === 'boolean'
        ? options.useWorker
        : true;
    gdal = await initGdalJs({
      path,
      useWorker,
    });
  } else {
    // Gdal is already initialized
  }
};

export default initGeoImport;
