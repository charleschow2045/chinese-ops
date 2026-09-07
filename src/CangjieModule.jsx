// Module 3: 倉頡輸入法教學 (standalone) — reference chart (colour-coded root
// table, similar in spirit to 五色學倉頡) + 速成 explainer, then real typing
// drills. This is one of only two modules (the other being Mandarin/pinyin)
// where free typing is appropriate, per the design brief — the child types
// plain keyboard letters (easy), never Chinese characters directly.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, FEEDBACK, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.cangjie;
  const { shuffle } = window.App.QuizUtils;
  const { CANGJIE_CATEGORIES, CANGJIE_ROOTS, CANGJIE_COMPOUND_EXAMPLES, CANGJIE_AUXILIARY_SHAPES, CANGJIE_QUICK_EXAMPLE } =
    window.App.Content;

  // The 5-category root chart keeps its own distinct per-category tones
  // (the "五色學倉頡" mnemonic genuinely relies on 5 different colors to
  // group root keys) — drawn from across the whole ink palette rather than
  // Tailwind, keyed by the same category `color` strings already stored in
  // cangjieContent.jsx so that content file doesn't need to change.
  const CATEGORY_TONES = {
    rose: { solid: INK.vermillion, tint: "#F6E4E1", tintBorder: "#E8C4BE" },
    orange: { solid: "#C1503A", tint: "#F7E6DE", tintBorder: "#EAC7B5" },
    amber: { solid: INK.ochre, tint: "#F1E7CF", tintBorder: "#E2CE9E" },
    emerald: { solid: INK.bamboo, tint: "#E4E9DE", tintBorder: "#C9D4BE" },
    violet: { solid: INK.indigo, tint: "#E4E8EC", tintBorder: "#C3CDD6" },
  };

  // Letter -> root character, derived from CANGJIE_ROOTS (not duplicated
  // data) so the 拆解圖 (decomposition diagram) below always stays in sync
  // with the verified root table.
  const ROOT_CHAR_BY_LETTER = CANGJIE_ROOTS.reduce((acc, r) => {
    acc[r.letter] = r.char;
    return acc;
  }, {});

  function RootChart() {
    return (
      <div className="flex flex-col gap-3">
        {CANGJIE_CATEGORIES.map((cat) => {
          const tone = CATEGORY_TONES[cat.color] || CATEGORY_TONES.amber;
          return (
            <PaperCard key={cat.key} className="!p-3" accent={{ tintBorder: tone.tintBorder }}>
              <p className="text-sm mb-2 font-bold" style={{ color: tone.solid }}>
                {cat.label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CANGJIE_ROOTS.filter((r) => r.category === cat.key).map((r) => (
                  <div
                    key={r.letter}
                    className="rounded-xl p-2 text-center"
                    style={{ backgroundColor: tone.tint, border: `1.5px solid ${tone.tintBorder}`, color: tone.solid }}
                  >
                    <p className="text-xl font-extrabold">{r.char}</p>
                    <p className="text-xs font-bold opacity-70">{r.letter}</p>
                  </div>
                ))}
              </div>
            </PaperCard>
          );
        })}
      </div>
    );
  }

  function AuxiliaryShapes() {
    return (
      <PaperCard accent={ACCENT}>
        <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          常見輔助字形
        </p>
        <p className={`text-sm mb-2 ${TYPE.body}`} style={{ color: INK.mutedInk }}>
          除了基本字根，部分字根還有「輔助字形」——一種較小、常出現在字部件裏面的寫法。以下是幾個最常用的例子：
        </p>
        <div className="flex flex-col gap-2">
          {CANGJIE_AUXILIARY_SHAPES.map((a) => (
            <div
              key={a.rootLetter}
              className="rounded-xl p-3"
              style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
            >
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-extrabold" style={{ color: INK.ink }}>
                  {a.rootChar} ({a.rootLetter})
                </p>
                <span style={{ color: INK.mutedInk }}>→</span>
                <p className="text-xl font-extrabold" style={{ color: ACCENT.solid }}>
                  {a.shape}
                </p>
              </div>
              <p className="text-sm mt-1" style={{ color: INK.mutedInk }}>
                常見於：{a.examples.join("、")}
              </p>
            </div>
          ))}
        </div>
      </PaperCard>
    );
  }

  // 拆解圖 — a visual decomposition diagram: each root tile (character +
  // its key letter) combines left-to-right into the final compound
  // character, instead of only describing the breakdown as plain text.
  function DecompositionDiagram({ code, resultChar }) {
    const letters = code.split("");
    return (
      <div className="flex items-center justify-center flex-wrap gap-1.5 py-1">
        {letters.map((letter, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="font-extrabold text-lg" style={{ color: ACCENT.tintBorder }}>
                +
              </span>
            )}
            <div
              className="rounded-lg px-2 py-1 text-center"
              style={{ backgroundColor: INK.paperCard, border: `1.5px solid ${ACCENT.tintBorder}` }}
            >
              <p className="text-lg font-extrabold leading-tight" style={{ color: INK.ink }}>
                {ROOT_CHAR_BY_LETTER[letter] || "?"}
              </p>
              <p className="text-[10px] font-bold leading-tight" style={{ color: ACCENT.solid }}>
                {letter}
              </p>
            </div>
          </React.Fragment>
        ))}
        <span className="font-extrabold text-lg" style={{ color: ACCENT.tintBorder }}>
          =
        </span>
        <div className="rounded-lg px-3 py-1 text-center" style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.solid}` }}>
          <p className="text-2xl font-extrabold leading-tight" style={{ color: ACCENT.solid }}>
            {resultChar}
          </p>
        </div>
      </div>
    );
  }

  function CompoundExamples() {
    return (
      <PaperCard accent={ACCENT}>
        <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          組字例子（拆解圖）
        </p>
        <div className="flex flex-col gap-2">
          {CANGJIE_COMPOUND_EXAMPLES.map((ex) => (
            <div
              key={ex.char}
              className="rounded-xl p-3"
              style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-2xl font-extrabold" style={{ color: INK.ink }}>
                  {ex.char}
                </p>
                <p className="text-sm font-bold" style={{ color: ACCENT.solid }}>
                  碼：{ex.code}
                </p>
              </div>
              <DecompositionDiagram code={ex.code} resultChar={ex.char} />
              <p className="text-sm mt-1" style={{ color: INK.mutedInk }}>
                {ex.note}
              </p>
            </div>
          ))}
        </div>
      </PaperCard>
    );
  }

  function QuickExplainer() {
    const ex = CANGJIE_QUICK_EXAMPLE;
    return (
      <PaperCard accent={ACCENT}>
        <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          速成輸入法
        </p>
        <p className={`leading-relaxed mb-2 ${TYPE.body}`} style={{ color: INK.ink }}>
          速成是倉頡的簡化版：不需要輸入完整的倉頡碼，只需輸入
          <span className="font-extrabold" style={{ color: ACCENT.solid }}>
            第一碼
          </span>
          和
          <span className="font-extrabold" style={{ color: ACCENT.solid }}>
            最後一碼
          </span>
          即可，最多兩個字母。好處是打字較快，缺點是需要從候選字當中選出正確的字。
        </p>
        <div className="rounded-xl p-3" style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}>
          <p className="font-extrabold" style={{ color: INK.ink }}>
            例子：「{ex.char}」— 完整碼 {ex.fullCode} → 速成碼 {ex.quickCode}
          </p>
          <p className="text-sm mt-1" style={{ color: INK.mutedInk }}>
            {ex.note}
          </p>
        </div>
      </PaperCard>
    );
  }

  function ReferenceView({ onBack, onStartPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回主頁
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            倉頡輸入法
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            倉頡輸入法用 24 個基本「字根」（加上一個特殊的「難」字鍵），對應鍵盤上的英文字母。學會這張表，就可以自己輸入中文
            了！以下按「五色」分類，方便記憶：
          </p>
        </PaperCard>

        <RootChart />
        <AuxiliaryShapes />
        <CompoundExamples />
        <QuickExplainer />

        <InkButton accent={ACCENT} className="w-full" onClick={onStartPractice}>
          開始打字練習 ⌨️
        </InkButton>
      </div>
    );
  }

  function buildQuestions() {
    const phase1 = shuffle(CANGJIE_ROOTS)
      .slice(0, 8)
      .map((r) => ({ phase: 1, kind: "letter", root: r, answer: r.letter }));
    const phase2 = shuffle(CANGJIE_COMPOUND_EXAMPLES)
      .slice(0, 8)
      .map((e) => ({ phase: 2, kind: "code", example: e, answer: e.code }));
    return [...phase1, ...phase2];
  }

  function PracticeSession({ onBack, onFinish }) {
    const [questions] = useState(buildQuestions);
    const [qIndex, setQIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const q = questions[qIndex];
    const isLast = qIndex === questions.length - 1;
    const phaseChanged = qIndex > 0 && questions[qIndex - 1].phase !== q.phase;

    function handleCheck() {
      if (checked || inputValue.trim().length === 0) return;
      const correct = inputValue.trim().toUpperCase() === q.answer;
      setIsCorrect(correct);
      setChecked(true);
      if (correct) setCorrectCount((c) => c + 1);
    }

    function handleNext() {
      if (isLast) {
        setDone(true);
      } else {
        setQIndex((x) => x + 1);
        setInputValue("");
        setChecked(false);
      }
    }

    if (done) {
      return (
        <PaperCard accent={ACCENT} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className={`text-xl mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            練習完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: ACCENT.solid }}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        {(qIndex === 0 || phaseChanged) && (
          <PaperCard className="!p-3" accent={ACCENT} style={{ backgroundColor: ACCENT.tint }}>
            <p className="text-sm font-extrabold" style={{ color: ACCENT.dark }}>
              {q.phase === 1 ? "第一部分：字母配對 — 根據字根，輸入正確的字母" : "第二部分：砌字練習 — 輸入整個字的倉頡碼"}
            </p>
          </PaperCard>
        )}

        <PaperCard accent={ACCENT}>
          {q.kind === "letter" ? (
            <div className="text-center">
              <p className="text-6xl font-extrabold mb-1" style={{ color: INK.ink }}>
                {q.root.char}
              </p>
              <p className="text-sm font-bold mb-4" style={{ color: INK.mutedInk }}>
                （{q.root.meaning}）這個字根用哪一個字母輸入？
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-6xl font-extrabold mb-1" style={{ color: INK.ink }}>
                {q.example.char}
              </p>
              <p className="text-sm font-bold mb-4" style={{ color: INK.mutedInk }}>
                輸入「{q.example.char}」的倉頡碼（{q.example.breakdown}）
              </p>
            </div>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={checked}
            autoCapitalize="characters"
            placeholder={q.kind === "letter" ? "打字母" : "打倉頡碼"}
            className={`w-full text-center text-2xl tracking-widest uppercase rounded-xl font-extrabold px-4 py-3 outline-none focus:border-[${ACCENT.solid}] disabled:opacity-60`}
            style={{ border: "1.5px solid #E9DFC7", backgroundColor: INK.paperCard, color: INK.ink }}
          />

          {!checked ? (
            <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleCheck} disabled={inputValue.trim().length === 0}>
              核對 ✓
            </InkButton>
          ) : (
            <>
              <p className="mt-3 font-extrabold" style={{ color: isCorrect ? FEEDBACK.correct.solid : FEEDBACK.incorrect.solid }}>
                {isCorrect ? "✅ 答對了，做得好！" : `💛 答錯了，正確答案是：${q.answer}`}
              </p>
              <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleNext}>
                {isLast ? "完成 🎉" : "下一題 →"}
              </InkButton>
            </>
          )}
        </PaperCard>
      </div>
    );
  }

  function CangjieModule({ onBack, onRecordPractice }) {
    const [view, setView] = useState("reference"); // reference | practice

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("reference");
    }

    if (view === "practice") {
      return <PracticeSession onBack={() => setView("reference")} onFinish={finishPractice} />;
    }

    return <ReferenceView onBack={onBack} onStartPractice={() => setView("practice")} />;
  }

  window.App.CangjieModule = CangjieModule;
})();
