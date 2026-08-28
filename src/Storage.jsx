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

  window.App.Storage = {
    STORAGE_KEY,
    LEVELS,
    MODULES,
    loadState,
    saveState,
    recordPracticeResult,
    addMistake,
    removeMistake,
  };
})();
