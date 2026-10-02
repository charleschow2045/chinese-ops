// Data model + localStorage persistence, shared under window.App
window.App = window.App || {};

(function () {
  const STORAGE_KEY = "chineseOps:v1";

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

  function defaultState() {
    const moduleProgress = {};
    MODULES.forEach((m) => {
      moduleProgress[m.key] = defaultModuleProgress();
    });
    return { level: "p5", moduleProgress };
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
      moduleProgress: {
        ...state.moduleProgress,
        [moduleKey]: { ...state.moduleProgress[moduleKey], mistakes: prev.filter((id) => id !== itemId) },
      },
    };
  }

  // ---- Backup / restore ----
  // localStorage holds exactly one key for this app (STORAGE_KEY); it is the
  // only entry in `data`. Add further keys here if the app ever uses more.
  const BACKUP_APP = "chinese-ops";
  const BACKUP_VERSION = 1;
  const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function nonNegInt(v) {
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  }

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
    return state;
  }

  function buildBackup(state) {
    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: { [STORAGE_KEY]: state },
    };
  }

  // Parses backup file text. Returns { ok: true, state, exportedAt } or
  // { ok: false, reason: "invalid" | "wrongApp" | "newerVersion" | "tooBig" }.
  // Never throws.
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
      const state = sanitizeState(parsed.data[STORAGE_KEY]);
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
  };
})();
