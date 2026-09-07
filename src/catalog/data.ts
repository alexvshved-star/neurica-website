import type { ImageMetadata } from 'astro';
import raw from './snapshot.json';
import {validateSnapshot} from './model.mjs';
import type {Locale} from './types';
export const snapshot = validateSnapshot(raw);
export const products = snapshot.products;
const assets = import.meta.glob<{default:ImageMetadata}>('../assets/catalog/*.{jpg,jpeg,png}',{eager:true});
export function photoFor(filename:string|null) {
  if (!filename) return undefined;
  const image = assets[`../assets/catalog/${filename}`]?.default;
  if (!image) throw new Error(`Missing catalogue asset ${filename}`);
  return image;
}
export const catalogHref = (locale:Locale) => `${locale==='en'?'/en':''}/work/altaco-catalog/`;
export const productHref = (locale:Locale,id:string) => `${catalogHref(locale)}${id}/`;
export const money = (cents:number|null,locale:Locale) => cents===null ? (locale==='uk'?'Ціну уточнюємо':'Price pending') : new Intl.NumberFormat(locale==='uk'?'uk-UA':'en-IE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
