// Module 1: 詩詞學習 (Classical Poetry + 文言文)
// Three views: list (browse, filterable by level) -> detail (full text,
// pinyin toggle, explanation, background) -> practice (mixed quiz: fill-in
// -the-blank line picking, author MC, meaning MC — all tap-to-select, no typing).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, useScrollToTop, A2SegControl, A2Section, A2Header, A2ListRow, A2ReviewButton } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.poetry;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { POETRY_ITEMS, POETRY_LEVEL_LABEL } = window.App.Content;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { AudioButtons } = window.App;

  // 體裁 pill tones (方案 B) — grouped by the app's existing 4-family
  // palette plus one neutral tone for prose, per the user's spec: 絕句類
  // → 竹青, 律詩類 → 靛青, 古詩類 → 赭金, 詞 → 印泥紅, 文言短文 → neutral.
  // Matched by substring since `form` values are e.g. "五言絕句"/"七言絕句".
  const FORM_PILL_TONES = [
    { match: (f) => f.includes("絕句"), bg: "#E4E9DE", text: "#2F4028" },
    { match: (f) => f.includes("律詩"), bg: "#E4E8EC", text: "#23303D" },
    { match: (f) => f.includes("古詩"), bg: "#F1E7CF", text: "#7A5D20" },
    { match: (f) => f === "詞", bg: "#F6E4E1", text: "#7A211A" },
    { match: (f) => f === "文言短文", bg: "#EAE5DB", text: "#6B6355" },
  ];

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  // 節錄 poems use a "……" line to mark omitted text. Such a line is not a real
  // line of the poem, so it must never be the blanked answer nor a distractor.
  const isRealLine = (l) => /[一-鿿]/.test(l);

  function buildFillBlankQuestion(pool, item) {
    const candidates = item.lines.map((l, i) => i).filter((i) => isRealLine(item.lines[i]));
    const lineIdx = candidates[Math.floor(Math.random() * candidates.length)];
    const correct = item.lines[lineIdx];
    const otherLines = pool
      .filter((it) => it.id !== item.id)
      .flatMap((it) => it.lines)
      .filter((l, i, arr) => isRealLine(l) && l !== correct && arr.indexOf(l) === i);
    const distractors = shuffle(otherLines).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    const prompt = (
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>
          《{item.title}》 · {item.author} — 哪一句才是正確的？
        </p>
        <div className="text-xl leading-relaxed font-serif" style={{ fontWeight: 700 }}>
          {item.lines.map((l, i) => (
            <p key={i} style={i === lineIdx ? { color: A2.accD } : undefined}>
              {i === lineIdx ? "＿＿＿＿＿＿＿" : l}
            </p>
          ))}
        </div>
      </div>
    );
    return { itemId: item.id, type: "fill", prompt, options, correctIndex: options.indexOf(correct) };
  }

  function buildAuthorQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.author);
    const options = shuffle([item.author, ...distractors]);
    const prompt = `《${item.title}》的作者是誰？`;
    return { itemId: item.id, type: "author", prompt, options, correctIndex: options.indexOf(item.author) };
  }

  function buildMeaningQuestion(pool, item) {
    const distractors = sampleOthers(pool, item, 3, (it) => it.meaningQuiz);
    const options = shuffle([item.meaningQuiz, ...distractors]);
    const prompt = (
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 8px" }}>
          《{item.title}》 · {item.author}
        </p>
        <p className="mb-2" style={{ fontWeight: 800 }}>
          <span className="font-serif">「{item.lines.find(isRealLine)}」</span>……這句的意思最貼近以下哪一項？
        </p>
      </div>
    );
    return { itemId: item.id, type: "meaning", prompt, options, correctIndex: options.indexOf(item.meaningQuiz) };
  }

  // `chooseFrom` restricts which poems are actually asked about (used by
  // 練習錯題); `pool` still supplies distractors, so a small mistake set
  // doesn't run short of plausible wrong options — same pattern as
  // RhetoricModule/PunctuationModule.
  function buildQuestions(pool, count, chooseFrom) {
    const builders = [buildFillBlankQuestion, buildAuthorQuestion, buildMeaningQuestion];
    const chosen = sampleWithRepeats(chooseFrom || pool, count);
    return chosen.map((item, i) => builders[i % builders.length](pool, item));
  }

  function PracticeSession({ pool, chooseFrom, onBack, onFinish, onAnswerItem }) {
    const QUESTION_COUNT = 8;
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
      if (isLast) {
        setDone(true);
      } else {
        setQIndex((x) => x + 1);
        setSelected(null);
      }
    }

    if (done) {
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

  // 體裁 pill: 13 px text, tone from FORM_PILL_TONES.
  function FormPillA2({ item }) {
    if (!item.form) return null;
    const tone = FORM_PILL_TONES.find((t) => t.match(item.form));
    if (!tone) return null;
    const label = item.form === "詞" && item.ciTune ? `詞．${item.ciTune}` : item.form;
    return (
      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: tone.bg, color: tone.text, marginBottom: 12 }}>
        {label}
      </span>
    );
  }

  function PoemDetailA2({ item, onBack, onPractice, relatedStories = [], onOpenStory }) {
    const [showPinyin, setShowPinyin] = useState(false);
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>
            {POETRY_LEVEL_LABEL[item.level]} · {item.type === "prose" ? "文言文" : "詩詞"}
          </span>
        </div>

        <PaperCard>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: A2.ink, margin: 0, lineHeight: 1.3 }}>{item.title}</h2>
          <p style={{ fontSize: 14, fontWeight: 700, color: A2.sub, margin: "2px 0 8px" }}>
            {item.dynasty} · {item.author}
          </p>
          <div>
            <FormPillA2 item={item} />
          </div>

          <div className="text-lg leading-loose font-serif" style={{ color: A2.ink }}>
            {item.lines.map((l, i) => (
              <div key={i}>
                <p>{l}</p>
                {showPinyin && item.pinyin && (
                  <p style={{ fontSize: 15, fontWeight: 700, color: A2.accD, margin: "0 0 4px", fontFamily: A2.font }}>{item.pinyin[i]}</p>
                )}
              </div>
            ))}
          </div>

          {item.pinyin && (
            <button
              aria-pressed={showPinyin}
              onClick={() => setShowPinyin((v) => !v)}
              className="mt-3"
              style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: 0, background: A2.segTrack, color: A2.accD, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
            >
              {showPinyin ? "隱藏拼音" : "顯示拼音"}
            </button>
          )}

          <AudioButtons text={item.lines.join("")} accent={ACCENT} className="mt-3" />
        </PaperCard>

        {item.annotations && (
          <A2Section title="詞語註釋">
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

        {item.type === "prose" ? (
          <A2Section title="逐句解釋">
            <div className="flex flex-col gap-2">
              {item.lineExplanations.map((exp, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                  <p className="font-serif font-bold" style={{ fontSize: 15, color: A2.ink, margin: "0 0 4px" }}>
                    {item.lines[i]}
                  </p>
                  <p style={{ fontSize: 15, color: A2.sub, margin: 0, lineHeight: 1.6 }}>{exp}</p>
                </div>
              ))}
            </div>
          </A2Section>
        ) : (
          <A2Section title="譯文">
            <p style={A2_BODY}>{item.translation || item.explanation}</p>
          </A2Section>
        )}

        <A2Section title="背景">
          <p style={A2_BODY}>{item.background}</p>
        </A2Section>

        {relatedStories.length > 0 && (
          <A2Section title="相關歷史故事">
            <div className="flex flex-col gap-3">
              {relatedStories.map((s) => (
                <div key={s.storyId}>
                  <p style={{ fontSize: 15, color: A2.ink, margin: 0, lineHeight: 1.7 }}>
                    <span style={{ display: "inline-block", borderRadius: 999, padding: "1px 10px", fontSize: 13, fontWeight: 800, marginRight: 6, background: A2.segTrack, color: A2.accD }}>
                      {s.relation}
                    </span>
                    {s.note}
                  </p>
                  <button
                    onClick={() => onOpenStory(s.storyId)}
                    className="mt-1"
                    style={{ minHeight: 44, display: "inline-flex", alignItems: "center", border: 0, background: "transparent", color: A2.accD, fontFamily: A2.font, fontSize: 16, fontWeight: 900, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer", textAlign: "left" }}
                  >
                    📖 {s.title} →
                  </button>
                </div>
              ))}
            </div>
          </A2Section>
        )}

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function ListViewA2({ filterLevel, setFilterLevel, filtered, mistakeItems, startPractice, openItem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="poetry" title="詩詞學習" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始隨機練習 🎲
          </InkButton>
          {mistakeItems.length > 0 && <A2ReviewButton count={mistakeItems.length} onClick={() => startPractice(POETRY_ITEMS, mistakeItems)} />}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <A2ListRow
              key={item.id}
              moduleKey="poetry"
              tile={item.type === "prose" ? "📜" : "🖌️"}
              title={item.title}
              serifTitle
              sub={`${item.dynasty} · ${item.author} · ${POETRY_LEVEL_LABEL[item.level]}`}
              onOpen={() => openItem(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // `nav` (optional) is set when another module links here:
  //   { poemId, scopeIds?, from? } — open that poem's detail directly;
  //   `scopeIds` limits the practice pool (e.g. the 戰爭詩詞 set) and `from`
  //   ({ module, opts }) is where the back button returns to.
  function PoetryModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem, nav, onNavigate }) {
    const startPoem = nav && POETRY_ITEMS.some((it) => it.id === nav.poemId) ? nav.poemId : null;
    const [view, setView] = useState(startPoem ? "detail" : "list"); // list | detail | practice
    useScrollToTop(view);
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(startPoem);
    const [practiceScope, setPracticeScope] = useState(null); // pool used for a practice session
    const [reviewScope, setReviewScope] = useState(null);

    const filtered = useMemo(
      () => (filterLevel === "all" ? POETRY_ITEMS : POETRY_ITEMS.filter((it) => it.level === filterLevel)),
      [filterLevel]
    );

    const mistakeItems = useMemo(() => POETRY_ITEMS.filter((it) => (mistakes || []).includes(it.id)), [mistakes]);

    const selectedItem = POETRY_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("detail");
    }

    function startPractice(pool, chooseFrom) {
      setPracticeScope(pool.length >= 4 ? pool : POETRY_ITEMS);
      setReviewScope(chooseFrom || null);
      setView("practice");
    }

    // Opened from another module: practice/back return to the poem, not the list.
    const afterPracticeView = nav ? "detail" : "list";

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView(afterPracticeView);
    }

    function leaveDetail() {
      if (nav && nav.from && onNavigate) onNavigate(nav.from.module, nav.from.opts);
      else setView("list");
    }

    const scopeItems = nav && nav.scopeIds ? POETRY_ITEMS.filter((it) => nav.scopeIds.includes(it.id)) : null;

    const relatedStories = useMemo(() => {
      if (!selectedItem) return [];
      const { HISTORY_POEM_STORY_LINKS, HISTORY_ITEMS } = window.App.Content;
      return HISTORY_POEM_STORY_LINKS.filter((l) => l.poemId === selectedItem.id)
        .map((l) => ({ ...l, title: (HISTORY_ITEMS.find((s) => s.id === l.storyId) || {}).title }))
        .filter((l) => l.title);
    }, [selectedItem]);

    if (view === "detail" && selectedItem) {
      return (
        <PoemDetailA2
          item={selectedItem}
          onBack={leaveDetail}
          onPractice={() => startPractice(scopeItems || filtered)}
          relatedStories={relatedStories}
          onOpenStory={(storyId) =>
            onNavigate && onNavigate("history", { storyId, from: { module: "poetry", opts: nav || { poemId: selectedItem.id } } })
          }
        />
      );
    }

    if (view === "practice" && practiceScope) {
      return (
        <PracticeSession
          pool={practiceScope}
          chooseFrom={reviewScope}
          onBack={() => setView(selectedId && nav ? "detail" : "list")}
          onFinish={finishPractice}
          onAnswerItem={onAnswerItem}
        />
      );
    }

    return (
      <ListViewA2
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

  window.App.PoetryModule = PoetryModule;
})();
