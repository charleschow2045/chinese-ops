// Module 10: 文言文選讀 (Classical Chinese Reading) — standalone, distinct
// from Module 1's 詩詞學習 (poems + a handful of prose excerpts inside a
// generated MC-quiz flow) and Module 6's 中國歷史故事 (vernacular-retold
// stories, no original classical text). Structure mirrors HistoryModule.jsx
// (list -> passage detail -> fixed questions -> back to list), since each
// passage's comprehension questions are hand-authored per item, not
// generated at runtime. The detail view additionally renders a 重點文言字詞
// glossary card and a line-by-line vernacular translation card, styled after
// the 文言文 prose entries in PoetryModule.jsx/poetryContent.jsx.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, Seal, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon, useScrollToTop, A2SegControl, LEVEL_FILTERS, A2LevelNotice } = window.App.UI;
  const { itemsForLevel } = window.App.QuizUtils;
  const ACCENT = MODULE_ACCENTS.classicalProse;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { CLASSICAL_PROSE_ITEMS, CLASSICAL_PROSE_LEVEL_LABEL } = window.App.Content;
  const { AudioButtons } = window.App;

  // First two characters of `source`'s book title (skipping the leading
  // 《) — used as the seal-stamp abbreviation on the passage detail card,
  // e.g. "《韓非子．五蠹》" → "韓非".
  function sourceAbbrev(source) {
    return (source || "").replace(/[《》]/g, "").slice(0, 2);
  }

  // ---------------------------------------------------------------------
  // A2 screens. UI text uses A2.font; the classical 原文 lines stay in the serif face. Text >= 13 px (mostly 14-18),
  // every pressable >= 44 px, back buttons are A2BackButton.
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };

  function PassageDetailA2({ item, onBack, onStartQuestions }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>
            {item.source} · {CLASSICAL_PROSE_LEVEL_LABEL[item.level]}
          </span>
        </div>

        <PaperCard className="overflow-visible">
          <Seal label={sourceAbbrev(item.source)} className="absolute -top-3 -right-3 z-10" />
          <h2 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: "0 0 2px", lineHeight: 1.3 }}>{item.title}</h2>
          <p style={{ fontSize: 14, fontWeight: 700, color: A2.sub, margin: "0 0 12px" }}>{item.dynasty}</p>
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: A2.row, borderTop: `3px double ${A2.cloud}`, borderBottom: `3px double ${A2.cloud}` }}
          >
            <div className="text-lg leading-loose font-serif" style={{ color: A2.ink }}>
              {item.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          </div>
          <AudioButtons text={item.lines.join("")} accent={ACCENT} className="mt-3" />
        </PaperCard>

        <PaperCard>
          <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>重點文言字詞</h3>
          <div className="flex flex-col gap-2">
            {item.glossary.map((g, i) => (
              <p key={i} style={{ fontSize: 15, color: A2.ink, margin: 0, lineHeight: 1.6 }}>
                <span className="font-serif font-bold" style={{ color: A2.accD }}>
                  {g.term}
                </span>
                {g.jyutping && (
                  <span style={{ fontWeight: 700, color: A2.accD }}>
                    {" "}
                    （粵音：{g.jyutping}）
                  </span>
                )}
                {" — "}
                {g.meaning}
              </p>
            ))}
          </div>
        </PaperCard>

        <PaperCard>
          <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>白話語譯（逐句對照）</h3>
          <div className="flex flex-col gap-2">
            {item.lineExplanations.map((exp, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                <p className="font-serif font-bold" style={{ fontSize: 15, color: A2.ink, margin: "0 0 4px" }}>
                  {item.lines[i]}
                </p>
                <p style={{ fontSize: 15, color: A2.sub, margin: 0, lineHeight: 1.6 }}>{exp}</p>
              </div>
            ))}
          </div>
        </PaperCard>

        <PaperCard>
          <h3 style={{ ...A2_LABEL, marginBottom: 4 }}>出處及背景</h3>
          <p style={{ fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 }}>{item.background}</p>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  function PassageListRowA2({ item, onOpen }) {
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
          className="w-11 h-11 flex items-center justify-center font-serif font-black shrink-0"
          style={{ background: A2.sealBg, color: A2.sealInk, borderRadius: 8, fontSize: 14, transform: "rotate(-4deg)" }}
        >
          {sourceAbbrev(item.source)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate" style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
            {item.title}
          </p>
          <p className="truncate" style={{ fontSize: 14, color: A2.sub, margin: 0 }}>
            {item.source} · {CLASSICAL_PROSE_LEVEL_LABEL[item.level]}
          </p>
        </div>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 900, color: A2.accD }}>
          ›
        </span>
      </button>
    );
  }

  function ListViewA2({ levelEmpty, filtered, filterLevel, setFilterLevel, mistakes, onlyMistakes, setOnlyMistakes, onBack, openItem }) {
    const mistakeCount = (mistakes || []).length;
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回主頁" onClick={onBack} />
          <div className="flex items-center gap-2">
            <A2ModuleIcon moduleKey="classicalProse" size={44} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0 }}>文言文選讀</h1>
          </div>
        </div>

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          {levelEmpty && <A2LevelNotice level={filterLevel} />}
          {mistakeCount > 0 && (
            <button
              aria-pressed={onlyMistakes}
              onClick={() => setOnlyMistakes((v) => !v)}
              className="w-full mt-2 transition-all"
              style={{
                minHeight: 48,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(onlyMistakes ? { background: A2.fireInk, color: "#fff" } : { background: A2.fireBg, color: A2.fireInk }),
              }}
            >
              📝 只看錯題 ({mistakeCount})
            </button>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <PassageListRowA2 key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  function ClassicalProseModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | passage | questions
    useScrollToTop(view);
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // 階段 10: a level with no text at all (中二 for now) shows every level instead, with a one-line note
    const levelView = itemsForLevel(CLASSICAL_PROSE_ITEMS, filterLevel);
    const filtered = levelView.items.filter((it) => !onlyMistakes || (mistakes || []).includes(it.id));
    const selectedItem = CLASSICAL_PROSE_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("passage");
    }

    // Same mistake-tracking granularity as HistoryModule: per-passage, not
    // per-question — a perfect run clears it, any wrong answer flags the
    // whole passage for 練習錯題 review.
    function finishQuestions(correctCount, total) {
      onRecordPractice(correctCount, total);
      onAnswerItem(selectedItem.id, correctCount === total);
      setView("list");
    }

    if (view === "passage" && selectedItem) {
      return <PassageDetailA2 item={selectedItem} onBack={() => setView("list")} onStartQuestions={() => setView("questions")} />;
    }

    if (view === "questions" && selectedItem) {
      return (
        <FixedQuizFlow
          questions={selectedItem.questions}
          accent={ACCENT}
          headerLabel={selectedItem.title}
          onBack={() => setView("passage")}
          onFinish={finishQuestions}
        />
      );
    }

    return (
      <ListViewA2
        levelEmpty={levelView.empty}
        filtered={filtered}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        mistakes={mistakes}
        onlyMistakes={onlyMistakes}
        setOnlyMistakes={setOnlyMistakes}
        onBack={onBack}
        openItem={openItem}
      />
    );
  }

  window.App.ClassicalProseModule = ClassicalProseModule;
})();
