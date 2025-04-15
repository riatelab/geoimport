QUnit.module('toGeoJSON', (hooks) => {
  QUnit.test('from TopoJSON with one layer and no options', async (assert) => {
    await loadLib();
    const topology = JSON.parse(fc1_topojson);
    const res = await geoimport.toGeoJSON(topology);
    assert.equal(res.type, 'FeatureCollection');
  });

  QUnit.test('from TopoJSON with one layer and options', async (assert) => {
    await loadLib();
    const topology = JSON.parse(fc1_topojson);
    const res = await geoimport.toGeoJSON(topology, {
      layerName: 'layer',
      writeBbox: true,
    });
    assert.equal(res.type, 'FeatureCollection');
    assert.equal(JSON.stringify(res.bbox), JSON.stringify([1, 1, 5, 5]));
    assert.equal(
      JSON.stringify(res.features[0].bbox),
      JSON.stringify([1, 1, 1, 1]),
    );
  });

  QUnit.test('from GeoPackage', async (assert) => {
    await loadLib();
    const gpkgFile = new File([fc1_geopackage], 'layer.gpkg', {
      type: fc1_geopackage.type,
    });
    const res = await geoimport.toGeoJSON(gpkgFile);
    assert.equal(res.type, 'FeatureCollection');
  });

  QUnit.test('from KML', async (assert) => {
    await loadLib();
    const kmlFile = new File([fc1_kml], 'layer.kml', {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const res = await geoimport.toGeoJSON(kmlFile);
    assert.equal(res.type, 'FeatureCollection');
  });
});
