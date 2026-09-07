import {jsPDF} from 'jspdf';
// Verified labels in the supplied SM Quartz stock PDF, pages 3–7. No PDF prices are imported.
export const SM_GROUPS={T5L6:1,T590:1,T5J0:2,T5Q2:2,T5Q5:2,T5Q6:2,T5N9:3,T5P3:4,T5R4:5,T5R3:5,T5R2:5,'5W2':5,'5W1':5,T5Q8:5,T5U5:6,T5T0:6,'5W6':6,C14:7,T5P0:'archive',T5Q0:'archive',T5T1:'archive',T5U1:'archive',T5U2:'archive',T560:'archive'};
const NATURAL_GROUPS=['Bagnara / Kitchen Selection','Brazilian Exotic Collection','Monohrom / Marmo di Carrara'];
export function priceListProducts(snapshot,family){
 if(!['natural','sm-quartz'].includes(family))throw new Error('Unknown price list');
 if(snapshot.vat!=='included')throw new Error('VAT must be confirmed');
 const products=snapshot.products.filter(p=>p.family===family&&p.inStock&&p.kind!=='sample-slab');
 return products.sort((a,b)=>{
  const rank=p=>family==='natural'?(NATURAL_GROUPS.includes(p.collection)?NATURAL_GROUPS.indexOf(p.collection):3):(SM_GROUPS[p.code]==='archive'?99:SM_GROUPS[p.code]??98);
  return rank(a)-rank(b)||a.name.localeCompare(b.name,'en')||a.finish.localeCompare(b.finish,'en')||a.lengthMm-b.lengthMm||a.widthMm-b.widthMm||a.thicknessMm-b.thicknessMm||a.id.localeCompare(b.id);
 });
}
export function priceListSections(snapshot,family){
 const products=priceListProducts(snapshot,family);
 if(family==='sm-quartz')return products.length?[{title:'SM Quartz',products}]:[];
 const groups=new Map();for(const p of products){const key=p.collection??'Other natural stone';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 return [...groups].map(([title,products])=>({title,products}));
}
export function createPriceList(snapshot,family,assets,locale='uk',createdAt=new Date()){
 const sections=priceListSections(snapshot,family),products=sections.flatMap(s=>s.products);
 if(!products.length)throw new Error('No available materials');
 const uk=locale==='uk',sm=family==='sm-quartz',dark='#0f181f',gold='#b38a3c',ink='#434d55',muted='#7c858c';
 const pdf=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 for(const [key,style] of [['regular','normal'],['bold','bold']]){pdf.addFileToVFS(key+'.ttf',assets[key]);pdf.addFont(key+'.ttf','Arimo',style);}
 const title=sm?'SM QUARTZ':uk?'НАТУРАЛЬНИЙ КАМІНЬ':'NATURAL STONE';
 pdf.setProperties({title:`ALTACO / ${title}`,author:'ALTACO',subject:'Kyiv stock / retail prices including VAT'});
 const date=d=>new Intl.DateTimeFormat(uk?'uk-UA':'en-GB',{timeZone:'Europe/Kyiv'}).format(new Date(d));
 const money=c=>c===null?(uk?'Ціну уточнюємо':'Price on request'):new Intl.NumberFormat(uk?'uk-UA':'en-IE',{style:'currency',currency:'EUR',currencyDisplay:'narrowSymbol',minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100).replace(/[\u00a0\u202f]/g,' ');
 const text=(s,x,y,size=9,color=ink,bold=false,width=178)=>{pdf.setFont('Arimo',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(color);const lines=pdf.splitTextToSize(String(s),width);pdf.text(lines,x,y);return lines.length*size*.42;};
 const rect=(x,y,w,h,color)=>{pdf.setFillColor(color);pdf.rect(x,y,w,h,'F');};
 const logos=()=>{pdf.addImage(assets.logo,'PNG',16,8,58,58*25/202);if(sm)pdf.addImage(assets.smLogo,'PNG',149,7,45,45*28/158);};
 const footer=()=>{pdf.setDrawColor('#cdd1d3');pdf.setLineWidth(.2);pdf.line(16,282,194,282);text('ALTACO / KYIV / ALTACO.COM.UA',16,287,6,muted);text(`${uk?'ІМПОРТ':'IMPORTED'}: ${date(snapshot.importedAt)} | ${uk?'ЦІНИ З ПДВ':'VAT INCLUDED'}`,93,287,6,muted,false,90);text(String(pdf.getNumberOfPages()).padStart(2,'0'),190,292,6,muted);};
 const header=()=>{rect(0,0,210,24,dark);logos();rect(0,24,210,.7,gold);};
 // Cover and conditions preserve the supplied price lists' document structure.
 rect(0,0,210,297,dark);logos();rect(16,34,25,.7,gold);
 text(title,16,91,26,'#ffffff',true,178);
 text(uk?'В НАЯВНОСТІ / КИЇВ':'IN STOCK / KYIV',16,117,14,gold,true);
 text(uk?'Складська пропозиція / роздрібні ціни':'Stock selection / retail prices',16,133,10,'#a6adb2');
 const cover=products.find(p=>assets.photos[p.id]);
 if(cover)pdf.addImage(assets.photos[cover.id],'JPEG',16,163,178,55.89,cover.id,'FAST');
 text(`${uk?'РОЗДРІБНІ ЦІНИ / EUR / З ПДВ':'RETAIL PRICES / EUR / VAT INCLUDED'} / ${date(createdAt)}`,16,267,9,'#ffffff');
 text(`${uk?'Імпорт даних':'Data imported'}: ${date(snapshot.importedAt)}`,16,278,8,'#a6adb2');
 pdf.addPage();header();text(uk?'Складська пропозиція / Київ':'Kyiv stock selection',16,44,19);
 const notes=uk?[
  'У прайсі наведено позиції з позитивною наявністю у знімку каталогу ALTACO. Зразкові слеби не включені.',
  'Кожна картка відповідає конкретному матеріалу, партії, поверхні, формату й товщині. Фрагменти позначені окремо.',
  'Кількість не публікується - актуальний залишок, можливість продажу цілого слеба та резерв підтверджує менеджер.',
  'Ціни роздрібні, в EUR, з ПДВ, без знижок. Розрахунок у гривні - за погодженим курсом на дату оплати.',
  'Непідтверджені ціни й характеристики позначені для уточнення. Відсутня ціна не означає нульову вартість.',
  'Макрофото передає характер матеріалу; фактичний малюнок конкретного слеба погоджується окремо.',
  `Дата формування: ${date(createdAt)}. Дата імпорту: ${date(snapshot.importedAt)}. Автоматичного оновлення немає; ціни й наявність перед замовленням підтверджує менеджер.`
 ]:[
  'This list includes materials with positive availability in the ALTACO catalogue snapshot. Sample slabs are excluded.',
  'Each card represents a specific material, lot, finish, format and thickness. Fragments are explicitly labelled.',
  'Quantities are available on request. A manager confirms stock, whole slab availability and reservations.',
  'Retail prices in EUR, including VAT, without discounts. Payment in UAH at the rate agreed on the payment date.',
  'Unconfirmed prices and specifications are marked for clarification. A missing price does not mean zero cost.',
  'Macro images illustrate the material. The actual slab pattern is agreed separately.',
  `Generated: ${date(createdAt)}. Imported: ${date(snapshot.importedAt)}. No automatic updates; a manager confirms current prices and availability.`
 ];
 let y=63;for(const n of notes)y+=text(n,16,y,10,ink,false,175)+9;
 text(uk?'ЗАПИТ НА МАТЕРІАЛ':'MATERIAL ENQUIRIES',16,244,10,gold,true);
 text('+38 067 444 7880 / ALTACO.COM.UA',16,255,12,ink,true);footer();
 for(const section of sections){for(let offset=0;offset<section.products.length;offset+=6){
  pdf.addPage();header();
  text(title+' / '+(uk?'СКЛАД КИЇВ':'KYIV STOCK'),16,31,6.5,muted);
  const sectionTitle=section.title==='Other natural stone'?(uk?'Інший натуральний камінь':'Other natural stone'):section.title;
  text(sm?(uk?'Слеби в наявності':'Available slabs'):sectionTitle,16,41,15,ink,false,176);
  text(uk?'КІЛЬКІСТЬ / ЗА ЗАПИТОМ':'QUANTITIES / ON REQUEST',141,46,6,muted,false,53);
  section.products.slice(offset,offset+6).forEach((p,index)=>{
   const x=16+(index%2)*92,y=51+Math.floor(index/2)*72,w=86;
   pdf.setDrawColor('#cdd1d3');pdf.setLineWidth(.2);pdf.roundedRect(x,y,w,67,1.5,1.5,'S');
   rect(x,y,w,6.5,dark);
   const group=SM_GROUPS[p.code];
   const tag=sm?(group==='archive'?(uk?'АРХІВНА КОЛЕКЦІЯ':'ARCHIVE COLLECTION'):group?`${uk?'ГРУПА':'GROUP'} ${group}`:'SM QUARTZ'):p.materialType.toUpperCase();
   text(tag,x+3,y+4.4,6,'#ffffff',true,51);
   text(sm?(p.code??''):p.finishPending?(uk?'УТОЧНЮЄМО':'PENDING'):p.finish.toUpperCase(),x+58,y+4.4,6,'#ffffff',false,26);
   if(p.photo){if(!assets.photos[p.id])throw new Error('Photo load failed');pdf.addImage(assets.photos[p.id],'JPEG',x,y+6.5,w,27,p.id,'FAST');}
   else{rect(x,y+6.5,w,27,'#f1f2f3');text(uk?'Фото очікується':'Photo pending',x+5,y+23,8,muted);}
   text(p.name.toUpperCase(),x+3,y+38,8,ink,true,80);
   text(`${p.lengthMm} × ${p.widthMm} × ${p.thicknessMm} ${uk?'мм':'mm'}${sm?' / '+(p.finishPending?(uk?'обробку уточнюємо':'finish pending'):p.finish):''}`,x+3,y+47,6.7,muted,false,79);
   pdf.setDrawColor('#cdd1d3');pdf.line(x+3,y+53,x+w-3,y+53);
   text(uk?'ЦІНА ЗА 1 М²':'PRICE PER M²',x+3,y+57,5.8,muted);
   text(p.kind==='fragment'?(uk?'ЦІНА ЗА ФРАГМЕНТ':'PRICE PER FRAGMENT'):(uk?'ЦІНА ЗА СЛЕБ':'PRICE PER SLAB'),x+45,y+57,5.8,muted,false,38);
   text(money(p.pricePending?null:p.priceM2Cents),x+3,y+63,8,ink,true,39);
   text(money(p.pricePending?null:p.priceSlabCents),x+45,y+63,8,ink,true,38);
  });footer();
 }}
 return pdf;
}
