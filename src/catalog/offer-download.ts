import assets from '@/assets/pdf/offer-assets.json';
import {createOffer,offerItems} from './offer.mjs';
import type {OfferSelection} from './offer.mjs';
import type {Snapshot,Locale} from './types';
const photoUrls=import.meta.glob<string>('../assets/catalog/*.{jpg,jpeg,png}',{query:'?url',import:'default',eager:true});
async function loadPhoto(filename:string):Promise<string>{
 const url=photoUrls[`../assets/catalog/${filename}`];if(!url)throw new Error('Photo missing');
 const img=new Image();img.src=url;await img.decode();
 const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=640;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image conversion unavailable');
 const scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
 ctx.drawImage(img,(canvas.width-img.naturalWidth*scale)/2,(canvas.height-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
 return canvas.toDataURL('image/jpeg',.9);
}
export async function offerBlob(snapshot:Snapshot,selection:OfferSelection[],locale:Locale):Promise<Blob>{
 const items=offerItems(snapshot,selection);const photos:Record<string,string>={};
 for(const {product} of items)photos[product.id]=await loadPhoto(product.photo!);
 return createOffer(snapshot,selection,{...assets,photos},locale).output('blob');
}
