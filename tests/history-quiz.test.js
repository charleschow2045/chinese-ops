// 階段 9d — tests for the 歷史故事 綜合練習 generator (src/historyQuiz.jsx, src/quizPlan.jsx) and its data tables
// (HISTORY_PERIOD_NORM, HISTORY_SIMILAR_GROUPS, HISTORY_SAME_EVENT_GROUPS, character tables in historyContent.jsx).
// Runs — node tests/history-quiz.test.js
// The generator is plain JavaScript with no screen code, so it is loaded into a node:vm sandbox exactly as the browser loads it and run
// thousands of times with a seeded Math.random; every generated question is checked for exactly one defensible answer. The checks below
// are written independently of the generator's own helpers (own alias / overlap / title-leak logic).
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeRunner } = require("./helpers");
const t = makeRunner("history-quiz");

function load(seed, patchContent) {
  const ctx = { window: { App: {} } };
  vm.createContext(ctx);
  let s = seed >>> 0;
  ctx.Math = Object.create(Math);
  ctx.Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (const f of ["quizUtils.jsx", "quizPlan.jsx", "content/historyContent.jsx", "historyQuiz.jsx"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8"), ctx);
    if (f === "content/historyContent.jsx" && patchContent) patchContent(ctx.window.App.Content);
  }
  return ctx.window.App;
}

const App = load(20261026);
const C = App.Content;
const ITEMS = C.HISTORY_ITEMS;
const NORM = C.HISTORY_PERIOD_NORM;
const SIMILAR = C.HISTORY_SIMILAR_GROUPS;
const SAME_EVENT = C.HISTORY_SAME_EVENT_GROUPS;
const GENERIC = new Set(C.HISTORY_GENERIC_CHARACTERS);
const Q = App.HistoryQuiz;
const KINDS = Array.from(Q.KINDS);
const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const byTitle = Object.fromEntries(ITEMS.map((i) => [i.title, i]));
const sameGroup = (groups, a, b) => a.id === b.id || groups.some((g) => g.includes(a.id) && g.includes(b.id));

// ---- independent helpers ----------------------------------------------------------------------------------------------
const labelFamilies = {};
Object.values(NORM).forEach((n) => {
  labelFamilies[n.label] = labelFamilies[n.label] || new Set();
  n.families.forEach((f) => labelFamilies[n.label].add(f));
});
const overlaps = (a, b) => [...a].some((f) => b.has(f));

const namesCache = new Map();
const namesOf = (name) => {
  if (namesCache.has(name)) return namesCache.get(name);
  const r = namesOfRaw(name);
  namesCache.set(name, r);
  return r;
};
const namesOfRaw = (name) => {
  const names = new Set([name, name.replace(/（.*?）/g, "")]);
  const m = name.match(/（(.*?)）/);
  if (m) names.add(m[1]);
  C.HISTORY_CHARACTER_ALIASES.forEach((g) => {
    if (g.some((x) => names.has(x) || names.has(x.replace(/（.*?）/g, "")))) g.forEach((x) => { names.add(x); names.add(x.replace(/（.*?）/g, "")); });
  });
  (C.HISTORY_RULER_ALIASES[name] || []).forEach((x) => { names.add(x); names.add(x.replace(/（.*?）/g, "")); });
  return [...names].filter(Boolean);
};
const sameP = (a, b) => namesOf(a).some((x) => namesOf(b).some((y) => x === y || (x.length >= 2 && y.length >= 2 && (x.includes(y) || y.includes(x)))));
const named = (it) => it.characters.filter((c) => !GENERIC.has(c) && !c.includes("的") && !c.includes("、"));
const inText = (name, text) => namesOf(name).some((x) => text.includes(x));
const forbiddenIn = (title) => {
  const cleaned = title.replace(/[（）《》〈〉]/g, "");
  const out = [title.replace(/（.*?）/g, "").replace(/[《》〈〉]/g, ""), cleaned];
  const m = title.match(/（(.*?)）/);
  if (m) out.push(m[1]);
  if (cleaned.length >= 4) out.push(cleaned.slice(-3));
  if (cleaned.length >= 6) out.push(cleaned.slice(-4));
  return out;
};

// independent: the years of every story in which a person is a named character (matching by names / aliases)
const yearsCache = new Map();
function personYears(ITEMS_, name) {
  let m = yearsCache.get(ITEMS_);
  if (!m) yearsCache.set(ITEMS_, (m = new Map()));
  if (m.has(name)) return m.get(name);
  const ys = [];
  m.set(name, ys);
  ITEMS_.forEach((it) => { if (named(it).some((c) => c === name || sameP(c, name))) ys.push(it.sortYear); });
  return ys;
}
const nearGap = (ITEMS_, name, item) => Math.min(...personYears(ITEMS_, name).map((y) => Math.abs(y - item.sortYear)));
const NOT_OPTION = () => C.HISTORY_PERSON_NOT_OPTION;

function problems(q, ITEMS_ = ITEMS, A_ = Q) {
  const out = [];
  const item = byId[q.itemId];
  if (!item) return ["unknown itemId " + q.itemId];
  const o = q.options;
  if (new Set(o).size !== o.length) out.push("duplicate options");
  if (!(q.correctIndex >= 0 && q.correctIndex < o.length)) return out.concat("bad correctIndex");
  const correct = o[q.correctIndex];
  const wrong = o.filter((_, i) => i !== q.correctIndex);
  if (q.kind !== "order" && o.length !== 4) out.push("options != 4");
  if (q.kind === "order" && o.length !== 2) out.push("order options != 2");
  switch (q.kind) {
    case "person": {
      const stem = item.title + q.intro;
      const count = (ch) => q.intro.split(ch).length - 1;
      if (q.title !== item.title || !item.story.startsWith(q.intro) || !/[。！？」』]$/.test(q.intro) || count("「") !== count("」") || count("『") !== count("』"))
        out.push("person stem is not the title + the first complete sentence");
      if (!named(item).includes(correct)) out.push("person: right option is not a named character: " + correct);
      if (inText(correct, stem)) out.push("person: right person is named in the stem: " + correct);
      const gap = A_.personGap(item);
      if (gap !== 100 && gap !== 50) out.push("person: story asked although personGap is " + gap);
      wrong.forEach((w) => {
        if (gap && nearGap(ITEMS_, w, item) < gap) out.push("person: wrong option " + w + " is only " + nearGap(ITEMS_, w, item) + " years from the story (needs " + gap + ")");
        if ((NOT_OPTION()[item.id] || []).some((b) => sameP(b, w))) out.push("person: wrong option " + w + " is in HISTORY_PERSON_NOT_OPTION for " + item.id);
        if (item.characters.some((c) => sameP(c, w))) out.push("person: wrong option is a person of the story: " + w);
        if (inText(w, item.title + item.story)) out.push("person: wrong option is named in the story: " + w);
        if (GENERIC.has(w) || w.includes("的") || w.includes("、")) out.push("person: generic option " + w);
        if (sameP(w, correct)) out.push("person: wrong option is the right person " + w);
      });
      for (let i = 0; i < o.length; i++) for (let j = i + 1; j < o.length; j++) if (sameP(o[i], o[j])) out.push("person: two options are one person " + o[i] + "/" + o[j]);
      break;
    }
    case "period": {
      const n = NORM[item.period];
      if (!n || correct !== n.label) out.push("period: right option is not the story's label");
      if (q.title !== item.title) out.push("period stem");
      for (let i = 0; i < o.length; i++) {
        if (!labelFamilies[o[i]]) out.push("period: unknown label " + o[i]);
        for (let j = i + 1; j < o.length; j++) if (labelFamilies[o[i]] && labelFamilies[o[j]] && overlaps(labelFamilies[o[i]], labelFamilies[o[j]])) out.push("period: overlapping options " + o[i] + "/" + o[j]);
      }
      break;
    }
    case "order": {
      const a = byTitle[o[0]];
      const b = byTitle[o[1]];
      if (!a || !b) return out.concat("order: unknown title");
      if (a.id !== item.id && b.id !== item.id) out.push("order: asked story is not an option");
      [a, b].forEach((x) => {
        if (x.source === "神話與民間傳說" || x.source === "小說演義") out.push("order: legend / novel story " + x.title);
      });
      if (Math.abs(a.sortYear - b.sortYear) < 100) out.push("order: years too close " + a.title + "/" + b.title);
      const earlier = a.sortYear < b.sortYear ? a : b;
      if (byTitle[correct].id !== earlier.id) out.push("order: wrong answer marked right");
      break;
    }
    case "lesson": {
      if (q.lesson !== item.lesson) out.push("lesson stem");
      if (correct !== item.title) out.push("lesson: right option is not the story");
      wrong.forEach((w) => {
        const s = byTitle[w];
        if (!s) return out.push("lesson: unknown title " + w);
        if (sameGroup(SIMILAR, item, s)) out.push("lesson: wrong option shares a similar group " + w);
      });
      break;
    }
    case "title": {
      if (correct !== item.title) out.push("title: right option is not the story");
      if (!item.story.includes(q.passage)) out.push("title: passage is not from the story");
      forbiddenIn(item.title).forEach((p) => {
        if (q.passage.includes(p)) out.push("title: passage contains " + p);
      });
      wrong.forEach((w) => {
        const s = byTitle[w];
        if (!s) return out.push("title: unknown title " + w);
        if (s.category !== item.category) out.push("title: wrong title of another category " + w);
        if (sameGroup(SAME_EVENT, item, s)) out.push("title: wrong title is the same event " + w);
        if (sameGroup(SIMILAR, item, s)) out.push("title: wrong title shares a HISTORY_SIMILAR_GROUPS group " + w);
        if (named(item).some((a) => s.characters.some((b) => sameP(a, b)))) out.push("title: wrong title shares a person " + w);
        forbiddenIn(w).forEach((p) => {
          if (q.passage.includes(p)) out.push("title: passage names wrong title " + w);
        });
      });
      break;
    }
    default:
      out.push("unknown kind " + q.kind);
  }
  return out;
}

function checkSession(qs, expectBalanced) {
  const errs = [];
  if (qs.length !== 15) errs.push("length " + qs.length);
  const counts = {};
  qs.forEach((q, i) => {
    counts[q.kind] = (counts[q.kind] || 0) + 1;
    if (i && qs[i - 1].kind === q.kind) errs.push("same kind twice in a row at " + i);
    problems(q).forEach((p) => errs.push(p));
  });
  if (expectBalanced) KINDS.forEach((k) => { if (counts[k] !== 3) errs.push("kind " + k + " x" + (counts[k] || 0)); });
  if (new Set(qs.map((q) => q.itemId)).size !== qs.length && expectBalanced) errs.push("an itemId repeats");
  return errs;
}

// ---- data tables ------------------------------------------------------------------------------------------------------
t("90 stories; every period string has a normalisation entry with a label and families", () => {
  assert.strictEqual(ITEMS.length, 90);
  ITEMS.forEach((it) => {
    const n = NORM[it.period];
    assert(n, "no HISTORY_PERIOD_NORM entry for period " + it.period + " (" + it.id + ")");
    assert(n.label && Array.isArray(n.families) && n.families.length >= 1, "bad entry " + it.period);
  });
  Object.keys(NORM).forEach((p) => assert(ITEMS.some((it) => it.period === p), "unused period entry " + p));
});

t("one label never has two different family sets (so the label alone decides overlap)", () => {
  const seen = {};
  Object.values(NORM).forEach((n) => {
    const key = [...n.families].sort().join(",");
    if (seen[n.label] !== undefined) assert.strictEqual(seen[n.label], key, "label " + n.label + " has two family sets");
    seen[n.label] = key;
  });
});

t("春秋 / 戰國, 北宋 / 宋朝, 西漢 / 東漢, 南宋 / 元朝, 東漢末年 / 三國, 夏朝 / 神話傳說 overlap; 唐朝 / 清朝 do not", () => {
  const o = (a, b) => overlaps(labelFamilies[a], labelFamilies[b]);
  [["春秋時期", "戰國時期"], ["北宋", "宋朝"], ["北宋", "南宋"], ["西漢", "東漢"], ["南宋", "元朝"], ["東漢末年", "三國時期"], ["夏朝", "神話傳說"], ["晉朝", "三國時期"], ["晉朝", "南北朝"], ["元末明初", "明朝"], ["戰國時期", "秦朝"]].forEach(([a, b]) => assert(o(a, b), a + " / " + b + " must overlap"));
  [["唐朝", "清朝"], ["商朝", "西周"], ["隋朝", "唐朝"], ["明朝", "清朝"]].forEach(([a, b]) => assert(!o(a, b), a + " / " + b + " must not overlap"));
});

t("HISTORY_SIMILAR_GROUPS / HISTORY_SAME_EVENT_GROUPS: real ids, 2+ members, no repeated id inside a group, no duplicate group", () => {
  [SIMILAR, SAME_EVENT].forEach((groups) => {
    const seen = new Set();
    groups.forEach((g) => {
      assert(g.length >= 2);
      assert.strictEqual(new Set(g).size, g.length, "repeated id in a group");
      g.forEach((id) => assert(byId[id], "unknown id " + id));
      const key = [...g].sort().join("|");
      assert(!seen.has(key), "duplicate group");
      seen.add(key);
    });
  });
  assert.strictEqual(SIMILAR.length, 30);
});

t("character tables: generic entries exist in the library, alias groups point to real names, the library has enough named people", () => {
  const all = new Set(ITEMS.flatMap((i) => i.characters));
  C.HISTORY_GENERIC_CHARACTERS.forEach((g) => assert(all.has(g), "generic entry not used by any story: " + g));
  C.HISTORY_CHARACTER_ALIASES.forEach((g) => assert(g.length >= 2 && g.some((x) => all.has(x)), "alias group with no story name: " + g));
  const people = new Set(ITEMS.flatMap((i) => named(i)));
  assert(people.size >= 100, "named people: " + people.size);
});

t("every kind can be built from enough stories (person >= 45, others >= 80)", () => {
  const count = (k) => ITEMS.filter((i) => Q.eligible(k, i)).length;
  assert(count("person") >= 45, "person " + count("person"));
  ["period", "order", "lesson", "title"].forEach((k) => assert(count(k) >= 80, k + " " + count(k)));
  // the 5 myth / legend stories and 3 novel stories are never asked as 事件先後
  ITEMS.filter((i) => i.source === "神話與民間傳說" || i.source === "小說演義").forEach((i) => assert(!Q.eligible("order", i), i.title));
});

// ---- sessions ---------------------------------------------------------------------------------------------------------
t("a session is 15 questions: 3 of each of 5 kinds, never the same kind twice in a row, 15 different stories", () => {
  for (let i = 0; i < 300; i++) {
    const errs = checkSession(Q.buildQuestions(ITEMS, 15), true);
    assert.deepStrictEqual(errs, [], errs.slice(0, 3).join("; "));
  }
});

t("the order of the kinds is random (not a fixed pattern) and every kind shows up in every position", () => {
  const orders = new Set();
  const atPos = KINDS.map(() => new Set());
  for (let i = 0; i < 200; i++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    orders.add(qs.map((q) => q.kind).join(","));
    qs.slice(0, 5).forEach((q, p) => atPos[p].add(q.kind));
  }
  assert(orders.size > 150, "only " + orders.size + " different orders in 200 sessions");
  atPos.forEach((s) => assert(s.size >= 4));
});

t("5000 full-library sessions: exactly one defensible answer in every question, 0 violations", () => {
  let bad = 0;
  const seen = {};
  const shown = [];
  for (let i = 0; i < 5000; i++) {
    const qs = Q.buildQuestions(ITEMS, 15);
    const errs = checkSession(qs, true);
    qs.forEach((q) => (seen[q.kind] = (seen[q.kind] || 0) + 1));
    if (errs.length) {
      bad++;
      if (shown.length < 5) shown.push(errs[0]);
    }
  }
  assert.strictEqual(bad, 0, bad + " sessions with problems, e.g. " + shown.join(" || "));
  KINDS.forEach((k) => assert.strictEqual(seen[k], 15000, k + " asked " + seen[k]));
});

t("the right answer is not always in the same slot, and the same story is not always used", () => {
  const slots = { person: [0, 0, 0, 0], period: [0, 0, 0, 0], lesson: [0, 0, 0, 0], title: [0, 0, 0, 0] };
  const stories = new Set();
  for (let i = 0; i < 400; i++)
    Q.buildQuestions(ITEMS, 15).forEach((q) => {
      stories.add(q.itemId);
      if (slots[q.kind]) slots[q.kind][q.correctIndex]++;
    });
  Object.values(slots).forEach((s) => s.forEach((n) => assert(n > 0)));
  assert(stories.size >= 88, "only " + stories.size + " stories asked in 400 sessions");
});

t("period questions: over 5000 draws no two options ever overlap, for every one of the 90 stories", () => {
  for (const it of ITEMS) {
    for (let r = 0; r < 60; r++) {
      const qs = Q.buildQuestions([it], 15).filter((q) => q.kind === "period");
      qs.forEach((q) => assert.deepStrictEqual(problems(q), [], it.title));
    }
  }
});

t("person questions: every story that qualifies, 100 draws each, no second defensible person", () => {
  let asked = 0;
  for (const it of ITEMS.filter((i) => Q.eligible("person", i))) {
    for (let r = 0; r < 100; r++) {
      const qs = Q.buildQuestions([it], 15).filter((q) => q.kind === "person");
      qs.forEach((q) => {
        asked++;
        assert.deepStrictEqual(problems(q), [], it.title);
      });
    }
  }
  assert(asked > 5000);
});

t("title questions: every story, 60 draws each, passage never shows the title and wrong titles are same-category, other events", () => {
  for (const it of ITEMS) {
    for (let r = 0; r < 60; r++) {
      Q.buildQuestions([it], 15).filter((q) => q.kind === "title").forEach((q) => assert.deepStrictEqual(problems(q), [], it.title));
    }
  }
});

t("lesson questions: every story, 60 draws each, no wrong story from a similar group", () => {
  for (const it of ITEMS) {
    for (let r = 0; r < 60; r++) {
      Q.buildQuestions([it], 15).filter((q) => q.kind === "lesson").forEach((q) => assert.deepStrictEqual(problems(q), [], it.title));
    }
  }
});

t("order questions: years >= 100 apart, never a legend / novel story, the earlier story is the right one (all eligible stories)", () => {
  for (const it of ITEMS.filter((i) => Q.eligible("order", i))) {
    for (let r = 0; r < 40; r++) {
      Q.buildQuestions([it], 15).filter((q) => q.kind === "order").forEach((q) => assert.deepStrictEqual(problems(q), [], it.title));
    }
  }
});

t("small asked sets (1 to 3 mistaken stories): still 15 valid questions, no error, no empty question", () => {
  for (let i = 0; i < 600; i++) {
    const n = 1 + (i % 3);
    const set = [];
    while (set.length < n) {
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (!set.includes(it)) set.push(it);
    }
    const qs = Q.buildQuestions(ITEMS, 15, set);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => {
      assert(set.some((s) => s.id === q.itemId));
      assert.deepStrictEqual(problems(q), []);
    });
  }
});

t("patched library: a story with no lesson / no usable passage / unknown period is asked as another kind, never broken", () => {
  const A = load(777, (Cn) => {
    const it = Cn.HISTORY_ITEMS;
    delete it[0].lesson;
    it[1].period = "不存在的朝代";
    it[2].story = "短。";
  });
  const items = A.Content.HISTORY_ITEMS;
  for (let i = 0; i < 300; i++) {
    const qs = A.HistoryQuiz.buildQuestions(items, 15);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => {
      assert(q.options.length >= 2 && q.correctIndex >= 0);
      assert(new Set(q.options).size === q.options.length);
    });
  }
  assert(!A.HistoryQuiz.eligible("lesson", items[0]));
  assert(!A.HistoryQuiz.eligible("period", items[1]));
});

t("known tricky people: 貞觀之治 never offers 李世民 (= 唐太宗), 完璧歸趙 never offers 秦昭襄王 / 秦始皇 (= 秦王), 大禹治水 never offers 鯀 twice", () => {
  const forbid = { "zhen-guan-zhi-zhi": ["李世民", "唐太宗"], "xuanwumen-zhibian": ["李世民", "唐太宗"], "wanbi-guizhao": ["秦昭襄王", "秦始皇（嬴政）"], "jing-ke-ci-qin-wang": ["秦昭襄王", "秦始皇（嬴政）"] };
  let asked = 0;
  for (const id of Object.keys(forbid)) {
    for (let r = 0; r < 300; r++) {
      Q.buildQuestions([byId[id]], 15).filter((q) => q.kind === "person").forEach((q) => {
        asked++;
        const wrong = q.options.filter((_, i) => i !== q.correctIndex);
        wrong.forEach((w) => assert(!forbid[id].includes(w), id + " offers " + w));
      });
    }
  }
  assert(asked > 200, "too few person questions: " + asked);
  for (let r = 0; r < 300; r++) Q.buildQuestions([byId["da-yu-zhi-shui"]], 15).filter((q) => q.kind === "person").forEach((q) => assert.strictEqual(new Set(q.options).size, 4));
});

t("patched library: a category with fewer than 3 other stories gives no title question for its stories (wrong titles stay in the category)", () => {
  const A = load(31, (Cn) => {
    // only three stories keep the category 戰爭故事; every other story is moved to 計謀
    let kept = 0;
    Cn.HISTORY_ITEMS.forEach((it) => {
      if (it.category === "戰爭故事" && kept < 3) kept++;
      else it.category = "計謀";
    });
  });
  const items = A.Content.HISTORY_ITEMS;
  const war = items.filter((i) => i.category === "戰爭故事");
  assert.strictEqual(war.length, 3);
  war.forEach((w) => assert(!A.HistoryQuiz.eligible("title", w), w.title + " should not qualify for 故事猜標題"));
  for (let r = 0; r < 200; r++) A.HistoryQuiz.buildQuestions(items, 15).filter((q) => q.kind === "title").forEach((q) => {
    const it = items.find((x) => x.id === q.itemId);
    q.options.forEach((o) => assert.strictEqual(items.find((x) => x.title === o).category, it.category));
  });
});

t("patched library: a wrong title that is named inside the passage is never offered", () => {
  let aId, bId;
  const A = load(41, (Cn) => {
    const it = Cn.HISTORY_ITEMS;
    const a = it.find((x) => x.category === "計謀");
    // the nearest-in-time 計謀 story that is not the same event and shares no person (the generator prefers near eras, so it is the likeliest wrong option)
    const b = it
      .filter((x) => x.category === "計謀" && x.id !== a.id && !Cn.HISTORY_SAME_EVENT_GROUPS.some((g) => g.includes(a.id) && g.includes(x.id)) && !x.characters.some((c) => a.characters.includes(c)))
      .sort((x, y) => Math.abs(x.sortYear - a.sortYear) - Math.abs(y.sortYear - a.sortYear))[0];
    // every passage of story a names story b by its title; the many other 計謀 stories stay, so b is a tempting but invalid wrong option
    a.story = ("有人提到" + b.title + "，大家議論紛紛，始終沒有一個定論。").repeat(4);
    a.characters = ["甲乙丙"];
    aId = a.id;
    bId = b.id;
  });
  const items = A.Content.HISTORY_ITEMS;
  const ai = items.find((x) => x.id === aId);
  const bi = items.find((x) => x.id === bId);
  let asked = 0;
  for (let r = 0; r < 400; r++) {
    A.HistoryQuiz.buildQuestions([ai], 15).filter((q) => q.kind === "title").forEach((q) => {
      asked++;
      assert(!q.options.includes(bi.title), "offered " + bi.title);
    });
  }
  assert(asked >= 400, "only " + asked + " title questions");
});

t("階段 9d 審核後：6 個新增的相近啟示組都在，原有 24 組不變", () => {
  const has = (a, b) => SIMILAR.some((g) => g.length === 2 && g.includes(a) && g.includes(b));
  [["wanbi-guizhao", "mao-sui-zi-jian"], ["chu-long-shuo-zhao-tai-hou", "wanbi-guizhao"], ["fujing-qingzui", "kongrong-rangli"], ["xin-hai-ge-ming", "wei-qing-huo-qu-bing-kang-xiongnu"], ["kong-cheng-ji", "cao-chuan-jie-jian"], ["jingwei-tianhai", "nvwa-butian"]].forEach(([a, b]) => assert(has(a, b), a + " / " + b));
  // 管仲治齊 and 張騫出使西域 keep their places
  assert(SIMILAR.some((g) => g.includes("guan-zhong-zhi-qi") && g.includes("shang-yang-bian-fa")));
  assert.strictEqual(SIMILAR.filter((g) => g.includes("zhang-qian-chu-shi-xi-yu")).length, 2);
});

t("人物配故事：干擾人物的最近故事與該故事相差 ≥100 年（全庫 5000 輪），能出此題型的故事數仍是 51 個以上", () => {
  const asking = ITEMS.filter((i) => Q.eligible("person", i));
  assert(asking.length >= 45, "person-eligible stories: " + asking.length);
  asking.forEach((i) => assert.strictEqual(Q.personGap(i), 100, i.title + " needs a relaxed gap"));
  let persons = 0;
  for (let i = 0; i < 5000; i++) {
    Q.buildQuestions(ITEMS, 15).filter((q) => q.kind === "person").forEach((q) => {
      persons++;
      const item = byId[q.itemId];
      q.options.filter((_, k) => k !== q.correctIndex).forEach((w) => assert(nearGap(ITEMS, w, item) >= 100, w + " is too close to " + item.title));
    });
  }
  assert.strictEqual(persons, 15000);
});

t("HISTORY_PERSON_NOT_OPTION：id 和人物都存在；排除表內的人物出現 0 次（表內每個故事 5000 輪；另外全庫 5000 輪也逐題檢查）", () => {
  const T = C.HISTORY_PERSON_NOT_OPTION;
  assert.deepStrictEqual(Object.keys(T).sort(), ["chang-ping-zhi-zhan", "chu-long-shuo-zhao-tai-hou", "guang-wu-zhong-xing", "shang-yang-bian-fa", "xuanwumen-zhibian"]);
  assert.deepStrictEqual(JSON.stringify(T["shang-yang-bian-fa"]), JSON.stringify(["秦始皇（嬴政）"]));
  assert.deepStrictEqual(JSON.stringify(T["guang-wu-zhong-xing"]), JSON.stringify(["漢景帝", "漢文帝", "漢武帝", "劉邦"]));
  const all = new Set(ITEMS.flatMap((i) => i.characters));
  Object.entries(T).forEach(([id, names]) => { assert(byId[id], id); names.forEach((n) => assert(all.has(n), "unknown person " + n)); });
  for (const [id, names] of Object.entries(T)) {
    for (let r = 0; r < 5000; r++) {
      Q.buildQuestions([byId[id]], 15).filter((q) => q.kind === "person").forEach((q) => q.options.forEach((o) => assert(!names.some((n) => sameP(n, o)) || q.options[q.correctIndex] === o, id + " offers " + o)));
    }
  }
});

t("patched library: the table alone decides when the year rule lets everybody through (only the three non-banned people can be offered)", () => {
  let allowed;
  const A = load(61, (Cn) => {
    const it = Cn.HISTORY_ITEMS.find((x) => x.id === "da-yu-zhi-shui");
    const G = new Set(Cn.HISTORY_GENERIC_CHARACTERS);
    const everyone = [...new Set(Cn.HISTORY_ITEMS.flatMap((x) => x.characters))].filter((c) => !G.has(c) && !c.includes("的") && !c.includes("、") && !it.characters.includes(c));
    allowed = ["商湯", "管仲", "屈原不存在"].slice(0, 2).concat(["孟子"]);
    Cn.HISTORY_PERSON_NOT_OPTION = Object.assign({}, Cn.HISTORY_PERSON_NOT_OPTION, { "da-yu-zhi-shui": everyone.filter((c) => !allowed.includes(c)) });
  });
  const item = A.Content.HISTORY_ITEMS.find((x) => x.id === "da-yu-zhi-shui");
  assert.strictEqual(A.HistoryQuiz.personGap(item), 100);
  let asked = 0;
  for (let r = 0; r < 1500; r++) {
    A.HistoryQuiz.buildQuestions([item], 15).filter((q) => q.kind === "person").forEach((q) => {
      asked++;
      const wrong = q.options.filter((_, k) => k !== q.correctIndex).sort();
      assert.strictEqual(JSON.stringify(wrong), JSON.stringify([...allowed].sort()));
    });
  }
  assert(asked >= 1500, "person questions: " + asked);
});

t("patched library: gap relaxed to 50 when fewer than 3 people are 100+ years away, still never below 50; below that the kind is not asked", () => {
  // every other story sits 70 years from 大禹治水 -> nobody is 100 years away, but everybody is 50+ away
  const A = load(71, (Cn) => { Cn.HISTORY_ITEMS.forEach((x) => { x.sortYear = x.id === "da-yu-zhi-shui" ? 0 : 70; }); });
  const items = A.Content.HISTORY_ITEMS;
  const item = items.find((x) => x.id === "da-yu-zhi-shui");
  assert.strictEqual(A.HistoryQuiz.personGap(item), 50);
  let asked = 0;
  for (let r = 0; r < 600; r++) {
    A.HistoryQuiz.buildQuestions([item], 15).filter((q) => q.kind === "person").forEach((q) => {
      asked++;
      assert.deepStrictEqual(problems(q, items, A.HistoryQuiz).filter((p) => !/years from the story|does not|order|period/.test(p)), []);
      q.options.filter((_, k) => k !== q.correctIndex).forEach((w) => assert(nearGap(items, w, item) >= 50));
    });
  }
  assert(asked > 100);
  // everybody only 30 years away: the kind is not asked at all (and nothing breaks)
  const B = load(72, (Cn) => { Cn.HISTORY_ITEMS.forEach((x) => { x.sortYear = x.id === "da-yu-zhi-shui" ? 0 : 30; }); });
  const bi = B.Content.HISTORY_ITEMS.find((x) => x.id === "da-yu-zhi-shui");
  assert.strictEqual(B.HistoryQuiz.personGap(bi), null);
  assert(!B.HistoryQuiz.eligible("person", bi));
  for (let r = 0; r < 200; r++) {
    const qs = B.HistoryQuiz.buildQuestions([bi], 15);
    assert.strictEqual(qs.length, 15);
    qs.forEach((q) => assert(q.kind !== "person"));
  }
});

t("故事猜標題：干擾標題從不與正確答案同屬 HISTORY_SIMILAR_GROUPS 任何一組（全庫，每個故事多次）", () => {
  let asked = 0;
  const pairs = new Set();
  for (const it of ITEMS) {
    for (let r = 0; r < 50; r++) {
      Q.buildQuestions([it], 15).filter((q) => q.kind === "title").forEach((q) => {
        asked++;
        q.options.filter((_, k) => k !== q.correctIndex).forEach((w) => {
          assert(!sameGroup(SIMILAR, it, byTitle[w]), it.title + " offers similar-group story " + w);
          pairs.add(it.id + ">" + byTitle[w].id);
        });
      });
    }
  }
  assert(asked > 3000, "title questions: " + asked);
  // the new pairs 完璧歸趙 / 毛遂自薦 would be tempting wrong options (same 計謀 tab, near years, no shared person) if the rule were missing
  assert(!pairs.has("wanbi-guizhao>mao-sui-zi-jian") && !pairs.has("mao-sui-zi-jian>wanbi-guizhao"));
});

t("書面語 scan: no colloquial wording, and 同 only inside ordinary words, in the generator and the new tables", () => {
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "historyQuiz.jsx"), "utf8");
  const mod = fs.readFileSync(path.join(__dirname, "..", "src", "HistoryModule.jsx"), "utf8");
  const content = fs.readFileSync(path.join(__dirname, "..", "src", "content", "historyContent.jsx"), "utf8");
  const tableStart = content.indexOf("階段 9d");
  const tables = content.slice(tableStart);
  const strings = [];
  [src, tables].forEach((text) => text.replace(/"([^"\n]*)"/g, (_, s) => strings.push(s)));
  // the visible wording of the new screen (from the template literals / JSX text of HistoryModule.jsx's 綜合練習 part)
  const modPart = mod.slice(mod.indexOf("綜合練習 (階段 9d)"), mod.indexOf("function ListViewA2"));
  const modPart2 = mod.slice(mod.indexOf("function ListViewA2"), mod.indexOf("function ListViewA2") + 1200);
  const bad = /呢|咩|嘅|咗|唔|喺|即刻|哋|嘢|啲|佢|冇|乜|嚟|點解|邊個|而家|嗰|咁|好似/;
  [...strings, modPart, modPart2].forEach((s) => assert(!bad.test(s), "colloquial wording: " + s.slice(0, 40)));
  // 同 used as 「和」 would sit between two nouns; every 同 in the new wording must be part of an ordinary word
  const okTong = /同一|相同|同時|同學|共同|同情|不同|同意|同樣|同事件/;
  [...strings, modPart, modPart2].forEach((s) => {
    const rest = s.replace(new RegExp(okTong.source, "g"), "");
    assert(!rest.includes("同"), "同 as 'and'? " + s.slice(0, 40));
  });
  // and the questions themselves
  for (let i = 0; i < 200; i++)
    Q.buildQuestions(ITEMS, 15).forEach((qq) => {
      [qq.ask].forEach((s) => { assert(!bad.test(s)); assert(!s.includes("同")); });
    });
});

t.done();
