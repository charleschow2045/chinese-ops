// Content sanity checks for 修辭手法 (rhetoricContent.jsx), 作文金句 (essayContent.jsx), 文言文選讀 (classicalProseContent.jsx) and
// 閱讀理解 (readingContent.jsx) — run: node tests/content.test.js
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

// ---------------------------------------------------------------- 閱讀理解
// The 22 passages that existed before 階段 7 C 批 are not edited; three small things in them do not meet the strictest rule below, so they are
// listed here on purpose instead of being silently skipped (see CLAUDE.md, Module 7 → 階段 7 C 批).
const READING_C_BATCH = [
  "yuedu-jianianhua-tonggao-v2", "gei-xiaoxin-de-weiwen-xin-v2", "xiao-chushi-de-diyi-wan-mian-v2", "shumu-de-nianlun-v2",
  "canguan-huishou-zhongxin-dianyou-v2", "waigong-de-suanpan-v2", "haishui-weishenme-shi-xian-de-v2", "zhi-de-gushi-v2",
  "jianyi-jiuwu-jiaohuanri-xin-v2", "moca-li-de-liang-mian-v2", "zhinanzhen-yu-cipianjiao-v2", "kuanrong-bushi-ruanruo-v2",
];
const READING_VOCAB_EXCEPTIONS = ["wangluo-xianjing-v2", "chengshi-de-xuanze-v2"]; // vocab term written differently from the passage text
const READING_OPEN_MARKS_EXCEPTIONS = ["baoyu-wenhua-yichan-v2"]; // a 3-mark open question with 2 reference points
const READING_SKILLS = ["重整", "解釋", "伸展", "評鑑", "成語／詞語解釋", "修辭手法", "詞語運用", "詞語解釋", "語文運用", "說明方法", "成語解釋", "成語運用", "文言句意"];
const NUM_CN = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const paraNo = (s) => (/^\d+$/.test(s) ? Number(s) : s === "十" ? 10 : s[0] === "十" ? 10 + NUM_CN[s[1]] : s.length === 2 && s[1] === "十" ? NUM_CN[s[0]] * 10 : NUM_CN[s]);
const readingQuestions = (x) => [...x.comprehension, ...x.language];
const readingTexts = (q) => [q.prompt, q.explanation, q.hint, q.scheme, q.modelAnswer, ...(q.points || []), ...(q.options || [])].filter(nonEmpty);

t("reading: 34 passages, unique ids, 12 小五 / 10 小六 / 12 中一, level only p5 / p6 / s1", () => {
  assert.equal(READING.length, 34);
  assert.deepEqual(dups(READING.map((x) => x.id)), []);
  for (const x of READING) assert.ok(LEVELS.includes(x.level), `${x.id}: level ${x.level}`);
  const n = countBy(READING, (x) => x.level);
  assert.deepEqual([n.p5, n.p6, n.s1], [12, 10, 12]);
  for (const id of READING_C_BATCH) assert.ok(READING.some((x) => x.id === id), `missing ${id}`);
});

t("reading: passage is a non-empty array of non-empty strings; every vocab term occurs in the passage", () => {
  for (const x of READING) {
    for (const f of ["id", "title", "genre", "focus"]) assert.ok(nonEmpty(x[f]), `${x.id}.${f} is empty`);
    assert.ok(Array.isArray(x.passage) && x.passage.length >= 3 && x.passage.every(nonEmpty), `${x.id}.passage`);
    assert.ok(Array.isArray(x.vocab) && x.vocab.length >= 2, `${x.id}.vocab`);
    if (READING_VOCAB_EXCEPTIONS.includes(x.id)) continue;
    const text = x.passage.join("");
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

t("reading: every 「第 N 段」 mentioned in a question, explanation, hint or answer is a paragraph that exists", () => {
  for (const x of READING) {
    for (const q of readingQuestions(x)) {
      for (const text of readingTexts(q)) {
        for (const m of text.matchAll(/第([一二三四五六七八九十]+|\d+)段/g)) {
          const n = paraNo(m[1]);
          assert.ok(n >= 1 && n <= x.passage.length, `${x.id}: 「${m[0]}」 but the passage has ${x.passage.length} paragraphs (in 「${q.prompt}」)`);
        }
      }
    }
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
    const n = x.passage.reduce((s, p) => s + han(p), 0);
    const [lo, hi] = x.genre.startsWith("實用文") ? [300, 500] : range[x.level];
    assert.ok(n >= lo && n <= hi, `${id}: ${n} 漢字, expected ${lo}–${hi}`);
  }
});

t.done();
