import test from 'node:test';
import assert from 'node:assert/strict';
import {readCart,writeCart} from '../../src/catalog/cart.mjs';
const products=[{id:'a',kind:'slab'},{id:'b',kind:'fragment'},{id:'c',kind:'sample-slab'}];
test('cart round trip persists IDs and quantities, not stale prices or personal data',()=>{
 const encoded=writeCart([{id:'a',quantity:2,price:1,customer:'secret'}]);
 assert.deepEqual(JSON.parse(encoded),{version:1,items:[{id:'a',quantity:2}]});
 assert.deepEqual(readCart(encoded,products),[{id:'a',quantity:2}]);
});
test('corrupt, unsupported and empty storage is safe',()=>{
 for(const data of [null,'','{','null','[]','{"version":2,"items":[]}','{"version":1,"items":{}}'])
  assert.deepEqual(readCart(data,products),[]);
});
test('cart removes unknown products, samples, duplicates and invalid quantities',()=>{
 const items=[{id:'a',quantity:3},{id:'a',quantity:4},{id:'missing',quantity:1},{id:'c',quantity:1},{id:'b',quantity:7},null];
 assert.deepEqual(readCart(JSON.stringify({version:1,items}),products),[{id:'a',quantity:3},{id:'b',quantity:1}]);
 for(const quantity of [-1,0,1.5,1000,'2',null]){
  assert.deepEqual(readCart(JSON.stringify({version:1,items:[{id:'a',quantity}]}),products),[]);
 }
});
test('removed catalogue IDs disappear; retained IDs use current catalogue details',()=>{
 assert.deepEqual(readCart(writeCart([{id:'a',quantity:999}]),[]),[]);
 assert.deepEqual(readCart(writeCart([{id:'a',quantity:999}]),[{id:'a',kind:'slab',price:990}]),[{id:'a',quantity:999}]);
});
