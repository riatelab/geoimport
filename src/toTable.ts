import { GeoImportError } from './error';
import { gdal } from './init';
import cleanFolder from './cleanFolder';
import type { FeatureCollection } from 'geojson';

/**
 * Options for the `toTable` function.
 */
type ToTableOptions = {
  // The name of the table to extract (mandatory if the dataset contains
  // multiple sheets).
  tableName?: string;
  // Whether the sheet to transform has headers (default to true).
  hasHeaders?: boolean;
};

/**
 * Convert an ODS or an XLSX file to the corresponding JavaScript table
 * (array of objects).
 *
 * This is a wrapper around 'ogr2ogr'.
 *
 * @param {File} file - The file to convert.
 * @param {ToTableOptions} [options={}] - The options (such as the name of the sheet
 * to extract when the file contains multiple sheets).
 * @return {Promise<Record<string, unknown>[]>} - The resulting table as an array of objects.
 * @throws {Error} - If the format is not supported or if there is an error while
 * creating resulting file.
 */
const toTable = async (
  file: File,
  options: ToTableOptions = {},
): Promise<Record<string, unknown>[]> => {
  const openOpts = [];
  if (options.hasHeaders === undefined || options.hasHeaders) {
    openOpts.push('-oo', 'HEADERS=FORCE');
  } else if (!options.hasHeaders) {
    openOpts.push('-oo', 'HEADERS=DISABLE');
  }

  const input = await gdal!.open(file, openOpts);

  const opts = ['-f', 'GeoJSON'];
  if (options.tableName) {
    opts.push(
      '-nln',
      `${options.tableName}`,
      '-sql',
      `SELECT * FROM "${options.tableName}"`,
    );
  }

  let bytes;
  try {
    const output = await gdal!.ogr2ogr(input.datasets[0], opts);
    bytes = await gdal!.getFileBytes(output);
  } catch (e) {
    let message = `Error during the conversion to table.\nError reported by gdal3.js: ${(e as Error).message}`;
    message +=
      'If the input dataset contains multiple layers, please provide the layer name.';
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!obj || !('features' in obj) || obj.features.length < 1) {
    throw new GeoImportError('An error occurred or the table is empty');
  }

  // Extract the rows and columns from the FeatureCollection
  const rows = (obj as FeatureCollection).features.map(
    (f) => f.properties,
  ) as Record<string, unknown>[];
  const columns = Object.keys(rows[0]);

  // Remove lines at the end of the file that only contain empty cells
  // (this happens with some XLSX files)
  let lastDataRowIndex = rows.length - 1;
  while (
    lastDataRowIndex >= 0
    && columns.every((c) => rows[lastDataRowIndex][c] === undefined)
  ) {
    lastDataRowIndex -= 1;
  }

  return rows.slice(0, lastDataRowIndex + 1);
};

export default toTable;
