import type {Product,Filters,Snapshot} from './types';
export const PRODUCT_FIELDS:string[];
export function validateSnapshot(snapshot:unknown):Snapshot;
export function selectProducts(products:Product[],filters?:Filters):Product[];
export function normalizeStock(rows:unknown[][],manifest:Record<string,unknown>,importedAt:string,dataAsOf?:string|null):Snapshot;
export function variantKey(group:string,name:string,finish:string,dimensions:number[]):string;
