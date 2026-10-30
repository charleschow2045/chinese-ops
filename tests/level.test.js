// 階段 10a — the 中二 (s2) level foundation: QuizUtils.itemsForLevel (the empty-level fallback every 程度 filter uses), the shared level options,
// and the real content of all 8 levelled modules. Runs — node tests/level.test.js
// The module screens themselves are React and are checked in a browser; the rule they all rely on (a level with no content shows every
// level instead and says so, practice always has a pool) lives in itemsForLevel and is tested here on the real and on patched content.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("level");

function load(patch) {
  const ctx = { window: { App: {}, location: { search: "" } }, console, URLSearchParams, localStorage: { getItem: () => null, setItem() {} } };
  vm.createContext(ctx);
  const files = [
    "Storage.jsx", "quizUtils.jsx",
    "content/poetryContent.jsx", "content/essayContent.jsx", "content/mandarinContent.jsx", "content/pinyinImeContent.jsx", "content/idiomContent.jsx",
    "content/historyContent.jsx", "content/readingContent.jsx", "content/rhetoricContent.jsx", "content/punctuationContent.jsx", "content/classicalProseContent.jsx",
  ];
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
    if (patch && f.startsWith("content/")) patch(ctx.window.App.Content, f);
  }
  return ctx.window.App;
}

const App = load();
const C = App.Content;
const { itemsForLevel } = App.QuizUtils;
// the 8 levelled modules and the arrays their 程度 filter works on (Mandarin also has the homophone drill)
const MODULES = {
  poetry: C.POETRY_ITEMS, essay: C.ESSAY_ITEMS, idiom: C.IDIOM_ITEMS, rhetoric: C.RHETORIC_PRACTICE_SENTENCES,
  punctuation: C.PUNCTUATION_PRACTICE_ITEMS, reading: C.READING_ITEMS, classicalProse: C.CLASSICAL_PROSE_ITEMS,
  mandarin: C.MANDARIN_ITEMS, mandarinIme: C.PINYIN_IME_HOMOPHONE_ITEMS,
};

t("every levelled module's content array exists and every level tag is one of p5 / p6 / s1 / s2 (s2 may still be empty; 階段 10a added no content)", () => {
  for (const [name, list] of Object.entries(MODULES)) {
    assert(Array.isArray(list) && list.length > 0, name);
    list.forEach((it) => assert(["p5", "p6", "s1", "s2"].includes(it.level), name + ": " + it.id + " " + it.level));
  }
});

t("itemsForLevel: all / missing level = the whole list, never flagged empty", () => {
  for (const [name, list] of Object.entries(MODULES)) {
    for (const lv of ["all", "", undefined, null]) {
      const r = itemsForLevel(list, lv);
      assert.strictEqual(r.items, list, name);
      assert.strictEqual(r.empty, false, name);
    }
  }
});

t("itemsForLevel: p5 / p6 / s1 give exactly their own items and are not flagged (every module has content at every existing level)", () => {
  for (const [name, list] of Object.entries(MODULES)) {
    for (const lv of ["p5", "p6", "s1"]) {
      const r = itemsForLevel(list, lv);
      assert.strictEqual(r.empty, false, name + " " + lv);
      assert(r.items.length > 0, name + " " + lv);
      assert(r.items.every((it) => it.level === lv));
      assert.strictEqual(r.items.length, list.filter((it) => it.level === lv).length);
    }
  }
});

t("itemsForLevel on the real content: a module with no 中二 (s2) item falls back to ALL levels and is flagged — never an empty list (階段 10a: none of the modules has s2 yet)", () => {
  for (const [name, list] of Object.entries(MODULES)) {
    const r = itemsForLevel(list, "s2");
    const has = list.some((it) => it.level === "s2");
    assert.strictEqual(r.empty, !has, name);
    assert(r.items.length >= 4, name + ": the practice pool must be usable (>= 4 items)");
    if (!has) assert.strictEqual(r.items, list, name);
    else assert(r.items.every((it) => it.level === "s2"));
  }
});

t("patched content: when a module's items are ALL s2, 中二 is no longer flagged and shows exactly those items; the other levels become the flagged ones", () => {
  for (const [file, key] of [["content/essayContent.jsx", "ESSAY_ITEMS"], ["content/classicalProseContent.jsx", "CLASSICAL_PROSE_ITEMS"], ["content/poetryContent.jsx", "POETRY_ITEMS"], ["content/readingContent.jsx", "READING_ITEMS"], ["content/idiomContent.jsx", "IDIOM_ITEMS"], ["content/rhetoricContent.jsx", "RHETORIC_PRACTICE_SENTENCES"], ["content/punctuationContent.jsx", "PUNCTUATION_PRACTICE_ITEMS"]]) {
    const A = load((Cn, f) => { if (f === file) Cn[key].forEach((it) => { it.level = "s2"; }); });
    const list = A.Content[key];
    const s2 = A.QuizUtils.itemsForLevel(list, "s2");
    assert.strictEqual(s2.empty, false, key);
    assert.strictEqual(s2.items.length, list.length, key);
    for (const lv of ["p5", "p6", "s1"]) {
      const r = A.QuizUtils.itemsForLevel(list, lv);
      assert.strictEqual(r.empty, true, key + " " + lv);
      assert.strictEqual(r.items, list, key + " " + lv);
    }
  }
});

t("patched content: a single s2 item makes 中二 show just that item, no note (the note switches itself off once the level has content)", () => {
  // (patched on 詩詞: 作文金句 has had real 中二 sentences since 階段 10e, so it no longer starts from zero s2 items; 詩詞 still has none)
  const A = load((Cn, f) => { if (f === "content/poetryContent.jsx") Cn.POETRY_ITEMS[0].level = "s2"; });
  const r = A.QuizUtils.itemsForLevel(A.Content.POETRY_ITEMS, "s2");
  assert.strictEqual(r.empty, false);
  assert.strictEqual(r.items.length, 1);
  assert.strictEqual(A.QuizUtils.itemsForLevel(A.Content.POETRY_ITEMS, "p5").empty, false);
});

t("the level options a module draws come from Storage.LEVELS (so a later level needs no per-module edit), and the home note exists for s2", () => {
  const theme = fs.readFileSync(path.join(__dirname, "..", "src", "theme.jsx"), "utf8");
  assert(theme.includes("window.App.Storage.LEVELS.map"));
  for (const m of ["Poetry", "Essay", "Idiom", "Rhetoric", "Punctuation", "Reading", "ClassicalProse", "Mandarin"]) {
    const src = fs.readFileSync(path.join(__dirname, "..", "src", m + "Module.jsx"), "utf8");
    assert(!/key: "p5", label: "小五"/.test(src), m + " still hard-codes the three levels");
    assert(src.includes("LEVEL_FILTERS") && src.includes("A2LevelNotice") && src.includes("itemsForLevel"), m);
  }
  for (const m of ["History", "Cangjie"]) {
    const src = fs.readFileSync(path.join(__dirname, "..", "src", m + "Module.jsx"), "utf8");
    assert(!src.includes("LEVEL_FILTERS"), m + " has no level filter and must not get one");
  }
  assert.strictEqual(App.Storage.LEVELS.find((l) => l.key === "s2").note, "中二內容涵蓋中二至中三");
});

t("every LEVEL_LABEL map knows s2 as 「中二」 (so future s2 items render with a label)", () => {
  for (const key of ["POETRY_LEVEL_LABEL", "ESSAY_LEVEL_LABEL", "IDIOM_LEVEL_LABEL", "RHETORIC_LEVEL_LABEL", "PUNCTUATION_LEVEL_LABEL", "READING_LEVEL_LABEL", "CLASSICAL_PROSE_LEVEL_LABEL", "MANDARIN_LEVEL_LABEL", "PINYIN_IME_LEVEL_LABEL", "HISTORY_LEVEL_LABEL"]) {
    assert.strictEqual(C[key].s2, "中二", key);
    assert.strictEqual(C[key].p5, "小五", key);
    Object.values(C[key]).forEach((v) => assert(!v.includes("中三")));
  }
});

t("書面語 scan: the new note and the fallback wording", () => {
  const theme = fs.readFileSync(path.join(__dirname, "..", "src", "theme.jsx"), "utf8");
  const bad = /呢|咩|嘅|咗|唔|喺|即刻|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|嗰|咁|好似/;
  const line = theme.match(/內容陸續加入[^<}]*/)[0].trim();
  assert.strictEqual(line, "內容陸續加入，暫時顯示全部程度的內容");
  assert(!bad.test(line) && !line.includes("同"));
  assert(!bad.test(App.Storage.LEVELS.find((l) => l.key === "s2").note));
});

t("階段 10d: 修辭手法 now has 80 中二 sentences — 中二 shows exactly those (no fallback note), and every other level is unchanged and not flagged", () => {
  const A = load();
  const s2 = A.QuizUtils.itemsForLevel(A.Content.RHETORIC_PRACTICE_SENTENCES, "s2");
  assert.strictEqual(s2.empty, false);
  assert.strictEqual(s2.items.length, 80);
  assert(s2.items.every((it) => it.level === "s2"));
  for (const [lv, n] of [["p5", 58], ["p6", 70], ["s1", 72]]) {
    const r = A.QuizUtils.itemsForLevel(A.Content.RHETORIC_PRACTICE_SENTENCES, lv);
    assert.strictEqual(r.empty, false, lv);
    assert.strictEqual(r.items.length, n, lv);
  }
});

t("階段 10e: 作文金句 now has 48 中二 sentences — 中二 shows exactly those (no fallback note, 16 per theme), the other levels are 41 / 52 / 57 and not flagged", () => {
  const A = load();
  const list = A.Content.ESSAY_ITEMS;
  const s2 = A.QuizUtils.itemsForLevel(list, "s2");
  assert.strictEqual(s2.empty, false);
  assert.strictEqual(s2.items.length, 48);
  assert(s2.items.every((it) => it.level === "s2"));
  for (const th of A.Content.ESSAY_THEMES) assert.strictEqual(s2.items.filter((it) => it.theme === th).length, 16, th);
  for (const [lv, n] of [["p5", 41], ["p6", 52], ["s1", 57]]) {
    const r = A.QuizUtils.itemsForLevel(list, lv);
    assert.strictEqual(r.empty, false, lv);
    assert.strictEqual(r.items.length, n, lv);
  }
});

t.done();
