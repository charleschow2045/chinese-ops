// Data model + localStorage persistence, shared under window.App
window.App = window.App || {};

(function () {
  // ---- 測試模式 (test mode) ----
  // Opening the site with `?today=YYYY-MM-DD` switches to test mode: the app
  // pretends today is that date AND uses a completely separate localStorage
  // key, so the real progress (REAL_KEY) is never read, written, exported over
  // or restored over. This is what makes it safe to test streaks on the iPad
  // the child actually uses. Test mode is decided once, at load time, from the
  // URL; any `today` parameter (even a malformed one) selects the test key.
  const REAL_KEY = "chineseOps:v1";
  const TEST_KEY = "chineseOps:test";
  let TEST_DATE_PARAM = null; // the raw ?today= value, or null when not in test mode
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has("today")) TEST_DATE_PARAM = q.get("today") || "";
  } catch (e) {
    TEST_DATE_PARAM = null;
  }
  const TEST_MODE = TEST_DATE_PARAM !== null;
  const STORAGE_KEY = TEST_MODE ? TEST_KEY : REAL_KEY;

  const LEVELS = [
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];
  const LEVEL_KEYS = LEVELS.map((l) => l.key);

  // `implemented` modules are tappable; the rest show as "即將推出".
  const MODULES = [
    { key: "poetry", label: "詩詞學習", emoji: "📜", color: "rose", implemented: true },
    { key: "essay", label: "作文金句", emoji: "✍️", color: "amber", implemented: true },
    { key: "cangjie", label: "倉頡輸入法", emoji: "⌨️", color: "sky", implemented: true },
    { key: "mandarin", label: "普通話練習", emoji: "🗣️", color: "emerald", implemented: true },
    { key: "idiom", label: "成語學習", emoji: "🀄", color: "violet", implemented: true },
    { key: "history", label: "中國歷史故事", emoji: "🏯", color: "orange", implemented: true },
    { key: "reading", label: "閱讀理解", emoji: "📖", color: "teal", implemented: true },
    { key: "rhetoric", label: "修辭手法", emoji: "🎭", color: "indigo", implemented: true },
    { key: "punctuation", label: "標點符號", emoji: "。", color: "fuchsia", implemented: true },
    { key: "classicalProse", label: "文言文選讀", emoji: "🏺", color: "lime", implemented: true },
  ];

  // `mistakes` is an array of content-item ids the child has answered
  // wrong at least once and not yet answered correctly since — powers the
  // 練習錯題 (mistake review) feature. Cleared on a correct answer, added on
  // a wrong one; see `addMistake`/`removeMistake` below.
  function defaultModuleProgress() {
    return { practiceStats: { correct: 0, attempts: 0 }, mistakes: [] };
  }

  // ---- 每日任務 / 連續日數 / 統計 (daily missions, streak, stats) ----
  // Dates are local "YYYY-MM-DD" strings. Everything below is pure (no
  // localStorage, no clock reads except the `today` default) so it can be
  // unit-tested and reused by both loadState and sanitizeState.
  const MAX_STREAK_FREEZES = 2;
  const MAX_STREAK_DAYS = 36500;
  const MAX_COUNTER = 1000000;
  const MODULE_KEYS = MODULES.map((m) => m.key);
  const MISSIONS_PER_DAY = 3;
  // One mission is drawn from each group per day (see pickMissions).
  const MISSION_GROUPS = [
    ["idiom", "rhetoric", "punctuation", "essay"], // 語文基礎
    ["poetry", "classicalProse", "history", "reading"], // 閱讀文化
    ["mandarin", "cangjie"], // 字音輸入
  ];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function todayStr() {
    if (TEST_MODE && isValidDateStr(TEST_DATE_PARAM)) return TEST_DATE_PARAM;
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  // Whole days since the epoch for a "YYYY-MM-DD" string, or null if it is not
  // a real calendar date (so "2026-13-45" and "2026-02-30" are rejected).
  function dayNumber(str) {
    if (typeof str !== "string" || !DATE_RE.test(str)) return null;
    const y = Number(str.slice(0, 4));
    const m = Number(str.slice(5, 7));
    const d = Number(str.slice(8, 10));
    const t = Date.UTC(y, m - 1, d);
    const back = new Date(t);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
    return Math.round(t / 86400000);
  }

  function isValidDateStr(str) {
    return dayNumber(str) !== null;
  }

  // Days from date `a` to date `b` (positive when b is later). Both must be valid.
  function daysBetween(a, b) {
    return dayNumber(b) - dayNumber(a);
  }

  // The date `n` days after (or before, if negative) a valid "YYYY-MM-DD".
  function addDays(dateStr, n) {
    const t = new Date(dayNumber(dateStr) * 86400000 + n * 86400000);
    return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
  }

  // Deterministic: the same date always gives the same 3 missions, one per
  // MISSION_GROUPS group. Group B's extra `floor(day/4)` term keeps the A/B
  // pairing from repeating in a fixed 4-day cycle.
  function pickMissions(dateStr) {
    const day = dayNumber(dateStr) || 0;
    const [a, b, c] = MISSION_GROUPS;
    return [a[day % a.length], b[(day + Math.floor(day / 4)) % b.length], c[day % c.length]];
  }

  function defaultStats() {
    return {
      daysCompleted: 0, // days on which all 3 missions were finished
      missionsCompleted: 0,
      bestStreak: 0,
      freezesUsed: 0,
      perfectSessions: 0, // sessions of >= 5 questions with every one correct
      mistakesCleared: 0, // 錯題 removed by answering correctly
      sessions: Object.fromEntries(MODULE_KEYS.map((k) => [k, 0])), // finished sessions per module
    };
  }

  function defaultDaily(dateStr) {
    return { date: dateStr, missions: pickMissions(dateStr), done: [] };
  }

  // The daily block as it should look on `today`, even if the stored one is
  // from an earlier day (the app may have been left open past midnight).
  function getDaily(state, today = todayStr()) {
    return state.daily && state.daily.date === today ? state.daily : defaultDaily(today);
  }

  function defaultState() {
    const moduleProgress = {};
    MODULES.forEach((m) => {
      moduleProgress[m.key] = defaultModuleProgress();
    });
    return {
      level: "p5",
      moduleProgress,
      daily: defaultDaily(todayStr()),
      streak: { count: 0, lastDate: null },
      streakFreezes: 1,
      stats: defaultStats(),
    };
  }

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function nonNegInt(v) {
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  }

  function cappedInt(v, max) {
    return Math.min(nonNegInt(v), max);
  }

  // Rebuilds the daily/streak/stats fields from untrusted data (a saved
  // state of any age, or an imported backup) and rolls the day over to
  // `today`. Missing or malformed pieces fall back to defaults — it never
  // throws and never rejects the whole file. Returns ONLY the new fields.
  function normalizeGamification(raw, today = todayStr()) {
    const src = isPlainObject(raw) ? raw : {};

    const st = isPlainObject(src.stats) ? src.stats : {};
    const sess = isPlainObject(st.sessions) ? st.sessions : {};
    const stats = defaultStats();
    stats.daysCompleted = cappedInt(st.daysCompleted, MAX_COUNTER);
    stats.missionsCompleted = cappedInt(st.missionsCompleted, MAX_COUNTER);
    stats.freezesUsed = cappedInt(st.freezesUsed, MAX_COUNTER);
    stats.perfectSessions = cappedInt(st.perfectSessions, MAX_COUNTER);
    stats.mistakesCleared = cappedInt(st.mistakesCleared, MAX_COUNTER);
    MODULE_KEYS.forEach((k) => {
      stats.sessions[k] = cappedInt(sess[k], MAX_COUNTER);
    });

    const sk = isPlainObject(src.streak) ? src.streak : {};
    const lastDate = isValidDateStr(sk.lastDate) ? sk.lastDate : null;
    // A streak with no valid last day cannot be continued, so count it as 0.
    const count = lastDate ? cappedInt(sk.count, MAX_STREAK_DAYS) : 0;
    stats.bestStreak = Math.max(cappedInt(st.bestStreak, MAX_STREAK_DAYS), count);

    // Saves from before this feature have no `streakFreezes` → start with 1.
    const streakFreezes =
      src.streakFreezes === undefined ? 1 : Math.min(cappedInt(src.streakFreezes, MAX_STREAK_FREEZES), MAX_STREAK_FREEZES);

    // Daily progress only carries over if it is for today; otherwise a fresh day.
    const d = isPlainObject(src.daily) ? src.daily : {};
    let daily = defaultDaily(today);
    if (d.date === today) {
      const missionsOk =
        Array.isArray(d.missions) &&
        d.missions.length === MISSIONS_PER_DAY &&
        d.missions.every((k) => MODULE_KEYS.includes(k)) &&
        new Set(d.missions).size === MISSIONS_PER_DAY;
      const missions = missionsOk ? d.missions.slice() : daily.missions;
      const done = Array.isArray(d.done)
        ? [...new Set(d.done.filter((k) => typeof k === "string" && missions.includes(k)))]
        : [];
      daily = { date: today, missions, done };
    }

    return { daily, streak: { count, lastDate }, streakFreezes, stats };
  }

    function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.moduleProgress) return defaultState();
      if (!LEVEL_KEYS.includes(parsed.level)) parsed.level = "p5";
      MODULES.forEach((m) => {
        if (!parsed.moduleProgress[m.key]) {
          parsed.moduleProgress[m.key] = defaultModuleProgress();
        } else if (!Array.isArray(parsed.moduleProgress[m.key].mistakes)) {
          // Migrates saves from before 錯題重溫 existed (mistakes wasn't tracked yet).
          parsed.moduleProgress[m.key].mistakes = [];
        }
      });
      // Adds the daily/streak/stats fields to saves that predate them, and
      // rolls the day over — same code path as importing a backup.
      Object.assign(parsed, normalizeGamification(parsed));
      return parsed;
    } catch (e) {
      console.error("Failed to load Chinese Ops data:", e);
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save Chinese Ops data:", e);
    }
  }

  function recordPracticeResult(state, moduleKey, correctCount, totalCount) {
    const prev = state.moduleProgress[moduleKey]?.practiceStats || { correct: 0, attempts: 0 };
    return {
      ...state,
      moduleProgress: {
        ...state.moduleProgress,
        [moduleKey]: {
          ...state.moduleProgress[moduleKey],
          practiceStats: {
            correct: prev.correct + correctCount,
            attempts: prev.attempts + totalCount,
          },
        },
      },
    };
  }

  // Adds `itemId` to a module's mistake list (no-op if already present).
  function addMistake(state, moduleKey, itemId) {
    const prev = state.moduleProgress[moduleKey]?.mistakes || [];
    if (prev.includes(itemId)) return state;
    return {
      ...state,
      moduleProgress: {
        ...state.moduleProgress,
        [moduleKey]: { ...state.moduleProgress[moduleKey], mistakes: [...prev, itemId] },
      },
    };
  }

  // Removes `itemId` from a module's mistake list — called when the child
  // answers correctly, in or out of review mode, since either way they've
  // now demonstrated they know it.
  function removeMistake(state, moduleKey, itemId) {
    const prev = state.moduleProgress[moduleKey]?.mistakes || [];
    if (!prev.includes(itemId)) return state;
    return {
      ...state,
      stats: state.stats ? { ...state.stats, mistakesCleared: state.stats.mistakesCleared + 1 } : state.stats,
      moduleProgress: {
        ...state.moduleProgress,
        [moduleKey]: { ...state.moduleProgress[moduleKey], mistakes: prev.filter((id) => id !== itemId) },
      },
    };
  }

  // Called once per finished practice session (the same moment as
  // recordPracticeResult). Updates the day's missions, the streak and the
  // lifetime stats. Pure: returns { state, events } — `events` is a transient
  // description of what just happened for the UI (never persisted).
  function recordSession(state, moduleKey, correctCount, totalCount, today = todayStr()) {
    const events = { missionCompleted: false, dayCompleted: false, streakIncreased: false, streakReset: false, freezesUsedNow: 0 };
    if (!MODULE_KEYS.includes(moduleKey) || !(totalCount >= 1)) return { state, events };

    const correct = Math.min(Math.max(nonNegInt(correctCount), 0), totalCount);
    // Roll over first: the app may have been left open past midnight.
    let daily = getDaily(state, today);
    let streak = state.streak;
    let streakFreezes = state.streakFreezes;
    const stats = { ...state.stats, sessions: { ...state.stats.sessions } };

    stats.sessions[moduleKey] = (stats.sessions[moduleKey] || 0) + 1;
    if (totalCount >= 5 && correct === totalCount) stats.perfectSessions += 1;

    if (daily.missions.includes(moduleKey) && !daily.done.includes(moduleKey)) {
      daily = { ...daily, done: [...daily.done, moduleKey] };
      stats.missionsCompleted += 1;
      events.missionCompleted = true;

      if (daily.done.length === daily.missions.length) {
        events.dayCompleted = true;
        const prevCount = streak.count;
        const gap = streak.lastDate ? daysBetween(streak.lastDate, today) : null;
        if (gap !== null && gap <= 0) {
          // The streak already counts today (or the device clock went backwards):
          // don't count the day twice.
          events.dayCompleted = false;
        } else {
          if (gap === null) {
            streak = { count: 1, lastDate: today };
          } else if (gap === 1) {
            streak = { count: streak.count + 1, lastDate: today };
          } else {
            const missed = gap - 1; // whole days skipped; one freeze covers each
            if (streakFreezes >= missed) {
              streak = { count: streak.count + 1, lastDate: today };
              streakFreezes -= missed;
              stats.freezesUsed += missed;
              events.freezesUsedNow = missed;
            } else {
              streak = { count: 1, lastDate: today };
              events.streakReset = prevCount > 0;
            }
          }
          events.streakIncreased = streak.count > prevCount;
          stats.daysCompleted += 1;
          stats.bestStreak = Math.max(stats.bestStreak, streak.count);
          // Earn a freeze back at every 7-day milestone, capped.
          if (events.streakIncreased && streak.count % 7 === 0 && streakFreezes < MAX_STREAK_FREEZES) streakFreezes += 1;
        }
      }
    }

    return { state: { ...state, daily, streak, streakFreezes, stats }, events };
  }

  // What the streak looks like *today*, for display (the stored count only
  // changes when a day is completed, so it can be stale after missed days).
  // status: "none" | "doneToday" | "pending" (counted through yesterday) |
  //         "saved" (days were missed but freezes would cover them) | "broken"
  function getStreakView(state, today = todayStr()) {
    const { count, lastDate } = state.streak;
    if (!lastDate || count <= 0) return { count: 0, status: "none", freezesNeeded: 0 };
    const gap = daysBetween(lastDate, today);
    if (gap <= 0) return { count, status: "doneToday", freezesNeeded: 0 };
    if (gap === 1) return { count, status: "pending", freezesNeeded: 0 };
    const missed = gap - 1;
    if (state.streakFreezes >= missed) return { count, status: "saved", freezesNeeded: missed };
    return { count: 0, status: "broken", freezesNeeded: missed };
  }

  // ---- Backup / restore ----
  // localStorage holds exactly one key for this app (STORAGE_KEY); it is the
  // only entry in `data`. Add further keys here if the app ever uses more.
  const BACKUP_APP = "chinese-ops";
  const BACKUP_VERSION = 2; // v2 added daily/streak/stats; v1 files still import (new fields default)
  const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

  // Rebuilds a state object from untrusted data, keeping only known fields
  // with the right types; returns null if it is not recognisable progress.
  function sanitizeState(raw) {
    if (!isPlainObject(raw) || !isPlainObject(raw.moduleProgress)) return null;
    const state = defaultState();
    if (LEVEL_KEYS.includes(raw.level)) state.level = raw.level;
    MODULES.forEach((m) => {
      const src = raw.moduleProgress[m.key];
      if (!isPlainObject(src)) return;
      const stats = isPlainObject(src.practiceStats) ? src.practiceStats : {};
      const correct = nonNegInt(stats.correct);
      const attempts = Math.max(nonNegInt(stats.attempts), correct);
      const mistakes = Array.isArray(src.mistakes)
        ? [...new Set(src.mistakes.filter((id) => typeof id === "string" && id.length > 0 && id.length <= 100))]
        : [];
      state.moduleProgress[m.key] = { practiceStats: { correct, attempts }, mistakes };
    });
    // Whitelist for the daily/streak/stats fields — anything not copied here
    // is silently lost on restore, so new progress fields MUST be added to
    // normalizeGamification.
    Object.assign(state, normalizeGamification(raw));
    return state;
  }

  function buildBackup(state) {
    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      ...(TEST_MODE ? { testMode: true } : {}),
      data: { [STORAGE_KEY]: state },
    };
  }

  // Parses backup file text. Returns { ok: true, state, exportedAt } or
  // { ok: false, reason: "invalid" | "wrongApp" | "newerVersion" | "tooBig" |
  // "testFile" }. Never throws. A file exported from test mode ("testFile") is
  // refused outside test mode so it can never overwrite real progress; test
  // mode itself may import a real backup file (it only ever writes the test key).
  function parseBackup(text) {
    try {
      if (typeof text !== "string" || text.length === 0) return { ok: false, reason: "invalid" };
      if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: "tooBig" };
      const parsed = JSON.parse(text);
      if (!isPlainObject(parsed)) return { ok: false, reason: "invalid" };
      if (parsed.app !== BACKUP_APP) return { ok: false, reason: typeof parsed.app === "string" ? "wrongApp" : "invalid" };
      if (!Number.isInteger(parsed.version) || parsed.version < 1) return { ok: false, reason: "invalid" };
      if (parsed.version > BACKUP_VERSION) return { ok: false, reason: "newerVersion" };
      if (!isPlainObject(parsed.data)) return { ok: false, reason: "invalid" };
      if (!TEST_MODE && (parsed.testMode === true || (!(REAL_KEY in parsed.data) && TEST_KEY in parsed.data))) {
        return { ok: false, reason: "testFile" };
      }
      const payload = parsed.data[STORAGE_KEY] !== undefined ? parsed.data[STORAGE_KEY] : TEST_MODE ? parsed.data[REAL_KEY] : undefined;
      const state = sanitizeState(payload);
      if (!state) return { ok: false, reason: "invalid" };
      const t = Date.parse(parsed.exportedAt);
      return { ok: true, state, exportedAt: Number.isFinite(t) ? new Date(t) : null };
    } catch (e) {
      return { ok: false, reason: "invalid" };
    }
  }

  // Overwrites local progress with an already-sanitized state.
  function restoreState(state) {
    saveState(state);
  }

  window.App.Storage = {
    STORAGE_KEY,
    TEST_MODE,
    TEST_DATE_PARAM,
    addDays,
    getDaily,
    BACKUP_APP,
    BACKUP_VERSION,
    buildBackup,
    parseBackup,
    sanitizeState,
    restoreState,
    LEVELS,
    MODULES,
    loadState,
    saveState,
    recordPracticeResult,
    addMistake,
    removeMistake,
    MAX_STREAK_FREEZES,
    MISSION_GROUPS,
    todayStr,
    isValidDateStr,
    daysBetween,
    pickMissions,
    normalizeGamification,
    recordSession,
    getStreakView,
  };
})();
