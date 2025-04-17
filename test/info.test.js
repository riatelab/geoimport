QUnit.module('info', (hooks) => {
  QUnit.test('of GeoPackage with one layer', async (assert) => {
    const gpkgFile = new File([fc1_geopackage], 'layer.gpkg', {
      type: fc1_geopackage.type,
    });
    await loadLib();
    const res = await geoimport.info(gpkgFile);

    assert.equal(
      res.driverLongName,
      'GeoPackage',
      'Result has the expected driver name',
    );
    assert.equal(
      res.driverShortName,
      'GPKG',
      'Result has the expected driver short name',
    );
    assert.equal(
      res.layers.length,
      1,
      'Result has the expected number of layers',
    );
    assert.equal(
      res.layers[0].featureCount,
      2,
      'Layer 1 has the expected number of features',
    );
  });

  QUnit.test('of GeoPackage with two layers', async (assert) => {
    const gpkgFile = new File([l2_geopackage], 'test.gpkg', {
      type: l2_geopackage.type,
    });
    await loadLib();
    const res = await geoimport.info(gpkgFile);

    assert.equal(
      res.driverLongName,
      'GeoPackage',
      'Result has the expected driver name',
    );
    assert.equal(
      res.driverShortName,
      'GPKG',
      'Result has the expected driver short name',
    );
    assert.equal(
      res.layers.length,
      2,
      'Result has the expected number of layers',
    );
  });

  QUnit.test('of TopoJSON with one layer', async (assert) => {
    await loadLib();

    const topology = JSON.parse(fc1_topojson);

    const res = await geoimport.info(topology);

    assert.equal(
      res.driverLongName,
      'TopoJSON',
      'Result has the expected driver name',
    );
    assert.equal(
      res.driverShortName,
      'TopoJSON',
      'Result has the expected driver short name',
    );
    assert.equal(
      res.layers.length,
      1,
      'Result has the expected number of layers',
    );
    assert.equal(
      res.layers[0].featureCount,
      2,
      'Layer 1 has the expected number of features',
    );
  });

  QUnit.test('of GeoJSON', async (assert) => {
    await loadLib();
    const res = await geoimport.info(fc1);

    assert.equal(
      res.driverLongName,
      'GeoJSON',
      'Result has the expected driver name',
    );
    assert.equal(
      res.driverShortName,
      'GeoJSON',
      'Result has the expected driver short name',
    );
    assert.equal(
      res.layers.length,
      1,
      'Result has the expected number of layers',
    );
    assert.equal(
      res.layers[0].featureCount,
      2,
      'Layer 1 has the expected number of features',
    );
  });

  QUnit.test('of GPX', async (assert) => {
    await loadLib();
    const gpxFile = new File([fc1_gpx], 'test.gpx', {
      type: 'application/gpx+xml',
    });
    const res = await geoimport.info(gpxFile);

    assert.equal(
      res.driverLongName,
      'GPX',
      'Result has the expected driver name',
    );
    assert.equal(
      res.driverShortName,
      'GPX',
      'Result has the expected driver short name',
    );
    // Ogrinfo counts 5 layers for GPX data,
    // but here, only the "waypoints" layer contains
    // data
    assert.equal(
      res.layers.length,
      5,
      'Result has the expected number of layers',
    );
    assert.equal(
      res.layers.find((d) => d.name === 'waypoints').featureCount,
      2,
      'Layer "waypoints" has the expected number of features',
    );
  });
});
