import type {jsPDF} from 'jspdf';
import type {Snapshot,Product,Locale} from './types';
import type {OfferAssets} from './offer.mjs';
export type PriceListFamily='natural'|'sm-quartz';
export const SM_GROUPS:Record<string,number|'archive'>;
export function priceListProducts(snapshot:Snapshot,family:PriceListFamily):Product[];
export function priceListSections(snapshot:Snapshot,family:PriceListFamily):Array<{title:string;products:Product[]}>;
export function createPriceList(snapshot:Snapshot,family:PriceListFamily,assets:OfferAssets&{smLogo:string},locale?:Locale,createdAt?:Date):jsPDF;
