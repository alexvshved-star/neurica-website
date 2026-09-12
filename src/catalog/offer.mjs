import {jsPDF} from 'jspdf';
import {estimateLine} from './estimate.mjs';

export function offerItems(snapshot, selection) {
  if (snapshot.vat !== 'included') throw new Error('VAT must be confirmed');
  if (!Array.isArray(selection) || !selection.length || selection.length > 20) throw new Error('Select 1–20 materials');
  const seen = new Set();
  return selection.map(({id,quantity}) => {
    if (seen.has(id)) throw new Error('Duplicate material');
    seen.add(id);
    const product = snapshot.products.find(p => p.id === id);
    if (!product || !product.inStock || product.finishPending || !product.photo) throw new Error('Material needs confirmation');
    const totalCents = estimateLine(product, quantity);
    if (totalCents === null) throw new Error('Price or format needs confirmation');
    return {product,quantity,totalCents};
  });
}

/** Portable PDF renderer; inputs contain only public catalogue data. */
export function createOffer(snapshot, selection, assets, locale='uk', createdAt=new Date()) {
  const items=offerItems(snapshot,selection), uk=locale==='uk';
  const total=items.reduce((sum,item)=>sum+item.totalCents,0);
  if(!Number.isSafeInteger(total))throw new Error('Amount exceeds safe range');
  const pdf=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
  pdf.addFileToVFS('Arimo-Regular.ttf',assets.regular);pdf.addFont('Arimo-Regular.ttf','Arimo','normal');
  pdf.addFileToVFS('Arimo-Bold.ttf',assets.bold);pdf.addFont('Arimo-Bold.ttf','Arimo','bold');
  pdf.setProperties({title:uk?'Комерційна пропозиція ALTACO':'ALTACO Commercial Offer',author:'ALTACO',subject:'Retail prices including VAT'});
  const dark='#0f181f',gold='#b38a3c',ink='#4d555b',muted='#78828a';
  const money=c=>new Intl.NumberFormat(uk?'uk-UA':'en-IE',{style:'currency',currency:'EUR',currencyDisplay:'narrowSymbol',minimumFractionDigits:2}).format(c/100).replace(/[\u00a0\u202f]/g,' ');
  const qty=q=>new Intl.NumberFormat(uk?'uk-UA':'en-GB',{maximumFractionDigits:1}).format(q);
  const date=new Intl.DateTimeFormat(uk?'uk-UA':'en-GB',{timeZone:'Europe/Kyiv'}).format(createdAt);
  const imported=new Intl.DateTimeFormat(uk?'uk-UA':'en-GB',{timeZone:'Europe/Kyiv'}).format(new Date(snapshot.importedAt));
  const text=(s,x,y,size=10,color=ink,bold=false,width=178)=>{
    pdf.setFont('Arimo',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(color);
    const lines=pdf.splitTextToSize(String(s),width);pdf.text(lines,x,y);return lines.length*size*.42;
  };
  const rect=(x,y,w,h,color)=>{pdf.setFillColor(color);pdf.rect(x,y,w,h,'F');};
  const logo=(x,y,w)=>pdf.addImage(assets.logo,'PNG',x,y,w,w*25/202);
  const photo=(p,x,y,w,h)=>{
    if(!assets.photos[p.id])throw new Error('Photo could not be loaded');
    pdf.addImage(assets.photos[p.id],'JPEG',x,y,w,h,p.id,'FAST');
  };
  const format=p=>`${p.lengthMm} × ${p.widthMm} × ${p.thicknessMm} ${uk?'мм':'mm'}`;
  const collection=p=>p.collection??p.manufacturer??(uk?'Не зазначено':'Not specified');
  const rules=()=>{
    text(uk?'УМОВИ ПРОПОЗИЦІЇ':'OFFER TERMS',16,249,8,ink,true);
    const notes=uk?[
      'Ціни в EUR, з ПДВ. Розрахунок у гривні - за погодженим курсом на дату оплати.',
      'Наявність, кількість, резерв, строк відвантаження й оплату підтверджує менеджер ALTACO.',
      'Фото передає характер матеріалу; фактичний малюнок конкретного слеба погоджується окремо.',
      `Дані каталогу імпортовано ${imported}. Ціни та наявність перед замовленням потребують підтвердження.`
    ]:[
      'Prices in EUR, including VAT. Payment in UAH at the exchange rate agreed on the payment date.',
      'ALTACO confirms availability, quantities, reservation, dispatch and payment terms.',
      'The image illustrates the material; the actual slab pattern is agreed separately.',
      `Catalogue imported ${imported}. Confirm prices and availability before ordering.`
    ];
    let y=255;for(const n of notes)y+=text(n,16,y,6.8,muted,false,178)+1.2;
    text('+38 097 242 21 21 / ALTACO.COM.UA',148,279,7,gold,true,48);
  };
  // Shared cover, with the selected material's texture and the combined amount.
  rect(0,0,210,297,dark);logo(17.5,24,70);rect(17.5,38,22,0.7,gold);
  text(uk?'КОМЕРЦІЙНА ПРОПОЗИЦІЯ':'COMMERCIAL OFFER',17.5,66,9,'#a2aab0');
  const first=items[0].product;
  text(items.length===1?first.name.toUpperCase():(uk?'ПІДБІР МАТЕРІАЛІВ':'MATERIAL SELECTION'),17.5,89,23,'#ffffff',true,130);
  text(items.length===1?`${first.materialType.toUpperCase()} / ${first.finish.toUpperCase()}`:`${uk?'ПОЗИЦІЙ':'MATERIALS'}: ${items.length}`,17.5,111,10,gold);
  text(items.length===1?collection(first):'ALTACO / '+(uk?'СКЛАД КИЇВ':'KYIV STOCK'),17.5,123,8,'#a2aab0',false,170);
  text(`${uk?'СЛЕБІВ':'SLABS'}: ${qty(items.reduce((sum,item)=>sum+item.quantity,0))}`,17.5,142,10,'#ffffff',true);
  text(`${uk?'РАЗОМ З ПДВ':'TOTAL INCLUDING VAT'}: ${money(total)}`,17.5,153,14,gold,true);
  rect(17.5,169,175,8,'#222c33');
  text(items.length===1?first.name:'ALTACO',22,174.5,7,'#ffffff',true,160);
  photo(first,17.5,177,175,80);
  text(`${uk?'ПІДГОТОВЛЕНО ALTACO':'PREPARED BY ALTACO'} / ${date}`,17.5,281,7,'#a2aab0');
  for(const [index,{product:p,quantity,totalCents}] of items.entries()){
    pdf.addPage();rect(0,0,210,26,dark);logo(16,7,48);rect(0,26,210,.8,gold);
    text(uk?'КОМЕРЦІЙНА ПРОПОЗИЦІЯ':'COMMERCIAL OFFER',149,8,6,'#a2aab0',false,50);
    text(p.name,16,45,19,ink,false,155);
    text(`${uk?'КІЛЬКІСТЬ СЛЕБІВ':'SLAB QUANTITY'}: ${qty(quantity)}`,16,62,8,gold,true);
    if(quantity%1!==0)text(uk?'Пів слябу: 50% ціни. Розміри частини погоджуються окремо.':'Half slab: 50% of slab price. Cut dimensions agreed separately.',16,69,7,muted,false,178);
    rect(16,74,178,8,'#222c33');text(p.materialType.toUpperCase(),19,79.5,7,'#ffffff',true,100);text(p.finish.toUpperCase(),153,79.5,7,'#ffffff',true,38);
    photo(p,16,82,178,81.37);
    const area=p.lengthMm*p.widthMm/1e6;
    const facts=[
      [uk?'ФОРМАТ ЦІЛОГО СЛЯБУ':'FULL SLAB FORMAT',format(p)],
      [uk?'ПЛОЩА ЦІЛОГО СЛЯБУ':'FULL SLAB AREA',new Intl.NumberFormat(uk?'uk-UA':'en-GB',{minimumFractionDigits:3,maximumFractionDigits:3}).format(area)+' m²'],
      [uk?'КОЛЕКЦІЯ':'COLLECTION',collection(p)]
    ];
    for(const [j,[label,value]] of facts.entries()){const x=16+j*60;text(label,x,177,6.5,muted);text(value,x,184,8,ink,false,54);}
    rect(16,202,178,37,'#f3f4f4');
    text(uk?'ЦІНА ЗА 1 М², З ПДВ':'PRICE PER M², INCL. VAT',24,214,7,muted);
    text(p.priceM2Cents===null?(uk?'За запитом':'On request'):money(p.priceM2Cents),24,228,17,ink);
    text(uk?'ЦІНА ЗА СЛЕБ, З ПДВ':'PRICE PER SLAB, INCL. VAT',113,214,7,muted);
    text(money(p.priceSlabCents),113,228,17,ink);
    rect(112,192,82,10,gold);text(`${qty(quantity)} ${uk?'СЛЕБ(ІВ) / РАЗОМ':'SLAB(S) / TOTAL'} ${money(totalCents)}`,116,198.5,8,dark,true,74);
    rules();pdf.setDrawColor('#c9ced1');pdf.setLineWidth(.2);pdf.line(16,285,194,285);
    text('ALTACO / '+(uk?'КИЇВ':'KYIV')+' / ALTACO.COM.UA',16,290,6,muted);
    text(String(index+2).padStart(2,'0'),190,290,7,muted);
  }
  return pdf;
}
