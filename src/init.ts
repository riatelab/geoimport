import initGdalJs from 'gdal3.js';
import { GdalError } from './error';

export let gdal: Gdal | null = null;

/**
 * Options for the `init` function.
 */
type InitGdalJsOptions = {
  // The path to the directory containing Gdal3.js files
  path?: string;
  // Paths to use if filenames differ from gdal3WebAssembly.(data|wasm) and gdal3.js.
  paths?: {
    // Wasm file path
    wasm?: string;
    // Data file path
    data?: string;
    // Gdal3.js file path
    js?: string;
  };
  // Whether to run gdal in a web worker
  useWorker?: boolean;
};

/**
 * This is a wrapper around initGdalJs function
 */
const init = async (
  options: InitGdalJsOptions = {},
  forceReinitialisation: boolean = false,
): Promise<void> => {
  if (!gdal || forceReinitialisation) {
    // const path = options.path || 'static';
    const useWorker = (options.path || '').includes('cdn')
      ? false
      : typeof options.useWorker === 'boolean'
        ? options.useWorker
        : true;
    options.useWorker = useWorker;
    // @ts-expect-error errorHandler is a valid initGdalJs option
    options.errorHandler = (message: string, type: string) => {
      if (type === 'stderr') {
        throw new GdalError(message);
      }
    };
    gdal = await initGdalJs(options as never);
  }
  // else {
  //     Gdal is already initialized
  // }
};

export default init;
