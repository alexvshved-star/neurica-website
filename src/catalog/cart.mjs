// Persist IDs and quantities only; prices always come from the current catalogue.
import {validQuantity} from './quantity.mjs';
export const CART_KEY = 'altaco-cart-v1';
export function readCart(value, products) {
  try {
    const data = JSON.parse(value ?? 'null');
    if (data?.version !== 1 || !Array.isArray(data.items)) return [];
    const allowed = new Map(products.filter(p => p.kind !== 'sample-slab').map(p => [p.id, p]));
    const seen = new Set();
    return data.items.filter(item => {
      if (!item || !allowed.has(item.id) || seen.has(item.id) || !validQuantity(allowed.get(item.id),item.quantity)) return false;
      seen.add(item.id);return true;
    }).map(({id, quantity}) => ({id, quantity: allowed.get(id).kind === 'fragment' ? 1 : quantity}));
  } catch { return []; }
}
export function writeCart(items) {
  return JSON.stringify({version: 1, items: items.map(({id, quantity}) => ({id, quantity}))});
}
