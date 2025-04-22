import initGdalJs from 'gdal3.js';

export let gdal: Gdal | null = null;

/**
 * Options for the `init` function.
 */
type InitGdalJsOptions = {
  // The path to the directory containing Gdal3.js files
  gdalPath?: string;
  // Whether to run gdal in a web worker
  useWorker?: boolean;
};

/**
 * This is a wrapper around initGdalJs function
 */
const init = async (options: InitGdalJsOptions = {}): Promise<void> => {
  if (!gdal) {
    const path = options.gdalPath || 'static';
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

export default init;
