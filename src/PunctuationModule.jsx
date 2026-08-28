// Module 9: 標點符號練習 — list (10 marks) -> detail (usage, examples) ->
// practice (mixed quiz, generated at runtime from PUNCTUATION_PRACTICE_ITEMS,
// same "generated at runtime" pattern as Modules 1/2/5/8). Two question
// mechanics dispatch on item.kind — see content file header for why.
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { Card, Button } = window.App.UI;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { PUNCTUATION_MARKS, PUNCTUATION_PRACTICE_ITEMS, PUNCTUATION_LEVEL_LABEL } = window.App.Content;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  const FILL_ITEMS = PUNCTUATION_PRACTICE_ITEMS.filter((it) => it.kind === "fill");

  function buildFillQuestion(item) {
    // Distractor marks are sampled globally (not level-filtered) — a
    // single-char mark is a single-char mark regardless of which sentence
    // it's being tested against, so this never runs short on options.
    const distractors = sampleOthers(FILL_ITEMS, item, 3, (it) => it.markChar);
    const options = shuffle([item.markChar, ...distractors]);
    const prompt = (
      <div>
        <p className="text-xs font-extrabold text-stone-400 mb-2">這個空格應該填上什麼標點符號？</p>
        <p className="text-xl leading-relaxed">
          {item.before}
          <span className="inline-block mx-1 px-3 py-0.5 rounded-lg bg-fuchsia-100 text-fuchsia-500 font-black align-middle">
            ▁
          </span>
          {item.after}
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.markChar) };
  }

  function buildIdentifyQuestion(item) {
    // Name distractors are sampled from the full 10-mark reference list —
    // always available regardless of level filter, and keeps "identify the
    // mark" from being scoped to whatever's in the (possibly small) pool.
    const distractors = sampleOthers(PUNCTUATION_MARKS, { id: item.id, name: item.markName }, 3, (it) => it.name);
    const options = shuffle([item.markName, ...distractors]);
    const parts = item.sentence.split(item.highlightedMark);
    const prompt = (
      <div>
        <p className="text-xl leading-relaxed mb-2">
          {parts[0]}
          <span className="text-fuchsia-500 font-black">{item.highlightedMark}</span>
          {parts[1]}
        </p>
        <p className="text-sm text-stone-500">這個標點符號的名稱是什麼？</p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.markName) };
  }

  // `chooseFrom` (see RhetoricModule for the same pattern) restricts which
  // items 練習錯題 asks about; distractors here always draw from the
  // module-level FILL_ITEMS/PUNCTUATION_MARKS constants regardless, so
  // there's no separate distractor-pool argument to thread through.
  function buildQuestions(pool, count, chooseFrom) {
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item) => (item.kind === "fill" ? buildFillQuestion(item) : buildIdentifyQuestion(item)));
  }

  function MarkDetail({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-fuchsia-600">
            ← 返回
          </button>
        </div>

        <Card>
          <p className="text-4xl font-extrabold text-stone-800 text-center mb-1">{item.mark}</p>
          <p className="text-lg font-extrabold text-stone-700 text-center">{item.name}</p>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">用法</p>
          <p className="text-stone-700 leading-relaxed">{item.usage}</p>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">例句</p>
          <div className="flex flex-col gap-2">
            {item.examples.map((ex, i) => (
              <p key={i} className="rounded-xl bg-fuchsia-50 border-4 border-fuchsia-100 p-3 text-stone-700">
                {ex}
              </p>
            ))}
          </div>
        </Card>

        <Button color="fuchsia" className="w-full" onClick={onPractice}>
          開始練習 🎯
        </Button>
      </div>
    );
  }

  function PracticeSession({ pool, chooseFrom, onBack, onFinish, onAnswerItem }) {
    const QUESTION_COUNT = 8;
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
      if (isLast) setDone(true);
      else {
        setQIndex((x) => x + 1);
        setSelected(null);
      }
    }

    if (done) {
      return (
        <Card className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">練習完成！</h2>
          <p className="text-lg font-bold text-fuchsia-600 mb-4">
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color="fuchsia" className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-fuchsia-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <Card>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} />
          {answered && (
            <Button color="fuchsia" className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  function MarkListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-fuchsia-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-fuchsia-50">{item.mark}</div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.name}</p>
          <p className="text-xs font-bold text-stone-400 truncate">{item.usage}</p>
        </div>
      </button>
    );
  }

  function PunctuationModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);

    const filteredPractice = useMemo(
      () =>
        filterLevel === "all"
          ? PUNCTUATION_PRACTICE_ITEMS
          : PUNCTUATION_PRACTICE_ITEMS.filter((it) => it.level === filterLevel),
      [filterLevel]
    );

    const mistakeItems = useMemo(
      () => PUNCTUATION_PRACTICE_ITEMS.filter((it) => (mistakes || []).includes(it.id)),
      [mistakes]
    );

    const selectedItem = PUNCTUATION_MARKS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : PUNCTUATION_PRACTICE_ITEMS);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      return (
        <MarkDetail item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filteredPractice)} />
      );
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
          <button onClick={onBack} className="text-sm font-extrabold text-fuchsia-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">標點符號</span>
        </div>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">程度（影響練習例句）</p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l.key}
                onClick={() => setFilterLevel(l.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterLevel === l.key
                    ? "bg-fuchsia-400 border-fuchsia-600 text-fuchsia-950"
                    : "bg-white border-fuchsia-100 text-fuchsia-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button color="fuchsia" className="w-full mt-3" onClick={() => startPractice(filteredPractice)}>
            開始練習 🎯
          </Button>
          {mistakeItems.length > 0 && (
            <Button
              color="amber"
              className="w-full mt-2"
              onClick={() => startPractice(PUNCTUATION_PRACTICE_ITEMS, mistakeItems)}
            >
              練習錯題 ({mistakeItems.length}) 📝
            </Button>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          {PUNCTUATION_MARKS.map((item) => (
            <MarkListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.PunctuationModule = PunctuationModule;
})();
