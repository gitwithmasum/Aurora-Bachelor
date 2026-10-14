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
    const heading=el("div",undefined,"bazaar-heading");
    const title=el("div");title.append(el("h3","Bazaar Planner"),el("small","Weekly grocery command center","muted"));
    heading.append(title,btn("＋ New Bazaar",()=>editPlan()));holder.append(heading);
    const list=plans();
    const tabs=el("div",undefined,"bazaar-tabs");
    for(const entry of [...list].sort((a,b)=>String(b.date).localeCompare(String(a.date)))){
      const button=btn(entry.title+" · "+entry.date,()=>{selected=entry.id;draw();});
      if(selected===entry.id)button.classList.add("primary");
      tabs.append(button);
    }
    holder.append(tabs);
    const p=list.find(x=>x.id===selected)||list.at(-1);
    if(!p){
      holder.append(el("p","No bazaar plan yet. Select + New Bazaar to create a real shopping list.","weekly-empty"));
    } else {
      selected=p.id;
      const items=Array.isArray(p.items)?p.items:[];
      const expected=items.reduce((sum,item)=>sum+(Number(item.qty)||0)*(Number(item.price)||0),0);
      const purchased=items.filter(x=>x.purchased);
      const spent=purchased.reduce((sum,item)=>sum+(Number(item.qty)||0)*Number(item.actualPrice??item.price??0),0);
      const summary=el("div",undefined,"bazaar-summary");
      for(const [label,value,extra] of [["Estimated Cost",expected,""],["Budget Remaining",(Number(p.budget)||0)-expected,"remaining"]]){
        const card=el("div",undefined,"bazaar-summary-card");
        card.append(el("small",label),el("strong","৳"+value.toLocaleString("en-BD",{maximumFractionDigits:2}),extra));
        summary.append(card);
      }
      holder.append(summary);
      const controls=el("div",undefined,"bazaar-controls");
      const memberField=el("label","Assigned Member");
      const member=el("select");
      for(const option of [{id:"",name:"Unassigned"},...(db().members||[]).filter(x=>x.status!=="inactive")]){
        const op=el("option",option.name);op.value=option.id;op.selected=String(option.id)===String(p.memberId||"");member.append(op);
      }
      member.disabled=!allowed();
      member.addEventListener("change",()=>commit(list=>{const record=list.find(x=>x.id===p.id);if(record)record.memberId=member.value;}));
      memberField.append(member);
      const budgetField=el("label","Weekly Budget (৳)");
      const budget=el("input");budget.type="number";budget.min="0";budget.step="0.01";budget.value=String(p.budget??0);budget.disabled=!allowed();
      budget.addEventListener("change",()=>{const n=Number(budget.value);if(Number.isFinite(n)&&n>=0)commit(list=>{const record=list.find(x=>x.id===p.id);if(record)record.budget=n;});else draw();});
      budgetField.append(budget);controls.append(memberField,budgetField);holder.append(controls);
      const panel=el("div",undefined,"bazaar-checklist card");
      const header=el("div",undefined,"bazaar-heading");
      header.append(el("h4","Shopping Checklist"),el("span",purchased.length+"/"+items.length+" purchased","bazaar-count"));
      panel.append(header);
      const lines=el("div",undefined,"bazaar-checklist-items");
      for(const item of items){
        const row=el("div",undefined,"bazaar-check-row");
        const check=el("input");check.type="checkbox";check.checked=!!item.purchased;check.disabled=!allowed();
        check.setAttribute("aria-label","Purchased "+item.name);
        check.addEventListener("change",()=>commit(a=>{const x=a.find(x=>x.id===p.id)?.items.find(x=>x.id===item.id);if(x)x.purchased=check.checked;}));
        const detail=el("div",undefined,"bazaar-check-detail");
        detail.append(el("strong",item.name),el("small","৳"+item.price+" / "+item.unit));
        const qty=el("input");qty.type="number";qty.min="0.01";qty.step="any";qty.value=String(item.qty);qty.disabled=!allowed();qty.setAttribute("aria-label","Quantity for "+item.name);
        qty.addEventListener("change",()=>{const n=Number(qty.value);if(!Number.isFinite(n)||n<=0){draw();return;}commit(a=>{const x=a.find(x=>x.id===p.id)?.items.find(x=>x.id===item.id);if(x)x.qty=n;});});
        const subtotal=el("strong","৳"+(item.qty*item.price).toLocaleString("en-BD"),"bazaar-line-total");
        const deleteItem=btn("×",()=>{if(!allowed())return;commit(a=>{const x=a.find(x=>x.id===p.id);if(x)x.items=x.items.filter(i=>i.id!==item.id);});});
        deleteItem.disabled=!allowed();deleteItem.setAttribute("aria-label","Remove "+item.name);
        row.append(check,detail,qty,subtotal,deleteItem);
        lines.append(row);
      }
      if(!items.length)lines.append(el("p","Shopping list is empty. Add your first item.","weekly-empty"));
      panel.append(lines);
      const totals=el("div",undefined,"bazaar-total-row");
      totals.append(el("strong","Total Estimated"),el("strong","৳"+expected.toLocaleString("en-BD",{maximumFractionDigits:2})));
      panel.append(totals);
      panel.append(el("p","Purchased subtotal: ৳"+spent.toLocaleString("en-BD",{maximumFractionDigits:2})+". This planner does not post financial expenses automatically.","bazaar-footnote"));
      const actions=el("div",undefined,"bazaar-actions");
      const add=btn("＋ Add Item",()=>addItem(p.id));const edit=btn("Edit Plan",()=>editPlan(p.id));const del=btn("Delete Plan",()=>{if(allowed()&&confirm("Delete this shopping plan?")){commit(a=>{const i=a.findIndex(x=>x.id===p.id);if(i>=0)a.splice(i,1);});selected="";draw();}});
      for(const x of [add,edit,del])x.disabled=!allowed();
      actions.append(add,edit,del);panel.append(actions);
      holder.append(panel);
      if(expected>Number(p.budget||0))holder.append(el("p","Estimated cost exceeds the current budget.","weekly-notice"));
      if(!allowed())holder.append(el("p","Member access: view only.","weekly-notice"));
    }
    const editor=el("div",undefined,"bazaar-editor");editor.id="bazaarEditor";holder.append(editor);
  }
  const previous=window.renderWeeklyPlanner;
  window.renderWeeklyPlanner=function(){previous();const root=document.getElementById("page-weekly");if(!root)return;const section=el("section",undefined,"bazaar-planner");section.id="bazaarPlanner";root.append(section);draw();};
  window.AuroraBazaarPlanner={draw,editPlan,addItem};
})();