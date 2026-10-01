const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const script = fs.readFileSync("script.js", "utf8");
const guardSource = script.slice(script.indexOf("const AuroraMemberGuard ="),
  script.indexOf("window.AuroraMemberGuard ="));
const listeners = {};
let role = "member";
const guard = vm.createContext({
  window: {AuroraCloudSync: {status: () => ({ready: true, role})}},
  document: {addEventListener: (name, handler) => {listeners[name] = handler;}},
  toast() {}, setTimeout() {},
});
vm.runInContext(guardSource, guard);
function click(id, text, inPortal, nested = false, inInstallGate = false) {
  let blocked = false;
  const button = {
    id, textContent: text, className: "", getAttribute: () => "",
    hasAttribute: () => false, matches: () => false,
    closest(selector) {
      if (selector === "#auroraUpdatePortal") return inPortal ? {} : null;
      if (selector === "#auroraInviteInstallGate") return inInstallGate ? {} : null;
      if (selector.startsWith("button,")) return this;
      return null;
    }
  };
  const target = nested ? {closest: () => button} : button;
  listeners.click({target, preventDefault: () => {blocked = true;},
    stopPropagation() {}, stopImmediatePropagation() {}});
  return blocked;
}
assert.equal(click("auroraUpdateNow", "UPDATE NOW", true), false);
assert.equal(click("auroraUpdateNow", "RETRY UPDATE", true, true), false);
assert.equal(click("auroraUpdateLater", "LATER", true), false);
assert.equal(click("updateExpense", "UPDATE EXPENSE", false), true);
assert.equal(click("auroraUpdateNow", "UPDATE NOW", false), true);
assert.equal(click("auroraInviteInstallBtn", "INSTALL AURORA", false, true, true), false);
assert.equal(click("auroraInviteContinueBtn", "CONTINUE INVITATION", false, false, true), false);
assert.equal(click("auroraInviteManualInstalled", "I HAVE INSTALLED", false, false, true), false);
assert.equal(click("auroraInviteInstallBtn", "INSTALL AURORA", false), true);
role = "owner";
assert.equal(click("updateExpense", "UPDATE EXPENSE", false), false);

// Verify the update action activates a waiting worker and reloads afterward.
const updateSource = script.slice(script.indexOf("const AuroraUpdateSystem ="),
  script.indexOf("const AuroraUXState ="));
let sent = null, reloads = 0, load;
const swListeners = {};
const serviceWorker = {
  controller: {},
  addEventListener: (name, fn) => {swListeners[name] = fn;},
  removeEventListener() {},
  register: async () => ({
    waiting: {postMessage: message => {
      sent = message;
      swListeners.controllerchange();
    }},
    addEventListener() {},
  }),
};
const elements = {
  auroraUpdateNow: {}, auroraUpdateStatus: {},
  auroraUpdatePortal: {style: {}, classList: {add() {}, remove() {}}},
};
const context = vm.createContext({
  window: {
    navigator: {}, matchMedia: () => ({matches: true}),
    addEventListener: (name, fn) => {if (name === "load") load = fn;},
    location: {reload: () => {reloads++;}},
  },
  navigator: {serviceWorker, userAgent: "Android", onLine: true},
  document: {getElementById: id => elements[id] || null,
    body: {classList: {add() {}, remove() {}}}, addEventListener() {},
    querySelectorAll: () => [], querySelector: () => null},
  localStorage: {getItem: () => null, setItem() {}},
  location: {href: "https://example.test/Aurora-Bachelor/", origin: "https://example.test"},
  URL, TextEncoder, console, clearTimeout() {}, setInterval() {},
  setTimeout: (fn, delay) => {if (delay === 700) fn(); return 1;},
  fetch: async () => ({ok: true, status: 200, headers: {get: () => "build-19"}}),
});
vm.runInContext(updateSource, context);
(async () => {
  await load();
  await vm.runInContext("AuroraUpdateSystem.apply()", context);
  assert.equal(sent.type, "AURORA_SKIP_WAITING");
  assert.equal(reloads, 1);
  assert.match(elements.auroraUpdateStatus.innerHTML, /RESTARTING AURORA/);
  console.log("10 member guard scenarios and update activation/reload passed.");
})().catch(error => {console.error(error); process.exitCode = 1;});
