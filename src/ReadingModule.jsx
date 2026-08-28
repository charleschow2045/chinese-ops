// Module 7: 閱讀理解 — same flow shape as History (Module 6): list -> read
// the passage -> answer that passage's own fixed questions -> summary.
// "Short answer" from the spec is implemented as inference-flavoured
// multiple-choice (see content file header) rather than free-text typing,
// since this is one of the selection-based-input modules.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Card, Button } = window.App.UI;
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
          <button onClick={onBack} className="text-sm font-extrabold text-teal-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">{READING_LEVEL_LABEL[item.level]}</span>
        </div>

        <Card>
          <h2 className="text-xl font-extrabold text-stone-800 mb-3">{item.title}</h2>
          <p className="text-stone-700 leading-relaxed">{item.passage}</p>
        </Card>

        <Button color="teal" className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </Button>
      </div>
    );
  }

  function PassageListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-teal-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-teal-50">📖</div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.title}</p>
          <p className="text-xs font-bold text-stone-400">{READING_LEVEL_LABEL[item.level]}</p>
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
          color="teal"
          headerLabel={selectedItem.title}
          onBack={() => setView("passage")}
          onFinish={finishQuestions}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-teal-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">閱讀理解</span>
        </div>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">程度</p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l.key}
                onClick={() => setFilterLevel(l.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterLevel === l.key
                    ? "bg-teal-400 border-teal-600 text-teal-950"
                    : "bg-white border-teal-100 text-teal-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {(mistakes || []).length > 0 && (
            <button
              onClick={() => setOnlyMistakes((v) => !v)}
              className={`w-full mt-2 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                onlyMistakes
                  ? "bg-amber-400 border-amber-600 text-amber-950"
                  : "bg-white border-amber-200 text-amber-500"
              }`}
            >
              📝 只看錯題 ({mistakes.length})
            </button>
          )}
        </Card>

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
