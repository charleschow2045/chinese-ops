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
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, FEEDBACK, TYPE } = window.App.UI;
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

  function ReadingModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
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
      setSelectedId(id);
      setView("passage");
    }

    // Fixed-per-item modules track mistakes at passage granularity (not
    // per-question) — a perfect run clears it, anything less flags the passage.
    // For new-format passages, "perfect" means every question earned full marks.
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
