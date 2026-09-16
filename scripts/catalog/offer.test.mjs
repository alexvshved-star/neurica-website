import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {offerItems} from '../../src/catalog/offer.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
const valid=snapshot.products.find(p=>p.inStock&&p.kind==='slab'&&!p.pricePending&&!p.finishPending&&p.photo&&p.priceSlabCents!==null);
test('PDF offer accepts half an Ardenne Silk slab for EUR 685 including VAT',()=>{
 const p=snapshot.products.find(p=>p.name==='Ardenne Silk');
 const [item]=offerItems(snapshot,[{id:p.id,quantity:0.5}]);
 assert.equal(item.quantity,0.5);assert.equal(item.totalCents,68500);
 assert.throws(()=>offerItems(snapshot,[{id:p.id,quantity:0.25}]));
});
test('offer preserves VAT-inclusive source prices without discounts',()=>{
 const [item]=offerItems(snapshot,[{id:valid.id,quantity:2}]);
 assert.equal(item.totalCents,valid.priceSlabCents*2);
});
test('offer rejects partial, unknown, empty and duplicate selections',()=>{
 for(const selection of [[],[{id:'unknown',quantity:1}],[{id:valid.id,quantity:.5}],[{id:valid.id,quantity:1},{id:valid.id,quantity:1}]])assert.throws(()=>offerItems(snapshot,selection));
 for(const patch of [{vat:'unconfirmed'}])assert.throws(()=>offerItems({...snapshot,...patch},[{id:valid.id,quantity:1}]));
 for(const patch of [{kind:'fragment'},{pricePending:true},{inStock:false},{finishPending:true},{photo:null}])assert.throws(()=>offerItems({...snapshot,products:[{...valid,...patch}]},[{id:valid.id,quantity:1}]));
});
