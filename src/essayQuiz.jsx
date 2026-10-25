// 階段 9c — question generation for 作文金句, kept free of any screen code (no JSX, no React) so that tests/essay-quiz.test.js can run it in
// a node:vm sandbox thousands of times and check that every question has exactly one defensible answer. EssayModule.jsx only turns the
// plain objects returned here into screens.
//
// Five question kinds in a random order (a session is 15 questions, 3 of each — dealt by quizPlan.jsx):
//   fill         填空       the sentence with its `keyPhrase` blanked, options = 4 phrases
//   scenario     情境配金句   「情境：…，以下哪一句金句最適合？」 options = 4 sentences
//   theme        主題分類     the sentence is shown, options = 描寫／抒情／論說
//   usage        用法配對     the sentence is shown, 「這句金句的用法是哪一項？」 options = 4 `usage` texts
//   scenario-tf  情境是非     情境『…』適合用這句金句：『…』。這個說法正確嗎？ options = 正確／不正確
//
// Rules that keep an answer unambiguous:
//  - two sentences of a common ESSAY_SIMILAR_GROUPS group are "related": a related sentence is never a wrong option (scenario, usage,
//    fill), and a false 情境是非 claim never uses the scenario of a related sentence.
//  - wrong options prefer the same theme (then the asked pool, then the whole library) and a similar length; the asked sentence's own
//    `keyPhrase` / `usage` / `scenario` text is never offered twice.
//  - a wrong 填空 phrase never occurs inside the sentence itself.
// Every question carries `itemId` so a wrong answer goes into 錯題本 as before. 作文金句 has no stage-based 稱號, so changing the session
// length from 16 to 15 affects nothing stored (practiceStats just adds 15 per session; 科舉稱號 / 徽章 count sessions).
window.App = window.App || {};

(function () {
  const { shuffle, sampleWithRepeats } = window.App.QuizUtils;
  const { planKinds, trueFalseFlags } = window.App.QuizPlan;
  const { ESSAY_ITEMS, ESSAY_THEMES, ESSAY_SIMILAR_GROUPS } = window.App.Content;

  const QUESTION_COUNT = 15;
  const KINDS = ["fill", "scenario", "theme", "usage", "scenario-tf"];

  const GROUPS_OF = {}; // id -> array of group indexes
  (ESSAY_SIMILAR_GROUPS || []).forEach((g, gi) => {
    g.forEach((id) => {
      (GROUPS_OF[id] = GROUPS_OF[id] || []).push(gi);
    });
  });
  const inSameGroup = (a, b) => {
    const ga = GROUPS_OF[a.id];
    const gb = GROUPS_OF[b.id];
    return !!(ga && gb && ga.some((x) => gb.includes(x)));
  };
  const related = (a, b) => a.id === b.id || inSameGroup(a, b);

  // lower score = preferred as a wrong option: same theme first, then the asked pool, then a similar length (ties random)
  const lenGap = (a, b) => Math.min(3, (4 * Math.abs(a.length - b.length)) / Math.max(a.length, b.length, 1));
  function pickWrong(pool, item, n, textOf, ok) {
    const inPool = new Set(pool.map((p) => p.id));
    const correct = textOf(item);
    const cands = ESSAY_ITEMS.filter((c) => !related(item, c) && (!ok || ok(c))).map((c) => ({
      c,
      score: (c.theme === item.theme ? 0 : 4) + (inPool.has(c.id) ? 0 : 1) + lenGap(correct, textOf(c)),
    }));
    const out = [];
    const seen = new Set([correct]);
    for (const x of shuffle(cands).sort((a, b) => a.score - b.score)) {
      if (out.length >= n) break;
      const text = textOf(x.c);
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(x.c);
    }
    return out;
  }

  function make(kind, item, extra, options, correct) {
    return Object.assign({ itemId: item.id, kind, theme: item.theme }, extra, { options, correctIndex: options.indexOf(correct) });
  }

  function buildFillQuestion(pool, item) {
    const parts = item.sentence.split(item.keyPhrase);
    const wrong = pickWrong(pool, item, 3, (c) => c.keyPhrase, (c) => !item.sentence.includes(c.keyPhrase)).map((c) => c.keyPhrase);
    return make("fill", item, { before: parts[0], after: parts[1] }, shuffle([item.keyPhrase, ...wrong]), item.keyPhrase);
  }

  function buildScenarioQuestion(pool, item) {
    const wrong = pickWrong(pool, item, 3, (c) => c.sentence).map((c) => c.sentence);
    return make("scenario", item, { ask: `情境：${item.scenario}，以下哪一句金句最適合？` }, shuffle([item.sentence, ...wrong]), item.sentence);
  }

  function buildThemeQuestion(pool, item) {
    return make("theme", item, { sentence: item.sentence, ask: "這句金句屬於哪一個主題？" }, shuffle(ESSAY_THEMES), item.theme);
  }

  function buildUsageQuestion(pool, item) {
    const wrong = pickWrong(pool, item, 3, (c) => c.usage).map((c) => c.usage);
    return make("usage", item, { sentence: item.sentence, ask: "這句金句的用法是哪一項？" }, shuffle([item.usage, ...wrong]), item.usage);
  }

  // 情境是非: the stated scenario is the sentence's own (wantTrue) or the scenario of an unrelated sentence, same theme preferred.
  function buildScenarioTrueFalseQuestion(pool, item, wantTrue) {
    const scenario = wantTrue ? item.scenario : pickWrong(pool, item, 1, (c) => c.scenario)[0].scenario;
    return make("scenario-tf", item, { scenario, sentence: item.sentence, ask: "這個說法正確嗎？" }, ["正確", "不正確"], wantTrue ? "正確" : "不正確");
  }

  // `chooseFrom` (defaults to `pool`) is the set of sentences actually asked about; `pool` supplies the wrong options (topped up from the
  // whole library). This split lets 練習錯題 ask about only the mistaken sentences without running short of plausible wrong options.
  function buildQuestions(pool, count, chooseFrom) {
    const n = count || QUESTION_COUNT;
    const source = chooseFrom && chooseFrom.length ? chooseFrom : pool;
    const chosen = sampleWithRepeats(source, n);
    // A kind that cannot get enough unrelated wrong options for an item (never the case with the real library; kept as a safety net so a
    // question never has fewer than 4 options or a defensible second answer) is moved to another slot or replaced by another kind.
    const wrongNeeded = { fill: 3, scenario: 3, usage: 3, "scenario-tf": 1 };
    const textOf = { fill: (c) => c.keyPhrase, scenario: (c) => c.sentence, usage: (c) => c.usage, "scenario-tf": (c) => c.scenario };
    const enough = (kind, item) => !wrongNeeded[kind] || pickWrong(pool, item, wrongNeeded[kind], textOf[kind]).length >= wrongNeeded[kind];
    const plan = planKinds(chosen, KINDS, enough);
    const flags = trueFalseFlags(plan.filter((p) => p.kind === "scenario-tf").length);
    let tf = 0;
    return plan.map(({ kind, item }) => {
      switch (kind) {
        case "scenario":
          return buildScenarioQuestion(pool, item);
        case "theme":
          return buildThemeQuestion(pool, item);
        case "usage":
          return buildUsageQuestion(pool, item);
        case "scenario-tf":
          return buildScenarioTrueFalseQuestion(pool, item, flags[tf++]);
        default:
          return buildFillQuestion(pool, item);
      }
    });
  }

  window.App.EssayQuiz = { QUESTION_COUNT, KINDS, buildQuestions, related, inSameGroup };
})();
