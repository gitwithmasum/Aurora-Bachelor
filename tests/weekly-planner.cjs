const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=name=>fs.readFileSync(path.join(root,name),"utf8");
const html=load("index.html"),sw=load("sw.js"),core=load("script.js");
for(const file of ["script.js","bazaar-planner.js","weekly-meal-planner.js","duty-rotation.js"]){
  assert.doesNotThrow(()=>new vm.Script(load(file),{filename:file}),file+" parses");
}
for(const asset of ["bazaar-planner.js","weekly-meal-planner.js","duty-rotation.js"]){
  assert.match(html,new RegExp(asset.replace(".","\\.")),"module is loaded");
  assert.ok(sw.includes('"./'+asset+'"'),"PWA caches "+asset);
}
assert.match(core,/case "weekly":\s*window\.renderWeeklyPlanner\(\)/);
assert.match(html,/id="page-weekly"/);
assert.match(core,/weeklyPlanner/);
const db={members:[{id:"a",name:"A",status:"active"},{id:"b",name:"B",status:"active"},{id:"c",name:"C",status:"active"}],weeklyPlanner:{rotation:{enabled:true,members:["a","b","c"],startDate:"2026-10-10",offsets:{Cooking:0,Cleaning:1,Bazaar:2},overrides:{}}}};
const window={renderWeeklyPlanner() {},AuroraCloudSync:{status:()=>({ready:true,canWrite:true})}};
const context={window,AuroraDataStore:{get:()=>db,save:()=>true},document:{},Date,console,confirm:()=>true};
vm.runInNewContext(load("duty-rotation.js"),context);
const r=window.AuroraDutyRotation;
assert.equal(r.saturday("2026-10-15"),"2026-10-10");
assert.equal(r.weekIndex("2026-10-10","2026-10-17"),1);
assert.equal(r.getAssignment("Cooking","2026-10-10"),"a");
assert.equal(r.getAssignment("Cooking","2026-10-17"),"b");
assert.equal(r.getAssignment("Cleaning","2026-10-10"),"b");
assert.equal(r.getAssignment("Bazaar","2026-10-10"),"c");
db.weeklyPlanner.rotation.members=["c","a","b"];
assert.equal(r.getAssignment("Cooking","2026-10-10"),"c","reordering affects rotation");
db.weeklyPlanner.rotation.overrides["2026-10-17"]={Cooking:"a"};
assert.equal(r.getAssignment("Cooking","2026-10-17"),"a","weekly override");
db.weeklyPlanner.rotation.enabled=false;
assert.equal(r.getAssignment("Cooking","2026-10-17"),null);
assert.ok(!db.months,"rotation doesn't initialize accounting records");
const bazaar=load("bazaar-planner.js"),meal=load("weekly-meal-planner.js");
assert.match(bazaar,/weeklyPlanner\.bazaars/);
assert.match(meal,/weeklyPlanner\.mealMenus/);
assert.ok(!/mealAccount\.expenses\s*=|houseAccount\.bills\s*=/.test(bazaar+meal));
console.log("Weekly Planner v1.5: syntax, registration, PWA, scheduling, override and data isolation checks passed.");