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
  const { Card, Button } = window.App.UI;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { CLASSICAL_PROSE_ITEMS, CLASSICAL_PROSE_LEVEL_LABEL } = window.App.Content;
  const { AudioButtons } = window.App;

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
          <button onClick={onBack} className="text-sm font-extrabold text-lime-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            {item.source} · {CLASSICAL_PROSE_LEVEL_LABEL[item.level]}
          </span>
        </div>

        <Card>
          <h2 className="text-xl font-extrabold text-stone-800">{item.title}</h2>
          <p className="text-sm font-bold text-stone-400 mb-3">{item.dynasty}</p>
          <div className="text-lg leading-loose text-stone-800 font-medium">
            {item.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <AudioButtons text={item.lines.join("")} color="lime" className="mt-3" />
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">重點文言字詞</p>
          <div className="flex flex-col gap-2">
            {item.glossary.map((g, i) => (
              <p key={i} className="text-sm text-stone-700">
                <span className="font-extrabold text-lime-600">{g.term}</span>
                {g.jyutping && <span className="text-lime-600 font-bold"> （粵音：{g.jyutping}）</span>}
                {" — "}
                {g.meaning}
              </p>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">白話語譯（逐句對照）</p>
          <div className="flex flex-col gap-2">
            {item.lineExplanations.map((exp, i) => (
              <div key={i} className="rounded-xl bg-lime-50 border-4 border-lime-100 p-3">
                <p className="text-sm font-bold text-stone-700 mb-1">{item.lines[i]}</p>
                <p className="text-sm text-stone-600">{exp}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">出處及背景</p>
          <p className="text-stone-700 leading-relaxed">{item.background}</p>
        </Card>

        <Button color="lime" className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </Button>
      </div>
    );
  }

  function PassageListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-lime-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-lime-50">📜</div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.title}</p>
          <p className="text-xs font-bold text-stone-400 truncate">
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
          <button onClick={onBack} className="text-sm font-extrabold text-lime-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">文言文選讀</span>
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
                    ? "bg-lime-400 border-lime-600 text-lime-950"
                    : "bg-white border-lime-100 text-lime-500"
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

  window.App.ClassicalProseModule = ClassicalProseModule;
})();
