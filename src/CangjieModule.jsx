// Module 3: 倉頡輸入法教學 (standalone) — reference chart (colour-coded root
// table, similar in spirit to 五色學倉頡) + 速成 explainer, then real typing
// drills. This is one of only two modules (the other being Mandarin/pinyin)
// where free typing is appropriate, per the design brief — the child types
// plain keyboard letters (easy), never Chinese characters directly.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Card, Button } = window.App.UI;
  const { shuffle } = window.App.QuizUtils;
  const { CANGJIE_CATEGORIES, CANGJIE_ROOTS, CANGJIE_COMPOUND_EXAMPLES, CANGJIE_AUXILIARY_SHAPES, CANGJIE_QUICK_EXAMPLE } =
    window.App.Content;

  const CATEGORY_CLASSES = {
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    violet: "bg-violet-50 border-violet-200 text-violet-700",
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
        {CANGJIE_CATEGORIES.map((cat) => (
          <Card key={cat.key} className="!p-3">
            <p className={`text-sm font-extrabold mb-2 ${CATEGORY_CLASSES[cat.color].split(" ")[2]}`}>{cat.label}</p>
            <div className="grid grid-cols-4 gap-2">
              {CANGJIE_ROOTS.filter((r) => r.category === cat.key).map((r) => (
                <div
                  key={r.letter}
                  className={`rounded-xl border-4 p-2 text-center ${CATEGORY_CLASSES[cat.color]}`}
                >
                  <p className="text-xl font-extrabold">{r.char}</p>
                  <p className="text-xs font-bold opacity-70">{r.letter}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  function AuxiliaryShapes() {
    return (
      <Card>
        <p className="text-sm font-extrabold text-stone-400 mb-1">常見輔助字形</p>
        <p className="text-sm text-stone-600 mb-2">
          除了基本字根，部分字根還有「輔助字形」——一種較小、常出現在字部件裏面的寫法。以下是幾個最常用的例子：
        </p>
        <div className="flex flex-col gap-2">
          {CANGJIE_AUXILIARY_SHAPES.map((a) => (
            <div key={a.rootLetter} className="rounded-xl bg-sky-50 border-4 border-sky-100 p-3">
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-extrabold text-stone-800">
                  {a.rootChar} ({a.rootLetter})
                </p>
                <span className="text-stone-400">→</span>
                <p className="text-xl font-extrabold text-sky-600">{a.shape}</p>
              </div>
              <p className="text-sm text-stone-500 mt-1">常見於：{a.examples.join("、")}</p>
            </div>
          ))}
        </div>
      </Card>
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
            {i > 0 && <span className="text-sky-300 font-extrabold text-lg">+</span>}
            <div className="rounded-lg border-4 border-sky-200 bg-white px-2 py-1 text-center">
              <p className="text-lg font-extrabold text-stone-800 leading-tight">{ROOT_CHAR_BY_LETTER[letter] || "?"}</p>
              <p className="text-[10px] font-bold text-sky-500 leading-tight">{letter}</p>
            </div>
          </React.Fragment>
        ))}
        <span className="text-sky-300 font-extrabold text-lg">=</span>
        <div className="rounded-lg border-4 border-sky-400 bg-sky-100 px-3 py-1 text-center">
          <p className="text-2xl font-extrabold text-sky-700 leading-tight">{resultChar}</p>
        </div>
      </div>
    );
  }

  function CompoundExamples() {
    return (
      <Card>
        <p className="text-sm font-extrabold text-stone-400 mb-2">組字例子（拆解圖）</p>
        <div className="flex flex-col gap-2">
          {CANGJIE_COMPOUND_EXAMPLES.map((ex) => (
            <div key={ex.char} className="rounded-xl bg-sky-50 border-4 border-sky-100 p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-2xl font-extrabold text-stone-800">{ex.char}</p>
                <p className="text-sm font-bold text-sky-500">碼：{ex.code}</p>
              </div>
              <DecompositionDiagram code={ex.code} resultChar={ex.char} />
              <p className="text-sm text-stone-500 mt-1">{ex.note}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function QuickExplainer() {
    const ex = CANGJIE_QUICK_EXAMPLE;
    return (
      <Card>
        <p className="text-sm font-extrabold text-stone-400 mb-1">速成輸入法</p>
        <p className="text-stone-700 leading-relaxed mb-2">
          速成是倉頡的簡化版：不需要輸入完整的倉頡碼，只需輸入<span className="font-extrabold text-sky-600">第一碼</span>
          和<span className="font-extrabold text-sky-600">最後一碼</span>即可，最多兩個字母。好處是打字較快，缺點是需要從候選字
          當中選出正確的字。
        </p>
        <div className="rounded-xl bg-sky-50 border-4 border-sky-100 p-3">
          <p className="font-extrabold text-stone-800">
            例子：「{ex.char}」— 完整碼 {ex.fullCode} → 速成碼 {ex.quickCode}
          </p>
          <p className="text-sm text-stone-600 mt-1">{ex.note}</p>
        </div>
      </Card>
    );
  }

  function ReferenceView({ onBack, onStartPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-sky-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">倉頡輸入法</span>
        </div>

        <Card>
          <p className="text-stone-700 leading-relaxed">
            倉頡輸入法用 24 個基本「字根」（加上一個特殊的「難」字鍵），對應鍵盤上的英文字母。學會這張表，就可以自己輸入中文
            了！以下按「五色」分類，方便記憶：
          </p>
        </Card>

        <RootChart />
        <AuxiliaryShapes />
        <CompoundExamples />
        <QuickExplainer />

        <Button color="sky" className="w-full" onClick={onStartPractice}>
          開始打字練習 ⌨️
        </Button>
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
        <Card className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">練習完成！</h2>
          <p className="text-lg font-bold text-sky-600 mb-4">
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color="sky" className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-sky-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        {(qIndex === 0 || phaseChanged) && (
          <Card className="!p-3 bg-sky-50">
            <p className="text-sm font-extrabold text-sky-600">
              {q.phase === 1 ? "第一部分：字母配對 — 根據字根，輸入正確的字母" : "第二部分：砌字練習 — 輸入整個字的倉頡碼"}
            </p>
          </Card>
        )}

        <Card>
          {q.kind === "letter" ? (
            <div className="text-center">
              <p className="text-6xl font-extrabold text-stone-800 mb-1">{q.root.char}</p>
              <p className="text-sm font-bold text-stone-400 mb-4">（{q.root.meaning}）這個字根用哪一個字母輸入？</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-6xl font-extrabold text-stone-800 mb-1">{q.example.char}</p>
              <p className="text-sm font-bold text-stone-400 mb-4">輸入「{q.example.char}」的倉頡碼（{q.example.breakdown}）</p>
            </div>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={checked}
            autoCapitalize="characters"
            placeholder={q.kind === "letter" ? "打字母" : "打倉頡碼"}
            className="w-full text-center text-2xl tracking-widest uppercase rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-extrabold px-4 py-3 outline-none focus:border-sky-400 disabled:bg-stone-50"
          />

          {!checked ? (
            <Button color="sky" className="w-full mt-3" onClick={handleCheck} disabled={inputValue.trim().length === 0}>
              核對 ✓
            </Button>
          ) : (
            <>
              <p className={`mt-3 font-extrabold ${isCorrect ? "text-emerald-600" : "text-amber-600"}`}>
                {isCorrect ? "✅ 答對了，做得好！" : `💛 答錯了，正確答案是：${q.answer}`}
              </p>
              <Button color="sky" className="w-full mt-3" onClick={handleNext}>
                {isLast ? "完成 🎉" : "下一題 →"}
              </Button>
            </>
          )}
        </Card>
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
