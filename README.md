# geoimport

Easily convert your geospatial data to/from GeoJSON for Web-based applications.

## Description

This library is a high-level wrapper around gdal3.js, ...

## Installation

## Overview

This library provides a simple interface to convert geospatial data to and from GeoJSON format. It is built on top of gdal3.js, which is a WASM port of the GDAL library.

It exposes the following functions:

- `toGeoJSON`: Converts a supported vector dataset to GeoJSON format.
- `fromGeoJSON`: Converts a GeoJSON object to one of the supported vector dataset format.
- `fromTable`: Converts a table (array of objects) to a supported tabular dataset format.
- `toTable`: Converts a supported tabular dataset to a table (array of objects).
- `info`: Returns information about a vector or a tabular dataset, including the number of layers, layer names, geometry type, column names and the coordinate system.

Supported geospatial formats include:

- GeoJSON
- TopoJSON
- ESRI Shapefile
- Geopackage
- GML
- KML
- GPX
- Geoparquet
- FlatGeobuf

Supported tabular formats include:

- CSV/TSV
- ODS
- XLSX
- Parquet

## Usage

```
import * as geoimport from 'geoimport';

geoimport.init();
```

## Contributing

If you want to contribute to this package, please open an issue or a pull request.
We welcome all contributions, including bug fixes, new features, and documentation improvements.

The package is written in TypeScript and uses the following tools to enforce code quality and a consistent style:

- [ESLint](https://eslint.org/) - Linter
- [Prettier](https://prettier.io/) - Code formatter

Please make sure to run these tools (`npm run lint` and `npm run format`) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Note that when using this code from JsDelivr or any other CDN, you must comply with the license of [gdal3.js](https://github.com/bugra9/gdal3.js)
which is distributed under the [LGPL-2.1 license](https://github.com/bugra9/gdal3.js/blob/master/LICENSE).
