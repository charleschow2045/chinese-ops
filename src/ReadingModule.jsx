// Module 7: 閱讀理解 — list -> read the passage -> answer that passage's own
// fixed questions -> summary.
//
// Every passage uses the rebuilt format (`item.comprehension`): paragraph-
// numbered passage, 詞語角, and a two-part question set — 理解能力 (single-
// choice, multi-select "哪兩項", and open-ended 申述題 answered by self-marking
// against reference points) plus 語文能力 (詞語/成語/修辭). Run by
// ReadingQuizFlow below, which scores in marks (each question carries
// `marks`) and shuffles mc/multi options per attempt. The retired OLD format
// (`item.questions`, run by the shared FixedQuizFlow) remains only as a
// fallback branch.
window.App = window.App || {};

(function () {
  const { useState, useMemo, useRef, useLayoutEffect } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, FEEDBACK, TYPE, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS, useA2 } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.reading;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { READING_ITEMS, READING_LEVEL_LABEL } = window.App.Content;

  const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function isNewFormat(item) {
    return Array.isArray(item.comprehension);
  }

  function totalMarks(item) {
    return [...item.comprehension, ...(item.language || [])].reduce((s, q) => s + q.marks, 0);
  }

  function Pill({ children, bg, color }) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color }}>
        {children}
      </span>
    );
  }

  function PassageDetail({ item, onBack, onStartQuestions }) {
    const fresh = isNewFormat(item);
    const paragraphs = Array.isArray(item.passage) ? item.passage : [item.passage];
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {READING_LEVEL_LABEL[item.level]}
            {item.genre ? ` · ${item.genre}` : ""}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <h2 className={`text-xl mb-2 ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </h2>
          {item.focus && (
            <p className="text-sm mb-3 leading-relaxed" style={{ color: INK.mutedInk }}>
              <span className="font-bold" style={{ color: ACCENT.solid }}>
                學習重點：
              </span>
              {item.focus}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {paragraphs.map((p, i) => (
              <p key={i} className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
                {paragraphs.length > 1 && (
                  <span className="font-bold mr-1" style={{ color: ACCENT.solid }}>
                    {CIRCLED[i] || i + 1}
                  </span>
                )}
                {p}
              </p>
            ))}
          </div>
        </PaperCard>

        {fresh && item.vocab && item.vocab.length > 0 && (
          <PaperCard accent={ACCENT} style={{ backgroundColor: ACCENT.tint }}>
            <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: ACCENT.dark }}>
              詞語角
            </p>
            <div className="flex flex-col gap-1">
              {item.vocab.map((v, i) => (
                <p key={i} className={`text-sm ${TYPE.body}`} style={{ color: INK.ink }}>
                  <span className={TYPE.heading} style={{ color: ACCENT.dark }}>
                    {v.term}
                  </span>
                  ：{v.meaning}
                </p>
              ))}
            </div>
          </PaperCard>
        )}

        {fresh && (
          <p className="text-xs text-center" style={{ color: INK.mutedInk }}>
            共 {item.comprehension.length + (item.language || []).length} 題（理解能力 {item.comprehension.length} 題、語文能力{" "}
            {(item.language || []).length} 題），總分 {totalMarks(item)} 分
          </p>
        )}

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  // ---- New-format quiz -------------------------------------------------

  const SKILL_TONES = {
    重整: { bg: "#E4E8EC", color: "#23303D" },
    解釋: { bg: "#E4E9DE", color: "#2F4028" },
    伸展: { bg: "#F1E7CF", color: "#7A5D20" },
    評鑑: { bg: "#F6E4E1", color: "#7A211A" },
  };

  function skillTone(skill) {
    const key = Object.keys(SKILL_TONES).find((k) => skill.includes(k));
    return key ? SKILL_TONES[key] : { bg: "#EAE5DB", color: "#6B6355" };
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((v, i) => v === sb[i]);
  }

  function shuffleOptions(q) {
    if (q.kind !== "mc" && q.kind !== "multi") return q;
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const remap = (old) => order.indexOf(old);
    return {
      ...q,
      options: order.map((o) => q.options[o]),
      answer: q.kind === "mc" ? remap(q.answer) : q.answer.map(remap).sort((a, b) => a - b),
    };
  }

  function optionStyle({ isSelected, isAnswer, checked }) {
    if (checked) {
      if (isAnswer) return { backgroundColor: FEEDBACK.correct.tint, border: `2px solid ${FEEDBACK.correct.solid}`, color: INK.ink };
      if (isSelected) return { backgroundColor: FEEDBACK.incorrect.tint, border: `2px solid ${FEEDBACK.incorrect.solid}`, color: INK.ink };
    }
    if (isSelected) return { backgroundColor: ACCENT.tint, border: `2px solid ${ACCENT.solid}`, color: INK.ink };
    return { backgroundColor: INK.paperCard, border: `1.5px solid ${ACCENT.tintBorder}`, color: INK.ink };
  }

  function ReadingQuizFlow({ item, onBack, onFinish }) {
    const a2 = useA2();
    // Options are shuffled once per attempt (answer index remapped) so the
    // correct answer's position in the authored data never leaks.
    const questions = useMemo(
      () => [
        ...item.comprehension.map((q) => ({ ...shuffleOptions(q), section: "理解能力" })),
        ...(item.language || []).map((q) => ({ ...shuffleOptions(q), section: "語文能力" })),
      ],
      [item]
    );
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState([]);
    const [checked, setChecked] = useState(false);
    const [text, setText] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [earned, setEarned] = useState([]);
    const [done, setDone] = useState(false);
    // A2 only: a new question starts at the top of the page (long questions on a phone otherwise stay scrolled).
    useLayoutEffect(() => {
      if (a2) window.scrollTo(0, 0);
    }, [idx]);

    const q = questions[idx];
    const isLast = idx === questions.length - 1;

    function record(value) {
      setEarned((e) => {
        const n = [...e];
        n[idx] = value;
        return n;
      });
    }

    function pickMc(i) {
      if (checked) return;
      setSelected([i]);
      setChecked(true);
      record(i === q.answer ? q.marks : 0);
    }

    function toggleMulti(i) {
      if (checked) return;
      setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    }

    function checkMulti() {
      if (checked || selected.length === 0) return;
      setChecked(true);
      record(sameSet(selected, q.answer) ? q.marks : 0);
    }

    function rateOpen(value) {
      record(value);
      setChecked(true);
    }

    function next() {
      if (isLast) {
        setDone(true);
        return;
      }
      setIdx((x) => x + 1);
      setSelected([]);
      setChecked(false);
      setText("");
      setRevealed(false);
    }

    if (done && a2) {
      const sum = (list) => list.reduce((s, x) => s + (x || 0), 0);
      const maxAll = questions.reduce((s, x) => s + x.marks, 0);
      const sections = ["理解能力", "語文能力"].map((name) => {
        const idxs = questions.map((x, i) => (x.section === name ? i : -1)).filter((i) => i >= 0);
        return { name, got: sum(idxs.map((i) => earned[i])), max: idxs.reduce((s, i) => s + questions[i].marks, 0) };
      });
      const fullCount = questions.filter((x, i) => (earned[i] || 0) === x.marks).length;
      return (
        <PaperCard className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: "0 0 4px", fontFamily: A2.font }}>問答完成！</h2>
          <p style={{ fontSize: 32, fontWeight: 900, color: A2.accD, margin: "0 0 4px", fontFamily: A2.numFont }}>
            {sum(earned)} / {maxAll} 分
          </p>
          <div className="flex justify-center gap-4 mb-3 flex-wrap" style={{ fontSize: 15, fontWeight: 800, color: A2.sub, fontFamily: A2.font }}>
            {sections.map((sec) => (
              <span key={sec.name}>
                {sec.name}：{sec.got}/{sec.max}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {questions.map((x, i) => {
              const e = earned[i] || 0;
              const tn = e === x.marks ? { bg: A2.rowDone, color: A2.ok } : e === 0 ? { bg: A2.todayBg, color: A2.hotInk } : { bg: A2.fireBg, color: A2.fireInk };
              return (
                <span key={i} style={{ padding: "4px 10px", borderRadius: 10, fontSize: 13, fontWeight: 800, background: tn.bg, color: tn.color, border: `1px solid ${tn.color}` }}>
                  {i + 1}. {e}/{x.marks}
                </span>
              );
            })}
          </div>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(fullCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    if (done) {
      const sum = (list) => list.reduce((s, x) => s + (x || 0), 0);
      const maxAll = questions.reduce((s, x) => s + x.marks, 0);
      const sections = ["理解能力", "語文能力"].map((name) => {
        const idxs = questions.map((x, i) => (x.section === name ? i : -1)).filter((i) => i >= 0);
        return {
          name,
          got: sum(idxs.map((i) => earned[i])),
          max: idxs.reduce((s, i) => s + questions[i].marks, 0),
        };
      });
      const fullCount = questions.filter((x, i) => (earned[i] || 0) === x.marks).length;
      return (
        <PaperCard accent={ACCENT} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className={`text-xl mb-1 ${TYPE.heading}`} style={{ color: INK.ink }}>
            問答完成！
          </h2>
          <p className="text-3xl font-black mb-1" style={{ color: ACCENT.solid }}>
            {sum(earned)} / {maxAll} 分
          </p>
          <div className="flex justify-center gap-4 mb-3 text-sm font-bold" style={{ color: INK.mutedInk }}>
            {sections.map((s) => (
              <span key={s.name}>
                {s.name}：{s.got}/{s.max}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {questions.map((x, i) => {
              const e = earned[i] || 0;
              const tone = e === x.marks ? FEEDBACK.correct : e === 0 ? FEEDBACK.incorrect : { tint: "#F1E7CF", solid: "#A9812F" };
              return (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: tone.tint, color: tone.solid, border: `1px solid ${tone.solid}` }}
                >
                  {i + 1}. {e}/{x.marks}
                </span>
              );
            })}
          </div>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(fullCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    const tone = skillTone(q.skill);
    const canGoNext = checked;

    if (a2) {
      const PillA2 = ({ children, bg, color }) => (
        <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800, background: bg, color }}>{children}</span>
      );
      const optA2 = ({ isSelected, isAnswer }) => {
        if (checked && isAnswer) return { background: A2.rowDone, border: `2px solid ${A2.ok}`, color: A2.ink };
        if (checked && isSelected) return { background: A2.todayBg, border: `2px solid ${A2.hot}`, color: A2.ink };
        if (isSelected) return { background: A2.segTrack, border: `2px solid ${A2.acc}`, color: A2.ink };
        return { background: A2.row, border: `1.5px solid ${A2.rowBd}`, color: A2.ink };
      };
      const gotFull = (earned[idx] || 0) === q.marks;
      const rateBtn = { minHeight: 48, borderRadius: 999, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer", color: A2.ink };
      return (
        <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <A2BackButton label="← 返回" onClick={onBack} />
            <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>
              {item.title} · 第 {idx + 1} / {questions.length} 題
            </span>
          </div>

          <PaperCard>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <PillA2 bg={A2.acc} color="#fff">{q.section}</PillA2>
              <PillA2 bg={tone.bg} color={tone.color}>{q.skill}</PillA2>
              <PillA2 bg={A2.segTrack} color={A2.sub}>{q.marks} 分</PillA2>
              {q.kind === "multi" && <PillA2 bg={A2.segTrack} color={A2.sub}>複選（選 {q.answer.length} 項）</PillA2>}
            </div>

            <p className="whitespace-pre-line" style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.7, color: A2.ink, margin: "0 0 12px" }}>
              {q.prompt}
            </p>

            {(q.kind === "mc" || q.kind === "multi") && (
              <>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, i) => {
                    const isSelected = selected.includes(i);
                    const isAnswer = q.kind === "mc" ? i === q.answer : q.answer.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => (q.kind === "mc" ? pickMc(i) : toggleMulti(i))}
                        className="text-left rounded-2xl font-bold text-base px-4 py-3 transition-all"
                        style={{ minHeight: 48, fontFamily: A2.font, cursor: "pointer", lineHeight: 1.6, ...optA2({ isSelected, isAnswer }) }}
                      >
                        {q.kind === "multi" && <span className="mr-2">{isSelected ? "☑" : "☐"}</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {q.kind === "multi" && !checked && (
                  <InkButton accent={ACCENT} className="w-full mt-3" onClick={checkMulti} disabled={selected.length === 0}>
                    核對答案 ✓
                  </InkButton>
                )}
                {checked && (
                  <div className="mt-3">
                    <p className="font-extrabold text-lg" style={{ color: gotFull ? A2.ok : A2.hotInk, margin: 0 }}>
                      {gotFull ? `✅ 答對了！（${q.marks} 分）` : "💛 答錯了，正確答案已標示。（0 分）"}
                    </p>
                    {q.explanation && (
                      <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: "8px 0 0", borderRadius: 12, padding: 12, background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                        <span style={{ fontWeight: 900, color: A2.accD }}>解釋：</span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {q.kind === "open" && (
              <>
                {q.hint && <p style={{ fontSize: 14, color: A2.sub, margin: "0 0 8px" }}>{q.hint}</p>}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={revealed}
                  rows={4}
                  placeholder="在這裏寫下你的答案（也可以先在心裏想好）"
                  className="w-full rounded-xl px-3 py-2 text-base outline-none disabled:opacity-70"
                  style={{ border: `1.5px solid ${A2.rowBd}`, background: A2.row, color: A2.ink, fontFamily: A2.font, minHeight: 112 }}
                />
                {!revealed && (
                  <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => setRevealed(true)}>
                    顯示參考答案要點
                  </InkButton>
                )}
                {revealed && (
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="rounded-xl p-3" style={{ background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color: A2.accD, margin: "0 0 4px" }}>參考答案要點</p>
                      <ul className="list-disc pl-5" style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>
                        {q.points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                      {q.scheme && <p style={{ fontSize: 14, color: A2.sub, margin: "8px 0 0" }}>評分：{q.scheme}</p>}
                    </div>
                    {q.modelAnswer && (
                      <div className="rounded-xl p-3" style={{ background: A2.glass, border: `1px solid ${A2.glassBd}` }}>
                        <p style={{ fontSize: 15, fontWeight: 900, color: A2.sub, margin: "0 0 4px" }}>示範答案</p>
                        <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>{q.modelAnswer}</p>
                      </div>
                    )}
                    {!checked ? (
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 900, color: A2.ink, margin: "0 0 8px" }}>對照要點，你答到多少？</p>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => rateOpen(q.marks)} style={{ ...rateBtn, background: A2.rowDone, border: `2px solid ${A2.ok}` }}>
                            ✅ 全部答到（{q.marks} 分）
                          </button>
                          {q.marks > 1 && (
                            <button onClick={() => rateOpen(Math.ceil(q.marks / 2))} style={{ ...rateBtn, background: A2.fireBg, border: `2px solid ${A2.fireInk}` }}>
                              🔶 答到一部分（{Math.ceil(q.marks / 2)} 分）
                            </button>
                          )}
                          <button onClick={() => rateOpen(0)} style={{ ...rateBtn, background: A2.todayBg, border: `2px solid ${A2.hot}` }}>
                            💛 未答到（0 分）
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-extrabold" style={{ color: A2.accD, margin: 0 }}>
                        已記錄：{earned[idx]} / {q.marks} 分
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {canGoNext && (
              <InkButton accent={ACCENT} className="w-full mt-4" onClick={next}>
                {isLast ? "完成 🎉" : "下一題 →"}
              </InkButton>
            )}
          </PaperCard>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className="text-sm font-bold" style={{ color: INK.mutedInk }}>
            {item.title} · 第 {idx + 1} / {questions.length} 題
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Pill bg={ACCENT.solid} color={ACCENT.on}>
              {q.section}
            </Pill>
            <Pill bg={tone.bg} color={tone.color}>
              {q.skill}
            </Pill>
            <Pill bg="#EAE5DB" color="#6B6355">
              {q.marks} 分
            </Pill>
            {q.kind === "multi" && (
              <Pill bg="#EAE5DB" color="#6B6355">
                複選（選 {q.answer.length} 項）
              </Pill>
            )}
          </div>

          <p className={`text-lg mb-3 whitespace-pre-line ${TYPE.heading}`} style={{ color: INK.ink }}>
            {q.prompt}
          </p>

          {(q.kind === "mc" || q.kind === "multi") && (
            <>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const isSelected = selected.includes(i);
                  const isAnswer = q.kind === "mc" ? i === q.answer : q.answer.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => (q.kind === "mc" ? pickMc(i) : toggleMulti(i))}
                      className="text-left rounded-xl font-bold text-base px-4 py-3 transition-all"
                      style={optionStyle({ isSelected, isAnswer, checked })}
                    >
                      {q.kind === "multi" && <span className="mr-2">{isSelected ? "☑" : "☐"}</span>}
                      {opt}
                    </button>
                  );
                })}
              </div>
              {q.kind === "multi" && !checked && (
                <InkButton accent={ACCENT} className="w-full mt-3" onClick={checkMulti} disabled={selected.length === 0}>
                  核對答案 ✓
                </InkButton>
              )}
              {checked && (
                <div className="mt-3">
                  <p
                    className="font-extrabold text-lg"
                    style={{ color: (earned[idx] || 0) === q.marks ? FEEDBACK.correct.solid : FEEDBACK.incorrect.solid }}
                  >
                    {(earned[idx] || 0) === q.marks ? `✅ 答對了！（${q.marks} 分）` : "💛 答錯了，正確答案已標示。（0 分）"}
                  </p>
                  {q.explanation && (
                    <p className="text-sm mt-2 leading-relaxed rounded-xl p-3" style={{ backgroundColor: ACCENT.tint, color: INK.ink }}>
                      <span className="font-bold" style={{ color: ACCENT.dark }}>
                        解釋：
                      </span>
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {q.kind === "open" && (
            <>
              {q.hint && (
                <p className="text-xs mb-2" style={{ color: INK.mutedInk }}>
                  {q.hint}
                </p>
              )}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={revealed}
                rows={4}
                placeholder="在這裏寫下你的答案（也可以先在心裏想好）"
                className="w-full rounded-xl px-3 py-2 text-base outline-none disabled:opacity-70"
                style={{ border: `1.5px solid ${ACCENT.tintBorder}`, backgroundColor: INK.paperCard, color: INK.ink }}
              />
              {!revealed && (
                <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => setRevealed(true)}>
                  顯示參考答案要點
                </InkButton>
              )}
              {revealed && (
                <div className="mt-3 flex flex-col gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}>
                    <p className="text-sm font-bold mb-1" style={{ color: ACCENT.dark }}>
                      參考答案要點
                    </p>
                    <ul className="list-disc pl-5 text-sm leading-relaxed" style={{ color: INK.ink }}>
                      {q.points.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                    {q.scheme && (
                      <p className="text-xs mt-2" style={{ color: INK.mutedInk }}>
                        評分：{q.scheme}
                      </p>
                    )}
                  </div>
                  {q.modelAnswer && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: INK.paper, border: `1.5px solid ${ACCENT.tintBorder}` }}>
                      <p className="text-sm font-bold mb-1" style={{ color: INK.mutedInk }}>
                        示範答案
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: INK.ink }}>
                        {q.modelAnswer}
                      </p>
                    </div>
                  )}
                  {!checked ? (
                    <div>
                      <p className="text-sm font-bold mb-2" style={{ color: INK.ink }}>
                        對照要點，你答到多少？
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => rateOpen(q.marks)}
                          className="rounded-xl py-2 font-bold text-sm"
                          style={{ backgroundColor: FEEDBACK.correct.tint, border: `2px solid ${FEEDBACK.correct.solid}`, color: INK.ink }}
                        >
                          ✅ 全部答到（{q.marks} 分）
                        </button>
                        {q.marks > 1 && (
                          <button
                            onClick={() => rateOpen(Math.ceil(q.marks / 2))}
                            className="rounded-xl py-2 font-bold text-sm"
                            style={{ backgroundColor: "#F1E7CF", border: "2px solid #A9812F", color: INK.ink }}
                          >
                            🔶 答到一部分（{Math.ceil(q.marks / 2)} 分）
                          </button>
                        )}
                        <button
                          onClick={() => rateOpen(0)}
                          className="rounded-xl py-2 font-bold text-sm"
                          style={{ backgroundColor: FEEDBACK.incorrect.tint, border: `2px solid ${FEEDBACK.incorrect.solid}`, color: INK.ink }}
                        >
                          💛 未答到（0 分）
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-extrabold" style={{ color: ACCENT.solid }}>
                      已記錄：{earned[idx]} / {q.marks} 分
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {canGoNext && (
            <InkButton accent={ACCENT} className="w-full mt-4" onClick={next}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  // ---- List / module ---------------------------------------------------

  function PassageListRow({ item, onOpen }) {
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
          📖
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </p>
          <p className={`text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {READING_LEVEL_LABEL[item.level]}
            {item.genre ? ` · ${item.genre}` : ""}
          </p>
        </div>
      </button>
    );
  }

  // ---------------------------------------------------------------------
  // 階段 6c-2: A2 versions of this module's screens, used only while Root's A2 switch is on (useA2()).
  // The 文房 screens above are untouched. UI text is A2.font; 原文 / 例句 stay serif; text >= 14 px;
  // every pressable >= 44 px; back buttons are A2BackButton (>= 96 x 48).
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };
  const A2_BODY = { fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 };

  function A2SegControl({ options, value, onChange, label }) {
    return (
      <div role="group" aria-label={label} style={{ display: "flex", gap: 6, background: A2.segTrack, padding: 5, borderRadius: 999 }}>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              aria-pressed={active}
              onClick={() => onChange(o.key)}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(active ? { background: A2.segOn, color: "#fff", boxShadow: A2.segOnShadow } : { background: "transparent", color: A2.sub }),
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  function A2Section({ title, children }) {
    return (
      <PaperCard>
        <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>{title}</h3>
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

  function A2ListRow({ moduleKey, tile, title, serifTitle, sub, onOpen }) {
    const m = MODULE_ICONS[moduleKey];
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 text-left active:translate-y-[2px] transition-all"
        style={{
          minHeight: 72,
          padding: "10px 14px 10px 12px",
          borderRadius: 22,
          background: A2.glass,
          border: `1px solid ${A2.glassBd}`,
          boxShadow: A2.shadow,
          color: A2.ink,
          fontFamily: A2.font,
          cursor: "pointer",
        }}
      >
        <div
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 17, background: m.tint, border: `1px solid ${m.tintBorder}`, fontSize: 24, lineHeight: 1 }}
        >
          {tile}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate${serifTitle ? " font-serif" : ""}`} style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
            {title}
          </p>
          {sub && (
            <p className="truncate" style={{ fontSize: 14, color: A2.sub, margin: 0 }}>
              {sub}
            </p>
          )}
        </div>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 900, color: A2.accD }}>
          ›
        </span>
      </button>
    );
  }

  // 練習錯題 is a secondary action (filter-style chip), not a second primary button.
  function A2ReviewButton({ count, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-full mt-2 transition-all"
        style={{ minHeight: 48, borderRadius: 999, border: 0, background: A2.fireBg, color: A2.fireInk, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
      >
        練習錯題 ({count}) 📝
      </button>
    );
  }

  function PassageDetailA2({ item, onBack, onStartQuestions }) {
    const fresh = isNewFormat(item);
    const paragraphs = Array.isArray(item.passage) ? item.passage : [item.passage];
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>
            {READING_LEVEL_LABEL[item.level]}
            {item.genre ? ` · ${item.genre}` : ""}
          </span>
        </div>

        <PaperCard>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: "0 0 8px", lineHeight: 1.35 }}>{item.title}</h2>
          {item.focus && (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: A2.sub, margin: "0 0 14px", borderRadius: 12, padding: "8px 12px", background: A2.row, border: `1px solid ${A2.rowBd}` }}>
              <span style={{ fontWeight: 900, color: A2.accD }}>學習重點：</span>
              {item.focus}
            </p>
          )}
          <div className="flex flex-col" style={{ gap: 16 }}>
            {paragraphs.map((p, i) => (
              <p key={i} className="font-serif" style={{ fontSize: 17, lineHeight: 2, color: A2.ink, margin: 0 }}>
                {paragraphs.length > 1 && (
                  <span style={{ fontWeight: 900, color: A2.accD, marginRight: 4 }}>{CIRCLED[i] || i + 1}</span>
                )}
                {p}
              </p>
            ))}
          </div>
        </PaperCard>

        {fresh && item.vocab && item.vocab.length > 0 && (
          <A2Section title="詞語角">
            <div className="flex flex-col gap-1">
              {item.vocab.map((v, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>
                  <span className="font-serif font-bold" style={{ color: A2.accD }}>{v.term}</span>：{v.meaning}
                </p>
              ))}
            </div>
          </A2Section>
        )}

        <PaperCard>
          {fresh && (
            <p className="text-center" style={{ fontSize: 14, color: A2.sub, margin: "0 0 12px", lineHeight: 1.7 }}>
              共 {item.comprehension.length + (item.language || []).length} 題（理解能力 {item.comprehension.length} 題、語文能力{" "}
              {(item.language || []).length} 題），總分 {totalMarks(item)} 分
            </p>
          )}
          <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
            開始問答 ✏️
          </InkButton>
        </PaperCard>
      </div>
    );
  }

  function ListViewA2({ filterLevel, setFilterLevel, liveMistakes, onlyMistakes, setOnlyMistakes, filtered, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="reading" title="閱讀理解" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          {liveMistakes.length > 0 && (
            <button
              aria-pressed={onlyMistakes}
              onClick={() => setOnlyMistakes((v) => !v)}
              className="w-full mt-2 transition-all"
              style={{
                minHeight: 48,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(onlyMistakes ? { background: A2.fireInk, color: "#fff" } : { background: A2.fireBg, color: A2.fireInk }),
              }}
            >
              📝 只看錯題 ({liveMistakes.length})
            </button>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <A2ListRow
              key={item.id}
              moduleKey="reading"
              tile="📖"
              title={item.title}
              sub={`${READING_LEVEL_LABEL[item.level]}${item.genre ? ` · ${item.genre}` : ""}`}
              onOpen={() => openItem(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function ReadingModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const a2 = useA2();
    // A2 only: remember where the passage was scrolled to when the questions start, and restore it when the child
    // comes back to the passage (the questions themselves always start at the top).
    const passageScroll = useRef(0);
    const [view, setView] = useState("list"); // list | passage | questions
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Ignore mistake ids from retired passages (the rebuild replaced the old ids).
    const liveMistakes = (mistakes || []).filter((id) => READING_ITEMS.some((it) => it.id === id));
    const filtered = READING_ITEMS.filter(
      (it) => (filterLevel === "all" || it.level === filterLevel) && (!onlyMistakes || liveMistakes.includes(it.id))
    );
    const selectedItem = READING_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      passageScroll.current = 0;
      setSelectedId(id);
      setView("passage");
    }

    function startQuestions() {
      passageScroll.current = window.scrollY;
      setView("questions");
    }

    useLayoutEffect(() => {
      if (!a2) return;
      if (view === "questions") window.scrollTo(0, 0);
      else if (view === "passage") window.scrollTo(0, passageScroll.current);
    }, [view]);

    // Fixed-per-item modules track mistakes at passage granularity (not
    // per-question) — a perfect run clears it, anything less flags the passage.
    // For new-format passages, "perfect" means every question earned full marks.
    function finishQuestions(correctCount, total) {
      onRecordPractice(correctCount, total);
      onAnswerItem(selectedItem.id, correctCount === total);
      setView("list");
    }

    if (view === "passage" && selectedItem) {
      const Detail = a2 ? PassageDetailA2 : PassageDetail;
      return <Detail item={selectedItem} onBack={() => setView("list")} onStartQuestions={() => (a2 ? startQuestions() : setView("questions"))} />;
    }

    if (view === "questions" && selectedItem) {
      if (isNewFormat(selectedItem)) {
        return <ReadingQuizFlow item={selectedItem} onBack={() => setView("passage")} onFinish={finishQuestions} />;
      }
      return (
        <FixedQuizFlow
          questions={selectedItem.questions}
          accent={ACCENT}
          headerLabel={selectedItem.title}
          onBack={() => setView("passage")}
          onFinish={finishQuestions}
        />
      );
    }

    if (a2) {
      return (
        <ListViewA2
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          liveMistakes={liveMistakes}
          onlyMistakes={onlyMistakes}
          setOnlyMistakes={setOnlyMistakes}
          filtered={filtered}
          openItem={openItem}
          onBack={onBack}
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
            閱讀理解
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            程度
          </p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => {
              const active = filterLevel === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => setFilterLevel(l.key)}
                  className={`flex-1 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
                  style={
                    active
                      ? { backgroundColor: ACCENT.solid, color: ACCENT.on }
                      : { backgroundColor: INK.paper, color: INK.mutedInk, border: `1.5px solid ${ACCENT.tintBorder}` }
                  }
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          {liveMistakes.length > 0 && (
            <button
              onClick={() => setOnlyMistakes((v) => !v)}
              className={`w-full mt-2 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
              style={
                onlyMistakes
                  ? { backgroundColor: REVIEW_ACCENT.solid, color: REVIEW_ACCENT.on }
                  : { backgroundColor: INK.paper, color: REVIEW_ACCENT.dark, border: `1.5px solid ${REVIEW_ACCENT.tintBorder}` }
              }
            >
              📝 只看錯題 ({liveMistakes.length})
            </button>
          )}
        </PaperCard>

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
