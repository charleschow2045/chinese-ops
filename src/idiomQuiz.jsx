// 階段 9b-1 — question generation for 成語學習, kept free of any screen code (no JSX, no React) so that tests/idiom-quiz.test.js can
// run it in a node:vm sandbox thousands of times and check that every question has exactly one defensible answer. IdiomModule.jsx
// only turns the plain objects returned here into screens.
//
// Five question kinds are used in a random order (a session is 15 questions, 3 of each kind — see quizPlan.jsx):
//   clue        成語猜猜   `clue` shown, options = 4 idioms
//   meaning     「X」是什麼意思？  options = 4 meanings
//   fill-char   填字砌成語  one character blanked, options = 4 characters
//   story       故事猜成語  `origin` shown (only idioms that have one), options = 4 idioms
//   true-false  是非判斷   「X」的意思是「Y」。這個說法正確嗎？ options = 正確 / 不正確
//
// Rules that keep an answer unambiguous:
//  - two idioms are "related" when they sit in a common IDIOM_SYNONYM_GROUPS group, or their `meaning` texts are very alike
//    (meaningsSimilar, an automatic guard for pairs the list does not name). A wrong option is never related to the right answer; a
//    false 是非題 claim never uses the meaning of a related idiom.
//  - a story question is only built from an idiom whose `origin` does not give the idiom away (no whole idiom, no 3 consecutive
//    characters of it), and its wrong options never come from the same story (no shared 3-character run in the two `origin` texts,
//    and the wrong idiom does not appear in the origin).
//  - an item that cannot be asked in some kind (e.g. no `origin`) is moved to another slot or asked in another kind (quizPlan.jsx).
// Every question carries `itemId` so a wrong answer goes into 錯題本 as before.
window.App = window.App || {};

(function () {
  const { shuffle, sampleWithRepeats } = window.App.QuizUtils;
  const { planKinds, trueFalseFlags } = window.App.QuizPlan;
  const { IDIOM_ITEMS, IDIOM_SYNONYM_GROUPS } = window.App.Content;

  const QUESTION_COUNT = 15;
  const KINDS = ["clue", "meaning", "fill-char", "story", "true-false"];
  // 成語稱號 is counted in "stages" of 8 answered questions (this was the session length before 階段 9b). Sessions are 15 questions now,
  // but progress is still derived from practiceStats.attempts with the old unit, so nobody's existing 稱號 goes down.
  const STAGE_SIZE = 8;

  const stagesFromAttempts = (attempts) => Math.floor(Math.max(0, Number(attempts) || 0) / STAGE_SIZE);
  // How many more 15-question sessions are needed to reach `minStages` stages.
  const sessionsToReach = (attempts, minStages) => Math.max(1, Math.ceil((minStages * STAGE_SIZE - (Number(attempts) || 0)) / QUESTION_COUNT));

  // --- relatedness ------------------------------------------------------------------------------------------------------------
  const GROUPS_OF = {}; // idiom text -> array of group indexes
  (IDIOM_SYNONYM_GROUPS || []).forEach((g, gi) => {
    g.forEach((text) => {
      (GROUPS_OF[text] = GROUPS_OF[text] || []).push(gi);
    });
  });
  const inSameGroup = (a, b) => {
    const ga = GROUPS_OF[a.idiom];
    const gb = GROUPS_OF[b.idiom];
    return !!(ga && gb && ga.some((x) => gb.includes(x)));
  };

  const cleanMeaning = (s) =>
    String(s || "")
      .replace(/^(形容|比喻|指|表示|泛指|原指|原形容)/, "")
      .replace(/(形容|比喻|也作|或|後|的|了|在|是|不|有|和|而|與|以|使|把|被|就|都|並|也|又|很|非常|十分|極其|極|相|地|着|一個|人|事情|事物)/g, "")
      .replace(/[，。；：、？！「」『』（）《》\s]/g, "");
  const grams = (s, n) => {
    const r = new Set();
    for (let i = 0; i + n <= s.length; i++) r.add(s.slice(i, i + n));
    return r;
  };
  const meaningCache = {};
  const meaningGrams = (item) => meaningCache[item.id] || (meaningCache[item.id] = grams(cleanMeaning(item.meaning), 2));
  const PUNCT = /[，。；：、？！「」『』（）《》\s]/g;
  const originCache = {};
  const originGrams = (item) => originCache[item.id] || (originCache[item.id] = grams(String(item.origin || "").replace(PUNCT, ""), 3));

  // Automatic guard: meanings that are worded alike (bigram Jaccard >= 0.2 and at least two shared bigrams) can be taken for each other.
  function meaningsSimilar(a, b) {
    if (a.meaning === b.meaning) return true;
    const A = meaningGrams(a);
    const B = meaningGrams(b);
    let shared = 0;
    A.forEach((g) => {
      if (B.has(g)) shared++;
    });
    const union = A.size + B.size - shared;
    return shared >= 2 && union > 0 && shared / union >= 0.2;
  }

  const related = (a, b) => a.id === b.id || a.idiom === b.idiom || inSameGroup(a, b) || meaningsSimilar(a, b);

  // --- story helpers ----------------------------------------------------------------------------------------------------------
  // An origin may be used as a question stem when it does not give its own idiom away.
  const usableCache = {};
  function storyUsable(item) {
    if (!item.origin) return false;
    if (usableCache[item.id] !== undefined) return usableCache[item.id];
    const o = item.origin;
    let ok = !o.includes(item.idiom);
    if (ok) for (const g of grams(item.idiom, 3)) if (o.includes(g)) ok = false;
    return (usableCache[item.id] = ok);
  }
  // Two idioms are about the same story when their origins share a run of three characters, or one is named in the other's origin.
  function sameStory(a, b) {
    if (b.origin && b.origin.includes(a.idiom)) return true;
    if (a.origin && a.origin.includes(b.idiom)) return true;
    if (!a.origin || !b.origin) return false;
    const A = originGrams(a);
    for (const g of originGrams(b)) if (A.has(g)) return true;
    return false;
  }

  // --- picking wrong options ----------------------------------------------------------------------------------------------------
  // Up to `n` wrong idioms: from `pool` first (shuffled), topped up from every idiom. Never related to `item`; `extra(c)` may veto more.
  function pickWrongIdioms(pool, item, n, extra, chosenPrefer) {
    const ok = (c) => !related(item, c) && (!extra || extra(c));
    const out = [];
    const seenText = new Set([item.idiom]);
    const take = (list) => {
      for (const c of shuffle(list)) {
        if (out.length >= n) return;
        if (seenText.has(c.idiom) || !ok(c)) continue;
        seenText.add(c.idiom);
        out.push(c);
      }
    };
    if (chosenPrefer) take(pool.filter(chosenPrefer));
    take(pool);
    take(IDIOM_ITEMS);
    return out;
  }

  const IDIOM_TEXTS = new Set(IDIOM_ITEMS.map((it) => it.idiom));

  function make(kind, item, label, text, ask, options, correct) {
    return { itemId: item.id, kind, label, text, ask, options, correctIndex: options.indexOf(correct) };
  }

  function buildClueQuestion(pool, item) {
    const wrong = pickWrongIdioms(pool, item, 3).map((c) => c.idiom);
    return make("clue", item, "成語猜猜 — 根據提示猜出成語", item.clue, null, shuffle([item.idiom, ...wrong]), item.idiom);
  }

  function buildMeaningQuestion(pool, item) {
    const wrong = pickWrongIdioms(pool, item, 3).map((c) => c.meaning);
    return make("meaning", item, null, null, `「${item.idiom}」是什麼意思？`, shuffle([item.meaning, ...wrong]), item.meaning);
  }

  function buildFillCharQuestion(pool, item) {
    const charIndex = Math.floor(Math.random() * item.idiom.length);
    const correct = item.idiom[charIndex];
    const fills = (ch) => item.idiom.slice(0, charIndex) + ch + item.idiom.slice(charIndex + 1);
    // a wrong character must not turn the blank into another real idiom
    const otherChars = Array.from(new Set(pool.filter((it) => it.id !== item.id).flatMap((it) => it.idiom.split("")))).filter(
      (c) => c !== correct && !IDIOM_TEXTS.has(fills(c))
    );
    const wrong = shuffle(otherChars).slice(0, 3);
    const blanked = item.idiom
      .split("")
      .map((c, i) => (i === charIndex ? "▁" : c))
      .join("");
    return make("fill-char", item, "填字砌成語 — 哪一個字才是正確的？", blanked, null, shuffle([correct, ...wrong]), correct);
  }

  function buildStoryQuestion(pool, item) {
    const inPool = new Set(pool);
    const wrong = pickWrongIdioms(IDIOM_ITEMS, item, 3, (c) => !sameStory(item, c), (c) => inPool.has(c)).map((c) => c.idiom);
    return make("story", item, "故事猜成語 — 這個故事和哪個成語有關？", item.origin, null, shuffle([item.idiom, ...wrong]), item.idiom);
  }

  // 是非題: the stated meaning is the idiom's own (wantTrue) or the meaning of an idiom that is not related to it, preferring the same level.
  function buildTrueFalseQuestion(pool, item, wantTrue) {
    let meaning = item.meaning;
    if (!wantTrue) {
      const other = pickWrongIdioms(pool, item, 1, null, (c) => c.level === item.level)[0];
      meaning = other.meaning;
    }
    const claim = meaning.replace(/[。；]$/, "");
    return make("true-false", item, "是非判斷", null, `「${item.idiom}」的意思是「${claim}」。這個說法正確嗎？`, ["正確", "不正確"], wantTrue ? "正確" : "不正確");
  }

  const eligible = (kind, item) => (kind === "story" ? storyUsable(item) : true);

  // `chooseFrom` (defaults to `pool`) is the set of idioms actually asked about; `pool` supplies the wrong options. This split lets 練習錯題
  // ask about only the mistaken idioms without shrinking the pool of wrong options.
  function buildQuestions(pool, count, chooseFrom) {
    const n = count || QUESTION_COUNT;
    const source = chooseFrom && chooseFrom.length ? chooseFrom : pool;
    const chosen = sampleWithRepeats(source, n);

    // Make sure there are enough idioms with a usable origin for the story slots (3 of 15) whenever the source has them.
    const wantStory = Math.min(Math.floor(n / KINDS.length), source.filter(storyUsable).length);
    let have = chosen.filter(storyUsable).length;
    if (have < wantStory) {
      const unused = shuffle(source.filter((it) => storyUsable(it) && !chosen.includes(it)));
      for (let i = 0; i < chosen.length && have < wantStory && unused.length; i++) {
        if (storyUsable(chosen[i])) continue;
        chosen[i] = unused.pop();
        have++;
      }
    }

    const plan = planKinds(chosen, KINDS, eligible);
    const tfCount = plan.filter((p) => p.kind === "true-false").length;
    const flags = trueFalseFlags(tfCount);
    let tf = 0;
    return plan.map(({ kind, item }) => {
      switch (kind) {
        case "meaning":
          return buildMeaningQuestion(pool, item);
        case "fill-char":
          return buildFillCharQuestion(pool, item);
        case "story":
          return buildStoryQuestion(pool, item);
        case "true-false":
          return buildTrueFalseQuestion(pool, item, flags[tf++]);
        default:
          return buildClueQuestion(pool, item);
      }
    });
  }

  window.App.IdiomQuiz = { QUESTION_COUNT, STAGE_SIZE, KINDS, buildQuestions, stagesFromAttempts, sessionsToReach, related, inSameGroup, meaningsSimilar, storyUsable, sameStory };
})();
