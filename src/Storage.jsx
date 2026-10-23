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

  // Drops mistake ids that no longer exist in a module's content (for example an
  // idiom that a later release removed or re-spelled). Storage knows nothing about
  // content, so the caller passes the ids that are still valid. Only that module's
  // `mistakes` list is touched: practiceStats, stats (this is NOT 清除錯題, so
  // `mistakesCleared` stays as it is) and every other module are left alone. Pure,
  // never throws, and returns the very same object when nothing has to be dropped.
  function pruneUnknownMistakes(state, moduleKey, validIds) {
    try {
      const prev = state && state.moduleProgress && state.moduleProgress[moduleKey] && state.moduleProgress[moduleKey].mistakes;
      if (!Array.isArray(prev) || !validIds) return state;
      const valid = new Set(validIds);
      const next = prev.filter((id) => valid.has(id));
      if (next.length === prev.length) return state;
      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleKey]: { ...state.moduleProgress[moduleKey], mistakes: next },
        },
      };
    } catch (e) {
      return state;
    }
  }

  // Called once per finished practice session (the same moment as
  // recordPracticeResult). Updates the day's missions, the streak and the
  // lifetime stats. Pure: returns { state, events } — `events` is a transient
  // description of what just happened for the UI (never persisted).
  function recordSession(state, moduleKey, correctCount, totalCount, today = todayStr()) {
    const events = { missionCompleted: false, dayCompleted: false, streakIncreased: false, streakReset: false, freezesUsedNow: 0, freezeEarned: false };
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
          if (events.streakIncreased && streak.count % 7 === 0 && streakFreezes < MAX_STREAK_FREEZES) {
            streakFreezes += 1;
            events.freezeEarned = true;
          }
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

  // ---- 徽章 (badges) ----
  // Pure functions of the saved state — "earned" is always recomputed, never
  // stored, so it can't drift out of sync (and old backups earn what they
  // already qualify for, e.g. 累計答對 comes from the existing practiceStats).
  // Each entry: key, seal (the one character stamped on its 印章), name, group
  // ("streak" | "milestone" | "module" | "special"; module badges also carry
  // `module`), condition (what to do), meaning (成語 meaning, 書面語, per
  // 教育部《成語典》), progress(state) → { cur, target }; earned = cur >= target.
  const MODULE_BADGE_SESSIONS = 5;
  const sumValues = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const totalCorrect = (s) => Object.values(s.moduleProgress).reduce((a, p) => a + p.practiceStats.correct, 0);
  const prog = (cur, target) => ({ cur: Math.min(cur, target), target });

  const streakBadge = (key, seal, name, days, meaning) => ({
    key, seal, name, group: "streak", condition: `連續 ${days} 日完成每日任務`, meaning,
    progress: (s) => prog(s.stats.bestStreak, days),
  });
  const moduleBadge = (module, seal, name, meaning) => ({
    key: `module_${module}`, seal, name, group: "module", module,
    condition: `完成${MODULES.find((m) => m.key === module).label} ${MODULE_BADGE_SESSIONS} 節練習`, meaning,
    progress: (s) => prog(s.stats.sessions[module], MODULE_BADGE_SESSIONS),
  });

  const BADGES = [
    streakBadge("streak_3", "序", "循序漸進", 3, "依照一定的次序和步驟，一步步往前推進。"),
    streakBadge("streak_7", "恆", "持之以恆", 7, "有恆心，堅持到底。"),
    streakBadge("streak_14", "累", "日積月累", 14, "逐日逐月，長時間不斷累積。"),
    streakBadge("streak_30", "鍥", "鍥而不捨", 30, "不斷雕刻而不停止，比喻有恆心，不放棄。"),
    streakBadge("streak_60", "滴", "水滴石穿", 60, "比喻只要持之以恆，力量雖小，最終也必有成就。"),
    {
      key: "freeze_used", seal: "備", name: "有備無患", group: "streak", condition: "首次使用保護符保住連續日數",
      meaning: "事先做好準備，就能免除後患。", progress: (s) => prog(s.stats.freezesUsed, 1),
    },
    {
      key: "first_session", seal: "啼", name: "初試啼聲", group: "milestone", condition: "完成第 1 節練習",
      meaning: "第一次展現才華或本領。", progress: (s) => prog(sumValues(s.stats.sessions), 1),
    },
    {
      key: "first_day", seal: "功", name: "大功告成", group: "milestone", condition: "首次完成一日全部 3 個任務",
      meaning: "完成偉大、艱鉅的事務；泛指事情順利完成。", progress: (s) => prog(s.stats.daysCompleted, 1),
    },
    {
      key: "correct_100", seal: "多", name: "積少成多", group: "milestone", condition: "累計答對 100 題",
      meaning: "累積少量而成為大量。", progress: (s) => prog(totalCorrect(s), 100),
    },
    {
      key: "correct_1000", seal: "富", name: "學富五車", group: "milestone", condition: "累計答對 1000 題",
      meaning: "讀過的書多，學識廣博。", progress: (s) => prog(totalCorrect(s), 1000),
    },
    moduleBadge("poetry", "詩", "詩情畫意", "像詩畫一樣美好的意境。"),
    moduleBadge("essay", "章", "出口成章", "才思敏捷，談吐有文采。"),
    moduleBadge("cangjie", "手", "得心應手", "心裏怎樣想，手便能怎樣做，比喻技藝熟練，運用自如。"),
    moduleBadge("mandarin", "腔", "字正腔圓", "咬字清晰，發音正確。"),
    moduleBadge("idiom", "賅", "言簡意賅", "言辭簡單而意思完備。"),
    moduleBadge("history", "古", "博古通今", "學問淵博，通曉古今。"),
    moduleBadge("reading", "卷", "開卷有益", "打開書本閱讀，就能得到好處。"),
    moduleBadge("rhetoric", "龍", "畫龍點睛", "在關鍵處加上精要的一筆，使整體更加生動傳神。"),
    moduleBadge("punctuation", "苟", "一絲不苟", "做事認真，一點也不馬虎。"),
    moduleBadge("classicalProse", "溫", "溫故知新", "溫習學過的課業，而能領悟新的道理。"),
    {
      key: "all_modules", seal: "博", name: "博學多才", group: "special", condition: "10 個模組各完成至少 1 節練習",
      meaning: "學識廣博，又有多方面的才能。",
      progress: (s) => prog(MODULE_KEYS.filter((k) => s.stats.sessions[k] >= 1).length, MODULE_KEYS.length),
    },
    {
      key: "perfect_session", seal: "字", name: "一字不差", group: "special", condition: "在一節（至少 5 題）的練習中全部答對",
      meaning: "一個字也沒有差錯，完全正確。", progress: (s) => prog(s.stats.perfectSessions, 1),
    },
    {
      key: "mistakes_cleared", seal: "改", name: "知過必改", group: "special", condition: "累計清除 10 條錯題",
      meaning: "知道自己有過錯，一定改正。", progress: (s) => prog(s.stats.mistakesCleared, 10),
    },
  ];

  const BADGE_GROUPS = [
    { key: "streak", label: "連續日數" },
    { key: "milestone", label: "起步與累計" },
    { key: "module", label: "模組" },
    { key: "special", label: "特別" },
  ];

  function badgeProgress(state, badge) {
    return badge.progress(state);
  }

  function isBadgeEarned(state, badge) {
    const p = badge.progress(state);
    return p.cur >= p.target;
  }

  function earnedBadgeKeys(state) {
    return BADGES.filter((b) => isBadgeEarned(state, b)).map((b) => b.key);
  }

  // What to tell the child right after a finished session: pure function of the
  // state before/after `recordSession` and its `events` (never persisted).
  // Order = importance: the day / mission result, protection charms, then any
  // newly earned badges (compared against `before`, so badges that were already
  // earned — e.g. 累計答對 from old progress — never re-announce).
  // Each notice: { id, kind: "day" | "mission" | "freeze" | "badge", icon, title, text, badgeKey? };
  // `id` is stable per day/badge so repeated delivery replaces rather than stacks.
  function buildNotices(before, after, events, moduleKey) {
    const out = [];
    const today = after.daily.date;
    const mod = MODULES.find((m) => m.key === moduleKey);
    if (events.dayCompleted) {
      const count = after.streak.count;
      out.push({
        id: `day-${today}`,
        kind: "day",
        icon: "🎉",
        title: "今日任務全部完成！",
        text: events.streakReset
          ? "連續日數中斷後重新開始，今日是第 1 日。"
          : count <= 1
          ? "連續日數由今日開始，今日是第 1 日。"
          : `已連續 ${count} 日。`,
      });
    } else if (events.missionCompleted) {
      out.push({
        id: `mission-${today}-${moduleKey}`,
        kind: "mission",
        icon: "✅",
        title: `完成任務：${mod ? mod.label : moduleKey}`,
        text: `今日任務 ${after.daily.done.length} / ${after.daily.missions.length}`,
      });
    }
    if (events.freezesUsedNow > 0) {
      out.push({
        id: `freeze-used-${today}`,
        kind: "freeze",
        icon: "🛡️",
        title: `已使用 ${events.freezesUsedNow} 個保護符`,
        text: `中間有 ${events.freezesUsedNow} 日未練習，保護符保住了連續日數（現為 ${after.streak.count} 日）。尚餘 ${after.streakFreezes} 個保護符。`,
      });
    }
    if (events.freezeEarned) {
      out.push({
        id: `freeze-earned-${today}`,
        kind: "freeze",
        icon: "🛡️",
        title: "獲得 1 個保護符",
        text: `連續 ${after.streak.count} 日，保護符增至 ${after.streakFreezes} 個（最多 ${MAX_STREAK_FREEZES} 個）。`,
      });
    }
    const had = new Set(earnedBadgeKeys(before));
    BADGES.forEach((b) => {
      if (!had.has(b.key) && isBadgeEarned(after, b)) {
        out.push({ id: `badge-${b.key}`, kind: "badge", badgeKey: b.key, icon: "🏅", title: `獲得徽章：「${b.name}」`, text: b.meaning });
      }
    });
    return out;
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

  // ---- 科舉稱號 / 模組里程 (階段 6b) ----
  // Read-only views over `stats.sessions` (finished practice sessions per module). Nothing is stored:
  // the title and the per-module milestone are recomputed from the saved counters every time, so
  // there is no new field to back up or migrate. Bad or missing data counts as 0 and never throws.
  const TITLE_TIERS = [
    { key: "tongsheng", name: "童生", seal: "童", at: 0 },
    { key: "xiucai", name: "秀才", seal: "秀", at: 10 },
    { key: "juren", name: "舉人", seal: "舉", at: 45 },
    { key: "jinshi", name: "進士", seal: "進", at: 100 },
    { key: "tanhua", name: "探花", seal: "探", at: 180 },
    { key: "bangyan", name: "榜眼", seal: "榜", at: 300 },
    { key: "zhuangyuan", name: "狀元", seal: "狀", at: 600 },
  ];
  // A module's session count is measured against the next milestone; at the last one it is 已精通.
  const MODULE_MILESTONES = [5, 15, 30, 60, 100];

  // A usable counter: a finite, non-negative number (whole sessions). Anything else is ignored.
  const sessionCount = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const sessionsOf = (state) => {
    const sess = state && state.stats && state.stats.sessions;
    return sess !== null && typeof sess === "object" ? sess : {};
  };

  function getTitleView(state) {
    const sess = sessionsOf(state);
    const total = MODULE_KEYS.reduce((a, k) => a + sessionCount(sess[k]), 0);
    let index = 0;
    TITLE_TIERS.forEach((tier, i) => {
      if (total >= tier.at) index = i;
    });
    const cur = TITLE_TIERS[index];
    const next = TITLE_TIERS[index + 1] || null;
    return {
      index,
      key: cur.key,
      name: cur.name,
      seal: cur.seal,
      total,
      currentAt: cur.at,
      nextName: next ? next.name : null,
      nextAt: next ? next.at : null,
      remaining: next ? next.at - total : 0,
      ratio: next ? Math.min(1, total / next.at) : 1,
      isMax: !next,
    };
  }

  function getModuleMilestoneView(state, moduleKey) {
    const sessions = MODULE_KEYS.includes(moduleKey) ? sessionCount(sessionsOf(state)[moduleKey]) : 0;
    const nextAt = MODULE_MILESTONES.find((m) => m > sessions);
    if (nextAt === undefined) return { sessions, nextAt: null, ratio: 1, isMastered: true };
    return { sessions, nextAt, ratio: Math.min(1, sessions / nextAt), isMastered: false };
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
    pruneUnknownMistakes,
    MAX_STREAK_FREEZES,
    MISSION_GROUPS,
    todayStr,
    isValidDateStr,
    daysBetween,
    pickMissions,
    normalizeGamification,
    recordSession,
    getStreakView,
    BADGES,
    BADGE_GROUPS,
    badgeProgress,
    isBadgeEarned,
    earnedBadgeKeys,
    buildNotices,
    TITLE_TIERS,
    MODULE_MILESTONES,
    getTitleView,
    getModuleMilestoneView,
  };
})();
