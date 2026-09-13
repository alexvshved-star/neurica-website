import {pdfFile,canSharePdf,sharePdf} from './pdf-file.mjs';
export function bindPdfActions(root:HTMLElement,uk:boolean) {
 const preview=root.querySelector<HTMLAnchorElement>('[data-pdf-preview]')!;
 const download=root.querySelector<HTMLAnchorElement>('[data-pdf-download]')!;
 const share=root.querySelector<HTMLButtonElement>('[data-pdf-share]')!;
 const status=root.querySelector<HTMLElement>('[data-pdf-status]')!;
 let file:File|null=null,url:string|null=null,sharing=false;
 function clear(){
  file=null;root.hidden=true;preview.removeAttribute('href');download.removeAttribute('href');status.textContent='';
  if(url){URL.revokeObjectURL(url);url=null;}
 }
 share.addEventListener('click',async()=>{
  if(!file||sharing)return;
  const sent=file;sharing=true;share.disabled=true;status.textContent='';
  try{
   // Called immediately from the user's click, after PDF generation is complete.
   await sharePdf(sent,navigator);
   if(sent===file)status.textContent=uk?'PDF передано меню поширення.':'PDF passed to the sharing menu.';
  }catch(error){
   if(sent===file && !(error instanceof Error&&error.name==='AbortError'))
    status.textContent=uk?'Не вдалося поширити файл. Завантажте PDF і прикріпіть його до повідомлення.':'Could not share the file. Download the PDF and attach it to your message.';
  }finally{sharing=false;share.disabled=false;}
 });
 return {clear,set(blob:Blob,filename:string){
  clear();file=pdfFile(blob,filename);url=URL.createObjectURL(file);
  preview.href=url;download.href=url;download.download=filename;
  root.querySelector('[data-pdf-filename]')!.textContent=filename;
  share.hidden=!canSharePdf(file,navigator);
  root.querySelector('[data-pdf-help]')!.textContent=share.hidden?
   (uk?'Збережіть PDF на пристрій і прикріпіть файл до повідомлення. Якщо відкрився перегляд PDF, скористайтеся меню збереження браузера.':'Save the PDF to your device and attach the file to a message. If a PDF preview opens, use the browser’s save menu.'):
   (uk?'«Поділитися PDF» передає файл у вибраний застосунок.':'“Share PDF” sends the file to the app you choose.');
  root.hidden=false;
 }};
}
