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
});
