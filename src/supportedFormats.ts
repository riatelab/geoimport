export type SupportedVectorFormat =
  | 'TopoJSON'
  | 'ESRI Shapefile'
  | 'KML'
  | 'GML'
  | 'GPKG'
  | 'FlatGeobuf';

export type SupportedTabularFormat = 'ODS' | 'XLSX';

export const supportedVectorFormats = [
  'TopoJSON',
  'ESRI Shapefile',
  'KML',
  'GML',
  'GPKG',
  'FlatGeobuf',
];

export const supportedTabularFormats = ['ODS', 'XLSX'];
