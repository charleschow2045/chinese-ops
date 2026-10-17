// Module 5: 成語學習 (game-style, standalone) — inspired by 成語猜猜.
// Three views: list (browse, filter by level) -> detail (idiom, meaning,
// origin story) -> practice (a "成語猜猜" mixed game: guess-the-idiom from
// a clue, match idiom to meaning, and fill-in-the-missing-character — all
// tap-to-select, no typing).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.idiom;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { IDIOM_ITEMS, IDIOM_LEVEL_LABEL, getIdiomMasteryTier, getNextIdiomMasteryTier } = window.App.Content;
  const { AudioButtons } = window.App;
  const QUESTION_COUNT = 8;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function buildClueQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.idiom);
    const options = shuffle([item.idiom, ...distractors]);
    const prompt = (
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>成語猜猜 — 根據提示猜出成語</p>
        <p className="text-xl leading-relaxed" style={{ fontWeight: 800 }}>{item.clue}</p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.idiom) };
  }

  function buildMeaningQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.meaning);
    const options = shuffle([item.meaning, ...distractors]);
    const prompt = `「${item.idiom}」是什麼意思？`;
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(item.meaning) };
  }

  function buildFillCharQuestion(pool, item) {
    const charIndex = Math.floor(Math.random() * item.idiom.length);
    const correct = item.idiom[charIndex];
    const otherChars = pool
      .filter((it) => it.id !== item.id)
      .flatMap((it) => it.idiom.split(""))
      .filter((c, i, arr) => c !== correct && arr.indexOf(c) === i);
    const distractors = shuffle(otherChars).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    const blanked = item.idiom
      .split("")
      .map((c, i) => (i === charIndex ? "▁" : c))
      .join("");
    const prompt = (
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>填字砌成語 — 哪一個字才是正確的？</p>
        <p className="text-4xl font-serif" style={{ fontWeight: 900, color: A2.ink }}>{blanked}</p>
      </div>
    );
    return { itemId: item.id, prompt, options, correctIndex: options.indexOf(correct) };
  }

  // `chooseFrom` restricts which idioms 練習錯題 asks about; `pool` still
  // supplies distractors — same pattern as the other runtime-generated
  // modules (see RhetoricModule for the fullest explanation).
  function buildQuestions(pool, count, chooseFrom) {
    const builders = [buildClueQuestion, buildMeaningQuestion, buildFillCharQuestion];
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item, i) => builders[i % builders.length](pool, item));
  }

  function PracticeSession({ pool, chooseFrom, priorStages, onBack, onFinish, onAnswerItem }) {
    const [questions] = useState(() => buildQuestions(pool, QUESTION_COUNT, chooseFrom));
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

    if (done) {
      const beforeTier = getIdiomMasteryTier(priorStages);
      const afterTier = getIdiomMasteryTier(priorStages + 1);
      const leveledUp = afterTier.title !== beforeTier.title;
      return (
        <PaperCard accent={ACCENT} className="text-center">
          <p className="text-5xl mb-2">{leveledUp ? afterTier.emoji : "🎉"}</p>
          <h2 className="text-xl mb-1" style={{ color: A2.ink, fontWeight: 900, fontFamily: A2.font }}>
            {leveledUp ? `恭喜！你的成語稱號晉升為「${afterTier.title}」了！` : "練習完成！"}
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

  // ---------------------------------------------------------------------
  // A2 screens. UI text is A2.font; 原文 / 例句 stay serif; text >= 14 px;
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

  // 成語稱號 card (A2). Stage-based: every finished session advances one 關卡 whatever the score. The label says 「成語稱號」 and that only 成語學習 sessions
  // count, so it is not mistaken for the 科舉稱號 on the home screen (which counts every module).
  function MasteryBadgeA2({ stagesCompleted }) {
    const tier = getIdiomMasteryTier(stagesCompleted);
    const next = getNextIdiomMasteryTier(stagesCompleted);
    return (
      <PaperCard style={{ background: A2.fireBg, borderColor: A2.fireBg }}>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: 40, lineHeight: 1 }}>{tier.emoji}</div>
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 14, fontWeight: 800, color: A2.fireInk, margin: 0 }}>成語稱號（只計算成語學習的練習）</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0, lineHeight: 1.3 }}>{tier.title}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: A2.fireInk, margin: 0 }}>{tier.blurb}</p>
          </div>
        </div>
        {next && (
          <p style={{ fontSize: 14, fontWeight: 700, color: A2.fireInk, margin: "8px 0 0" }}>
            再完成 {next.minStages - stagesCompleted} 次成語練習，即可晉升為「{next.title}」！
          </p>
        )}
      </PaperCard>
    );
  }

  function CharacterPinyinCardA2({ item }) {
    const chars = item.idiom.split("");
    const syllables = item.pinyin ? item.pinyin.split(" ") : [];
    return (
      <PaperCard>
        <div className="flex items-center justify-center gap-2 flex-wrap py-1">
          {chars.map((c, i) => (
            <div key={i} className="rounded-xl px-3 py-2 text-center" style={{ background: A2.row, border: `1px solid ${A2.rowBd}` }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: A2.accD, margin: 0, lineHeight: 1.3 }}>{syllables[i] || ""}</p>
              <p className="font-serif" style={{ fontSize: 32, fontWeight: 900, color: A2.ink, margin: 0, lineHeight: 1.3 }}>{c}</p>
            </div>
          ))}
        </div>
        <AudioButtons text={item.idiom} accent={ACCENT} className="mt-3" />
      </PaperCard>
    );
  }

  function IdiomDetailA2({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>{IDIOM_LEVEL_LABEL[item.level]}</span>
        </div>

        <CharacterPinyinCardA2 item={item} />

        <A2Section title="意思">
          <p style={A2_BODY}>{item.meaning}</p>
        </A2Section>

        {item.annotations && (
          <A2Section title="難字讀音">
            <div className="flex flex-col gap-2">
              {item.annotations.map((a, i) => (
                <p key={i} style={{ fontSize: 15, color: A2.ink, margin: 0, lineHeight: 1.6 }}>
                  <span className="font-serif font-bold" style={{ color: A2.accD }}>
                    {a.term}
                  </span>
                  {a.jyutping && (
                    <span style={{ fontWeight: 700, color: A2.accD }}>
                      {" "}
                      （粵音：{a.jyutping}）
                    </span>
                  )}
                  {" — "}
                  {a.meaning}
                </p>
              ))}
            </div>
          </A2Section>
        )}

        {item.origin && (
          <A2Section title="出處及故事">
            <p className="font-serif" style={{ ...A2_BODY, lineHeight: 1.9 }}>{item.origin}</p>
          </A2Section>
        )}

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始成語猜猜 🎲
        </InkButton>
      </div>
    );
  }

  function ListViewA2({ priorStages, filterLevel, setFilterLevel, filtered, mistakeItems, startPractice, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="idiom" title="成語學習" onBack={onBack} />

        <MasteryBadgeA2 stagesCompleted={priorStages} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始成語猜猜 🎲
          </InkButton>
          {mistakeItems.length > 0 && <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(IDIOM_ITEMS, mistakeItems)} />}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <A2ListRow
              key={item.id}
              moduleKey="idiom"
              tile={<span className="font-serif font-black">{item.idiom[0]}</span>}
              title={item.idiom}
              serifTitle
              sub={IDIOM_LEVEL_LABEL[item.level]}
              onOpen={() => openItem(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function IdiomModule({ level, practiceStats, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
    const [practiceScope, setPracticeScope] = useState(null);
    const [reviewScope, setReviewScope] = useState(null);
    const priorStages = Math.floor(((practiceStats && practiceStats.attempts) || 0) / QUESTION_COUNT);

    const filtered = useMemo(
      () => (filterLevel === "all" ? IDIOM_ITEMS : IDIOM_ITEMS.filter((it) => it.level === filterLevel)),
      [filterLevel]
    );

    const mistakeItems = useMemo(() => IDIOM_ITEMS.filter((it) => (mistakes || []).includes(it.id)), [mistakes]);

    const selectedItem = IDIOM_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : IDIOM_ITEMS);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      return <IdiomDetailA2 item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filtered)} />;
    }

    if (view === "practice" && practiceScope) {
      return (
        <PracticeSession
          pool={practiceScope}
          chooseFrom={reviewScope}
          priorStages={priorStages}
          onBack={() => setView("list")}
          onFinish={finishPractice}
          onAnswerItem={onAnswerItem}
        />
      );
    }

    return (
      <ListViewA2
        priorStages={priorStages}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filtered={filtered}
        mistakeItems={mistakeItems}
        startPractice={startPractice}
        openItem={openItem}
        onBack={onBack}
      />
    );
  }

  window.App.IdiomModule = IdiomModule;
})();
