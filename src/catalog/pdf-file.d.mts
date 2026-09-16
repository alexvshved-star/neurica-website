export function pdfFile(blob:Blob,filename:string):File;
export function canSharePdf(file:File,nav:Navigator):boolean;
export function sharePdf(file:File,nav:Navigator):Promise<void>;
