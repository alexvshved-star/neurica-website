import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeColor,colorLabel,stockColor} from '../../src/catalog/color.mjs';
import {normalizeStock,validateSnapshot,selectProducts,REQUIRED_HEADERS,variantKey} from '../../src/catalog/model.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
test('controlled colours normalize source spellings; missing and unsupported values remain pending',()=>{
 assert.equal(normalizeColor('  СІРИЙ '),'grey');assert.equal(normalizeColor('білий'),'white');
 for(const value of ['',null,undefined,12,'internal color','сірий / зелений'])assert.equal(normalizeColor(value),null);
 assert.equal(colorLabel('grey','uk'),'Сірий');assert.equal(colorLabel('grey','en'),'Grey');
 assert.equal(colorLabel(null,'uk'),'Потребує уточнення');assert.equal(colorLabel(null,'en'),'Pending confirmation');
 assert.equal(stockColor('сірий','grey'),null);assert.equal(stockColor('білий','grey'),'white');
});
test('import reads only colour column and retains per-variant review block until source changes or review clears it',()=>{
 const row=['Example','SM Quartz','сірий','','','Polished',3200,1550,20,0,0,0,0,1,0,0,100,0,496];
 const headers=Array.from({length:22},(_,i)=>REQUIRED_HEADERS[i]??'');
 const key=variantKey('sm-quartz',row[0],row[5],row.slice(6,9));
 const manifest={[key]:{id:'sm-123456789abc',colorReview:'grey'}};
 const read=()=>normalizeStock([['НАЯВНІСТЬ | SM Quartz'],headers,row],manifest,snapshot.importedAt).products[0];
 assert.equal(read().color,null);row[2]='білий';assert.equal(read().color,'white');
 row[2]='сірий';delete manifest[key].colorReview;assert.equal(read().color,'grey');
 headers[2]='Кислотостійкість';assert.throws(read,/columns changed/);
});
test('snapshot rejects arbitrary public colour values and missing colour fields',()=>{
 for(const color of ['internal claim',123,undefined,{},['grey'],'__proto__'])assert.throws(()=>validateSnapshot({...snapshot,products:[{...snapshot.products[0],color}]}),/color/);
 validateSnapshot({...snapshot,products:[{...snapshot.products[0],color:null}]});
});
test('colour filter composes with family and availability, pending is explicit, thickness no longer filters',()=>{
 const rows=[{...snapshot.products[0],id:'nat-000000000001',color:'grey',inStock:true},
 {...snapshot.products[0],id:'nat-000000000002',color:null,inStock:true},
 {...snapshot.products[0],id:'nat-000000000003',color:'grey',inStock:false}];
 assert.deepEqual(selectProducts(rows,{color:'grey',stock:'yes',family:'natural'}).map(p=>p.id),['nat-000000000001']);
 assert.deepEqual(selectProducts(rows,{color:'pending'}).map(p=>p.id),['nat-000000000002']);
 assert.equal(selectProducts(rows,{color:'blue'}).length,0);
 assert.equal(selectProducts(rows,{thickness:'999'}).length,3);
});
