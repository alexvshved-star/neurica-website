import fs from 'node:fs';
import sharp from 'sharp';
import {createPriceList,priceListProducts} from '../../src/catalog/pricelist.mjs';
const root=new URL('../../',import.meta.url);
const snapshot=JSON.parse(fs.readFileSync(new URL('src/catalog/snapshot.json',root)));
const assets=JSON.parse(fs.readFileSync(new URL('src/assets/pdf/offer-assets.json',root)));
const sm=JSON.parse(fs.readFileSync(new URL('src/assets/pdf/sm-logo.json',root)));
for(const family of ['natural','sm-quartz']){
 const products=priceListProducts(snapshot,family),photos={};
 for(const p of products)if(p.photo)photos[p.id]='data:image/jpeg;base64,'+(await sharp(new URL(`src/assets/catalog/${p.photo}`,root).pathname).resize(1200,377,{fit:'cover'}).jpeg({quality:90}).toBuffer()).toString('base64');
 const pdf=createPriceList(snapshot,family,{...assets,photos,smLogo:sm.logo},'uk',new Date('2026-09-07T12:00:00Z'));
 fs.writeFileSync(`/tmp/altaco-pricelist-${family}.pdf`,Buffer.from(pdf.output('arraybuffer')));
 console.log(family,products.length,'positions',pdf.getNumberOfPages(),'pages');
}
