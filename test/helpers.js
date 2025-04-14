const loadLib = async () => {
  await geoimport.initGeoImport({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/' });
};

const fc1 = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        prop: 'foo',
      },
      geometry: {
        type: 'Point',
        coordinates: [1., 1.],
      }
    },
    {
      type: 'Feature',
      properties: {
        prop: 'bar',
      },
      geometry: {
        type: 'Point',
        coordinates: [5., 5.],
      }
    },
  ],
};

const fc1_topojson = '{"type":"Topology","objects":{"layer":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1],"properties":{"prop":"foo"}},{"type":"Point","coordinates":[5,5],"properties":{"prop":"bar"}}]}},"arcs":[],"bbox":[1,1,5,5]}';
const fc1_kml = `<?xml version="1.0" encoding="utf-8" ?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document id="root_doc">
<Schema name="layer" id="layer">
\t<SimpleField name="prop" type="string"></SimpleField>
</Schema>
<Folder><name>layer</name>
  <Placemark>
\t<ExtendedData><SchemaData schemaUrl="#layer">
\t\t<SimpleData name="prop">foo</SimpleData>
\t</SchemaData></ExtendedData>
      <Point><coordinates>1,1</coordinates></Point>
  </Placemark>
  <Placemark>
\t<ExtendedData><SchemaData schemaUrl="#layer">
\t\t<SimpleData name="prop">bar</SimpleData>
\t</SchemaData></ExtendedData>
      <Point><coordinates>5,5</coordinates></Point>
  </Placemark>
</Folder>
</Document></kml>
`;
const fc1_gml = `<?xml version="1.0" encoding="utf-8" ?>
<ogr:FeatureCollection
     gml:id="aFeatureCollection"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://ogr.maptools.org/ layer.xsd"
     xmlns:ogr="http://ogr.maptools.org/"
     xmlns:gml="http://www.opengis.net/gml/3.2">
  <gml:boundedBy><gml:Envelope srsName="urn:ogc:def:crs:EPSG::4326"><gml:lowerCorner>1 1</gml:lowerCorner><gml:upperCorner>5 5</gml:upperCorner></gml:Envelope></gml:boundedBy>
                                                                                                                                                                              
  <ogr:featureMember>
    <ogr:layer gml:id="layer.0">
      <gml:boundedBy><gml:Envelope srsName="urn:ogc:def:crs:EPSG::4326"><gml:lowerCorner>1 1</gml:lowerCorner><gml:upperCorner>1 1</gml:upperCorner></gml:Envelope></gml:boundedBy>
      <ogr:geometryProperty><gml:Point srsName="urn:ogc:def:crs:EPSG::4326" gml:id="layer.geom.0"><gml:pos>1 1</gml:pos></gml:Point></ogr:geometryProperty>
      <ogr:prop>foo</ogr:prop>
    </ogr:layer>
  </ogr:featureMember>
  <ogr:featureMember>
    <ogr:layer gml:id="layer.1">
      <gml:boundedBy><gml:Envelope srsName="urn:ogc:def:crs:EPSG::4326"><gml:lowerCorner>5 5</gml:lowerCorner><gml:upperCorner>5 5</gml:upperCorner></gml:Envelope></gml:boundedBy>
      <ogr:geometryProperty><gml:Point srsName="urn:ogc:def:crs:EPSG::4326" gml:id="layer.geom.1"><gml:pos>5 5</gml:pos></gml:Point></ogr:geometryProperty>
      <ogr:prop>bar</ogr:prop>
    </ogr:layer>
  </ogr:featureMember>
</ogr:FeatureCollection>
`;