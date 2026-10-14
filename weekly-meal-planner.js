/* Aurora Bachelor — Weekly Meal Planner / Phase 3
   Menu planning only: NEVER modifies real meals, balances or expenses. */
(() => {
"use strict";
let weekShift=0, chosen=0, editing=true;
const names=["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
const defaults=[
 ["মুরগি + ভাত + ডাল","শাক + ডাল + আলুভর্তা + ভাত"],
 ["মাছ + ভাত + ডাল","সবজি খিচুড়ি + ডিম"],
 ["মুরগি + ভাত + ডাল","মিষ্টি কুমড়া ভাজি + পটল + ডাল + ভাত"],
 ["ডাল + ভাত + মাছ","ডিম তরকারি + ডাল + ভাত"],
 ["আলু ভাজি + ডাল + ভাত","ডিম + ডাল + ভাত"],
 ["মাছ + ভাত + ডাল","বেগুন-পটল ভাজি + ডাল + ভাত"],
 ["মুরগি + ভাত + ডাল","খিচুড়ি + বেগুন-পটল ভাজি"]
];
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
const button=(name,click)=>{const b=node("button",name,"btn");b.type="button";b.addEventListener("click",click);return b;};
const data=()=>AuroraDataStore.get();
function store(){
 const db=data();if(!db)return {};
 if(!db.weeklyPlanner||typeof db.weeklyPlanner!=="object")db.weeklyPlanner={tasks:[]};
 if(!db.weeklyPlanner.mealMenus||typeof db.weeklyPlanner.mealMenus!=="object"||Array.isArray(db.weeklyPlanner.mealMenus))db.weeklyPlanner.mealMenus={};
 return db.weeklyPlanner.mealMenus;
}
function writable(){const status=window.AuroraCloudSync?.status?.();return !(status?.ready===true&&status.canWrite===false);}
function start(){
 const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+1)%7)+weekShift*7);return d;
}
function key(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function week(){const d=start();return {id:key(d),days:names.map((name,i)=>{const date=new Date(d);date.setDate(d.getDate()+i);return {name,date:key(date),label:date.toLocaleDateString("en-GB",{day:"numeric",month:"short"})};})};}
function empty(){return names.map((_,i)=>({day:defaults[i][0],night:defaults[i][1],cost:null}));}
function current(){const w=week();return {week:w,entries:store()[w.id]||empty(),saved:Boolean(store()[w.id])};}
function persist(fn){
 if(!writable())return false;
 const db=data(),backup=JSON.stringify(db.weeklyPlanner||{tasks:[]});
 const w=week(),old=store()[w.id];
 const next=old?old.map(v=>({...v})):empty();
 fn(next);
 store()[w.id]=next;
 if(!AuroraDataStore.save()){db.weeklyPlanner=JSON.parse(backup);render();return false;}
 render();return true;
}
function change(index,field,value){
 if(field==="cost"){if(value!==""){const n=Number(value);if(!Number.isFinite(n)||n<0)return;}value=value===""?null:Number(value);}
 else value=String(value).slice(0,500);
 persist(entries=>{entries[index][field]=value;});
}
function render(){
 const host=document.getElementById("weeklyMealPlanner");if(!host)return;host.replaceChildren();
 const {week:w,entries,saved}=current();
 const heading=node("div",undefined,"meal-plan-header");
 const left=node("div");left.append(node("small","AURORA / WEEKLY PLANNER","meal-plan-kicker"),node("h3","Weekly Meal Planner"),node("p","7 days · Day & Night menu","muted"));
 heading.append(left);host.append(heading);
 const actions=node("div",undefined,"meal-plan-actions");
 actions.append(button("← Previous",()=>{weekShift--;chosen=0;render();}),node("strong",w.days[0].label+" — "+w.days[6].label),button("Next →",()=>{weekShift++;chosen=0;render();}),button("This Week",()=>{weekShift=0;chosen=0;render();}));
 host.append(actions);
 const counts=node("div",undefined,"meal-plan-summary");
 const total=entries.reduce((n,v)=>n+(Number(v.cost)||0),0);
 for(const [title,value] of [["DAYS","07"],["MEAL SLOTS","14"],["EST. COST","৳"+total.toLocaleString("en-BD")]]){
  const box=node("div",undefined,"meal-plan-stat");box.append(node("small",title),node("strong",value));counts.append(box);
 }host.append(counts);
 const topline=node("div",undefined,"meal-plan-header");
 topline.append(node("h4","Weekly Menu"));
 const toggle=button(editing?"Preview":"Edit",()=>{editing=!editing;render();});topline.append(toggle);host.append(topline);
 const pills=node("div",undefined,"meal-plan-days");
 w.days.forEach((day,i)=>{const b=button(day.name.slice(0,3).toUpperCase(),()=>{chosen=i;render();});if(i===chosen)b.classList.add("selected");pills.append(b);});host.append(pills);
 const card=node("div",undefined,"meal-plan-edit card");card.append(node("h4",w.days[chosen].name+" · "+w.days[chosen].date));
 for(const [field,label] of [["day","☀ Day Meal"],["night","☾ Night Meal"]]){
  const wrap=node("label",label);
  if(editing && writable()){
   const input=node("textarea");input.rows=2;input.maxLength=500;input.value=entries[chosen][field]||"";
   input.addEventListener("change",()=>change(chosen,field,input.value));wrap.append(input);
  }else wrap.append(node("div",entries[chosen][field]||"Not planned","meal-plan-preview"));
  card.append(wrap);
 }
 const costwrap=node("label","Estimated food cost (optional)");
 const cost=node("input");cost.type="number";cost.min="0";cost.step="0.01";cost.placeholder="৳ 0";cost.value=entries[chosen].cost??"";cost.disabled=!writable();cost.addEventListener("change",()=>change(chosen,"cost",cost.value));costwrap.append(cost);card.append(costwrap);host.append(card);
 host.append(node("h4","Full Week Overview"));
 const overview=node("div",undefined,"meal-plan-overview");
 w.days.forEach((day,i)=>{
   const b=node("button",undefined,"meal-plan-row"+(chosen===i?" active":""));b.type="button";b.addEventListener("click",()=>{chosen=i;render();});
   b.append(node("strong",day.name),node("span","DAY · "+(entries[i].day||"Not planned")),node("span","NIGHT · "+(entries[i].night||"Not planned")));overview.append(b);
 });host.append(overview);
 const bottom=node("div",undefined,"meal-plan-actions");
 bottom.append(button("Copy Weekly Menu",()=>{
   const text=w.days.map((d,i)=>d.name+"\nDay: "+entries[i].day+"\nNight: "+entries[i].night).join("\n\n");
   if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text);
 }));
 if(writable())bottom.append(button("Copy Previous Week",()=>{
   if(!confirm("Replace this week's menu with the previous week's menu?"))return;
   const d=start();d.setDate(d.getDate()-7);const previous=store()[key(d)];if(!previous){alert("No saved menu exists for the previous week.");return;}
   persist(entries=>previous.forEach((m,i)=>{if(i<entries.length)entries[i]={...m};}));
 }));
 host.append(bottom);
 host.append(node("p",saved?"Saved household menu · Changes use the existing household save flow.":"Sample menu preview · Edit any entry to save this week's menu.","meal-plan-footnote"));
 if(!writable())host.append(node("p","Member access: view only.","weekly-notice"));
}
const previous=window.renderWeeklyPlanner;
window.renderWeeklyPlanner=function(){previous();const root=document.getElementById("page-weekly");if(!root)return;const section=node("section",undefined,"weekly-meal-planner");section.id="weeklyMealPlanner";root.append(section);render();};
window.AuroraWeeklyMealPlanner={render,week};
})();