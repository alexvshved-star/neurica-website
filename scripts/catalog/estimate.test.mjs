import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateLine} from '../../src/catalog/estimate.mjs';
const slab={kind:'slab',pricePending:false,priceSlabCents:91325,priceM2Cents:18000};
test('SM Quartz accepts half slabs, with rounding once at the line total',()=>{
 const sm={...slab,family:'sm-quartz'};
 assert.equal(estimateLine({...sm,priceSlabCents:137000},0.5),68500);
 assert.equal(estimateLine(sm,0.5),45663);
 assert.equal(estimateLine(sm,1.5),136988);
 for(const q of [0.25,0.75,1.1,999.5])assert.throws(()=>estimateLine(sm,q),RangeError);
 assert.throws(()=>estimateLine({...sm,kind:'fragment'},0.5),RangeError);
});
test('uses source slab price in cents without reconstructing from m²',()=>assert.equal(estimateLine(slab,3),273975));
test('never prices unconfirmed items, fragments or sample slabs',()=>{
 for(const patch of [{pricePending:true},{priceSlabCents:null},{kind:'fragment'},{kind:'sample-slab'}]) assert.equal(estimateLine({...slab,...patch},1),null);
});
test('rejects empty, fractional, negative and excessive quantities',()=>{
 for(const q of [NaN,0,-1,.5,1000,Infinity,'2'])assert.throws(()=>estimateLine(slab,q),RangeError);
});
