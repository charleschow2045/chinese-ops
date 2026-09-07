// Module 9: 標點符號練習 — list (10 marks) -> detail (usage, examples) ->
// practice (mixed quiz, generated at runtime from PUNCTUATION_PRACTICE_ITEMS,
// same "generated at runtime" pattern as Modules 1/2/5/8). Two question
// mechanics dispatch on item.kind — see content file header for why.
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.punctuation;
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
        <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          這個空格應該填上什麼標點符號？
        </p>
        <p className="text-xl leading-relaxed">
          {item.before}
          <span
            className="inline-block mx-1 px-3 py-0.5 rounded-lg font-black align-middle"
            style={{ backgroundColor: ACCENT.tint, color: ACCENT.solid }}
          >
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
          <span className="font-black" style={{ color: ACCENT.solid }}>
            {item.highlightedMark}
          </span>
          {parts[1]}
        </p>
        <p className="text-sm" style={{ color: INK.mutedInk }}>
          這個標點符號的名稱是什麼？
        </p>
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
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-4xl text-center mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.mark}
          </p>
          <p className={`text-lg text-center ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            用法
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.usage}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            例句
          </p>
          <div className="flex flex-col gap-2">
            {item.examples.map((ex, i) => (
              <p
                key={i}
                className="rounded-xl p-3"
                style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}`, color: INK.ink }}
              >
                {ex}
              </p>
            ))}
          </div>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
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
        <PaperCard accent={ACCENT} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className={`text-xl mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            練習完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: ACCENT.solid }}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} accent={ACCENT} />
          {answered && (
            <InkButton accent={ACCENT} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  function MarkListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
        style={{
          backgroundColor: INK.paperCard,
          border: `1.5px solid ${ACCENT.tintBorder}`,
          boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 6px 14px -8px rgba(36,31,27,0.14)",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: ACCENT.tint }}
        >
          {item.mark}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </p>
          <p className={`text-xs truncate ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.usage}
          </p>
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
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回主頁
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            標點符號
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            程度（影響練習例句）
          </p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => {
              const active = filterLevel === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => setFilterLevel(l.key)}
                  className={`flex-1 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
                  style={
                    active
                      ? { backgroundColor: ACCENT.solid, color: ACCENT.on }
                      : { backgroundColor: INK.paper, color: INK.mutedInk, border: `1.5px solid ${ACCENT.tintBorder}` }
                  }
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredPractice)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <InkButton
              accent={REVIEW_ACCENT}
              className="w-full mt-2"
              onClick={() => startPractice(PUNCTUATION_PRACTICE_ITEMS, mistakeItems)}
            >
              練習錯題 ({mistakeItems.length}) 📝
            </InkButton>
          )}
        </PaperCard>

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
