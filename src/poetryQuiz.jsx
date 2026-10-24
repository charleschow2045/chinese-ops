// 階段 9b-2 — question generation for 詩詞學習, kept free of any screen code (no JSX, no React) so that tests/poetry-quiz.test.js can
// run it in a node:vm sandbox thousands of times and check that every question has exactly one defensible answer. PoetryModule.jsx
// only turns the plain objects returned here into screens.
//
// Seven question kinds (a session is 15 questions; quizPlan.jsx deals them out in blocks of seven, each block a shuffle of all seven,
// so every kind appears at least twice, one kind a third time, in a random order and never the same kind twice in a row):
//   fill        填空       a whole poem with one line blanked, options = 4 lines                      (existing)
//   author      作者       《X》的作者是誰？                                                          (existing)
//   meaning     句意       first line shown, options = 4 paraphrases                                  (existing)
//   next-line   接下句     a line is shown, the child picks the line that directly follows it
//   line-title  詩句配詩題  a line is shown, the child picks the work it comes from
//   annotation  字詞註釋   a term of the 詞語註釋 is asked, options = 4 meanings
//   dynasty     朝代       the author's dynasty, options = 4 dynasties
//
// Rules that keep an answer unambiguous:
//  - "……" (the omission marker of a 節錄 poem) is never a stem, an answer or an option: only lines containing a Chinese character count.
//  - next-line: the stem and the answer are two neighbouring real lines of the same work; a stem line that occurs twice in its work is
//    skipped; a wrong line never belongs to the same work (so it cannot be a second true continuation).
//  - line-title: only a line that occurs exactly once in the whole library (lineCount) and does not contain its own title is asked; wrong
//    titles never share the answer's base title (憫農（其一）／（其二）) and are not named in the line.
//  - annotation: wrong meanings come from other terms, never share a word (bigram) with the right meaning, and prefer the same kind of
//    explanation (place / state / thing …) and a similar length so that the shape does not give the answer away.
//  - dynasty: wrong dynasties are other dynasties of the library; 春秋 and 戰國 are never offered together as right and wrong (the Analects
//    and Mencius are often grouped), and DYNASTY_BORDERS lists dynasties an author also lived in (陶淵明 晉／宋) which are never wrong options.
//    If the library had fewer than four dynasties the options are padded from COMMON_DYNASTIES (the library has six, so this is not used).
// Every question carries `itemId` (the work it was built from) so a wrong answer goes into 錯題本 as before.
window.App = window.App || {};

(function () {
  const { shuffle, sampleWithRepeats } = window.App.QuizUtils;
  const { planKinds } = window.App.QuizPlan;
  const { POETRY_ITEMS } = window.App.Content;

  const QUESTION_COUNT = 15;
  const KINDS = ["fill", "author", "meaning", "next-line", "line-title", "annotation", "dynasty"];
  // dynasties an author's life also touched; such a dynasty is never offered as a wrong option for that author
  const DYNASTY_BORDERS = { 陶淵明: ["宋"] };
  const DYNASTY_CLASH = [["春秋", "戰國"]];
  const COMMON_DYNASTIES = ["漢", "三國", "隋", "唐", "宋", "元", "明", "清"];

  // 節錄 poems use a "……" line to mark omitted text. Such a line is not a real line of the poem.
  const isRealLine = (l) => /[一-鿿]/.test(l);
  const titleKey = (t) => String(t).replace(/[（(].*?[）)]/g, "").trim();
  const titleParts = (t) => titleKey(t).split(/[·．\s]+/).filter((p) => p.length >= 2);

  // --- facts about the whole library (built once per library array) -------------------------------------------------------------
  const ctxCache = new WeakMap();
  function ctxFor(all) {
    let c = ctxCache.get(all);
    if (c) return c;
    const lineCount = new Map();
    all.forEach((p) =>
      p.lines.forEach((l) => {
        if (isRealLine(l)) lineCount.set(l, (lineCount.get(l) || 0) + 1);
      })
    );
    c = { lineCount, dynasties: Array.from(new Set(all.map((p) => p.dynasty).filter(Boolean))) };
    ctxCache.set(all, c);
    return c;
  }

  // --- stems --------------------------------------------------------------------------------------------------------------------
  const countIn = (arr, x) => arr.reduce((n, y) => n + (y === x ? 1 : 0), 0);
  // indexes i such that lines[i] and lines[i + 1] are two real, neighbouring lines and lines[i] occurs once in the work
  function nextLineStems(item) {
    const out = [];
    for (let i = 0; i + 1 < item.lines.length; i++) {
      const a = item.lines[i];
      const b = item.lines[i + 1];
      if (isRealLine(a) && isRealLine(b) && a !== b && countIn(item.lines, a) === 1 && countIn(item.lines, b) === 1) out.push(i);
    }
    return out;
  }
  // real lines that occur exactly once in the library and do not give the title away
  function titleStems(item, all) {
    const { lineCount } = ctxFor(all);
    const parts = titleParts(item.title);
    return item.lines.filter((l) => isRealLine(l) && lineCount.get(l) === 1 && !parts.some((p) => l.includes(p)));
  }
  const annotated = (item) => (item.annotations || []).filter((a) => a && a.term && a.meaning);

  // --- picking wrong options ------------------------------------------------------------------------------------------------------
  // `candidates` is a list of { value, score }; lower score is preferred, ties random. Returns up to n distinct values.
  function pickBest(cands, n, ok) {
    const sorted = shuffle(cands).sort((a, b) => a.score - b.score);
    const out = [];
    for (const c of sorted) {
      if (out.length >= n) break;
      if (out.some((o) => o === c.value) || (ok && !ok(c.value))) continue;
      out.push(c.value);
    }
    return out;
  }
  const lenGap = (a, b) => Math.min(6, Math.abs(a.length - b.length));
  // the closing punctuation of a line (，／。／？ …) — a wrong line that ends differently from the right one would give it away
  const endMark = (l) => (/[，。；？！、]$/.test(l) ? l.slice(-1) : "");

  // Wrong lines for next-line / fill: real lines of other works; same kind of work and similar length preferred, the asked pool before the
  // rest of the library. Never a line of the work itself.
  function wrongLines(pool, all, item, correct, n) {
    const own = new Set(item.lines);
    const inPool = new Set(pool.map((p) => p.id));
    const cands = [];
    all.forEach((p) => {
      if (p.id === item.id) return;
      p.lines.forEach((l) => {
        if (!isRealLine(l) || own.has(l) || l === correct) return;
        cands.push({ value: l, score: (inPool.has(p.id) ? 0 : 8) + (p.type === item.type ? 0 : 4) + lenGap(l, correct) + (endMark(l) === endMark(correct) ? 0 : 6) });
      });
    });
    return pickBest(cands, n);
  }

  const meaningKind = (m) => {
    if (/^同「/.test(m)) return "variant";
    if (/位於|地名|別稱|古稱|在今|一帶/.test(m)) return "place";
    if (/的樣子。?$/.test(m)) return "state";
    if (/^(一種|古代|古時)/.test(m)) return "thing";
    if (/^(形容|比喻)/.test(m)) return "figure";
    if (/^(指|即|傳說|相傳|用)/.test(m)) return "refer";
    return "word";
  };
  const STOP = /[，。；：、？！「」『』（）《》\s]/g;
  const bigrams = (s) => {
    const t = s.replace(STOP, "");
    const r = new Set();
    for (let i = 0; i + 2 <= t.length; i++) r.add(t.slice(i, i + 2));
    return r;
  };
  // Two explanations that share a two-character word (or, for very short ones, a character) could both be taken as right.
  function meaningsOverlap(a, b) {
    if (a === b) return true;
    const A = bigrams(a);
    for (const g of bigrams(b)) if (A.has(g)) return true;
    const ca = a.replace(STOP, "");
    const cb = b.replace(STOP, "");
    if (ca.length <= 2 || cb.length <= 2) for (const ch of ca) if (cb.includes(ch)) return true;
    return false;
  }

  function make(kind, item, extra, options, correct) {
    return Object.assign({ itemId: item.id, kind, title: item.title, author: item.author }, extra, { options, correctIndex: options.indexOf(correct) });
  }

  // --- the seven builders --------------------------------------------------------------------------------------------------------
  function buildFillBlankQuestion(pool, all, item) {
    const idxs = item.lines.map((l, i) => i).filter((i) => isRealLine(item.lines[i]));
    const blankIndex = idxs[Math.floor(Math.random() * idxs.length)];
    const correct = item.lines[blankIndex];
    const wrong = wrongLines(pool, all, item, correct, 3);
    return make("fill", item, { lines: item.lines, blankIndex }, shuffle([correct, ...wrong]), correct);
  }

  function buildAuthorQuestion(pool, all, item) {
    const authors = (list) => list.filter((p) => p.author !== item.author).map((p) => p.author);
    const wrong = [];
    for (const a of shuffle(authors(pool)).concat(shuffle(authors(all)))) {
      if (wrong.length >= 3) break;
      if (!wrong.includes(a)) wrong.push(a);
    }
    return make("author", item, { ask: `《${item.title}》的作者是誰？` }, shuffle([item.author, ...wrong]), item.author);
  }

  function buildMeaningQuestion(pool, all, item) {
    const meanings = (list) => list.filter((p) => p.id !== item.id && p.meaningQuiz && p.meaningQuiz !== item.meaningQuiz).map((p) => p.meaningQuiz);
    const wrong = [];
    for (const m of shuffle(meanings(pool)).concat(shuffle(meanings(all)))) {
      if (wrong.length >= 3) break;
      if (!wrong.includes(m)) wrong.push(m);
    }
    return make("meaning", item, { stem: item.lines.find(isRealLine), ask: "……這句的意思最貼近以下哪一項？" }, shuffle([item.meaningQuiz, ...wrong]), item.meaningQuiz);
  }

  function buildNextLineQuestion(pool, all, item) {
    const stems = nextLineStems(item);
    const i = stems[Math.floor(Math.random() * stems.length)];
    const correct = item.lines[i + 1];
    const wrong = wrongLines(pool, all, item, correct, 3);
    return make("next-line", item, { stem: item.lines[i], ask: "下一句是哪一句？" }, shuffle([correct, ...wrong]), correct);
  }

  function buildLineTitleQuestion(pool, all, item) {
    const stems = titleStems(item, all);
    const stem = stems[Math.floor(Math.random() * stems.length)];
    const key = titleKey(item.title);
    const inPool = new Set(pool.map((p) => p.id));
    const cands = all
      .filter((p) => p.id !== item.id && titleKey(p.title) !== key && !titleParts(p.title).some((part) => stem.includes(part)))
      .map((p) => ({ value: p.title, score: (inPool.has(p.id) ? 0 : 8) + (p.type === item.type ? 0 : 4) }));
    const wrong = pickBest(cands, 3);
    const label = (t) => `《${t}》`;
    return make("line-title", item, { stem, ask: "這一句出自哪一篇作品？" }, shuffle([item.title, ...wrong]).map(label), label(item.title));
  }

  function buildAnnotationQuestion(pool, all, item) {
    const ann = annotated(item);
    const a0 = ann[Math.floor(Math.random() * ann.length)];
    // meanings are shown without a closing 。 (only some entries have one, which would give the answer away)
    const a = { term: a0.term, meaning: a0.meaning.replace(/。$/, "") };
    const inPool = new Set(pool.map((p) => p.id));
    const kind = meaningKind(a.meaning);
    const cands = [];
    all.forEach((p) =>
      annotated(p).forEach((b0) => {
        const b = { term: b0.term, meaning: b0.meaning.replace(/。$/, "") };
        if (b.term === a.term || meaningsOverlap(a.meaning, b.meaning) || b.meaning.includes(a.term) || a.meaning.includes(b.term)) return;
        cands.push({ value: b.meaning, score: (inPool.has(p.id) ? 0 : 6) + (meaningKind(b.meaning) === kind ? 0 : 5) + lenGap(a.meaning, b.meaning) / 2 });
      })
    );
    // wrong meanings must not overlap each other's wording either (two near-identical wrong options look odd, not ambiguous — still avoided)
    const wrong = [];
    for (const c of shuffle(cands).sort((x, y) => x.score - y.score)) {
      if (wrong.length >= 3) break;
      if (wrong.some((w) => meaningsOverlap(w, c.value))) continue;
      wrong.push(c.value);
    }
    const context = item.lines.find((l) => l.includes(a.term)) || null;
    return make("annotation", item, { term: a.term, stem: context, ask: `在《${item.title}》中，「${a.term}」是什麼意思？` }, shuffle([a.meaning, ...wrong]), a.meaning);
  }

  const clash = (a, b) => DYNASTY_CLASH.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  function buildDynastyQuestion(pool, all, item) {
    const { dynasties } = ctxFor(all);
    const banned = (d) => d === item.dynasty || clash(d, item.dynasty) || (DYNASTY_BORDERS[item.author] || []).includes(d);
    const wrong = shuffle(dynasties.filter((d) => !banned(d))).slice(0, 3);
    for (const d of shuffle(COMMON_DYNASTIES)) {
      if (wrong.length >= 3) break;
      if (!banned(d) && !wrong.includes(d)) wrong.push(d);
    }
    return make("dynasty", item, { ask: `《${item.title}》的作者是「${item.author}」。這位作者生活在哪一個朝代？` }, shuffle([item.dynasty, ...wrong]), item.dynasty);
  }

  function eligibleFor(all) {
    return (kind, item) => {
      switch (kind) {
        case "next-line":
          return nextLineStems(item).length > 0;
        case "line-title":
          return titleStems(item, all).length > 0;
        case "annotation":
          return annotated(item).length > 0;
        case "dynasty":
          return !!item.dynasty;
        case "meaning":
          return !!item.meaningQuiz && item.lines.some(isRealLine);
        case "fill":
          return item.lines.some(isRealLine);
        default:
          return !!item.author;
      }
    };
  }

  // `chooseFrom` (defaults to `pool`) is the set of works actually asked about; `pool` supplies the wrong options (topped up from `all`,
  // the whole library). This split lets 練習錯題 / the 戰爭詩詞 scope work without running short of plausible wrong options.
  function buildQuestions(pool, count, chooseFrom, allItems) {
    const all = allItems || POETRY_ITEMS;
    const n = count || QUESTION_COUNT;
    const source = chooseFrom && chooseFrom.length ? chooseFrom : pool;
    const chosen = sampleWithRepeats(source, n);
    const plan = planKinds(chosen, KINDS, eligibleFor(all));
    return plan.map(({ kind, item }) => {
      switch (kind) {
        case "author":
          return buildAuthorQuestion(pool, all, item);
        case "meaning":
          return buildMeaningQuestion(pool, all, item);
        case "next-line":
          return buildNextLineQuestion(pool, all, item);
        case "line-title":
          return buildLineTitleQuestion(pool, all, item);
        case "annotation":
          return buildAnnotationQuestion(pool, all, item);
        case "dynasty":
          return buildDynastyQuestion(pool, all, item);
        default:
          return buildFillBlankQuestion(pool, all, item);
      }
    });
  }

  window.App.PoetryQuiz = { QUESTION_COUNT, KINDS, buildQuestions, isRealLine, titleKey, titleParts, nextLineStems, titleStems, meaningsOverlap, meaningKind };
})();
