// Module 7: 閱讀理解 — same flow shape as History (Module 6): list -> read
// the passage -> answer that passage's own fixed questions -> summary.
// "Short answer" from the spec is implemented as inference-flavoured
// multiple-choice (see content file header) rather than free-text typing,
// since this is one of the selection-based-input modules.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.reading;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { READING_ITEMS, READING_LEVEL_LABEL } = window.App.Content;

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
            {READING_LEVEL_LABEL[item.level]}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <h2 className={`text-xl mb-3 ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </h2>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.passage}
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
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: ACCENT.tint }}
        >
          📖
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </p>
          <p className={`text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {READING_LEVEL_LABEL[item.level]}
          </p>
        </div>
      </button>
    );
  }

  function ReadingModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | passage | questions
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const filtered = READING_ITEMS.filter(
      (it) =>
        (filterLevel === "all" || it.level === filterLevel) && (!onlyMistakes || (mistakes || []).includes(it.id))
    );
    const selectedItem = READING_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("passage");
    }

    // Fixed-per-item modules track mistakes at passage granularity (not
    // per-question) — see HistoryModule for the same pattern.
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
          accent={ACCENT}
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
            閱讀理解
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
                  ? { backgroundColor: REVIEW_ACCENT.solid, color: REVIEW_ACCENT.on }
                  : { backgroundColor: INK.paper, color: REVIEW_ACCENT.dark, border: `1.5px solid ${REVIEW_ACCENT.tintBorder}` }
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

  window.App.ReadingModule = ReadingModule;
})();
