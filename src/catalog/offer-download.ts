import assets from '@/assets/pdf/offer-assets.json';
import {createOffer,offerItems} from './offer.mjs';
import type {OfferSelection} from './offer.mjs';
import type {Snapshot,Locale} from './types';
import {loadPhoto} from './pdf-photo';
export async function offerBlob(snapshot:Snapshot,selection:OfferSelection[],locale:Locale):Promise<Blob>{
 const items=offerItems(snapshot,selection);const photos:Record<string,string>={};
 for(const {product} of items)photos[product.id]=await loadPhoto(product.photo!);
 return createOffer(snapshot,selection,{...assets,photos},locale).output('blob');
}
