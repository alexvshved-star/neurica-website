import raw from './snapshot.json';
import {estimateLine} from './estimate.mjs';
import {CART_KEY,readCart,writeCart} from './cart.mjs';
import type {Product,Snapshot} from './types';

const panel=document.querySelector<HTMLDialogElement>('[data-cart]');
if(panel){
 const uk=panel.dataset.locale==='uk';
 const products=raw.products as Product[];
 const selected=new Set<string>();
 const rows=new Map(Array.from(panel.querySelectorAll<HTMLElement>('[data-cart-id]')).map(row=>[row.dataset.cartId!,row]));
 const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-add-selection]'));
 const opener=document.querySelector<HTMLButtonElement>('[data-open-cart]')!;
 const download=panel.querySelector<HTMLAnchorElement>('[data-offer-download]')!;
 const status=panel.querySelector<HTMLElement>('[data-offer-status]')!;
 const generate=panel.querySelector<HTMLButtonElement>('[data-create-offer]')!;
 const storageNote=panel.querySelector<HTMLElement>('[data-cart-storage]')!;
 let revision=0,downloadUrl:string|null=null,busy=false,eligible=false,storageAvailable=true;
 let returnFocus:HTMLElement=opener,previousOverflow='';
 const money=(cents:number)=>new Intl.NumberFormat(uk?'uk-UA':'en-IE',{style:'currency',currency:'EUR'}).format(cents/100);
 const selection=()=>Array.from(selected,id=>({id,quantity:rows.get(id)?.querySelector<HTMLInputElement>('input')?.valueAsNumber??1}));
 const storageFailed=()=>{
  storageAvailable=false;
  storageNote.textContent=uk?'Браузер не дозволяє збереження. Кошик працює лише до переходу або перезавантаження цієї сторінки.':'Browser storage is unavailable. This cart lasts only until navigation or reload.';
 };
 function save(){
  try{
   // Invalid input remains visible for correction, but cannot corrupt the saved cart.
   const valid=selection().map(item=>({...item,quantity:Number.isSafeInteger(item.quantity)&&item.quantity>=1&&item.quantity<=999?item.quantity:1}));
   localStorage.setItem(CART_KEY,writeCart(valid));
  }catch{storageFailed();}
 }
 function restore(){
  try{
   const items=readCart(localStorage.getItem(CART_KEY),products);selected.clear();
   for(const row of rows.values()){const input=row.querySelector<HTMLInputElement>('input');if(input)input.value='1';}
   for(const item of items){selected.add(item.id);const input=rows.get(item.id)?.querySelector<HTMLInputElement>('input');if(input)input.value=String(item.quantity);}
  }catch{storageFailed();}
 }
 function openCart(from:HTMLElement){
  returnFocus=from;
  if(!panel!.open){previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';panel!.showModal();}
 }
 function render(){
  revision++;download.hidden=true;download.removeAttribute('href');status.textContent='';
  if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}
  let total=0,unpriced=0,invalid=false,blocked=false;
  for(const p of products){
   const row=rows.get(p.id);if(!row)continue;
   row.hidden=!selected.has(p.id);if(row.hidden)continue;
   const input=row.querySelector<HTMLInputElement>('input');
   const output=row.querySelector<HTMLElement>('[data-line-total]')!;
   const warning=row.querySelector<HTMLElement>('[data-cart-warning]')!;
   const reasons:string[]=[];
   if(!p.inStock)reasons.push(uk?'Під замовлення — КП після підтвердження менеджером':'On order — a manager must confirm the offer');
   if(p.kind!=='slab')reasons.push(uk?'Фрагмент — розрахунок менеджером':'Fragment — manager estimate required');
   if(p.pricePending||p.priceSlabCents===null)reasons.push(uk?'Ціну уточнюємо':'Price pending');
   if(p.finishPending)reasons.push(uk?'Обробку уточнюємо':'Finish pending');
   if(!p.photo)reasons.push(uk?'Фото для PDF відсутнє':'PDF photo missing');
   warning.textContent=reasons.join(' · ');warning.hidden=!reasons.length;blocked ||=reasons.length>0;
   if(input&&!input.checkValidity()){
    invalid=true;input.setAttribute('aria-invalid','true');output.textContent=uk?'Ціле число 1–999':'Whole number 1–999';continue;
   }
   input?.removeAttribute('aria-invalid');
   const value=estimateLine(p,input?input.valueAsNumber:1);
   if(value===null){unpriced++;output.textContent=uk?'За запитом':'On request';}
   else{total+=value;output.textContent=money(value);}
  }
  panel!.querySelector<HTMLElement>('[data-cart-empty]')!.hidden=selected.size>0;
  panel!.querySelector<HTMLElement>('[data-cart-summary]')!.hidden=selected.size===0;
  panel!.querySelector('[data-cart-total]')!.textContent=invalid?(uk?'Виправте кількість для розрахунку суми.':'Correct quantities to calculate the total.'):
   (uk?'Позицій: ':'Items: ')+selected.size+'. '+(unpriced?(uk?'Сума оцінених позицій: ':'Priced items subtotal: '):(uk?'Попередня сума: ':'Estimated total: '))+money(total);
  const notice=panel!.querySelector<HTMLElement>('[data-cart-blocked]')!;
  notice.hidden=!(blocked||invalid||selected.size>20);
  notice.textContent=selected.size>20?(uk?'Для однієї PDF-КП залиште до 20 позицій.':'Keep up to 20 items for one PDF offer.'):
   invalid?(uk?'Вкажіть цілу кількість слябів від 1 до 999.':'Enter a whole slab quantity from 1 to 999.'):
   (uk?'Для формування PDF приберіть позиції з попередженнями або уточніть їх у менеджера.':'To generate a PDF, remove flagged items or confirm them with a manager.');
  eligible=selected.size>0&&selected.size<=20&&!blocked&&!invalid;
  generate.disabled=busy||!eligible;
  document.querySelector('[data-cart-count]')!.textContent=String(selected.size);
  opener.setAttribute('aria-label',(uk?'Кошик, позицій: ':'Cart, items: ')+selected.size);
  for(const button of buttons){
   const active=selected.has(button.dataset.addSelection!);
   button.setAttribute('aria-pressed',String(active));
   button.textContent=active?(uk?'У кошику ✓':'In cart ✓'):(uk?'Додати в кошик':'Add to cart');
  }
 }
 for(const button of buttons){
  button.hidden=false;button.addEventListener('click',()=>{
   const id=button.dataset.addSelection!;if(!rows.has(id))return;
   if(selected.has(id)){openCart(button);return;}
   selected.add(id);render();save();
   document.querySelector('[data-cart-feedback]')!.textContent=(uk?'Додано в кошик. Позицій: ':'Added to cart. Items: ')+selected.size;
  });
 }
 opener.addEventListener('click',()=>openCart(opener));
 for(const close of panel.querySelectorAll('[data-close-cart]'))close.addEventListener('click',()=>panel.close());
 panel.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;returnFocus.focus();});
 panel.addEventListener('click',event=>{
  const target=(event.target as Element).closest<HTMLButtonElement>('[data-remove],[data-clear-cart]');if(!target)return;
  if(target.dataset.remove){selected.delete(target.dataset.remove);const input=rows.get(target.dataset.remove)?.querySelector<HTMLInputElement>('input');if(input)input.value='1';}
  else{selected.clear();for(const input of panel.querySelectorAll<HTMLInputElement>('input'))input.value='1';}
  render();save();
  (panel.querySelector<HTMLButtonElement>('li:not([hidden]) [data-remove]')??panel.querySelector<HTMLButtonElement>('[data-close-cart]'))?.focus();
 });
 panel.addEventListener('input',()=>{render();save();});
 generate.addEventListener('click',async()=>{
  if(busy||!eligible)return;
  const version=revision,items=selection();busy=true;generate.disabled=true;status.textContent=uk?'Формуємо PDF…':'Preparing PDF…';
  try{
   const {offerBlob}=await import('./offer-download');
   const blob=await offerBlob(raw as Snapshot,items,uk?'uk':'en');
   if(version!==revision){status.textContent=uk?'Кошик змінився. Сформуйте PDF повторно.':'Cart changed. Generate the PDF again.';return;}
   downloadUrl=URL.createObjectURL(blob);download.href=downloadUrl;
   download.download='ALTACO_Commercial_Offer_'+new Date().toISOString().slice(0,10)+'.pdf';
   download.hidden=false;if(panel.open)download.focus();
   status.textContent=uk?'PDF готовий. Завантажте й перевірте перед надсиланням.':'PDF ready. Download and review before sending.';
  }catch{status.textContent=uk?'Не вдалося сформувати PDF. Перевірте з’єднання та повторіть.':'Could not generate the PDF. Check your connection and retry.';}
  finally{busy=false;generate.disabled=!eligible;}
 });
 window.addEventListener('storage',event=>{if(event.key===CART_KEY||event.key===null){restore();render();}});
 window.addEventListener('pageshow',event=>{if(event.persisted&&storageAvailable){restore();render();}});
 restore();render();
 document.querySelector<HTMLElement>('[data-cart-toolbar]')!.hidden=false;
}
