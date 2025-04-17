export type SupportedVectorFormat =
  | 'TopoJSON'
  | 'ESRI Shapefile'
  | 'KML'
  | 'GML'
  | 'GPKG'
  | 'GPX'
  | 'FlatGeobuf';

export type SupportedTabularFormat = 'ODS' | 'XLSX';

export const supportedVectorFormats = [
  'TopoJSON',
  'ESRI Shapefile',
  'KML',
  'GML',
  'GPKG',
  'GPX',
  'FlatGeobuf',
];

export const supportedTabularFormats = ['ODS', 'XLSX'];
