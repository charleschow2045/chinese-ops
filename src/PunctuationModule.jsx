// Module 9: 標點符號練習 — list (10 marks) -> detail (usage, examples) ->
// practice (mixed quiz, generated at runtime from PUNCTUATION_PRACTICE_ITEMS,
// same "generated at runtime" pattern as Modules 1/2/5/8). Two question
// mechanics dispatch on item.kind — see content file header for why.
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, useScrollToTop, A2SegControl, A2Section, A2Header, A2ListRow, A2ReviewButton } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.punctuation;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { PUNCTUATION_MARKS, PUNCTUATION_PRACTICE_ITEMS } = window.App.Content;

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
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>這個空格應該填上什麼標點符號？</p>
        <p className="font-serif text-xl leading-relaxed" style={{ fontWeight: 700 }}>
          {item.before}
          <span className="inline-block mx-1 px-3 py-0.5 rounded-lg font-black align-middle" style={{ background: A2.segTrack, color: A2.accD }}>
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
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>
          {parts[0]}
          <span className="font-black" style={{ color: A2.hot }}>
            {item.highlightedMark}
          </span>
          {parts[1]}
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這個標點符號的名稱是什麼？</p>
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

  function MarkDetailA2({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div>
          <A2BackButton label="← 返回" onClick={onBack} />
        </div>

        <PaperCard>
          <p className="font-serif text-center" style={{ fontSize: 44, fontWeight: 900, color: A2.ink, margin: "0 0 4px", lineHeight: 1.2 }}>
            {item.mark}
          </p>
          <p className="text-center" style={{ fontSize: 20, fontWeight: 900, color: A2.ink, margin: 0 }}>
            {item.name}
          </p>
        </PaperCard>

        <A2Section title="用法">
          <p style={A2_BODY}>{item.usage}</p>
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

  function ListViewA2({ filterLevel, setFilterLevel, mistakeItems, startPractice, filteredPractice, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="punctuation" title="標點符號" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度（影響練習例句）</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredPractice)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(PUNCTUATION_PRACTICE_ITEMS, mistakeItems)} />
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {PUNCTUATION_MARKS.map((item) => (
            <A2ListRow
              key={item.id}
              moduleKey="punctuation"
              tile={<span className="font-serif font-black">{item.mark}</span>}
              title={item.name}
              sub={item.usage}
              onOpen={() => openItem(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function PunctuationModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    useScrollToTop(view);
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
      return <MarkDetailA2 item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filteredPractice)} />;
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
        filteredPractice={filteredPractice}
        openItem={openItem}
        onBack={onBack}
      />
    );
  }

  window.App.PunctuationModule = PunctuationModule;
})();
