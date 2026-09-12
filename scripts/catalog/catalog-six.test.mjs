import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectProducts,normalizeStock,variantKey,REQUIRED_HEADERS} from '../../src/catalog/model.mjs';
import {priceListProducts} from '../../src/catalog/pricelist.mjs';
import {offerItems} from '../../src/catalog/offer.mjs';
import {readCart,writeCart} from '../../src/catalog/cart.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
const ids=['nat-f60f5c377fd1','nat-bac1e05befe6','nat-a4278321ec2f','nat-1c42339ede1d','nat-a2050e0b17c7'];
test('five former sample slabs are ordinary natural products in catalogue, cart, offer and price list',()=>{
 const natural=selectProducts(snapshot.products,{family:'natural'});
 const list=priceListProducts(snapshot,'natural');
 const prices=[132030,89735,97888,91853,105069];
 for(const [i,id] of ids.entries()){
  const p=snapshot.products.find(p=>p.id===id);
  assert.equal(p.kind,'slab');assert.equal(p.family,'natural');assert.equal(p.priceSlabCents,prices[i]);
  assert.ok(natural.some(p=>p.id===id));assert.ok(list.some(p=>p.id===id));
  assert.deepEqual(readCart(writeCart([{id,quantity:1}]),snapshot.products),[{id,quantity:1}]);
  assert.equal(offerItems(snapshot,[{id,quantity:1}])[0].totalCents,prices[i]);
  assert.throws(()=>offerItems(snapshot,[{id,quantity:0.5}]));
 }
 assert.equal(snapshot.products.filter(p=>p.kind==='sample-slab').length,0);
});
test('reimport of source sample-slab section preserves IDs and ordinary sale eligibility',()=>{
 const headers=Array.from({length:22},(_,i)=>REQUIRED_HEADERS[i]??'');
 const row=['Travertine','Travertine','','','','Polished',3200,1500,20,0,0,0,0,1,0,0,230,0,1104];
 const manifest={[variantKey('sample-slab',row[0],row[5],row.slice(6,9))]:{id:ids[0]}};
 const result=normalizeStock([['ЗРАЗКИ | СЛЕБИ'],headers,row],manifest,'2026-09-12T12:00:00Z');
 assert.equal(result.products[0].id,ids[0]);assert.equal(result.products[0].kind,'slab');
 assert.equal(result.products[0].family,'natural');assert.equal(result.products[0].priceSlabCents,110400);
});
test('six controls use family behind manufacturer label, without collection, sort or samples controls',()=>{
 const source=fs.readFileSync(new URL('../../src/components/catalog/Catalog.astro',import.meta.url),'utf8');
 const form=source.split('<form')[1].split('</form>')[0];
 assert.deepEqual([...form.matchAll(/name="([^"]+)"/g)].map(m=>m[1]),['q','family','type','finish','thickness','stock']);
 assert.match(form,/l.collection/);assert.match(form,/НАТУРАЛЬНІ МАТЕРІАЛИ/);assert.match(form,/SANTAMARGHERITA/);
 const result=selectProducts(snapshot.products);let unavailable=false;
 for(const p of result){if(!p.inStock)unavailable=true;else assert.equal(unavailable,false);}
});
