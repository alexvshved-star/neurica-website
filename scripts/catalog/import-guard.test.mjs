import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {checkRemovedProducts} from '../../src/catalog/import-guard.mjs';
import {REQUIRED_HEADERS} from '../../src/catalog/model.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../src/catalog/snapshot.json',import.meta.url)));
test('removals require exact approval, including replacement with unchanged product count',()=>{
 const previous={products:[{id:'a'},{id:'b'}]},next={products:[{id:'a'},{id:'c'}]};
 assert.throws(()=>checkRemovedProducts(previous,next),/removals/);
 assert.deepEqual(checkRemovedProducts(previous,next,['b']),['b']);
 for(const ids of [['b','c'],['b','b'],['c'],null])assert.throws(()=>checkRemovedProducts(previous,next,ids));
 assert.deepEqual(checkRemovedProducts(previous,previous),[]);
});
test('CLI rejects a truncated export without touching existing snapshot or temp file; exact approval permits removal',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'altaco-import-'));
 try{
  fs.mkdirSync(path.join(root,'scripts/catalog'),{recursive:true});fs.mkdirSync(path.join(root,'src/catalog'),{recursive:true});
  for(const file of ['scripts/catalog/import-stock.mjs','src/catalog/model.mjs','src/catalog/calendar-date.mjs','src/catalog/color.mjs','src/catalog/import-guard.mjs'])fs.copyFileSync(new URL('../../'+file,import.meta.url),path.join(root,file));
  const p=snapshot.products.find(p=>p.family==='sm-quartz');const id=p.id;
  fs.writeFileSync(path.join(root,'src/catalog/manifest.json'),JSON.stringify({['sm-quartz|Example|Silk|3200,1550,20']:{id}}));
  const target=path.join(root,'src/catalog/snapshot.json');const original=JSON.stringify(snapshot);fs.writeFileSync(target,original);
  const row=Array(22).fill('');row[0]='Example';row[5]='Silk';row[6]=3200;row[7]=1550;row[8]=20;row[13]=1;row[16]=100;row[18]=496;
  const input=path.join(root,'source.json');fs.writeFileSync(input,JSON.stringify({values:[['НАЯВНІСТЬ | SM Quartz'],Array.from({length:22},(_,i)=>REQUIRED_HEADERS[i]??''),row]}));
  const args=[path.join(root,'scripts/catalog/import-stock.mjs'),input,snapshot.importedAt];
  const failed=spawnSync(process.execPath,args,{encoding:'utf8'});assert.notEqual(failed.status,0);assert.match(failed.stderr,/removals/);assert.equal(fs.readFileSync(target,'utf8'),original);assert.equal(fs.existsSync(target+'.tmp'),false);
  const approval=path.join(root,'approved.json');fs.writeFileSync(approval,JSON.stringify(snapshot.products.filter(p=>p.id!==id).map(p=>p.id)));
  const ok=spawnSync(process.execPath,[...args,'--removed-ids='+approval],{encoding:'utf8'});assert.equal(ok.status,0,ok.stderr);assert.equal(JSON.parse(fs.readFileSync(target)).products.length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
