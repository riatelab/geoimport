import toGeoJSON from './toGeoJSON';
import cleanFolder from './cleanFolder';

/**
 * Options for the `toTable` function.
 */
type ToTableOptions = {
  // The name of the table to extract (mandatory if the dataset contains
  // multiple sheets).
  tableName?: string;
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
  const opts = options.tableName ? { layerName: options.tableName } : {};
  const layer = await toGeoJSON(file, opts);

  cleanFolder(['/input', '/output']);

  if (!layer || !('features' in layer) || layer.features.length < 1) {
    throw new Error('An error occurred or the table is empty');
  }

  const columnsBefore = Object.keys(layer.features[0].properties!);
  const columnsAfter = columnsBefore.slice();

  // We want to take care of the case where the column names are not correctly
  // identified and became Field1, Field2, etc.
  // In such cases, we need to take the first data row as the header row.
  if (
    JSON.stringify(columnsAfter)
    === JSON.stringify(
      Array.from({ length: columnsAfter.length }).map(
        (d, i) => `Field${i + 1}`,
      ),
    )
  ) {
    const firstRow = layer.features[0].properties;
    for (let i = 0; i < columnsBefore.length; i += 1) {
      // @ts-expect-error abc
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      columnsAfter[i] = firstRow[columnsBefore[i]];
    }

    // We remove the first row from the data
    layer.features.shift();

    // We update the properties of the features
    layer.features.forEach((f) => {
      const properties = {};
      for (let i = 0; i < columnsBefore.length; i += 1) {
        // @ts-expect-error abc
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        properties[columnsAfter[i]] = f.properties[columnsBefore[i]];
      }
      f.properties = properties;
    });
  }

  const rows = layer.features.map((f) => f.properties);

  // Remove lines at the end of the file that only contain empty cells
  let lastDataRowIndex = rows.length - 1;
  while (
    lastDataRowIndex >= 0
    // @ts-expect-error abc
    && columnsAfter.every((c) => rows[lastDataRowIndex][c] === undefined)
  ) {
    lastDataRowIndex -= 1;
  }

  // Return the cleaned dataset
  return rows.slice(0, lastDataRowIndex + 1) as Record<string, unknown>[];
};

export default toTable;
