// Module 6: 中國歷史故事 (standalone) — unlike Modules 1/2/5, comprehension
// questions here are hand-authored per story (fixed, not generated at
// runtime), since each story's facts are unique. Flow: list (tabbed by
// 類別) -> read the story -> answer that story's own questions -> completion
// summary.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.history;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { HISTORY_ITEMS, HISTORY_CATEGORIES } = window.App.Content;
  const { AudioButtons } = window.App;

  // 出處 tag. 史書記載 is a quiet outlined chip; the two non-正史 sources are
  // solid-filled with an icon so a child can tell at a glance it isn't
  // recorded history. `source: null` (mixed/unclear origin) shows nothing.
  const SOURCE_TAGS = {
    史書記載: { icon: "📜", bg: "#E4E9DE", border: "#C9D4BE", color: INK.bamboo, solid: false },
    小說演義: { icon: "🎭", bg: INK.vermillion, border: INK.vermillion, color: INK.paper, solid: true },
    神話傳說: { icon: "✨", bg: INK.ochre, border: INK.ochre, color: INK.paper, solid: true },
  };

  function SourceTag({ source }) {
    const s = SOURCE_TAGS[source];
    if (!s) return null;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-none whitespace-nowrap shrink-0 ${TYPE.heading}`}
        style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
      >
        <span aria-hidden="true">{s.icon}</span>
        {source}
      </span>
    );
  }

  // Chronological order inside a category (sortYear is BCE-negative).
  function byEra(a, b) {
    return (a.sortYear ?? 0) - (b.sortYear ?? 0);
  }

  function StoryDetail({ item, onBack, onStartQuestions }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.period}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h2 className={`text-xl ${TYPE.heading}`} style={{ color: INK.ink }}>
              {item.title}
            </h2>
            <SourceTag source={item.source} />
          </div>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.story}
          </p>
          <AudioButtons text={item.story} accent={ACCENT} className="mt-3" />
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  function StoryListRow({ item, onOpen }) {
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
          🏯
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
              {item.title}
            </p>
            <SourceTag source={item.source} />
          </div>
          <p className={`text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.period}
          </p>
        </div>
      </button>
    );
  }

  function HistoryModule({ mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | story | questions
    // Only categories that actually have stories get a tab (戰爭詩詞 is empty for now).
    const categories = HISTORY_CATEGORIES.filter((c) => HISTORY_ITEMS.some((it) => it.category === c));
    const [category, setCategory] = useState(categories[0]);
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const filtered = HISTORY_ITEMS.filter(
      (it) => it.category === category && (!onlyMistakes || (mistakes || []).includes(it.id))
    ).sort(byEra);
    const selectedItem = HISTORY_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("story");
    }

    // Fixed-per-item modules track mistakes at story granularity (not
    // per-question): a perfect run clears it from the mistake list, any
    // wrong answer flags the whole story for 練習錯題 review.
    function finishQuestions(correctCount, total) {
      onRecordPractice(correctCount, total);
      onAnswerItem(selectedItem.id, correctCount === total);
      setView("list");
    }

    if (view === "story" && selectedItem) {
      return (
        <StoryDetail item={selectedItem} onBack={() => setView("list")} onStartQuestions={() => setView("questions")} />
      );
    }

    if (view === "questions" && selectedItem) {
      return (
        <FixedQuizFlow
          questions={selectedItem.questions}
          accent={ACCENT}
          headerLabel={selectedItem.title}
          onBack={() => setView("story")}
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
            中國歷史故事
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            類別
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const active = category === c;
              const count = HISTORY_ITEMS.filter((it) => it.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl py-2 px-2 text-sm transition-all ${TYPE.heading}`}
                  style={
                    active
                      ? { backgroundColor: ACCENT.solid, color: ACCENT.on }
                      : { backgroundColor: INK.paper, color: INK.mutedInk, border: `1.5px solid ${ACCENT.tintBorder}` }
                  }
                >
                  {c}
                  <span className="ml-1 text-xs opacity-80">（{count}）</span>
                </button>
              );
            })}
          </div>          {(mistakes || []).length > 0 && (
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
          {filtered.length === 0 && (
            <p className={`text-sm text-center py-4 ${TYPE.body}`} style={{ color: INK.mutedInk }}>
              這個類別暫時沒有錯題。
            </p>
          )}
          {filtered.map((item) => (
            <StoryListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.HistoryModule = HistoryModule;
})();
