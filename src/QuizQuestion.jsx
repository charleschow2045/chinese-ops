// Shared multiple-choice question renderer with immediate feedback.
// `q.prompt` may be a plain string or a JSX element (e.g. a poem block
// with one line blanked out), so it's rendered directly as children.
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;

  function isCorrectAnswer(q, selected) {
    return selected !== null && selected === q.correctIndex;
  }

  // A2 look: row-coloured options (>= 48 px high), A2.ok / A2.hot feedback. `accent` (a MODULE_ACCENTS entry)
  // is still accepted because every caller passes it, but the A2 look does not use it.
  function QuestionBlock({ q, selected, onSelect }) {
    const { A2 } = window.App.UI;
    const correct = isCorrectAnswer(q, selected);
    return (
      <div style={{ fontFamily: A2.font }}>
        <div className="text-xl" style={{ color: A2.ink, fontWeight: 900, lineHeight: 1.5 }}>
          {q.prompt}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = isSelected && correct;
            const showWrong = isSelected && !correct;
            const style = showCorrect
              ? { background: A2.rowDone, border: `2px solid ${A2.ok}`, color: A2.ink }
              : showWrong
              ? { background: A2.todayBg, border: `2px solid ${A2.hot}`, color: A2.ink }
              : { background: A2.row, border: `1.5px solid ${A2.rowBd}`, color: A2.ink };
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="text-left rounded-2xl font-bold text-lg px-4 py-3 transition-all"
                style={{ minHeight: 48, fontFamily: A2.font, cursor: "pointer", ...style }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <p className="mt-3 font-extrabold text-lg" style={{ color: correct ? A2.ok : A2.hotInk }}>
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
  // Options are shuffled once per attempt (correctIndex remapped): the hand-authored
  // fixed-question content historically put most correct answers in slot 0.
  function shuffledCopy(q) {
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return { ...q, options: order.map((o) => q.options[o]), correctIndex: order.indexOf(q.correctIndex) };
  }

  function FixedQuizFlow({ questions: rawQuestions, accent, onBack, onFinish, headerLabel }) {
    const questions = useMemo(() => rawQuestions.map(shuffledCopy), [rawQuestions]);
    const { PaperCard, InkButton, A2, A2BackButton } = window.App.UI;
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
        <PaperCard accent={accent} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl mb-1" style={{ color: A2.ink, fontWeight: 900 }}>
            問答完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: A2.accD }}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <InkButton accent={accent} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
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
            {headerLabel} · 第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <PaperCard accent={accent}>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} accent={accent} />
          {answered && (
            <InkButton accent={accent} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  window.App.QuizQuestion = { QuestionBlock, isCorrectAnswer, FixedQuizFlow };
})();
