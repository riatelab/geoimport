# Changelog

## 0.6.0 (2025-05-05)

- Improve conversion of XLSX/ODS files to table (by allowing to choose if the first row should be used as header or not).

## 0.5.0 (2025-04-30)

- Handle and report errors more gracefully.

## 0.4.0 (2025-04-29)

- Fix the attempt to clean the input/output folders when Gdal is run in a web worker.

## 0.3.0 (2025-04-29)

- Modify `exports` and `files` in `package.json` in an attempt to ease import and initialization
  of the library in various environments.

## 0.2.0 (2025-04-29)

- Change how `geoimport` is initialized to use `init()` function
  (in an attempt to facilitate import both from a CDN, a bundler like Vite, etc.).

## 0.1.0 (2025-04-23)

- Initial release.
