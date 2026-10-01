const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const {stripTypeScriptTypes} = require("node:module");
const original = fs.readFileSync("supabase/functions/send-house-invite/index.ts", "utf8");
const source = stripTypeScriptTypes(original.replace(/^import .*;\n/, "")
  .replace("export default {", "globalThis.handler = {"));
const invite = {invitation_id: "invite1", email: "member@example.com", created_at: "2026-10-01T00:00:00Z"};
async function run({authError, rpcError, events = [], contacts = [], id = "invite1"} = {}) {
  let providerCalls = 0, createCalls = 0;
  const context = vm.createContext({
    Request, Response, URLSearchParams, AbortSignal, console,
    Deno: {env: {get: () => "test-key"}},
    createSupabaseContext: async () => ({error: authError, data: authError ? null : {
      supabase: {rpc: async (name) => {
        if (name === "aurora_create_invitation") createCalls++;
        return {data: [invite], error: rpcError};
      }}
    }}),
    fetch: async url => {
      providerCalls++;
      return new Response(JSON.stringify(url.includes("blockedContacts") ?
        {contacts, count: contacts.length} : {events}), {status: 200});
    },
  });
  vm.runInContext(source, context);
  const response = await context.handler.fetch(new Request("https://example.test", {
    method: "POST", body: JSON.stringify({action: "status", householdId: "house1",
      invitationId: id, email: invite.email})
  }));
  return {status: response.status, body: await response.json(), providerCalls, createCalls};
}
function event(event, date, messageId, reason) {
  return {event, date, messageId, reason, email: invite.email,
    from: "sciencefiction844@gmail.com", tag: "aurora-house-invitation"};
}
(async () => {
  let result = await run({authError: {message: "unauthorized"}});
  assert.equal(result.status, 401); assert.equal(result.providerCalls, 0);
  result = await run({rpcError: {message: "not manager"}});
  assert.equal(result.status, 403); assert.equal(result.providerCalls, 0);
  result = await run({id: "other"});
  assert.equal(result.status, 404); assert.equal(result.providerCalls, 0);
  result = await run({contacts: [{email: invite.email, reason: {message: "Unsubscribed"}}]});
  assert.equal(result.body.status, "blocked"); assert.match(result.body.message, /Unsubscribed/);
  result = await run({events: [event("delivered", "2026-10-01T01:00:00Z", "old"),
    event("request", "2026-10-01T02:00:00Z", "new")]});
  assert.equal(result.body.status, "request"); assert.equal(result.createCalls, 0);
  result = await run({events: [event("request", "2026-10-01T01:00:00Z", "new"),
    event("blocked", "2026-10-01T02:00:00Z", "new", "Recipient blocked")]});
  assert.equal(result.body.status, "blocked"); assert.match(result.body.message, /Recipient blocked/);
  result = await run({events: [event("delivered", "2026-10-01T02:00:00Z", "new")]});
  assert.equal(result.body.status, "delivered");
  result = await run({events: [event("delivered", "2026-09-30T02:00:00Z", "old")]});
  assert.equal(result.body.status, "unknown");
  result = await run({events: [event("request", "2026-10-01T01:00:00Z", "old"),
    event("request", "2026-10-01T02:00:00Z", "new"),
    event("delivered", "2026-10-01T03:00:00Z", "old")]});
  assert.equal(result.body.status, "request");
  console.log("9 invitation email authorization and delivery scenarios passed.");
})().catch(error => {console.error(error); process.exitCode = 1;});
