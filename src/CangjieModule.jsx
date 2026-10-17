// Module 3: 倉頡輸入法教學 (standalone) — reference chart (colour-coded root
// table, similar in spirit to 五色學倉頡) + 速成 explainer, then real typing
// drills. This is one of only two modules (the other being Mandarin/pinyin)
// where free typing is appropriate, per the design brief — the child types
// plain keyboard letters (easy), never Chinese characters directly.
window.App = window.App || {};

(function () {
  const { useState, useMemo, useRef, useEffect } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.cangjie;
  const { shuffle } = window.App.QuizUtils;
  const { CANGJIE_CATEGORIES, CANGJIE_ROOTS, CANGJIE_COMPOUND_EXAMPLES, CANGJIE_AUXILIARY_SHAPES, CANGJIE_QUICK_EXAMPLE, CANGJIE_CHAR_BREAKDOWN, CANGJIE_NO_AUX_OFFICIAL, CANGJIE_TYPING_TEXTS } =
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

  // ---------------------------------------------------------------------
  // A2 screens. The 五色 category tints (CATEGORY_TONES) are kept as the
  // category identifiers; text on a tint uses a darker shade of the same hue (TONE_TEXT) so it stays readable.
  // UI text is A2.font; root / example characters are serif; text >= 13 px; every pressable >= 44 px.
  // The module has no on-screen keyboard: the child types on the device keyboard into a text field.
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };
  const A2_BODY = { fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 };
  const A2_NOTE = { fontSize: 14, color: A2.sub, margin: 0, lineHeight: 1.6 };
  const TONE_TEXT = { rose: "#8E2A21", orange: "#8F3A26", amber: "#6E5115", emerald: "#3B5232", violet: "#2B3A4A" };
  function toneA2(color) {
    const key = CATEGORY_TONES[color] ? color : "amber";
    return { ...CATEGORY_TONES[key], text: TONE_TEXT[key] };
  }
  const A2_INPUT = {
    width: "100%",
    minHeight: 56,
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    borderRadius: 16,
    border: `2px solid ${A2.rowBd}`,
    background: "#fff",
    color: A2.ink,
    fontFamily: A2.numFont,
    padding: "8px 16px",
    outline: "none",
  };

  function A2Section({ title, children }) {
    return (
      <PaperCard>
        {title && <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>{title}</h3>}
        {children}
      </PaperCard>
    );
  }

  function A2Header({ moduleKey, title, onBack }) {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <A2BackButton label="← 返回主頁" onClick={onBack} />
        <div className="flex items-center gap-2">
          <A2ModuleIcon moduleKey={moduleKey} size={44} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0, fontFamily: A2.font }}>{title}</h1>
        </div>
      </div>
    );
  }

  function DecompositionDiagramA2({ code, resultChar }) {
    const letters = code.split("");
    const op = { fontSize: 20, fontWeight: 900, color: A2.sub };
    return (
      <div className="flex items-center justify-center flex-wrap gap-2 py-1">
        {letters.map((letter, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={op}>+</span>}
            <div className="text-center" style={{ minWidth: 48, padding: "4px 8px", borderRadius: 12, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
              <p className="font-serif" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, color: A2.ink, margin: 0 }}>
                {ROOT_CHAR_BY_LETTER[letter] || "?"}
              </p>
              <p style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.2, color: A2.accD, margin: 0, fontFamily: A2.numFont }}>{letter}</p>
            </div>
          </React.Fragment>
        ))}
        <span style={op}>=</span>
        <div className="text-center" style={{ minWidth: 56, padding: "4px 12px", borderRadius: 12, background: A2.segTrack, border: `2px solid ${A2.acc}` }}>
          <p className="font-serif" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, color: A2.accD, margin: 0 }}>
            {resultChar}
          </p>
        </div>
      </div>
    );
  }

  function RootChartA2() {
    return (
      <div className="flex flex-col gap-4">
        {CANGJIE_CATEGORIES.map((cat) => {
          const tone = toneA2(cat.color);
          return (
            <PaperCard key={cat.key}>
              <div className="flex items-center gap-2 mb-3">
                <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 999, background: tone.solid, flexShrink: 0 }} />
                <h3 style={{ ...A2_LABEL, color: tone.text }}>{cat.label}</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CANGJIE_ROOTS.filter((r) => r.category === cat.key).map((r) => (
                  <div
                    key={r.letter}
                    className="text-center"
                    style={{ minHeight: 64, padding: "6px 4px", borderRadius: 14, background: tone.tint, border: `1.5px solid ${tone.tintBorder}` }}
                  >
                    <p className="font-serif" style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.25, color: A2.ink, margin: 0 }}>
                      {r.char}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.3, color: tone.text, margin: 0 }}>
                      {r.letter}
                      {r.definition ? `・${r.definition}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </PaperCard>
          );
        })}
      </div>
    );
  }

  function AuxiliaryShapesA2() {
    const classes = CANGJIE_CATEGORIES.filter((c) => c.key !== "special");
    const covered = new Set(CANGJIE_AUXILIARY_SHAPES.map((a) => a.rootLetter));
    const totalLetters = CANGJIE_ROOTS.filter((r) => r.category !== "special").length;
    return (
      <A2Section title="輔助字形總覽">
        <p style={{ ...A2_NOTE, marginBottom: 12 }}>
          24 個字母除了本身的字根，還會衍生出「輔助字形」——較小、常出現在字部件裏的變形寫法，輸入時一律打所屬字母。
          例如「氵」屬「水」，打 E；「扌」屬「手」，打 Q。下表按四大類列出 {totalLetters} 個字母各自已核實的輔助字形
          （目前 {covered.size}/{totalLetters} 個字母有收錄）。
        </p>
        <div className="flex flex-col gap-4">
          {classes.map((cat) => {
            const tone = toneA2(cat.color);
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 999, background: tone.solid, flexShrink: 0 }} />
                  <p style={{ ...A2_LABEL, fontSize: 15, color: tone.text }}>{cat.label}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {CANGJIE_ROOTS.filter((r) => r.category === cat.key).map((r) => {
                    const shapes = CANGJIE_AUXILIARY_SHAPES.filter((a) => a.rootLetter === r.letter);
                    return (
                      <div key={r.letter} style={{ padding: 12, borderRadius: 14, background: tone.tint, border: `1.5px solid ${tone.tintBorder}` }}>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-serif" style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0 }}>
                            {r.char}
                          </p>
                          <span style={{ fontSize: 14, fontWeight: 900, color: tone.text }}>
                            {r.letter}
                            {r.definition ? `・${r.definition}` : ""}
                          </span>
                          {shapes.length > 0 && <span style={{ color: A2.sub }}>→</span>}
                          {shapes.map((a) => (
                            <span key={a.shape} className="font-serif" style={{ fontSize: 22, fontWeight: 900, color: tone.text }}>
                              {a.shape}
                            </span>
                          ))}
                        </div>
                        {shapes.length > 0 ? (
                          <div className="mt-1 flex flex-col gap-0.5">
                            {shapes.map((a) => (
                              <p key={a.shape} style={A2_NOTE}>
                                <span className="font-serif" style={{ fontWeight: 900, color: A2.ink }}>
                                  {a.shape}
                                </span>{" "}
                                常見於：{a.examples.join("、")}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1" style={A2_NOTE}>
                            {CANGJIE_NO_AUX_OFFICIAL[r.letter] || "暫未收錄已核實的輔助字形"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3" style={{ fontSize: 13, color: A2.sub, margin: 0, lineHeight: 1.6 }}>
          資料根據朱邦復工作室《第五代倉頡輸入法手冊》，並逐字核對例字的倉頡碼；官方完整表約有 90 個輔助字形，
          其餘多以圖像形式發佈，未能核實的暫不列出。
        </p>
      </A2Section>
    );
  }

  function CompoundExamplesA2() {
    return (
      <A2Section title="組字例子（拆解圖）">
        <div className="flex flex-col gap-2">
          {CANGJIE_COMPOUND_EXAMPLES.map((ex) => (
            <div key={ex.char} style={{ padding: 12, borderRadius: 14, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="font-serif" style={{ fontSize: 26, fontWeight: 900, color: A2.ink, margin: 0 }}>
                  {ex.char}
                </p>
                <p style={{ fontSize: 15, fontWeight: 900, color: A2.accD, margin: 0 }}>碼：{ex.code}</p>
              </div>
              <DecompositionDiagramA2 code={ex.code} resultChar={ex.char} />
              <p className="mt-1" style={A2_NOTE}>
                {ex.note}
              </p>
            </div>
          ))}
        </div>
      </A2Section>
    );
  }

  function CharBreakdownA2() {
    const [selected, setSelected] = useState(null);
    const item = CANGJIE_CHAR_BREAKDOWN.find((c) => c.char === selected);
    return (
      <A2Section title={`拆字練習（${CANGJIE_CHAR_BREAKDOWN.length} 個常用字）`}>
        <p style={{ ...A2_NOTE, marginBottom: 12 }}>先自己想一想怎樣拆，再點一個字，看看它的倉頡碼和拆解圖。</p>
        <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))", gap: 6 }}>
          {CANGJIE_CHAR_BREAKDOWN.map((c) => {
            const on = c.char === selected;
            return (
              <button
                key={c.char}
                aria-pressed={on}
                onClick={() => setSelected(on ? null : c.char)}
                className="font-serif"
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: "pointer",
                  ...(on
                    ? { background: A2.segOn, color: "#fff", border: `1.5px solid ${A2.accD}` }
                    : { background: A2.row, color: A2.ink, border: `1.5px solid ${A2.rowBd}` }),
                }}
              >
                {c.char}
              </button>
            );
          })}
        </div>
        {item && (
          <div style={{ padding: 12, borderRadius: 14, background: "#fff", border: `1.5px solid ${A2.rowBd}` }}>
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <p className="font-serif" style={{ fontSize: 32, fontWeight: 900, color: A2.ink, margin: 0 }}>
                {item.char}
              </p>
              <p style={{ fontSize: 15, fontWeight: 900, color: A2.accD, margin: 0 }}>
                倉頡碼：{item.code}（{item.code.split("").map((l) => ROOT_CHAR_BY_LETTER[l]).join("")}）
              </p>
            </div>
            <DecompositionDiagramA2 code={item.code} resultChar={item.char} />
            {item.code.length > 2 && (
              <p className="mt-1" style={A2_NOTE}>
                速成碼（第一碼＋最後一碼）：{item.code[0] + item.code[item.code.length - 1]}
              </p>
            )}
          </div>
        )}
      </A2Section>
    );
  }

  function QuickExplainerA2() {
    const ex = CANGJIE_QUICK_EXAMPLE;
    return (
      <A2Section title="速成輸入法">
        <p style={{ ...A2_BODY, marginBottom: 8 }}>
          速成是倉頡的簡化版：不需要輸入完整的倉頡碼，只需輸入
          <span style={{ fontWeight: 900, color: A2.accD }}>第一碼</span>和<span style={{ fontWeight: 900, color: A2.accD }}>最後一碼</span>
          即可，最多兩個字母。好處是打字較快，缺點是需要從候選字當中選出正確的字。
        </p>
        <div style={{ padding: 12, borderRadius: 14, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
          <p style={{ ...A2_BODY, fontWeight: 900 }}>
            例子：「{ex.char}」— 完整碼 {ex.fullCode} → 速成碼 {ex.quickCode}
          </p>
          <p className="mt-1" style={A2_NOTE}>
            {ex.note}
          </p>
        </div>
      </A2Section>
    );
  }

  function ReferenceViewA2({ onBack, onStartPractice, onStartTyping }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="cangjie" title="倉頡輸入法" onBack={onBack} />
        <PaperCard>
          <p style={A2_BODY}>
            倉頡輸入法用 24 個基本「字根」（加上一個特殊的「難」字鍵），對應鍵盤上的英文字母。學會這張表，就可以自己輸入中文
            了！以下按官方的四大類（哲理類、筆劃類、人體類、字形類）分類，方便記憶：
          </p>
        </PaperCard>
        <RootChartA2 />
        <AuxiliaryShapesA2 />
        <CompoundExamplesA2 />
        <CharBreakdownA2 />
        <QuickExplainerA2 />
        <InkButton accent={ACCENT} className="w-full" onClick={onStartPractice}>
          開始打字練習 ⌨️
        </InkButton>
        <InkButton accent={ACCENT} className="w-full" onClick={onStartTyping}>
          跟打練習（看拆解圖打整句）✍️
        </InkButton>
      </div>
    );
  }

  // 跟打練習 (follow-along typing): shows a short phrase; for the current
  // character it shows the 拆解圖 (which roots to press) and the child types the
  // Cangjie letters, then Space/Enter — like the real input method. Only phrases
  // whose every character has a verified code are used. Reports speed (字/分鐘)
  // and first-try accuracy.
  function TypingPractice({ onBack, onFinish }) {
    const codeByChar = useMemo(() => {
      const map = {};
      CANGJIE_COMPOUND_EXAMPLES.forEach((e) => (map[e.char] = e.code));
      CANGJIE_CHAR_BREAKDOWN.forEach((e) => (map[e.char] = e.code));
      return map;
    }, []);
    const phrases = useMemo(
      () =>
        shuffle(CANGJIE_TYPING_TEXTS.filter((p) => p.split("").every((ch) => codeByChar[ch]))).slice(0, 5),
      [codeByChar]
    );
    const [pIdx, setPIdx] = useState(0);
    const [cIdx, setCIdx] = useState(0);
    const [input, setInput] = useState("");
    const [showHint, setShowHint] = useState(true);
    const [msg, setMsg] = useState("");
    const [mistakeOnThis, setMistakeOnThis] = useState(false);
    const [firstTry, setFirstTry] = useState(0);
    const [startedAt, setStartedAt] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [done, setDone] = useState(false);
    const inputRef = useRef(null);
    const total = phrases.reduce((n, p) => n + p.length, 0);

    useEffect(() => {
      if (inputRef.current && !done) inputRef.current.focus();
    }, [pIdx, cIdx, done]);

    const phrase = phrases[pIdx];
    const ch = phrase ? phrase[cIdx] : "";
    const code = codeByChar[ch] || "";

    function handleChange(e) {
      if (startedAt === null) setStartedAt(Date.now());
      setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
    }

    function submit() {
      if (input.length === 0) return;
      if (input === code) {
        const nextFirst = firstTry + (mistakeOnThis ? 0 : 1);
        setFirstTry(nextFirst);
        setMsg("");
        setInput("");
        setMistakeOnThis(false);
        const lastChar = cIdx === phrase.length - 1;
        const lastPhrase = pIdx === phrases.length - 1;
        if (lastChar && lastPhrase) {
          setElapsed((Date.now() - (startedAt || Date.now())) / 1000);
          setDone(true);
        } else if (lastChar) {
          setPIdx((x) => x + 1);
          setCIdx(0);
        } else {
          setCIdx((x) => x + 1);
        }
      } else {
        setMistakeOnThis(true);
        setInput("");
        setMsg("打錯了，再試一次。可以按「顯示拆解圖」提示。");
        setShowHint(true);
      }
    }

    function handleKeyDown(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    }

    if (done) {
      const minutes = Math.max(elapsed, 1) / 60;
      const speed = Math.round((total / minutes) * 10) / 10;
      return (
        <div style={{ fontFamily: A2.font }}>
          <PaperCard className="text-center">
            <p className="text-5xl mb-2">🎉</p>
            <h2 style={{ ...A2_LABEL, fontSize: 22, marginBottom: 4 }}>跟打完成！</h2>
            <p style={{ fontSize: 18, fontWeight: 900, color: A2.accD, margin: 0 }}>速度：{speed} 字／分鐘</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: A2.accD, margin: "0 0 16px" }}>
              一次打對：{firstTry} / {total} 字
            </p>
            <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(firstTry, total)}>
              完成
            </InkButton>
          </PaperCard>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 900, color: A2.sub }}>
            第 {pIdx + 1} / {phrases.length} 句
          </span>
        </div>

        <PaperCard>
          <p style={{ ...A2_NOTE, marginBottom: 8 }}>跟着打出這句話：輸入字母，然後按空白鍵（或 Enter）</p>
          <p className="font-serif text-center tracking-widest mb-3" style={{ fontSize: 36, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.4 }}>
            {phrase.split("").map((c, i) => (
              <span
                key={i}
                style={{
                  color: i < cIdx ? "#A39BD0" : i === cIdx ? A2.acc : A2.ink,
                  borderBottom: i === cIdx ? `3px solid ${A2.acc}` : "3px solid transparent",
                }}
              >
                {c}
              </span>
            ))}
          </p>

          {showHint ? (
            <div style={{ padding: 8, borderRadius: 14, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
              <p className="text-center" style={{ ...A2_NOTE, marginBottom: 4 }}>
                拆解圖：「{ch}」由以下字根組成
              </p>
              <DecompositionDiagramA2 code={code} resultChar={ch} />
            </div>
          ) : (
            <p className="text-center" style={A2_NOTE}>
              （拆解圖已隱藏，自己想想「{ch}」怎樣拆）
            </p>
          )}
          <button
            onClick={() => setShowHint((v) => !v)}
            className="mt-3 w-full"
            style={{ minHeight: 48, borderRadius: 999, border: 0, background: A2.segTrack, color: A2.accD, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
          >
            {showHint ? "隱藏拆解圖（挑戰自己）" : "顯示拆解圖"}
          </button>
        </PaperCard>

        <PaperCard>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="打字母，按空白鍵確認"
            aria-label="輸入倉頡碼"
            style={A2_INPUT}
          />
          {msg && (
            <p className="mt-2" style={{ fontSize: 15, fontWeight: 900, color: A2.hotInk, margin: "8px 0 0" }}>
              {msg}
            </p>
          )}
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={submit} disabled={input.length === 0}>
            確認（空白鍵）
          </InkButton>
        </PaperCard>
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
        <div style={{ fontFamily: A2.font }}>
          <PaperCard className="text-center">
            <p className="text-5xl mb-2">🎉</p>
            <h2 style={{ ...A2_LABEL, fontSize: 22, marginBottom: 4 }}>練習完成！</h2>
            <p style={{ fontSize: 18, fontWeight: 900, color: A2.accD, margin: "0 0 16px" }}>
              答對了 {correctCount} / {questions.length} 題
            </p>
            <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
              完成
            </InkButton>
          </PaperCard>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 900, color: A2.sub }}>
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        {(qIndex === 0 || phaseChanged) && (
          <div style={{ padding: "10px 14px", borderRadius: 16, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: A2.accD, margin: 0, lineHeight: 1.5 }}>
              {q.phase === 1 ? "第一部分：字母配對 — 根據字根，輸入正確的字母" : "第二部分：砌字練習 — 輸入整個字的倉頡碼"}
            </p>
          </div>
        )}

        <PaperCard>
          <div className="text-center">
            <p className="font-serif" style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.2, color: A2.ink, margin: 0 }}>
              {q.kind === "letter" ? q.root.char : q.example.char}
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: "4px 0 16px", lineHeight: 1.6 }}>
              {q.kind === "letter"
                ? `（${q.root.meaning}）這個字根用哪一個字母輸入？`
                : `輸入「${q.example.char}」的倉頡碼（${q.example.breakdown}）`}
            </p>
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={checked}
            autoCapitalize="characters"
            placeholder={q.kind === "letter" ? "打字母" : "打倉頡碼"}
            aria-label={q.kind === "letter" ? "輸入字母" : "輸入倉頡碼"}
            style={{ ...A2_INPUT, opacity: checked ? 0.6 : 1 }}
          />

          {!checked ? (
            <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleCheck} disabled={inputValue.trim().length === 0}>
              核對 ✓
            </InkButton>
          ) : (
            <>
              <p
                className="mt-3"
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 900,
                  margin: "12px 0 0",
                  background: isCorrect ? A2.rowDone : A2.todayBg,
                  color: isCorrect ? A2.ok : A2.todayInk,
                }}
              >
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
    const [view, setView] = useState("reference"); // reference | practice | typing

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("reference");
    }

    if (view === "practice") {
      return <PracticeSession onBack={() => setView("reference")} onFinish={finishPractice} />;
    }

    if (view === "typing") {
      return <TypingPractice onBack={() => setView("reference")} onFinish={finishPractice} />;
    }

    return <ReferenceViewA2 onBack={onBack} onStartPractice={() => setView("practice")} onStartTyping={() => setView("typing")} />;
  }

  window.App.CangjieModule = CangjieModule;
})();
