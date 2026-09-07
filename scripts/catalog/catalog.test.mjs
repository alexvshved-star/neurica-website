import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {REQUIRED_HEADERS,normalizeStock,validateSnapshot,selectProducts,variantKey} from '../../src/catalog/model.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
const makeRow=(name,finish='Silk',width=1550,stock=1)=>[name,'SM Quartz','internal color','internal claim','',''+finish,3200,width,20,91,92,93,94,stock,96,98765,100,98766,496,99];
const headers=Array.from({length:22},(_,i)=>REQUIRED_HEADERS[i]??'');
const record={id:'sm-123456789abc'};
const manifestFor=(r,m=record)=>({[variantKey('sm-quartz',r[0],r[5],r.slice(6,9))]:m});
test('import publishes only retail projection, never raw stock fields',()=>{
 const r=makeRow('Example');const result=normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,r],manifestFor(r),'2026-09-06T12:00:00Z');
 assert.equal(result.products[0].priceM2Cents,10000);assert.equal(result.products[0].priceSlabCents,49600);assert.equal(result.products[0].inStock,true);
 assert.doesNotMatch(JSON.stringify(result),/98765|98766|internal claim|internal color/);
 assert.throws(()=>validateSnapshot({...result,wholesale:1}),/Non-public/);
 assert.throws(()=>validateSnapshot({...result,products:[{...result.products[0],reserve:1}]}),/Non-public/);
});
test('samples are separated and zero stock is unavailable',()=>{
 const r=makeRow('Example','Silk',1550,0);
 const result=normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,r,['ЗРАЗКИ | SM Quartz'],makeRow('Small sample')],manifestFor(r),'2026-09-06T12:00:00Z');
 assert.equal(result.products.length,1);assert.equal(result.products[0].inStock,false);
 assert.equal(selectProducts(snapshot.products).filter(p=>p.kind==='sample-slab').length,0);
 assert.equal(selectProducts(snapshot.products,{samples:'yes'}).filter(p=>p.kind==='sample-slab').length,5);
});
test('unconfirmed price excluded; dimensions and finish distinguish variants',()=>{
 const r=makeRow('Fusion Black');const result=normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,r],manifestFor(r,{...record,pricePending:true}),'2026-09-06T12:00:00Z');
 assert.equal(result.products[0].priceM2Cents,null);assert.equal(result.products[0].priceSlabCents,null);
 assert.notEqual(variantKey('sm-quartz','City Beige','Silk',[3200,1550,20]),variantKey('sm-quartz','City Beige','Polished',[3200,1550,20]));
 const fusion=snapshot.products.find(p=>p.name==='Fusion Black');assert.equal(fusion.priceSlabCents,null);
 assert.equal(snapshot.products.filter(p=>p.name==='Vittoria White').length,2);
});
test('invalid import fails instead of silently overwriting a good snapshot',()=>{
 const r=makeRow('Example');assert.throws(()=>normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,r],{},'2026-09-06T12:00:00Z'),/Unmapped/);
 r[13]='';assert.throws(()=>normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,r],manifestFor(r),'2026-09-06T12:00:00Z'),/Incomplete/);
});
test('filters compose; unknown prices sort last both ways; no results is valid',()=>{
 const r=selectProducts(snapshot.products,{family:'sm-quartz',q:'  CITY beige ',finish:'Silk',stock:'yes'});assert.equal(r.length,1);
 assert.equal(selectProducts(snapshot.products,{q:'no-such-product-xx'}).length,0);
 for(const sort of ['price-asc','price-desc'])assert.equal(selectProducts(snapshot.products,{sort}).at(-1).priceM2Cents,null);
});
test('snapshot valid; photos exist and IDs unique',()=>{
 validateSnapshot(snapshot);
 for(const p of snapshot.products)if(p.photo)assert.ok(fs.existsSync(new URL('../../src/assets/catalog/'+p.photo,import.meta.url)));
});

test('column reorder cannot turn wholesale into public retail',()=>{const r=makeRow('Example');const swapped=[...headers];swapped[16]='Опт, €/м²';assert.throws(()=>normalizeStock([['НАЯВНІСТЬ | SM Quartz'],swapped,r],manifestFor(r),'2026-09-06T12:00:00Z'),/columns changed/);});
