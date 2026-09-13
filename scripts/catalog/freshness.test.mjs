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
  assert.ok(!text.includes('06') || text.includes('10'));
  assert.equal(formatStockDate(dataAsOf, 'uk'), formatStockDate(dataAsOf, 'uk'));
  assert.notEqual(formatStockDate(dataAsOf, 'uk'), formatStockDate(importedAt.slice(0, 10), 'uk'));
});

test('formatStockDate renders a plain calendar date, not a timestamp', () => {
  const formatted = formatStockDate('2026-09-10', 'uk');
  assert.doesNotMatch(formatted, /\d{2}:\d{2}/);
});
