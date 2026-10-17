// Top-level app: hub-and-spoke navigation between Home and modules
window.App = window.App || {};

(function () {
  const { useState, useEffect, useRef } = React;
  const {
    Storage,
    Home,
    PoetryModule,
    EssayModule,
    CangjieModule,
    MandarinModule,
    IdiomModule,
    HistoryModule,
    ReadingModule,
    RhetoricModule,
    PunctuationModule,
    ClassicalProseModule,
    TestModeBanner,
    BadgesScreen,
    NoticeStack,
  } = window.App;
  const { A2, A2Background, A2Context } = window.App.UI;

  // 階段 6c: the screens that use the A2 look (A2 backdrop, no app-title header, and — for module screens —
  // A2 versions of the shared components through A2Context). 6c-1 = home + the 文言文選讀 pilot; 6c-2 adds
  // 修辭 / 標點 / 作文 / 詩詞; 6c-3 adds 成語 / 閱讀理解 / 歷史; 6c-4 adds 倉頡 / 普通話 (all 10 modules are now A2);
  // 6d-1 adds the badge screen, so every view is A2 (the 文房 backdrop branch below is kept until 6d-2).
  const A2_VIEWS = ["home", "badges", "classicalProse", "rhetoric", "punctuation", "essay", "poetry", "idiom", "reading", "history", "cangjie", "mandarin"];

  function Root() {
    const [state, setState] = useState(() => Storage.loadState());
    const [view, setView] = useState("home");
    // Optional params for a module opened via a cross-module link (e.g. a story
    // opening a poem): { poemId | storyId, from: { module, opts } }.
    const [nav, setNav] = useState(null);

    useEffect(() => {
      Storage.saveState(state);
    }, [state]);

    // A new screen always starts at the top (the page used to keep the previous screen's scroll offset).
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [view]);

    // The date the home screen shows missions for. Re-read whenever the page
    // is shown again (an iPad home-screen app can sit open overnight).
    const [today, setToday] = useState(() => Storage.todayStr());
    useEffect(() => {
      const sync = () => setToday(Storage.todayStr());
      document.addEventListener("visibilitychange", sync);
      window.addEventListener("focus", sync);
      const timer = setInterval(sync, 60000);
      return () => {
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("focus", sync);
        clearInterval(timer);
      };
    }, []);

    function changeLevel(level) {
      setState((s) => ({ ...s, level }));
    }

    // Overwrites progress with an already-sanitized backup (BackupSettings.jsx).
    function restoreProgress(restored) {
      Storage.restoreState(restored);
      setState(restored);
      setNotices([]);
    }

    function openModule(key) {
      setNav(null);
      setView(key);
    }

    // Cross-module link (poetry <-> history). Modules remount, so the target
    // reads `nav` for its starting screen.
    function navigate(key, opts) {
      setNav(opts || null);
      setView(key);
    }

    function goHome() {
      setNav(null);
      setView("home");
    }

    // 回饋橫幅 (post-session notices). In memory only: never saved or backed up.
    const MAX_NOTICES = 4;
    const [notices, setNotices] = useState([]);
    const [noticeHeight, setNoticeHeight] = useState(0); // height of the stack, so the page can scroll clear of it
    function pushNotices(list) {
      if (!list.length) return;
      setNotices((cur) => {
        const ids = new Set(list.map((n) => n.id));
        return [...cur.filter((n) => !ids.has(n.id)), ...list].slice(-MAX_NOTICES);
      });
    }
    function dismissNotice(id) {
      setNotices((cur) => cur.filter((n) => n.id !== id));
    }
    function openBadgesFromNotice(id) {
      dismissNotice(id);
      setNav(null);
      setView("badges");
    }

    // The latest committed state, for computing what to announce. (The saved
    // state itself is still updated with a functional setState below, because
    // History/Reading/ClassicalProse call onRecordPractice and then onAnswerItem
    // in the same event — a plain setState(next) would clobber the second one.)
    const stateRef = useRef(state);
    stateRef.current = state;

    // One handler for all 10 modules: each module calls onRecordPractice once
    // when a practice session finishes. That updates the lifetime practice
    // stats (recordPracticeResult) and the daily missions / streak / session
    // counters (recordSession), then announces anything notable.
    function recordPractice(moduleKey) {
      return (correctCount, total) => {
        const apply = (s) => Storage.recordSession(Storage.recordPracticeResult(s, moduleKey, correctCount, total), moduleKey, correctCount, total);
        const before = stateRef.current;
        const res = apply(before);
        pushNotices(Storage.buildNotices(before, res.state, res.events, moduleKey));
        setState((s) => apply(s).state);
      };
    }

    // Powers 練習錯題 (mistake review) — called by a module whenever the
    // child answers a specific content item right or wrong (per-question
    // for the runtime-generated modules, per-story/passage for the
    // fixed-question ones). A correct answer clears that item from the
    // module's mistake list; a wrong one adds it. See Storage.jsx.
    function answerItem(moduleKey, itemId, isCorrect) {
      setState((s) => (isCorrect ? Storage.removeMistake(s, moduleKey, itemId) : Storage.addMistake(s, moduleKey, itemId)));
    }

    const isHome = view === "home";
    const isA2 = A2_VIEWS.includes(view);

    // One provider for the whole page, so the test banner, the notices and the backup panel on the home screen
    // switch to their A2 look together with the module screens.
    return (
      <A2Context.Provider value={isA2}>
      <TestModeBanner />
      <div
        className="min-h-screen relative overflow-hidden"
        style={isA2 ? { background: A2.bg, color: A2.ink } : { backgroundColor: "#F7F0E3", color: "#241F1B" }}
      >
        {/* Screens in A2_VIEWS use the A2 backdrop; every other view keeps the 文房 one below. */}
        {isA2 && <A2Background />}
        {!isA2 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-[0.12] blur-3xl" style={{ backgroundColor: "#B0342A" }} />
          <div className="absolute top-24 -right-20 w-80 h-80 rounded-full opacity-[0.14] blur-3xl" style={{ backgroundColor: "#A9812F" }} />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full opacity-[0.12] blur-3xl" style={{ backgroundColor: "#37485B" }} />
          <span className="absolute top-16 right-8 text-4xl opacity-[0.14]">🏮</span>
          <span className="absolute top-48 left-6 text-3xl opacity-[0.14]">📜</span>
          <span className="absolute bottom-24 right-12 text-4xl opacity-[0.14]">🖌️</span>
          <span className="absolute bottom-64 left-10 text-3xl opacity-[0.14]">🐉</span>
        </div>
        )}

        <div
          className="relative max-w-2xl mx-auto"
          style={{
            paddingLeft: "max(1rem, var(--sal))",
            paddingRight: "max(1rem, var(--sar))",
            paddingBottom: `calc(2.5rem + var(--sab) + ${notices.length ? noticeHeight : 0}px)`,
          }}
        >
          {/* In test mode the banner already covers the status bar, so no extra top inset here. */}
          {/* A2 screens have their own top area (home: greeting band; modules: back button + title), so the app title header is not shown there. */}
          {isA2 && !isHome && (
          <div aria-hidden="true" style={{ height: Storage.TEST_MODE ? "1.5rem" : "calc(1.5rem + var(--sat))" }} />
          )}
          {!isA2 && (
          <header className="pb-4" style={{ paddingTop: Storage.TEST_MODE ? "1.5rem" : "calc(1.5rem + var(--sat))" }}>
            <h1 className="text-3xl font-serif font-black tracking-tight" style={{ color: "#B0342A" }}>🏮 中文學習</h1>
          </header>
          )}

          <main>
            {view === "home" && <Home
                state={state}
                today={today}
                onChangeLevel={changeLevel}
                onOpenModule={openModule}
                onOpenBadges={() => setView("badges")}
                onRestore={restoreProgress}
              />}
            {view === "badges" && <BadgesScreen state={state} onBack={goHome} />}
            {view === "poetry" && (
              <PoetryModule
                level={state.level}
                mistakes={state.moduleProgress.poetry.mistakes}
                nav={nav}
                onNavigate={navigate}
                onBack={goHome}
                onRecordPractice={recordPractice("poetry")}
                onAnswerItem={(itemId, isCorrect) => answerItem("poetry", itemId, isCorrect)}
              />
            )}
            {view === "essay" && (
              <EssayModule
                level={state.level}
                mistakes={state.moduleProgress.essay.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("essay")}
                onAnswerItem={(itemId, isCorrect) => answerItem("essay", itemId, isCorrect)}
              />
            )}
            {view === "cangjie" && (
              <CangjieModule onBack={() => setView("home")} onRecordPractice={recordPractice("cangjie")} />
            )}
            {view === "mandarin" && (
              <MandarinModule level={state.level} onBack={() => setView("home")} onRecordPractice={recordPractice("mandarin")} />
            )}
            {view === "idiom" && (
              <IdiomModule
                level={state.level}
                practiceStats={state.moduleProgress.idiom.practiceStats}
                mistakes={state.moduleProgress.idiom.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("idiom")}
                onAnswerItem={(itemId, isCorrect) => answerItem("idiom", itemId, isCorrect)}
              />
            )}
            {view === "history" && (
              <HistoryModule
                level={state.level}
                mistakes={state.moduleProgress.history.mistakes}
                nav={nav}
                onNavigate={navigate}
                onBack={goHome}
                onRecordPractice={recordPractice("history")}
                onAnswerItem={(itemId, isCorrect) => answerItem("history", itemId, isCorrect)}
              />
            )}
            {view === "reading" && (
              <ReadingModule
                level={state.level}
                mistakes={state.moduleProgress.reading.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("reading")}
                onAnswerItem={(itemId, isCorrect) => answerItem("reading", itemId, isCorrect)}
              />
            )}
            {view === "rhetoric" && (
              <RhetoricModule
                level={state.level}
                mistakes={state.moduleProgress.rhetoric.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("rhetoric")}
                onAnswerItem={(itemId, isCorrect) => answerItem("rhetoric", itemId, isCorrect)}
              />
            )}
            {view === "punctuation" && (
              <PunctuationModule
                level={state.level}
                mistakes={state.moduleProgress.punctuation.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("punctuation")}
                onAnswerItem={(itemId, isCorrect) => answerItem("punctuation", itemId, isCorrect)}
              />
            )}
            {view === "classicalProse" && (
              <ClassicalProseModule
                level={state.level}
                mistakes={state.moduleProgress.classicalProse.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPractice("classicalProse")}
                onAnswerItem={(itemId, isCorrect) => answerItem("classicalProse", itemId, isCorrect)}
              />
            )}
          </main>
        </div>
      </div>
      <NoticeStack notices={notices} onDismiss={dismissNotice} onDismissAll={() => setNotices([])} onOpenBadges={openBadgesFromNotice} onHeight={setNoticeHeight} />
      </A2Context.Provider>
    );
  }

  window.App.Root = Root;
})();
