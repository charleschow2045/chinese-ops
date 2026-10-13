// 徽章 (BADGES) — run: node tests/badges.test.js
const assert = require("assert");
const { loadStorage, makeRunner } = require("./helpers");
const { S } = loadStorage();
const t = makeRunner("badge");
const APPROVED = ["循序漸進","持之以恆","日積月累","鍥而不捨","水滴石穿","有備無患","初試啼聲","大功告成","積少成多","學富五車","詩情畫意","出口成章","得心應手","字正腔圓","言簡意賅","博古通今","開卷有益","畫龍點睛","一絲不苟","溫故知新","博學多才","一字不差","知過必改"];
const fresh = () => S.sanitizeState(S.buildBackup(S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 1, data: { "chineseOps:v1": { level: "p5", moduleProgress: Object.fromEntries(S.MODULES.map((m) => [m.key, { practiceStats: { correct: 0, attempts: 0 }, mistakes: [] }])) } } })).state).data["chineseOps:v1"]);
const earned = (st) => S.earnedBadgeKeys(st);
const byName = (name) => S.BADGES.find((b) => b.name === name);
const withStats = (o, sessions = {}) => { const st = fresh(); st.stats = { ...st.stats, ...o, sessions: { ...st.stats.sessions, ...sessions } }; return st; };

t("23 badges, exactly the approved names in the approved order", () => { assert.equal(S.BADGES.length, 23); assert.deepEqual(S.BADGES.map((b) => b.name), APPROVED); });
t("unique keys; unique single-character seals; text fields present", () => {
  assert.equal(new Set(S.BADGES.map((b) => b.key)).size, 23);
  const seals = S.BADGES.map((b) => b.seal); assert(seals.every((c) => [...c].length === 1)); assert.equal(new Set(seals).size, 23);
  S.BADGES.forEach((b) => { assert(b.condition.length > 3 && b.meaning.length > 3 && S.BADGE_GROUPS.some((g) => g.key === b.group)); });
});
t("every module has exactly one module badge; groups sized 6/4/10/3", () => {
  S.MODULES.forEach((m) => assert.equal(S.BADGES.filter((b) => b.module === m.key).length, 1));
  assert.deepEqual(S.BADGE_GROUPS.map((g) => S.BADGES.filter((b) => b.group === g.key).length), [6, 4, 10, 3]);
});
t("no 同 used as a coordinating 'and' in any badge text", () => { S.BADGES.forEach((b) => assert(!/同/.test(b.condition + b.meaning + b.name), b.name)); });
t("fresh state earns nothing; progress is capped and never throws", () => {
  const st = fresh(); assert.equal(earned(st).length, 0);
  S.BADGES.forEach((b) => { const p = S.badgeProgress(st, b); assert(p.cur === 0 && p.target > 0); });
  const big = withStats({ bestStreak: 36500, daysCompleted: 1e6, freezesUsed: 9, perfectSessions: 9, mistakesCleared: 999 }); S.BADGES.forEach((b) => { const p = S.badgeProgress(big, b); assert(p.cur <= p.target); });
});
t("streak badges use bestStreak: 3/7/14/30/60", () => {
  const names = ["循序漸進", "持之以恆", "日積月累", "鍥而不捨", "水滴石穿"], days = [3, 7, 14, 30, 60];
  days.forEach((d, i) => {
    const below = withStats({ bestStreak: d - 1 }), at = withStats({ bestStreak: d });
    assert(!S.isBadgeEarned(below, byName(names[i])), names[i] + " below"); assert(S.isBadgeEarned(at, byName(names[i])), names[i] + " at");
  });
  assert.equal(earned(withStats({ bestStreak: 60 })).length, 5);
});
t("milestones: first session / first full day / freeze used", () => {
  assert(S.isBadgeEarned(withStats({}, { poetry: 1 }), byName("初試啼聲"))); assert(!S.isBadgeEarned(fresh(), byName("初試啼聲")));
  assert(S.isBadgeEarned(withStats({ daysCompleted: 1 }), byName("大功告成"))); assert(S.isBadgeEarned(withStats({ freezesUsed: 1 }), byName("有備無患")));
});
t("累計答對 comes from existing practiceStats (retroactive for old saves)", () => {
  const st = fresh(); st.moduleProgress.idiom.practiceStats.correct = 60; st.moduleProgress.poetry.practiceStats.correct = 40;
  assert(S.isBadgeEarned(st, byName("積少成多"))); assert(!S.isBadgeEarned(st, byName("學富五車")));
  st.moduleProgress.history.practiceStats.correct = 900; assert(S.isBadgeEarned(st, byName("學富五車")));
  const old = S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 1, data: { "chineseOps:v1": { level: "s1", moduleProgress: Object.fromEntries(S.MODULES.map((m) => [m.key, { practiceStats: { correct: 120, attempts: 150 }, mistakes: [] }])) } } })).state;
  assert.deepEqual(earned(old).sort(), ["correct_100", "correct_1000"].sort());
});
t("module badges need 5 sessions of THAT module; 博學多才 needs all 10", () => {
  S.MODULES.forEach((m) => { const b = S.BADGES.find((x) => x.module === m.key); assert(!S.isBadgeEarned(withStats({}, { [m.key]: 4 }), b)); assert(S.isBadgeEarned(withStats({}, { [m.key]: 5 }), b)); });
  const nine = Object.fromEntries(S.MODULES.slice(1).map((m) => [m.key, 1])); assert(!S.isBadgeEarned(withStats({}, nine), byName("博學多才")));
  const ten = Object.fromEntries(S.MODULES.map((m) => [m.key, 1])); assert(S.isBadgeEarned(withStats({}, ten), byName("博學多才")));
});
t("special: perfect session & mistakes cleared (10)", () => {
  assert(S.isBadgeEarned(withStats({ perfectSessions: 1 }), byName("一字不差"))); assert(!S.isBadgeEarned(withStats({ mistakesCleared: 9 }), byName("知過必改"))); assert(S.isBadgeEarned(withStats({ mistakesCleared: 10 }), byName("知過必改")));
});
t("earned set survives backup round trip", () => {
  const st = withStats({ bestStreak: 14, daysCompleted: 3, perfectSessions: 2, mistakesCleared: 12, freezesUsed: 1 }, { idiom: 7, poetry: 1 });
  const before = earned(st).sort(); const back = S.parseBackup(JSON.stringify(S.buildBackup(st))); assert(back.ok); assert.deepEqual(earned(back.state).sort(), before);
});
t("played through recordSession: first day + freeze earn their badges", () => {
  let st = fresh(); const ms = S.pickMissions("2026-10-12"); let r;
  for (const k of ms) r = S.recordSession(st = r ? r.state : st, k, 8, 8, "2026-10-12");
  st = r.state; assert(S.isBadgeEarned(st, byName("初試啼聲")) && S.isBadgeEarned(st, byName("大功告成")) && S.isBadgeEarned(st, byName("一字不差")) && !S.isBadgeEarned(st, byName("有備無患")));
  const ms2 = S.pickMissions("2026-10-14"); for (const k of ms2) r = S.recordSession(st = r.state, k, 1, 2, "2026-10-14"); assert(S.isBadgeEarned(r.state, byName("有備無患")));
});
t.done();
