// Content sanity checks for 修辭手法 (rhetoricContent.jsx) and 作文金句 (essayContent.jsx) — run: node tests/content.test.js
// Loads the two content files exactly as the browser does (plain JavaScript inside an IIFE, no JSX) into a node:vm sandbox.
// These checks catch the mistakes that fail silently on screen: a keyPhrase that is not in its sentence (the blank is not drawn),
// a device name that does not exist (the quiz crashes), duplicated ids / sentences, wrong counts.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");

function loadContent(file) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", "content", file), "utf8"), ctx);
  return ctx.window.App.Content;
}

const R = loadContent("rhetoricContent.jsx");
const E = loadContent("essayContent.jsx");
const DEVICES = R.RHETORIC_DEVICES;
const SENTENCES = R.RHETORIC_PRACTICE_SENTENCES;
const ESSAYS = E.ESSAY_ITEMS;
const LEVELS = ["p5", "p6", "s1"];
const THEMES = ["描寫", "抒情", "論說"];
const t = makeRunner("content");

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const dups = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);
const countBy = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});

// ---------------------------------------------------------------- 修辭手法
t("rhetoric: 10 devices, unique ids and names, every field present", () => {
  assert.equal(DEVICES.length, 10);
  assert.deepEqual(dups(DEVICES.map((d) => d.id)), []);
  assert.deepEqual(dups(DEVICES.map((d) => d.name)), []);
  for (const name of ["反覆", "引用", "對比"]) assert.ok(DEVICES.some((d) => d.name === name), `missing device ${name}`);
  for (const d of DEVICES) {
    for (const f of ["id", "name", "definition", "tip", "effect"]) assert.ok(nonEmpty(d[f]), `${d.id}.${f} is empty`);
    assert.ok(Array.isArray(d.examples) && d.examples.length >= 2 && d.examples.every(nonEmpty), `${d.id}.examples`);
  }
});

t("rhetoric: the 效果 texts differ (they are used as each other's quiz distractors)", () => {
  assert.deepEqual(dups(DEVICES.map((d) => d.effect)), []);
});

t("rhetoric: practice sentences have unique ids and all required fields", () => {
  assert.deepEqual(dups(SENTENCES.map((s) => s.id)), []);
  for (const s of SENTENCES) {
    for (const f of ["id", "sentence", "device", "level"]) assert.ok(nonEmpty(s[f]), `${s.id}.${f} is empty`);
  }
});

t("rhetoric: level is only p5 / p6 / s1", () => {
  for (const s of SENTENCES) assert.ok(LEVELS.includes(s.level), `${s.id}: level ${s.level}`);
});

t("rhetoric: every sentence's device exists in RHETORIC_DEVICES", () => {
  const names = new Set(DEVICES.map((d) => d.name));
  for (const s of SENTENCES) assert.ok(names.has(s.device), `${s.id}: unknown device ${s.device}`);
});

t("rhetoric: exactly 20 sentences per device (200 in total)", () => {
  const n = countBy(SENTENCES, (s) => s.device);
  for (const d of DEVICES) assert.equal(n[d.name], 20, `${d.name}: ${n[d.name]} sentences`);
  assert.equal(SENTENCES.length, 200);
});

t("rhetoric: ids follow <device id>-<number> and match the sentence's device", () => {
  const idOf = Object.fromEntries(DEVICES.map((d) => [d.name, d.id]));
  for (const s of SENTENCES) assert.ok(new RegExp(`^${idOf[s.device]}-\\d+$`).test(s.id), `${s.id} vs ${s.device}`);
});

t("rhetoric: no duplicate sentences, and none repeats a device's own example sentence", () => {
  assert.deepEqual(dups(SENTENCES.map((s) => s.sentence)), []);
  const examples = new Set(DEVICES.flatMap((d) => d.examples));
  for (const s of SENTENCES) assert.ok(!examples.has(s.sentence), `${s.id} repeats a reference example`);
});

t("rhetoric: every device has sentences at every level (the level filter never starves a device)", () => {
  const n = countBy(SENTENCES, (s) => s.device + "|" + s.level);
  for (const d of DEVICES) for (const lv of LEVELS) assert.ok(n[d.name + "|" + lv] >= 1, `${d.name} has no ${lv} sentence`);
});

t("rhetoric: the three new devices are split 6 / 7 / 7 over 小五 / 小六 / 中一", () => {
  const n = countBy(SENTENCES, (s) => s.device + "|" + s.level);
  for (const name of ["反覆", "引用", "對比"]) {
    assert.deepEqual([n[name + "|p5"], n[name + "|p6"], n[name + "|s1"]], [6, 7, 7], name);
  }
});

t("rhetoric: every 引用 sentence quotes with 「」 and names who said it", () => {
  for (const s of SENTENCES.filter((x) => x.device === "引用")) {
    assert.ok(/「[^」]+」/.test(s.sentence), `${s.id}: no quotation marks`);
    assert.ok(/(說|寫道|提醒我們)[：，]?/.test(s.sentence) || /《.+》/.test(s.sentence), `${s.id}: no speaker / source`);
  }
});

t("rhetoric: every 反覆 sentence really repeats a word or phrase (2+ characters, or a repeated pair)", () => {
  for (const s of SENTENCES.filter((x) => x.device === "反覆")) {
    const text = s.sentence;
    // some chunk of 2–4 characters occurs at least twice
    let found = false;
    for (let len = 2; len <= 4 && !found; len++)
      for (let i = 0; i + len <= text.length && !found; i++) {
        const chunk = text.slice(i, i + len);
        if (/^[一-鿿]+$/.test(chunk) && text.indexOf(chunk, i + len) !== -1) found = true;
      }
    assert.ok(found, `${s.id}: no repeated wording`);
  }
});

// ---------------------------------------------------------------- 作文金句
t("essay: 150 items, unique ids, all seven fields present", () => {
  assert.equal(ESSAYS.length, 150);
  assert.deepEqual(dups(ESSAYS.map((x) => x.id)), []);
  for (const x of ESSAYS) {
    for (const f of ["id", "theme", "level", "sentence", "keyPhrase", "usage", "scenario"]) assert.ok(nonEmpty(x[f]), `${x.id}.${f} is empty`);
  }
});

t("essay: level is only p5 / p6 / s1 and theme is only 描寫 / 抒情 / 論說", () => {
  for (const x of ESSAYS) {
    assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
    assert.ok(THEMES.includes(x.theme), `${x.id}: theme ${x.theme}`);
  }
});

t("essay: exactly 50 sentences per theme", () => {
  const n = countBy(ESSAYS, (x) => x.theme);
  for (const th of THEMES) assert.equal(n[th], 50, `${th}: ${n[th]}`);
});

t("essay: every theme has sentences at every level", () => {
  const n = countBy(ESSAYS, (x) => x.theme + "|" + x.level);
  for (const th of THEMES) for (const lv of LEVELS) assert.ok(n[th + "|" + lv] >= 1, `${th} has no ${lv} sentence`);
});

t("essay: keyPhrase occurs in its sentence exactly once (so the blank is drawn once)", () => {
  for (const x of ESSAYS) {
    const parts = x.sentence.split(x.keyPhrase).length - 1;
    assert.equal(parts, 1, `${x.id}: keyPhrase occurs ${parts} times in the sentence`);
  }
});

t("essay: no duplicate sentences, keyPhrases or scenarios (they are quiz options / prompts)", () => {
  assert.deepEqual(dups(ESSAYS.map((x) => x.sentence)), []);
  assert.deepEqual(dups(ESSAYS.map((x) => x.keyPhrase)), []);
  assert.deepEqual(dups(ESSAYS.map((x) => x.scenario)), []);
});

t.done();
