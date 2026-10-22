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
const P = loadContent("classicalProseContent.jsx");
const DEVICES = R.RHETORIC_DEVICES;
const SENTENCES = R.RHETORIC_PRACTICE_SENTENCES;
const ESSAYS = E.ESSAY_ITEMS;
const PROSE = P.CLASSICAL_PROSE_ITEMS;
const PROSE_BATCH3 = ["yan-er-dao-ling", "hua-she-tian-zu", "yu-bang-xiang-zheng", "wang-rong-bu-qu-dao-pang-li", "zeng-zi-sha-zhi", "zao-bi-tou-guang", "lun-yu-lun-xue", "ai-lian-shuo", "lou-shi-ming", "yue-yang-lou-ji-jie-lu"];
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

// ---------------------------------------------------------------- 文言文選讀
t("prose: 27 passages, unique ids, 9 each of 小五 / 小六 / 中一, level only p5 / p6 / s1", () => {
  assert.equal(PROSE.length, 27);
  assert.deepEqual(dups(PROSE.map((x) => x.id)), []);
  for (const x of PROSE) assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
  const n = countBy(PROSE, (x) => x.level);
  assert.deepEqual([n.p5, n.p6, n.s1], [9, 9, 9]);
});

t("prose: every passage has all its fields and lines / lineExplanations of the same length", () => {
  for (const x of PROSE) {
    for (const f of ["id", "title", "source", "dynasty", "background"]) assert.ok(nonEmpty(x[f]), `${x.id}.${f} is empty`);
    assert.ok(Array.isArray(x.lines) && x.lines.length >= 3 && x.lines.every(nonEmpty), `${x.id}.lines`);
    assert.equal(x.lines.length, x.lineExplanations.length, `${x.id}: ${x.lines.length} lines vs ${x.lineExplanations.length} explanations`);
    assert.ok(x.lineExplanations.every(nonEmpty), `${x.id}.lineExplanations`);
    assert.ok(Array.isArray(x.glossary) && x.glossary.length >= 3, `${x.id}.glossary`);
  }
});

t("prose: every glossary term occurs in the passage's lines; jyutping is lower-case letters + tone digits", () => {
  for (const x of PROSE) {
    for (const g of x.glossary) {
      assert.ok(nonEmpty(g.term) && nonEmpty(g.meaning), `${x.id}: empty glossary entry`);
      assert.ok(x.lines.some((l) => l.includes(g.term)), `${x.id}: glossary term 「${g.term}」 is not in the lines`);
      if (g.jyutping !== undefined) assert.ok(/^[a-z]+[1-6]( [a-z]+[1-6])*$/.test(g.jyutping), `${x.id}: bad jyutping ${g.jyutping}`);
    }
    assert.deepEqual(dups(x.glossary.map((g) => g.term)), [], `${x.id}: duplicate glossary term`);
  }
});

t("prose: exactly 5 questions per passage, each with 4 different non-empty options and correctIndex 0–3", () => {
  for (const x of PROSE) {
    assert.equal(x.questions.length, 5, `${x.id}: ${x.questions.length} questions`);
    for (const q of x.questions) {
      assert.ok(nonEmpty(q.prompt), `${x.id}: empty prompt`);
      assert.equal(q.options.length, 4, `${x.id}: ${q.prompt}`);
      assert.ok(q.options.every(nonEmpty), `${x.id}: empty option`);
      assert.equal(new Set(q.options).size, 4, `${x.id}: repeated option in 「${q.prompt}」`);
      assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3, `${x.id}: correctIndex ${q.correctIndex}`);
    }
    assert.deepEqual(dups(x.questions.map((q) => q.prompt)), [], `${x.id}: duplicate question`);
  }
});

t("prose: the ten passages of 階段 7 B 批 are all present and spread their correct answers over the four positions", () => {
  const batch = PROSE_BATCH3.map((id) => PROSE.find((x) => x.id === id));
  batch.forEach((x, i) => assert.ok(x, `missing ${PROSE_BATCH3[i]}`));
  const n = [0, 0, 0, 0];
  for (const x of batch) {
    const idx = x.questions.map((q) => q.correctIndex);
    assert.ok(new Set(idx).size >= 3, `${x.id}: correct answers sit in only ${new Set(idx).size} positions`);
    idx.forEach((i) => n[i]++);
  }
  for (const c of n) assert.ok(c >= 10 && c <= 15, `uneven correctIndex spread ${n}`);
  const lv = countBy(batch, (x) => x.level);
  assert.deepEqual([lv.p5, lv.p6, lv.s1], [3, 3, 4]);
});

t("prose: no passage repeats another's 原文 line", () => {
  assert.deepEqual(dups(PROSE.flatMap((x) => x.lines)), []);
});

t.done();
