const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf("AURORA // INVITATION PRE-BOOT INSTALL GATE");
const source = html.slice(html.indexOf("(() =>", start), html.indexOf("</script>", start));
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {getItem: key => data.get(key) || null,
    setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key)};
}
function run({standalone = false, confirmed, invite = "fresh", pending} = {}) {
  let replaced;
  const url = new URL("https://example.test/Aurora-Bachelor/" + (invite ? "?invite=" + invite : ""));
  const localStorage = storage({aurora_pwa_installed_v1: "1",
    ...(pending ? {aurora_pending_invite_token: pending} : {})});
  const sessionStorage = storage({aurora_pending_invite_token: "stale",
    ...(confirmed ? {aurora_invite_install_confirmed_token: confirmed} : {})});
  const window = {navigator: {userAgent: "Android"},
    matchMedia: () => ({matches: standalone}),
    location: {href: url.href, search: url.search, pathname: url.pathname, hash: "",
      replace: value => {replaced = value;}}};
  vm.runInNewContext(source, {window, URL, URLSearchParams, localStorage, sessionStorage,
    history: {replaceState: (_, __, path) => {window.location.href = new URL(path, url).href;}}});
  return {window, localStorage, sessionStorage, replaced};
}
let result = run();
assert.equal(result.window.__AURORA_INVITE_INSTALL_GATE__.required, true);
assert.equal(result.localStorage.getItem("aurora_pending_invite_token"), "fresh");
assert.equal(result.sessionStorage.getItem("aurora_pending_invite_token"), null);
assert.equal(new URL(result.window.location.href).searchParams.has("invite"), false);
result = run({standalone: true});
assert.equal(result.window.__AURORA_INVITE_INSTALL_GATE__, undefined);
result = run({confirmed: "fresh"});
assert.equal(result.window.__AURORA_INVITE_INSTALL_GATE__, undefined);
result = run({confirmed: "older"});
assert.equal(result.window.__AURORA_INVITE_INSTALL_GATE__.required, true);
result = run({standalone: true, invite: "", pending: "fresh"});
assert.equal(new URL(result.replaced).searchParams.get("invite"), "fresh");
result = run({invite: ""});
assert.equal(result.window.__AURORA_INVITE_INSTALL_GATE__, undefined);
console.log("6 installation onboarding scenarios passed.");
