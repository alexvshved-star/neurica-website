// Local visual QA; uses the exact renderer and assets shipped to the browser.
import fs from 'node:fs';
import sharp from 'sharp';
import {createOffer} from '../../src/catalog/offer.mjs';
const root=new URL('../../',import.meta.url);
const snapshot=JSON.parse(fs.readFileSync(new URL('src/catalog/snapshot.json',root)));
const assets=JSON.parse(fs.readFileSync(new URL('src/assets/pdf/offer-assets.json',root)));
const available=snapshot.products.filter(p=>p.inStock&&p.kind==='slab'&&!p.pricePending&&!p.finishPending&&p.photo&&p.priceSlabCents!==null);
const mystic=available.find(p=>p.name.toLowerCase().includes('mystic'))??available[0];
const second=available.filter(p=>p.id!==mystic.id).sort((a,b)=>b.name.length-a.name.length)[0];
const photos={};
for(const p of [mystic,second])photos[p.id]='data:image/jpeg;base64,'+(await sharp(new URL(`src/assets/catalog/${p.photo}`,root).pathname).resize(1400,640,{fit:'cover'}).jpeg({quality:90}).toBuffer()).toString('base64');
for(const [name,selection,locale] of [
 ['single',[{id:mystic.id,quantity:1}],'uk'],
 ['multiple',[{id:mystic.id,quantity:2},{id:second.id,quantity:3}],'uk'],
 ['english',[{id:second.id,quantity:999}],'en']
]){
 const pdf=createOffer(snapshot,selection,{...assets,photos},locale,new Date('2026-09-07T12:00:00Z'));
 fs.writeFileSync(`/tmp/altaco-offer-${name}.pdf`,Buffer.from(pdf.output('arraybuffer')));
 console.log(name,pdf.getNumberOfPages(),'pages');
}
