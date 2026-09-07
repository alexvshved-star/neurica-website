const photoUrls=import.meta.glob<string>('../assets/catalog/*.{jpg,jpeg,png}',{query:'?url',import:'default',eager:true});
export async function loadPhoto(filename:string,width=1400,height=640):Promise<string>{
 const url=photoUrls[`../assets/catalog/${filename}`];if(!url)throw new Error('Photo missing');
 const img=new Image();img.src=url;await img.decode();
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image conversion unavailable');
 const scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
 ctx.drawImage(img,(canvas.width-img.naturalWidth*scale)/2,(canvas.height-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
 return canvas.toDataURL('image/jpeg',.9);
}
