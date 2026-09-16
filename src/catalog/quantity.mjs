export const quantityStep = product => product.kind === 'slab' && product.family === 'sm-quartz' ? 0.5 : 1;
export function validQuantity(product, quantity) {
 const step=quantityStep(product);
 return typeof quantity==='number' && Number.isFinite(quantity) && quantity>=step && quantity<=999 && Number.isSafeInteger(quantity/step);
}
