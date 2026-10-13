// Shared by the unit tests: loads src/Storage.jsx (plain JavaScript, no JSX) into a
// `node:vm` sandbox with a stubbed `window` / `localStorage` / URL, exactly as a browser
// would run it, and returns the `window.App.Storage` API.
//
//   loadStorage()                                   normal mode, empty localStorage
//   loadStorage({ initial: { …state… } })           normal mode, `chineseOps:v1` pre-filled
//   loadStorage({ search: "?today=2026-10-12" })    測試模式 (test mode)
//
// Returns { S, store } — `store` is the stub's backing object (key → JSON string).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const STORAGE_FILE = path.join(__dirname, "..", "src", "Storage.jsx");
const SOURCE = fs.readFileSync(STORAGE_FILE, "utf8");

function loadStorage({ search = "", initial } = {}) {
  const store = initial ? { "chineseOps:v1": JSON.stringify(initial) } : {};
  const ctx = {
    URLSearchParams,
    console,
    window: { location: { search } },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = String(v);
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE, ctx);
  return { S: ctx.window.App.Storage, store };
}

// Tiny test runner: `t(name, fn)` runs fn, prints "ok …", counts it; an assertion error
// propagates, so the file exits non-zero and run-all.js reports the failure.
function makeRunner(label) {
  let count = 0;
  const t = (name, fn) => {
    fn();
    count++;
    console.log("ok", name);
  };
  t.done = () => console.log(`\n${count} ${label} tests passed`);
  return t;
}

module.exports = { loadStorage, makeRunner, STORAGE_FILE };
