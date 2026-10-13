// 測試模式 (?today=) — run: node tests/test-mode.test.js
// Test mode must never read or write the real key `chineseOps:v1`.
const assert = require("assert");
const { loadStorage, makeRunner } = require("./helpers");
const t = makeRunner("test-mode");

const emptyProgress = (S) => Object.fromEntries(S.MODULES.map((m) => [m.key, { practiceStats: { correct: 0, attempts: 0 }, mistakes: [] }]));

t("normal mode: real key, real date, no test parameter", () => {
  const { S } = loadStorage();
  assert.equal(S.TEST_MODE, false);
  assert.equal(S.STORAGE_KEY, "chineseOps:v1");
  assert.equal(S.TEST_DATE_PARAM, null);
  assert.equal(loadStorage({ search: "?foo=1" }).S.TEST_MODE, false);
});

t("?today=YYYY-MM-DD selects the test key and pretends it is that date", () => {
  const { S } = loadStorage({ search: "?today=2026-10-12" });
  assert(S.TEST_MODE);
  assert.equal(S.STORAGE_KEY, "chineseOps:test");
  assert.equal(S.todayStr(), "2026-10-12");
});

t("a malformed, impossible or empty today= still means test mode (test key), with the real date", () => {
  for (const search of ["?today=2026-02-30", "?today=banana", "?foo=1&today", "?today="]) {
    const { S } = loadStorage({ search });
    assert(S.TEST_MODE, search);
    assert.equal(S.STORAGE_KEY, "chineseOps:test", search);
    assert(S.isValidDateStr(S.todayStr()), search);
    assert.notEqual(S.todayStr(), "2026-02-30");
  }
});

t("addDays crosses month and year boundaries", () => {
  const { S } = loadStorage();
  assert.equal(S.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(S.addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(S.addDays("2028-02-28", 1), "2028-02-29");
});

t("test mode never reads the real key and never writes it", () => {
  const real = { level: "s1", moduleProgress: {} };
  const { S, store } = loadStorage({ search: "?today=2026-10-12", initial: real });
  const before = store["chineseOps:v1"];
  const state = S.loadState(); // must NOT pick up the real save
  assert.equal(state.level, "p5");
  S.saveState({ ...state, level: "p6" });
  assert.equal(store["chineseOps:v1"], before, "real key untouched");
  assert.equal(JSON.parse(store["chineseOps:test"]).level, "p6");
});

t("test-mode backups: own key, testMode flag; normal mode refuses them (testFile)", () => {
  const { S: T } = loadStorage({ search: "?today=2026-10-12" });
  const file = JSON.stringify(T.buildBackup(T.loadState()));
  const parsed = JSON.parse(file);
  assert.equal(parsed.testMode, true);
  assert.deepEqual(Object.keys(parsed.data), ["chineseOps:test"]);
  const { S: N } = loadStorage();
  assert.equal(N.parseBackup(file).reason, "testFile");
  const raw = { level: "p6", moduleProgress: {} };
  assert.equal(N.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:test": raw } })).reason, "testFile");
  assert.equal(N.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, testMode: true, data: { "chineseOps:v1": raw } })).reason, "testFile");
  assert.equal(N.buildBackup(N.loadState()).testMode, undefined, "normal backups carry no testMode flag");
});

t("test mode may import a normal backup file (it only ever writes the test key)", () => {
  const { S: N } = loadStorage();
  const normal = JSON.stringify(N.buildBackup({ ...N.loadState(), level: "s1" }));
  const { S: T } = loadStorage({ search: "?today=2026-10-12" });
  const r = T.parseBackup(normal);
  assert(r.ok);
  assert.equal(r.state.level, "s1");
});

t.done();
