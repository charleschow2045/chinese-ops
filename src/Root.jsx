// Top-level app: hub-and-spoke navigation between Home and modules
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
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
  } = window.App;

  function Root() {
    const [state, setState] = useState(() => Storage.loadState());
    const [view, setView] = useState("home");
    // Optional params for a module opened via a cross-module link (e.g. a story
    // opening a poem): { poemId | storyId, from: { module, opts } }.
    const [nav, setNav] = useState(null);

    useEffect(() => {
      Storage.saveState(state);
    }, [state]);

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

    // One handler for all 10 modules: each module calls onRecordPractice once
    // when a practice session finishes. That updates the lifetime practice
    // stats (recordPracticeResult) and the daily missions / streak / session
    // counters (recordSession).
    function recordPractice(moduleKey) {
      return (correctCount, total) => {
        setState((s) => Storage.recordSession(Storage.recordPracticeResult(s, moduleKey, correctCount, total), moduleKey, correctCount, total).state);
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

    return (
      <>
      <TestModeBanner />
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#F7F0E3", color: "#241F1B" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-[0.12] blur-3xl" style={{ backgroundColor: "#B0342A" }} />
          <div className="absolute top-24 -right-20 w-80 h-80 rounded-full opacity-[0.14] blur-3xl" style={{ backgroundColor: "#A9812F" }} />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full opacity-[0.12] blur-3xl" style={{ backgroundColor: "#37485B" }} />
          <span className="absolute top-16 right-8 text-4xl opacity-[0.14]">🏮</span>
          <span className="absolute top-48 left-6 text-3xl opacity-[0.14]">📜</span>
          <span className="absolute bottom-24 right-12 text-4xl opacity-[0.14]">🖌️</span>
          <span className="absolute bottom-64 left-10 text-3xl opacity-[0.14]">🐉</span>
        </div>

        <div className="relative px-4 pb-10 max-w-2xl mx-auto">
          <header className="pt-6 pb-4">
            <h1 className="text-3xl font-serif font-black tracking-tight" style={{ color: "#B0342A" }}>🏮 中文學習</h1>
          </header>

          <main>
            {view === "home" && <Home state={state} today={today} onChangeLevel={changeLevel} onOpenModule={openModule} onRestore={restoreProgress} />}
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
      </>
    );
  }

  window.App.Root = Root;
})();
