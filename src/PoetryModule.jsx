// Module 1: 詩詞學習 (Classical Poetry + 文言文)
// Three views: list (browse, filterable by level) -> detail (full text,
// pinyin toggle, explanation, background) -> practice (mixed quiz: fill-in
// -the-blank line picking, author MC, meaning MC — all tap-to-select, no typing).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { Card, Button, COLORS } = window.App.UI;
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
        <p className="text-xs font-extrabold text-stone-400 mb-2">
          《{item.title}》 · {item.author} — 哪一句才是正確的？
        </p>
        <div className="text-xl leading-relaxed">
          {item.lines.map((l, i) => (
            <p key={i} className={i === lineIdx ? "text-rose-400" : ""}>
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
        <p className="text-xs font-extrabold text-stone-400 mb-2">
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
    const c = COLORS.rose;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-rose-500">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            {POETRY_LEVEL_LABEL[item.level]} · {item.type === "prose" ? "文言文" : "詩詞"}
          </span>
        </div>

        <Card>
          <h2 className="text-2xl font-extrabold text-stone-800">{item.title}</h2>
          <p className="text-sm font-bold text-stone-400 mb-3">
            {item.dynasty} · {item.author}
          </p>

          <div className="text-lg leading-loose text-stone-700 font-medium">
            {item.lines.map((l, i) => (
              <div key={i}>
                <p>{l}</p>
                {showPinyin && item.pinyin && (
                  <p className="text-sm text-rose-400 font-bold mb-1">{item.pinyin[i]}</p>
                )}
              </div>
            ))}
          </div>

          {item.pinyin && (
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className="mt-3 text-xs font-extrabold text-rose-500 underline"
            >
              {showPinyin ? "隱藏拼音" : "顯示拼音"}
            </button>
          )}

          <AudioButtons text={item.lines.join("")} color="rose" className="mt-3" />
        </Card>

        {item.annotations && (
          <Card>
            <p className="text-sm font-extrabold text-stone-400 mb-2">詞語註釋</p>
            <div className="flex flex-col gap-2">
              {item.annotations.map((a, i) => (
                <p key={i} className="text-sm text-stone-700">
                  <span className="font-extrabold text-rose-500">{a.term}</span>
                  {a.jyutping && <span className="text-rose-400 font-bold"> （粵音：{a.jyutping}）</span>}
                  {" — "}
                  {a.meaning}
                </p>
              ))}
            </div>
          </Card>
        )}

        {item.type === "prose" ? (
          <Card>
            <p className="text-sm font-extrabold text-stone-400 mb-2">逐句解釋</p>
            <div className="flex flex-col gap-2">
              {item.lineExplanations.map((exp, i) => (
                <div key={i} className="rounded-xl bg-rose-50 border-4 border-rose-100 p-3">
                  <p className="text-sm font-bold text-stone-700 mb-1">{item.lines[i]}</p>
                  <p className="text-sm text-stone-600">{exp}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm font-extrabold text-stone-400 mb-1">譯文</p>
            <p className="text-stone-700 leading-relaxed">{item.translation || item.explanation}</p>
          </Card>
        )}

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">背景</p>
          <p className="text-stone-700 leading-relaxed">{item.background}</p>
        </Card>

        <Button color={c === COLORS.rose ? "rose" : "rose"} className="w-full" onClick={onPractice}>
          開始練習 🎯
        </Button>
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
        <Card className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">練習完成！</h2>
          <p className="text-lg font-bold text-rose-500 mb-4">
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color="rose" className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-rose-500">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <Card>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} />
          {answered && (
            <Button color="rose" className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  function PoemListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-rose-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-rose-50">
          {item.type === "prose" ? "📜" : "🖌️"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.title}</p>
          <p className="text-xs font-bold text-stone-400">
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
          <button onClick={onBack} className="text-sm font-extrabold text-rose-500">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">詩詞學習</span>
        </div>

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">程度</p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l.key}
                onClick={() => setFilterLevel(l.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterLevel === l.key
                    ? "bg-rose-400 border-rose-600 text-rose-950"
                    : "bg-white border-rose-100 text-rose-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button color="rose" className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始隨機練習 🎲
          </Button>
          {mistakeItems.length > 0 && (
            <Button color="amber" className="w-full mt-2" onClick={() => startPractice(POETRY_ITEMS, mistakeItems)}>
              練習錯題 ({mistakeItems.length}) 📝
            </Button>
          )}
        </Card>

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
