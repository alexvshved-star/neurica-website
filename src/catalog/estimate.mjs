/** Public retail estimate only. No tax assumptions, discounts or stock allocation. */
import {validQuantity} from './quantity.mjs';
export function estimateLine(product, quantity) {
  if (!validQuantity(product,quantity)) throw new RangeError('Invalid slab quantity or step');
  if (product.kind !== 'slab' || product.pricePending || !Number.isSafeInteger(product.priceSlabCents) || product.priceSlabCents < 0) return null;
  // Round the line amount once to the nearest eurocent (half a cent rounds up).
  const result = Math.round(product.priceSlabCents * quantity);
  if (!Number.isSafeInteger(result)) throw new RangeError('Amount exceeds safe range');
  return result;
}
