// Runs every tests/*.test.js in its own node process and prints a summary.
//   node tests/run-all.js        (exit code 0 = all passed, 1 = something failed)
// Needs only Node 18+ — no npm install, no build step. Covers the pure logic in
// src/Storage.jsx and the content files (content.test.js); it does NOT test screens (those were checked in a real browser).
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort();
let failed = 0;
let total = 0;

for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: "utf8" });
  const m = /(\d+) [\w-]+ tests passed/.exec(r.stdout || "");
  if (r.status === 0 && m) {
    total += Number(m[1]);
    console.log(`PASS  ${f.padEnd(24)} ${m[1]} tests`);
  } else {
    failed++;
    console.log(`FAIL  ${f}`);
    console.log((r.stdout || "").split("\n").slice(-6).join("\n"));
    console.log(r.stderr || "");
  }
}

console.log(failed ? `\n${failed} file(s) FAILED` : `\nAll ${files.length} files passed (${total} tests).`);
process.exit(failed ? 1 : 0);
