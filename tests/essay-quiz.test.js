// 階段 9c — tests for the 作文金句 question generator (src/essayQuiz.jsx, src/quizPlan.jsx) and ESSAY_SIMILAR_GROUPS.
// Runs — node tests/essay-quiz.test.js
// The generator is plain JavaScript with no screen code, so it is loaded into a node:vm sandbox exactly as the browser loads it and run
// thousands of times with a seeded Math.random; every generated question is checked for exactly one defensible answer.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("essay-quiz");

function load(seed, patchContent) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  let s = seed >>> 0;
  ctx.Math = Object.create(Math);
  ctx.Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (const f of ["quizUtils.jsx", "quizPlan.jsx", "content/essayContent.jsx", "essayQuiz.jsx"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
    if (f === "content/essayContent.jsx" && patchContent) patchContent(ctx.window.App.Content);
  }
  return ctx.window.App;
}

const App = load(20261025);
const { ESSAY_ITEMS: ITEMS, ESSAY_SIMILAR_GROUPS: GROUPS, ESSAY_THEMES: THEMES } = App.Content;
const Q = App.EssayQuiz;
const KINDS = Array.from(Q.KINDS);
const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const bySentence = Object.fromEntries(ITEMS.map((i) => [i.sentence, i]));
const byUsage = Object.fromEntries(ITEMS.map((i) => [i.usage, i]));
const byScenario = Object.fromEntries(ITEMS.map((i) => [i.scenario, i]));
const byPhrase = Object.fromEntries(ITEMS.map((i) => [i.keyPhrase, i]));
const poolFor = (f) => ITEMS.filter(f);
// independent re-implementation of "related" (does not use the generator's lookup)
const related = (a, b) => a.id === b.id || GROUPS.some((g) => g.includes(a.id) && g.includes(b.id));

function problems(q, opts) {
  const out = [];
  const item = byId[q.itemId];
  if (!item) return ["unknown itemId " + q.itemId];
  const o = q.options;
  if (new Set(o).size !== o.length) out.push("duplicate options");
  if (!(q.correctIndex >= 0 && q.correctIndex < o.length)) return out.concat("bad correctIndex");
  const correct = o[q.correctIndex];
  const wrong = o.filter((_, i) => i !== q.correctIndex);
  switch (q.kind) {
    case "fill": {
      if (o.length !== 4) out.push("needs 4 options");
      if (q.before + correct + q.after !== item.sentence) out.push("correct option does not complete the sentence");
      if (correct !== item.keyPhrase) out.push("correct is not the keyPhrase");
      wrong.forEach((w) => {
        const owner = byPhrase[w];
        if (!owner) return out.push("wrong phrase belongs to no sentence");
        if (item.sentence.includes(w)) out.push("wrong phrase occurs in the sentence: " + w);
        if (related(item, owner)) out.push("wrong phrase comes from a related sentence");
        if (opts.sameTheme && owner.theme !== item.theme) out.push("wrong phrase from another theme");
      });
      break;
    }
    case "scenario": {
      if (o.length !== 4) out.push("needs 4 options");
      if (correct !== item.sentence) out.push("correct is not the sentence");
      if (q.ask !== `情境：${item.scenario}，以下哪一句金句最適合？`) out.push("wrong stem");
      wrong.forEach((w) => {
        const owner = bySentence[w];
        if (!owner) return out.push("wrong option is no sentence");
        if (related(item, owner)) out.push(`wrong sentence ${owner.id} is related to ${item.id}`);
        if (opts.sameTheme && owner.theme !== item.theme) out.push("wrong sentence from another theme");
      });
      break;
    }
    case "theme": {
      if (o.length !== 3 || [...o].sort().join() !== [...THEMES].sort().join()) out.push("theme options must be the three themes");
      if (correct !== item.theme) out.push("correct is not the theme");
      if (q.sentence !== item.sentence) out.push("wrong stem sentence");
      break;
    }
    case "usage": {
      if (o.length !== 4) out.push("needs 4 options");
      if (correct !== item.usage) out.push("correct is not the usage");
      if (q.sentence !== item.sentence) out.push("wrong stem sentence");
      wrong.forEach((w) => {
        const owner = byUsage[w];
        if (!owner) return out.push("wrong usage belongs to no sentence");
        if (owner.id === item.id) out.push("wrong usage is the sentence's own");
        if (related(item, owner)) out.push(`wrong usage of ${owner.id} is related to ${item.id}`);
        if (opts.sameTheme && owner.theme !== item.theme) out.push("wrong usage from another theme");
      });
      break;
    }
    case "scenario-tf": {
      if (o.join("/") !== "正確/不正確") out.push("options must be 正確/不正確");
      if (q.sentence !== item.sentence) out.push("wrong stem sentence");
      if (correct === "正確") {
        if (q.scenario !== item.scenario) out.push("true claim uses another scenario");
      } else {
        const owner = byScenario[q.scenario];
        if (!owner) out.push("false claim scenario belongs to no sentence");
        else {
          if (owner.id === item.id) out.push("false claim uses the sentence's own scenario");
          if (related(item, owner)) out.push(`false claim scenario of ${owner.id} is related to ${item.id}`);
          if (opts.sameTheme && owner.theme !== item.theme) out.push("false claim scenario from another theme");
        }
      }
      break;
    }
    default:
      out.push("unknown kind " + q.kind);
  }
  return out;
}

function sessionProblems(qs, opts) {
  const out = [];
  if (qs.length !== 15) out.push("session has " + qs.length + " questions");
  qs.forEach((q, i) => {
    problems(q, opts || {}).forEach((p) => out.push(`#${i + 1} ${q.kind}: ${p}`));
    if (i && qs[i - 1].kind === q.kind) out.push(`#${i + 1}: same kind twice in a row (${q.kind})`);
  });
  return out;
}

// ---------------------------------------------------------------- content: groups
t("ESSAY_SIMILAR_GROUPS: every member is an existing sentence id, no duplicates, 2+ members per group, no repeated group", () => {
  assert.ok(GROUPS.length >= 15);
  const seen = new Set();
  GROUPS.forEach((g) => {
    assert.ok(Array.isArray(g) && g.length >= 2, "group needs 2+ members: " + g);
    assert.strictEqual(new Set(g).size, g.length, "duplicate member in " + g);
    g.forEach((id) => assert.ok(byId[id], "unknown id in a group: " + id));
    const key = g.slice().sort().join("|");
    assert.ok(!seen.has(key), "duplicate group " + g);
    seen.add(key);
  });
});

t("every scenario, usage, keyPhrase and sentence is unique (they are quiz options)", () => {
  ["scenario", "usage", "keyPhrase", "sentence"].forEach((f) => assert.strictEqual(new Set(ITEMS.map((i) => i[f])).size, ITEMS.length, f));
});

// ---------------------------------------------------------------- session shape
t("a session is 15 questions: 3 of each of the 5 kinds, never the same kind twice in a row (full pool, each level, each theme)", () => {
  const pools = [ITEMS, poolFor((i) => i.level === "p5"), poolFor((i) => i.level === "p6"), poolFor((i) => i.level === "s1"), poolFor((i) => i.level === "s2"), ...THEMES.map((th) => poolFor((i) => i.theme === th))];
  for (const pool of pools) {
    for (let r = 0; r < 300; r++) {
      const qs = Q.buildQuestions(pool, 15);
      assert.strictEqual(qs.length, 15);
      const count = {};
      qs.forEach((q) => (count[q.kind] = (count[q.kind] || 0) + 1));
      assert.deepStrictEqual(Object.keys(count).sort(), KINDS.slice().sort());
      KINDS.forEach((k) => assert.strictEqual(count[k], 3, `${k} x${count[k]}`));
      qs.forEach((q, i) => i && assert.notStrictEqual(qs[i - 1].kind, q.kind));
    }
  }
});

t("the kind order is random (many different orders over 300 sessions)", () => {
  const orders = new Set();
  for (let r = 0; r < 300; r++) orders.add(Q.buildQuestions(ITEMS, 15).map((q) => q.kind).join());
  assert.ok(orders.size > 250, "only " + orders.size + " different orders");
});

t("every question has an itemId of a real sentence, and 15 questions use 15 different sentences when the pool is big enough", () => {
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    qs.forEach((q) => assert.ok(byId[q.itemId]));
    assert.strictEqual(new Set(qs.map((q) => q.itemId)).size, 15);
  }
});

// ---------------------------------------------------------------- unique answer, large sampling
t("5000 sessions over the full pool: every question has exactly one defensible answer, wrong options from the same theme (0 violations)", () => {
  let bad = [];
  for (let r = 0; r < 5000 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(ITEMS, 15), { sameTheme: true }));
  assert.deepStrictEqual(bad.slice(0, 5), []);
});

t("level pools (p5 / p6 / s1 / s2, 1000 sessions each) and theme pools (1000 each): 0 violations", () => {
  const pools = [["p5", poolFor((i) => i.level === "p5")], ["p6", poolFor((i) => i.level === "p6")], ["s1", poolFor((i) => i.level === "s1")], ["s2", poolFor((i) => i.level === "s2")], ...THEMES.map((th) => [th, poolFor((i) => i.theme === th)])];
  for (const [name, pool] of pools) {
    let bad = [];
    for (let r = 0; r < 1000 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(pool, 15)));
    assert.deepStrictEqual(bad.slice(0, 5), [], name);
  }
});

t("練習錯題 (chooseFrom a small set, pool = whole library): only those sentences are asked, 0 violations", () => {
  for (let r = 0; r < 1500; r++) {
    const size = 1 + (r % 12);
    const pick = [];
    while (pick.length < size) {
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (!pick.includes(it)) pick.push(it);
    }
    const qs = Q.buildQuestions(ITEMS, 15, pick);
    assert.deepStrictEqual(sessionProblems(qs, { sameTheme: true }).filter((p) => !/same kind twice/.test(p) || size > 1), []);
    qs.forEach((q) => assert.ok(pick.some((p) => p.id === q.itemId)));
  }
});

t("a pool of only 4 sentences still gives 15 valid questions (wrong options topped up from the whole library)", () => {
  // every window of 4 consecutive sentences (ITEMS.length - 3 pools: 147 in 階段 9c, 195 with the 48 中二 sentences of 階段 10e) x 10 sessions; the groups added after the 階段 9c review are among them
  const windows = ITEMS.length - 3;
  for (let r = 0; r < windows * 10; r++) {
    const pool = ITEMS.slice(r % windows, (r % windows) + 4);
    const qs = Q.buildQuestions(pool, 15);
    assert.strictEqual(qs.length, 15);
    assert.deepStrictEqual(sessionProblems(qs).filter((p) => !/same kind twice/.test(p)), []);
  }
});

// ---------------------------------------------------------------- 情境是非 balance
t("情境是非: about half of all questions are true (5000 sessions, within ±0.05); every session has 2 + 1", () => {
  let tTrue = 0;
  let tAll = 0;
  for (let r = 0; r < 5000; r++) {
    const tf = Q.buildQuestions(ITEMS, 15).filter((q) => q.kind === "scenario-tf");
    assert.strictEqual(tf.length, 3);
    const n = tf.filter((q) => q.options[q.correctIndex] === "正確").length;
    assert.ok(n === 1 || n === 2, "session with " + n + " true");
    tTrue += n;
    tAll += tf.length;
  }
  assert.ok(Math.abs(tTrue / tAll - 0.5) <= 0.05, "true share " + tTrue / tAll);
});

// ---------------------------------------------------------------- the similarity rule is really exercised
t("the group rule matters: related pairs exist and the generator treats them as related", () => {
  let pairs = 0;
  GROUPS.forEach((g) => g.forEach((a, i) => g.slice(i + 1).forEach((b) => {
    pairs++;
    assert.ok(Q.related(byId[a], byId[b]) && Q.related(byId[b], byId[a]));
  })));
  assert.ok(pairs >= 30);
  assert.ok(!Q.related(byId["sunset-palette"], byId["bright-eyes"]));
});

t("fill: a wrong phrase never occurs inside the sentence (checked with a patched copy of the content, see below)", () => {
  assert.ok(byId["tired-runner"].sentence.includes("咬緊牙關"));
  // In the real library the two sentences have different themes, so the same-theme preference alone would hide a missing rule:
  // here 咬緊牙關's sentence gets the same theme and a same-length phrase taken from inside the 長跑 sentence (a patched copy of the content
  // in its own sandbox), and 長跑 is asked on its own. Without the rule that phrase would be offered as a wrong option now and then.
  const App2 = load(777, (C) => {
    const g = C.ESSAY_ITEMS.find((i) => i.id === "gritting-teeth");
    g.theme = "描寫";
    g.keyPhrase = "他咬緊牙關，汗水沿着"; // a phrase of the same length and theme that occurs inside the 長跑 sentence
    C.ESSAY_SIMILAR_GROUPS.length = 0; // (the two sentences are in one group in the real content, which would hide the rule)
  });
  const runner = App2.Content.ESSAY_ITEMS.find((i) => i.id === "tired-runner");
  let fills = 0;
  for (let r = 0; r < 3000; r++) {
    App2.EssayQuiz.buildQuestions(App2.Content.ESSAY_ITEMS, 15, [runner]).forEach((q) => {
      if (q.kind !== "fill") return;
      fills++;
      assert.ok(!q.options.includes("他咬緊牙關，汗水沿着"), "offered a phrase that is in the sentence");
    });
  }
  assert.ok(fills >= 3000);
});

t("when a sentence has too few unrelated sentences to offer, kinds that need wrong options are replaced: still 15 valid questions, never fewer than 4 options", () => {
  // patched copy of the content: every sentence is in one single group, so no kind that needs a wrong option can be built
  const App3 = load(4242, (C) => {
    C.ESSAY_SIMILAR_GROUPS.length = 0;
    C.ESSAY_SIMILAR_GROUPS.push(C.ESSAY_ITEMS.map((i) => i.id));
  });
  for (let r = 0; r < 300; r++) {
    const qs = App3.EssayQuiz.buildQuestions(App3.Content.ESSAY_ITEMS, 15);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => {
      assert.ok(q.kind === "theme", "only 主題分類 can be built, got " + q.kind);
      assert.strictEqual(q.options.length, 3);
      assert.ok(q.correctIndex >= 0);
    });
  }
  // a group that leaves only a few unrelated sentences: whatever kinds are built still have 4 distinct options and one answer
  const App4 = load(99, (C) => {
    const ids = C.ESSAY_ITEMS.map((i) => i.id);
    C.ESSAY_SIMILAR_GROUPS.length = 0;
    C.ESSAY_SIMILAR_GROUPS.push(ids.slice(0, ids.length - 2)); // only 2 sentences outside the group
  });
  for (let r = 0; r < 500; r++) {
    const qs = App4.EssayQuiz.buildQuestions(App4.Content.ESSAY_ITEMS, 15);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => {
      if (q.kind === "fill" || q.kind === "scenario" || q.kind === "usage") assert.strictEqual(new Set(q.options).size, 4);
      assert.ok(q.options.length >= 2 && q.correctIndex >= 0 && q.correctIndex < q.options.length);
    });
  }
});

t("the groups the user approved after the review are present (階段 9c review)", () => {
  const has = (...ids) => GROUPS.some((g) => ids.every((id) => g.includes(id)));
  assert.ok(has("gritting-teeth", "unyielding-spirit", "facing-setback", "drop-wears-stone", "chasing-dreams", "late-study", "tired-runner"));
  assert.ok(has("grandma-cooking", "quiet-support", "kind-stranger", "silent-father"));
  assert.ok(has("mother-hands", "mother-growing-old"));
  assert.ok(has("empty-rocking-chair", "hometown-longing", "distant-friendship"));
  assert.ok(has("old-wine-friendship", "true-friendship", "being-accepted"));
  assert.ok(has("facing-setback", "failure-letting-go"));
  assert.ok(has("details-decide", "stay-focused", "plan-ahead"));
  assert.ok(has("knowledge-ladder", "apply-knowledge", "practice-makes-perfect"));
  assert.ok(has("lonely-lane", "city-night-train", "late-study"));
  assert.ok(has("chasing-dreams", "dream-and-action"));
  assert.ok(has("environmental-duty", "public-property", "sense-of-duty"));
  assert.ok(has("quiet-night", "library-mood", "fishing-village-fog"));
  assert.ok(has("teamwork-building", "teammates-thanks"));
  // deliberately NOT grouped (still 待確認)
  const together = (a, b) => GROUPS.some((g) => g.includes(a) && g.includes(b));
  assert.ok(!together("humility-value", "politeness-value") && !together("politeness-value", "frugality-virtue") && !together("humility-value", "frugality-virtue"));
  assert.ok(!together("growing-cost", "life-journey") && !together("life-journey", "peace-with-solitude") && !together("growing-cost", "peace-with-solitude"));
  GROUPS.forEach((g) => assert.ok(!g.includes("friends-drift-apart"), "friends-drift-apart must stay ungrouped"));
});

// ---------------------------------------------------------------- 書面語
t("new strings contain no colloquial Cantonese, and the question wording uses no 同", () => {
  const files = ["essayQuiz.jsx", "EssayModule.jsx"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"));
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻/;
  files.forEach((src) => assert.ok(!bad.test(src), "colloquial wording found"));
  files.forEach((src) => assert.ok(!/同/.test(src.replace(/\/\/.*$/gm, "")), "同 used in a string"));
});

t.done();
