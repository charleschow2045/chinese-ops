// Module 8: 修辭手法 — list (the 7 devices) -> detail (definition, tip,
// examples) -> practice (mixed quiz, generated at runtime from
// PRACTICE_SENTENCES, same pattern as Modules 1/2/5: "identify the device"
// is naturally multiple-choice, so there's no typing-vs-spec tension here).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, useScrollToTop, A2SegControl, A2Section, A2Header, A2ListRow, A2ReviewButton } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.rhetoric;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { RHETORIC_DEVICES, RHETORIC_PRACTICE_SENTENCES } = window.App.Content;

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
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{item.sentence}」</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這句運用了什麼修辭手法？</p>
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
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{item.sentence}」</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這句運用了「{item.device}」，這樣寫有什麼作用？</p>
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
          <h2 className="text-xl mb-1" style={{ color: A2.ink, fontWeight: 900, fontFamily: A2.font }}>
            練習完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: A2.accD, fontFamily: A2.font }}>
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ color: A2.sub, fontSize: 14, fontWeight: 700, fontFamily: A2.font }}>
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
  // ---------------------------------------------------------------------
  // A2 screens. UI text is A2.font; 原文 / 例句 stay serif; text >= 14 px;
  // every pressable >= 44 px; back buttons are A2BackButton (>= 96 x 48).
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };
  const A2_BODY = { fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 };

  function DeviceDetailA2({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div>
          <A2BackButton label="← 返回" onClick={onBack} />
        </div>

        <PaperCard>
          <h2 className="text-center" style={{ fontSize: 26, fontWeight: 900, color: A2.ink, margin: 0 }}>
            {item.name}
          </h2>
        </PaperCard>

        <A2Section title="定義">
          <p style={A2_BODY}>{item.definition}</p>
        </A2Section>

        <A2Section title="辨認小貼士">
          <p style={A2_BODY}>{item.tip}</p>
        </A2Section>

        <A2Section title="例句">
          <div className="flex flex-col gap-2">
            {item.examples.map((ex, i) => (
              <p key={i} className="font-serif rounded-xl p-3" style={{ ...A2_BODY, background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                {ex}
              </p>
            ))}
          </div>
        </A2Section>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function ListViewA2({ filterLevel, setFilterLevel, mistakeItems, startPractice, filteredSentences, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="rhetoric" title="修辭手法" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度（影響練習例句）</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredSentences)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(RHETORIC_PRACTICE_SENTENCES, mistakeItems)} />
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {RHETORIC_DEVICES.map((item) => (
            <A2ListRow key={item.id} moduleKey="rhetoric" tile="🎭" title={item.name} sub={item.definition} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  function RhetoricModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    useScrollToTop(view);
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
      return <DeviceDetailA2 item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filteredSentences)} />;
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
      <ListViewA2
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        mistakeItems={mistakeItems}
        startPractice={startPractice}
        filteredSentences={filteredSentences}
        openItem={openItem}
        onBack={onBack}
      />
    );
  }

  window.App.RhetoricModule = RhetoricModule;
})();
