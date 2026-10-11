const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const script = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const source = script.slice(script.indexOf("function getAuroraTheme("), script.indexOf("function restoreSettingsDefaults("));
const original = {settings: {personalization: {theme: "aurora", accent: "violet", glow: "low", animation: "reduced", background: "grid", density: "compact"}}, members: [{id: "m1"}], months: {sample: {expenses: [123]}}};
const db = structuredClone(original);
const values = new Map();
const root = {dataset: {}, classList: {toggle() {}}};
const meta = {content: "#07111f"};
let writes = 0;
const localStorage = {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
const context = vm.createContext({AuroraDataStore: {get: () => db, save: () => {writes++;}}, localStorage,
  document: {documentElement: root, querySelectorAll: () => [meta]}, toast() {}});
vm.runInContext(source, context);
vm.runInContext('setAuroraTheme("white-gold")', context);
assert.equal(root.dataset.theme, "white-gold");
assert.equal(meta.content, "#faf7ef");
assert.equal(values.get("aurora_device_theme_v1"), "white-gold");
assert.equal(root.dataset.accent, "violet"); // Fixed gold comes from CSS, saved accent remains intact.
assert.equal(root.dataset.animation, "reduced");
assert.equal(root.dataset.density, "compact");
assert.deepEqual(db, original);
assert.equal(writes, 0); // Members change appearance without cloud/database writes.
vm.runInContext('setAuroraTheme("copper-cocoa")', context);
assert.equal(root.dataset.theme, "copper-cocoa");
assert.equal(meta.content, "#63342d");
assert.equal(values.get("aurora_device_theme_v1"), "copper-cocoa");
assert.deepEqual(db, original);
assert.equal(writes, 0);
vm.runInContext('setAuroraTheme("white-gold")', context);
vm.runInContext('setAuroraTheme("sea-olive")', context);
assert.equal(root.dataset.theme, "sea-olive");
assert.equal(meta.content, "#0a5045");
assert.equal(values.get("aurora_device_theme_v1"), "sea-olive");
assert.deepEqual(db, original);
assert.equal(writes, 0);
vm.runInContext('setAuroraTheme("white-gold")', context);
vm.runInContext('setAuroraTheme("mirage-sky")', context);
assert.equal(root.dataset.theme, "mirage-sky");
assert.equal(meta.content, "#1a262c");
assert.equal(values.get("aurora_device_theme_v1"), "mirage-sky");
assert.deepEqual(db, original);
assert.equal(writes, 0);
vm.runInContext('setAuroraTheme("white-gold")', context);
vm.runInContext('setAuroraTheme("bay-olivine")', context);
assert.equal(root.dataset.theme, "bay-olivine");
assert.equal(meta.content, "#465c8d");
assert.equal(values.get("aurora_device_theme_v1"), "bay-olivine");
assert.deepEqual(db, original);
assert.equal(writes, 0);
vm.runInContext('setAuroraTheme("white-gold")', context);
// A cloud refresh and reapplication cannot overwrite this device's preference.
db.settings.personalization.theme = "midnight";
vm.runInContext("applyAuroraPersonalization()", context);
assert.equal(root.dataset.theme, "white-gold");
vm.runInContext('setAuroraTheme("aurora")', context);
assert.equal(root.dataset.theme, "aurora");
assert.equal(meta.content, "#07111f");
vm.runInContext('setAuroraTheme("invalid")', context);
assert.equal(root.dataset.theme, "aurora");
values.set("aurora_device_theme_v1", "invalid");
vm.runInContext("applyAuroraPersonalization()", context);
assert.equal(root.dataset.theme, "aurora");
// Storage-disabled browsers still apply a theme for the current session.
localStorage.getItem = () => {throw Error("blocked");};
localStorage.setItem = () => {throw Error("blocked");};
vm.runInContext('setAuroraTheme("white-gold")', context);
assert.equal(root.dataset.theme, "white-gold");
// The settings selector exposes the new theme and the device-only change handler.
assert.match(script, /id="settingsTheme"\s+onchange="setAuroraTheme\(this.value\)"/);
assert.match(script, /value="white-gold"/);
assert.match(script, /target.id === "settingsTheme" && target.closest\("#page-settings"\)/);
assert.match(html, /themes.css\?v=29/);
assert.match(fs.readFileSync("sw.js", "utf8"), /"\.\/themes.css"/);
// First paint restores theme without needing the data store or an auth session.
const boot = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const bootRoot = {dataset: {}};
const bootMeta = {};
vm.runInNewContext(boot, {localStorage: {getItem: () => "white-gold"},
  document: {documentElement: bootRoot, querySelector: () => bootMeta}});
assert.equal(bootRoot.dataset.theme, "white-gold");
assert.equal(bootMeta.content, "#faf7ef");
vm.runInNewContext(boot, {localStorage: {getItem: () => "copper-cocoa"},
  document: {documentElement: bootRoot, querySelector: () => bootMeta}});
assert.equal(bootRoot.dataset.theme, "copper-cocoa");
assert.equal(bootMeta.content, "#63342d");
assert.match(script, /value="copper-cocoa"/);
const css = fs.readFileSync("themes.css", "utf8");
assert.match(css, /--personal-accent: #9a6449/);
assert.match(css, /--bg: #63342d/);
assert.match(css, /--text: #fff7ed/);
assert.match(css, /linear-gradient\(135deg, #9a6449 0%, #63342d 100%\)/);
vm.runInNewContext(boot, {localStorage: {getItem: () => "sea-olive"},
  document: {documentElement: bootRoot, querySelector: () => bootMeta}});
assert.equal(bootRoot.dataset.theme, "sea-olive");
assert.equal(bootMeta.content, "#0a5045");
assert.match(css, /linear-gradient\(135deg, #6d8f21 0%, #0a5045 100%\)/);
vm.runInNewContext(boot, {localStorage: {getItem: () => "mirage-sky"},
  document: {documentElement: bootRoot, querySelector: () => bootMeta}});
assert.equal(bootRoot.dataset.theme, "mirage-sky");
assert.equal(bootMeta.content, "#1a262c");
assert.match(css, /linear-gradient\(135deg, #7dbacf 0%, #1a262c 100%\)/);
vm.runInNewContext(boot, {localStorage: {getItem: () => "bay-olivine"},
  document: {documentElement: bootRoot, querySelector: () => bootMeta}});
assert.equal(bootRoot.dataset.theme, "bay-olivine");
assert.equal(bootMeta.content, "#465c8d");
assert.match(css, /linear-gradient\(135deg, #95c176 0%, #465c8d 100%\)/);
console.log("Theme switching, reload/cloud refresh persistence, storage fallback, member controls and data preservation passed.");
