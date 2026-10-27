// 資料層 / 備份 / 每日任務 / streak / 保護符 (Storage.jsx) — run: node tests/storage.test.js
const assert = require("assert");
const { loadStorage, makeRunner } = require("./helpers");
const t = makeRunner("storage");
const load = (initial) => loadStorage({ initial });
const { S } = load();
const T = "2026-10-12";

// A genuine v1 save/backup as the old app wrote it (no new fields at all)
const mp = {}; S.MODULES.forEach((m) => (mp[m.key] = { practiceStats: { correct: 5, attempts: 8 }, mistakes: ["a"] }));
const oldState = { level: "s1", moduleProgress: mp };
const oldBackup = JSON.stringify({ app: "chinese-ops", version: 1, exportedAt: "2026-01-01T00:00:00Z", data: { "chineseOps:v1": oldState } });

t("v1 backup imports, new fields default, old progress intact", () => {
  const r = S.parseBackup(oldBackup);
  assert(r.ok); assert.equal(r.state.level, "s1");
  assert.equal(r.state.moduleProgress.idiom.practiceStats.correct, 5);
  assert.deepEqual(r.state.moduleProgress.idiom.mistakes, ["a"]);
  assert.equal(r.state.streak.count, 0); assert.equal(r.state.streakFreezes, 1);
  assert.equal(r.state.daily.missions.length, 3); assert.equal(r.state.stats.sessions.poetry, 0);
});
t("loadState migrates a v1 localStorage save", () => {
  const { S: S2 } = load(oldState); const st = S2.loadState();
  assert.equal(st.level, "s1"); assert.equal(st.streakFreezes, 1); assert.equal(st.daily.done.length, 0);
});
t("BACKUP_VERSION is 2; v3 rejected, v1/v2 accepted", () => {
  assert.equal(S.BACKUP_VERSION, 2);
  assert.equal(S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 3, data: {} })).reason, "newerVersion");
  assert(S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": oldState } })).ok);
});
t("v2 round trip preserves every new field", () => {
  let st = S.parseBackup(oldBackup).state;
  const today = S.todayStr();
  st.daily = { date: today, missions: ["poetry", "idiom", "cangjie"], done: ["idiom"] };
  st.streak = { count: 9, lastDate: "2026-10-11" }; st.streakFreezes = 2;
  st.stats = { ...st.stats, daysCompleted: 9, missionsCompleted: 25, bestStreak: 12, freezesUsed: 3, perfectSessions: 4, mistakesCleared: 17, sessions: { ...st.stats.sessions, poetry: 6, cangjie: 2 } };
  const out = S.parseBackup(JSON.stringify(S.buildBackup(st)));
  assert(out.ok); assert.deepEqual(out.state.daily, st.daily); assert.deepEqual(out.state.streak, st.streak);
  assert.equal(out.state.streakFreezes, 2); assert.deepEqual(out.state.stats, st.stats);
});
t("garbage is clamped/defaulted, never throws", () => {
  const bad = { ...oldState, daily: { date: "2026-13-45", missions: ["x"], done: [1] }, streak: { count: -5, lastDate: "nope" }, streakFreezes: 99,
    stats: { daysCompleted: "7", missionsCompleted: NaN, bestStreak: 1e99, sessions: { poetry: -1, evil: 5, idiom: 3.9 }, perfectSessions: Infinity } };
  const r = S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": bad } }));
  assert(r.ok); const s = r.state;
  assert.equal(s.streak.count, 0); assert.equal(s.streak.lastDate, null); assert.equal(s.streakFreezes, 2);
  assert.equal(s.stats.daysCompleted, 0); assert.equal(s.stats.missionsCompleted, 0); assert.equal(s.stats.bestStreak, 36500);
  assert.equal(s.stats.sessions.poetry, 0); assert.equal(s.stats.sessions.idiom, 3); assert(!("evil" in s.stats.sessions));
  assert.equal(s.stats.perfectSessions, 0); assert.equal(s.daily.date, S.todayStr()); assert.equal(s.daily.done.length, 0);
  for (const junk of [null, 5, "x", [], { stats: 5, streak: [], daily: "z" }]) S.normalizeGamification(junk, T);
});
t("streak with count but invalid lastDate becomes 0; bestStreak >= count", () => {
  let g = S.normalizeGamification({ streak: { count: 5, lastDate: "bad" } }, T); assert.equal(g.streak.count, 0);
  g = S.normalizeGamification({ streak: { count: 5, lastDate: "2026-10-11" }, stats: { bestStreak: 2 } }, T); assert.equal(g.stats.bestStreak, 5);
});
t("daily: stale date rolls over; unknown/duplicate/non-mission done filtered", () => {
  let g = S.normalizeGamification({ daily: { date: "2026-10-11", missions: ["idiom", "poetry", "cangjie"], done: ["idiom"] } }, T);
  assert.equal(g.daily.date, T); assert.deepEqual(g.daily.done, []); assert.deepEqual(g.daily.missions, S.pickMissions(T));
  g = S.normalizeGamification({ daily: { date: T, missions: ["idiom", "poetry", "cangjie"], done: ["idiom", "idiom", "essay", "zzz"] } }, T);
  assert.deepEqual(g.daily.done, ["idiom"]);
  g = S.normalizeGamification({ daily: { date: T, missions: ["idiom", "idiom", "cangjie"], done: ["idiom"] } }, T);
  assert.deepEqual(g.daily.missions, S.pickMissions(T)); assert.deepEqual(g.daily.done, S.pickMissions(T).includes("idiom") ? ["idiom"] : []);
});
t("unknown top-level fields are dropped on import", () => {
  const r = S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": { ...oldState, hacked: 1 } } }));
  assert(!("hacked" in r.state));
});
t("pickMissions: deterministic, one per group, varied over 60 days", () => {
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10), m = S.pickMissions(d);
    assert.deepEqual(m, S.pickMissions(d)); assert.equal(m.length, 3);
    m.forEach((k, g) => assert(S.MISSION_GROUPS[g].includes(k))); seen.add(m.join());
  }
  assert(seen.size >= 16, "combos " + seen.size);
});
t("date validity & daysBetween", () => {
  assert(!S.isValidDateStr("2026-02-30")); assert(S.isValidDateStr("2028-02-29")); assert(!S.isValidDateStr("2027-02-29"));
  assert.equal(S.daysBetween("2026-02-28", "2026-03-01"), 1); assert.equal(S.daysBetween("2026-12-31", "2027-01-01"), 1);
});

// ---- recordSession scenarios ----
const base = () => S.parseBackup(oldBackup).state;
function day(state, date, results = null) {
  // finish all 3 of that day's missions
  state = { ...state, daily: S.normalizeGamification(state, date).daily };
  let ev;
  for (const k of state.daily.missions) ({ state, events: ev } = S.recordSession(state, k, 6, 8, date));
  return { state, ev };
}
t("first day: 3 missions -> streak 1; mission events", () => {
  let st = base(); const ms = S.pickMissions(T);
  let r = S.recordSession(st, ms[0], 1, 8, T); assert(r.events.missionCompleted && !r.events.dayCompleted); assert.equal(r.state.streak.count, 0);
  r = S.recordSession(r.state, ms[0], 8, 8, T); assert(!r.events.missionCompleted, "repeat session not a new mission");
  assert.equal(r.state.stats.sessions[ms[0]], 2); assert.equal(r.state.stats.perfectSessions, 1);
  r = S.recordSession(r.state, ms[1], 0, 8, T); r = S.recordSession(r.state, ms[2], 8, 8, T);
  assert(r.events.dayCompleted && r.events.streakIncreased); assert.deepEqual(r.state.streak, { count: 1, lastDate: T });
  assert.equal(r.state.stats.daysCompleted, 1); assert.equal(r.state.stats.missionsCompleted, 3);
});
t("non-mission module counts stats but not missions; total<1 ignored; unknown key ignored", () => {
  const st = base(); const ms = S.pickMissions(T); const other = S.MODULES.map((m) => m.key).find((k) => !ms.includes(k));
  let r = S.recordSession(st, other, 3, 8, T); assert(!r.events.missionCompleted); assert.equal(r.state.stats.sessions[other], 1);
  r = S.recordSession(st, ms[0], 0, 0, T); assert.strictEqual(r.state, st);
  r = S.recordSession(st, "nope", 1, 1, T); assert.strictEqual(r.state, st);
});
t("consecutive days, finishing day twice doesn't double count", () => {
  let s = day(base(), "2026-10-12").state; s = day(s, "2026-10-13").state;
  assert.equal(s.streak.count, 2); assert.equal(s.stats.daysCompleted, 2);
  const again = S.recordSession(s, S.pickMissions("2026-10-13")[0], 1, 2, "2026-10-13"); assert.equal(again.state.streak.count, 2);
});
t("missing 1 day with 1 freeze: streak continues, freeze used", () => {
  let s = day(base(), "2026-10-12").state; const r = day(s, "2026-10-14");
  assert.equal(r.state.streak.count, 2); assert.equal(r.state.streakFreezes, 0); assert.equal(r.ev.freezesUsedNow, 1); assert.equal(r.state.stats.freezesUsed, 1);
});
t("missing 2 days with 1 freeze: reset to 1, freeze kept", () => {
  let s = day(base(), "2026-10-12").state; const r = day(s, "2026-10-15");
  assert.equal(r.state.streak.count, 1); assert.equal(r.state.streakFreezes, 1); assert(r.ev.streakReset);
});
t("missing 2 days with 2 freezes: uses 2", () => {
  let s = day(base(), "2026-10-12").state; s = { ...s, streakFreezes: 2 }; const r = day(s, "2026-10-15");
  assert.equal(r.state.streak.count, 2); assert.equal(r.state.streakFreezes, 0); assert.equal(r.ev.freezesUsedNow, 2);
});
t("7-day milestone earns a freeze (capped at 2)", () => {
  let s = base(); let d = Date.UTC(2026, 9, 1);
  for (let i = 0; i < 7; i++) s = day(s, new Date(d + i * 864e5).toISOString().slice(0, 10)).state;
  assert.equal(s.streak.count, 7); assert.equal(s.streakFreezes, 2);
  for (let i = 7; i < 14; i++) s = day(s, new Date(d + i * 864e5).toISOString().slice(0, 10)).state;
  assert.equal(s.streak.count, 14); assert.equal(s.streakFreezes, 2); assert.equal(s.stats.bestStreak, 14);
});
t("month / year boundary and DST-safe consecutive days", () => {
  let s = day(base(), "2026-12-31").state; s = day(s, "2027-01-01").state; assert.equal(s.streak.count, 2);
  s = day(base(), "2026-03-28").state; s = day(s, "2026-03-29").state; s = day(s, "2026-03-30").state; assert.equal(s.streak.count, 3);
});
t("device clock moved backwards: no crash, no double count", () => {
  let s = day(base(), "2026-10-20").state; const r = day(s, "2026-10-12"); assert.equal(r.state.streak.count, 1); assert.equal(r.state.stats.daysCompleted, 1);
});
t("recordSession rolls a stale daily over (app left open past midnight)", () => {
  let s = day(base(), "2026-10-12").state; const ms = S.pickMissions("2026-10-13");
  const r = S.recordSession(s, ms[0], 1, 2, "2026-10-13"); assert.equal(r.state.daily.date, "2026-10-13"); assert.deepEqual(r.state.daily.done, [ms[0]]);
});
t("getStreakView statuses", () => {
  const v = (count, lastDate, freezes) => S.getStreakView({ streak: { count, lastDate }, streakFreezes: freezes }, "2026-10-12");
  assert.equal(v(0, null, 1).status, "none"); assert.equal(v(4, "2026-10-12", 1).status, "doneToday");
  assert.equal(v(4, "2026-10-11", 0).status, "pending"); assert.equal(v(4, "2026-10-10", 1).status, "saved");
  assert.equal(v(4, "2026-10-09", 1).status, "broken"); assert.equal(v(4, "2026-10-09", 1).count, 0); assert.equal(v(4, "2026-10-13", 1).status, "doneToday");
});
t("removeMistake counts only real removals", () => {
  let st = base(); st = S.removeMistake(st, "idiom", "a"); assert.equal(st.stats.mistakesCleared, 1);
  st = S.removeMistake(st, "idiom", "a"); assert.equal(st.stats.mistakesCleared, 1);
  st = S.addMistake(st, "idiom", "b"); st = S.removeMistake(st, "idiom", "b"); assert.equal(st.stats.mistakesCleared, 2);
});
t("recordPracticeResult unchanged (idiom stage maths unaffected)", () => {
  let st = S.recordPracticeResult(base(), "idiom", 3, 8); assert.equal(st.moduleProgress.idiom.practiceStats.attempts, 16);
});
// ---- 階段 10: 中二 (s2) ----
const levelsState = (level) => ({ level, moduleProgress: mp });
t("LEVELS: p5 / p6 / s1 / s2 in that order, the label is only 「中二」 (never 中三), the note is on s2 only", () => {
  assert.deepEqual(S.LEVELS.map((l) => l.key), ["p5", "p6", "s1", "s2"]);
  assert.deepEqual(S.LEVELS.map((l) => l.label), ["小五", "小六", "中一", "中二"]);
  S.LEVELS.forEach((l) => assert(!l.label.includes("中三")));
  assert.equal(S.LEVELS.find((l) => l.key === "s2").note, "中二內容涵蓋中二至中三");
  assert(S.LEVELS.filter((l) => l.key !== "s2").every((l) => !l.note));
});
t("level s2: a save with level s2 loads as s2 and survives save → load", () => {
  const { S: S2, store } = load(levelsState("s2"));
  assert.equal(S2.loadState().level, "s2");
  S2.saveState({ ...S2.loadState(), level: "s2" });
  assert.equal(JSON.parse(store["chineseOps:v1"]).level, "s2");
  assert.equal(S2.loadState().level, "s2");
});
t("level s2: backup export → import keeps s2 (version stays 2, no new field)", () => {
  const { S: S2 } = load(levelsState("s2"));
  const file = S2.buildBackup(S2.loadState());
  assert.equal(file.version, 2);
  const r = S2.parseBackup(JSON.stringify(file));
  assert(r.ok); assert.equal(r.state.level, "s2");
  assert.deepEqual(Object.keys(r.state).sort(), Object.keys(S2.loadState()).sort());
  // and a v1 file that says s2 is read the same way
  assert.equal(S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 1, data: { "chineseOps:v1": levelsState("s2") } })).state.level, "s2");
});
t("unknown level falls back to p5 (save, backup, junk types)", () => {
  for (const bad of ["s3", "中二", "", null, undefined, 2, {}, ["s2"]]) {
    const { S: S2 } = load(levelsState(bad));
    assert.equal(S2.loadState().level, "p5", String(bad));
    const r = S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": levelsState(bad) } }));
    assert(r.ok); assert.equal(r.state.level, "p5", String(bad));
  }
});
t("old saves and backups without s2 (p5 / p6 / s1, v1 and v2) are read exactly as before", () => {
  for (const lv of ["p5", "p6", "s1"]) {
    assert.equal(load(levelsState(lv)).S.loadState().level, lv);
    for (const version of [1, 2]) {
      const r = S.parseBackup(JSON.stringify({ app: "chinese-ops", version, data: { "chineseOps:v1": levelsState(lv) } }));
      assert(r.ok); assert.equal(r.state.level, lv);
    }
  }
});
t.done();
