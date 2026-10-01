const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const script = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const source = script.slice(script.indexOf('const AURORA_INVITE_STORAGE_KEY'), script.indexOf('/* ============================================================\n   START AFTER PAGE LOAD', script.indexOf('const AURORA_INVITE_STORAGE_KEY')));
function storage() {
  const values = new Map();
  return {getItem: k => values.get(k) || null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k)};
}
async function scenario(status, signedIn, expired = false) {
  let message = ''; let acceptCalls = 0;
  const localStorage = storage(); const sessionStorage = storage();
  localStorage.setItem('aurora_pending_invite_token', 'older-token');
  const window = {location: {href: 'https://example.test/Aurora-Bachelor/?invite=fresh-token'}, history: {replaceState: (_,__,url) => window.location.href = new URL(url, window.location.href).href}};
  const client = {auth: {getSession: async () => ({data: {session: signedIn ? {user: {id:'recipient'}} : null}})}, rpc: async name => {
    if (name === 'aurora_preview_invitation') return {data:[{invitation_status:status, expires_at:expired ? '2000-01-01' : '2099-01-01', house_name:'Test House'}]};
    acceptCalls++;
    return {data:[{household_id:'house', house_name:'Test House',member_role:'member'}]};
  }};
  const context = vm.createContext({window, localStorage, sessionStorage, URL, console:{log(){},error(){}}, getAuroraSupabaseClient:()=>client, toast(){}, esc:String, document:{}});
  vm.runInContext(source, context);
  context.setAuroraInviteMessage = value => {message=value;};
  await context.initializeAuroraInvitationFlow();
  return {message,acceptCalls,localStorage,sessionStorage,window};
}
(async () => {
  for (const status of ['pending','accepted']) {
    const result = await scenario(status,true,status==='accepted');
    assert.equal(result.acceptCalls,1);
    assert.match(result.message,/CONNECTION ESTABLISHED/);
    assert.equal(result.localStorage.getItem('aurora_pending_invite_token'),null);
    assert.equal(result.sessionStorage.getItem('aurora_pending_invite_token'),null);
    assert.equal(new URL(result.window.location.href).searchParams.has('invite'),false);
  }
  const signedOut = await scenario('accepted',false,true);
  assert.equal(signedOut.acceptCalls,0);
  assert.match(signedOut.message,/Continue with Google/);
  assert.match(signedOut.message,/ACCEPTED/);
  for (const status of ['revoked','expired']) {
    const rejected = await scenario(status,true);
    assert.equal(rejected.acceptCalls,0);
    assert.match(rejected.message,/Invitation unavailable/);
  }
  const expired = await scenario('pending',true,true);
  assert.equal(expired.acceptCalls,0);
  assert.match(expired.message,/has expired/);
  console.log('6 invitation flow scenarios passed.');
})().catch(error => {console.error(error);process.exitCode=1;});
