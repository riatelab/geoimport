import { Parser } from '@json2csv/plainjs';
import cleanFolder from './cleanFolder';
import { gdal } from './init';
import {
  type SupportedTabularFormat,
  supportedTabularFormats,
} from './supportedFormats';

/**
 * Convert a table (described by an array of objects) to a binary tabular file
 * (ODS or XLSX).
 *
 * This is a wrapper around 'ogr2ogr'.
 *
 * @param {Record<string, unknown>[]} table - The data to convert.
 * @param {SupportedTabularFormat} format - The format to convert to.
 * @returns {Promise<Blob>} - The resulting file, as a Blob.
 * @throws {Error} - If the format is not supported or if there is an error while creating resulting file.
 */
const fromTable = async (
  table: Record<string, unknown>[],
  format: SupportedTabularFormat,
): Promise<Blob> => {
  // Check the various parameters
  if (!supportedTabularFormats.includes(format)) {
    throw new Error(`Unsupported format! ${format}`);
  }

  const parser = new Parser();
  const csv = parser.parse(table);
  const csvFile = new File([csv], 'file.csv', { type: 'text/csv' });
  // Open the CSV file
  const input = await gdal!.open(csvFile);
  // Options for ogr2ogr
  const options = ['-f', format];
  const output = await gdal!.ogr2ogr(input.datasets[0], options);
  const bytes = await gdal!.getFileBytes(output);
  await gdal!.close(input as never);
  // Mime type given the input format
  const mimeType =
    format === 'ODS'
      ? 'application/vnd.oasis.opendocument.spreadsheet'
      : format === 'XLSX'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : '';
  cleanFolder(['/input', '/output']);
  return new Blob([bytes], { type: mimeType });
};

export default fromTable;
