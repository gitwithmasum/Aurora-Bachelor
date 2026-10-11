const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync('script.js','utf8');
const engine=script.slice(script.indexOf('const AuroraCloudSync = (() => {'),script.indexOf('const AuroraUXState = (() => {'));
const queue=engine.slice(engine.indexOf('  function queueSave('),engine.indexOf('  async function reloadFromCloud('));
const status=engine.slice(engine.indexOf('  function status()'),engine.indexOf('  return {\n\n    initialize,'));
let rpcResult={data:{revision:2},error:null},rpcCalls=0,tick,timerId=0;
const timers=new Map(),nodes=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',className:'',disabled:false,classList:{add(){},remove(){}},addEventListener(){},remove(){}});return nodes.get(id);};
const context=vm.createContext({console:{log(){},warn(){},error(){}},structuredClone,
 setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},setInterval(fn){tick=fn;},
 navigator:{onLine:true},document:{readyState:'complete',getElementById:node,querySelector:()=>null},window:{addEventListener(){}},
 AuroraDataStore:{get:()=>({members:[]})},toast(){},getAuroraSupabaseClient:()=>({rpc:async()=>{rpcCalls++;return rpcResult;}}),createLocalBackup(){},reloadFromCloud:async()=>{}});
const run=code=>vm.runInContext(code,context);
run(`let ready=false,householdId=null,currentRole='member',currentRevision=0,applyingCloud=false,pendingSnapshot=null,saveTimer=null,saving=false,lastSaveError=null,remoteRefreshQueued=false;
function canWrite(){return ['owner','admin'].includes(currentRole);} function cloneData(data){return structuredClone(data);}
${queue}\n${status}\nwindow.AuroraCloudSync={queueSave,status};`);
run(script.slice(script.indexOf('const AuroraUXState = (() => {')));
const uiState=()=>run('AuroraUXState.status().state');
const call=()=>run('window.AuroraCloudSync.queueSave({members:[{id:"m1"}]})');
(async()=>{
 assert.equal(uiState(),'connecting');call();assert.equal(uiState(),'connecting');assert.equal(timers.size,1);
 run("ready=true;householdId='house1'");tick();assert.equal(uiState(),'synced');call();assert.equal(uiState(),'synced');
 assert.equal(node('auroraUxStatusTitle').textContent,'CLOUD CONNECTED');assert.equal(run('AuroraUXState.status().hasPendingData'),false);assert.equal(rpcCalls,0);
 run("currentRole='owner'");call();assert.equal(uiState(),'syncing');assert.equal(run('status().pending'),true);
 await run('saveTimer=null;flushSave()');tick();assert.equal(uiState(),'synced');assert.equal(rpcCalls,1);
 run('AuroraUXState.retry()');assert.equal(uiState(),'syncing');await run('saveTimer=null;flushSave()');tick();assert.equal(uiState(),'synced');
 rpcResult={data:null,error:{message:'Network save failed'}};call();await run('saveTimer=null;flushSave()');tick();assert.equal(uiState(),'error');
 assert.equal(node('auroraUxStatusText').textContent,'Network save failed');assert.equal(run('AuroraUXState.status().hasPendingData'),true);
 rpcResult={data:{revision:3},error:null};call();assert.equal(uiState(),'syncing');await run('saveTimer=null;flushSave()');tick();assert.equal(uiState(),'synced');
 context.navigator.onLine=false;tick();call();assert.equal(uiState(),'offline');assert.equal(node('auroraUxStatusTitle').textContent,'OFFLINE MODE');
 console.log('Cloud status regression passed: unready, member no-op, debounce, completion, retry, failed save, recovery, offline.');
})().catch(error=>{console.error(error);process.exitCode=1;});
