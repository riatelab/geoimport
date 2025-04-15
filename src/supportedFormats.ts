export type SupportedVectorFormat =
  | 'TopoJSON'
  | 'ESRI Shapefile'
  | 'KML'
  | 'GML'
  | 'GPKG'
  | 'Parquet'
  | 'FlatGeobuf';

export type SupportedTabularFormat = 'ODS' | 'XLSX' | 'Parquet';

export const supportedVectorFormats = [
  'TopoJSON',
  'ESRI Shapefile',
  'KML',
  'GML',
  'GPKG',
  'GeoParquet',
  'FlatGeobuf',
];

export const supportedTabularFormats = ['ODS', 'XLSX', 'Parquet'];
