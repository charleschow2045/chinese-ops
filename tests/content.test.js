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

t("rhetoric: level is only p5 / p6 / s1 / s2 (s2 may be empty)", () => {
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
  for (const d of DEVICES) for (const lv of FILLED_LEVELS) assert.ok(n[d.name + "|" + lv] >= 1, `${d.name} has no ${lv} sentence`);
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

t("essay: level is only p5 / p6 / s1 / s2 (s2 may be empty) and theme is only 描寫 / 抒情 / 論說", () => {
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
  for (const th of THEMES) for (const lv of FILLED_LEVELS) assert.ok(n[th + "|" + lv] >= 1, `${th} has no ${lv} sentence`);
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
      assert.ok(!rest.includes("同"), `${x.id}: 「同」 used outside an ordinary compound in 「${s}」`);
    }
  }
});

t("prose 10b: 原文 keeps the 教育局 / textbook wording that was settled (no variant slipped in)", () => {
  const text = (id) => PROSE.find((x) => x.id === id).lines.join("");
  // 傷仲永: 予 (not 余) and 邪 (not 耶), as in the 教育局 text; 鄒忌: 羣臣, 蔽; 賣柑者言: 剖之如有煙撲口鼻, 禦, 糜; 楊修之死: 沈吟, 臨時慌亂, 遂亦收拾行裝
  assert.ok(text("shang-zhong-yong").includes("予聞之也久") && text("shang-zhong-yong").endsWith("得為眾人而已邪？"));
  assert.ok(text("zou-ji-feng-qi-wang-na-jian").includes("羣臣吏民") && text("zou-ji-feng-qi-wang-na-jian").includes("王之蔽甚矣"));
  assert.ok(text("mai-gan-zhe-yan").includes("剖之如有煙撲口鼻") && text("mai-gan-zhe-yan").includes("不知禦") && text("mai-gan-zhe-yan").includes("坐糜廩粟"));
  assert.ok(text("mai-gan-zhe-yan").includes("吾售之，人取之，未聞有言，而獨不足於子乎？世之為欺者不寡矣") && !text("mai-gan-zhe-yan").includes("……"), "賣柑者言: the vendor's sentence is written out, no omission marker");
  assert.ok(text("yang-xiu-zhi-si").includes("正沈吟間") && text("yang-xiu-zhi-si").includes("臨時慌亂") && text("yang-xiu-zhi-si").includes("遂亦收拾行裝"));
  assert.ok(text("xi-guan-shuo").includes("蹴然以驚") && text("xi-guan-shuo").includes("何以天下國家為"));
  assert.ok(text("mao-bu-que").includes("噪而逐貓") && text("mao-bu-que").includes("烏虖"));
  assert.ok(text("guan-ning-hua-xin-gong-yuan-zhong-chu-cai").includes("寧讀如故"));
  assert.ok(text("xun-ju-bo-yuan-kan-you-ren-ji").includes("敗義以求生") && text("xun-ju-bo-yuan-kan-you-ren-ji").includes("遂班軍而還"));
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
  assert.ok(zj.includes("由西漢劉向整理編訂為《戰國策》") && !zj.includes("秦統一"));
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

t("reading: 34 passages, unique ids, 12 小五 / 10 小六 / 12 中一, level only p5 / p6 / s1 / s2 (s2 may be empty)", () => {
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
