import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfFile,canSharePdf,sharePdf} from '../../src/catalog/pdf-file.mjs';
test('PDF sharing passes a named file with its original bytes and no URL',async()=>{
 const file=pdfFile(new Blob(['%PDF-1.7\nexample']),'ALTACO_Test.pdf');
 assert.equal(file.name,'ALTACO_Test.pdf');assert.equal(file.type,'application/pdf');
 assert.equal(await file.text(),'%PDF-1.7\nexample');
 let payload;
 const nav={canShare:data=>data.files[0]===file,share:async data=>{payload=data;}};
 assert.equal(canSharePdf(file,nav),true);await sharePdf(file,nav);
 assert.deepEqual(Object.keys(payload),['files']);assert.equal(payload.files[0],file);
});
test('unsupported or policy-blocked file sharing falls back to download',()=>{
 const file=pdfFile(new Blob(['pdf']),'test.pdf');
 for(const nav of [{},{share(){}},{share(){},canShare:()=>false},{share(){},canShare(){throw Error('blocked');}}])
  assert.equal(canSharePdf(file,nav),false);
});
