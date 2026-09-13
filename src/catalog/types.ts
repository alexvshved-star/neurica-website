export type Locale = 'uk'|'en';
export interface Product {
  id:string;name:string;family:'natural'|'sm-quartz';kind:'slab'|'fragment'|'sample-slab';
  materialType:string;manufacturer:string|null;collection:string|null;code:string|null;
  finish:string;finishPending:boolean;lengthMm:number;widthMm:number;thicknessMm:number;
  inStock:boolean;priceM2Cents:number|null;priceSlabCents:number|null;pricePending:boolean;
  photo:string|null;reference:{file:string;page:number}|null;
}
export interface Filters {q?:string;family?:string;type?:string;finish?:string;thickness?:string;collection?:string;stock?:string;samples?:string;sort?:string;}
export interface Snapshot {schemaVersion:number;importedAt:string;dataAsOf:string|null;sourceLabel:string;vat:string;products:Product[];}
