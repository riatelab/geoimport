const table = [
  { id: 1, var1: 'foo', var2: 1212.3 },
  { id: 1, var1: 'bar', var2: 2941.2 },
  { id: 1, var1: 'baz', var2: 3902.5 },
];

QUnit.module('fromTable', (hooks) => {
  QUnit.test('to ODS file', async (assert) => {
    await loadLib();

    const res = await geoimport.fromTable(table, 'ODS');
    assert.equal(res.toString(), '[object File]', 'Result is a File');
    assert.equal(
      res.type,
      'application/vnd.oasis.opendocument.spreadsheet',
      'Resulting File has correct mime type',
    );
    assert.equal(res.size, 2137, 'Resulting File has correct size');
  });

  QUnit.test('to XLSX file', async (assert) => {
    await loadLib();

    const res = await geoimport.fromTable(table, 'XLSX');
    assert.equal(res.toString(), '[object File]', 'Result is a File');
    assert.equal(
      res.type,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Resulting File has correct mime type',
    );
    assert.equal(res.size, 3291, 'Resulting File has correct size');
  });
});
