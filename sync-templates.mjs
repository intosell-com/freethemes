
import fs from 'node:fs';

const categories=JSON.parse(fs.readFileSync('categories.json','utf8'));
const files=[]; // S3 ListObjects keys are placed here

function detect(file){
 const name=file.split('/').pop().toLowerCase();
 if(!name.startsWith('index-') || !name.endsWith('.html')) return null;
 const slug=name.substring(6).split('-')[0].replace('.html','');
 return categories.find(c=>c.slug===slug);
}

const templates=files.map(file=>{
 const c=detect(file);
 if(!c)return null;
 return {
  file,
  url:'https://themes.freethemes.ir/'+file,
  category:c.slug,
  categoryName:c.name
 };
}).filter(Boolean);

fs.writeFileSync('templates.json',JSON.stringify({version:1,templates},null,2));
fs.writeFileSync('templates-cache.json',JSON.stringify({version:1,templates},null,2));
