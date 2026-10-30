// Content sanity checks for 修辭手法 (rhetoricContent.jsx), 作文金句 (essayContent.jsx), 文言文選讀 (classicalProseContent.jsx) and
// 閱讀理解 (readingContent.jsx), 成語學習 (idiomContent.jsx) and 中國歷史故事 (historyContent.jsx) — run: node tests/content.test.js
// Loads the content files exactly as the browser does (plain JavaScript inside an IIFE, no JSX) into a node:vm sandbox.
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
const RD = loadContent("readingContent.jsx");
const DEVICES = R.RHETORIC_DEVICES;
const SENTENCES = R.RHETORIC_PRACTICE_SENTENCES;
const ESSAYS = E.ESSAY_ITEMS;
const PROSE = P.CLASSICAL_PROSE_ITEMS;
const READING = RD.READING_ITEMS;
const PROSE_BATCH3 = ["yan-er-dao-ling", "hua-she-tian-zu", "yu-bang-xiang-zheng", "wang-rong-bu-qu-dao-pang-li", "zeng-zi-sha-zhi", "zao-bi-tou-guang", "lun-yu-lun-xue", "ai-lian-shuo", "lou-shi-ming", "yue-yang-lou-ji-jie-lu"];
// 階段 10: s2 (中二) is a valid level tag. Only 文言文選讀 has s2 content so far (階段 10b); the other modules may still have 0 s2 items,
// so their "every level has items" checks use FILLED_LEVELS
const LEVELS = ["p5", "p6", "s1", "s2"];
const FILLED_LEVELS = ["p5", "p6", "s1"];
// 階段 10c-1: 閱讀理解 now has s2 passages too (reading part only; the other modules still use FILLED_LEVELS)
const READING_FILLED_LEVELS = [...FILLED_LEVELS, "s2"];
// 階段 10d: 修辭手法 has s2 practice sentences too (rhetoric only)
const RHETORIC_FILLED_LEVELS = [...FILLED_LEVELS, "s2"];
// 階段 10e: 作文金句 has s2 sentences too (essay only)
const ESSAY_FILLED_LEVELS = [...FILLED_LEVELS, "s2"];
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

t("rhetoric: level is only p5 / p6 / s1 / s2", () => {
  for (const s of SENTENCES) assert.ok(LEVELS.includes(s.level), `${s.id}: level ${s.level}`);
});

t("rhetoric: every sentence's device exists in RHETORIC_DEVICES", () => {
  const names = new Set(DEVICES.map((d) => d.name));
  for (const s of SENTENCES) assert.ok(names.has(s.device), `${s.id}: unknown device ${s.device}`);
});

t("rhetoric: exactly 28 sentences per device (280 in total; 階段 10d added 8 中二 per device)", () => {
  const n = countBy(SENTENCES, (s) => s.device);
  for (const d of DEVICES) assert.equal(n[d.name], 28, `${d.name}: ${n[d.name]} sentences`);
  assert.equal(SENTENCES.length, 280);
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

t("rhetoric: every device has sentences at every one of the four levels (the level filter never starves a device)", () => {
  const n = countBy(SENTENCES, (s) => s.device + "|" + s.level);
  for (const d of DEVICES) for (const lv of RHETORIC_FILLED_LEVELS) assert.ok(n[d.name + "|" + lv] >= 1, `${d.name} has no ${lv} sentence`);
});

t("rhetoric 10d: 280 sentences = 小五 58 / 小六 70 / 中一 72 / 中二 80", () => {
  const n = countBy(SENTENCES, (s) => s.level);
  assert.deepEqual([n.p5, n.p6, n.s1, n.s2], [58, 70, 72, 80]);
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

t("rhetoric 10d: each device has exactly 8 中二 (s2) sentences with the ids <device id>-21 … -28; none has alsoDevices", () => {
  for (const d of DEVICES) {
    const s2 = SENTENCES.filter((x) => x.device === d.name && x.level === "s2");
    assert.equal(s2.length, 8, `${d.name}: ${s2.length} s2 sentences`);
    assert.deepEqual(s2.map((x) => x.id).sort(), Array.from({ length: 8 }, (_, i) => `${d.id}-${21 + i}`).sort(), d.name);
    for (const x of s2) assert.ok(!("alsoDevices" in x), `${x.id}: alsoDevices needs the user's approval`);
  }
  // the 192 older sentences are still p5 / p6 / s1 only, ids 1 … 20
  for (const x of SENTENCES.filter((y) => y.level !== "s2")) assert.ok(Number(x.id.split("-").pop()) <= 20, x.id);
});

t("rhetoric 10d: no sentence, definition, tip, effect or example anywhere says 「中三」 (the level is only ever called 中二)", () => {
  for (const x of SENTENCES) assert.ok(!x.sentence.includes("中三") && !x.sentence.includes("中二"), `${x.id}: level name inside the sentence`);
  for (const d of DEVICES) for (const str of [d.definition, d.tip, d.effect, ...d.examples]) assert.ok(!str.includes("中三"), `${d.name}: 中三`);
});

t("rhetoric 10d: every s2 引用 sentence has 「」 and a speaker / source; only 引用 sentences have 「」", () => {
  for (const x of SENTENCES.filter((y) => y.level === "s2")) {
    if (x.device === "引用") {
      assert.ok(/「[^」]+」/.test(x.sentence), `${x.id}: no quotation marks`);
      assert.ok(/^(孔子|孟子|荀子|老子|曾子|韓愈)(說|在《.+》中寫道)：「/.test(x.sentence), `${x.id}: no speaker`);
    } else assert.ok(!/[「」]/.test(x.sentence), `${x.id}: 「」 outside 引用`);
  }
});

t("rhetoric 10d: s2 對偶 sentences are really equal-length pairs; s2 排比 sentences have 3+ items with different openings (not 反覆); only 反問 / 設問 have a question mark", () => {
  for (const x of SENTENCES.filter((y) => y.level === "s2" && y.device === "對偶")) {
    const body = x.sentence.replace(/。$/, "");
    const halves = body.includes("；") ? body.split("；") : body.split("，");
    assert.equal(halves.length, 2, x.id);
    assert.equal(halves[0].length, halves[1].length, `${x.id}: unequal halves`);
  }
  for (const x of SENTENCES.filter((y) => y.level === "s2" && y.device === "排比")) {
    const items = x.sentence.replace(/。$/, "").split("，");
    assert.ok(items.length >= 3, `${x.id}: fewer than 3 items`);
    const heads = items.slice(-3).map((i) => i.slice(0, 2)); // the last three clauses are the parallel items (a lead-in such as 「面對挑戰」 may come first)
    assert.equal(new Set(heads).size, heads.length, `${x.id}: items open alike (that would make it 反覆)`);
  }
  for (const x of SENTENCES.filter((y) => y.level === "s2")) {
    const q = /[？?]/.test(x.sentence);
    assert.equal(q, x.device === "反問" || x.device === "設問", `${x.id}: question mark`);
    if (x.device === "反問") assert.ok(x.sentence.endsWith("？") && x.sentence.indexOf("？") === x.sentence.length - 1, `${x.id}: 反問 must not be followed by an answer`);
    if (x.device === "設問") assert.ok(!x.sentence.endsWith("？") && x.sentence.indexOf("？") < x.sentence.length - 4, `${x.id}: 設問 needs an answer after the question`);
    if (x.device !== "比喻") assert.ok(!/像|如同|彷彿|仿佛|好比|似的|宛如|猶如/.test(x.sentence), `${x.id}: simile marker outside 比喻`);
  }
});

t("rhetoric 10d: s2 sentences are longer than the earlier ones (非對偶 20–50 字) and 同 appears only in ordinary compounds (同學, 如同)", () => {
  for (const x of SENTENCES.filter((y) => y.level === "s2" && y.device !== "對偶")) assert.ok(x.sentence.length >= 20 && x.sentence.length <= 50, `${x.id}: ${x.sentence.length} 字`);
  for (const x of SENTENCES.filter((y) => y.level === "s2")) assert.ok(!/同/.test(x.sentence.replace(/同學|如同/g, "")), `${x.id}: 同`);
});

// ---------------------------------------------------------------- 作文金句
t("essay: 198 items (階段 10e added 48 中二), unique ids, all seven fields present", () => {
  assert.equal(ESSAYS.length, 198);
  assert.deepEqual(dups(ESSAYS.map((x) => x.id)), []);
  for (const x of ESSAYS) {
    for (const f of ["id", "theme", "level", "sentence", "keyPhrase", "usage", "scenario"]) assert.ok(nonEmpty(x[f]), `${x.id}.${f} is empty`);
  }
});

t("essay: level is only p5 / p6 / s1 / s2 and theme is only 描寫 / 抒情 / 論說", () => {
  for (const x of ESSAYS) {
    assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
    assert.ok(THEMES.includes(x.theme), `${x.id}: theme ${x.theme}`);
  }
});

t("essay: exactly 66 sentences per theme", () => {
  const n = countBy(ESSAYS, (x) => x.theme);
  for (const th of THEMES) assert.equal(n[th], 66, `${th}: ${n[th]}`);
});

t("essay: every theme has sentences at every one of the four levels", () => {
  const n = countBy(ESSAYS, (x) => x.theme + "|" + x.level);
  for (const th of THEMES) for (const lv of ESSAY_FILLED_LEVELS) assert.ok(n[th + "|" + lv] >= 1, `${th} has no ${lv} sentence`);
});

t("essay 10e: 198 sentences = 小五 41 / 小六 52 / 中一 57 / 中二 48; exactly 16 中二 per theme", () => {
  const n = countBy(ESSAYS, (x) => x.level);
  assert.deepEqual([n.p5, n.p6, n.s1, n.s2], [41, 52, 57, 48]);
  const m = countBy(ESSAYS.filter((x) => x.level === "s2"), (x) => x.theme);
  for (const th of THEMES) assert.equal(m[th], 16, `${th}: ${m[th]} s2 sentences`);
  assert.equal(ESSAYS.filter((x) => x.level === "s2").length, 48);
});

t("essay 10e: every 中二 sentence is 25–50 字 long; no field of any essay item says 「中三」 or 「中二」", () => {
  for (const x of ESSAYS.filter((y) => y.level === "s2")) assert.ok(x.sentence.length >= 25 && x.sentence.length <= 50, `${x.id}: ${x.sentence.length} 字`);
  for (const x of ESSAYS) for (const f of ["id", "sentence", "keyPhrase", "usage", "scenario"]) assert.ok(!/中三|中二/.test(x[f]), `${x.id}.${f} names a school year`);
});

t("essay 10e: the 中二 items follow the field rules — usage starts with 「用來」, ids are lower-case words joined by hyphens, no colloquial wording, 「同」 only in ordinary compounds", () => {
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻|嗰|咁|好似/;
  for (const x of ESSAYS.filter((y) => y.level === "s2")) {
    assert.ok(x.usage.startsWith("用來"), `${x.id}: usage`);
    assert.ok(/^[a-z]+(-[a-z]+)*$/.test(x.id), `${x.id}: id`);
    for (const f of ["sentence", "keyPhrase", "usage", "scenario"]) {
      assert.ok(!bad.test(x[f]), `${x.id}.${f}: colloquial`);
      assert.ok(!/同/.test(x[f].replace(/同學|同窗|同等|同時|如同|共同|相同|不同/g, "")), `${x.id}.${f}: 同`);
    }
  }
});

t("essay 10e: for the 中二 items no other item's keyPhrase occurs inside the sentence and the keyPhrase occurs in no other sentence (so a blank can never be answered by another phrase)", () => {
  const s2 = ESSAYS.filter((y) => y.level === "s2");
  for (const x of s2) {
    for (const o of ESSAYS) {
      if (o.id === x.id) continue;
      assert.ok(!x.sentence.includes(o.keyPhrase), `${x.id} contains the keyPhrase of ${o.id}`);
      assert.ok(!o.sentence.includes(x.keyPhrase), `${o.id} contains the keyPhrase of ${x.id}`);
    }
  }
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
t("prose: 35 passages, unique ids, 9 / 9 / 9 / 8 of 小五 / 小六 / 中一 / 中二, level only p5 / p6 / s1 / s2", () => {
  assert.equal(PROSE.length, 35);
  assert.deepEqual(dups(PROSE.map((x) => x.id)), []);
  for (const x of PROSE) assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
  const n = countBy(PROSE, (x) => x.level);
  assert.deepEqual([n.p5, n.p6, n.s1, n.s2], [9, 9, 9, 8]);
});

// 階段 10b: 文言文選讀 is the only module that has content at every level (the other modules still have none at s2, see FILLED_LEVELS)
t("prose: every one of the four levels has passages (only 文言文選讀 is checked against s2)", () => {
  for (const lv of LEVELS) assert.ok(PROSE.some((x) => x.level === lv), `文言文選讀 has no ${lv} passage`);
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

t("prose: every glossary term occurs in the passage's lines or title; jyutping is lower-case letters + tone digits", () => {
  for (const x of PROSE) {
    for (const g of x.glossary) {
      assert.ok(nonEmpty(g.term) && nonEmpty(g.meaning), `${x.id}: empty glossary entry`);
      assert.ok(x.lines.some((l) => l.includes(g.term)) || x.title.includes(g.term), `${x.id}: glossary term 「${g.term}」 is in neither the lines nor the title`);
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

// ---- 階段 10b: the 8 中二 passages
const PROSE_10B = ["shang-zhong-yong", "zou-ji-feng-qi-wang-na-jian", "mai-gan-zhe-yan", "yang-xiu-zhi-si", "xi-guan-shuo", "mao-bu-que", "guan-ning-hua-xin-gong-yuan-zhong-chu-cai", "xun-ju-bo-yuan-kan-you-ren-ji"];
const batch10b = () => PROSE_10B.map((id) => PROSE.find((x) => x.id === id));
// every string a child sees besides the 原文 itself (lines are classical text and may contain 同 / 邪 …)
const shown10b = (x) => [x.title, x.source, x.dynasty, x.background, ...x.lineExplanations, ...x.glossary.flatMap((g) => [g.term, g.meaning]), ...x.questions.flatMap((q) => [q.prompt, ...q.options])];
// the only 粵拼 that was checked against a dictionary page for this batch (see CLAUDE.md, 階段 10b); everything else is left out on purpose
const JYUTPING_10B_CHECKED = { 泯: "man5", 蔽: "bai3", 謗: "bong3", 柑: "gam1", 庖: "paau4", 雞肋: "gai1 laak6", 噬: "sai6", 噪: "cou3" };

t("prose 10b: the 8 passages exist, are all level s2 and spread their correct answers (10 per position, at least 3 positions each)", () => {
  const batch = batch10b();
  batch.forEach((x, i) => assert.ok(x, `missing ${PROSE_10B[i]}`));
  assert.ok(batch.every((x) => x.level === "s2"));
  assert.equal(PROSE.filter((x) => x.level === "s2").length, 8);
  const n = [0, 0, 0, 0];
  for (const x of batch) {
    const idx = x.questions.map((q) => q.correctIndex);
    assert.ok(new Set(idx).size >= 3, `${x.id}: correct answers sit in only ${new Set(idx).size} positions`);
    idx.forEach((i) => n[i]++);
    assert.ok(x.lines.length >= 3 && x.glossary.length >= 3, `${x.id}`);
  }
  assert.deepEqual(n, [10, 10, 10, 10]);
});

t("prose 10b: 愚公移山 was not used (edition differences could not be settled); 荀巨伯遠看友人疾 stands in", () => {
  assert.ok(!PROSE.some((x) => /愚公/.test(x.title)));
  assert.ok(PROSE.some((x) => x.id === "xun-ju-bo-yuan-kan-you-ren-ji" && x.source === "《世說新語．德行》"));
});

t("prose 10b: a 節錄 title says so in the 背景; the 楊修之死 background says it is a novel and that 史書 (《後漢書》) is the reference", () => {
  for (const x of batch10b()) if (/節錄/.test(x.title)) assert.ok(/節錄/.test(x.background), `${x.id}: background does not describe the excerpt`);
  const yx = PROSE.find((x) => x.id === "yang-xiu-zhi-si");
  for (const w of ["《三國演義》", "小說", "《後漢書》", "史實"]) assert.ok(yx.background.includes(w), `楊修之死 background lacks ${w}`);
  assert.ok(/^《三國演義》/.test(yx.source));
});

t("prose 10b: no 粵拼 except the ones checked against a dictionary page", () => {
  for (const x of batch10b()) {
    for (const g of x.glossary) {
      if (g.jyutping === undefined) continue;
      assert.equal(JYUTPING_10B_CHECKED[g.term], g.jyutping, `${x.id}: unchecked jyutping for 「${g.term}」`);
    }
  }
});

t("prose 10b: never 「中三」, never claims a passage is 中二 / 中三; 書面語 (no colloquial words; 同 only in ordinary written compounds)", () => {
  const colloquial = ["呢個", "呢度", "呢啲", "呢次", "咩", "嘅", "咗", "唔", "喺", "哋", "嘢", "啲", "佢", "冇", "乜", "嚟", "點解", "邊個", "而家", "即刻", "嗰", "咁", "好似"];
  const okTong = ["同學", "同時", "相同", "共同", "同情", "不同", "同一", "同樣", "同鄉", "同窗", "同類", "同宗族"];
  for (const x of batch10b()) {
    const all = [x.id, ...x.lines, ...shown10b(x)].join("");
    assert.ok(!all.includes("中三") && !all.includes("中二"), `${x.id}: mentions a school year`);
    for (const s of shown10b(x)) {
      for (const w of colloquial) assert.ok(!s.includes(w), `${x.id}: colloquial 「${w}」 in 「${s}」`);
      let rest = s;
      for (const ok of okTong) rest = rest.split(ok).join("");
      rest = rest.split("同「").join(""); // 字詞註釋 「同「繞」」 (= 通「繞」)
      assert.ok(!rest.includes("同"), `${x.id}: 「同」 used outside an ordinary compound in 「${s}」`);
    }
  }
});

t("prose 10b: 原文 keeps the 教育局 / textbook wording that was settled (no variant slipped in)", () => {
  const text = (id) => PROSE.find((x) => x.id === id).lines.join("");
  // 傷仲永: 予 (not 余) and 邪 (not 耶), as in the 教育局 text; 鄒忌: 羣臣, 蔽; 賣柑者言: 剖之如有煙撲口鼻, 御 (not 禦, per the 教育局 PDF check), 糜; 楊修之死: 沈吟, 臨時慌亂, 遂亦收拾行裝
  assert.ok(text("shang-zhong-yong").includes("予聞之也久") && text("shang-zhong-yong").endsWith("得為眾人而已邪？"));
  assert.ok(text("zou-ji-feng-qi-wang-na-jian").includes("羣臣吏民") && text("zou-ji-feng-qi-wang-na-jian").includes("王之蔽甚矣"));
  assert.ok(text("mai-gan-zhe-yan").includes("剖之如有煙撲口鼻") && text("mai-gan-zhe-yan").includes("不知御") && text("mai-gan-zhe-yan").includes("坐糜廩粟"));
  assert.ok(text("mai-gan-zhe-yan").includes("吾售之，人取之，未聞有言，而獨不足於子乎？世之為欺者，不寡矣") && !text("mai-gan-zhe-yan").includes("……"), "賣柑者言: the vendor's sentence is written out, no omission marker");
  assert.ok(text("yang-xiu-zhi-si").includes("正沈吟間") && text("yang-xiu-zhi-si").includes("臨時慌亂") && text("yang-xiu-zhi-si").includes("遂亦收拾行裝"));
  assert.ok(text("xi-guan-shuo").includes("蹴然以驚") && text("xi-guan-shuo").includes("何以天下國家為"));
  assert.ok(text("mao-bu-que").includes("噪而逐貓") && text("mao-bu-que").includes("烏虖"));
  assert.ok(text("guan-ning-hua-xin-gong-yuan-zhong-chu-cai").includes("寧讀如故"));
  assert.ok(text("xun-ju-bo-yuan-kan-you-ren-ji").includes("敗義以求生") && text("xun-ju-bo-yuan-kan-you-ren-ji").includes("遂班軍而還"));
});

// 階段 10b: 對照教育局《初中建議學習篇章》PDF 逐字核對後，用字及標點全部跟教育局版（傷仲永、貓捕雀完全一致，未改）
t("prose 10b 教育局 PDF 對照: 3 處用字 (御 / 噫 / 遶) 及逐句標點已跟教育局版，舊寫法沒有殘留", () => {
  const get = (id) => PROSE.find((x) => x.id === id);
  const lines = (id) => get(id).lines.join("");
  const every = (id) => JSON.stringify([get(id).lines, get(id).lineExplanations, get(id).glossary, get(id).questions, get(id).background]);
  // 用字
  assert.ok(lines("mai-gan-zhe-yan").includes("盜起而不知御") && !lines("mai-gan-zhe-yan").includes("不知禦"));
  assert.ok(!every("mai-gan-zhe-yan").includes("不知禦"), "賣柑者言: no 「不知禦」 left in any field");
  assert.ok(get("mai-gan-zhe-yan").questions[4].prompt.includes("盜起而不知御，民困而不知救"));
  assert.deepEqual(get("mai-gan-zhe-yan").glossary.find((g) => g.term === "御"), { term: "御", meaning: "通「禦」，抵禦" });
  assert.ok(lines("xi-guan-shuo").includes("噫！習之中人甚矣哉") && !lines("xi-guan-shuo").includes("嗚呼") && !every("xi-guan-shuo").includes("嗚呼"));
  assert.ok(lines("yang-xiu-zhi-si").includes("遶寨私行") && !every("yang-xiu-zhi-si").includes("繞寨私行"));
  assert.deepEqual(get("yang-xiu-zhi-si").glossary.find((g) => g.term === "遶"), { term: "遶", meaning: "同「繞」，繞着" });
  // 貓捕雀: 「烏虖」 的註釋 「相當於「嗚呼」」 是正確的，不改
  assert.ok(get("mao-bu-que").glossary.some((g) => g.term === "烏虖" && g.meaning.includes("嗚呼")));
  // 標點: [id, 新寫法 (必須在 lines)], [id, 舊寫法 (所有欄位都不得出現)]
  const NEW = [
    ["zou-ji-feng-qi-wang-na-jian", "宮婦左右，莫不私王；朝廷之臣，莫不畏王，四境之內，莫不有求於王。由此觀之，王之蔽甚矣。"],
    ["mai-gan-zhe-yan", "將以實籩豆、奉祭祀、供賓客乎"], ["mai-gan-zhe-yan", "甚矣哉，為欺也！"], ["mai-gan-zhe-yan", "吾業是有年矣。吾賴是以食吾軀"], ["mai-gan-zhe-yan", "世之為欺者，不寡矣"],
    ["mai-gan-zhe-yan", "授孫吳之略耶"], ["mai-gan-zhe-yan", "建伊皋之業耶"], ["mai-gan-zhe-yan", "坐糜廩粟而不知恥；"], ["mai-gan-zhe-yan", "敗絮其中也哉！"],
    ["yang-xiu-zhi-si", "適庖官進雞湯，操見碗中有雞肋"], ["yang-xiu-zhi-si", "稟請夜間口號，操隨口曰：「雞肋，雞肋。」"], ["yang-xiu-zhi-si", "行軍主簿楊修見傳"], ["yang-xiu-zhi-si", "有人報知夏侯惇，惇大驚"],
    ["yang-xiu-zhi-si", "不日將退兵歸也。雞肋者"], ["yang-xiu-zhi-si", "必班師矣，故先收拾行裝"], ["yang-xiu-zhi-si", "公真知魏王肺腑也。"], ["yang-xiu-zhi-si", "遂亦收拾行裝，於是寨中諸將"],
    ["yang-xiu-zhi-si", "主簿楊德祖，先知大王欲歸之意"], ["yang-xiu-zhi-si", "造言亂我軍心"],
    ["xi-guan-shuo", "何以天下國家為？"], ["xi-guan-shuo", "坦然則既平矣！已而復然"],
    ["guan-ning-hua-xin-gong-yuan-zhong-chu-cai", "寧割席分坐曰：「子非吾友也。」"],
    ["xun-ju-bo-yuan-kan-you-ren-ji", "子令吾去；敗義以求生"],
  ];
  for (const [id, str] of NEW) assert.ok(lines(id).includes(str), `${id}: 「${str}」 is not in lines`);
  const OLD = [
    ["zou-ji-feng-qi-wang-na-jian", "宮婦左右莫不私王"], ["mai-gan-zhe-yan", "將以實籩豆，奉祭祀"], ["mai-gan-zhe-yan", "甚矣哉為欺也"], ["mai-gan-zhe-yan", "吾業是有年矣，吾賴是"], ["mai-gan-zhe-yan", "世之為欺者不寡矣"],
    ["mai-gan-zhe-yan", "孫、吳"], ["mai-gan-zhe-yan", "伊、皋"], ["mai-gan-zhe-yan", "而不知恥。"], ["mai-gan-zhe-yan", "敗絮其中也哉？"],
    ["yang-xiu-zhi-si", "適庖官進雞湯。"], ["yang-xiu-zhi-si", "雞肋！"], ["yang-xiu-zhi-si", "楊修，見傳"], ["yang-xiu-zhi-si", "夏侯惇。惇大驚"], ["yang-xiu-zhi-si", "歸也：雞肋"], ["yang-xiu-zhi-si", "矣。故先"],
    ["yang-xiu-zhi-si", "肺腑也！"], ["yang-xiu-zhi-si", "行裝。於是"], ["yang-xiu-zhi-si", "楊德祖先知"], ["yang-xiu-zhi-si", "造言，亂"],
    ["xi-guan-shuo", "國家為！"], ["xi-guan-shuo", "平矣。已而"], ["guan-ning-hua-xin-gong-yuan-zhong-chu-cai", "分坐，曰"], ["guan-ning-hua-xin-gong-yuan-zhong-chu-cai", "吾友也！"], ["xun-ju-bo-yuan-kan-you-ren-ji", "吾去，敗義"],
  ];
  for (const [id, str] of OLD) assert.ok(!every(id).includes(str), `${id}: old wording 「${str}」 is still somewhere`);
});

// 階段 10b 審核後修正
t("prose 10b review fixes: 賣柑者言 asks about 「涉」 (not 「鬻」) and glosses 鬻 as 本義是賣; the 背景 sentences the user corrected", () => {
  const get = (id) => PROSE.find((x) => x.id === id);
  const mg = get("mai-gan-zhe-yan");
  const q4 = mg.questions[3];
  assert.equal(q4.prompt, "字詞解釋：「涉寒暑不潰」的「涉」，在句中的意思是");
  assert.deepEqual([...q4.options].sort(), ["涉水", "牽連", "經歷", "干預"].sort());
  assert.equal(q4.options[q4.correctIndex], "經歷");
  assert.equal(mg.glossary.find((g) => g.term === "鬻").meaning, "本義是賣，課文這裏解作買");
  assert.ok(mg.lineExplanations.every((l) => !l.includes("省略")), "no 「省略」 note left in the 白話");
  assert.ok(!mg.background.includes("各版本用字不同") && mg.background.includes("最後一段"));
  assert.ok(!get("xi-guan-shuo").background.includes("篇幅比原文簡短") && get("xi-guan-shuo").background.includes("〈習說〉"));
  const gn = get("guan-ning-hua-xin-gong-yuan-zhong-chu-cai").background;
  assert.ok(gn.includes("兩人本是朋友") && !gn.includes("同窗"));
  const zj = get("zou-ji-feng-qi-wang-na-jian").background;
  assert.ok(zj.includes("大抵不是一時一人之作，後來由西漢劉向整理編訂成書") && !zj.includes("秦統一") && !zj.includes("整理編訂為《戰國策》"));
  const yx = get("yang-xiu-zhi-si").background;
  assert.ok(yx.includes("小說中另有楊修的其他故事，這裏沒有收錄") && !yx.includes("課文其餘部分"));
});

// ---------------------------------------------------------------- 閱讀理解
// The 22 passages that existed before 階段 7 C 批 are not edited; three small things in them do not meet the strictest rule below, so they are
// listed here on purpose instead of being silently skipped (see CLAUDE.md, Module 7 → 階段 7 C 批).
const READING_C_BATCH = [
  "yuedu-jianianhua-tonggao-v2", "gei-xiaoxin-de-weiwen-xin-v2", "xiao-chushi-de-diyi-wan-mian-v2", "shumu-de-nianlun-v2",
  "canguan-huishou-zhongxin-dianyou-v2", "waigong-de-suanpan-v2", "haishui-weishenme-shi-xian-de-v2", "zhi-de-gushi-v2",
  "jianyi-jiuwu-jiaohuanri-xin-v2", "moca-li-de-liang-mian-v2", "zhinanzhen-yu-cipianjiao-v2", "kuanrong-bushi-ruanruo-v2",
];
// 階段 10c-1: the first 8 中二 (s2) passages.
const READING_S2 = [
  "tibu-qiuyuan-v2", "waipo-de-jiu-xiangbu-v2", "yi-ba-jiechu-de-yusan-v2", "taifeng-shi-zenyang-xingcheng-de-v2",
  "chaoxi-weishenme-meitian-dou-you-zhangluo-v2", "duli-sikao-yu-renyun-yiyun-v2", "zhiben-shu-yu-dianzishu-v2", "shenqing-tushuguan-dashi-xin-v2",
];
// 階段 10c-2: the second 8 中二 (s2) passages (16 s2 passages in total).
const READING_S2_B = [
  "diyici-duzi-dache-v2", "chufang-li-de-fuqin-v2", "banjia-nayitian-v2", "shengyin-shi-zenyang-chuanbo-de-v2",
  "maipu-de-houniao-v2", "gongping-yu-pingdeng-de-fenbie-v2", "jieyue-yu-langfei-v2", "yaoqing-xiaoyou-fenxiang-shengxue-dianyou-v2",
];
const READING_S2_ALL = [...READING_S2, ...READING_S2_B];
const READING_VOCAB_EXCEPTIONS = ["wangluo-xianjing-v2", "chengshi-de-xuanze-v2"]; // vocab term written differently from the passage text
const READING_OPEN_MARKS_EXCEPTIONS = ["baoyu-wenhua-yichan-v2"]; // a 3-mark open question with 2 reference points
const READING_SKILLS = ["重整", "解釋", "伸展", "評鑑", "成語／詞語解釋", "修辭手法", "詞語運用", "詞語解釋", "語文運用", "說明方法", "成語解釋", "成語運用", "文言句意"];
const NUM_CN = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const paraNo = (s) => (/^\d+$/.test(s) ? Number(s) : s === "十" ? 10 : s[0] === "十" ? 10 + NUM_CN[s[1]] : s.length === 2 && s[1] === "十" ? NUM_CN[s[0]] * 10 : NUM_CN[s]);
const readingQuestions = (x) => [...x.comprehension, ...x.language];
// A passage entry is a string (a numbered paragraph) or { text, align: "right", numbered: false } (署名 / 日期 of a 實用文).
const paraText = (p) => (typeof p === "string" ? p : p && p.text);
const isNumberedPara = (p) => typeof p === "string" || (p && p.numbered !== false);
const numberedCount = (x) => x.passage.filter(isNumberedPara).length;
const readingTexts = (q) => [q.prompt, q.explanation, q.hint, q.scheme, q.modelAnswer, ...(q.points || []), ...(q.options || [])].filter(nonEmpty);

t("reading: 50 passages, unique ids, 12 小五 / 10 小六 / 12 中一 / 16 中二, level only p5 / p6 / s1 / s2", () => {
  assert.equal(READING.length, 50);
  assert.deepEqual(dups(READING.map((x) => x.id)), []);
  for (const x of READING) assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
  const n = countBy(READING, (x) => x.level);
  assert.deepEqual([n.p5, n.p6, n.s1, n.s2], [12, 10, 12, 16]);
  for (const id of READING_C_BATCH) assert.ok(READING.some((x) => x.id === id), `missing ${id}`);
});

// 階段 10c-1: 閱讀理解 is checked against all four levels (only this module and 文言文選讀 have s2 content so far).
t("reading 10c-1 / 10c-2: every one of the four levels has passages; the s2 ids are exactly the 16 agreed ones (8 + 8), unique, all ending -v2", () => {
  for (const lv of READING_FILLED_LEVELS) assert.ok(READING.some((x) => x.level === lv), `閱讀理解 has no ${lv} passage`);
  const s2 = READING.filter((x) => x.level === "s2").map((x) => x.id);
  assert.deepEqual([...s2].sort(), [...READING_S2_ALL].sort());
  assert.equal(s2.length, 16);
  assert.deepEqual(dups(s2), []);
  for (const id of s2) assert.ok(id.endsWith("-v2"), `${id} does not end with -v2`);
});

t("reading: passage is a non-empty array of non-empty strings; every vocab term occurs in the passage", () => {
  for (const x of READING) {
    for (const f of ["id", "title", "genre", "focus"]) assert.ok(nonEmpty(x[f]), `${x.id}.${f} is empty`);
    assert.ok(Array.isArray(x.passage) && x.passage.length >= 3 && x.passage.every((p) => nonEmpty(paraText(p))), `${x.id}.passage`);
    assert.ok(Array.isArray(x.vocab) && x.vocab.length >= 2, `${x.id}.vocab`);
    if (READING_VOCAB_EXCEPTIONS.includes(x.id)) continue;
    const text = x.passage.map(paraText).join("");
    for (const v of x.vocab) assert.ok(nonEmpty(v.term) && nonEmpty(v.meaning) && text.includes(v.term), `${x.id}: vocab term 「${v.term}」 is not in the passage`);
  }
});

t("reading: every question has a known skill, positive integer marks and a non-empty prompt", () => {
  for (const x of READING) {
    for (const q of readingQuestions(x)) {
      assert.ok(nonEmpty(q.prompt), `${x.id}: empty prompt`);
      assert.ok(READING_SKILLS.includes(q.skill), `${x.id}: unknown skill 「${q.skill}」`);
      assert.ok(Number.isInteger(q.marks) && q.marks > 0, `${x.id}: marks ${q.marks} in 「${q.prompt}」`);
    }
  }
});

t("reading: mc has 4 different options and an in-range answer; multi has 5 different options and two different in-range answers; both have an explanation", () => {
  for (const x of READING) {
    for (const q of readingQuestions(x)) {
      if (q.kind === "mc") {
        assert.equal(q.options.length, 4, `${x.id}: 「${q.prompt}」`);
        assert.ok(q.options.every(nonEmpty) && new Set(q.options).size === 4, `${x.id}: repeated / empty option in 「${q.prompt}」`);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3, `${x.id}: answer ${q.answer}`);
        assert.ok(nonEmpty(q.explanation), `${x.id}: no explanation for 「${q.prompt}」`);
      } else if (q.kind === "multi") {
        assert.equal(q.options.length, 5, `${x.id}: 「${q.prompt}」`);
        assert.ok(q.options.every(nonEmpty) && new Set(q.options).size === 5, `${x.id}: repeated / empty option in 「${q.prompt}」`);
        assert.ok(Array.isArray(q.answer) && q.answer.length === 2 && q.answer[0] !== q.answer[1], `${x.id}: multi answer ${q.answer}`);
        assert.ok(q.answer.every((i) => Number.isInteger(i) && i >= 0 && i <= 4), `${x.id}: multi answer ${q.answer}`);
        assert.ok(nonEmpty(q.explanation), `${x.id}: no explanation for 「${q.prompt}」`);
      } else {
        assert.equal(q.kind, "open", `${x.id}: unknown kind ${q.kind}`);
      }
    }
  }
});

t("reading: open questions have hint, points, scheme and modelAnswer, and their marks do not exceed the number of reference points", () => {
  for (const x of READING) {
    for (const q of x.comprehension.filter((y) => y.kind === "open")) {
      assert.ok(nonEmpty(q.hint) && nonEmpty(q.scheme) && nonEmpty(q.modelAnswer), `${x.id}: 「${q.prompt}」 lacks hint / scheme / modelAnswer`);
      assert.ok(Array.isArray(q.points) && q.points.length >= 2 && q.points.every(nonEmpty), `${x.id}: points of 「${q.prompt}」`);
      if (!READING_OPEN_MARKS_EXCEPTIONS.includes(x.id)) assert.ok(q.marks <= q.points.length, `${x.id}: ${q.marks} marks but only ${q.points.length} points in 「${q.prompt}」`);
    }
  }
});

t("reading: every 「第 N 段」 mentioned in a question, explanation, hint or answer is a numbered paragraph that exists", () => {
  for (const x of READING) {
    for (const q of readingQuestions(x)) {
      for (const text of readingTexts(q)) {
        for (const m of text.matchAll(/第([一二三四五六七八九十]+|\d+)段/g)) {
          const n = paraNo(m[1]);
          assert.ok(n >= 1 && n <= numberedCount(x), `${x.id}: 「${m[0]}」 but the passage has ${numberedCount(x)} numbered paragraphs (in 「${q.prompt}」)`);
        }
      }
    }
  }
});

t("reading: an un-numbered passage entry is { text, align: \"right\", numbered: false }, comes only at the very end (at most the last two), and the numbering of the others is unchanged", () => {
  for (const x of READING) {
    x.passage.forEach((p, i) => {
      if (typeof p === "string") return;
      assert.deepEqual(Object.keys(p).sort(), ["align", "numbered", "text"], `${x.id}: passage[${i}] has keys ${Object.keys(p)}`);
      assert.equal(p.align, "right", `${x.id}: passage[${i}].align`);
      assert.equal(p.numbered, false, `${x.id}: passage[${i}].numbered`);
      assert.ok(i >= x.passage.length - 2, `${x.id}: un-numbered entry passage[${i}] is not one of the last two`);
    });
    const firstOff = x.passage.findIndex((p) => !isNumberedPara(p));
    if (firstOff >= 0) assert.ok(x.passage.slice(firstOff).every((p) => !isNumberedPara(p)), `${x.id}: a numbered paragraph follows an un-numbered one`);
    assert.ok(numberedCount(x) >= 3, `${x.id}: fewer than 3 numbered paragraphs`);
  }
});

t("reading: every 實用文 ends with exactly two un-numbered right-aligned entries (署名, 日期); no other passage has any", () => {
  for (const x of READING) {
    const off = x.passage.filter((p) => !isNumberedPara(p)).length;
    if (x.genre.startsWith("實用文")) assert.equal(off, 2, `${x.id}: ${off} un-numbered entries`);
    else assert.equal(off, 0, `${x.id}: a ${x.genre} has un-numbered entries`);
  }
});

t("reading C 批: the genres per level — 小五 通告 / 書信 / 記敘文 / 說明文; 小六 電郵 / 記敘文 / 2 × 說明文; 中一 建議信 / 2 × 說明文 / 議論文", () => {
  const batch = READING_C_BATCH.map((id) => READING.find((x) => x.id === id));
  const lv = (l) => batch.filter((x) => x.level === l).map((x) => x.genre);
  assert.deepEqual(lv("p5").sort(), ["記敘文", "說明文", "實用文（書信）", "實用文（通告）"].sort());
  assert.deepEqual(lv("p6").sort(), ["記敘文", "說明文", "說明文", "實用文（電郵）"].sort());
  assert.deepEqual(lv("s1").sort(), ["議論文", "說明文", "說明文", "實用文（建議信）"].sort());
});

t("reading C 批: question counts (小五 6 + 3, 小六 / 中一 7 + 3), all three kinds present, mc / multi explanations cite 「第 N 段」, scheme states the total marks", () => {
  for (const id of READING_C_BATCH) {
    const x = READING.find((y) => y.id === id);
    assert.equal(x.comprehension.length, x.level === "p5" ? 6 : 7, `${id}: ${x.comprehension.length} comprehension questions`);
    assert.equal(x.language.length, 3, `${id}: ${x.language.length} language questions`);
    assert.equal(x.vocab.length, x.level === "p5" ? 2 : 3, `${id}: ${x.vocab.length} vocab terms`);
    const kinds = new Set(x.comprehension.map((q) => q.kind));
    for (const k of ["mc", "multi", "open"]) assert.ok(kinds.has(k), `${id}: no ${k} question`);
    assert.ok(x.language.every((q) => q.kind === "mc"), `${id}: language questions must all be mc`);
    for (const q of readingQuestions(x)) {
      if (q.kind !== "open") assert.ok(/第([一二三四五六七八九十]+|\d+)段/.test(q.explanation), `${id}: explanation of 「${q.prompt}」 cites no paragraph`);
      else assert.ok(q.scheme.includes(`共 ${q.marks} 分`), `${id}: scheme of 「${q.prompt}」 does not state 共 ${q.marks} 分`);
    }
    const total = readingQuestions(x).reduce((s, q) => s + q.marks, 0);
    assert.ok(total >= 11 && total <= 15, `${id}: total ${total} marks`);
  }
});

t("reading C 批: passage length in 漢字 — 實用文 300–500, 小五 450–620, 小六 540–810, 中一 690–850", () => {
  const han = (s) => (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const range = { p5: [450, 620], p6: [540, 810], s1: [690, 850] };
  for (const id of READING_C_BATCH) {
    const x = READING.find((y) => y.id === id);
    const n = x.passage.reduce((s, p) => s + han(paraText(p)), 0);
    const [lo, hi] = x.genre.startsWith("實用文") ? [300, 500] : range[x.level];
    assert.ok(n >= lo && n <= hi, `${id}: ${n} 漢字, expected ${lo}–${hi}`);
  }
});

const s2Reading = () => READING_S2_ALL.map((id) => READING.find((y) => y.id === id)); // all 16 s2 passages
const s2ReadingA = () => READING_S2.map((id) => READING.find((y) => y.id === id)); // 10c-1
const s2ReadingB = () => READING_S2_B.map((id) => READING.find((y) => y.id === id)); // 10c-2
const s2ReadingStrings = (x) => [x.title, x.genre, x.focus, ...x.passage.map(paraText), ...x.vocab.flatMap((v) => [v.term, v.meaning]), ...readingQuestions(x).flatMap(readingTexts)];

t("reading 10c-1: the genres — 3 × 記敘文 (one 兼議論), 2 × 說明文, 2 × 議論文, 1 × 實用文（申請信）", () => {
  const genres = s2ReadingA().map((x) => x.genre).sort();
  assert.deepEqual(genres, ["實用文（申請信）", "記敘文", "記敘文", "記敘文（兼議論）", "說明文", "說明文", "議論文", "議論文"].sort());
});

t("reading 10c-1 / 10c-2 (all 16 s2): 7 理解 + 3 語文 questions, 3 vocab terms, mc + multi + open present, language all mc, explanations cite 「第 N 段」, scheme states 共 N 分, total 11–15 marks", () => {
  for (const x of s2Reading()) {
    assert.equal(x.comprehension.length, 7, `${x.id}: ${x.comprehension.length} comprehension questions`);
    assert.equal(x.language.length, 3, `${x.id}: ${x.language.length} language questions`);
    assert.equal(x.vocab.length, 3, `${x.id}: ${x.vocab.length} vocab terms`);
    const kinds = new Set(x.comprehension.map((q) => q.kind));
    for (const k of ["mc", "multi", "open"]) assert.ok(kinds.has(k), `${x.id}: no ${k} question`);
    assert.ok(x.language.every((q) => q.kind === "mc"), `${x.id}: language questions must all be mc`);
    for (const q of readingQuestions(x)) {
      if (q.kind !== "open") {
        assert.ok(/第([一二三四五六七八九十]+|\d+)段/.test(q.explanation), `${x.id}: explanation of 「${q.prompt}」 cites no paragraph`);
        assert.ok(!/選項\s?[ABCD]|[（(][ABCD][)）]|\b[ABCD][項.．、:：]/.test(q.explanation), `${x.id}: explanation of 「${q.prompt}」 refers to an option letter`);
      } else assert.ok(q.scheme.includes(`共 ${q.marks} 分`), `${x.id}: scheme of 「${q.prompt}」 does not state 共 ${q.marks} 分`);
    }
    const total = readingQuestions(x).reduce((s, q) => s + q.marks, 0);
    assert.ok(total >= 11 && total <= 15, `${x.id}: total ${total} marks`);
    assert.ok(x.comprehension.filter((q) => q.kind === "open").length >= 1 && x.comprehension.some((q) => q.kind === "multi" && /哪兩項/.test(q.prompt)), `${x.id}: needs an open question and a 「哪兩項」 multi question`);
  }
});

t("reading 10c-1 / 10c-2 (all 16 s2): passage length in 漢字 — 記敘文 / 說明文 / 議論文 750–950, 實用文 400–600", () => {
  const han = (s) => (s.match(/[一-鿿]/g) || []).length;
  for (const x of s2Reading()) {
    const n = x.passage.reduce((s, p) => s + han(paraText(p)), 0);
    const [lo, hi] = x.genre.startsWith("實用文") ? [400, 600] : [750, 950];
    assert.ok(n >= lo && n <= hi, `${x.id}: ${n} 漢字, expected ${lo}–${hi}`);
  }
});

t("reading 10c-1: the 實用文 ends with 署名 and 日期 as un-numbered right-aligned entries, keeps 稱呼 first and 結語 before them", () => {
  const x = READING.find((y) => y.id === "shenqing-tushuguan-dashi-xin-v2");
  const n = x.passage.length;
  assert.deepEqual(x.passage[n - 2], { text: "申請人　中二丙班　黎思朗　謹上", align: "right", numbered: false });
  assert.deepEqual(x.passage[n - 1], { text: "二〇二六年十一月九日", align: "right", numbered: false });
  assert.ok(x.passage[0].endsWith("：") && typeof x.passage[0] === "string", "稱呼 should come first");
  assert.ok(typeof x.passage[n - 3] === "string" && x.passage[n - 3].includes("敬禮"), "結語 should come right before the 署名");
  for (const q of readingQuestions(x)) for (const text of readingTexts(q)) for (const m of text.matchAll(/第([一二三四五六七八九十]+|\d+)段/g)) assert.ok(paraNo(m[1]) <= numberedCount(x), `${x.id}: ${m[0]} is beyond the numbered paragraphs`);
});

t("reading 10c-1 / 10c-2 (all 16 s2): never 「中三」; no skill 「文言句意」 (no 原文 is used); 書面語 (no colloquial words; 同 only in ordinary written compounds; 甚麼 not 什麼)", () => {
  const colloquial = ["呢個", "呢度", "呢啲", "呢次", "咩", "嘅", "咗", "唔", "喺", "哋", "嘢", "啲", "佢", "冇", "乜", "嚟", "點解", "邊個", "而家", "即刻", "嗰", "咁", "好似", "什麼", "裡"];
  const okTong = ["同學", "同時", "相同", "共同", "同情", "不同", "同一", "同樣", "同桌", "陪同", "同意", "一視同仁"];
  for (const x of s2Reading()) {
    for (const s of s2ReadingStrings(x)) {
      assert.ok(!s.includes("中三"), `${x.id}: 「中三」 in 「${s.slice(0, 20)}」`);
      for (const w of colloquial) assert.ok(!s.includes(w), `${x.id}: colloquial 「${w}」 in 「${s.slice(0, 30)}」`);
      let rest = s;
      for (const ok of okTong) rest = rest.split(ok).join("");
      assert.ok(!rest.includes("同"), `${x.id}: 「同」 used outside an ordinary compound in 「${s.slice(0, 30)}」`);
    }
    assert.ok(readingQuestions(x).every((q) => q.skill !== "文言句意"), `${x.id}: uses 文言句意`);
  }
});

t("reading 10c-1: the two 說明文 facts — the 警告信號 wording and numbers, and the tide numbers, are the ones agreed with the 天文台 / HKO sources", () => {
  const tf = READING.find((y) => y.id === "taifeng-shi-zenyang-xingcheng-de-v2").passage.join("");
  for (const s of ["一號戒備信號", "三號強風信號", "八號烈風或暴風信號", "九號烈風或暴風風力增強信號", "十號颶風信號", "每小時四十一至六十二公里", "每小時六十三至一百一十七公里", "每小時一百一十八公里或以上", "約八百公里", "攝氏二十六點五度或以上"]) assert.ok(tf.includes(s), `颱風: missing 「${s}」`);
  assert.ok(!/二號|四號|五號|六號|七號/.test(tf), "颱風: only the signals 1 / 3 / 8 / 9 / 10 are named");
  const cx = READING.find((y) => y.id === "chaoxi-weishenme-meitian-dou-you-zhangluo-v2").passage.join("");
  for (const s of ["十二小時二十五分", "約五十分鐘", "新月和滿月", "上弦月和下弦月", "大潮", "小潮", "約為月球的一半"]) assert.ok(cx.includes(s), `潮汐: missing 「${s}」`);
});

// 階段 10c-1 審核後修正: options are shuffled on every attempt, so an explanation must never point to an option by its position.
t("reading (all levels): no explanation points to an option by position (「第 N 句 / 項 / 個選項」, 「選項一」, 「最後一項」 …); 「第 N 段」 is a paragraph and is fine", () => {
  const byPosition = /第[一二三四五六七八九十\d]+(句|項|個選項|個答案|個選擇|選)|選項[一二三四五1-5]|最後一項|首項|上一項|下一項/;
  for (const x of READING) for (const q of readingQuestions(x)) {
    if (nonEmpty(q.explanation)) assert.ok(!byPosition.test(q.explanation), `${x.id}: explanation of 「${q.prompt}」 points to an option by position`);
  }
});

t("reading 10c-1 review fixes: 小潮 is 「部分互相抵消」 everywhere; the two 詞語運用 explanations quote the right sentence; 拐杖 (not 柺杖)", () => {
  const cx = READING.find((y) => y.id === "chaoxi-weishenme-meitian-dou-you-zhangluo-v2");
  const cxAll = [...cx.passage, ...readingQuestions(cx).flatMap(readingTexts)].join("\n");
  assert.ok(cxAll.includes("兩者的引力部分互相抵消，漲落的幅度最小"), "passage 4: 小潮 sentence");
  assert.ok(!cxAll.includes("引力互相抵消") && (cxAll.match(/互相抵消/g) || []).length === 4 && (cxAll.match(/部分互相抵消/g) || []).length === 4, "every 互相抵消 in the tide passage is 部分互相抵消");
  const q3 = cx.language[2];
  assert.equal(q3.prompt, "第四段「兩者的引力部分互相抵消」中，「抵消」的意思是");
  assert.ok(q3.explanation.includes("作用有一部分互相消去") && !q3.explanation.includes("作用互相消去"));
  const wrong = cx.comprehension[3].options;
  assert.ok(wrong.includes("太陽、月球和地球成直角，引力部分互相抵消") && wrong.includes("太陽、月球和地球大致排成一直線，兩者的引力互相配合"));
  assert.equal(cx.comprehension[3].options[cx.comprehension[3].answer], "太陽、月球和地球大致排成一直線，兩者的引力互相配合");
  assert.ok(cx.comprehension[4].explanation.includes("這時兩者的引力部分互相抵消，漲落的幅度最小"));
  const dl = READING.find((y) => y.id === "duli-sikao-yu-renyun-yiyun-v2").language[2];
  assert.ok(dl.explanation.includes("只有「大家都說這部電影好看，他沒有看過，也隨聲附和地稱讚了一番」的情況，符合這個意思。"));
  assert.equal(dl.options[dl.answer], "大家都說這部電影好看，他沒有看過，也隨聲附和地稱讚了一番。");
  const sq = READING.find((y) => y.id === "shenqing-tushuguan-dashi-xin-v2").language[1];
  assert.ok(sq.explanation.includes("只有「得悉學校將舉辦書展，我立即向老師查詢詳情」的用法正確。"));
  assert.equal(sq.options[sq.answer], "得悉學校將舉辦書展，我立即向老師查詢詳情。");
  const tb = READING.find((y) => y.id === "tibu-qiuyuan-v2").passage.join("");
  assert.ok(tb.includes("阿傑拄着拐杖") && !tb.includes("柺"));
  for (const x of s2Reading()) assert.ok(!s2ReadingStrings(x).some((s) => s.includes("柺")), `${x.id}: 柺`);
});

// ---- 階段 10c-2: the second batch of 8 中二 passages ----
t("reading 10c-2: the genres — 3 × 記敘文, 2 × 說明文, 2 × 議論文, 1 × 實用文（電郵）", () => {
  const genres = s2ReadingB().map((x) => x.genre).sort();
  assert.deepEqual(genres, ["實用文（電郵）", "記敘文", "記敘文", "記敘文", "說明文", "說明文", "議論文", "議論文"].sort());
});

t("reading 10c-2: the 實用文（電郵） has 收件人 / 主旨 / 稱呼 first, 結語 before 署名 and 日期 (un-numbered, right-aligned); every weekday written matches the 2026 calendar", () => {
  const x = READING.find((y) => y.id === "yaoqing-xiaoyou-fenxiang-shengxue-dianyou-v2");
  const n = x.passage.length;
  assert.ok(x.passage[0].startsWith("收件人：") && x.passage[1].startsWith("主旨：") && x.passage[2].endsWith("："), "收件人 / 主旨 / 稱呼");
  assert.deepEqual(x.passage[n - 2], { text: "朗悅中學學生會學術組組長　林芷晴　謹上", align: "right", numbered: false });
  assert.deepEqual(x.passage[n - 1], { text: "二〇二六年十一月十六日", align: "right", numbered: false });
  assert.ok(typeof x.passage[n - 3] === "string" && x.passage[n - 3].includes("敬禮"));
  const DIG = { 〇: 0, 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const num = (str) => (str === "十" ? 10 : str.length === 1 ? DIG[str] : str[0] === "十" ? 10 + DIG[str[1]] : str.length === 2 && str[1] === "十" ? DIG[str[0]] * 10 : DIG[str[0]] * 10 + DIG[str[2]]);
  const text = x.passage.map(paraText).join("");
  let seen = 0;
  for (const m of text.matchAll(/二〇(二六|二七)年([一二三四五六七八九十]+)月([一二三四五六七八九十]+)日（星期([一二三四五六日])）/g)) {
    seen++;
    const date = new Date(Date.UTC(2026 + (m[1] === "二七" ? 1 : 0), num(m[2]) - 1, num(m[3])));
    assert.equal("日一二三四五六"[date.getUTCDay()], m[4], `${m[0]} is not a ${m[4]}`);
  }
  assert.ok(seen >= 1, "expected at least one dated weekday");
  const m2 = text.match(/十一月三十日（星期([一二三四五六日])）/);
  assert.ok(m2 && "日一二三四五六"[new Date(Date.UTC(2026, 10, 30)).getUTCDay()] === m2[1], "十一月三十日 weekday");
});

t("reading 10c-2: answer options of one mc have similar length (longest ≤ 1.35 × shortest) and the correct option is the single longest one in at most 50% of the mc questions", () => {
  let mcN = 0, longest = 0;
  const worst = [];
  for (const x of s2ReadingB()) for (const q of readingQuestions(x)) {
    if (q.kind !== "mc") continue;
    mcN++;
    const lens = q.options.map((o) => o.length), max = Math.max(...lens), min = Math.min(...lens);
    if (max / min > 1.35) worst.push(`${x.id}: ${q.prompt.slice(0, 20)} (${lens})`);
    if (lens[q.answer] === max && lens.filter((l) => l === max).length === 1) longest++;
  }
  assert.equal(mcN, 56);
  assert.deepEqual(worst, [], "options too different in length");
  assert.ok(longest / mcN <= 0.5, `correct option is the single longest in ${longest}/${mcN}`);
});

t("reading 10c-2: the correct mc answers are spread over the four positions (no position over 35%, none under 15%)", () => {
  const c = [0, 0, 0, 0];
  for (const x of s2ReadingB()) for (const q of readingQuestions(x)) if (q.kind === "mc") c[q.answer]++;
  const total = c.reduce((a, b) => a + b, 0);
  for (const k of c) assert.ok(k / total <= 0.35 && k / total >= 0.15, `positions ${c}`);
});

t("reading 10c-2: the two 說明文 facts — 聲音 numbers and wording, 米埔 wording — are the ones agreed with the sources; nothing uncertain (years, counts) is written", () => {
  const sy = READING.find((y) => y.id === "shengyin-shi-zenyang-chuanbo-de-v2").passage.join("");
  for (const s of ["聲音是由物體的振動產生的", "真空中，聲音就無法傳播", "固體中傳播得最快，液體次之，氣體最慢", "氣溫約攝氏十五度時，聲音每秒約傳播三百四十米", "每秒約一千五百米", "每秒數千米", "零點一秒", "至少要約十七米", "氣溫愈高，聲音傳播得愈快"]) assert.ok(sy.includes(s), `聲音: missing 「${s}」`);
  assert.ok(!/鋼鐵[^，。]*每秒[一二三四五六七八九十百]*千[一二三四五六七八九]?百/.test(sy), "no exact speed for steel is written");
  const mp = READING.find((y) => y.id === "maipu-de-houniao-v2").passage.join("");
  for (const s of ["位於香港新界西北", "由世界自然基金會香港分會管理", "《拉姆薩爾公約》", "東亞—澳大拉西亞遷飛路線", "黑臉琵鷺", "瀕危物種", "基圍本來是漁民養殖蝦的魚塘"]) assert.ok(mp.includes(s), `米埔: missing 「${s}」`);
  assert.ok(!/\d/.test(mp) && !/[一二三四五六七八九〇零]{4}年/.test(mp) && !/年起|年成立|年獲|年列/.test(mp), "米埔: no year or digit is written");
  assert.ok(!/[二三四五六七八九十百千萬]+隻|[二三四五六七八九十百千萬]+種(鳥|候鳥|水鳥)/.test(mp), "米埔: no bird counts are written");
});

t("reading 10c-2 review fixes: 搭車 paragraph 3 and the Q1 explanation agree (the letter was beside the 十七 and not noticed); 米埔 paragraph 8 has no 「從不間斷」", () => {
  const dc = READING.find((y) => y.id === "diyici-duzi-dache-v2");
  assert.ok(dc.passage[2].includes("車頭上方的顯示屏上，一個大大的「十七」十分顯眼，旁邊另有一個小小的字母，我匆忙間沒有留意。"), "paragraph 3");
  assert.ok(!dc.passage[2].includes("號碼牌"), "paragraph 3: no 號碼牌 any more");
  const q1 = dc.comprehension[0];
  assert.ok(q1.explanation.includes("作者只留意到車頭大大的「十七」，沒有留意旁邊的字母"), "Q1 explanation");
  assert.ok(!q1.explanation.includes("見車頭寫着"), "Q1 explanation: old wording gone");
  assert.equal(q1.options[q1.answer], "匆忙登車時只看了車頭的「十七」，沒有留意字母「A」", "Q1 correct option unchanged");
  assert.equal(q1.options.filter((o) => o.includes("沒有留意字母")).length, 1, "Q1 has exactly one option about the missed letter");
  const dcAll = [...dc.passage, ...readingQuestions(dc).flatMap(readingTexts)].join("\n");
  assert.ok(!dcAll.includes("號碼牌"), "no 號碼牌 anywhere in the passage");
  const mp = READING.find((y) => y.id === "maipu-de-houniao-v2");
  const p8 = mp.passage[7];
  assert.ok(p8.includes("牠們正在走一段橫跨數千公里的漫長旅程，") && !p8.includes("從不間斷"), "米埔 paragraph 8");
  assert.ok(p8.includes("漫長旅程"));
});

// ---- 成語學習 (idiomContent.jsx), 階段 8b ----
const ID = loadContent("idiomContent.jsx");
const IDIOMS = ID.IDIOM_ITEMS;
// 階段 8b (A): existing lightweight idioms that were given an `origin` (pinyin / meaning / clue / level untouched).
const IDIOM_8B_ORIGIN_ADDED = ["溫故知新", "有始有終", "九牛一毛", "鶴立雞群", "水落石出", "不翼而飛", "出人頭地", "得心應手", "有備無患", "舉一反三", "不恥下問", "後來居上", "廢寢忘食", "如魚得水", "三思而後行", "依樣畫葫蘆", "更上一層樓", "眾志成城", "不自量力", "自暴自棄", "飲水思源", "取長補短", "精益求精", "大同小異", "知己知彼", "打草驚蛇", "畫虎類犬", "羊質虎皮", "狼子野心", "遊刃有餘", "笑裏藏刀", "一諾千金", "忠言逆耳", "焦頭爛額", "如坐針氈", "生吞活剝", "世外桃源", "高山流水", "草木皆兵", "運籌帷幄", "妄自菲薄", "披荊斬棘", "未雨綢繆", "居安思危", "功虧一簣", "茅塞頓開", "青出於藍", "家徒四壁", "孤掌難鳴", "分道揚鑣", "食言而肥", "從善如流", "以管窺天", "引而不發"];
// 階段 8b (B): idioms added, every field present.
const IDIOM_8B_NEW = ["揠苗助長", "鑿壁偷光", "自相矛盾", "孟母三遷", "熟能生巧", "知足常樂", "事半功倍", "見賢思齊", "禮尚往來", "賓至如歸", "囊螢映雪", "驚弓之鳥", "螳螂捕蟬", "老馬識途", "閉門造車", "三顧茅廬", "畫餅充飢", "抱薪救火", "南轅北轍", "程門立雪", "洛陽紙貴", "一字千金", "聞雞起舞", "韋編三絕", "退避三舍", "約法三章", "管鮑之交", "桃園結義", "門庭若市", "三人成虎", "曲高和寡", "破鏡重圓", "一葉障目", "按圖索驥", "防微杜漸", "緣木求魚", "本末倒置", "謙謙君子", "黃粱一夢", "才高八斗", "江郎才盡", "入木三分", "大智若愚", "當頭棒喝", "一飯千金", "懸壺濟世", "兩袖清風", "安步當車", "溫柔敦厚", "返璞歸真", "妙筆生花", "栩栩如生", "口若懸河", "簞食瓢飲", "擇善而從", "乘風破浪", "傾蓋如故", "投鼠忌器"];
// Older entries whose `origin` / `clue` names the idiom itself — left as they were (the user decides), so they are listed here on purpose.
const IDIOM_OLD_ORIGIN_NAMES_IDIOM = ["半途而廢", "一鳴驚人", "罄竹難書", "尾大不掉", "司空見慣", "每況愈下", "刮目相待", "東窗事發", "孤注一擲", "炙手可熱", "恃強凌弱", "流連忘返", "唇槍舌劍", "鹿死誰手", "無濟於事", "義不容辭", "維妙維肖", "實事求是", "隨波逐流", "獨當一面", "獨佔鰲頭", "鞠躬盡瘁", "鍥而不捨", "豁然開朗", "覆水難收", "歸根結蒂", "躊躇滿志"];
const IDIOM_OLD_CLUE_NAMES_IDIOM = ["恩將仇報", "班門弄斧"];
const idiomByText = (s) => IDIOMS.find((x) => x.idiom === s);
const idiomSlices = (s) => { const r = []; for (let i = 0; i + 3 <= s.length; i++) r.push(s.slice(i, i + 3)); return r; };

t("idiom: 696 items, unique ids and unique idioms (variant characters 卧/臥 and 裡/裏 counted as the same)", () => {
  assert.strictEqual(IDIOMS.length, 696);
  assert.strictEqual(new Set(IDIOMS.map((x) => x.id)).size, IDIOMS.length, "duplicate id");
  assert.strictEqual(new Set(IDIOMS.map((x) => x.idiom)).size, IDIOMS.length, "duplicate idiom");
  const norm = (s) => s.replace(/卧/g, "臥").replace(/裡/g, "裏").replace(/爲/g, "為");
  assert.strictEqual(new Set(IDIOMS.map((x) => norm(x.idiom))).size, IDIOMS.length, "duplicate idiom (variant character)");
});

t("idiom: base fields present, level valid, no comma, pinyin has one syllable per character", () => {
  for (const x of IDIOMS) {
    for (const f of ["id", "idiom", "pinyin", "level", "meaning", "clue"]) {
      assert.ok(typeof x[f] === "string" && x[f].length > 0, `${x.idiom}: missing ${f}`);
    }
    assert.ok(LEVELS.includes(x.level), `${x.idiom}: level ${x.level}`);
    assert.ok(!/[，,、。\s]/.test(x.idiom), `${x.idiom}: contains punctuation`);
    assert.strictEqual(x.pinyin.split(" ").length, x.idiom.length, `${x.idiom}: pinyin syllables`);
    assert.ok(!/[A-Z]/.test(x.pinyin), `${x.idiom}: pinyin must be lower case`);
  }
});

t("idiom 8b: 54 idioms gained an origin, 58 were added; 270 idioms now have an origin", () => {
  assert.strictEqual(IDIOM_8B_ORIGIN_ADDED.length, 54);
  assert.strictEqual(IDIOM_8B_NEW.length, 58);
  assert.strictEqual(IDIOMS.filter((x) => x.origin).length, 158 + 54 + 58);
  for (const s of IDIOM_8B_ORIGIN_ADDED) {
    const x = idiomByText(s);
    assert.ok(x && x.origin && x.origin.length >= 20, `${s}: origin missing or too short`);
  }
});

t("idiom 8b: the 58 new idioms have every field, including origin", () => {
  for (const s of IDIOM_8B_NEW) {
    const x = idiomByText(s);
    assert.ok(x, `${s} missing`);
    for (const f of ["id", "idiom", "pinyin", "level", "meaning", "origin", "clue"]) {
      assert.ok(typeof x[f] === "string" && x[f].length > 0, `${s}: missing ${f}`);
    }
  }
  assert.ok(!IDIOM_8B_NEW.some((s) => IDIOM_8B_ORIGIN_ADDED.includes(s)), "an idiom is in both lists");
});

t("idiom 8b: origin and clue never contain the idiom or three consecutive characters of it (new / 補充 items)", () => {
  for (const s of [...IDIOM_8B_ORIGIN_ADDED, ...IDIOM_8B_NEW]) {
    const x = idiomByText(s);
    for (const f of ["origin", "clue"]) {
      for (const piece of [s, ...idiomSlices(s)]) {
        assert.ok(!x[f].includes(piece), `${s}: ${f} contains "${piece}"`);
      }
    }
  }
});

t("idiom: no origin names its idiom (older entries that still do are listed explicitly and must not grow)", () => {
  const offenders = Array.from(IDIOMS.filter((x) => x.origin && x.origin.includes(x.idiom)).map((x) => x.idiom)).sort();
  assert.deepStrictEqual(offenders, [...IDIOM_OLD_ORIGIN_NAMES_IDIOM].sort());
  const clueOffenders = Array.from(IDIOMS.filter((x) => x.clue.includes(x.idiom)).map((x) => x.idiom)).sort();
  assert.deepStrictEqual(clueOffenders, [...IDIOM_OLD_CLUE_NAMES_IDIOM].sort());
});

t("idiom 8b: new text is 書面語 (no 什麼 / 裡 / colloquial particles)", () => {
  for (const s of [...IDIOM_8B_ORIGIN_ADDED, ...IDIOM_8B_NEW]) {
    const x = idiomByText(s);
    for (const f of ["meaning", "origin", "clue"]) {
      if (!x[f]) continue;
      assert.ok(!/什麼|裡|嘅|咗|唔|喺|呢|咩|啲|冇|睇|佢/.test(x[f]), `${s}: ${f} looks colloquial`);
    }
  }
});

// ---- 歷史故事 (historyContent.jsx), 階段 8c ----
const HI = loadContent("historyContent.jsx");
const HISTORY = HI.HISTORY_ITEMS;
const POEMS_FOR_HISTORY = loadContent("poetryContent.jsx").POETRY_ITEMS;
const HISTORY_8C_NEW = ["xuan-zang-xi-xing", "wang-zhao-jun-chu-sai", "bei-jiu-shi-bing-quan", "li-bing-du-jiang-yan", "wei-xiao-wen-di-qian-du", "yan-zhao-wang-qian-jin-mai-gu", "zhou-ya-fu-xi-liu-ying", "wen-tian-xiang-kang-yuan", "guo-zi-yi-dan-qi-tui-hui-he", "han-xin-bei-shui-yi-zhan", "mao-sui-zi-jian", "chu-long-shuo-zhao-tai-hou"];
const HISTORY_CATEGORY_COUNTS = { "戰爭故事": 22, "治國與時代發展": 22, "計謀": 22, "品德與勵志": 24 };

t("history: 90 stories, unique ids, category counts 22 / 22 / 22 / 24", () => {
  assert.strictEqual(HISTORY.length, 90);
  assert.strictEqual(new Set(HISTORY.map((x) => x.id)).size, HISTORY.length, "duplicate id");
  assert.strictEqual(new Set(HISTORY.map((x) => x.title)).size, HISTORY.length, "duplicate title");
  const n = {};
  for (const s of HISTORY) n[s.category] = (n[s.category] || 0) + 1;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(n)), HISTORY_CATEGORY_COUNTS);
});

t("history: every story has all fields; category / source / level valid; 2-4 characters", () => {
  for (const s of HISTORY) {
    for (const f of ["id", "title", "period", "level", "category", "source", "sourceRef", "lesson", "story"]) {
      assert.ok(typeof s[f] === "string" && s[f].length > 0, `${s.id}: missing ${f}`);
    }
    assert.ok(typeof s.sortYear === "number" && Number.isFinite(s.sortYear), `${s.id}: sortYear`);
    assert.ok(LEVELS.includes(s.level), `${s.id}: level ${s.level}`);
    assert.ok(Array.from(HI.HISTORY_SOURCES).includes(s.source), `${s.id}: source ${s.source}`);
    assert.ok(Object.prototype.hasOwnProperty.call(HISTORY_CATEGORY_COUNTS, s.category), `${s.id}: category ${s.category}`);
    assert.ok(Array.isArray(s.characters) && s.characters.length >= 2 && s.characters.length <= 4, `${s.id}: characters`);
    if (s.sourceNote !== undefined) assert.ok(typeof s.sourceNote === "string" && s.sourceNote.length > 0, `${s.id}: sourceNote`);
  }
});

t("history: every question has a prompt, 4 different non-empty options and an in-range correctIndex", () => {
  for (const s of HISTORY) {
    assert.ok(Array.isArray(s.questions) && s.questions.length >= 2, `${s.id}: questions`);
    for (const q of s.questions) {
      assert.ok(typeof q.prompt === "string" && q.prompt.length > 0, `${s.id}: prompt`);
      assert.strictEqual(q.options.length, 4, `${s.id}: options`);
      assert.strictEqual(new Set(q.options).size, 4, `${s.id}: duplicate options in "${q.prompt}"`);
      for (const o of q.options) assert.ok(typeof o === "string" && o.length > 0, `${s.id}: empty option`);
      assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${s.id}: correctIndex`);
    }
  }
});

t("history 8c: the 12 new stories are present at the end, 3 questions each, in 書面語", () => {
  assert.deepStrictEqual(Array.from(HISTORY.slice(78).map((x) => x.id)), HISTORY_8C_NEW);
  const allowedTong = /不同|相同|共同|同樣|同一|同行|同盟|同時|同意|同學|同情|同類|同等/g;
  for (const id of HISTORY_8C_NEW) {
    const s = HISTORY.find((x) => x.id === id);
    assert.strictEqual(s.questions.length, 3, `${id}: 3 questions`);
    assert.ok(s.story.length >= 200, `${id}: story too short`);
    const text = JSON.stringify(s);
    assert.ok(!/什麼|裡|嘅|咗|唔|喺|呢|咩|啲|冇|睇|佢/.test(text), `${id}: colloquial wording`);
    assert.ok(!text.replace(allowedTong, "").includes("同"), `${id}: 同 used as "and"?`);
  }
});

t("history 8c: 玄奘 / 昭君 / 文天祥 follow the agreed caveats", () => {
  const get = (id) => HISTORY.find((x) => x.id === id);
  const xz = get("xuan-zang-xi-xing");
  assert.ok(/627|六二七/.test(xz.sourceNote) && /629|六二九/.test(xz.sourceNote), "玄奘: both 627 and 629 in sourceNote");
  assert.ok(!/西遊記|孫悟空/.test(xz.story), "玄奘: story must not use 西遊記 plot");
  const zj = get("wang-zhao-jun-chu-sai");
  assert.ok(!/毛延壽|落雁/.test(zj.story), "昭君: 毛延壽 / 落雁 only in sourceNote");
  assert.ok(/毛延壽/.test(zj.sourceNote) && /落雁/.test(zj.sourceNote), "昭君: sourceNote mentions them as 相傳");
  const xw = get("wei-xiao-wen-di-qian-du");
  assert.ok(xw.story.includes("北魏") && xw.period === "北魏", "孝文帝: dynasty stated");
  const cl = get("chu-long-shuo-zhao-tai-hou");
  assert.ok(/觸讋/.test(cl.sourceNote) && /觸龍/.test(cl.sourceNote), "觸龍: both spellings in sourceNote");
  const wt = get("wen-tian-xiang-kang-yuan");
  assert.ok(!/斬|砍頭|鮮血|血/.test(wt.story), "文天祥: no gore");
});

t("history 8c: only 文天祥 is paired with a poem (過零丁洋); links are well-formed", () => {
  const poemIds = new Set(Array.from(POEMS_FOR_HISTORY.map((p) => p.id)));
  const storyIds = new Set(Array.from(HISTORY.map((s) => s.id)));
  const rel = ["事件背景", "詩中所詠", "同一時代", "同一主題"];
  for (const l of HI.HISTORY_POEM_STORY_LINKS) {
    assert.ok(poemIds.has(l.poemId), `link: unknown poem ${l.poemId}`);
    assert.ok(storyIds.has(l.storyId), `link: unknown story ${l.storyId}`);
    assert.ok(rel.includes(l.relation), `link: relation ${l.relation}`);
    assert.ok(typeof l.note === "string" && l.note.length > 0, "link: note");
  }
  const forNew = Array.from(HI.HISTORY_POEM_STORY_LINKS).filter((l) => HISTORY_8C_NEW.includes(l.storyId));
  assert.strictEqual(forNew.length, 1);
  assert.strictEqual(forNew[0].poemId, "guo-lingdingyang");
  assert.strictEqual(forNew[0].storyId, "wen-tian-xiang-kang-yuan");
  for (const id of HI.HISTORY_WAR_POEM_IDS) assert.ok(poemIds.has(id), `war poem ${id} missing`);
});

t.done();
