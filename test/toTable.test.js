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

  QUnit.test('from ODS file with one sheet', async (assert) => {
    await loadLib();
    const xlsxFile = new File([xlsx_blob_one_sheet_bad_headers], 'test.xlsx', {
      type: xlsx_blob_one_sheet_bad_headers.type,
    });

    const res = await geoimport.toTable(xlsxFile);

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
      361,
      'The returned table has the correct number of entries',
    );
    assert.equal(
      Object.keys(res[0])[0],
      'Local Authority',
      'Header 1 have been detected correctly',
    );
    assert.equal(
      Object.keys(res[0])[1],
      'Area Code',
      'Header 2 have been detected correctly',
    );
  });
});
