// Module 2: 作文金句 (Essay Golden Sentences)
// Three views: list (filter by theme + level) -> detail (sentence, usage,
// theme/level tags) -> practice (mixed quiz: fill-in-the-blank on the key
// phrase, scenario-match, theme classification — all tap-to-select).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS, useScrollToTop } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.essay;
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
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>
          {ESSAY_THEME_EMOJI[item.theme]} {item.theme} — 哪一個詞語/短句才是正確的？
        </p>
        <p className="font-serif text-xl leading-relaxed" style={{ fontWeight: 700 }}>
          {parts[0]}
          <span className="inline-block mx-1 px-3 py-0.5 rounded-lg font-black align-middle" style={{ background: A2.segTrack, color: A2.accD }}>
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
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{item.sentence}」</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這句金句屬於哪一個主題？</p>
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

  function A2SegControl({ options, value, onChange, label }) {
    return (
      <div role="group" aria-label={label} style={{ display: "flex", gap: 6, background: A2.segTrack, padding: 5, borderRadius: 999 }}>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              aria-pressed={active}
              onClick={() => onChange(o.key)}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(active ? { background: A2.segOn, color: "#fff", boxShadow: A2.segOnShadow } : { background: "transparent", color: A2.sub }),
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  function A2Section({ title, children }) {
    return (
      <PaperCard>
        <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>{title}</h3>
        {children}
      </PaperCard>
    );
  }

  function A2Header({ moduleKey, title, onBack }) {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <A2BackButton label="← 返回主頁" onClick={onBack} />
        <div className="flex items-center gap-2">
          <A2ModuleIcon moduleKey={moduleKey} size={44} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0, fontFamily: A2.font }}>{title}</h1>
        </div>
      </div>
    );
  }

  function A2ListRow({ moduleKey, tile, title, serifTitle, sub, onOpen }) {
    const m = MODULE_ICONS[moduleKey];
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 text-left active:translate-y-[2px] transition-all"
        style={{
          minHeight: 72,
          padding: "10px 14px 10px 12px",
          borderRadius: 22,
          background: A2.glass,
          border: `1px solid ${A2.glassBd}`,
          boxShadow: A2.shadow,
          color: A2.ink,
          fontFamily: A2.font,
          cursor: "pointer",
        }}
      >
        <div
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 17, background: m.tint, border: `1px solid ${m.tintBorder}`, fontSize: 24, lineHeight: 1 }}
        >
          {tile}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate${serifTitle ? " font-serif" : ""}`} style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
            {title}
          </p>
          {sub && (
            <p className="truncate" style={{ fontSize: 14, color: A2.sub, margin: 0 }}>
              {sub}
            </p>
          )}
        </div>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 900, color: A2.accD }}>
          ›
        </span>
      </button>
    );
  }

  // 練習錯題 is a secondary action (filter-style chip), not a second primary button.
  function A2ReviewButton({ count, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-full mt-2 transition-all"
        style={{ minHeight: 48, borderRadius: 999, border: 0, background: A2.fireBg, color: A2.fireInk, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
      >
        練習錯題 ({count}) 📝
      </button>
    );
  }

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

  function ListViewA2({ filterTheme, setFilterTheme, filterLevel, setFilterLevel, filtered, mistakeItems, startPractice, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="essay" title="作文金句" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>主題</h2>
          <A2SegControl options={THEME_FILTERS} value={filterTheme} onChange={setFilterTheme} label="主題" />
          <h2 style={{ ...A2_LABEL, margin: "14px 0 8px" }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
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
