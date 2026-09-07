import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {priceListProducts,priceListSections,SM_GROUPS} from '../../src/catalog/pricelist.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
test('price lists include every available family variant once and exclude samples',()=>{
 for(const family of ['natural','sm-quartz']){
  const result=priceListProducts(snapshot,family);
  const expected=snapshot.products.filter(p=>p.family===family&&p.inStock&&p.kind!=='sample-slab');
  assert.deepEqual(new Set(result.map(p=>p.id)),new Set(expected.map(p=>p.id)));
  assert.equal(result.length,new Set(result.map(p=>p.id)).size);
  assert.equal(priceListSections(snapshot,family).flatMap(s=>s.products).length,result.length);
  for(const p of result)assert.strictEqual(p,snapshot.products.find(item=>item.id===p.id));
 }
});
test('pending prices and finishes remain visible, with no values inferred from reference prices',()=>{
 const products=priceListProducts(snapshot,'sm-quartz');
 const fusion=products.find(p=>p.name.toLowerCase().includes('fusion black'));
 assert.equal(fusion.priceSlabCents,null);assert.equal(fusion.pricePending,true);
 assert.ok(products.some(p=>p.finishPending));
 assert.equal(SM_GROUPS.T5P3,4);assert.equal(SM_GROUPS.T560,'archive');
});
test('invalid family and unconfirmed VAT fail closed',()=>{
 assert.throws(()=>priceListProducts(snapshot,'all'));
 assert.throws(()=>priceListProducts({...snapshot,vat:'unconfirmed'},'natural'));
});
