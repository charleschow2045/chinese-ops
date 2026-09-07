// Module 8: 修辭手法 — list (the 7 devices) -> detail (definition, tip,
// examples) -> practice (mixed quiz, generated at runtime from
// PRACTICE_SENTENCES, same pattern as Modules 1/2/5: "identify the device"
// is naturally multiple-choice, so there's no typing-vs-spec tension here).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.rhetoric;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { RHETORIC_DEVICES, RHETORIC_PRACTICE_SENTENCES, RHETORIC_LEVEL_LABEL } = window.App.Content;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function buildDeviceQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.device);
    const options = shuffle([item.device, ...distractors]);
    const prompt = (
      <div>
        <p className="text-xl leading-relaxed mb-2">「{item.sentence}」</p>
        <p className="text-sm" style={{ color: INK.mutedInk }}>
          這句運用了什麼修辭手法？
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.device) };
  }

  // Harder second question type (user feedback: "too easy") — instead of
  // just naming the device, asks what *effect* it achieves, testing
  // understanding of why a writer would use it, not just pattern-matching
  // keywords like 像/難道/什麼是.
  function buildEffectQuestion(pool, item) {
    const device = RHETORIC_DEVICES.find((d) => d.name === item.device);
    const otherDevices = RHETORIC_DEVICES.filter((d) => d.name !== item.device);
    const distractors = shuffle(otherDevices)
      .slice(0, 3)
      .map((d) => d.effect);
    const options = shuffle([device.effect, ...distractors]);
    const prompt = (
      <div>
        <p className="text-xl leading-relaxed mb-2">「{item.sentence}」</p>
        <p className="text-sm" style={{ color: INK.mutedInk }}>
          這句運用了「{item.device}」，這樣寫有什麼作用？
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(device.effect) };
  }

  // `chooseFrom` (defaults to `pool`) is the set of items actually asked
  // about — distinct from `pool`, which supplies distractors. This split
  // lets 練習錯題 (mistake review) restrict *which* sentences come up
  // without also shrinking the distractor pool down to just those few
  // items (see RhetoricModule's mistake-review button below).
  function buildQuestions(pool, count, chooseFrom) {
    const builders = [buildDeviceQuestion, buildEffectQuestion];
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item, i) => builders[i % builders.length](pool, item));
  }

  function DeviceDetail({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
        </div>

        <PaperCard accent={ACCENT}>
          <h2 className={`text-2xl text-center ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </h2>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            定義
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.definition}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            辨認小貼士
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.tip}
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

  function DeviceListRow({ item, onOpen }) {
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
          🎭
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </p>
          <p className={`text-xs truncate ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.definition}
          </p>
        </div>
      </button>
    );
  }

  function RhetoricModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);

    const filteredSentences = useMemo(
      () =>
        filterLevel === "all"
          ? RHETORIC_PRACTICE_SENTENCES
          : RHETORIC_PRACTICE_SENTENCES.filter((it) => it.level === filterLevel),
      [filterLevel]
    );

    const mistakeItems = useMemo(
      () => RHETORIC_PRACTICE_SENTENCES.filter((it) => (mistakes || []).includes(it.id)),
      [mistakes]
    );

    const selectedItem = RHETORIC_DEVICES.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : RHETORIC_PRACTICE_SENTENCES);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      return (
        <DeviceDetail item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filteredSentences)} />
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
            修辭手法
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
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredSentences)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <InkButton
              accent={REVIEW_ACCENT}
              className="w-full mt-2"
              onClick={() => startPractice(RHETORIC_PRACTICE_SENTENCES, mistakeItems)}
            >
              練習錯題 ({mistakeItems.length}) 📝
            </InkButton>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {RHETORIC_DEVICES.map((item) => (
            <DeviceListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.RhetoricModule = RhetoricModule;
})();
