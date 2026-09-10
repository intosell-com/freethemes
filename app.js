const DATA={categories:[],demos:[],category:null,filter:"all"};
const categoryGrid=document.getElementById("categoryGrid"), archiveGrid=document.getElementById("archiveGrid");
const search=document.getElementById("search"), archiveTitle=document.getElementById("archiveTitle"), resultInfo=document.getElementById("resultInfo");

async function getJSON(file){const r=await fetch(file,{cache:"no-cache"});if(!r.ok)throw new Error(file+" "+r.status);return r.json()}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function flatten(list,out=[]){for(const n of list||[]){out.push(n);flatten(n.children,out)}return out}
function find(id,list=DATA.categories){for(const n of list){if(n.id===id)return n;const f=find(id,n.children||[]);if(f)return f}return null}
function count(id){return DATA.demos.filter(d=>d.category===id||d.subcategory===id).length}
function text(n){return [n.title,n.description,n.id,...(n.tags||[])].filter(Boolean).join(" ").toLowerCase()}
function query(){return search.value.trim().toLowerCase()}

function renderCategories(){
  let cats=query()?flatten(DATA.categories).filter(n=>text(n).includes(query())):DATA.categories;
  categoryGrid.innerHTML=cats.length?cats.map(n=>`<article class="category" tabindex="0" role="button" data-category="${esc(n.id)}"><div class="cat-icon">${esc(n.icon||"◈")}</div><h3>${esc(n.title||n.id)}</h3><p>${esc(n.description||"قالب‌های مرتبط را مشاهده کنید.")}</p><div class="cat-count">${count(n.id).toLocaleString("fa-IR")} قالب</div></article>`).join(""):'<div class="state">دسته‌ای پیدا نشد.</div>';
  categoryGrid.querySelectorAll("[data-category]").forEach(el=>{const go=()=>selectCategory(el.dataset.category);el.onclick=go;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")go()}});
  document.getElementById("categoryCount").textContent=DATA.categories.length.toLocaleString("fa-IR");
}
function selectCategory(id){DATA.category=id;const n=find(id);archiveTitle.textContent=n?`قالب‌های ${n.title}`:"همه قالب‌ها";document.getElementById("archive").scrollIntoView({behavior:"smooth",block:"start"});renderArchive()}
function allDemos(){
  let ds=[...DATA.demos];
  if(DATA.category)ds=ds.filter(d=>d.category===DATA.category||d.subcategory===DATA.category);
  const q=query();if(q)ds=ds.filter(d=>[d.title,d.description,d.category,d.subcategory,...(d.tags||[])].filter(Boolean).join(" ").toLowerCase().includes(q));
  if(DATA.filter==="newest")ds.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  if(DATA.filter==="popular")ds.sort((a,b)=>(Number(b.views)||0)-(Number(a.views)||0));
  return ds;
}
function renderArchive(){
  const ds=allDemos();resultInfo.textContent=`${ds.length.toLocaleString("fa-IR")} قالب`;
  archiveGrid.innerHTML=ds.length?ds.map(d=>{
    const image=d.image?`<img src="${esc(d.image)}" alt="${esc(d.title||"پیش‌نمایش قالب")}" loading="lazy" onerror="this.parentElement.textContent='پیش‌نمایش قالب'">`:"پیش‌نمایش قالب";
    const tags=(d.tags||[]).slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    return `<article class="template"><div class="preview">${image}</div><div class="template-body"><h3>${esc(d.title||"قالب HTML رایگان")}</h3><p>${esc(d.description||"قالب سایت آماده و رایگان.")}</p><div class="meta">${tags}</div>${d.url?`<a class="view" href="${esc(d.url)}" target="_blank" rel="noopener">مشاهده قالب</a>`:""}</div></article>`;
  }).join(""):'<div class="state">قالبی مطابق جست‌وجو پیدا نشد.</div>';
}
function updateURL(){const q=query();const u=new URL(location.href);if(q)u.searchParams.set("q",q);else u.searchParams.delete("q");history.replaceState(null,"",u)}
document.getElementById("searchForm").addEventListener("submit",e=>e.preventDefault());
search.oninput=()=>{updateURL();renderCategories();renderArchive()};
document.getElementById("showAll").onclick=()=>{DATA.category=null;archiveTitle.textContent="همه قالب‌های رایگان";renderArchive();document.getElementById("archive").scrollIntoView({behavior:"smooth"})};
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");DATA.filter=b.dataset.filter;renderArchive()});

const initialQ=new URLSearchParams(location.search).get("q");if(initialQ)search.value=initialQ;
Promise.all([getJSON("categories.json"),getJSON("demos.json")]).then(([c,d])=>{
 DATA.categories=Array.isArray(c.categories)?c.categories:[];DATA.demos=Array.isArray(d.demos)?d.demos:[];
 document.getElementById("templateCount").textContent=DATA.demos.length.toLocaleString("fa-IR");
 renderCategories();renderArchive();
}).catch(err=>{
 console.error(err);categoryGrid.innerHTML='<div class="state">خطا در خواندن categories.json یا demos.json. فایل‌ها باید در ریشه Repository باشند.</div>';archiveGrid.innerHTML="";
});
