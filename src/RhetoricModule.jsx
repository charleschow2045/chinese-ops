// Module 8: 修辭手法 — list (the 7 devices) -> detail (definition, tip,
// examples) -> practice (mixed quiz, generated at runtime from
// PRACTICE_SENTENCES, same pattern as Modules 1/2/5: "identify the device"
// is naturally multiple-choice, so there's no typing-vs-spec tension here).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS, useA2 } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.rhetoric;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { RHETORIC_DEVICES, RHETORIC_PRACTICE_SENTENCES, RHETORIC_LEVEL_LABEL } = window.App.Content;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function buildDeviceQuestion(pool, item, a2) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.device);
    const options = shuffle([item.device, ...distractors]);
    const prompt = a2 ? (
      <div>
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{item.sentence}」</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這句運用了什麼修辭手法？</p>
      </div>
    ) : (
      <div>
        <p className="text-xl leading-relaxed mb-2">「{item.sentence}」</p>
        <p className="text-sm" style={{ color: INK.mutedInk }}>
          這句運用了什麼修辭手法？
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.device) };
  }

  // Harder second question type (user feedback: "too easy") — instead of
  // just naming the device, asks what *effect* it achieves, testing
  // understanding of why a writer would use it, not just pattern-matching
  // keywords like 像/難道/什麼是.
  function buildEffectQuestion(pool, item, a2) {
    const device = RHETORIC_DEVICES.find((d) => d.name === item.device);
    const otherDevices = RHETORIC_DEVICES.filter((d) => d.name !== item.device);
    const distractors = shuffle(otherDevices)
      .slice(0, 3)
      .map((d) => d.effect);
    const options = shuffle([device.effect, ...distractors]);
    const prompt = a2 ? (
      <div>
        <p className="font-serif text-xl leading-relaxed mb-2" style={{ fontWeight: 700 }}>「{item.sentence}」</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: 0 }}>這句運用了「{item.device}」，這樣寫有什麼作用？</p>
      </div>
    ) : (
      <div>
        <p className="text-xl leading-relaxed mb-2">「{item.sentence}」</p>
        <p className="text-sm" style={{ color: INK.mutedInk }}>
          這句運用了「{item.device}」，這樣寫有什麼作用？
        </p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(device.effect) };
  }

  // `chooseFrom` (defaults to `pool`) is the set of items actually asked
  // about — distinct from `pool`, which supplies distractors. This split
  // lets 練習錯題 (mistake review) restrict *which* sentences come up
  // without also shrinking the distractor pool down to just those few
  // items (see RhetoricModule's mistake-review button below).
  function buildQuestions(pool, count, chooseFrom, a2) {
    const builders = [buildDeviceQuestion, buildEffectQuestion];
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item, i) => builders[i % builders.length](pool, item, a2));
  }

  function DeviceDetail({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
        </div>

        <PaperCard accent={ACCENT}>
          <h2 className={`text-2xl text-center ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </h2>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            定義
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.definition}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            辨認小貼士
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.tip}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            例句
          </p>
          <div className="flex flex-col gap-2">
            {item.examples.map((ex, i) => (
              <p
                key={i}
                className="rounded-xl p-3"
                style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}`, color: INK.ink }}
              >
                {ex}
              </p>
            ))}
          </div>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function PracticeSession({ pool, chooseFrom, onBack, onFinish, onAnswerItem }) {
    const QUESTION_COUNT = 8;
    const a2 = useA2();
    const [questions] = useState(() => buildQuestions(pool, QUESTION_COUNT, chooseFrom, a2));
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
      const correct = i === q.correctIndex;
      if (correct) setCorrectCount((c) => c + 1);
      onAnswerItem(q.itemId, correct);
    }

    function handleNext() {
      if (isLast) setDone(true);
      else {
        setQIndex((x) => x + 1);
        setSelected(null);
      }
    }

    if (done && a2) {
      return (
        <PaperCard accent={ACCENT} className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl mb-1" style={{ color: A2.ink, fontWeight: 900, fontFamily: A2.font }}>
            練習完成！
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: A2.accD, fontFamily: A2.font }}>
            答對了 {correctCount} / {questions.length} 題
          </p>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </InkButton>
        </PaperCard>
      );
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

    if (a2) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <A2BackButton label="← 返回" onClick={onBack} />
            <span style={{ color: A2.sub, fontSize: 14, fontWeight: 700, fontFamily: A2.font }}>
              第 {qIndex + 1} / {questions.length} 題
            </span>
          </div>

          <PaperCard accent={ACCENT}>
            <QuestionBlock q={q} selected={selected} onSelect={selectOption} accent={ACCENT} />
            {answered && (
              <InkButton accent={ACCENT} className="w-full mt-4" onClick={handleNext}>
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
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} accent={ACCENT} />
          {answered && (
            <InkButton accent={ACCENT} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  function DeviceListRow({ item, onOpen }) {
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
          🎭
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.name}
          </p>
          <p className={`text-xs truncate ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.definition}
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

  function DeviceDetailA2({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div>
          <A2BackButton label="← 返回" onClick={onBack} />
        </div>

        <PaperCard>
          <h2 className="text-center" style={{ fontSize: 26, fontWeight: 900, color: A2.ink, margin: 0 }}>
            {item.name}
          </h2>
        </PaperCard>

        <A2Section title="定義">
          <p style={A2_BODY}>{item.definition}</p>
        </A2Section>

        <A2Section title="辨認小貼士">
          <p style={A2_BODY}>{item.tip}</p>
        </A2Section>

        <A2Section title="例句">
          <div className="flex flex-col gap-2">
            {item.examples.map((ex, i) => (
              <p key={i} className="font-serif rounded-xl p-3" style={{ ...A2_BODY, background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                {ex}
              </p>
            ))}
          </div>
        </A2Section>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function ListViewA2({ filterLevel, setFilterLevel, mistakeItems, startPractice, filteredSentences, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="rhetoric" title="修辭手法" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度（影響練習例句）</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredSentences)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(RHETORIC_PRACTICE_SENTENCES, mistakeItems)} />
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {RHETORIC_DEVICES.map((item) => (
            <A2ListRow key={item.id} moduleKey="rhetoric" tile="🎭" title={item.name} sub={item.definition} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  function RhetoricModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const a2 = useA2();
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);

    const filteredSentences = useMemo(
      () =>
        filterLevel === "all"
          ? RHETORIC_PRACTICE_SENTENCES
          : RHETORIC_PRACTICE_SENTENCES.filter((it) => it.level === filterLevel),
      [filterLevel]
    );

    const mistakeItems = useMemo(
      () => RHETORIC_PRACTICE_SENTENCES.filter((it) => (mistakes || []).includes(it.id)),
      [mistakes]
    );

    const selectedItem = RHETORIC_DEVICES.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : RHETORIC_PRACTICE_SENTENCES);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      const Detail = a2 ? DeviceDetailA2 : DeviceDetail;
      return <Detail item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filteredSentences)} />;
    }

    if (view === "practice" && practiceScope) {
      return (
        <PracticeSession
          pool={practiceScope}
          chooseFrom={reviewScope}
          onBack={() => setView("list")}
          onFinish={finishPractice}
          onAnswerItem={onAnswerItem}
        />
      );
    }

    if (a2) {
      return (
        <ListViewA2
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          mistakeItems={mistakeItems}
          startPractice={startPractice}
          filteredSentences={filteredSentences}
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
            修辭手法
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            程度（影響練習例句）
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
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filteredSentences)}>
            開始練習 🎯
          </InkButton>
          {mistakeItems.length > 0 && (
            <InkButton
              accent={REVIEW_ACCENT}
              className="w-full mt-2"
              onClick={() => startPractice(RHETORIC_PRACTICE_SENTENCES, mistakeItems)}
            >
              練習錯題 ({mistakeItems.length}) 📝
            </InkButton>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {RHETORIC_DEVICES.map((item) => (
            <DeviceListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.RhetoricModule = RhetoricModule;
})();
