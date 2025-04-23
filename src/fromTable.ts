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
 * @returns {Promise<File>} - The resulting File.
 * @throws {Error} - If the format is not supported or if there is an error while creating resulting file.
 */
const fromTable = async (
  table: Record<string, unknown>[],
  format: SupportedTabularFormat,
): Promise<File> => {
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
  // Actually convert the CSV to the requested format
  const output = await gdal!.ogr2ogr(input.datasets[0], options);
  const bytes = await gdal!.getFileBytes(output);
  // Close the input file and clean the input and output folders
  await gdal!.close(input as never);
  cleanFolder(['/input', '/output']);
  // Mime type and extension for the output file
  const mimeType =
    format === 'ODS'
      ? 'application/vnd.oasis.opendocument.spreadsheet'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const extension = format === 'ODS' ? 'ods' : 'xlsx';
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], `file.${extension}`, { type: blob.type });
};

export default fromTable;
