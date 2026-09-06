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
  } = window.App;

  function Root() {
    const [state, setState] = useState(() => Storage.loadState());
    const [view, setView] = useState("home");

    useEffect(() => {
      Storage.saveState(state);
    }, [state]);

    function changeLevel(level) {
      setState((s) => ({ ...s, level }));
    }

    function openModule(key) {
      setView(key);
    }

    function recordPoetryPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "poetry", correctCount, total));
    }

    function recordEssayPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "essay", correctCount, total));
    }

    function recordCangjiePractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "cangjie", correctCount, total));
    }

    function recordMandarinPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "mandarin", correctCount, total));
    }

    function recordIdiomPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "idiom", correctCount, total));
    }

    function recordHistoryPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "history", correctCount, total));
    }

    function recordReadingPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "reading", correctCount, total));
    }

    function recordRhetoricPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "rhetoric", correctCount, total));
    }

    function recordPunctuationPractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "punctuation", correctCount, total));
    }

    function recordClassicalProsePractice(correctCount, total) {
      setState((s) => Storage.recordPracticeResult(s, "classicalProse", correctCount, total));
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

        <div className="relative px-4 pb-10">
          <header className="pt-6 pb-4">
            <h1 className="text-3xl font-serif font-black tracking-tight" style={{ color: "#B0342A" }}>🏮 中文學習</h1>
          </header>

          <main>
            {view === "home" && <Home state={state} onChangeLevel={changeLevel} onOpenModule={openModule} />}
            {view === "poetry" && (
              <PoetryModule
                level={state.level}
                mistakes={state.moduleProgress.poetry.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPoetryPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("poetry", itemId, isCorrect)}
              />
            )}
            {view === "essay" && (
              <EssayModule
                level={state.level}
                mistakes={state.moduleProgress.essay.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordEssayPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("essay", itemId, isCorrect)}
              />
            )}
            {view === "cangjie" && (
              <CangjieModule onBack={() => setView("home")} onRecordPractice={recordCangjiePractice} />
            )}
            {view === "mandarin" && (
              <MandarinModule level={state.level} onBack={() => setView("home")} onRecordPractice={recordMandarinPractice} />
            )}
            {view === "idiom" && (
              <IdiomModule
                level={state.level}
                practiceStats={state.moduleProgress.idiom.practiceStats}
                mistakes={state.moduleProgress.idiom.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordIdiomPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("idiom", itemId, isCorrect)}
              />
            )}
            {view === "history" && (
              <HistoryModule
                level={state.level}
                mistakes={state.moduleProgress.history.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordHistoryPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("history", itemId, isCorrect)}
              />
            )}
            {view === "reading" && (
              <ReadingModule
                level={state.level}
                mistakes={state.moduleProgress.reading.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordReadingPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("reading", itemId, isCorrect)}
              />
            )}
            {view === "rhetoric" && (
              <RhetoricModule
                level={state.level}
                mistakes={state.moduleProgress.rhetoric.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordRhetoricPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("rhetoric", itemId, isCorrect)}
              />
            )}
            {view === "punctuation" && (
              <PunctuationModule
                level={state.level}
                mistakes={state.moduleProgress.punctuation.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordPunctuationPractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("punctuation", itemId, isCorrect)}
              />
            )}
            {view === "classicalProse" && (
              <ClassicalProseModule
                level={state.level}
                mistakes={state.moduleProgress.classicalProse.mistakes}
                onBack={() => setView("home")}
                onRecordPractice={recordClassicalProsePractice}
                onAnswerItem={(itemId, isCorrect) => answerItem("classicalProse", itemId, isCorrect)}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  window.App.Root = Root;
})();
