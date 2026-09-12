/** Public catalogue contract. No raw stock rows may be served or committed. */
export const REQUIRED_HEADERS = {0:'Артикул',1:'Тип матеріалу',5:'Обробка',6:'Висота, мм',7:'Ширина, мм',8:'Товщина, мм',13:'В наявності, слебів',16:'Роздріб, €/м²',18:'Роздріб, €/слеб'};
export const PRODUCT_FIELDS = ['id','name','family','kind','materialType','manufacturer','collection','code','finish','finishPending','lengthMm','widthMm','thicknessMm','inStock','priceM2Cents','priceSlabCents','pricePending','photo','reference'];
export function validateSnapshot(snapshot) {
  if (Object.keys(snapshot).some(k=>!['schemaVersion','importedAt','dataAsOf','sourceLabel','vat','products'].includes(k))) throw new Error('Non-public snapshot field');
  if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.products) || !snapshot.products.length) throw new Error('Empty or unsupported catalogue');
  if (!Number.isFinite(Date.parse(snapshot.importedAt))) throw new Error('Invalid import timestamp');
  if (snapshot.dataAsOf !== null && !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.dataAsOf)) throw new Error('Invalid source date');
  const seen = new Set();
  for (const p of snapshot.products) {
    if (Object.keys(p).some(k => !PRODUCT_FIELDS.includes(k))) throw new Error(`Non-public field in ${p.id}`);
    if (!/^(nat|sm)-[a-f0-9]{12}$/.test(p.id) || seen.has(p.id)) throw new Error('Invalid or duplicate variant ID');
    seen.add(p.id);
    if (!p.name || !['natural','sm-quartz'].includes(p.family) || !['slab','fragment','sample-slab'].includes(p.kind)) throw new Error(`Invalid product ${p.id}`);
    if (typeof p.inStock !== 'boolean' || typeof p.pricePending !== 'boolean' || typeof p.finishPending !== 'boolean') throw new Error('Invalid flags');
    for (const k of ['lengthMm','widthMm','thicknessMm']) if (!Number.isInteger(p[k]) || p[k] <= 0) throw new Error(`Invalid dimension ${p.id}`);
    for (const k of ['priceM2Cents','priceSlabCents']) if (p[k] !== null && (!Number.isSafeInteger(p[k]) || p[k] <= 0)) throw new Error(`Invalid retail price ${p.id}`);
    if (p.pricePending && (p.priceM2Cents !== null || p.priceSlabCents !== null)) throw new Error('Unconfirmed prices must not be published');
    if (p.reference && (Object.keys(p.reference).some(k=>!['file','page'].includes(k)) || !Number.isInteger(p.reference.page))) throw new Error('Invalid reference');
    if (p.photo !== null && !/^[a-z0-9-]+\.(jpeg|jpg|png|webp)$/.test(p.photo)) throw new Error('Invalid local photo');
  }
  return snapshot;
}
export const variantKey = (group, name, finish, dimensions) => [group,name.trim(),finish.trim(),dimensions.join(',')].join('|');
export function normalizeStock(rows, manifest, importedAt, dataAsOf = null) {
  const groups = {'НАЯВНІСТЬ | Natural':'natural','НАЯВНІСТЬ | SM Quartz':'sm-quartz','ЗРАЗКИ | СЛЕБИ':'sample-slab','ЗРАЗКИ | SM Quartz':'hand-sample'};
  let group = ''; let headerChecked = false; const products = [];
  const num = x => typeof x === 'number' && Number.isFinite(x);
  for (const row of rows) {
    if (groups[row[0]]) { group = groups[row[0]]; headerChecked = false; continue; }
    if (row[0] === 'Артикул') {
      if (Object.entries(REQUIRED_HEADERS).some(([i,expected])=>row[Number(i)]!==expected)) throw new Error('Stock columns changed; review mapping');
      headerChecked=true;continue;
    }
    if (!group || group === 'hand-sample' || !row[0] || row[0] === 'Артикул' || row[0].startsWith('РАЗОМ') || row[0].startsWith('ЗАГАЛЬНА')) continue;
    if (!headerChecked) throw new Error('Missing stock headers');
    const [name,rawType] = row;
    if (typeof name !== 'string' || ![6,7,8].every(i => num(row[i]) && row[i]>0) || typeof row[5] !== 'string' || !num(row[13])) throw new Error('Incomplete stock row; keep previous snapshot');
    const dimensions = row.slice(6,9); const finish = row[5].trim();
    const m = manifest[variantKey(group,name,finish,dimensions)];
    if (!m) throw new Error(`Unmapped variant: ${name}; review manifest before importing`);
    const cents = value => num(value) && value>0 ? Math.round(value*100) : null;
    const pending = m.pricePending === true || cents(row[16]) === null || cents(row[18]) === null;
    products.push({id:m.id,name:group==='sm-quartz' && finish.toLowerCase()==='silk' && !/\bsilk$/i.test(name.trim()) ? `${name.trim()} Silk` : name.trim(),family:group==='sm-quartz'?'sm-quartz':'natural',kind:name.includes('кусок')?'fragment':'slab',
      materialType:m.materialType ?? ({Granite:'granite',Marble:'marble',Quarcite:'quartzite',Travertine:'travertine','SM Quartz':'quartz-agglomerate'}[rawType] ?? 'natural-stone'),
      manufacturer:m.manufacturer ?? null,collection:m.collection ?? null,code:m.code ?? null,
      finish,finishPending:m.finishPending===true,lengthMm:dimensions[0],widthMm:dimensions[1],thicknessMm:dimensions[2],inStock:row[13]>0,
      priceM2Cents:pending?null:cents(row[16]),priceSlabCents:pending?null:cents(row[18]),pricePending:pending,photo:m.photo??null,reference:m.reference??null});
  }
  return validateSnapshot({schemaVersion:1,importedAt,dataAsOf,sourceLabel:'ALTACO / Наявність',vat:'included',products});
}
export function selectProducts(products, filters = {}) {
  const query = (filters.q || '').normalize('NFKC').toLocaleLowerCase().trim();
  const found = products.filter(p => {
    const haystack = [p.name,p.code,p.manufacturer,p.collection,p.finish].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase();
    return (!query || query.split(/\s+/).every(word=>haystack.includes(word))) &&
      (!filters.family || p.family===filters.family) && (!filters.type || p.materialType===filters.type) &&
      (!filters.finish || p.finish===filters.finish) && (!filters.thickness || String(p.thicknessMm)===filters.thickness) &&
      (!filters.collection || (p.collection??p.manufacturer??'')===filters.collection) &&
      (!filters.stock || (filters.stock==='yes'?p.inStock:!p.inStock)) &&
      (filters.samples==='yes' || p.kind!=='sample-slab');
  });
  return found.sort((a,b) => {
    if (filters.sort === 'price-asc' || filters.sort === 'price-desc') {
      if (a.priceM2Cents===null || b.priceM2Cents===null) return a.priceM2Cents===b.priceM2Cents?0:a.priceM2Cents===null?1:-1;
      return (a.priceM2Cents-b.priceM2Cents)*(filters.sort==='price-asc'?1:-1);
    }
    if (filters.sort !== 'name' && a.inStock!==b.inStock) return a.inStock?-1:1;
    return a.name.localeCompare(b.name,'en',{numeric:true}) || a.id.localeCompare(b.id);
  });
}
