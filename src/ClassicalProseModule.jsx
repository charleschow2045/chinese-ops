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
  const { Card, Button, PaperCard, InkButton, Seal, INK, MODULE_ACCENTS, TYPE } = window.App.UI;
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

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function PassageDetail({ item, onBack, onStartQuestions }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.source} · {CLASSICAL_PROSE_LEVEL_LABEL[item.level]}
          </span>
        </div>

        {/* Original-text card: a "scroll" treatment — a warmer inset panel
            with top/bottom rule lines standing in for scroll rollers, plus
            a seal-stamp corner badge citing the source book, and the
            classical text itself set in the serif face to read as more
            literary than the surrounding UI chrome. */}
        <PaperCard accent={ACCENT} className="overflow-visible">
          <Seal label={sourceAbbrev(item.source)} accent={ACCENT} className="absolute -top-3 -right-3 z-10" />
          <h2 className={`text-xl mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </h2>
          <p className={`text-sm mb-3 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.dynasty}
          </p>
          <div
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: ACCENT.tint,
              borderTop: `3px double ${ACCENT.tintBorder}`,
              borderBottom: `3px double ${ACCENT.tintBorder}`,
            }}
          >
            <div className="text-lg leading-loose font-serif" style={{ color: INK.ink }}>
              {item.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          </div>
          <AudioButtons text={item.lines.join("")} color="lime" className="mt-3" />
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            重點文言字詞
          </p>
          <div className="flex flex-col gap-2">
            {item.glossary.map((g, i) => (
              <p key={i} className={`text-sm ${TYPE.body}`} style={{ color: INK.ink }}>
                <span className={TYPE.heading} style={{ color: ACCENT.solid }}>
                  {g.term}
                </span>
                {g.jyutping && (
                  <span className="font-bold" style={{ color: ACCENT.solid }}>
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

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            白話語譯（逐句對照）
          </p>
          <div className="flex flex-col gap-2">
            {item.lineExplanations.map((exp, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
              >
                <p className="text-sm font-serif font-bold mb-1" style={{ color: INK.ink }}>
                  {item.lines[i]}
                </p>
                <p className={`text-sm ${TYPE.body}`} style={{ color: INK.mutedInk }}>
                  {exp}
                </p>
              </div>
            ))}
          </div>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            出處及背景
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.background}
          </p>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  function PassageListRow({ item, onOpen }) {
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
          className="w-11 h-11 rounded-md flex items-center justify-center text-sm font-serif font-black shrink-0"
          style={{ backgroundColor: ACCENT.solid, color: ACCENT.on, transform: "rotate(-4deg)" }}
        >
          {sourceAbbrev(item.source)}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </p>
          <p className={`text-xs truncate ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.source} · {CLASSICAL_PROSE_LEVEL_LABEL[item.level]}
          </p>
        </div>
      </button>
    );
  }

  function ClassicalProseModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | passage | questions
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const filtered = CLASSICAL_PROSE_ITEMS.filter(
      (it) =>
        (filterLevel === "all" || it.level === filterLevel) && (!onlyMistakes || (mistakes || []).includes(it.id))
    );
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
      return (
        <PassageDetail item={selectedItem} onBack={() => setView("list")} onStartQuestions={() => setView("questions")} />
      );
    }

    if (view === "questions" && selectedItem) {
      return (
        <FixedQuizFlow
          questions={selectedItem.questions}
          color="lime"
          headerLabel={selectedItem.title}
          onBack={() => setView("passage")}
          onFinish={finishQuestions}
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
            文言文選讀
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            程度
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
          {(mistakes || []).length > 0 && (
            <button
              onClick={() => setOnlyMistakes((v) => !v)}
              className={`w-full mt-2 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
              style={
                onlyMistakes
                  ? { backgroundColor: INK.ochre, color: INK.ink }
                  : { backgroundColor: INK.paper, color: "#7A5D20", border: "1.5px solid #E2CE9E" }
              }
            >
              📝 只看錯題 ({mistakes.length})
            </button>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <PassageListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.ClassicalProseModule = ClassicalProseModule;
})();
