import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cardTitle} from '../../src/catalog/card-title.mjs';

test('tile titles omit supplementary descriptions without changing product data', () => {
  for (const [name, expected] of [
    ['Duetto \\ кусок', 'Duetto'],
    ['Carbon Grey \\ кусок', 'Carbon Grey'],
    ['TRAVERTINO GRIGIO VC ПОЛІРОВАНИЙ ТА ЗАПОВНЕНИЙ ПОЛІМЕРОМ', 'TRAVERTINO GRIGIO VC'],
    ['City Beige Silk', 'City Beige Silk'],
    ['TRAVERTINO ROMANO CLASSICO CC', 'TRAVERTINO ROMANO CLASSICO CC'],
    ['Mystic Grey 2025/2', 'Mystic Grey 2025/2'],
  ]) {
    const product = Object.freeze({name});
    assert.equal(cardTitle(product), expected);
    assert.equal(product.name, name);
  }
});

test('only the three intended catalogue names change', () => {
  const {products} = JSON.parse(readFileSync(new URL('../../src/catalog/snapshot.json', import.meta.url)));
  assert.equal(products.filter(p => cardTitle(p) !== p.name).length, 3);
  assert.ok(products.every(p => cardTitle(p).length > 0));
});
