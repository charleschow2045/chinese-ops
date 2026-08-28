// Shared multiple-choice question renderer with immediate feedback.
// `q.prompt` may be a plain string or a JSX element (e.g. a poem block
// with one line blanked out), so it's rendered directly as children.
window.App = window.App || {};

(function () {
  const { useState } = React;

  function isCorrectAnswer(q, selected) {
    return selected !== null && selected === q.correctIndex;
  }

  function QuestionBlock({ q, selected, onSelect }) {
    const correct = isCorrectAnswer(q, selected);
    return (
      <div>
        <div className="text-xl font-extrabold text-stone-800">{q.prompt}</div>
        <div className="mt-3 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = isSelected && correct;
            const showWrong = isSelected && !correct;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`text-left rounded-xl border-4 font-bold text-lg px-4 py-3 transition-all
                  ${
                    showCorrect
                      ? "bg-emerald-400 border-emerald-600 text-emerald-950"
                      : showWrong
                      ? "bg-amber-300 border-amber-500 text-amber-950"
                      : "bg-white border-stone-200 text-stone-700"
                  }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <p className={`mt-3 font-extrabold text-lg ${correct ? "text-emerald-600" : "text-amber-600"}`}>
            {correct ? "✅ 答對了，做得好！" : `💛 答錯了，正確答案是：${q.options[q.correctIndex]}`}
          </p>
        )}
      </div>
    );
  }

  // Text-color classes per module color key, written as literal strings
  // (not template-interpolated) so the Tailwind Play CDN's runtime scanner
  // reliably picks them up — see the note on window.App.UI.COLORS for why
  // dynamic `text-${color}-600` class names are avoided throughout this app.
  const LINK_TEXT_CLASS = {
    sky: "text-sky-600",
    rose: "text-rose-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
    amber: "text-amber-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
    fuchsia: "text-fuchsia-600",
  };

  // Steps through a FIXED array of questions one at a time (immediate
  // feedback via QuestionBlock), ending on a score screen. Used by any
  // module where questions are hand-authored per content item rather than
  // generated at runtime (e.g. History's per-story questions, Reading's
  // per-passage questions) — see CLAUDE.md for which modules work this way.
  function FixedQuizFlow({ questions, color, onBack, onFinish, headerLabel }) {
    const { Card, Button } = window.App.UI;
    const linkClass = LINK_TEXT_CLASS[color] || LINK_TEXT_CLASS.sky;
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
      if (isCorrectAnswer(q, i)) setCorrectCount((c) => c + 1);
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
        <Card className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">問答完成！</h2>
          <p className={`text-lg font-bold mb-4 ${linkClass}`}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color={color} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm font-extrabold ${linkClass}`}>
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            {headerLabel} · 第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <Card>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} />
          {answered && (
            <Button color={color} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  window.App.QuizQuestion = { QuestionBlock, isCorrectAnswer, FixedQuizFlow };
})();
