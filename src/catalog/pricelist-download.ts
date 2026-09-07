import assets from '@/assets/pdf/offer-assets.json';
import sm from '@/assets/pdf/sm-logo.json';
import {createPriceList,priceListProducts} from './pricelist.mjs';
import type {PriceListFamily} from './pricelist.mjs';
import type {Snapshot,Locale} from './types';
import {loadPhoto} from './pdf-photo';
export async function priceListBlob(snapshot:Snapshot,family:PriceListFamily,locale:Locale,onProgress:(done:number,total:number)=>void=()=>{}):Promise<Blob>{
 const products=priceListProducts(snapshot,family),photos:Record<string,string>={},cache=new Map<string,string>();
 for(const [index,p] of products.entries()){
  if(p.photo){if(!cache.has(p.photo))cache.set(p.photo,await loadPhoto(p.photo,1200,377));photos[p.id]=cache.get(p.photo)!;}
  onProgress(index+1,products.length);
 }
 return createPriceList(snapshot,family,{...assets,smLogo:sm.logo,photos},locale).output('blob');
}
