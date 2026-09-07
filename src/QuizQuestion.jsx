// Shared multiple-choice question renderer with immediate feedback.
// `q.prompt` may be a plain string or a JSX element (e.g. a poem block
// with one line blanked out), so it's rendered directly as children.
window.App = window.App || {};

(function () {
  const { useState } = React;

  function isCorrectAnswer(q, selected) {
    return selected !== null && selected === q.correctIndex;
  }

  // `accent` is a MODULE_ACCENTS entry (see theme.jsx) — the calling
  // module's own color family, used for the default (unanswered) option
  // style; correct/wrong feedback always uses the shared FEEDBACK tones
  // (bamboo/vermillion) regardless of module, so "right vs wrong" reads
  // consistently everywhere.
  function QuestionBlock({ q, selected, onSelect, accent }) {
    const { INK, TYPE, FEEDBACK, MODULE_ACCENTS } = window.App.UI;
    const a = accent || MODULE_ACCENTS.essay;
    const correct = isCorrectAnswer(q, selected);
    return (
      <div>
        <div className={`text-xl ${TYPE.heading}`} style={{ color: INK.ink }}>
          {q.prompt}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = isSelected && correct;
            const showWrong = isSelected && !correct;
            const style = showCorrect
              ? { backgroundColor: FEEDBACK.correct.tint, border: `2px solid ${FEEDBACK.correct.solid}`, color: INK.ink }
              : showWrong
              ? { backgroundColor: FEEDBACK.incorrect.tint, border: `2px solid ${FEEDBACK.incorrect.solid}`, color: INK.ink }
              : { backgroundColor: INK.paperCard, border: `1.5px solid ${a.tintBorder}`, color: INK.ink };
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="text-left rounded-xl font-bold text-lg px-4 py-3 transition-all"
                style={style}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <p
            className="mt-3 font-extrabold text-lg"
            style={{ color: correct ? FEEDBACK.correct.solid : FEEDBACK.incorrect.solid }}
          >
            {correct ? "✅ 答對了，做得好！" : `💛 答錯了，正確答案是：${q.options[q.correctIndex]}`}
          </p>
        )}
      </div>
    );
  }

  // Steps through a FIXED array of questions one at a time (immediate
  // feedback via QuestionBlock), ending on a score screen. Used by any
  // module where questions are hand-authored per content item rather than
  // generated at runtime (e.g. History's per-story questions, Reading's
  // per-passage questions) — see CLAUDE.md for which modules work this way.
  // `accent` is a MODULE_ACCENTS entry for the calling module.
  function FixedQuizFlow({ questions, accent, onBack, onFinish, headerLabel }) {
    const { PaperCard, InkButton, INK, TYPE, MODULE_ACCENTS } = window.App.UI;
    const a = accent || MODULE_ACCENTS.essay;
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
        <PaperCard accent={a} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className={`text-xl mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            問答完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: a.solid }}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <InkButton accent={a} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: a.solid }}>
            ← 返回
          </button>
          <span className="text-sm font-bold" style={{ color: INK.mutedInk }}>
            {headerLabel} · 第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <PaperCard accent={a}>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} accent={a} />
          {answered && (
            <InkButton accent={a} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  window.App.QuizQuestion = { QuestionBlock, isCorrectAnswer, FixedQuizFlow };
})();
