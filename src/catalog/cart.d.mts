import type {Product} from './types';
export interface CartItem {id:string;quantity:number;}
export const CART_KEY:string;
export function readCart(value:string|null,products:Product[]):CartItem[];
export function writeCart(items:CartItem[]):string;
