// Single rule for displaying stock freshness across the catalogue, the
// product page and both PDF generators. dataAsOf is the plain YYYY-MM-DD
// date validated by model.mjs, confirmed by whoever reconciles the
// warehouse source — or null. Never substitute importedAt or today's date
// for it here; those are separate facts (import time, document generation
// time) and keep their own display elsewhere.
export function formatStockDate(dataAsOf, locale) {
  const date = new Date(`${dataAsOf}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
export function stockAsOfText(dataAsOf, locale) {
  const uk = locale === 'uk';
  if (dataAsOf) return `${uk ? 'Залишки станом на' : 'Stock as of'} ${formatStockDate(dataAsOf, locale)}`;
  return uk ? 'Дата актуальності залишків не підтверджена' : 'Stock freshness date has not been confirmed';
}
