import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeStock,REQUIRED_HEADERS} from '../../src/catalog/model.mjs';
import {offerItems} from '../../src/catalog/offer.mjs';
import {priceListProducts} from '../../src/catalog/pricelist.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../../src/catalog/'+name,import.meta.url)));
for (const [id,name] of [['nat-43fffeeacf56','Azul Aran Satin'],['nat-d3042ab60764','Azul Aran Polished'],['nat-120e46dfe4a5','Azul Aran NEW']]) {
test(`${name} preserves ID and name through reimport, offer and price list`,()=>{
 const snapshot=read('snapshot.json'),manifest=read('manifest.json');
 const p=snapshot.products.find(p=>p.id===id);
 assert.equal(p.name,name);
 const row=Array(22).fill('');
 Object.assign(row,{0:p.name,1:'Kitchen Selection',2:p.color,5:p.finish,6:p.lengthMm,7:p.widthMm,8:p.thicknessMm,13:1,16:p.priceM2Cents/100,18:p.priceSlabCents/100});
 const next=normalizeStock([['НАЯВНІСТЬ | Natural'],Array.from({length:22},(_,i)=>REQUIRED_HEADERS[i]??''),row],manifest,snapshot.importedAt);
 assert.deepEqual(next.products[0],p);
 assert.equal(offerItems(snapshot,[{id:p.id,quantity:1}])[0].product.name,p.name);
 assert.equal(priceListProducts(snapshot,'natural').find(x=>x.id===p.id).name,p.name);
 assert.equal(snapshot.products.filter(p=>p.name.startsWith('Azul Aran')).length,3);
});
}
