// 科舉稱號 getTitleView + 模組里程 getModuleMilestoneView — run: node tests/titles.test.js
const assert = require("assert");
const { loadStorage, makeRunner } = require("./helpers");
const { S } = loadStorage();
const t = makeRunner("titles");

const KEYS = S.MODULES.map((m) => m.key);
// A state whose finished-session counters add up to `total` (spread over modules, remainder in the first).
function withTotal(total) {
  const sessions = Object.fromEntries(KEYS.map((k) => [k, 0]));
  let left = total;
  KEYS.forEach((k, i) => {
    const part = i === KEYS.length - 1 ? left : Math.min(left, 7);
    sessions[k] = part;
    left -= part;
  });
  return { stats: { sessions } };
}
const withSessions = (obj) => ({ stats: { sessions: obj } });

t("tier table: names, order, thresholds, one distinct seal each", () => {
  assert.deepEqual(S.TITLE_TIERS.map((x) => x.name), ["童生", "秀才", "舉人", "進士", "探花", "榜眼", "狀元"]);
  assert.deepEqual(S.TITLE_TIERS.map((x) => x.at), [0, 10, 45, 100, 180, 300, 600]);
  assert.deepEqual(S.TITLE_TIERS.map((x) => x.seal), ["童", "秀", "舉", "進", "探", "榜", "狀"]);
  assert.equal(new Set(S.TITLE_TIERS.map((x) => x.key)).size, 7);
  assert.deepEqual(S.MODULE_MILESTONES, [5, 15, 30, 60, 100]);
});

t("every tier boundary", () => {
  const cases = [
    [0, "童生"], [9, "童生"], [10, "秀才"], [44, "秀才"], [45, "舉人"], [99, "舉人"], [100, "進士"],
    [179, "進士"], [180, "探花"], [299, "探花"], [300, "榜眼"], [599, "榜眼"], [600, "狀元"], [9999, "狀元"],
  ];
  for (const [n, name] of cases) {
    const v = S.getTitleView(withTotal(n));
    assert.equal(v.name, name, `${n} sessions`);
    assert.equal(v.total, n);
    assert.equal(v.seal, S.TITLE_TIERS[v.index].seal);
  }
});

t("狀元: isMax, no next tier, ratio 1, nothing remaining", () => {
  for (const n of [600, 601, 9999]) {
    const v = S.getTitleView(withTotal(n));
    assert.equal(v.isMax, true);
    assert.equal(v.nextName, null);
    assert.equal(v.nextAt, null);
    assert.equal(v.remaining, 0);
    assert.equal(v.ratio, 1);
    assert.equal(v.currentAt, 600);
  }
  assert.equal(S.getTitleView(withTotal(599)).isMax, false);
});

t("37 sessions: 秀才, next 舉人 at 45, 8 to go, ratio 37/45", () => {
  const v = S.getTitleView(withTotal(37));
  assert.equal(v.name, "秀才");
  assert.equal(v.nextName, "舉人");
  assert.equal(v.nextAt, 45);
  assert.equal(v.remaining, 8);
  assert.equal(v.currentAt, 10);
  assert.equal(v.isMax, false);
  assert.ok(Math.abs(v.ratio - 37 / 45) < 1e-9);
  assert.ok(Math.abs(v.ratio - 0.822) < 0.001);
});

t("brand-new player: 童生, 0 / 10, ratio 0; right on a boundary the ratio restarts from the new target", () => {
  const v0 = S.getTitleView(withTotal(0));
  assert.equal(v0.name, "童生");
  assert.equal(v0.nextAt, 10);
  assert.equal(v0.remaining, 10);
  assert.equal(v0.ratio, 0);
  const v10 = S.getTitleView(withTotal(10));
  assert.equal(v10.nextAt, 45);
  assert.equal(v10.remaining, 35);
  assert.ok(Math.abs(v10.ratio - 10 / 45) < 1e-9);
  const v9 = S.getTitleView(withTotal(9));
  assert.equal(v9.remaining, 1);
});

t("ratio never exceeds 1 and total sums every module", () => {
  for (let n = 0; n <= 700; n += 7) {
    const v = S.getTitleView(withTotal(n));
    assert.ok(v.ratio >= 0 && v.ratio <= 1);
    assert.equal(v.total, n);
  }
  const mixed = withSessions(Object.fromEntries(KEYS.map((k, i) => [k, i + 1]))); // 1+2+…+10 = 55
  assert.equal(S.getTitleView(mixed).total, 55);
  assert.equal(S.getTitleView(mixed).name, "舉人");
});

t("missing / broken data never throws and counts as 0", () => {
  const junk = [undefined, null, 0, "x", 42, [], {}, { stats: null }, { stats: {} }, { stats: { sessions: null } }, { stats: { sessions: "5" } }, { stats: { sessions: [3, 4] } }];
  for (const st of junk) {
    const v = S.getTitleView(st);
    assert.equal(v.total, 0);
    assert.equal(v.name, "童生");
    assert.equal(v.ratio, 0);
    assert.equal(S.getModuleMilestoneView(st, "poetry").sessions, 0);
  }
});

t("bad counters are ignored, good ones still count", () => {
  const v = S.getTitleView(withSessions({ poetry: NaN, essay: -5, cangjie: "7", mandarin: Infinity, idiom: null, history: undefined, reading: {}, rhetoric: 4, punctuation: 6.9, classicalProse: -Infinity }));
  assert.equal(v.total, 4 + 6); // 6.9 → 6 whole sessions
  assert.equal(v.name, "秀才");
  assert.equal(S.getTitleView(withSessions({ poetry: -100 })).total, 0);
  assert.equal(S.getTitleView(withSessions({ unknownModule: 500 })).total, 0); // only real module keys count
});

t("module milestone boundaries", () => {
  const view = (n) => S.getModuleMilestoneView(withSessions({ poetry: n }), "poetry");
  const cases = [
    [0, 5], [4, 5], [5, 15], [14, 15], [15, 30], [29, 30], [30, 60], [59, 60], [60, 100], [99, 100],
  ];
  for (const [n, next] of cases) {
    const v = view(n);
    assert.equal(v.sessions, n);
    assert.equal(v.nextAt, next, `${n} sessions`);
    assert.equal(v.isMastered, false);
    assert.ok(Math.abs(v.ratio - n / next) < 1e-9);
  }
  for (const n of [100, 150, 100000]) {
    const v = view(n);
    assert.equal(v.sessions, n);
    assert.equal(v.nextAt, null);
    assert.equal(v.isMastered, true);
    assert.equal(v.ratio, 1);
  }
});

t("module milestone: each module is read on its own; unknown key / bad data → 0", () => {
  const st = withSessions({ poetry: 4, essay: 5, idiom: 100 });
  assert.equal(S.getModuleMilestoneView(st, "poetry").nextAt, 5);
  assert.equal(S.getModuleMilestoneView(st, "essay").nextAt, 15);
  assert.equal(S.getModuleMilestoneView(st, "idiom").isMastered, true);
  assert.equal(S.getModuleMilestoneView(st, "history").sessions, 0);
  for (const key of ["nope", "", undefined, null, "toString", "__proto__", 7]) {
    const v = S.getModuleMilestoneView(st, key);
    assert.deepEqual(v, { sessions: 0, nextAt: 5, ratio: 0, isMastered: false });
  }
  assert.equal(S.getModuleMilestoneView(withSessions({ poetry: "9" }), "poetry").sessions, 0);
  assert.equal(S.getModuleMilestoneView(withSessions({ poetry: NaN }), "poetry").sessions, 0);
  assert.equal(S.getModuleMilestoneView(withSessions({ poetry: -3 }), "poetry").sessions, 0);
});

t("read-only: the state is identical before and after (no writes, no new fields)", () => {
  const base = loadStorage().S.loadState();
  base.stats.sessions.poetry = 12;
  base.stats.sessions.idiom = 31;
  const real = JSON.parse(JSON.stringify(base));
  const states = [real, withTotal(37), withSessions({ poetry: NaN, essay: -1 }), {}];
  for (const st of states) {
    const before = JSON.stringify(st);
    const keysBefore = Object.keys(st);
    S.getTitleView(st);
    KEYS.forEach((k) => S.getModuleMilestoneView(st, k));
    S.getModuleMilestoneView(st, "nope");
    assert.equal(JSON.stringify(st), before);
    assert.deepEqual(Object.keys(st), keysBefore);
  }
});

t("the saved / backed-up shape is unchanged: no title field anywhere, BACKUP_VERSION still 2", () => {
  const { S: S2, store } = loadStorage({ search: "" });
  const st = S2.loadState();
  S2.getTitleView(st);
  S2.saveState(st);
  const saved = JSON.parse(store["chineseOps:v1"]);
  assert.deepEqual(Object.keys(saved).sort(), ["daily", "level", "moduleProgress", "stats", "streak", "streakFreezes"]);
  assert.equal(S2.BACKUP_VERSION, 2);
  const backup = JSON.parse(JSON.stringify(S2.buildBackup(st)));
  assert.deepEqual(Object.keys(backup).sort(), ["app", "data", "exportedAt", "version"]);
  assert.deepEqual(Object.keys(backup.data["chineseOps:v1"]).sort(), Object.keys(saved).sort());
});

t.done();
