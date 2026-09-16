export function pdfFile(blob,filename) {
 return new File([blob],filename,{type:'application/pdf'});
}
export function canSharePdf(file,nav) {
 try { return typeof nav.share==='function' && typeof nav.canShare==='function' && nav.canShare({files:[file]}); }
 catch { return false; }
}
export function sharePdf(file,nav) {
 // Files only: never attach the page URL or a temporary blob URL.
 return nav.share({files:[file]});
}
