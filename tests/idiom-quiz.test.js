// 階段 9b-1 — tests for the 成語 question generator (src/idiomQuiz.jsx, src/quizPlan.jsx) and IDIOM_SYNONYM_GROUPS.
// Runs — node tests/idiom-quiz.test.js
// The generator is plain JavaScript with no screen code, so it is loaded into a node:vm sandbox exactly as the browser loads it and run
// thousands of times with a seeded Math.random; every generated question is checked for exactly one defensible answer.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("idiom-quiz");

function load(seed) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  let s = seed >>> 0;
  ctx.Math = Object.create(Math);
  ctx.Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (const f of ["quizUtils.jsx", "quizPlan.jsx", "content/idiomContent.jsx", "idiomQuiz.jsx"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
  }
  return ctx.window.App;
}

const App = load(20261024);
const { IDIOM_ITEMS: ITEMS, IDIOM_SYNONYM_GROUPS: GROUPS, getIdiomMasteryTier } = App.Content;
const Q = App.IdiomQuiz;
const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const byText = Object.fromEntries(ITEMS.map((i) => [i.idiom, i]));
const LEVELS = [null, "p5", "p6", "s1"];
const poolFor = (lv) => (lv ? ITEMS.filter((i) => i.level === lv) : ITEMS);

// independent re-implementation of the "same group" rule (does not use the generator's lookup)
const groupMates = (a, b) => GROUPS.some((g) => g.includes(a.idiom) && g.includes(b.idiom));
const relCache = new Map();
const related = (a, b) => {
  const k = a.id + "|" + b.id;
  let v = relCache.get(k);
  if (v === undefined) relCache.set(k, (v = a.id === b.id || groupMates(a, b) || Q.meaningsSimilar(a, b)));
  return v;
};
const stripEnd = (m) => m.replace(/[。；]$/, "");
const ownersOf = new Map(); // meaning -> idioms with that meaning
const ownersOfClaim = new Map(); // meaning without its final 。 -> idioms
ITEMS.forEach((i) => {
  (ownersOf.get(i.meaning) || ownersOf.set(i.meaning, []).get(i.meaning)).push(i);
  const c = stripEnd(i.meaning);
  (ownersOfClaim.get(c) || ownersOfClaim.set(c, []).get(c)).push(i);
});
const plain = (s) => s.replace(/[，。；：、？！「」『』（）《》\s]/g, "");
const sharesRun3 = (a, b) => {
  const A = plain(a);
  const B = plain(b);
  for (let i = 0; i + 3 <= A.length; i++) if (B.includes(A.slice(i, i + 3))) return true;
  return false;
};

// Returns a list of problems found in one question ([] = fine).
function problems(q) {
  const out = [];
  const item = byId[q.itemId];
  if (!item) return ["unknown itemId " + q.itemId];
  const opts = q.options;
  if (new Set(opts).size !== opts.length) out.push("duplicate options");
  if (!(q.correctIndex >= 0 && q.correctIndex < opts.length)) return out.concat("bad correctIndex");
  const correct = opts[q.correctIndex];
  const wrong = opts.filter((_, i) => i !== q.correctIndex);
  switch (q.kind) {
    case "clue":
    case "story": {
      if (opts.length !== 4) out.push("needs 4 options");
      if (correct !== item.idiom) out.push("correct option is not the item");
      wrong.forEach((w) => {
        const c = byText[w];
        if (!c) return out.push("wrong option is not an idiom: " + w);
        if (related(item, c)) out.push(`wrong option ${w} is related to ${item.idiom}`);
        if (q.kind === "story") {
          if (sharesRun3(item.origin, c.origin || "")) out.push(`wrong option ${w} shares a story with ${item.idiom}`);
          if (item.origin.includes(w)) out.push(`wrong option ${w} is named in the origin`);
        }
      });
      if (q.kind === "story") {
        if (q.text !== item.origin) out.push("stem is not the origin");
        if (q.text.includes(item.idiom)) out.push("origin gives the idiom away");
        for (let k = 0; k + 3 <= item.idiom.length; k++) if (q.text.includes(item.idiom.slice(k, k + 3))) out.push("origin contains 3 consecutive characters of the idiom");
        if (!Q.storyUsable(item)) out.push("item not usable for a story question");
      } else if (q.text !== item.clue) out.push("stem is not the clue");
      break;
    }
    case "meaning": {
      if (opts.length !== 4) out.push("needs 4 options");
      if (correct !== item.meaning) out.push("correct option is not the meaning");
      wrong.forEach((w) => {
        const owners = ownersOf.get(w) || [];
        if (!owners.length) return out.push("wrong meaning belongs to no idiom");
        if (owners.some((c) => related(item, c))) out.push(`wrong meaning of ${owners.map((o) => o.idiom)} is related to ${item.idiom}`);
      });
      break;
    }
    case "fill-char": {
      if (opts.length !== 4) out.push("needs 4 options");
      if ((q.text.match(/▁/g) || []).length !== 1) return out.concat("needs exactly one blank");
      const fill = (ch) => q.text.replace("▁", ch);
      if (fill(correct) !== item.idiom) out.push("correct option does not complete the idiom");
      wrong.forEach((w) => {
        if (byText[fill(w)]) out.push(`wrong character ${w} also completes an idiom (${fill(w)})`);
      });
      break;
    }
    case "true-false": {
      if (opts.join("/") !== "正確/不正確") out.push("options must be 正確/不正確");
      const m = /^「(.+?)」的意思是「(.+)」。這個說法正確嗎？$/.exec(q.ask);
      if (!m) return out.concat("unexpected wording: " + q.ask);
      if (m[1] !== item.idiom) out.push("claim is about another idiom");
      const claim = m[2];
      const isOwn = claim === item.meaning.replace(/[。；]$/, "");
      if (correct === "正確" && !isOwn) out.push("true claim is not the item's meaning");
      if (correct === "不正確") {
        if (isOwn) out.push("false claim is the item's own meaning");
        const owners = ownersOfClaim.get(claim) || [];
        if (!owners.length) out.push("false claim is no idiom's meaning");
        if (owners.some((c) => related(item, c))) out.push("false claim uses the meaning of a related idiom");
      }
      break;
    }
    default:
      out.push("unknown kind " + q.kind);
  }
  return out;
}

function sessionProblems(qs) {
  const out = [];
  if (qs.length !== 15) out.push("session has " + qs.length + " questions");
  qs.forEach((q, i) => {
    problems(q).forEach((p) => out.push(`#${i + 1} ${q.kind}: ${p}`));
    if (i && qs[i - 1].kind === q.kind) out.push(`#${i + 1}: same kind twice in a row (${q.kind})`);
  });
  return out;
}

// ---------------------------------------------------------------- content: synonym groups
t("IDIOM_SYNONYM_GROUPS: every member is an existing idiom, no duplicates, at least two members per group", () => {
  assert.ok(GROUPS.length >= 50);
  const seen = new Set();
  GROUPS.forEach((g) => {
    assert.ok(Array.isArray(g) && g.length >= 2, "group needs 2+ members: " + g);
    assert.strictEqual(new Set(g).size, g.length, "duplicate member in " + g);
    g.forEach((x) => assert.ok(byText[x], "unknown idiom in a group: " + x));
    const key = g.slice().sort().join("|");
    assert.ok(!seen.has(key), "duplicate group " + g);
    seen.add(key);
  });
});

// ---------------------------------------------------------------- session shape
t("a session is 15 questions: 3 of each of the 5 kinds, never the same kind twice in a row (full pool and each level)", () => {
  for (const lv of LEVELS) {
    for (let r = 0; r < 300; r++) {
      const qs = Q.buildQuestions(poolFor(lv), 15);
      assert.strictEqual(qs.length, 15);
      const count = {};
      qs.forEach((q) => (count[q.kind] = (count[q.kind] || 0) + 1));
      assert.deepStrictEqual(Object.keys(count).sort(), Array.from(Q.KINDS).sort());
      Q.KINDS.forEach((k) => assert.strictEqual(count[k], 3, `${lv}: ${k} x${count[k]}`));
      qs.forEach((q, i) => i && assert.notStrictEqual(qs[i - 1].kind, q.kind));
    }
  }
});

t("the kind order is random (many different orders over 300 sessions)", () => {
  const orders = new Set();
  for (let r = 0; r < 300; r++) orders.add(Q.buildQuestions(ITEMS, 15).map((q) => q.kind).join());
  assert.ok(orders.size > 250, "only " + orders.size + " different orders");
});

t("every question has an itemId of a real idiom, and 15 questions never use the same idiom twice when the pool is big enough", () => {
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    qs.forEach((q) => assert.ok(byId[q.itemId]));
    assert.strictEqual(new Set(qs.map((q) => q.itemId)).size, 15);
  }
});

// ---------------------------------------------------------------- unique answer, large sampling
t("5000 sessions over the full pool: every question has exactly one defensible answer (0 violations)", () => {
  let bad = [];
  for (let r = 0; r < 5000 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(ITEMS, 15)));
  assert.deepStrictEqual(bad.slice(0, 5), []);
});

t("level pools (p5 / p6 / s1, 800 sessions each): 0 violations", () => {
  for (const lv of ["p5", "p6", "s1"]) {
    let bad = [];
    for (let r = 0; r < 800 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(poolFor(lv), 15)));
    assert.deepStrictEqual(bad.slice(0, 5), [], lv);
  }
});

t("練習錯題 (chooseFrom a small set, pool = all idioms): only those idioms are asked, 0 violations", () => {
  for (let r = 0; r < 600; r++) {
    const size = 1 + (r % 12);
    const pick = [];
    while (pick.length < size) {
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (!pick.includes(it)) pick.push(it);
    }
    const qs = Q.buildQuestions(ITEMS, 15, pick);
    assert.deepStrictEqual(sessionProblems(qs).filter((p) => !/same kind twice/.test(p) || size > 1), []);
    qs.forEach((q) => assert.ok(pick.some((p) => p.id === q.itemId)));
  }
});

// ---------------------------------------------------------------- 故事猜成語 fallback
t("story kind falls back when the mistaken idioms have no usable origin (no error, no empty question)", () => {
  const noOrigin = ITEMS.filter((i) => !Q.storyUsable(i));
  assert.ok(noOrigin.length > 100);
  for (let r = 0; r < 500; r++) {
    const pick = [0, 1, 2, 3, 4, 5, 6, 7][r % 8] + 1;
    const set = noOrigin.slice(r % (noOrigin.length - 10), (r % (noOrigin.length - 10)) + pick);
    const qs = Q.buildQuestions(ITEMS, 15, set);
    assert.strictEqual(qs.length, 15);
    assert.deepStrictEqual(sessionProblems(qs).filter((p) => !/same kind twice/.test(p)), []);
    assert.ok(qs.every((q) => q.kind !== "story"), "a story question was built without an origin");
    qs.forEach((q) => assert.ok(q.options.length >= 2 && q.correctIndex >= 0));
  }
});

t("story kind still appears when only some of the mistaken idioms have an origin", () => {
  const withO = ITEMS.filter(Q.storyUsable);
  const without = ITEMS.filter((i) => !Q.storyUsable(i));
  for (let r = 0; r < 300; r++) {
    const set = [...withO.slice(r % 100, (r % 100) + 3), ...without.slice(r % 100, (r % 100) + 6)];
    const qs = Q.buildQuestions(ITEMS, 15, set);
    assert.deepStrictEqual(sessionProblems(qs).filter((p) => !/same kind twice/.test(p)), []);
    assert.ok(qs.filter((q) => q.kind === "story").length >= 1);
  }
});

t("a pool with a single idiom, or only four, still gives 15 valid questions", () => {
  [ITEMS.slice(0, 1), ITEMS.slice(0, 4)].forEach((set) => {
    for (let r = 0; r < 100; r++) {
      const qs = Q.buildQuestions(ITEMS, 15, set);
      assert.strictEqual(qs.length, 15);
      qs.forEach((q) => assert.ok(q.options.length >= 2 && q.correctIndex >= 0 && q.correctIndex < q.options.length));
    }
  });
});

t("story questions are only built from an idiom whose origin does not give it away; origins that do are skipped", () => {
  const leaky = ITEMS.filter((i) => i.origin && !Q.storyUsable(i));
  assert.ok(leaky.length > 0);
  for (let r = 0; r < 500; r++) {
    Q.buildQuestions(ITEMS, 15).forEach((q) => {
      if (q.kind === "story") assert.ok(!leaky.some((l) => l.id === q.itemId));
    });
  }
});

// ---------------------------------------------------------------- 是非題 balance
t("是非題: about half of all 是非題 are true (5000 sessions, within ±0.05), and every session has both kinds or 2+1", () => {
  let tTrue = 0;
  let tAll = 0;
  for (let r = 0; r < 5000; r++) {
    const tf = Q.buildQuestions(ITEMS, 15).filter((q) => q.kind === "true-false");
    assert.strictEqual(tf.length, 3);
    const n = tf.filter((q) => q.options[q.correctIndex] === "正確").length;
    assert.ok(n === 1 || n === 2, "session with " + n + " true");
    tTrue += n;
    tAll += tf.length;
  }
  const share = tTrue / tAll;
  assert.ok(Math.abs(share - 0.5) <= 0.05, "true share " + share);
});

// ---------------------------------------------------------------- synonym exclusion is really exercised
t("the synonym guard matters: groups and similar meanings exist among the candidates the generator could have picked", () => {
  const pairs = [];
  GROUPS.forEach((g) => g.forEach((a, i) => g.slice(i + 1).forEach((b) => pairs.push([byText[a], byText[b]]))));
  assert.ok(pairs.length > 150);
  assert.ok(pairs.every(([a, b]) => Q.related(a, b)));
});

// ---------------------------------------------------------------- 成語稱號 compatibility
t("成語稱號: progress stays derived from attempts in stages of 8 — nobody's existing title goes down", () => {
  assert.strictEqual(Q.STAGE_SIZE, 8);
  assert.strictEqual(Q.QUESTION_COUNT, 15);
  const tierOf = (a) => getIdiomMasteryTier(Q.stagesFromAttempts(a)).title;
  assert.strictEqual(Q.stagesFromAttempts(0), 0);
  assert.strictEqual(Q.stagesFromAttempts(23), 2);
  assert.strictEqual(Q.stagesFromAttempts(24), 3);
  assert.strictEqual(Q.stagesFromAttempts(80), 10);
  assert.strictEqual(Q.stagesFromAttempts("junk"), 0);
  assert.strictEqual(Q.stagesFromAttempts(-5), 0);
  // the same attempts give the same title as the pre-9b formula floor(attempts / 8)
  for (let a = 0; a < 700; a += 7) assert.strictEqual(tierOf(a), getIdiomMasteryTier(Math.floor(a / 8)).title);
  assert.strictEqual(tierOf(80), "舉人");
  // a finished session adds 15 and never lowers the title
  for (let a = 0; a < 700; a++) assert.ok(Q.stagesFromAttempts(a + 15) >= Q.stagesFromAttempts(a));
  // sessions needed to the next title
  assert.strictEqual(Q.sessionsToReach(0, 3), 2); // 24 questions -> 2 sessions of 15
  assert.strictEqual(Q.sessionsToReach(23, 3), 1);
  assert.strictEqual(Q.sessionsToReach(15, 3), 1);
  assert.strictEqual(Q.sessionsToReach(0, 8), 5); // 64 -> 5
  for (let a = 0; a < 200; a++) assert.ok(Q.stagesFromAttempts(a + Q.sessionsToReach(a, 3) * 15) >= 3);
});

// ---------------------------------------------------------------- register (書面語)
t("new strings contain no colloquial Cantonese, and no question text uses 同 as 'and'", () => {
  const files = ["idiomQuiz.jsx", "quizPlan.jsx", "IdiomModule.jsx"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"));
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻/;
  files.forEach((src) => assert.ok(!bad.test(src), "colloquial wording found"));
  // question wording around the quoted idiom / meaning (those come from the content files and may legitimately contain 同, e.g. 同床異夢)
  for (let r = 0; r < 50; r++) {
    Q.buildQuestions(ITEMS, 15).forEach((q) => {
      [q.label, q.ask && q.ask.replace(/「.*?」(?=的意思是|是什麼意思)/g, "").replace(/「.+」。這個說法正確嗎？/, "")].filter(Boolean).forEach((x) => assert.ok(!/同/.test(x), x));
    });
  }
  // the labels the module shows
  const labels = new Set();
  for (let r = 0; r < 50; r++) Q.buildQuestions(ITEMS, 15).forEach((q) => q.label && labels.add(q.label));
  labels.forEach((l) => assert.ok(!/同/.test(l), l));
});

t.done();
