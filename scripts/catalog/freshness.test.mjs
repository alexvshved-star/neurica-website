import test from 'node:test';
import assert from 'node:assert/strict';
import {stockAsOfText,formatStockDate} from '../../src/catalog/freshness.mjs';

test('confirmed dataAsOf shows the date and no unconfirmed wording, in both locales', () => {
  const uk = stockAsOfText('2026-09-10', 'uk');
  const en = stockAsOfText('2026-09-10', 'en');
  assert.match(uk, /^Залишки станом на /);
  assert.match(en, /^Stock as of /);
  assert.doesNotMatch(uk, /не підтверджена/);
  assert.doesNotMatch(en, /has not been confirmed/);
});

test('null dataAsOf shows the unconfirmed text and no date, in both locales', () => {
  assert.equal(stockAsOfText(null, 'uk'), 'Дата актуальності залишків не підтверджена');
  assert.equal(stockAsOfText(null, 'en'), 'Stock freshness date has not been confirmed');
});

test('the two states are mutually exclusive and never combined', () => {
  for (const locale of ['uk', 'en']) {
    const confirmed = stockAsOfText('2026-09-10', locale);
    const unknown = stockAsOfText(null, locale);
    assert.notEqual(confirmed, unknown);
    assert.ok(!confirmed.includes(unknown) && !unknown.includes(confirmed));
  }
});

test('dataAsOf formatting never substitutes importedAt or today’s date', () => {
  const importedAt = '2026-09-06T18:29:49Z';
  const dataAsOf = '2026-09-10';
  const text = stockAsOfText(dataAsOf, 'uk');
  assert.equal(text, 'Залишки станом на 10 вересня 2026 р.');
  assert.notEqual(formatStockDate(dataAsOf, 'uk'), formatStockDate(importedAt.slice(0, 10), 'uk'));
});

test('formatStockDate renders a plain calendar date, not a timestamp', () => {
  const formatted = formatStockDate('2026-09-10', 'uk');
  assert.doesNotMatch(formatted, /\d{2}:\d{2}/);
});

 test('import validator and display reject impossible calendar dates and accept leap days', async () => {
  const {validateSnapshot} = await import('../../src/catalog/model.mjs');
  const {readFileSync} = await import('node:fs');
  const snapshot=JSON.parse(readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
  for(const date of ['2026-02-31','2026-99-99','2026-02-29','2026-04-31','',undefined,123]) {
    assert.throws(()=>validateSnapshot({...snapshot,dataAsOf:date}),/source date/);
    assert.throws(()=>stockAsOfText(date,'uk'),/source date/);
  }
  for(const date of ['2024-02-29','2026-02-28','2026-12-31']) {
    validateSnapshot({...snapshot,dataAsOf:date});
    assert.match(stockAsOfText(date,'en'),/^Stock as of /);
  }
});
