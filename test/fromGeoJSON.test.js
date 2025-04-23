QUnit.module('fromGeoJSON', (hooks) => {
  QUnit.test('to TopoJSON', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'TopoJSON');

    assert.equal(typeof res, 'string', 'Result is a string');
    assert.equal(res, fc1_topojson, 'Result is the expected TopoJSON');
  });

  QUnit.test('to KML', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'KML');

    assert.equal(typeof res, 'string', 'Result is a string');
    assert.equal(res, fc1_kml, 'Result is the expected KML');
  });

  QUnit.test('to GML', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'GML');

    assert.equal(typeof res, 'string', 'Result is a string');
    assert.equal(res, fc1_gml, 'Result is the expected GML');
  });

  QUnit.test('to ESRI Shapefile', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'ESRI Shapefile');

    assert.equal(res.toString(), '[object File]', 'Result is a File');
    assert.equal(
      res.type,
      'application/zip',
      'Resulting File has correct mime type',
    );
    assert.equal(res.size, 1142, 'Resulting File has correct size');
  });

  QUnit.test('to GeoPackage', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'GPKG');

    assert.equal(res.toString(), '[object File]', 'Result is a File');
    assert.equal(
      res.type,
      'application/geopackage+sqlite3',
      'Resulting File has correct mime type',
    );
    assert.equal(res.size, 98304, 'Resulting File has correct size');
  });

  QUnit.test('to GPX', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'GPX');
    assert.equal(res, fc1_gpx, 'Result is the expected GPX');
  });

  QUnit.test('to FlatGeobuf', async (assert) => {
    await loadLib();
    const res = await geoimport.fromGeoJSON(fc1, 'layer', 'FlatGeobuf');

    assert.equal(res.toString(), '[object File]', 'Result is a File');
    assert.equal(res.type, '', "Resulting File don't have a mime type");
    assert.equal(res.size, 1344, 'Resulting File has correct size');
  });

  QUnit.test('to unsupported format', async (assert) => {
    await loadLib();
    await assert.rejects(
      geoimport.fromGeoJSON(fc1, 'layer', 'Parquet'),
      'An error is thrown when the format is not supported',
    );
  });
});
