// 階段 9b-2 — tests for the 詩詞 question generator (src/poetryQuiz.jsx, src/quizPlan.jsx).
// Runs — node tests/poetry-quiz.test.js
// The generator is plain JavaScript with no screen code, so it is loaded into a node:vm sandbox exactly as the browser loads it and run
// thousands of times with a seeded Math.random; every generated question is checked for exactly one defensible answer. Cases the real
// library does not contain yet (the same line in two poems, a poem without annotations, fewer than four dynasties …) are tested with
// small synthetic libraries passed as the generator's fourth argument.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("poetry-quiz");

function load(seed) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  let s = seed >>> 0;
  ctx.Math = Object.create(Math);
  ctx.Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (const f of ["quizUtils.jsx", "quizPlan.jsx", "content/poetryContent.jsx", "poetryQuiz.jsx"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
  }
  return ctx.window.App;
}

const App = load(20261024);
const { POETRY_ITEMS: ITEMS } = App.Content;
const Q = App.PoetryQuiz;
const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const real = (l) => /[一-鿿]/.test(l);
const LEVELS = [null, "p5", "p6", "s1"];
const poolFor = (lv) => (lv ? ITEMS.filter((i) => i.level === lv) : ITEMS);
const stripDot = (m) => m.replace(/。$/, "");
const clone = (x) => JSON.parse(JSON.stringify(x));
const KINDS = Array.from(Q.KINDS);

// independent helpers (not the generator's own)
const lineCount = (lib) => {
  const m = new Map();
  lib.forEach((p) => p.lines.filter(real).forEach((l) => m.set(l, (m.get(l) || 0) + 1)));
  return m;
};
const baseTitle = (x) => x.replace(/[（(].*?[）)]/g, "").trim();
const sharesWord = (a, b) => {
  const A = stripDot(a).replace(/[，。；：、？！「」『』（）《》\s]/g, "");
  const B = stripDot(b).replace(/[，。；：、？！「」『』（）《》\s]/g, "");
  for (let i = 0; i + 2 <= A.length; i++) if (B.includes(A.slice(i, i + 2))) return true;
  return false;
};

// Returns a list of problems in one question ([] = fine). `lib` is the library the question was generated from.
function problems(q, lib) {
  const out = [];
  const item = lib.find((i) => i.id === q.itemId);
  if (!item) return ["unknown itemId " + q.itemId];
  const opts = q.options;
  if (opts.length !== 4) out.push("needs 4 options, has " + opts.length);
  if (new Set(opts).size !== opts.length) out.push("duplicate options");
  if (!(q.correctIndex >= 0 && q.correctIndex < opts.length)) return out.concat("bad correctIndex");
  const correct = opts[q.correctIndex];
  const wrong = opts.filter((_, i) => i !== q.correctIndex);
  if (opts.some((o) => o === "……" || !o)) out.push("empty or omission option");
  switch (q.kind) {
    case "fill": {
      if (item.lines[q.blankIndex] !== correct) out.push("correct option is not the blanked line");
      if (!real(correct)) out.push("blanked line is not a real line");
      wrong.forEach((w) => {
        if (!real(w)) out.push("wrong option is not a real line");
        if (item.lines.includes(w)) out.push("wrong option is a line of the same poem: " + w);
      });
      break;
    }
    case "author": {
      if (correct !== item.author) out.push("correct is not the author");
      wrong.forEach((w) => {
        if (w === item.author) out.push("wrong option equals the author");
        if (!lib.some((p) => p.author === w)) out.push("unknown author " + w);
      });
      break;
    }
    case "meaning": {
      if (correct !== item.meaningQuiz) out.push("correct is not meaningQuiz");
      if (!real(q.stem) || !item.lines.includes(q.stem)) out.push("stem is not a real line of the poem");
      wrong.forEach((w) => {
        if (w === item.meaningQuiz) out.push("wrong option equals the right meaning");
        if (!lib.some((p) => p.id !== item.id && p.meaningQuiz === w)) out.push("wrong meaning belongs to no other poem");
      });
      break;
    }
    case "next-line": {
      const i = item.lines.indexOf(q.stem);
      if (i < 0 || item.lines.lastIndexOf(q.stem) !== i) out.push("stem missing or repeated in its poem");
      if (!real(q.stem) || !real(item.lines[i + 1] || "")) out.push("stem or next line is not real (……)");
      if (item.lines[i + 1] !== correct) out.push("correct is not the directly following line");
      wrong.forEach((w) => {
        if (item.lines.includes(w)) out.push("wrong option is a line of the same poem: " + w);
        if (!real(w)) out.push("wrong option is not a real line");
      });
      break;
    }
    case "line-title": {
      const counts = lineCount(lib);
      if (counts.get(q.stem) !== 1) out.push("stem line occurs " + counts.get(q.stem) + " times in the library");
      if (!item.lines.includes(q.stem)) out.push("stem is not a line of the answer poem");
      if (correct !== `《${item.title}》`) out.push("correct is not the title");
      if (q.stem.includes(baseTitle(item.title))) out.push("line contains its own title");
      wrong.forEach((w) => {
        const title = w.replace(/^《|》$/g, "");
        const owner = lib.filter((p) => p.title === title);
        if (!owner.length) return out.push("unknown title " + w);
        if (owner.some((p) => p.lines.includes(q.stem))) out.push("wrong title also contains the line: " + w);
        if (baseTitle(title) === baseTitle(item.title)) out.push("wrong title has the same base title: " + w);
      });
      break;
    }
    case "annotation": {
      const a = (item.annotations || []).find((x) => x.term === q.term);
      if (!a) return out.concat("term is not an annotation of the poem");
      if (correct !== stripDot(a.meaning)) out.push("correct is not the term's meaning");
      if (/。$/.test(opts.join(""))) out.push("an option ends with 。");
      wrong.forEach((w) => {
        const owners = [];
        lib.forEach((p) => (p.annotations || []).forEach((b) => stripDot(b.meaning) === w && owners.push(b)));
        if (!owners.length) return out.push("wrong meaning belongs to no annotation");
        if (owners.every((b) => b.term === a.term)) out.push("wrong meaning belongs to the same term");
        if (sharesWord(w, a.meaning)) out.push(`wrong meaning "${w}" shares a word with "${a.meaning}"`);
      });
      break;
    }
    case "dynasty": {
      if (correct !== item.dynasty) out.push("correct is not the dynasty");
      wrong.forEach((w) => {
        if (w === item.dynasty) out.push("wrong equals the right dynasty");
        if ((w === "春秋" && item.dynasty === "戰國") || (w === "戰國" && item.dynasty === "春秋")) out.push("春秋/戰國 offered together");
        if (item.author === "陶淵明" && w === "宋") out.push("宋 offered for 陶淵明");
      });
      break;
    }
    default:
      out.push("unknown kind " + q.kind);
  }
  return out;
}

function sessionProblems(qs, lib) {
  const out = [];
  if (qs.length !== 15) out.push("session has " + qs.length + " questions");
  qs.forEach((q, i) => {
    problems(q, lib).forEach((p) => out.push(`#${i + 1} ${q.kind}: ${p}`));
    if (i && qs[i - 1].kind === q.kind) out.push(`#${i + 1}: same kind twice in a row (${q.kind})`);
  });
  return out;
}

// ---------------------------------------------------------------- session shape
t("a session is 15 questions over 7 kinds: every kind at least twice (one kind three times), never the same kind twice in a row", () => {
  for (const lv of LEVELS) {
    for (let r = 0; r < 300; r++) {
      const qs = Q.buildQuestions(poolFor(lv), 15);
      assert.strictEqual(qs.length, 15);
      const count = {};
      qs.forEach((q) => (count[q.kind] = (count[q.kind] || 0) + 1));
      assert.deepStrictEqual(Object.keys(count).sort(), KINDS.slice().sort());
      const counts = Object.values(count).sort();
      assert.deepStrictEqual(JSON.parse(JSON.stringify(counts)), [2, 2, 2, 2, 2, 2, 3], `${lv}: ${JSON.stringify(count)}`);
      qs.forEach((q, i) => i && assert.notStrictEqual(qs[i - 1].kind, q.kind));
    }
  }
});

t("the kind order is random, and the kind that appears three times varies", () => {
  const orders = new Set();
  const triple = new Set();
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    orders.add(qs.map((q) => q.kind).join());
    const c = {};
    qs.forEach((q) => (c[q.kind] = (c[q.kind] || 0) + 1));
    triple.add(Object.keys(c).find((k) => c[k] === 3));
  }
  assert.ok(orders.size > 250, "only " + orders.size + " different orders");
  assert.strictEqual(triple.size, 7);
});

t("every question has an itemId of a real poem, and 15 questions use 15 different poems when the pool is big enough", () => {
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    qs.forEach((q) => assert.ok(byId[q.itemId]));
    assert.strictEqual(new Set(qs.map((q) => q.itemId)).size, 15);
  }
});

// ---------------------------------------------------------------- unique answer, large sampling
t("5000 sessions over the full library: every question has exactly one defensible answer (0 violations)", () => {
  let bad = [];
  for (let r = 0; r < 5000 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(ITEMS, 15), ITEMS));
  assert.deepStrictEqual(bad.slice(0, 5), []);
});

t("level pools (p5 / p6 / s1, 1000 sessions each): 0 violations", () => {
  for (const lv of ["p5", "p6", "s1"]) {
    let bad = [];
    for (let r = 0; r < 1000 && bad.length < 5; r++) bad = bad.concat(sessionProblems(Q.buildQuestions(poolFor(lv), 15), ITEMS));
    assert.deepStrictEqual(bad.slice(0, 5), [], lv);
  }
});

t("a 10-poem scope pool (like the 戰爭詩詞 tab): 1500 sessions, 0 violations", () => {
  let bad = [];
  for (let r = 0; r < 1500 && bad.length < 5; r++) {
    const scope = [];
    while (scope.length < 10) {
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (!scope.includes(it)) scope.push(it);
    }
    const qs = Q.buildQuestions(scope, 15);
    bad = bad.concat(sessionProblems(qs, ITEMS));
    qs.forEach((q) => assert.ok(scope.some((p) => p.id === q.itemId)));
  }
  assert.deepStrictEqual(bad.slice(0, 5), []);
});

t("練習錯題 (chooseFrom a small set, pool = whole library): only those poems are asked, 0 violations", () => {
  for (let r = 0; r < 800; r++) {
    const size = 1 + (r % 12);
    const pick = [];
    while (pick.length < size) {
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (!pick.includes(it)) pick.push(it);
    }
    const qs = Q.buildQuestions(ITEMS, 15, pick);
    assert.deepStrictEqual(sessionProblems(qs, ITEMS).filter((p) => !/same kind twice/.test(p) || size > 1), []);
    qs.forEach((q) => assert.ok(pick.some((p) => p.id === q.itemId)));
  }
});

t("poems with a '……' omission line never produce '……' as stem, answer or option (節錄 poems asked on their own)", () => {
  const omitted = ITEMS.filter((p) => p.lines.some((l) => !real(l)));
  assert.ok(omitted.length >= 2);
  for (let r = 0; r < 500; r++) {
    const qs = Q.buildQuestions(ITEMS, 15, omitted);
    assert.deepStrictEqual(sessionProblems(qs, ITEMS).filter((p) => !/same kind twice/.test(p)), []);
    qs.forEach((q) => {
      assert.ok(!q.options.includes("……"));
      if (q.stem) assert.ok(real(q.stem));
    });
  }
});

// ---------------------------------------------------------------- synthetic libraries
t("a line that occurs in two poems is never asked in 詩句配詩題, and is never a next-line distractor for the poem that owns it", () => {
  const a = clone(byId["jing-ye-si"]);
  const b = clone(byId["jing-ye-si"]);
  b.id = "jing-ye-si-copy";
  b.title = "靜夜思（異文）"; // same lines, different title
  const lib = ITEMS.filter((p) => p.id !== "jing-ye-si").concat([a, b]);
  const shared = new Set(a.lines);
  for (let r = 0; r < 1500; r++) {
    const qs = Q.buildQuestions(lib, 15, [a, b], lib);
    qs.forEach((q) => {
      if (q.kind === "line-title") assert.ok(!shared.has(q.stem), "asked a line that occurs in two poems: " + q.stem);
    });
    assert.deepStrictEqual(sessionProblems(qs, lib).filter((p) => !/same kind twice/.test(p)), []);
  }
  // sanity: without the duplicate the same poem does get 詩句配詩題 questions
  let seen = 0;
  for (let r = 0; r < 100; r++) seen += Q.buildQuestions(ITEMS, 15, [byId["jing-ye-si"]]).filter((q) => q.kind === "line-title").length;
  assert.ok(seen > 100);
});

t("a poem without annotations never gets a 字詞註釋 question; kinds fall back without an empty question", () => {
  const lib = ITEMS.map((p) => Object.assign(clone(p), { annotations: undefined }));
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(lib, 15, lib.slice(0, 6), lib);
    assert.strictEqual(qs.length, 15);
    assert.ok(qs.every((q) => q.kind !== "annotation"));
    assert.deepStrictEqual(sessionProblems(qs, lib).filter((p) => !/same kind twice/.test(p)), []);
  }
  // only some poems annotated: annotation questions come from those poems only
  const mixed = ITEMS.map((p, i) => (i % 2 ? Object.assign(clone(p), { annotations: [] }) : p));
  for (let r = 0; r < 300; r++) {
    Q.buildQuestions(mixed, 15, mixed, mixed).forEach((q) => {
      if (q.kind === "annotation") assert.ok(mixed.find((p) => p.id === q.itemId).annotations.length > 0);
    });
  }
});

t("a poem whose lines cannot make a next-line / title question falls back to other kinds", () => {
  const weird = clone(byId["jing-ye-si"]);
  weird.id = "weird";
  weird.lines = ["春風又綠江南岸，", "春風又綠江南岸，", "……", "明月何時照我還。"]; // repeated stem, an omission line
  const lib = ITEMS.concat([weird]);
  for (let r = 0; r < 300; r++) {
    const qs = Q.buildQuestions(lib, 15, [weird], lib);
    assert.strictEqual(qs.length, 15);
    assert.ok(qs.every((q) => q.kind !== "next-line"), "next-line from a work with no usable neighbouring lines");
    qs.forEach((q) => assert.ok(q.options.length === 4 && q.correctIndex >= 0 && !q.options.includes("……")));
  }
});

t("朝代: with fewer than four dynasties in the library the options are padded to four distinct, unambiguous dynasties", () => {
  const lib = ITEMS.filter((p) => p.dynasty === "唐" || p.dynasty === "宋");
  for (let r = 0; r < 600; r++) {
    const qs = Q.buildQuestions(lib, 15, lib, lib);
    qs.filter((q) => q.kind === "dynasty").forEach((q) => {
      assert.strictEqual(q.options.length, 4);
      assert.strictEqual(new Set(q.options).size, 4);
      assert.deepStrictEqual(problems(q, lib), []);
    });
  }
});

t("朝代 on the real library: 春秋 and 戰國 are never offered against each other, 陶淵明 never gets 宋 as a wrong option", () => {
  const spring = ITEMS.filter((p) => p.dynasty === "春秋" || p.dynasty === "戰國" || p.author === "陶淵明");
  assert.ok(spring.length >= 4);
  let asked = 0;
  for (let r = 0; r < 1500; r++) {
    Q.buildQuestions(ITEMS, 15, spring).forEach((q) => {
      if (q.kind === "dynasty") {
        asked++;
        assert.deepStrictEqual(problems(q, ITEMS), []);
      }
    });
  }
  assert.ok(asked > 300);
});

// ---------------------------------------------------------------- data checks the questions rely on
t("the real library has what the new kinds need: 6 dynasties, every poem annotated, a usable next-line and title stem", () => {
  assert.ok(new Set(ITEMS.map((p) => p.dynasty)).size >= 4);
  ITEMS.forEach((p) => {
    assert.ok(p.dynasty, p.id + " has no dynasty");
    assert.ok((p.annotations || []).length > 0, p.id + " has no annotations");
    assert.ok(Q.nextLineStems(p).length > 0, p.id + " has no next-line stem");
    assert.ok(Q.titleStems(p, ITEMS).length > 0, p.id + " has no title stem");
  });
});

// ---------------------------------------------------------------- register (書面語)
t("new strings contain no colloquial Cantonese, and the question wording uses no 同", () => {
  const files = ["poetryQuiz.jsx", "PoetryModule.jsx"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"));
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻/;
  files.forEach((src) => assert.ok(!bad.test(src), "colloquial wording found"));
  // (the one 同 in the generator is the pattern /^同「/ that recognises annotations of the form 同「現」 — a data pattern, not wording)
  files.forEach((src) => assert.ok(!/同/.test(src.replace(/\/\/.*$/gm, "").replace(/\/\^同「\//g, "")), "同 used in a string"));
  Q.buildQuestions(ITEMS, 15).forEach((q) => {
    const wording = (q.ask || "").replace(/《.*?》/g, "").replace(/「.*?」/g, "");
    assert.ok(!/同/.test(wording), wording);
  });
});

t.done();
