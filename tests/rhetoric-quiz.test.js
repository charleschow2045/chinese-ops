// 階段 9a — tests for the 修辭手法 question generator (src/rhetoricQuiz.jsx) and the fields it relies on
// (confusableWith, alsoDevices, RHETORIC_EFFECT_CLASHES). Runs — node tests/rhetoric-quiz.test.js
// The generator is plain JavaScript with no screen code, so it is loaded into a node:vm sandbox exactly as the browser
// loads it and run thousands of times with a seeded Math.random; every generated question is checked for exactly one
// defensible answer.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("rhetoric-quiz");

function load(seed) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  let s = seed >>> 0;
  ctx.Math = Object.create(Math);
  ctx.Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (const f of ["quizUtils.jsx", "content/rhetoricContent.jsx", "rhetoricQuiz.jsx"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
  }
  return ctx.window.App;
}

const App = load(20261024);
const { RHETORIC_DEVICES: DEVICES, RHETORIC_PRACTICE_SENTENCES: SENTENCES, RHETORIC_EFFECT_CLASHES: CLASHES } = App.Content;
const Q = App.RhetoricQuiz;
const NAMES = DEVICES.map((d) => d.name);
const byName = Object.fromEntries(DEVICES.map((d) => [d.name, d]));
const bySentence = Object.fromEntries(SENTENCES.map((s) => [s.sentence, s]));
const byId = Object.fromEntries(SENTENCES.map((s) => [s.id, s]));
const also = (s) => Array.from(s.alsoDevices || []);
const uses = (s, name) => s.device === name || also(s).includes(name);
const clash = (a, b) => CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const same = (a, b) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

// The sentences the user approved as using a second device (階段 9a review). Anything else needs a new approval.
const APPROVED_ALSO = { "paibi-4": ["比喻"], "duiou-4": ["對比"], "duiou-12": ["對比"] };
const LEVELS = [null, "p5", "p6", "s1"];
const poolFor = (lv) => (lv ? SENTENCES.filter((s) => s.level === lv) : SENTENCES);

// ---------------------------------------------------------------- content fields
t("alsoDevices: exactly the approved sentences, each naming an existing, different device", () => {
  const got = {};
  SENTENCES.forEach((s) => {
    if (s.alsoDevices === undefined) return;
    assert.ok(Array.isArray(s.alsoDevices) && s.alsoDevices.length >= 1, `${s.id}: alsoDevices must be a non-empty array`);
    s.alsoDevices.forEach((n) => {
      assert.ok(NAMES.includes(n), `${s.id}: unknown device ${n}`);
      assert.notStrictEqual(n, s.device, `${s.id}: alsoDevices repeats its own device`);
    });
    assert.strictEqual(new Set(s.alsoDevices).size, s.alsoDevices.length, `${s.id}: duplicate in alsoDevices`);
    got[s.id] = Array.from(s.alsoDevices);
  });
  same(got, APPROVED_ALSO);
});

t("confusableWith: 1–3 existing devices each, never itself, and two-way", () => {
  DEVICES.forEach((d) => {
    const c = Array.from(d.confusableWith || []);
    assert.ok(c.length >= 1 && c.length <= 3, `${d.name}: ${c.length} confusable devices`);
    assert.strictEqual(new Set(c).size, c.length, `${d.name}: duplicate`);
    c.forEach((n) => {
      assert.ok(NAMES.includes(n), `${d.name}: unknown ${n}`);
      assert.notStrictEqual(n, d.name);
      assert.ok(Array.from(byName[n].confusableWith || []).includes(d.name), `${d.name} lists ${n} but ${n} does not list ${d.name}`);
    });
  });
});

t("effect clash list: valid, no duplicates, no pair of identical effects, every device keeps a clash-free option set", () => {
  const seen = new Set();
  CLASHES.forEach(([a, b]) => {
    assert.ok(NAMES.includes(a) && NAMES.includes(b) && a !== b, `bad pair ${a} ${b}`);
    const key = [a, b].sort().join("|");
    assert.ok(!seen.has(key), `duplicate pair ${key}`);
    seen.add(key);
  });
  assert.strictEqual(new Set(DEVICES.map((d) => d.effect)).size, DEVICES.length, "effect texts must be unique");
  // for every device a set of 4 mutually non-clashing devices must exist, or a 作用 question could not be built
  NAMES.forEach((n) => {
    const ok = NAMES.filter((x) => x !== n && !clash(x, n));
    let found = false;
    for (let i = 0; i < ok.length && !found; i++) for (let j = i + 1; j < ok.length && !found; j++) for (let k = j + 1; k < ok.length; k++) {
      if (!clash(ok[i], ok[j]) && !clash(ok[i], ok[k]) && !clash(ok[j], ok[k])) { found = true; break; }
    }
    assert.ok(found, `${n}: no clash-free set of 3 other devices`);
  });
});

// ---------------------------------------------------------------- generator, structure
t("a session is 15 questions: 5 kinds in turn, 3 of each (full pool and every level)", () => {
  assert.strictEqual(Q.QUESTION_COUNT, 15);
  for (const lv of LEVELS) {
    for (let r = 0; r < 60; r++) {
      const pool = poolFor(lv);
      const qs = Q.buildQuestions(pool, Q.QUESTION_COUNT);
      assert.strictEqual(qs.length, 15);
      const counts = {};
      qs.forEach((q) => { counts[q.kind] = (counts[q.kind] || 0) + 1; });
      Q.KINDS.forEach((k) => assert.strictEqual(counts[k], 3, `${lv}: kind ${k} appears ${counts[k]} times`));
    }
  }
});

t("every question: sentence id exists, 4 distinct options (2 for 是非題), valid correctIndex, itemId returned", () => {
  for (let r = 0; r < 400; r++) {
    Q.buildQuestions(poolFor(LEVELS[r % 4]), 15).forEach((q) => {
      assert.ok(byId[q.itemId], `unknown itemId ${q.itemId}`);
      const n = q.kind === "true-false" ? 2 : 4;
      assert.strictEqual(q.options.length, n, `${q.kind}: ${q.options.length} options`);
      assert.strictEqual(new Set(q.options).size, n, `${q.kind}: repeated option`);
      assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < n);
      assert.ok(typeof q.ask === "string" && q.ask.length > 0);
    });
  }
});

// ---------------------------------------------------------------- generator, one defensible answer
t("device / effect questions: right answer is the sentence's device, wrong ones never its alsoDevices, ≥2 confusable wrong options", () => {
  let seenDevice = 0, seenEffect = 0;
  for (let r = 0; r < 600; r++) {
    Q.buildQuestions(poolFor(LEVELS[r % 4]), 15).forEach((q) => {
      if (q.kind !== "device" && q.kind !== "effect") return;
      const s = byId[q.itemId];
      const asDevice = (opt) => (q.kind === "device" ? opt : NAMES.find((n) => byName[n].effect === opt));
      assert.strictEqual(q.sentence, s.sentence);
      const right = asDevice(q.options[q.correctIndex]);
      assert.strictEqual(right, s.device);
      const wrong = q.options.filter((_, i) => i !== q.correctIndex).map(asDevice);
      assert.ok(wrong.every(Boolean), "an option is not a device / effect text");
      wrong.forEach((w) => assert.ok(!also(s).includes(w), `${s.id}: ${w} is one of its alsoDevices`));
      // 作用 questions must not offer an effect that is too close to the right one, so such a device cannot be a wrong option there
      const conf = Array.from(byName[s.device].confusableWith).filter((c) => !also(s).includes(c) && (q.kind === "device" || !clash(c, s.device)));
      assert.ok(wrong.filter((w) => conf.includes(w)).length >= Math.min(2, conf.length), `${s.id} ${q.kind}: too few confusable wrong options (${wrong})`);
      if (q.kind === "effect") {
        assert.ok(q.ask.includes(`「${s.device}」`));
        [right, ...wrong].forEach((a, i, all) => all.slice(i + 1).forEach((b) => assert.ok(!clash(a, b), `${s.id}: effects of ${a} and ${b} are too close`)));
        seenEffect++;
      } else seenDevice++;
    });
  }
  assert.ok(seenDevice > 1000 && seenEffect > 1000);
});

t("find-sentence: exactly one option uses the asked device (device or alsoDevices); the other three use none of it", () => {
  let n = 0;
  for (let r = 0; r < 800; r++) {
    Q.buildQuestions(poolFor(LEVELS[r % 4]), 15).forEach((q) => {
      if (q.kind !== "find-sentence") return;
      n++;
      assert.strictEqual(q.sentence, null);
      const target = (/「(.+)」/.exec(q.ask) || [])[1];
      assert.ok(NAMES.includes(target), `ask names no device: ${q.ask}`);
      const opts = q.options.map((o) => bySentence[o]);
      assert.ok(opts.every(Boolean), "an option is not a practice sentence");
      assert.strictEqual(opts[q.correctIndex].id, q.itemId);
      assert.strictEqual(opts[q.correctIndex].device, target);
      assert.strictEqual(opts.filter((s) => uses(s, target)).length, 1, `${q.ask}: more than one option uses ${target}`);
      assert.strictEqual(new Set(opts.map((s) => s.device)).size, 4, "the four sentences should show four different devices");
    });
  }
  assert.ok(n > 1500);
});

t("find-sentence: confusable devices are preferred for the wrong sentences", () => {
  for (let r = 0; r < 300; r++) {
    Q.buildQuestions(SENTENCES, 15).forEach((q) => {
      if (q.kind !== "find-sentence") return;
      const target = byId[q.itemId].device;
      const conf = Array.from(byName[target].confusableWith);
      const wrongDevices = q.options.filter((_, i) => i !== q.correctIndex).map((o) => bySentence[o].device);
      assert.ok(wrongDevices.filter((d) => conf.includes(d)).length >= Math.min(2, conf.length), `${target}: ${wrongDevices}`);
    });
  }
});

t("true-false: stem never has alsoDevices; the claim is right or a confusable device; correctIndex agrees; about half are true", () => {
  let n = 0, trueCount = 0;
  for (let r = 0; r < 800; r++) {
    const qs = Q.buildQuestions(poolFor(LEVELS[r % 4]), 15).filter((q) => q.kind === "true-false");
    let trues = 0;
    qs.forEach((q) => {
      const s = byId[q.itemId];
      assert.strictEqual(also(s).length, 0, `${s.id} has alsoDevices but is a 是非題 stem`);
      assert.strictEqual(q.sentence, s.sentence);
      same(q.options, ["正確", "不正確"]);
      const claim = (/「(.+)」。這個說法正確嗎？/.exec(q.ask) || [])[1];
      assert.ok(NAMES.includes(claim), q.ask);
      if (q.correctIndex === 0) {
        assert.strictEqual(claim, s.device);
        trues++;
      } else {
        assert.notStrictEqual(claim, s.device);
        assert.ok(Array.from(byName[s.device].confusableWith).includes(claim), `${s.id}: false claim ${claim} is not a confusable device`);
        assert.ok(!uses(s, claim));
      }
    });
    assert.strictEqual(qs.length, 3);
    assert.ok(trues === 1 || trues === 2, `a session had ${trues} true statements out of 3`);
    n += 3; trueCount += trues;
  }
  assert.ok(Math.abs(trueCount / n - 0.5) < 0.2, `true share ${trueCount / n}`);
});

t("effect-device: the effect belongs to the right option; no two options have clashing effects", () => {
  let n = 0;
  for (let r = 0; r < 800; r++) {
    Q.buildQuestions(poolFor(LEVELS[r % 4]), 15).forEach((q) => {
      if (q.kind !== "effect-device") return;
      n++;
      const s = byId[q.itemId];
      assert.strictEqual(q.sentence, null);
      const effect = (/的作用是「(.+)」？$/.exec(q.ask) || [])[1];
      assert.strictEqual(effect, byName[s.device].effect.replace(/。$/, ""), "the effect is quoted without its final 。");
      assert.ok(!/。」/.test(q.ask), q.ask);
      assert.strictEqual(q.options[q.correctIndex], s.device);
      assert.ok(q.options.every((o) => NAMES.includes(o)));
      q.options.forEach((a, i) => q.options.slice(i + 1).forEach((b) => assert.ok(!clash(a, b), `${a} / ${b} have close effects`)));
      const conf = Array.from(byName[s.device].confusableWith).filter((c) => !clash(c, s.device));
      const wrong = q.options.filter((_, i) => i !== q.correctIndex);
      assert.ok(wrong.filter((w) => conf.includes(w)).length >= Math.min(2, conf.length), `${s.device}: too few confusable wrong options (${wrong})`);
    });
  }
  assert.ok(n > 1500);
});

// ---------------------------------------------------------------- generator, review sessions and small pools
t("練習錯題 sessions (chooseFrom = a few sentences): only those sentences are asked about, every rule still holds", () => {
  const cases = [["paibi-4"], ["duiou-4", "duiou-12"], ["biyu-1", "niren-1", "paibi-4"], ["paibi-4", "duiou-4", "duiou-12"]];
  cases.forEach((ids) => {
    const choose = ids.map((id) => byId[id]);
    for (let r = 0; r < 120; r++) {
      const qs = Q.buildQuestions(SENTENCES, 15, choose);
      assert.strictEqual(qs.length, 15);
      qs.forEach((q) => {
        assert.ok(ids.includes(q.itemId), `${q.itemId} is not a mistake sentence`);
        if (q.kind === "true-false") assert.strictEqual(also(byId[q.itemId]).length, 0, "是非題 stem with alsoDevices");
        if (q.kind === "find-sentence") {
          const target = byId[q.itemId].device;
          assert.strictEqual(q.options.map((o) => bySentence[o]).filter((s) => uses(s, target)).length, 1);
        }
        assert.strictEqual(q.options[q.correctIndex] === undefined, false);
      });
    }
  });
});

t("a level-filtered pool (as small as 4 sentences) still gives 15 valid questions", () => {
  const small = [byId["biyu-1"], byId["niren-1"], byId["kuazhang-1"], byId["paibi-1"]];
  for (let r = 0; r < 200; r++) {
    const qs = Q.buildQuestions(small, 15);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => {
      assert.ok(byId[q.itemId]);
      assert.ok(q.options.length >= 2 && q.correctIndex >= 0);
      if (q.kind === "find-sentence") assert.strictEqual(new Set(q.options).size, 4);
    });
  }
});

// ---------------------------------------------------------------- register (書面語) of the new text
t("new strings contain no colloquial Cantonese", () => {
  const files = ["rhetoricQuiz.jsx", "RhetoricModule.jsx"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"));
  const bad = /呢個|咩|嘅|咗|唔|喺|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|即刻/;
  files.forEach((src) => assert.ok(!bad.test(src), "colloquial wording found"));
  // 「同」 used as 「和」 between two nouns: none of the new question texts uses 同 at all
  Q.buildQuestions(SENTENCES, 15).forEach((q) => assert.ok(!/同/.test(q.ask), q.ask));
});

t.done();
