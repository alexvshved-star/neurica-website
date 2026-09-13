import type {jsPDF} from 'jspdf';
import type {Snapshot,Product,Locale} from './types';
export interface OfferSelection {id:string;quantity:number}
export interface OfferAssets {regular:string;bold:string;logo:string;photos:Record<string,string>}
export function offerItems(snapshot:Snapshot,selection:OfferSelection[]):Array<{product:Product;quantity:number;totalCents:number}>;
export function createOffer(snapshot:Snapshot,selection:OfferSelection[],assets:OfferAssets,locale?:Locale,createdAt?:Date):jsPDF;
