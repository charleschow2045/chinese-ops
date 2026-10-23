// 成語核對修正 (idiom audit fixes): idioms that were removed or re-spelled must not break old saves / old
// backups, and must not disturb any other record — run: node tests/idiom-compat.test.js
// Storage.jsx knows nothing about content, so a retired id simply stays in a save until
// `pruneUnknownMistakes` (called by Root.jsx on load and after a restore) drops it.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadStorage, makeRunner } = require("./helpers");
const t = makeRunner("idiom-compat");
const J = (x) => JSON.parse(JSON.stringify(x));
const eq = (a, b, msg) => assert.deepStrictEqual(J(a), J(b), msg);

function loadContent(file) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", "content", file), "utf8"), ctx);
  return ctx.window.App.Content;
}
const IDIOMS = loadContent("idiomContent.jsx").IDIOM_ITEMS;
const LIVE_IDS = Array.from(IDIOMS.map((x) => x.id));
const { S } = loadStorage();

// ids of the 15 deleted idioms + 克服萬難 (replaced by 排除萬難 under a new id)
const RETIRED = [
  "huan-ran-yi-ren", "du-liang-hai-han", "ying-fu-cha-shi", "quan-mou-yuan-lue", "zheng-zheng-dang-dang", "chong-zhong-lei-luan",
  "ju-yi-fan-san-2", "yi-jian-fen-qi", "gao-xia-li-pan", "ji-hui-nan-de", "guo-gan-guo-duan", "ling-huo-yun-yong", "bi-shui-lan-tian",
  "da-ti-xiao-zuo", "zi-bu-liang-li", "ke-fu-wan-nan",
];
const KEPT = ["jiu-niu-yi-mao", "yin-er-bu-fa", "gu-bu-zi-feng", "fen-fa-tu-qiang", "shou-zhu-dai-tu"];

// A save made by the previous release: mistakes on both retired and live idioms, real progress everywhere.
function oldState() {
  const mp = {};
  S.MODULES.forEach((m) => (mp[m.key] = { practiceStats: { correct: 11, attempts: 20 }, mistakes: [] }));
  mp.idiom.mistakes = ["huan-ran-yi-ren", "jiu-niu-yi-mao", "ke-fu-wan-nan", "yin-er-bu-fa", "da-ti-xiao-zuo", "gu-bu-zi-feng"];
  mp.idiom.practiceStats = { correct: 77, attempts: 120 };
  mp.history.mistakes = ["huan-ran-yi-ren", "da-yu-zhi-shui"]; // same string in ANOTHER module must stay
  mp.poetry.mistakes = ["jiang-xue"];
  const st = { level: "p6", moduleProgress: mp };
  return st;
}

t("the 15 deleted idioms and 克服萬難 are gone; the approved fixes are in; ids stay unique", () => {
  const ids = new Set(LIVE_IDS);
  for (const id of RETIRED) assert.ok(!ids.has(id), `${id} should be retired`);
  for (const id of KEPT) assert.ok(ids.has(id), `${id} must stay`);
  assert.strictEqual(ids.size, IDIOMS.length);
  const by = (s) => IDIOMS.find((x) => x.idiom === s);
  assert.ok(by("排除萬難") && !by("克服萬難"), "克服萬難 → 排除萬難");
  assert.ok(by("故步自封") && !by("固步自封"), "固步自封 → 故步自封");
  assert.strictEqual(by("故步自封").id, "gu-bu-zi-feng", "id kept, so the child's record for it survives");
  assert.strictEqual(by("發憤圖強").pinyin, "fā fèn tú qiáng");
  assert.strictEqual(by("發憤圖強").id, "fen-fa-tu-qiang", "id kept on purpose (only the pinyin was wrong)");
  assert.ok(by("歸根結蒂"), "歸根結蒂 is left as it was (成語典 lists it as 也作, not as wrong)");
  assert.ok(/極大/.test(by("九牛一毛").meaning) && /極小/.test(by("九牛一毛").meaning), "九牛一毛 meaning");
  assert.ok(/啟發誘導/.test(by("引而不發").meaning) && /等待適當的時機/.test(by("引而不發").meaning), "引而不發 meaning");
});

t("reading an old save that still has retired ids does not throw and keeps the strings as they were", () => {
  const { S: S2 } = loadStorage({ initial: oldState() });
  const st = S2.loadState();
  eq(Array.from(st.moduleProgress.idiom.mistakes), oldState().moduleProgress.idiom.mistakes);
});

t("the idiom review list (same filter as IdiomModule) ignores retired ids without an error", () => {
  const mistakes = oldState().moduleProgress.idiom.mistakes;
  const mistakeItems = Array.from(IDIOMS.filter((it) => (mistakes || []).includes(it.id)).map((x) => x.id));
  eq(mistakeItems.slice().sort(), ["gu-bu-zi-feng", "jiu-niu-yi-mao", "yin-er-bu-fa"]);
});

t("pruneUnknownMistakes drops only the retired idiom ids and touches nothing else", () => {
  const { S: S2 } = loadStorage({ initial: oldState() });
  const st = S2.loadState();
  st.stats.mistakesCleared = 6;
  const before = JSON.parse(JSON.stringify(st));
  const out = S2.pruneUnknownMistakes(st, "idiom", LIVE_IDS);
  eq(Array.from(out.moduleProgress.idiom.mistakes), ["jiu-niu-yi-mao", "yin-er-bu-fa", "gu-bu-zi-feng"]);
  eq(JSON.parse(JSON.stringify(st)), before, "the input state is not mutated");
  eq(out.moduleProgress.idiom.practiceStats, before.moduleProgress.idiom.practiceStats);
  assert.strictEqual(out.stats.mistakesCleared, 6, "pruning is not 清除錯題");
  eq(out.stats, before.stats);
  eq(out.daily, before.daily);
  eq(out.streak, before.streak);
  for (const m of S2.MODULES) {
    if (m.key === "idiom") continue;
    eq(out.moduleProgress[m.key], before.moduleProgress[m.key], `${m.key} untouched`);
  }
  eq(Array.from(out.moduleProgress.history.mistakes), ["huan-ran-yi-ren", "da-yu-zhi-shui"], "same string in another module stays");
});

t("pruneUnknownMistakes returns the same object when nothing is retired, and is idempotent", () => {
  const st = S.loadState();
  st.moduleProgress.idiom.mistakes = ["jiu-niu-yi-mao", "yin-er-bu-fa"];
  assert.strictEqual(S.pruneUnknownMistakes(st, "idiom", LIVE_IDS), st);
  const dirty = JSON.parse(JSON.stringify(st));
  dirty.moduleProgress.idiom.mistakes.push("huan-ran-yi-ren");
  const once = S.pruneUnknownMistakes(dirty, "idiom", LIVE_IDS);
  assert.notStrictEqual(once, dirty);
  assert.strictEqual(S.pruneUnknownMistakes(once, "idiom", LIVE_IDS), once);
});

t("pruneUnknownMistakes never throws on junk input", () => {
  for (const bad of [null, undefined, {}, { moduleProgress: null }, { moduleProgress: {} }, { moduleProgress: { idiom: { mistakes: "x" } } }, 7, "str"]) {
    assert.doesNotThrow(() => S.pruneUnknownMistakes(bad, "idiom", LIVE_IDS));
    assert.strictEqual(S.pruneUnknownMistakes(bad, "idiom", LIVE_IDS), bad);
  }
  const st = S.loadState();
  assert.strictEqual(S.pruneUnknownMistakes(st, "idiom", undefined), st);
  assert.strictEqual(S.pruneUnknownMistakes(st, "noSuchModule", LIVE_IDS), st);
});

t("an old backup (version 1 and version 2) with retired ids imports cleanly; pruning after the import keeps every other record", () => {
  for (const version of [1, 2]) {
    const file = JSON.stringify({ app: "chinese-ops", version, exportedAt: "2026-10-01T00:00:00Z", data: { "chineseOps:v1": oldState() } });
    const r = S.parseBackup(file);
    assert.ok(r.ok, `version ${version} imports`);
    assert.strictEqual(r.state.moduleProgress.idiom.practiceStats.attempts, 120);
    const cleaned = S.pruneUnknownMistakes(r.state, "idiom", LIVE_IDS);
    eq(Array.from(cleaned.moduleProgress.idiom.mistakes), ["jiu-niu-yi-mao", "yin-er-bu-fa", "gu-bu-zi-feng"]);
    eq(cleaned.moduleProgress.poetry, r.state.moduleProgress.poetry);
    eq(cleaned.moduleProgress.history, r.state.moduleProgress.history);
    // export → import round trip of the cleaned state keeps it identical
    const again = S.parseBackup(JSON.stringify(S.buildBackup(cleaned)));
    assert.ok(again.ok);
    eq(again.state.moduleProgress, cleaned.moduleProgress);
  }
});

t("a backup exported by this release (already pruned) imports in the previous way too: strings only, no content knowledge needed", () => {
  const st = S.pruneUnknownMistakes(S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": oldState() } })).state, "idiom", LIVE_IDS);
  const file = JSON.stringify(S.buildBackup(st));
  assert.ok(S.parseBackup(file).ok);
  assert.ok(!/huan-ran-yi-ren/.test(JSON.stringify(S.buildBackup(st).data["chineseOps:v1"].moduleProgress.idiom)), "retired id gone from the idiom list");
});

t.done();
