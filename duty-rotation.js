/* Aurora Bachelor / Phase 4 — Duty Rotation.
   Deterministic weekly scheduling; never changes member/financial data. */
(() => {
"use strict";
const types=["Cooking","Cleaning","Bazaar"];
const mk=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
const btn=(label,fn)=>{const n=mk("button",label,"btn");n.type="button";n.addEventListener("click",fn);return n;};
const db=()=>AuroraDataStore.get();
function state(){
 const d=db();if(!d.weeklyPlanner||typeof d.weeklyPlanner!=="object")d.weeklyPlanner={tasks:[]};
 if(!d.weeklyPlanner.rotation||typeof d.weeklyPlanner.rotation!=="object")d.weeklyPlanner.rotation={enabled:false,members:[],startDate:"",offsets:{Cooking:0,Cleaning:1,Bazaar:2},overrides:{}};
 const r=d.weeklyPlanner.rotation;
 if(!Array.isArray(r.members))r.members=[];
 if(!r.offsets||typeof r.offsets!=="object")r.offsets={Cooking:0,Cleaning:1,Bazaar:2};
 if(!r.overrides||typeof r.overrides!=="object")r.overrides={};
 return r;
}
const writable=()=>{const s=window.AuroraCloudSync?.status?.();return !(s?.ready===true&&s?.canWrite===false);};
const active=()=>((db()?.members)||[]).filter(m=>m.status!=="inactive"&&m.id);
function saturday(date){
 const d=new Date(date+"T12:00:00");if(Number.isNaN(d.getTime()))return null;
 d.setDate(d.getDate()-((d.getDay()+1)%7));
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function dateAdd(key,n){const d=new Date(key+"T12:00:00");d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function weekIndex(anchor,target){return Math.round((new Date(target+"T12:00:00")-new Date(anchor+"T12:00:00"))/604800000);}
function getAssignment(type,weekKey){
 const r=state();if(!r.enabled)return null;
 const roster=r.members.filter(id=>active().some(m=>String(m.id)===String(id)));
 if(!roster.length)return null;
 const forced=r.overrides[weekKey]?.[type];
 if(forced!==undefined&&roster.some(id=>String(id)===String(forced)))return forced;
 const anchor=saturday(r.startDate)||weekKey;
 const shift=weekIndex(anchor,weekKey);
 const offset=Number(r.offsets[type]||0);
 return roster[((shift+offset)%roster.length+roster.length)%roster.length];
}
function commit(fn){
 if(!writable())return false;
 const d=db(),before=JSON.stringify(d.weeklyPlanner||{tasks:[]});
 fn(state());
 if(!AuroraDataStore.save()){d.weeklyPlanner=JSON.parse(before);draw();return false;}
 draw();return true;
}
function draw(){
 const host=document.getElementById("weeklyDutyRotation");if(!host)return;host.replaceChildren();
 const r=state(),members=active(),week=window.AuroraWeeklyMealPlanner?.week?.();
 const thisWeek=week?.id||saturday(new Date().toISOString().slice(0,10));
 const head=mk("div",undefined,"duty-heading");head.append(mk("h3","Duty Rotation"),mk("small","Cooking · Cleaning · Bazaar","muted"));host.append(head);
 host.append(mk("p","Assign one rotating member to each weekly duty. The schedule is independent of meal counts, bills and expenses.","muted"));
 if(!writable())host.append(mk("p","Member access: view only.","weekly-notice"));
 const config=mk("div",undefined,"duty-config card");
 const toggle=mk("label",undefined,"duty-toggle");
 const check=mk("input");check.type="checkbox";check.checked=!!r.enabled;check.disabled=!writable();
 check.addEventListener("change",()=>commit(s=>{s.enabled=check.checked;if(check.checked&&!s.startDate)s.startDate=thisWeek;}));
 toggle.append(check,mk("span","Enable automatic weekly rotation"));config.append(toggle);
 const sub=mk("div",undefined,"duty-members");
 sub.append(mk("strong","Members in rotation (in order)"));
 const roster=mk("div",undefined,"duty-roster");
 for(const m of members){
   const label=mk("label",undefined,"duty-member");
   const input=mk("input");input.type="checkbox";input.checked=r.members.some(id=>String(id)===String(m.id));input.disabled=!writable();
   input.addEventListener("change",()=>commit(s=>{
     s.members=s.members.filter(id=>String(id)!==String(m.id));
     if(input.checked)s.members.push(m.id);
   }));
   label.append(input,mk("span",m.name));roster.append(label);
 }
 sub.append(roster);config.append(sub);
 const start=mk("label","Rotation starts from Saturday");
 const input=mk("input");input.type="date";input.value=r.startDate||thisWeek;input.disabled=!writable();
 input.addEventListener("change",()=>{const d=saturday(input.value);if(d)commit(s=>{s.startDate=d;});else draw();});
 start.append(input);config.append(start);host.append(config);
 const weeks=mk("div",undefined,"duty-weeks");
 for(let wi=0;wi<4;wi++){
   const key=dateAdd(thisWeek,wi*7);
   const card=mk("div",undefined,"duty-week card");
   card.append(mk("h4",(wi===0?"This Week":"Week "+(wi+1))+" · "+key));
   for(const type of types){
     const row=mk("div",undefined,"duty-row");
     row.append(mk("strong",type));
     const select=mk("select");select.disabled=!writable()||!r.enabled||!r.members.length;
     const automatic=getAssignment(type,key);
     for(const option of [{id:"",name:"Automatic: "+(members.find(m=>String(m.id)===String(automatic))?.name||"Unassigned")},...members.filter(m=>r.members.some(id=>String(id)===String(m.id)))]){
       const opt=mk("option",option.name);opt.value=option.id;opt.selected=String(r.overrides[key]?.[type]||"")===String(option.id);select.append(opt);
     }
     select.setAttribute("aria-label",type+" assignee, week "+key);
     select.addEventListener("change",()=>commit(s=>{
       if(!s.overrides[key])s.overrides[key]={};
       if(select.value)s.overrides[key][type]=select.value;else delete s.overrides[key][type];
       if(!Object.keys(s.overrides[key]).length)delete s.overrides[key];
     }));
     row.append(select);card.append(row);
   }
   weeks.append(card);
 }
 host.append(weeks);
 host.append(mk("p","Assignments update when the member roster or starting week changes. Manual overrides stay saved per week. Rotation does not create accounting entries.","duty-note"));
}
const original=window.renderWeeklyPlanner;
window.renderWeeklyPlanner=function(){
 original();
 const root=document.getElementById("page-weekly");if(!root)return;
 const section=mk("section",undefined,"weekly-duty-rotation");section.id="weeklyDutyRotation";root.append(section);draw();
};
window.AuroraDutyRotation={draw,getAssignment,saturday,weekIndex};
})();