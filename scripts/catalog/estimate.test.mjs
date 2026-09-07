import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateLine} from '../../src/catalog/estimate.mjs';
const slab={kind:'slab',pricePending:false,priceSlabCents:91325,priceM2Cents:18000};
test('uses source slab price in cents without reconstructing from m²',()=>assert.equal(estimateLine(slab,3),273975));
test('never prices unconfirmed items, fragments or sample slabs',()=>{
 for(const patch of [{pricePending:true},{priceSlabCents:null},{kind:'fragment'},{kind:'sample-slab'}]) assert.equal(estimateLine({...slab,...patch},1),null);
});
test('rejects empty, fractional, negative and excessive quantities',()=>{
 for(const q of [NaN,0,-1,.5,1000,Infinity,'2'])assert.throws(()=>estimateLine(slab,q),RangeError);
});
