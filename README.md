# geoimport

Easily convert your geospatial data to/from GeoJSON for Web-based applications.

## Description

This library is a high-level wrapper around [gdal3.js](https://github.com/bugra9/gdal3.js) to provide a simple
interface for converting geospatial data to and from GeoJSON format.

## Installation

## Overview

This library provides a simple interface to convert geospatial data to and from GeoJSON format.
It is built on top of gdal3.js, which is a WASM port of the GDAL library.

It exposes the following functions:

- `toGeoJSON`: Converts a supported vector dataset to a GeoJSON FeatureCollection object.
- `fromGeoJSON`: Converts a GeoJSON FeatureCollection object to one of the supported vector dataset format.

- `toTable`: Converts a supported tabular dataset to a table (array of objects).
- `fromTable`: Converts a table (array of objects) to a supported tabular dataset format.

- `info`: Returns information about a vector or a tabular dataset, including the number of layers,
  layer names, geometry type, column names and the coordinate reference system.

Supported geospatial formats include:

- GeoJSON
- TopoJSON
- ESRI Shapefile
- Geopackage
- GML
- KML
- GPX
- FlatGeobuf

Supported tabular formats include:

- CSV/TSV
- ODS
- XLSX

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

## Testing

Since this library is mostly targeting browser environments, the test suite uses [QUnit](https://qunitjs.com/) and runs in the browser.

Run the tests by running `npm run test`, this will open your default browser and run the tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Note that when using this code from _JsDelivr_ or any other CDN, you must comply with the license of [gdal3.js](https://github.com/bugra9/gdal3.js)
which is distributed under the [LGPL-2.1 license](https://github.com/bugra9/gdal3.js/blob/master/LICENSE).
