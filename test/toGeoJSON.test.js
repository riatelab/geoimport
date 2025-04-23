QUnit.module('toGeoJSON', (hooks) => {
  QUnit.test('from TopoJSON with one layer and no options', async (assert) => {
    await loadLib();
    const topology = JSON.parse(fc1_topojson);
    const res = await geoimport.toGeoJSON(topology);
    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      res.features.length,
      2,
      'Result has the correct number of features',
    );
    assert.equal(
      JSON.stringify(res.features[0].geometry.coordinates),
      `[1,1]`,
      'Feature 1 has the correct coordinates',
    );
    assert.equal(
      JSON.stringify(res.features[1].geometry.coordinates),
      `[5,5]`,
      'Feature 2 has the correct coordinates',
    );
  });

  QUnit.test('from TopoJSON with one layer and options', async (assert) => {
    await loadLib();
    const topology = JSON.parse(fc1_topojson);
    const res = await geoimport.toGeoJSON(topology, {
      layerName: 'layer',
      writeBbox: true,
    });
    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      JSON.stringify(res.bbox),
      JSON.stringify([1, 1, 5, 5]),
      'Result has bbox at FeatureCollection level',
    );
    assert.equal(
      JSON.stringify(res.features[0].bbox),
      JSON.stringify([1, 1, 1, 1]),
      'Result has bbox at Feature level',
    );
  });

  QUnit.test(
    'from GeoPackage with one layer and no options',
    async (assert) => {
      await loadLib();
      const gpkgFile = new File([fc1_geopackage], 'layer.gpkg', {
        type: fc1_geopackage.type,
      });
      const res = await geoimport.toGeoJSON(gpkgFile);
      assert.equal(
        res.type,
        'FeatureCollection',
        'Result is a FeatureCollection',
      );
      assert.equal(
        res.features.length,
        2,
        'Result has the correct number of features',
      );
      assert.equal(
        JSON.stringify(res.features[0].geometry.coordinates),
        `[1,1]`,
        'Feature 1 has the correct coordinates',
      );
      assert.equal(
        JSON.stringify(res.features[1].geometry.coordinates),
        `[5,5]`,
        'Feature 2 has the correct coordinates',
      );
    },
  );

  QUnit.test(
    'from GeoPackage with two layers and a specified layer name',
    async (assert) => {
      await loadLib();
      const gpkgFile = new File([l2_geopackage], 'test.gpkg', {
        type: l2_geopackage.type,
      });
      const res1 = await geoimport.toGeoJSON(gpkgFile, { layerName: 'fc1' });
      assert.equal(
        res1.type,
        'FeatureCollection',
        'Result is a FeatureCollection',
      );

      const res2 = await geoimport.toGeoJSON(gpkgFile, { layerName: 'fc2' });
      assert.equal(
        res2.type,
        'FeatureCollection',
        'Result is a FeatureCollection',
      );
    },
  );

  QUnit.test(
    'from GeoPackage with two layers and no specified layer name',
    async (assert) => {
      await loadLib();
      const gpkgFile = new File([l2_geopackage], 'test.gpkg', {
        type: l2_geopackage.type,
      });
      await assert.rejects(geoimport.toGeoJSON(gpkgFile), 'An error is thrown');
    },
  );

  QUnit.test('from KML', async (assert) => {
    await loadLib();
    const kmlFile = new File([fc1_kml], 'layer.kml', {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const res = await geoimport.toGeoJSON(kmlFile);
    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      res.features.length,
      2,
      'Result has the correct number of features',
    );
    assert.equal(
      JSON.stringify(res.features[0].geometry.coordinates),
      `[1,1]`,
      'Feature 1 has the correct coordinates',
    );
    assert.equal(
      JSON.stringify(res.features[1].geometry.coordinates),
      `[5,5]`,
      'Feature 2 has the correct coordinates',
    );
  });

  QUnit.test('from GPX', async (assert) => {
    await loadLib();
    const gpxFile = new File([fc1_kml], 'layer.gpx', {
      type: 'application/gpx+xml',
    });
    const res = await geoimport.toGeoJSON(gpxFile);
    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      res.features.length,
      2,
      'Result has the correct number of features',
    );
    assert.equal(
      JSON.stringify(res.features[0].geometry.coordinates),
      `[1,1]`,
      'Feature 1 has the correct coordinates',
    );
    assert.equal(
      JSON.stringify(res.features[1].geometry.coordinates),
      `[5,5]`,
      'Feature 2 has the correct coordinates',
    );
  });

  QUnit.test('from GML', async (assert) => {
    await loadLib();
    const gmlFile = new File([fc1_gml], 'layer.gml', {
      type: 'application/gml+xml',
    });
    const res = await geoimport.toGeoJSON(gmlFile);
    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      res.features.length,
      2,
      'Result has the correct number of features',
    );
    assert.equal(
      JSON.stringify(res.features[0].geometry.coordinates),
      `[1,1]`,
      'Feature 1 has the correct coordinates',
    );
    assert.equal(
      JSON.stringify(res.features[1].geometry.coordinates),
      `[5,5]`,
      'Feature 2 has the correct coordinates',
    );
  });

  QUnit.test('from zipped ESRI Shapefile', async (assert) => {
    await loadLib();

    // We first create zipped Shapefile from GeoJSON
    const zippedShapefileBlob = await geoimport.fromGeoJSON(
      fc1,
      'layer',
      'ESRI Shapefile',
    );
    assert.equal(
      zippedShapefileBlob.type,
      'application/zip',
      'Resulting Blob has correct mime type',
    );
    const zippedShapefile = new File([zippedShapefileBlob], 'layer.zip', {
      type: zippedShapefileBlob.type,
    });

    const res = await geoimport.toGeoJSON(zippedShapefile);

    assert.equal(
      res.type,
      'FeatureCollection',
      'Result is a FeatureCollection',
    );
    assert.equal(
      res.features.length,
      2,
      'Result has the correct number of features',
    );
    assert.equal(
      JSON.stringify(res.features[0].geometry.coordinates),
      `[1,1]`,
      'Feature 1 has the correct coordinates',
    );
    assert.equal(
      JSON.stringify(res.features[1].geometry.coordinates),
      `[5,5]`,
      'Feature 2 has the correct coordinates',
    );
  });
});
