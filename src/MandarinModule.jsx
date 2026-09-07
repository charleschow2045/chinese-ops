// Module 4: 普通話練習 (standalone) — four activities: 聆聽 (listening, MC),
// 拼音默寫 (pinyin typing/writing, free text — allowed here per the design
// brief), 朗讀 (reading aloud) and 說話 (speaking), the latter two both using
// text-to-speech playback + speech recognition with an always-available
// manual fallback (recognition support/reliability varies a lot by browser).
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, FEEDBACK, TYPE } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.mandarin;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { SpeechUtils } = window.App;
  const { MANDARIN_ITEMS, MANDARIN_LEVEL_LABEL } = window.App.Content;

  const LEVEL_FILTERS = [
    { key: "all", label: "全部" },
    { key: "p5", label: "小五" },
    { key: "p6", label: "小六" },
    { key: "s1", label: "中一" },
  ];

  const ACTIVITIES = [
    { key: "listening", label: "聆聽練習", emoji: "🎧" },
    { key: "reading", label: "朗讀練習", emoji: "📖" },
    { key: "pinyin", label: "拼音默寫", emoji: "✍️" },
    { key: "speaking", label: "說話練習", emoji: "🗣️" },
    { key: "pinyinIME", label: "拼音輸入法", emoji: "⌨️" },
  ];

  const inputClass =
    "w-full text-center text-xl tracking-wide rounded-xl font-extrabold px-4 py-3 outline-none disabled:opacity-60";
  const inputStyle = { border: "1.5px solid #E9DFC7", backgroundColor: INK.paperCard, color: INK.ink };

  function withFallback(pool, kind, minCount) {
    const filtered = pool.filter((it) => it.kind === kind);
    return filtered.length >= minCount ? filtered : MANDARIN_ITEMS.filter((it) => it.kind === kind);
  }

  // ---- 聆聽練習 (Listening, multiple choice) ----
  function buildListeningQuestions(words, count) {
    const chosen = sampleWithRepeats(words, count);
    return chosen.map((item) => {
      const distractors = sampleOthers(words, item, 3, (it) => it.hanzi);
      const options = shuffle([item.hanzi, ...distractors]);
      return { item, options, correctIndex: options.indexOf(item.hanzi) };
    });
  }

  function ListeningDrill({ pool, onBack, onFinish }) {
    const words = withFallback(pool, "word", 4);
    const [voice, setVoice] = useState(null);
    const [questions] = useState(() => buildListeningQuestions(words, 6));
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
      SpeechUtils.getVoicesAsync().then((vs) => setVoice(SpeechUtils.pickMandarinVoice(vs)));
    }, []);

    const q = questions[qIndex];

    function playCurrent() {
      SpeechUtils.speak(q.item.hanzi, voice);
    }

    useEffect(() => {
      if (!done) playCurrent();
      // eslint-disable-next-line
    }, [qIndex, voice]);

    const answered = selected !== null;
    const isLast = qIndex === questions.length - 1;

    function selectOption(i) {
      if (answered) return;
      setSelected(i);
      if (i === q.correctIndex) setCorrectCount((c) => c + 1);
    }

    function handleNext() {
      if (isLast) setDone(true);
      else {
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

    const prompt = (
      <div>
        <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          請聽清楚，選出正確的字
        </p>
        <button
          onClick={playCurrent}
          className="rounded-xl font-extrabold px-4 py-2 mb-1"
          style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}`, color: ACCENT.solid }}
        >
          🔊 重播
        </button>
      </div>
    );

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
          <QuestionBlock q={{ ...q, prompt }} selected={selected} onSelect={selectOption} accent={ACCENT} />
          {answered && (
            <InkButton accent={ACCENT} className="w-full mt-4" onClick={handleNext}>
              {isLast ? "完成 🎉" : "下一題 →"}
            </InkButton>
          )}
        </PaperCard>
      </div>
    );
  }

  // ---- 拼音默寫 (Pinyin writing, free typing — tone marks not required) ----
  function PinyinDrill({ pool, onBack, onFinish }) {
    const words = withFallback(pool, "word", 4);
    const [questions] = useState(() => shuffle(words).slice(0, 6));
    const [qIndex, setQIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const q = questions[qIndex];
    const isLast = qIndex === questions.length - 1;

    function handleCheck() {
      if (checked || inputValue.trim().length === 0) return;
      const correct = SpeechUtils.normalizePinyin(inputValue) === SpeechUtils.normalizePinyin(q.pinyin);
      setIsCorrect(correct);
      setChecked(true);
      if (correct) setCorrectCount((c) => c + 1);
    }

    function handleNext() {
      if (isLast) setDone(true);
      else {
        setQIndex((x) => x + 1);
        setInputValue("");
        setChecked(false);
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
          <div className="text-center">
            <p className="text-6xl font-extrabold mb-1" style={{ color: INK.ink }}>
              {q.hanzi}
            </p>
            <p className="text-sm font-bold mb-4" style={{ color: INK.mutedInk }}>
              請輸入這個詞語的拼音（不需要輸入聲調）
            </p>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={checked}
            placeholder="例如：nihao"
            className={inputClass}
            style={inputStyle}
          />
          {!checked ? (
            <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleCheck} disabled={inputValue.trim().length === 0}>
              核對 ✓
            </InkButton>
          ) : (
            <>
              <p className="mt-3 font-extrabold" style={{ color: isCorrect ? FEEDBACK.correct.solid : FEEDBACK.incorrect.solid }}>
                {isCorrect ? "✅ 答對了，做得好！" : `💛 答錯了，正確拼音是：${q.pinyin}`}
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

  // ---- 拼音輸入法 (Pinyin IME tutorial + drill) ----
  // Added after user feedback asking for a section teaching how to type
  // Chinese via pinyin. Unlike 拼音默寫 (which only tests knowing a word's
  // pinyin spelling), this teaches the real IME mechanic: type the TONELESS
  // pinyin, then pick the correct character from a list of homophones
  // (同音字) that all share that exact spelling — the actual skill a pinyin
  // typing beginner needs, since many characters sound identical.
  function PinyinIMEIntro({ onBack, onStart }) {
    const { PINYIN_IME_BASICS, PINYIN_IME_INTRO, PINYIN_IME_EXAMPLE, PINYIN_IME_WHY_CANDIDATES } = window.App.Content;
    const basics = PINYIN_IME_BASICS;
    const ex = PINYIN_IME_EXAMPLE;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            拼音輸入法
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            什麼是拼音？
          </p>
          <p className={`leading-relaxed mb-3 ${TYPE.body}`} style={{ color: INK.ink }}>
            {basics.whatIsPinyin}
          </p>
          <p className={`leading-relaxed mb-3 ${TYPE.body}`} style={{ color: INK.ink }}>
            {basics.syllableStructure}
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {basics.examples.map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
              >
                <p className="font-extrabold" style={{ color: INK.ink }}>
                  {item.char}（{item.syllable}） ={" "}
                  <span style={{ color: ACCENT.solid }}>{item.initial}</span>（聲母） +{" "}
                  <span style={{ color: ACCENT.solid }}>{item.final}</span>（韻母）
                </p>
              </div>
            ))}
          </div>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {basics.toneNote}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {PINYIN_IME_INTRO}
          </p>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            例子
          </p>
          <div className="rounded-xl p-3" style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}>
            <p className="font-extrabold" style={{ color: INK.ink }}>
              輸入「{ex.pinyin}」 → 候選：{ex.candidates.join("／")}
            </p>
            <p className="text-sm mt-1" style={{ color: INK.mutedInk }}>
              {ex.note}
            </p>
          </div>
        </PaperCard>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-1 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            為什麼要選字？
          </p>
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {PINYIN_IME_WHY_CANDIDATES}
          </p>
        </PaperCard>

        <InkButton accent={ACCENT} className="w-full" onClick={onStart}>
          開始練習 🎯
        </InkButton>
      </div>
    );
  }

  function PinyinIMEDrill({ level, onBack, onFinish }) {
    const { PINYIN_IME_HOMOPHONE_ITEMS } = window.App.Content;
    const pool =
      level && level !== "all" ? PINYIN_IME_HOMOPHONE_ITEMS.filter((it) => it.level === level) : PINYIN_IME_HOMOPHONE_ITEMS;
    const items = pool.length >= 4 ? pool : PINYIN_IME_HOMOPHONE_ITEMS;

    const [questions] = useState(() => shuffle(items).slice(0, Math.min(8, items.length)));
    const [qIndex, setQIndex] = useState(0);
    const [stage, setStage] = useState("pinyin"); // pinyin | select
    const [inputValue, setInputValue] = useState("");
    const [pinyinChecked, setPinyinChecked] = useState(false);
    const [pinyinCorrect, setPinyinCorrect] = useState(false);
    const [candidateOptions, setCandidateOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const q = questions[qIndex];
    const isLast = qIndex === questions.length - 1;
    const totalSteps = questions.length * 2;

    function handleCheckPinyin() {
      if (pinyinChecked || inputValue.trim().length === 0) return;
      const correct = SpeechUtils.normalizePinyin(inputValue) === SpeechUtils.normalizePinyin(q.pinyin);
      setPinyinCorrect(correct);
      setPinyinChecked(true);
      if (correct) setCorrectCount((c) => c + 1);
    }

    function goToSelectStage() {
      setCandidateOptions(shuffle(q.candidates));
      setStage("select");
    }

    function selectCandidate(i) {
      if (selected !== null) return;
      setSelected(i);
      if (candidateOptions[i] === q.correct) setCorrectCount((c) => c + 1);
    }

    function handleNext() {
      if (isLast) {
        setDone(true);
      } else {
        setQIndex((x) => x + 1);
        setStage("pinyin");
        setInputValue("");
        setPinyinChecked(false);
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
            答對了 {correctCount} / {totalSteps} 步
          </p>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, totalSteps)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    const selectQ = {
      prompt: <p className="leading-relaxed">{q.clue}</p>,
      options: candidateOptions,
      correctIndex: candidateOptions.indexOf(q.correct),
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            第 {qIndex + 1} / {questions.length} 題 · {stage === "pinyin" ? "打拼音" : "選字"}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          {stage === "pinyin" ? (
            <>
              <p className="leading-relaxed mb-3" style={{ color: INK.ink }}>
                {q.clue}
              </p>
              <p className="text-sm font-bold mb-3" style={{ color: INK.mutedInk }}>
                請輸入空格中那個字的拼音（不需要輸入聲調）
              </p>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={pinyinChecked}
                placeholder="例如：ni"
                className={inputClass}
                style={inputStyle}
              />
              {!pinyinChecked ? (
                <InkButton
                  accent={ACCENT}
                  className="w-full mt-3"
                  onClick={handleCheckPinyin}
                  disabled={inputValue.trim().length === 0}
                >
                  核對 ✓
                </InkButton>
              ) : (
                <>
                  <p
                    className="mt-3 font-extrabold"
                    style={{ color: pinyinCorrect ? FEEDBACK.correct.solid : FEEDBACK.incorrect.solid }}
                  >
                    {pinyinCorrect ? "✅ 答對了！" : `💛 答錯了，正確拼音是：${q.pinyin}`}
                  </p>
                  <p className="text-sm mt-2" style={{ color: INK.mutedInk }}>
                    現在請從候選字中選出正確的字——這就是拼音輸入法實際運作的方式。
                  </p>
                  <InkButton accent={ACCENT} className="w-full mt-3" onClick={goToSelectStage}>
                    繼續 →
                  </InkButton>
                </>
              )}
            </>
          ) : (
            <>
              <QuestionBlock q={selectQ} selected={selected} onSelect={selectCandidate} accent={ACCENT} />
              {selected !== null && (
                <InkButton accent={ACCENT} className="w-full mt-4" onClick={handleNext}>
                  {isLast ? "完成 🎉" : "下一題 →"}
                </InkButton>
              )}
            </>
          )}
        </PaperCard>
      </div>
    );
  }

  // ---- 朗讀練習 / 說話練習 (shared: TTS model + speech recognition + manual fallback) ----
  function SpeechDrill({ pool, kind, minCount, title, instructionLabel, onBack, onFinish }) {
    const items = withFallback(pool, kind, minCount);
    const [list] = useState(() => shuffle(items).slice(0, Math.min(6, items.length)));
    const [voice, setVoice] = useState(null);
    const [index, setIndex] = useState(0);
    const [showPinyin, setShowPinyin] = useState(false);
    const [listening, setListening] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | correct | tryagain | manual
    const [message, setMessage] = useState("");
    const [attempted, setAttempted] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const recognitionSupported = SpeechUtils.isRecognitionSupported();

    useEffect(() => {
      SpeechUtils.getVoicesAsync().then((vs) => setVoice(SpeechUtils.pickMandarinVoice(vs)));
    }, []);

    const item = list[index];
    const isLast = index === list.length - 1;

    function playModel() {
      SpeechUtils.speak(item.hanzi, voice);
    }

    function markResult(isCorrectMatch) {
      setAttempted((a) => a + 1);
      if (isCorrectMatch) setCorrectCount((c) => c + 1);
      setStatus(isCorrectMatch ? "correct" : "tryagain");
    }

    async function startListening() {
      if (listening || !recognitionSupported) return;
      setMessage("");
      setStatus("idle");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        setMessage("無法取得麥克風權限，可以使用下面的按鈕確認你已朗讀。");
        return;
      }
      const rec = SpeechUtils.createRecognizer();
      if (!rec) {
        setMessage("這部裝置不支援語音辨識，可以使用下面的按鈕確認你已朗讀。");
        return;
      }
      let finished = false;
      const timeoutId = setTimeout(() => {
        if (finished) return;
        finished = true;
        setListening(false);
        setMessage("沒有聽到聲音，可以再試一次，或者使用下面的按鈕。");
      }, 7000);

      rec.onresult = (e) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        const transcript = e.results[0][0].transcript;
        const isMatch = SpeechUtils.normalizeHanzi(transcript).includes(SpeechUtils.normalizeHanzi(item.hanzi));
        setListening(false);
        markResult(isMatch);
      };
      rec.onerror = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        setListening(false);
        setMessage("語音辨識出現錯誤，可以再試一次，或者使用下面的按鈕。");
      };
      try {
        setListening(true);
        rec.start();
      } catch (e) {
        finished = true;
        clearTimeout(timeoutId);
        setListening(false);
        setMessage("未能開始錄音，可以使用下面的按鈕確認你已朗讀。");
      }
    }

    function manualConfirm() {
      setAttempted((a) => a + 1);
      setStatus("manual");
    }

    function handleNext() {
      if (isLast) setDone(true);
      else {
        setIndex((x) => x + 1);
        setStatus("idle");
        setMessage("");
        setShowPinyin(false);
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
            完成了 {attempted} 個，成功辨識 {correctCount} 個
          </p>
          <InkButton accent={ACCENT} className="w-full" onClick={() => onFinish(correctCount, attempted)}>
            完成
          </InkButton>
        </PaperCard>
      );
    }

    const answered = status !== "idle";
    const statusColor =
      status === "correct" ? FEEDBACK.correct.solid : status === "manual" ? ACCENT.solid : FEEDBACK.incorrect.solid;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {title} {index + 1} / {list.length}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {instructionLabel}
          </p>
          <div className="text-center mb-3">
            <p className="text-4xl font-extrabold mb-1" style={{ color: INK.ink }}>
              {item.hanzi}
            </p>
            {showPinyin && (
              <p className="text-sm font-bold" style={{ color: ACCENT.solid }}>
                {item.pinyin}
              </p>
            )}
            <button
              onClick={() => setShowPinyin((v) => !v)}
              className="text-xs font-extrabold underline mt-1"
              style={{ color: ACCENT.solid }}
            >
              {showPinyin ? "隱藏拼音" : "顯示拼音"}
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <InkButton accent={ACCENT} className="flex-1 !px-2 !py-2 !text-base" onClick={playModel}>
              🔊 播放示範
            </InkButton>
            <InkButton
              accent={ACCENT}
              className="flex-1 !px-2 !py-2 !text-base"
              onClick={startListening}
              disabled={listening || !recognitionSupported}
            >
              {listening ? "🎙️ 錄音中..." : "🎙️ 開始錄音"}
            </InkButton>
          </div>

          {!recognitionSupported && (
            <p className="text-xs mb-2" style={{ color: INK.mutedInk }}>
              這部裝置未必支援語音辨識，可以使用下面的按鈕確認你已朗讀。
            </p>
          )}
          {message && (
            <p className="text-xs mb-2" style={{ color: FEEDBACK.incorrect.solid }}>
              {message}
            </p>
          )}

          {!answered && (
            <button onClick={manualConfirm} className="text-sm font-extrabold underline" style={{ color: INK.mutedInk }}>
              我已經讀了（不使用錄音）
            </button>
          )}

          {answered && (
            <>
              <p className="font-extrabold" style={{ color: statusColor }}>
                {status === "correct" && "✅ 讀得好標準！"}
                {status === "tryagain" && "💛 與錄音不相符，可以再試一次！"}
                {status === "manual" && "👍 好，繼續加油！"}
              </p>
              <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleNext}>
                {isLast ? "完成 🎉" : "下一個 →"}
              </InkButton>
            </>
          )}
        </PaperCard>
      </div>
    );
  }

  function MandarinHome({ level, onBack, onOpenActivity }) {
    const [filterLevel, setFilterLevel] = useState(level || "all");

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回主頁
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            普通話練習
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
        </PaperCard>

        <div className="grid grid-cols-2 gap-3">
          {ACTIVITIES.map((a) => (
            <button
              key={a.key}
              onClick={() => onOpenActivity(a.key, filterLevel)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center active:translate-y-[2px] transition-all aspect-square"
              style={{
                backgroundColor: INK.paperCard,
                border: `1.5px solid ${ACCENT.tintBorder}`,
                boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 8px 18px -8px rgba(36,31,27,0.16)",
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: ACCENT.tint }}
              >
                {a.emoji}
              </div>
              <p className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
                {a.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function MandarinModule({ level, onBack, onRecordPractice }) {
    const [view, setView] = useState("home"); // home | listening | reading | pinyin | speaking | pinyinIMEIntro | pinyinIME
    const [filterLevel, setFilterLevel] = useState("all");

    function openActivity(key, chosenLevel) {
      setFilterLevel(chosenLevel);
      setView(key === "pinyinIME" ? "pinyinIMEIntro" : key);
    }

    function finish(correctCount, total) {
      onRecordPractice(correctCount, total);
      setView("home");
    }

    const pool = filterLevel === "all" ? MANDARIN_ITEMS : MANDARIN_ITEMS.filter((it) => it.level === filterLevel);

    if (view === "listening") return <ListeningDrill pool={pool} onBack={() => setView("home")} onFinish={finish} />;
    if (view === "pinyin") return <PinyinDrill pool={pool} onBack={() => setView("home")} onFinish={finish} />;
    if (view === "reading")
      return (
        <SpeechDrill
          pool={pool}
          kind="sentence"
          minCount={2}
          title="朗讀"
          instructionLabel="讀出以下句子，聽聽自己讀成怎樣"
          onBack={() => setView("home")}
          onFinish={finish}
        />
      );
    if (view === "speaking")
      return (
        <SpeechDrill
          pool={pool}
          kind="word"
          minCount={4}
          title="說話"
          instructionLabel="請跟着讀出這個詞語"
          onBack={() => setView("home")}
          onFinish={finish}
        />
      );
    if (view === "pinyinIMEIntro")
      return <PinyinIMEIntro onBack={() => setView("home")} onStart={() => setView("pinyinIME")} />;
    if (view === "pinyinIME")
      return <PinyinIMEDrill level={filterLevel} onBack={() => setView("pinyinIMEIntro")} onFinish={finish} />;

    return <MandarinHome level={level} onBack={onBack} onOpenActivity={openActivity} />;
  }

  window.App.MandarinModule = MandarinModule;
})();
