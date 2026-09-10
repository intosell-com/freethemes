const state={categories:[],demos:[],path:[]};
const content=document.getElementById("content"), breadcrumb=document.getElementById("breadcrumb");
const back=document.getElementById("back"), search=document.getElementById("search");

async function getJSON(file){
  const r=await fetch(file,{cache:"no-cache"});
  if(!r.ok) throw new Error(file+" "+r.status);
  return r.json();
}
function kids(n){return Array.isArray(n?.children)?n.children:[]}
function findNode(id,list=state.categories){
  for(const n of list){
    if(n.id===id)return n;
    const f=findNode(id,kids(n)); if(f)return f;
  }
  return null;
}
function current(){return state.path.length?findNode(state.path.at(-1)):null}
function allText(n){return [n.id,n.title,n.description].filter(Boolean).join(" ").toLowerCase()}
function matching(items){
  const q=search.value.trim().toLowerCase(); if(!q)return items;
  return items.filter(n=>allText(n).includes(q));
}
function demoCount(id){return state.demos.filter(d=>d.category===id||d.subcategory===id).length}

function renderBreadcrumb(){
  const parts=[{id:"",title:"همه دسته‌ها"}];
  for(const id of state.path){const n=findNode(id);if(n)parts.push({id:n.id,title:n.title})}
  breadcrumb.innerHTML=parts.map((p,i)=>`<span class="crumb ${i===parts.length-1?"current":""}" data-id="${esc(p.id)}">${esc(p.title)}</span>${i<parts.length-1?'<span class="sep">/</span>':""}`).join("");
  breadcrumb.querySelectorAll(".crumb").forEach(el=>el.onclick=()=>{
    const id=el.dataset.id;
    if(!id)state.path=[];else state.path=state.path.slice(0,state.path.indexOf(id)+1);
    render();
  });
  back.style.display=state.path.length?"block":"none";
}
function card(n){
  const childCount=kids(n).length, count=demoCount(n.id);
  return `<article class="card" data-id="${esc(n.id)}"><div class="icon">${esc(n.icon||"◈")}</div><h3>${esc(n.title||n.id)}</h3><p>${esc(n.description||"مشاهده زیر‌دسته‌ها و قالب‌های مرتبط")}</p><div class="count">${count?count+" قالب":childCount+" زیر‌دسته"}</div></article>`;
}
function demoCard(d){
  const image=d.image?`<img src="${esc(d.image)}" alt="${esc(d.title||"")}" loading="lazy" onerror="this.parentElement.innerHTML='پیش‌نمایش قالب'">`:"پیش‌نمایش قالب";
  return `<article class="demo"><div class="preview">${image}</div><div class="demo-body"><h3>${esc(d.title||"قالب")}</h3><p>${esc(d.description||"")}</p>${d.url?`<a class="btn primary" href="${safe(d.url)}" target="_blank" rel="noopener">مشاهده قالب</a>`:""}</div></article>`;
}
function render(){
  renderBreadcrumb();
  const n=current(), items=matching(n?kids(n):state.categories);
  let html=`<div class="grid">${items.length?items.map(card).join(""):'<div class="state">موردی پیدا نشد.</div>'}</div>`;
  if(n){
    const ds=state.demos.filter(d=>d.category===n.id||d.subcategory===n.id);
    if(ds.length)html+=`<section><h2 class="section-title">قالب‌های ${esc(n.title)}</h2><div class="demo-grid">${ds.map(demoCard).join("")}</div></section>`;
  }
  content.innerHTML=html;
  content.querySelectorAll("[data-id]").forEach(el=>el.onclick=()=>{state.path.push(el.dataset.id);search.value="";render()});
}
function safe(v){return /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(v)?v:"#"}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
back.onclick=()=>{state.path.pop();render()}; search.oninput=render;

Promise.all([getJSON("categories.json"),getJSON("demos.json")])
.then(([c,d])=>{state.categories=Array.isArray(c.categories)?c.categories:[];state.demos=Array.isArray(d.demos)?d.demos:[];render()})
.catch(err=>{console.error(err);content.innerHTML='<div class="state">خطا در خواندن فایل‌های JSON. مطمئن شوید categories.json و demos.json در ریشه مخزن قرار دارند.</div>'});
