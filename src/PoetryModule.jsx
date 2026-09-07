// Module 1: 詩詞學習 (Classical Poetry + 文言文)
// Three views: list (browse, filterable by level) -> detail (full text,
// pinyin toggle, explanation, background) -> practice (mixed quiz: fill-in
// -the-blank line picking, author MC, meaning MC — all tap-to-select, no typing).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.poetry;
  const { QuestionBlock, isCorrectAnswer } = window.App.QuizQuestion;
  const { POETRY_ITEMS, POETRY_LEVEL_LABEL } = window.App.Content;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { AudioButtons } = window.App;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  function buildFillBlankQuestion(pool, item) {
    const lineIdx = Math.floor(Math.random() * item.lines.length);
    const correct = item.lines[lineIdx];
    const otherLines = pool
      .filter((it) => it.id !== item.id)
      .flatMap((it) => it.lines)
      .filter((l, i, arr) => l !== correct && arr.indexOf(l) === i);
    const distractors = shuffle(otherLines).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    const prompt = (
      <div>
        <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          《{item.title}》 · {item.author} — 哪一句才是正確的？
        </p>
        <div className="text-xl leading-relaxed font-serif">
          {item.lines.map((l, i) => (
            <p key={i} style={i === lineIdx ? { color: ACCENT.solid } : undefined}>
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
        <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          《{item.title}》 · {item.author}
        </p>
        <p className="mb-2">「{item.lines[0]}」……這句的意思最貼近以下哪一項？</p>
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

  function PoemDetail({ item, onBack, onPractice }) {
    const [showPinyin, setShowPinyin] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {POETRY_LEVEL_LABEL[item.level]} · {item.type === "prose" ? "文言文" : "詩詞"}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <h2 className={`text-2xl ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </h2>
          <p className={`text-sm mb-3 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.dynasty} · {item.author}
          </p>

          <div className="text-lg leading-loose font-serif" style={{ color: INK.ink }}>
            {item.lines.map((l, i) => (
              <div key={i}>
                <p>{l}</p>
                {showPinyin && item.pinyin && (
                  <p className="text-sm font-bold mb-1" style={{ color: ACCENT.solid }}>
                    {item.pinyin[i]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {item.pinyin && (
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className="mt-3 text-xs font-extrabold underline"
              style={{ color: ACCENT.solid }}
            >
              {showPinyin ? "隱藏拼音" : "顯示拼音"}
            </button>
          )}

          <AudioButtons text={item.lines.join("")} accent={ACCENT} className="mt-3" />
        </PaperCard>

        {item.annotations && (
          <PaperCard accent={ACCENT}>
            <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
              詞語註釋
            </p>
            <div className="flex flex-col gap-2">
              {item.annotations.map((a, i) => (
                <p key={i} className={`text-sm ${TYPE.body}`} style={{ color: INK.ink }}>
                  <span className={TYPE.heading} style={{ color: ACCENT.solid }}>
                    {a.term}
                  </span>
                  {a.jyutping && (
                    <span className="font-bold" style={{ color: ACCENT.solid }}>
                      {" "}
                      （粵音：{a.jyutping}）
                    </span>
                  )}
                  {" — "}
                  {a.meaning}
                </p>
              ))}
            </div>
          </PaperCard>
        )}

        {item.type === "prose" ? (
          <PaperCard accent={ACCENT}>
            <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
              逐句解釋
            </p>
            <div className="flex flex-col gap-2">
              {item.lineExplanations.map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
                >
                  <p className="text-sm font-serif font-bold mb-1" style={{ color: INK.ink }}>
                    {item.lines[i]}
                  </p>
                  <p className={`text-sm ${TYPE.body}`} style={{ color: INK.mutedInk }}>
                    {exp}
                  </p>
                </div>
              ))}
            </div>
          </PaperCard>
        ) : (
          <PaperCard accent={ACCENT}>
            <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
              譯文
            </p>
            <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
              {item.translation || item.explanation}
            </p>
          </PaperCard>
        )}

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            背景
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.background}
          </p>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </InkButton>
      </div>
    );
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

  function PoemListRow({ item, onOpen }) {
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
          {item.type === "prose" ? "📜" : "🖌️"}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
            {item.title}
          </p>
          <p className={`text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.dynasty} · {item.author} · {POETRY_LEVEL_LABEL[item.level]}
          </p>
        </div>
      </button>
    );
  }

  function PoetryModule({ level, mistakes, onBack, onRecordPractice, onAnswerItem }) {
    const [view, setView] = useState("list"); // list | detail | practice
    const [filterLevel, setFilterLevel] = useState(level || "all");
    const [selectedId, setSelectedId] = useState(null);
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

    function finishPractice(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("list");
    }

    if (view === "detail" && selectedItem) {
      return (
        <PoemDetail
          item={selectedItem}
          onBack={() => setView("list")}
          onPractice={() => startPractice(filtered)}
        />
      );
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

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回主頁
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            詩詞學習
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
          <InkButton accent={ACCENT} className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始隨機練習 🎲
          </InkButton>
          {mistakeItems.length > 0 && (
            <InkButton accent={REVIEW_ACCENT} className="w-full mt-2" onClick={() => startPractice(POETRY_ITEMS, mistakeItems)}>
              練習錯題 ({mistakeItems.length}) 📝
            </InkButton>
          )}
        </PaperCard>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <PoemListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.PoetryModule = PoetryModule;
})();
