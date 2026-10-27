// Module 2: 作文金句 (Essay Golden Sentences)
// Three views: list (filter by theme + level) -> detail (sentence, usage,
// theme/level tags) -> practice (a 15-question mixed quiz of five kinds — fill-in-the-blank
// on the key phrase, scenario-match, theme classification, usage-match, scenario true/false —
// built by essayQuiz.jsx; all tap-to-select).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, useScrollToTop, A2SegControl, A2Section, A2Header, A2ListRow, A2ReviewButton, LEVEL_FILTERS, A2LevelNotice } = window.App.UI;
  const { itemsForLevel } = window.App.QuizUtils;
  const ACCENT = MODULE_ACCENTS.essay;
  const { QuestionBlock } = window.App.QuizQuestion;
  const EssayQuiz = window.App.EssayQuiz;
  const { ESSAY_ITEMS, ESSAY_THEMES, ESSAY_THEME_EMOJI, ESSAY_LEVEL_LABEL } = window.App.Content;

  const THEME_FILTERS = [{ key: "all", label: "全部" }, ...ESSAY_THEMES.map((t) => ({ key: t, label: t }))];
  // The questions themselves are built by essayQuiz.jsx (plain objects, no screen code); this turns one into what QuestionBlock draws:
  // a small heading, the stem (blanked sentence / the sentence / scenario + sentence) and the question line, depending on the kind.
  const headingStyle = { fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" };
  const askStyle = { fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 };
  function toQuestion(q) {
    let prompt;
    switch (q.kind) {
      case "fill":
        prompt = (
          <div>
            <p style={headingStyle}>
              {ESSAY_THEME_EMOJI[q.theme]} {q.theme} — 哪一個詞語/短句才是正確的？
            </p>
            <p className="font-serif text-xl leading-relaxed" style={{ fontWeight: 700 }}>
              {q.before}
              <span className="inline-block mx-1 px-3 py-0.5 rounded-lg font-black align-middle" style={{ background: A2.segTrack, color: A2.accD }}>
                ▁▁▁▁
              </span>
              {q.after}
            </p>
          </div>
        );
        break;
      case "theme":
        prompt = (
          <div>
            <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{q.sentence}」</p>
            <p style={askStyle}>{q.ask}</p>
          </div>
        );
        break;
      case "usage":
        prompt = (
          <div>
            <p style={headingStyle}>用法配對</p>
            <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{q.sentence}」</p>
            <p style={askStyle}>{q.ask}</p>
          </div>
        );
        break;
      case "scenario-tf":
        prompt = (
          <div>
            <p style={headingStyle}>情境是非</p>
            <p className="text-xl leading-relaxed" style={{ fontWeight: 700, margin: "0 0 4px" }}>情境『{q.scenario}』適合用這句金句：</p>
            <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>『{q.sentence}』{/[。！？]$/.test(q.sentence) ? "" : "。"}</p>
            <p style={askStyle}>{q.ask}</p>
          </div>
        );
        break;
      default:
        // scenario: one plain question line
        prompt = q.ask;
    }
    return { itemId: q.itemId, prompt, options: q.options, correctIndex: q.correctIndex };
  }

  // `chooseFrom` restricts which sentences 練習錯題 asks about; `pool`
  // still supplies distractors — same pattern as the other runtime-generated
  // modules (see RhetoricModule for the fullest explanation).
  function buildQuestions(pool, count, chooseFrom) {
    return EssayQuiz.buildQuestions(pool, count, chooseFrom).map(toQuestion);
  }

  function PracticeSession({ pool, chooseFrom, onBack, onFinish, onAnswerItem }) {
    const [questions] = useState(() => buildQuestions(pool, EssayQuiz.QUESTION_COUNT, chooseFrom));
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

  function EssayDetailA2({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>
            {ESSAY_LEVEL_LABEL[item.level]} · {item.theme}
          </span>
        </div>

        <PaperCard>
          <p className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: A2.ink, margin: 0, lineHeight: 1.6 }}>
            「{item.sentence}」
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: A2.accD, margin: "12px 0 0" }}>
            {ESSAY_THEME_EMOJI[item.theme]} {item.theme}
          </p>
        </PaperCard>

        <A2Section title="用法">
          <p style={A2_BODY}>{item.usage}</p>
        </A2Section>

        <A2Section title="適用情境">
          <p style={A2_BODY}>{item.scenario}</p>
        </A2Section>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function ListViewA2({ levelEmpty, filterTheme, setFilterTheme, filterLevel, setFilterLevel, filtered, mistakeItems, startPractice, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="essay" title="作文金句" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>主題</h2>
          <A2SegControl options={THEME_FILTERS} value={filterTheme} onChange={setFilterTheme} label="主題" />
          <h2 style={{ ...A2_LABEL, margin: "14px 0 8px" }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          {levelEmpty && <A2LevelNotice level={filterLevel} />}
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始隨機練習 🎲
          </InkButton>
          {mistakeItems.length > 0 && <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(ESSAY_ITEMS, mistakeItems)} />}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <A2ListRow
              key={item.id}
              moduleKey="essay"
              tile={ESSAY_THEME_EMOJI[item.theme]}
              title={item.sentence}
              serifTitle
              sub={`${item.theme} · ${ESSAY_LEVEL_LABEL[item.level]}`}
              onOpen={() => openItem(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function EssayModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    useScrollToTop(view);
    const [filterTheme, setFilterTheme] = useState("all");
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);

    // 階段 10: a level with no sentence at all (中二 for now) shows every level instead, with a one-line note
    const levelView = useMemo(() => itemsForLevel(ESSAY_ITEMS, filterLevel), [filterLevel]);
    const filtered = useMemo(
      () => levelView.items.filter((it) => filterTheme === "all" || it.theme === filterTheme),
      [levelView, filterTheme]
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
      return <EssayDetailA2 item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filtered)} />;
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
        levelEmpty={levelView.empty}
        filterTheme={filterTheme}
        setFilterTheme={setFilterTheme}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filtered={filtered}
        mistakeItems={mistakeItems}
        startPractice={startPractice}
        openItem={openItem}
        onBack={onBack}
      />
    );
  }

  window.App.EssayModule = EssayModule;
})();
