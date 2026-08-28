// Module 5: 成語學習 (game-style, standalone) — inspired by 成語猜猜.
// Three views: list (browse, filter by level) -> detail (idiom, meaning,
// origin story) -> practice (a "成語猜猜" mixed game: guess-the-idiom from
// a clue, match idiom to meaning, and fill-in-the-missing-character — all
// tap-to-select, no typing).
window.App = window.App || {};

(function () {
  const { useState, useMemo } = React;
  const { Card, Button } = window.App.UI;
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
        <p className="text-xs font-extrabold text-stone-400 mb-2">成語猜猜 — 根據提示猜出成語</p>
        <p className="text-xl leading-relaxed">{item.clue}</p>
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
        <p className="text-xs font-extrabold text-stone-400 mb-2">填字砌成語 — 哪一個字才是正確的？</p>
        <p className="text-4xl font-extrabold text-stone-800">{blanked}</p>
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

  // Scholarly-title mastery badge (狀元/榜眼/探花 etc., from the imperial
  // exam hierarchy) — shows the child's current title plus how many more
  // completed practice 關卡 (sessions) are needed to reach the next one.
  // Stage-based (not correctness-gated): every finished session advances
  // progress, matching the reference app's "complete level N" style.
  function MasteryBadge({ stagesCompleted }) {
    const tier = getIdiomMasteryTier(stagesCompleted);
    const next = getNextIdiomMasteryTier(stagesCompleted);
    return (
      <Card className="!bg-violet-50 !border-violet-200">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{tier.emoji}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-violet-400">你目前的稱號</p>
            <p className="text-xl font-extrabold text-violet-700">{tier.title}</p>
            <p className="text-xs font-bold text-violet-500">{tier.blurb}</p>
          </div>
        </div>
        {next && (
          <p className="text-xs font-bold text-violet-400 mt-2">
            再完成 {next.minStages - stagesCompleted} 次練習，即可晉升為「{next.title}」！
          </p>
        )}
      </Card>
    );
  }

  // Per-character pinyin/hanzi cards + shared `AudioButtons` (🔊 普通話/粵語),
  // in the style of the reference idiom-app screenshots. Splits `pinyin` on
  // spaces to line up one syllable per character — safe because every
  // idiom in this content file is written with exactly one space-separated
  // pinyin syllable per hanzi (see idiomContent.jsx header note).
  function CharacterPinyinCard({ item }) {
    const chars = item.idiom.split("");
    const syllables = item.pinyin ? item.pinyin.split(" ") : [];

    return (
      <Card>
        <div className="flex items-center justify-center gap-2 flex-wrap py-1">
          {chars.map((c, i) => (
            <div key={i} className="rounded-xl border-4 border-violet-200 bg-violet-50 px-3 py-2 text-center">
              <p className="text-xs font-bold text-violet-500 leading-tight">{syllables[i] || ""}</p>
              <p className="text-3xl font-extrabold text-stone-800 leading-tight">{c}</p>
            </div>
          ))}
        </div>
        <AudioButtons text={item.idiom} color="violet" className="mt-3" />
      </Card>
    );
  }

  function IdiomDetail({ item, onBack, onPractice }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-violet-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">{IDIOM_LEVEL_LABEL[item.level]}</span>
        </div>

        <CharacterPinyinCard item={item} />

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-1">意思</p>
          <p className="text-stone-700 leading-relaxed">{item.meaning}</p>
        </Card>

        {item.annotations && (
          <Card>
            <p className="text-sm font-extrabold text-stone-400 mb-2">難字讀音</p>
            <div className="flex flex-col gap-2">
              {item.annotations.map((a, i) => (
                <p key={i} className="text-sm text-stone-700">
                  <span className="font-extrabold text-violet-500">{a.term}</span>
                  {a.jyutping && <span className="text-violet-400 font-bold"> （粵音：{a.jyutping}）</span>}
                  {" — "}
                  {a.meaning}
                </p>
              ))}
            </div>
          </Card>
        )}

        {item.origin && (
          <Card>
            <p className="text-sm font-extrabold text-stone-400 mb-1">出處及故事</p>
            <p className="text-stone-700 leading-relaxed">{item.origin}</p>
          </Card>
        )}

        <Button color="violet" className="w-full" onClick={onPractice}>
          開始成語猜猜 🎲
        </Button>
      </div>
    );
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
      // A session always advances one 關卡 regardless of score — matches
      // the reference app, where finishing a level always progresses you.
      const beforeTier = getIdiomMasteryTier(priorStages);
      const afterTier = getIdiomMasteryTier(priorStages + 1);
      const leveledUp = afterTier.title !== beforeTier.title;
      return (
        <Card className="text-center">
          <p className="text-5xl mb-2">{leveledUp ? afterTier.emoji : "🎉"}</p>
          <h2 className="text-xl font-extrabold text-stone-800 mb-1">
            {leveledUp ? `恭喜！你晉升為「${afterTier.title}」了！` : "練習完成！"}
          </h2>
          <p className="text-lg font-bold text-violet-600 mb-4">
            答對了 {correctCount} / {questions.length} 題
          </p>
          <Button color="violet" className="w-full" onClick={() => onFinish(correctCount, questions.length)}>
            完成
          </Button>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-violet-600">
            ← 返回
          </button>
          <span className="text-sm font-extrabold text-stone-400">
            第 {qIndex + 1} / {questions.length} 題
          </span>
        </div>

        <Card>
          <QuestionBlock q={q} selected={selected} onSelect={selectOption} />
          {answered && (
            <Button color="violet" className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  function IdiomListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-violet-100 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-violet-50">🀄</div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-800 truncate">{item.idiom}</p>
          <p className="text-xs font-bold text-stone-400">{IDIOM_LEVEL_LABEL[item.level]}</p>
        </div>
      </button>
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
      return <IdiomDetail item={selectedItem} onBack={() => setView("list")} onPractice={() => startPractice(filtered)} />;
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-extrabold text-violet-600">
            ← 返回主頁
          </button>
          <span className="text-sm font-extrabold text-stone-400">成語學習</span>
        </div>

        <MasteryBadge stagesCompleted={priorStages} />

        <Card>
          <p className="text-sm font-extrabold text-stone-400 mb-2">程度</p>
          <div className="flex gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l.key}
                onClick={() => setFilterLevel(l.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
                  filterLevel === l.key
                    ? "bg-violet-400 border-violet-600 text-violet-950"
                    : "bg-white border-violet-100 text-violet-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button color="violet" className="w-full mt-3" onClick={() => startPractice(filtered)}>
            開始成語猜猜 🎲
          </Button>
          {mistakeItems.length > 0 && (
            <Button color="amber" className="w-full mt-2" onClick={() => startPractice(IDIOM_ITEMS, mistakeItems)}>
              練習錯題 ({mistakeItems.length}) 📝
            </Button>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <IdiomListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.IdiomModule = IdiomModule;
})();
