// Presentation only: canonical names remain unchanged for detail pages and PDFs.
export function cardTitle(product) {
  return product.name
    .replace(/\s*\\\s*кусок\s*$/iu, '')
    .replace(/\s+полірований та заповнений полімером\s*$/iu, '')
    .trim();
}
