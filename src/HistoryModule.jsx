// Module 6: 中國歷史故事 (standalone) — unlike Modules 1/2/5, comprehension
// questions here are hand-authored per story (fixed, not generated at
// runtime), since each story's facts are unique. Flow: list -> read the
// story -> answer that story's own questions -> completion summary.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Card, Button } = window.App.UI;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { HISTORY_ITEMS, HISTORY_LEVEL_LABEL } = window.App.Content;
  const { AudioButtons } = window.App;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function StoryDetail({ item, onBack, onStartQuestions }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-orange-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            {item.period} · {HISTORY_LEVEL_LABEL[item.level]}
          </span>
        </div>

        <Card>
          <h2 className="text-xl font-extrabold text-stone-800 mb-3">{item.title}</h2>
          <p className="text-stone-700 leading-relaxed">{item.story}</p>
          <AudioButtons text={item.story} color="orange" className="mt-3" />
        </Card>

        <Button color="orange" className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </Button>
      </div>
    );
  }

  function StoryListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-orange-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-orange-50">🏯</div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.title}</p>
          <p className="text-xs font-bold text-stone-400">
            {item.period} · {HISTORY_LEVEL_LABEL[item.level]}
          </p>
        </div>
      </button>
    );
  }

  function HistoryModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | story | questions
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const filtered = HISTORY_ITEMS.filter(
      (it) =>
        (filterLevel === "all" || it.level === filterLevel) && (!onlyMistakes || (mistakes || []).includes(it.id))
    );
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
          color="orange"
          headerLabel={selectedItem.title}
          onBack={() => setView("story")}
          onFinish={finishQuestions}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-orange-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">中國歷史故事</span>
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
                    ? "bg-orange-400 border-orange-600 text-orange-950"
                    : "bg-white border-orange-100 text-orange-300"
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
            <StoryListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.HistoryModule = HistoryModule;
})();
