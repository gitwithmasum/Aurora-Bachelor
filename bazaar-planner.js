/* Aurora Bachelor — Weekly Planner Phase 2 / Bazaar Planner
   Shopping plans are not accounting entries. No automatic expense posting. */
(() => {
  "use strict";
  let selected="";
  const today=()=>new Date().toISOString().slice(0,10);
  const db=()=>AuroraDataStore.get();
  const plans=()=>{
    const root=db();
    if(!root.weeklyPlanner||typeof root.weeklyPlanner!=="object")root.weeklyPlanner={tasks:[]};
    if(!Array.isArray(root.weeklyPlanner.bazaars))root.weeklyPlanner.bazaars=[];
    return root.weeklyPlanner.bazaars;
  };
  const allowed=()=>{const x=window.AuroraCloudSync?.status?.();return !(x?.ready===true&&x.canWrite===false);};
  const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);if(cls)n.className=cls;return n;};
  const btn=(txt,fn)=>{const b=el("button",txt,"btn");b.type="button";b.addEventListener("click",fn);return b;};
  function commit(fn){
    if(!allowed())return false;
    const before=JSON.stringify(db().weeklyPlanner||{tasks:[]});
    fn(plans());
    if(!AuroraDataStore.save()){db().weeklyPlanner=JSON.parse(before);draw();return false;}
    draw();return true;
  }
  function formField(form,label,name,value="",type="text"){
    const l=el("label",label);const x=el(type==="textarea"?"textarea":"input");
    if(type!=="textarea")x.type=type;x.name=name;x.value=value;l.append(x);form.append(l);return x;
  }
  function personSelector(form,value){
    const l=el("label","Assigned member");const s=el("select");s.name="memberId";
    const members=(db().members||[]).filter(x=>x.status!=="inactive");
    for(const m of [{id:"",name:"Unassigned"},...members]){
      const o=el("option",m.name);o.value=m.id;o.selected=String(m.id)===String(value||"");s.append(o);
    }
    l.append(s);form.append(l);return s;
  }
  function editPlan(id){
    if(!allowed())return;
    const plan=plans().find(x=>x.id===id)||{};
    const host=document.getElementById("bazaarEditor");if(!host)return;
    host.replaceChildren();const form=el("form",undefined,"bazaar-form card");
    form.append(el("h3",id?"Edit Bazaar Plan":"New Bazaar Plan"));
    formField(form,"Bazaar title","title",plan.title||"Weekly Bazaar").required=true;
    formField(form,"Shopping date","date",plan.date||today(),"date").required=true;
    personSelector(form,plan.memberId);
    formField(form,"Budget (৳)","budget",String(plan.budget??""),"number").min="0";
    formField(form,"Notes","notes",plan.notes||"","textarea");
    const actions=el("div",undefined,"bazaar-actions");
    actions.append(btn("Cancel",()=>host.replaceChildren()));
    const save=el("button","Save Bazaar Plan","btn primary");save.type="submit";actions.append(save);form.append(actions);
    form.addEventListener("submit",ev=>{
      ev.preventDefault();const f=new FormData(form);
      const title=String(f.get("title")||"").trim().slice(0,120);
      const date=String(f.get("date")||"");
      const budget=Number(f.get("budget")||0);
      if(!title||!(/^\d{4}-\d{2}-\d{2}$/.test(date))||!Number.isFinite(budget)||budget<0)return;
      const memberId=String(f.get("memberId")||"");
      const members=db().members||[];
      const next={id:id||uid("bz"),title,date,budget,memberId:members.some(m=>String(m.id)===memberId)?memberId:"",notes:String(f.get("notes")||"").slice(0,500),items:plan.items||[],updatedAt:new Date().toISOString()};
      commit(list=>{const index=list.findIndex(x=>x.id===id);if(index===-1)list.push(next);else list[index]={...list[index],...next};});selected=next.id;draw();
    });
    host.append(form);form.querySelector('[name="title"]').focus();
  }
  function addItem(id){
    if(!allowed())return;
    const host=document.getElementById("bazaarEditor");host.replaceChildren();
    const form=el("form",undefined,"bazaar-form card");form.append(el("h3","Add Shopping Item"));
    formField(form,"Item name","name").required=true;
    formField(form,"Quantity","qty","1","number").min="0.01";
    formField(form,"Unit (kg, pcs, L, etc.)","unit","kg").required=true;
    formField(form,"Estimated unit price (৳)","price","0","number").min="0";
    const actions=el("div",undefined,"bazaar-actions");actions.append(btn("Cancel",()=>host.replaceChildren()));
    const save=el("button","Add Item","btn primary");save.type="submit";actions.append(save);form.append(actions);
    form.addEventListener("submit",ev=>{
      ev.preventDefault();const f=new FormData(form),name=String(f.get("name")||"").trim().slice(0,100),qty=Number(f.get("qty")),price=Number(f.get("price")),unit=String(f.get("unit")||"").trim().slice(0,20);
      if(!name||!unit||!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<0)return;
      commit(list=>{const p=list.find(x=>x.id===id);if(p)p.items.push({id:uid("bi"),name,qty,unit,price,purchased:false,actualPrice:null});});
    });host.append(form);
  }
  function draw(){
    const holder=document.getElementById("bazaarPlanner");if(!holder)return;
    holder.replaceChildren();
    const heading=el("div",undefined,"bazaar-heading");heading.append(el("h3","Bazaar Planner"),btn("＋ New Bazaar",()=>editPlan()));holder.append(heading);
    holder.append(el("p","Shopping plans and checklists are separate from Meal Expenses and House Bills.","muted"));
    if(!allowed())holder.append(el("p","View-only household member access.","weekly-notice"));
    const list=plans();if(!list.length){holder.append(el("p","No bazaar plans yet. Create one to start your shopping list.","muted"));holder.append(el("div",undefined,"bazaar-editor").cloneNode());}
    const tabs=el("div",undefined,"bazaar-tabs");
    for(const p of [...list].sort((a,b)=>String(b.date).localeCompare(String(a.date)))){
      const b=btn(p.title+" · "+p.date,()=>{selected=p.id;draw();});if(selected===p.id)b.classList.add("primary");tabs.append(b);
    }holder.append(tabs);
    let p=list.find(x=>x.id===selected)||list.at(-1);
    if(p){selected=p.id;
      const card=el("div",undefined,"card bazaar-detail");
      const head=el("div",undefined,"bazaar-heading");head.append(el("h3",p.title));
      const person=(db().members||[]).find(m=>String(m.id)===String(p.memberId))?.name||"Unassigned";
      head.append(el("span",p.date+" · "+person));card.append(head);
      const expected=(p.items||[]).reduce((n,x)=>n+x.qty*x.price,0);
      const actual=(p.items||[]).filter(x=>x.purchased).reduce((n,x)=>n+x.qty*(x.actualPrice??x.price),0);
      card.append(el("p","Budget ৳"+p.budget.toFixed(2)+" · Estimate ৳"+expected.toFixed(2)+" · Purchased subtotal ৳"+actual.toFixed(2),"bazaar-totals"));
      if(expected>p.budget)card.append(el("p","Estimated amount exceeds budget.","weekly-notice"));
      const actions=el("div",undefined,"bazaar-actions");
      actions.append(btn("＋ Add Item",()=>addItem(p.id)),btn("Edit Plan",()=>editPlan(p.id)));
      const del=btn("Delete Plan",()=>{if(allowed()&&confirm("Delete this shopping plan?")){commit(a=>{const i=a.findIndex(x=>x.id===p.id);if(i>=0)a.splice(i,1);});selected="";draw();}});
      actions.append(del);card.append(actions);
      if(!allowed())actions.querySelectorAll("button").forEach(b=>b.disabled=true);
      const table=el("div",undefined,"bazaar-items");
      for(const item of p.items||[]){
        const row=el("div",undefined,"bazaar-item");
        const check=el("input");check.type="checkbox";check.checked=!!item.purchased;check.disabled=!allowed();check.addEventListener("change",()=>commit(a=>{const i=a.find(x=>x.id===p.id)?.items.find(x=>x.id===item.id);if(i)i.purchased=check.checked;}));row.append(check);
        row.append(el("span",item.name+" · "+item.qty+" "+item.unit+" · ৳"+(item.qty*item.price).toFixed(2)));
        const price=el("input");price.type="number";price.min="0";price.step="0.01";price.placeholder="Actual unit ৳";price.value=item.actualPrice??"";price.disabled=!allowed();price.setAttribute("aria-label","Actual unit price for "+item.name);
        price.addEventListener("change",()=>{const n=price.value===""?null:Number(price.value);if(n!==null&&(!Number.isFinite(n)||n<0)){draw();return;}commit(a=>{const i=a.find(x=>x.id===p.id)?.items.find(x=>x.id===item.id);if(i)i.actualPrice=n;});});row.append(price);
        const remove=btn("×",()=>commit(a=>{const items=a.find(x=>x.id===p.id)?.items;const i=items?.findIndex(x=>x.id===item.id);if(i>=0)items.splice(i,1);}));remove.disabled=!allowed();row.append(remove);table.append(row);
      }
      card.append(table);holder.append(card);
    }
    const editor=el("div",undefined,"bazaar-editor");editor.id="bazaarEditor";holder.append(editor);
  }
  const previous=window.renderWeeklyPlanner;
  window.renderWeeklyPlanner=function(){previous();const root=document.getElementById("page-weekly");if(!root)return;const section=el("section",undefined,"bazaar-planner");section.id="bazaarPlanner";root.append(section);draw();};
  window.AuroraBazaarPlanner={draw,editPlan,addItem};
})();