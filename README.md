# geoimport

Easily convert your geospatial data to/from GeoJSON for Web-based applications.

## Description

This library is a high-level wrapper around [gdal3.js](https://github.com/bugra9/gdal3.js) to provide a simple
interface for converting geospatial data to and from GeoJSON format.

It is notably used in the [Magrit](https://github.com/riatelab/magrit) Web-application to handle
the import/export of various file formats.

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
- ESRI Shapefile (and zipped Shapefile)
- Geopackage
- GML
- KML
- GPX
- FlatGeobuf

Supported tabular formats include:

- CSV/TSV
- ODS
- XLSX

## Installation and usage

Importing and initializing `geoimport` may vary slightly depending on the context in which
you use the library.

You can install the library using `npm` (or any equivalent package manager):

```bash
npm install geoimport
```

Or you can use it directly in your HTML file by including the following script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/geoimport@latest/dist/geoimport.min.js"></script>
```

Then you can use the library in your JavaScript code:

```js
import { init, fromGeoJSON } from 'geoimport';

init({
  gdalPath: 'https://cdn.jsdelivr.net/npm/geoimport@latest/dist/static/',
});

// A geojson feature collection
const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [1, 1] },
      properties: { foo: 42 },
    },
  ],
};
// Convert to KML, the result is a String
const resultShp = fromGeoJSON(geojson, 'myLayer', 'KML');
```

Or if you imported the library using the script tag, you can use it like this:

```js
geoimport.init();

// A geojson feature collection
const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [1, 1] },
      properties: { foo: 42 },
    },
  ],
};
// Convert to shapefile, the result is a zip archive containing all the layers, as a Blob
const resultShp = geoimport.fromGeoJSON(geojson, 'myLayer', 'ESRI Shapefile');
// Or convert to GeoPackage, using Robinson CRS,
// the result is a the geopackage file, as a Blob
const resultGpkg = geoimport.fromGeoJSON(
  geojson,
  'myLayer',
  'GPKG',
  'ESRI:54030',
);

// Convert back to geojson
const resGeojson = geoimport.toGeoJSON(resultGpkg, { layerName: 'myLayer' });
```

See also this [introduction Notebook on Observable](https://observablehq.com/@mthh/hello-geoimport).

Note that this library depends on [gdal3.js](https://github.com/bugra9/gdal3.js) which is relatively heavy,
so maybe `geoimport` is not a good fit for you. Indeed, if you only need the conversion from/to GeoJSON and:

- GPX/KML, see [mapbox/togeojson](https://github.com/mapbox/togeojson),
- Shapefile with CRS support, see [calvinmetcalf/shapefile-js](https://github.com/calvinmetcalf/shapefile-js),
- GML, see [SKalt/geojson-to-gml-3.2.1](https://github.com/SKalt/geojson-to-gml-3.2.1),
- FlatGeobuf, see [flatgeobuf/flatgeobuf](https://github.com/flatgeobuf/flatgeobuf),
- TopoJSON, see [topojson/topojson-client](https://github.com/topojson/topojson-client/) and [topojson/topojson-server](https://github.com/topojson/topojson-server/),
- GeoPackage, see [ngageoint/geopackage-js](https://github.com/ngageoint/geopackage-js).

However, if you need to convert to/from several of these formats (plus XLSX and ODS), this library is for you!

## Contributing

If you want to contribute to this package, please open an issue or a pull request.
We welcome all contributions, including bug fixes, new features, and documentation improvements.

The package is written in TypeScript and uses the following tools to enforce code quality and a consistent style:

- [Prettier](https://prettier.io/) - Code formatter
- [ESLint](https://eslint.org/) - Linter

Please make sure to run these tools (`npm run format` and `npm run lint`) before submitting a pull request.

Also, note that this project uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
and [semantic versioning](https://semver.org/).

## Testing

Since this library is mostly targeting browser environments, the test suite uses [QUnit](https://qunitjs.com/) and runs in the browser.

Run the tests by running `npm run test`, this will open your default browser and run the tests (and since the tests are executed on the built file,
don't forget to, run `npm run build` after making any change in the code and before running the tests).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Note that this code imports [gdal3.js](https://github.com/bugra9/gdal3.js) so you must comply with the license of [gdal3.js](https://github.com/bugra9/gdal3.js/blob/master/LICENSE)
which is distributed under the [LGPL-2.1 license](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html).
