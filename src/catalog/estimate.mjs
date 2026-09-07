/** Public retail estimate only. No tax assumptions, discounts or stock allocation. */
export function estimateLine(product, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) throw new RangeError('Quantity must be a whole number from 1 to 999');
  if (product.kind !== 'slab' || product.pricePending || !Number.isSafeInteger(product.priceSlabCents) || product.priceSlabCents < 0) return null;
  const result = product.priceSlabCents * quantity;
  if (!Number.isSafeInteger(result)) throw new RangeError('Amount exceeds safe range');
  return result;
}
