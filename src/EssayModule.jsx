// Module 2: 作文金句 (Essay Golden Sentences)
// Three views: list (filter by theme + level) -> detail (sentence, usage,
// theme/level tags) -> practice (mixed quiz: fill-in-the-blank on the key
// phrase, scenario-match, theme classification — all tap-to-select).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { Card, Button } = window.App.UI;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { ESSAY_ITEMS, ESSAY_THEMES, ESSAY_THEME_EMOJI, ESSAY_LEVEL_LABEL } = window.App.Content;

  const THEME_FILTERS = [{ key: "all", label: "全部" }, ...ESSAY_THEMES.map((t) => ({ key: t, label: t }))];
  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function buildFillBlankQuestion(pool, item) {
    const parts = item.sentence.split(item.keyPhrase);
    const distractors = sampleOthers(pool, item, 3, (it) => it.keyPhrase);
    const options = shuffle([item.keyPhrase, ...distractors]);
    const prompt = (
      <div>
        <p className="text-xs font-extrabold text-stone-400 mb-2">
          {ESSAY_THEME_EMOJI[item.theme]} {item.theme} — 哪一個詞語/短句才是正確的？
        </p>
        <p className="text-xl leading-relaxed">
          {parts[0]}
          <span className="inline-block mx-1 px-3 py-0.5 rounded-lg bg-amber-100 text-amber-500 font-black align-middle">
            ▁▁▁▁
          </span>
          {parts[1]}
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.keyPhrase) };
  }

  function buildScenarioQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.sentence);
    const options = shuffle([item.sentence, ...distractors]);
    const prompt = `情境：${item.scenario}，以下哪一句金句最適合？`;
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.sentence) };
  }

  function buildThemeQuestion(item) {
    const options = shuffle(ESSAY_THEMES);
    const prompt = (
      <div>
        <p className="text-xl leading-relaxed mb-2">「{item.sentence}」</p>
        <p className="text-sm text-stone-500">這句金句屬於哪一個主題？</p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.theme) };
  }

  // `chooseFrom` restricts which sentences 練習錯題 asks about; `pool`
  // still supplies distractors — same pattern as the other runtime-generated
  // modules (see RhetoricModule for the fullest explanation).
  function buildQuestions(pool, count, chooseFrom) {
    const builders = [buildFillBlankQuestion, buildScenarioQuestion, (p, item) => buildThemeQuestion(item)];
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item, i) => builders[i % builders.length](pool, item));
  }

  function EssayDetail({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-amber-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            {ESSAY_LEVEL_LABEL[item.level]} · {item.theme}
          </span>
        </div>

        <Card>
          <p className="text-2xl leading-relaxed font-extrabold text-stone-800">「{item.sentence}」</p>
          <p className="text-sm font-bold text-amber-500 mt-3">
            {ESSAY_THEME_EMOJI[item.theme]} {item.theme}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">用法</p>
          <p className="text-stone-700 leading-relaxed">{item.usage}</p>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">適用情境</p>
          <p className="text-stone-700 leading-relaxed">{item.scenario}</p>
        </Card>

        <Button color="amber" className="w-full" onClick={onPractice}>
          開始練習 🎯
        </Button>
      </div>
    );
  }

  function PracticeSession({ pool, chooseFrom, onBack, onFinish, onAnswerItem }) {
    const QUESTION_COUNT = 16; // doubled per user feedback ("double up the question")
    const [questions] = useState(() => buildQuestions(pool, QUESTION_COUNT, chooseFrom));
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const q = questions[qIndex];
    const answered = selected !== null;
    const isLast = qIndex === questions.length - 1;

    function selectOption(i) {
      if (answered) return;
      setSelected(i);
      const correct = i === q.correctIndex;
      if (correct) setCorrectCount((c) => c + 1);
      onAnswerItem(q.itemId, correct);
    }

    function handleNext() {
      if (isLast) {
        setDone(true);
      } else {
        setQIndex((x) => x + 1);
        setSelected(null);
      }
    }

    if (done) {
      return (
        <Card className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">練習完成！</h2>
          <p className="text-lg font-bold text-amber-600 mb-4">
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color="amber" className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-amber-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <Card>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} />
          {answered && (
            <Button color="amber" className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  function EssayListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-amber-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-amber-50">
          {ESSAY_THEME_EMOJI[item.theme]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.sentence}</p>
          <p className="text-xs font-bold text-stone-400">
            {item.theme} · {ESSAY_LEVEL_LABEL[item.level]}
          </p>
        </div>
      </button>
    );
  }

  function EssayModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterTheme, setFilterTheme] = useState("all");
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);

    const filtered = useMemo(
      () =>
        ESSAY_ITEMS.filter(
          (it) => (filterTheme === "all" || it.theme === filterTheme) && (filterLevel === "all" || it.level === filterLevel)
        ),
      [filterTheme, filterLevel]
    );

    const mistakeItems = useMemo(() => ESSAY_ITEMS.filter((it) => (mistakes || []).includes(it.id)), [mistakes]);

    const selectedItem = ESSAY_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : ESSAY_ITEMS);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      return <EssayDetail item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filtered)} />;
    }

    if (view === "practice" && practiceScope) {
      return (
        <PracticeSession
          pool={practiceScope}
          chooseFrom={reviewScope}
          onBack={() => setView("list")}
          onFinish={finishPractice}
          onAnswerItem={onAnswerItem}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-amber-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">作文金句</span>
        </div>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">主題</p>
          <div className="flex gap-2 mb-3">
            {THEME_FILTERS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterTheme(t.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterTheme === t.key
                    ? "bg-amber-400 border-amber-600 text-amber-950"
                    : "bg-white border-amber-100 text-amber-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-sm font-extrabold text-stone-400 mb-2">程度</p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l.key}
                onClick={() => setFilterLevel(l.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterLevel === l.key
                    ? "bg-amber-400 border-amber-600 text-amber-950"
                    : "bg-white border-amber-100 text-amber-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button color="amber" className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始隨機練習 🎲
          </Button>
          {mistakeItems.length > 0 && (
            <Button color="orange" className="w-full mt-2" onClick={() => startPractice(ESSAY_ITEMS, mistakeItems)}>
              練習錯題 ({mistakeItems.length}) 📝
            </Button>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <EssayListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.EssayModule = EssayModule;
})();
