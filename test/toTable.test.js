QUnit.module('toTable', (hooks) => {
  QUnit.test('from ODS file with one sheet', async (assert) => {
    await loadLib();
    const odsFile = new File([ods_blob_one_sheet], 'test.ods', {
      type: ods_blob_one_sheet.type,
    });
    const res = await geoimport.toTable(odsFile);
    assert.equal(Array.isArray(res), true, 'The returned table is an Array');
    assert.equal(
      res.every((a) => typeof a === 'object'),
      true,
      'The returned table is an Array of Objects',
    );
    assert.equal(
      res.every((a) => Object.keys(a).length === 3),
      true,
      'The returned table has the correct number of columns',
    );
    assert.equal(
      res.length,
      3,
      'The returned table has the correct number of entries',
    );
  });
});
