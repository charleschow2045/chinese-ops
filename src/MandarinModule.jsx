// Module 4: 普通話練習 (standalone) — four activities: 聆聽 (listening, MC),
// 拼音默寫 (pinyin typing/writing, free text — allowed here per the design
// brief), 朗讀 (reading aloud) and 說話 (speaking), the latter two both using
// text-to-speech playback + speech recognition with an always-available
// manual fallback (recognition support/reliability varies a lot by browser).
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
  const { PaperCard, InkButton, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS, useScrollToTop, A2SegControl } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.mandarin;
  const { QuestionBlock } = window.App.QuizQuestion;
  const { shuffle, sampleOthers, sampleWithRepeats } = window.App.QuizUtils;
  const { SpeechUtils } = window.App;
  const { MANDARIN_ITEMS } = window.App.Content;

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

  function withFallback(pool, kind, minCount) {
    const filtered = pool.filter((it) => it.kind === kind);
    return filtered.length >= minCount ? filtered : MANDARIN_ITEMS.filter((it) => it.kind === kind);
  }

  // ---------------------------------------------------------------------
  // A2 screens. UI text is A2.font; hanzi are serif; pinyin (with tone marks) uses a
  // CJK-capable sans so ā á ǎ à ǖ… render; text >= 13 px; every pressable >= 44 px; all 6 back buttons are A2BackButton.
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };
  const A2_BODY = { fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 };
  const A2_NOTE = { fontSize: 14, color: A2.sub, margin: 0, lineHeight: 1.6 };
  const A2_PINYIN_FONT = '"Noto Sans TC","PingFang HK","PingFang TC","Hiragino Sans GB",system-ui,sans-serif';
  const A2_INPUT = {
    width: "100%",
    minHeight: 56,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.04em",
    borderRadius: 16,
    border: `2px solid ${A2.rowBd}`,
    background: "#fff",
    color: A2.ink,
    fontFamily: A2_PINYIN_FONT,
    padding: "8px 16px",
    outline: "none",
  };
  const A2_PILL = { minHeight: 48, borderRadius: 999, border: 0, background: A2.segTrack, color: A2.accD, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer", padding: "0 20px" };

  function A2Section({ title, children }) {
    return (
      <PaperCard>
        {title && <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>{title}</h3>}
        {children}
      </PaperCard>
    );
  }

  function A2TopBar({ backLabel, onBack, right }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <A2BackButton label={backLabel} onClick={onBack} />
        <span style={{ fontSize: 14, fontWeight: 900, color: A2.sub, textAlign: "right" }}>{right}</span>
      </div>
    );
  }

  function A2Done({ text, onFinish }) {
    return (
      <div style={{ fontFamily: A2.font }}>
        <PaperCard className="text-center">
          <p className="text-5xl mb-2">🎉</p>
          <h2 style={{ ...A2_LABEL, fontSize: 22, marginBottom: 4 }}>練習完成！</h2>
          <p style={{ fontSize: 18, fontWeight: 900, color: A2.accD, margin: "0 0 16px" }}>{text}</p>
          <InkButton accent={ACCENT} className="w-full" onClick={onFinish}>
            完成
          </InkButton>
        </PaperCard>
      </div>
    );
  }

  function A2Feedback({ ok, children }) {
    return (
      <p style={{ padding: "10px 14px", borderRadius: 14, fontSize: 16, fontWeight: 900, margin: "12px 0 0", lineHeight: 1.6, background: ok ? A2.rowDone : A2.todayBg, color: ok ? A2.ok : A2.todayInk }}>
        {children}
      </p>
    );
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

    if (done) return <A2Done text={`答對了 ${correctCount} / ${questions.length} 題`} onFinish={() => onFinish(correctCount, questions.length)} />;
    const a2prompt = (
      <div>
        <p style={{ ...A2_NOTE, marginBottom: 8 }}>請聽清楚，選出正確的字</p>
        <button onClick={playCurrent} style={A2_PILL}>
          🔊 重播
        </button>
      </div>
    );
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2TopBar backLabel="← 返回" onBack={onBack} right={`第 ${qIndex + 1} / ${questions.length} 題`} />
        <PaperCard>
          <QuestionBlock q={{ ...q, prompt: a2prompt }} selected={selected} onSelect={selectOption} accent={ACCENT} />
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

    if (done) return <A2Done text={`答對了 ${correctCount} / ${questions.length} 題`} onFinish={() => onFinish(correctCount, questions.length)} />;
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2TopBar backLabel="← 返回" onBack={onBack} right={`第 ${qIndex + 1} / ${questions.length} 題`} />
        <PaperCard>
          <div className="text-center">
            <p className="font-serif" style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.2, color: A2.ink, margin: 0 }}>
              {q.hanzi}
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: A2.sub, margin: "4px 0 16px", lineHeight: 1.6 }}>請輸入這個詞語的拼音（不需要輸入聲調）</p>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={checked}
            placeholder="例如：nihao"
            aria-label="輸入拼音"
            style={{ ...A2_INPUT, opacity: checked ? 0.6 : 1 }}
          />
          {!checked ? (
            <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleCheck} disabled={inputValue.trim().length === 0}>
              核對 ✓
            </InkButton>
          ) : (
            <>
              <A2Feedback ok={isCorrect}>
                {isCorrect ? "✅ 答對了，做得好！" : <>💛 答錯了，正確拼音是：<span style={{ fontFamily: A2_PINYIN_FONT, fontSize: 18 }}>{q.pinyin}</span></>}
              </A2Feedback>
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
  // 常用字拼音練習: tap a character to see its pinyin with the tone mark,
  // the tone name, and what to type on the keyboard (no tone marks).
  const TONE_NAMES = { 1: "第一聲（陰平）", 2: "第二聲（陽平）", 3: "第三聲（上聲）", 4: "第四聲（去聲）" };
  function toneOf(py) {
    if (/[āēīōūǖ]/.test(py)) return 1;
    if (/[áéíóúǘ]/.test(py)) return 2;
    if (/[ǎěǐǒǔǚ]/.test(py)) return 3;
    if (/[àèìòùǜ]/.test(py)) return 4;
    return 0;
  }
  function typedForm(py) {
    return py.replace(/[ǖǘǚǜ]/g, "v").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function PinyinCharLookup() {
    const { PINYIN_IME_CHARS } = window.App.Content;
    const [selected, setSelected] = useState(null);
    const item = PINYIN_IME_CHARS.find((c) => c.char === selected);
    return (
      <A2Section title={`常用字拼音練習（${PINYIN_IME_CHARS.length} 個字）`}>
        <p style={{ ...A2_NOTE, marginBottom: 12 }}>先自己讀一讀，再點一個字，核對它的拼音和聲調。</p>
        <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))", gap: 6 }}>
          {PINYIN_IME_CHARS.map((c) => {
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
                  ...(on ? { background: A2.segOn, color: "#fff", border: `1.5px solid ${A2.accD}` } : { background: A2.row, color: A2.ink, border: `1.5px solid ${A2.rowBd}` }),
                }}
              >
                {c.char}
              </button>
            );
          })}
        </div>
        {item && (
          <div className="text-center" style={{ padding: 12, borderRadius: 14, background: "#fff", border: `1.5px solid ${A2.rowBd}` }}>
            <p className="font-serif" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.2, color: A2.ink, margin: 0 }}>
              {item.char}
            </p>
            <p style={{ fontSize: 32, fontWeight: 900, color: A2.accD, margin: "4px 0 0", fontFamily: A2_PINYIN_FONT }}>{item.pinyin}</p>
            <p style={{ ...A2_NOTE, marginTop: 4 }}>
              {TONE_NAMES[toneOf(item.pinyin)]}・打字時輸入：<span style={{ fontFamily: A2_PINYIN_FONT }}>{typedForm(item.pinyin)}</span>
            </p>
          </div>
        )}
      </A2Section>
    );
  }
  function PinyinIMEIntro({ onBack, onStart }) {
    const { PINYIN_IME_BASICS, PINYIN_IME_INTRO, PINYIN_IME_EXAMPLE, PINYIN_IME_WHY_CANDIDATES } = window.App.Content;
    const basics = PINYIN_IME_BASICS;
    const ex = PINYIN_IME_EXAMPLE;
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <div className="flex items-center gap-2">
            <A2ModuleIcon moduleKey="mandarin" size={44} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0 }}>拼音輸入法</h1>
          </div>
        </div>

        <A2Section title="什麼是拼音？">
          <p style={{ ...A2_BODY, marginBottom: 12 }}>{basics.whatIsPinyin}</p>
          <p style={{ ...A2_BODY, marginBottom: 12 }}>{basics.syllableStructure}</p>
          <div className="flex flex-col gap-2 mb-3">
            {basics.examples.map((item, i) => (
              <div key={i} className="text-center" style={{ padding: 12, borderRadius: 14, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
                <p style={{ ...A2_BODY, fontWeight: 900 }}>
                  <span className="font-serif">{item.char}</span>（<span style={{ fontFamily: A2_PINYIN_FONT }}>{item.syllable}</span>） ={" "}
                  <span style={{ color: A2.accD, fontFamily: A2_PINYIN_FONT }}>{item.initial}</span>（聲母） +{" "}
                  <span style={{ color: A2.accD, fontFamily: A2_PINYIN_FONT }}>{item.final}</span>（韻母）
                </p>
              </div>
            ))}
          </div>
          <p style={A2_BODY}>{basics.toneNote}</p>
        </A2Section>

        <PaperCard>
          <p style={A2_BODY}>{PINYIN_IME_INTRO}</p>
        </PaperCard>

        <A2Section title="例子">
          <div style={{ padding: 12, borderRadius: 14, background: A2.row, border: `1.5px solid ${A2.rowBd}` }}>
            <p style={{ ...A2_BODY, fontWeight: 900 }}>
              輸入「<span style={{ fontFamily: A2_PINYIN_FONT }}>{ex.pinyin}</span>」 → 候選：<span className="font-serif">{ex.candidates.join("／")}</span>
            </p>
            <p className="mt-1" style={A2_NOTE}>
              {ex.note}
            </p>
          </div>
        </A2Section>

        <A2Section title="為什麼要選字？">
          <p style={A2_BODY}>{PINYIN_IME_WHY_CANDIDATES}</p>
        </A2Section>

        <PinyinCharLookup />

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

    if (done) return <A2Done text={`答對了 ${correctCount} / ${totalSteps} 步`} onFinish={() => onFinish(correctCount, totalSteps)} />;
    const a2SelectQ = {
      prompt: (
        <p className="font-serif" style={{ fontSize: 18, lineHeight: 1.8, margin: 0 }}>
          {q.clue}
        </p>
      ),
      options: candidateOptions,
      correctIndex: candidateOptions.indexOf(q.correct),
    };
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2TopBar backLabel="← 返回" onBack={onBack} right={`第 ${qIndex + 1} / ${questions.length} 題 · ${stage === "pinyin" ? "打拼音" : "選字"}`} />
        <PaperCard>
          {stage === "pinyin" ? (
            <>
              <p className="font-serif" style={{ fontSize: 18, lineHeight: 1.8, color: A2.ink, margin: "0 0 12px" }}>
                {q.clue}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: A2.sub, margin: "0 0 12px", lineHeight: 1.6 }}>請輸入空格中那個字的拼音（不需要輸入聲調）</p>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={pinyinChecked}
                placeholder="例如：ni"
                aria-label="輸入拼音"
                style={{ ...A2_INPUT, opacity: pinyinChecked ? 0.6 : 1 }}
              />
              {!pinyinChecked ? (
                <InkButton accent={ACCENT} className="w-full mt-3" onClick={handleCheckPinyin} disabled={inputValue.trim().length === 0}>
                  核對 ✓
                </InkButton>
              ) : (
                <>
                  <A2Feedback ok={pinyinCorrect}>
                    {pinyinCorrect ? "✅ 答對了！" : <>💛 答錯了，正確拼音是：<span style={{ fontFamily: A2_PINYIN_FONT, fontSize: 18 }}>{q.pinyin}</span></>}
                  </A2Feedback>
                  <p className="mt-2" style={A2_NOTE}>
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
              <QuestionBlock q={a2SelectQ} selected={selected} onSelect={selectCandidate} accent={ACCENT} />
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

    if (done) return <A2Done text={`完成了 ${attempted} 個，成功辨識 ${correctCount} 個`} onFinish={() => onFinish(correctCount, attempted)} />;
    const a2Answered = status !== "idle";
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2TopBar backLabel="← 返回" onBack={onBack} right={`${title} ${index + 1} / ${list.length}`} />
        <PaperCard>
          <p style={{ ...A2_NOTE, marginBottom: 8 }}>{instructionLabel}</p>
          <div className="text-center mb-3">
            <p className="font-serif" style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.45, color: A2.ink, margin: "0 0 4px" }}>
              {item.hanzi}
            </p>
            {showPinyin && (
              <p style={{ fontSize: 18, fontWeight: 900, color: A2.accD, margin: "0 0 4px", fontFamily: A2_PINYIN_FONT, lineHeight: 1.6 }}>{item.pinyin}</p>
            )}
            <button onClick={() => setShowPinyin((v) => !v)} aria-pressed={showPinyin} style={{ ...A2_PILL, marginTop: 4 }}>
              {showPinyin ? "隱藏拼音" : "顯示拼音"}
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <InkButton accent={ACCENT} className="flex-1 !px-2 !py-2 !text-base" onClick={playModel}>
              🔊 播放示範
            </InkButton>
            <InkButton accent={ACCENT} className="flex-1 !px-2 !py-2 !text-base" onClick={startListening} disabled={listening || !recognitionSupported}>
              {listening ? "🎙️ 錄音中..." : "🎙️ 開始錄音"}
            </InkButton>
          </div>

          {!recognitionSupported && (
            <p className="mb-2" style={A2_NOTE}>
              這部裝置未必支援語音辨識，可以使用下面的按鈕確認你已朗讀。
            </p>
          )}
          {message && (
            <p className="mb-2" style={{ ...A2_NOTE, color: A2.hotInk, fontWeight: 700 }}>
              {message}
            </p>
          )}

          {!a2Answered && (
            <button onClick={manualConfirm} className="w-full" style={{ ...A2_PILL, color: A2.sub }}>
              我已經讀了（不使用錄音）
            </button>
          )}

          {a2Answered && (
            <>
              <A2Feedback ok={status === "correct" || status === "manual"}>
                {status === "correct" && "✅ 讀得好標準！"}
                {status === "tryagain" && "💛 與錄音不相符，可以再試一次！"}
                {status === "manual" && "👍 好，繼續加油！"}
              </A2Feedback>
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

    const m = MODULE_ICONS.mandarin;
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回主頁" onClick={onBack} />
          <div className="flex items-center gap-2">
            <A2ModuleIcon moduleKey="mandarin" size={44} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0 }}>普通話練習</h1>
          </div>
        </div>

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>程度</h2>
          <A2SegControl options={LEVEL_FILTERS} value={filterLevel} onChange={setFilterLevel} label="程度" />
        </PaperCard>

        <div className="grid grid-cols-2 gap-3">
          {ACTIVITIES.map((a) => (
            <button
              key={a.key}
              onClick={() => onOpenActivity(a.key, filterLevel)}
              className="flex flex-col items-center justify-center gap-2 text-center active:translate-y-[2px] transition-all"
              style={{ minHeight: 128, padding: 14, borderRadius: 22, background: A2.glass, border: `1px solid ${A2.glassBd}`, boxShadow: A2.shadow, color: A2.ink, fontFamily: A2.font, cursor: "pointer" }}
            >
              <div aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 18, background: m.tint, border: `1px solid ${m.tintBorder}`, fontSize: 28 }}>
                {a.emoji}
              </div>
              <span style={{ fontSize: 16, fontWeight: 900 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function MandarinModule({ level, onBack, onRecordPractice }) {
    const [view, setView] = useState("home"); // home | listening | reading | pinyin | speaking | pinyinIMEIntro | pinyinIME
    useScrollToTop(view);
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
