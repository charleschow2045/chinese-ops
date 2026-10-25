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
  const pools = [ITEMS, poolFor((i) => i.level === "p5"), poolFor((i) => i.level === "p6"), poolFor((i) => i.level === "s1"), ...THEMES.map((th) => poolFor((i) => i.theme === th))];
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

t("level pools (p5 / p6 / s1, 1000 sessions each) and theme pools (1000 each): 0 violations", () => {
  const pools = [["p5", poolFor((i) => i.level === "p5")], ["p6", poolFor((i) => i.level === "p6")], ["s1", poolFor((i) => i.level === "s1")], ...THEMES.map((th) => [th, poolFor((i) => i.theme === th)])];
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
  for (let r = 0; r < 300; r++) {
    const pool = ITEMS.slice(r % 100, (r % 100) + 4);
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

// ---------------------------------------------------------------- 書面語
t("new strings contain no colloquial Cantonese, and the question wording uses no 同", () => {
  const files = ["essayQuiz.jsx", "EssayModule.jsx"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"));
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻/;
  files.forEach((src) => assert.ok(!bad.test(src), "colloquial wording found"));
  files.forEach((src) => assert.ok(!/同/.test(src.replace(/\/\/.*$/gm, "")), "同 used in a string"));
});

t.done();
