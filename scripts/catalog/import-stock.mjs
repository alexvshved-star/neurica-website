// Run locally with a private connector export {values:[[...]]}; never commit it.
import fs from 'node:fs';
import { normalizeStock } from '../../src/catalog/model.mjs';
const [input, importedAt, dataAsOf] = process.argv.slice(2);
if (!input || !importedAt) throw new Error('Usage: node scripts/catalog/import-stock.mjs /private/stock.json ISO-import-time [verified-data-date]');
const root = new URL('../../',import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('src/catalog/manifest.json',root),'utf8'));
const source = JSON.parse(fs.readFileSync(input,'utf8'));
const snapshot = normalizeStock(source.values,manifest,importedAt,dataAsOf??null);
for (const p of snapshot.products) if (p.photo && !fs.existsSync(new URL(`src/assets/catalog/${p.photo}`,root))) throw new Error(`Missing photo for ${p.id}`);
const target = new URL('src/catalog/snapshot.json',root);
fs.writeFileSync(new URL('src/catalog/snapshot.json.tmp',root),JSON.stringify(snapshot,null,2)+'\n');
fs.renameSync(new URL('src/catalog/snapshot.json.tmp',root),target);
console.log(`Imported ${snapshot.products.length} public variants; ${snapshot.products.filter(p=>p.pricePending).length} prices pending.`);
