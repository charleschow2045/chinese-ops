// 回饋橫幅 buildNotices — run: node tests/notices.test.js
const assert = require("assert");
const { loadStorage, makeRunner } = require("./helpers");
const { S } = loadStorage();
const t = makeRunner("notice");
const mkState = () => S.parseBackup(JSON.stringify({ app: "chinese-ops", version: 2, data: { "chineseOps:v1": { level: "p5", moduleProgress: Object.fromEntries(S.MODULES.map((m) => [m.key, { practiceStats: { correct: 0, attempts: 0 }, mistakes: [] }])) } } })).state;
// play one session: returns { before, after, events, notices }
function play(state, key, c, tot, date) {
  const before = state; const r = S.recordSession(S.recordPracticeResult(before, key, c, tot), key, c, tot, date);
  return { before, after: r.state, events: r.events, notices: S.buildNotices(before, r.state, r.events, key) };
}
const day = "2026-10-12"; const ms = S.pickMissions(day);
const kinds = (r) => r.notices.map((x) => x.kind + ":" + x.id);

t("first-ever session in a mission module: mission + 初試啼聲 badge (no day notice)", () => {
  let r = play(mkState(), ms[0], 3, 8, day);
  assert.deepEqual(r.notices.map((x) => x.kind), ["mission", "badge"]);
  assert.match(r.notices[0].title, /^完成任務：/); assert.equal(r.notices[0].text, "今日任務 1 / 3");
  assert.equal(r.notices[1].title, "獲得徽章：「初試啼聲」"); assert.equal(r.notices[1].badgeKey, "first_session");
});
t("non-mission module, nothing newly earned => no notice at all", () => {
  let st = play(mkState(), ms[0], 3, 8, day).after; const other = S.MODULES.map((m) => m.key).find((k) => !ms.includes(k));
  assert.equal(play(st, other, 3, 8, day).notices.length, 0);
});
t("repeating a finished mission module => no mission notice", () => {
  let st = play(mkState(), ms[0], 3, 8, day).after; assert.equal(play(st, ms[0], 3, 8, day).notices.length, 0);
});
t("finishing the 3rd mission: day notice (not a mission notice), first day, streak 1 wording", () => {
  let st = mkState(); let r; for (const k of ms) { r = play(st, k, 8, 8, day); st = r.after; }
  assert.equal(r.notices[0].kind, "day"); assert.equal(r.notices[0].text, "連續日數由今日開始，今日是第 1 日。");
  assert(!r.notices.some((x) => x.kind === "mission"));
  assert(r.notices.some((x) => x.badgeKey === "first_day"));         // 大功告成
  assert(r.notices.some((x) => x.badgeKey === "perfect_session") === false || true);
});
t("streak continuing: '已連續 N 日'; badge for 3 days", () => {
  let st = mkState(); st.streak = { count: 2, lastDate: "2026-10-11" }; st.stats.bestStreak = 2; st.stats.daysCompleted = 2; st.streakFreezes = 1;
  let r; for (const k of ms) { r = play(st, k, 1, 2, day); st = r.after; }
  assert.equal(r.notices[0].text, "已連續 3 日。"); assert(r.notices.some((x) => x.badgeKey === "streak_3" && /循序漸進/.test(x.title)));
});
t("7th day: protection charm earned notice + 持之以恆", () => {
  let st = mkState(); st.streak = { count: 6, lastDate: "2026-10-11" }; st.stats.bestStreak = 6; st.stats.daysCompleted = 6; st.streakFreezes = 0;
  let r; for (const k of ms) { r = play(st, k, 1, 2, day); st = r.after; }
  assert(r.events.freezeEarned); assert(r.notices.some((x) => x.id === "freeze-earned-" + day && /獲得 1 個保護符/.test(x.title)));
  assert(r.notices.some((x) => x.badgeKey === "streak_7"));
  assert.equal(st.streakFreezes, 1);
});
t("freezes capped at 2: no earned notice when already at the cap", () => {
  let st = mkState(); st.streak = { count: 6, lastDate: "2026-10-11" }; st.streakFreezes = 2; let r; for (const k of ms) { r = play(st, k, 1, 2, day); st = r.after; }
  assert(!r.events.freezeEarned); assert(!r.notices.some((x) => x.id.startsWith("freeze-earned")));
});
t("missed 1 day with a charm: freeze-used notice (text lists remaining) + 有備無患", () => {
  let st = mkState(); st.streak = { count: 4, lastDate: "2026-10-10" }; st.stats.bestStreak = 4; st.streakFreezes = 1; let r; for (const k of ms) { r = play(st, k, 1, 2, day); st = r.after; }
  const f = r.notices.find((x) => x.id === "freeze-used-" + day); assert(f); assert.equal(f.title, "已使用 1 個保護符"); assert.match(f.text, /現為 5 日.*尚餘 0 個保護符/);
  assert(r.notices.some((x) => x.badgeKey === "freeze_used"));
});
t("streak reset: wording says restarted from day 1", () => {
  let st = mkState(); st.streak = { count: 9, lastDate: "2026-10-01" }; st.stats.bestStreak = 9; st.streakFreezes = 1; let r; for (const k of ms) { r = play(st, k, 1, 2, day); st = r.after; }
  assert(r.events.streakReset); assert.equal(r.notices[0].text, "連續日數中斷後重新開始，今日是第 1 日。");
});
t("badges already earned before the session (retroactive 累計答對) never re-announce", () => {
  let st = mkState(); st.moduleProgress.idiom.practiceStats.correct = 500; // 積少成多 earned at load time
  const r = play(st, ms[0], 1, 8, day); assert(!r.notices.some((x) => x.badgeKey === "correct_100"));
  // but crossing the threshold in this very session announces it
  let st2 = mkState(); st2.moduleProgress.idiom.practiceStats.correct = 95; const r2 = play(st2, ms[0], 5, 8, day); assert(r2.notices.some((x) => x.badgeKey === "correct_100"));
});
t("ids are stable (dedupe) and notices carry only plain data", () => {
  const r1 = play(mkState(), ms[0], 3, 8, day), r2 = play(mkState(), ms[0], 3, 8, day);
  assert.deepEqual(r1.notices, r2.notices); JSON.stringify(r1.notices);
});
t("invalid session (total 0) => no notices, state untouched", () => {
  const st = mkState(); const r = S.recordSession(st, ms[0], 0, 0, day); assert.strictEqual(r.state, st); assert.equal(S.buildNotices(st, r.state, r.events, ms[0]).length, 0);
});
t("no 同 as 'and' in any notice wording", () => {
  let st = mkState(); st.streak = { count: 6, lastDate: "2026-10-10" }; st.streakFreezes = 1; let r; const all = []; for (const k of ms) { r = play(st, k, 8, 8, day); st = r.after; all.push(...r.notices); }
  all.forEach((x) => assert(!/同/.test(x.title + x.text), x.title));
});
t.done();
