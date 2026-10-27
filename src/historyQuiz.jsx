// 階段 9d — question generation for the 歷史故事 綜合練習, kept free of any screen code (no JSX, no React) so that
// tests/history-quiz.test.js can run it in a node:vm sandbox thousands of times and check that every question has exactly one defensible
// answer. HistoryModule.jsx only turns the plain objects returned here into screens.
//
// A session is 15 questions: 5 kinds x 3, in a random order (dealt by quizPlan.jsx, never the same kind twice in a row). Every question is
// about ONE story (`itemId`), built at run time from fields the stories already have:
//   person   人物配故事   title + first sentence -> 「這個故事和下列哪一位人物有關？」 options = 4 people (`characters`)
//   period   朝代配故事   title -> 「這個故事發生在哪個朝代或時期？」 options = 4 labels of HISTORY_PERIOD_NORM
//   order    事件先後     two titles -> 「哪一個發生得比較早？」 (sortYear >= 100 apart, never 神話與民間傳說 / 小說演義)
//   lesson   啟示配故事   the `lesson` -> 「這句啟示最適合哪一個故事？」 options = 4 titles
//   title    故事猜標題   a passage of the story (never the whole title) -> options = 4 titles of the same 類別
//
// Rules that keep an answer unambiguous (all checked again, independently, by the tests):
//  - person: the right person is a named person of `characters` who is NOT already named in the title / first sentence shown; a wrong person
//    is a named person of another story who is not (an alias of) any person of this story, is never named in this story's title or text,
//    comes from a story at least 100 years away (50 if too few people qualify, otherwise the story is asked another kind), is not in
//    HISTORY_PERSON_NOT_OPTION for this story, and two options are never the same person under different names (HISTORY_CHARACTER_ALIASES, HISTORY_RULER_ALIASES, generic entries such
//    as 百姓 / 秦王 are never options).
//  - period: the four options have pairwise disjoint `families` (HISTORY_PERIOD_NORM): 春秋 and 戰國, 北宋 and 宋朝, 西漢 and 東漢 …
//    are never offered together.
//  - lesson: a wrong story is never in a common HISTORY_SIMILAR_GROUPS group with the right one.
//  - title: wrong titles come from the same 類別, never share a named person with the right story, never belong to a common
//    HISTORY_SAME_EVENT_GROUPS or HISTORY_SIMILAR_GROUPS group, and are not named in the passage; the passage never contains the right title.
// 答錯 -> the HistoryModule puts `itemId` into the history 錯題本; a correct answer deliberately never removes it (see HistoryModule.jsx).
window.App = window.App || {};

(function () {
  const { shuffle, sampleWithRepeats } = window.App.QuizUtils;
  const { planKinds } = window.App.QuizPlan;
  const C = window.App.Content;
  const ITEMS = C.HISTORY_ITEMS;
  const NORM = C.HISTORY_PERIOD_NORM || {};
  const SIMILAR = C.HISTORY_SIMILAR_GROUPS || [];
  const SAME_EVENT = C.HISTORY_SAME_EVENT_GROUPS || [];
  const GENERIC = new Set(C.HISTORY_GENERIC_CHARACTERS || []);
  const ALIASES = C.HISTORY_CHARACTER_ALIASES || [];
  const RULERS = C.HISTORY_RULER_ALIASES || {};
  const NOT_OPTION = C.HISTORY_PERSON_NOT_OPTION || {};

  // 人物配故事: a wrong person's nearest story must be at least this many years from the asked story (relaxed only if too few people qualify)
  const PERSON_YEAR_GAP = 100;
  const PERSON_YEAR_GAP_RELAXED = 50;
  const QUESTION_COUNT = 15;
  const KINDS = ["person", "period", "order", "lesson", "title"];
  const NOT_FOR_ORDER = ["神話與民間傳說", "小說演義"];
  const MIN_YEAR_GAP = 100;

  const inCommonGroup = (groups, a, b) => a.id === b.id || groups.some((g) => g.includes(a.id) && g.includes(b.id));

  // ---- names -------------------------------------------------------------------------------------------------------------
  const stripParen = (s) => s.replace(/（[^）]*）/g, "");
  const parenPart = (s) => (s.match(/（([^）]*)）/) || [])[1];
  const baseForms = (name) => [name, stripParen(name), parenPart(name)].filter(Boolean); // 鯀 has one character: it still counts
  // every form under which a person is known: the name, its （…） part, and the other names of its alias group
  const formsCache = {};
  function forms(name) {
    if (formsCache[name]) return formsCache[name];
    const out = new Set(baseForms(name));
    for (let round = 0; round < 3; round++) {
      ALIASES.forEach((g) => {
        if (g.some((x) => baseForms(x).some((f) => out.has(f)))) g.forEach((x) => baseForms(x).forEach((f) => out.add(f)));
      });
    }
    return (formsCache[name] = Array.from(out));
  }
  const rulerForms = (name) => {
    const extra = RULERS[stripParen(name)] || RULERS[name];
    return extra ? extra.flatMap(forms) : [];
  };
  function samePerson(a, b) {
    const fa = forms(a).concat(rulerForms(a));
    const fb = forms(b).concat(rulerForms(b));
    // one-character names (鯀) only match exactly; longer ones also match when one contains the other (宋高宗／宋高宗（趙構）)
    return fa.some((x) => fb.some((y) => x === y || (x.length >= 2 && y.length >= 2 && (x.includes(y) || y.includes(x)))));
  }
  const mentions = (name, text) => forms(name).some((f) => text.includes(f));
  const isNamed = (c) => !GENERIC.has(c) && !c.includes("的") && !c.includes("、");

  // ---- text --------------------------------------------------------------------------------------------------------------
  // Sentences of a story; a 。！？ inside 「」 / 『』 does not end a sentence.
  function sentencesOf(text) {
    const out = [];
    let depth = 0;
    let cur = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      cur += ch;
      if (ch === "「" || ch === "『") depth++;
      else if (ch === "」" || ch === "』") depth = Math.max(0, depth - 1);
      const end = depth === 0 && "。！？".includes(ch);
      const closeAfterEnd = depth === 0 && (ch === "」" || ch === "』") && "。！？".includes(text[i - 1] || "");
      if (end || closeAfterEnd) {
        out.push(cur);
        cur = "";
      }
    }
    if (cur.trim()) out.push(cur);
    return out;
  }
  const firstSentence = (item) => sentencesOf(item.story)[0] || item.story;

  // strings a passage must not contain, or the title is given away
  function titleParts(title) {
    const cleaned = title.replace(/[（）《》〈〉]/g, "");
    const parts = [title.replace(/（[^）]*）/g, "").replace(/[《》〈〉]/g, ""), cleaned];
    const paren = parenPart(title);
    if (paren) parts.push(paren);
    if (cleaned.length >= 4) parts.push(cleaned.slice(-3)); // 不思蜀, 磨成針, 偷光 …
    if (cleaned.length >= 6) parts.push(cleaned.slice(-4)); // 胡服騎射, 遷都洛陽, 千金買骨, 網開三面 …
    return Array.from(new Set(parts.filter((p) => p.length >= 2)));
  }
  const showsTitle = (text, title) => titleParts(title).some((p) => text.includes(p));

  const yearGap = (a, b) => Math.abs((a.sortYear || 0) - (b.sortYear || 0));
  // lower score = preferred wrong option (same category first, then a nearer era; ties random)
  const scoreOf = (item, c) => (c.category === item.category ? 0 : 400) + Math.min(yearGap(item, c), 3000) / 10 + Math.random() * 120;
  const byScore = (item, list) =>
    list
      .map((c) => ({ c, s: scoreOf(item, c) }))
      .sort((a, b) => a.s - b.s)
      .map((x) => x.c);

  // ---- people ------------------------------------------------------------------------------------------------------------
  const PEOPLE = []; // every named person of the library: { name, year }
  ITEMS.forEach((it) => {
    (it.characters || []).filter(isNamed).forEach((name) => {
      const hit = PEOPLE.find((p) => p.names.includes(name));
      if (hit) hit.years.push(it.sortYear || 0);
      else PEOPLE.push({ name, names: [name], years: [it.sortYear || 0] });
    });
  });

  // person: the deterministic part (the random part picks from these)
  const personCache = {};
  const nearYear = (p, item) => Math.min(...p.years.map((y) => Math.abs(y - (item.sortYear || 0))));
  // up to three pairwise different persons exist in `list`?
  const enoughPeople = (list) => {
    const chosen = [];
    list.forEach((p) => {
      if (chosen.length < 3 && !chosen.some((q) => samePerson(q.name, p.name))) chosen.push(p);
    });
    return chosen.length >= 3;
  };
  function preparePerson(item) {
    if (personCache[item.id] !== undefined) return personCache[item.id];
    let out = null;
    const stem = item.title + firstSentence(item);
    const right = (item.characters || []).filter((c) => isNamed(c) && !mentions(c, stem));
    if (right.length) {
      const all = item.characters || [];
      const text = item.title + item.story;
      const banned = NOT_OPTION[item.id] || [];
      const wrong = PEOPLE.filter((p) => !all.some((c) => samePerson(c, p.name)) && !mentions(p.name, text) && !banned.some((b) => samePerson(b, p.name)));
      // a wrong person must come from a story at least 100 years away (so he cannot be a contemporary of the story); only when fewer than
      // three different people qualify is the gap relaxed to 50 years, and when even that is not enough the story is not asked this kind
      for (const gap of [PERSON_YEAR_GAP, PERSON_YEAR_GAP_RELAXED]) {
        const far = wrong.filter((p) => nearYear(p, item) >= gap);
        if (enoughPeople(far)) {
          out = { right, wrong: far, gap };
          break;
        }
      }
    }
    personCache[item.id] = out;
    return out;
  }
  function buildPerson(item) {
    const prep = preparePerson(item);
    if (!prep) return null;
    const correct = shuffle(prep.right)[0];
    const ranked = prep.wrong.map((p) => ({ p, s: nearYear(p, item) / 10 + Math.random() * 200 })).sort((a, b) => a.s - b.s);
    const wrong = [];
    for (const { p } of ranked) {
      if (wrong.length >= 3) break;
      if (wrong.some((q) => samePerson(q.name, p.name)) || samePerson(correct, p.name)) continue;
      wrong.push(p);
    }
    if (wrong.length < 3) return null;
    const options = shuffle([correct, ...wrong.map((p) => p.name)]);
    return make("person", item, { title: item.title, intro: firstSentence(item), ask: "這個故事和下列哪一位人物有關？" }, options, correct);
  }

  // ---- period ------------------------------------------------------------------------------------------------------------
  const LABELS = {}; // label -> { label, families, year }
  ITEMS.forEach((it) => {
    const n = NORM[it.period];
    if (!n) return;
    const l = (LABELS[n.label] = LABELS[n.label] || { label: n.label, families: new Set(), years: [] });
    n.families.forEach((f) => l.families.add(f));
    l.years.push(it.sortYear || 0);
  });
  const disjoint = (a, b) => !Array.from(a).some((f) => b.has(f));
  function periodCandidates(item) {
    const n = NORM[item.period];
    if (!n) return null;
    const fam = new Set(n.families);
    const others = Object.values(LABELS).filter((l) => l.label !== n.label && disjoint(l.families, fam));
    // a greedy pick of pairwise disjoint labels must be able to reach 3
    const picked = [];
    others.forEach((l) => {
      if (picked.length < 3 && picked.every((q) => disjoint(q.families, l.families))) picked.push(l);
    });
    return picked.length >= 3 ? { n, fam, others } : null;
  }
  function buildPeriod(item) {
    const prep = periodCandidates(item);
    if (!prep) return null;
    const mean = (l) => l.years.reduce((a, b) => a + b, 0) / l.years.length;
    const ranked = prep.others.map((l) => ({ l, s: Math.abs(mean(l) - (item.sortYear || 0)) / 4 + Math.random() * 500 })).sort((a, b) => a.s - b.s);
    const picked = [];
    for (const { l } of ranked) {
      if (picked.length >= 3) break;
      if (picked.every((q) => disjoint(q.families, l.families))) picked.push(l);
    }
    if (picked.length < 3) return null;
    return make("period", item, { title: item.title, ask: "這個故事發生在哪個朝代或時期？" }, shuffle([prep.n.label, ...picked.map((l) => l.label)]), prep.n.label);
  }

  // ---- order -------------------------------------------------------------------------------------------------------------
  const orderOk = (it) => !NOT_FOR_ORDER.includes(it.source) && typeof it.sortYear === "number";
  const partnersFor = (item) => (orderOk(item) ? ITEMS.filter((o) => o.id !== item.id && orderOk(o) && yearGap(item, o) >= MIN_YEAR_GAP) : []);
  function buildOrder(item) {
    const partners = partnersFor(item);
    if (!partners.length) return null;
    const other = partners[Math.floor(Math.random() * partners.length)];
    const earlier = item.sortYear < other.sortYear ? item : other;
    return make("order", item, { ask: "以下兩個故事，哪一個發生得比較早？" }, shuffle([item.title, other.title]), earlier.title);
  }

  // ---- lesson ------------------------------------------------------------------------------------------------------------
  const lessonWrongCache = {};
  const lessonWrong = (item) => lessonWrongCache[item.id] || (lessonWrongCache[item.id] = lessonWrongRaw(item));
  function lessonWrongRaw(item) {
    if (!item.lesson) return [];
    return ITEMS.filter((c) => c.lesson && !inCommonGroup(SIMILAR, item, c) && !showsTitle(item.lesson, c.title) && c.title !== item.title);
  }
  function buildLesson(item) {
    const wrong = byScore(item, lessonWrong(item));
    const titles = [];
    wrong.forEach((c) => {
      if (titles.length < 3 && !titles.includes(c.title)) titles.push(c.title);
    });
    if (titles.length < 3 || showsTitle(item.lesson, item.title)) return null;
    return make("lesson", item, { lesson: item.lesson, ask: "這句啟示最適合哪一個故事？" }, shuffle([item.title, ...titles]), item.title);
  }

  // ---- title -------------------------------------------------------------------------------------------------------------
  function passagesFor(item) {
    const s = sentencesOf(item.story);
    const out = [];
    for (let i = 0; i < s.length; i++) {
      const one = s[i];
      const two = i + 1 < s.length ? s[i] + s[i + 1] : null;
      if (two && two.length >= 30 && two.length <= 120) out.push(two);
      if (one.length >= 20 && one.length <= 100) out.push(one);
    }
    return out.filter((p) => !showsTitle(p, item.title));
  }
  const nameds = (it) => (it.characters || []).filter(isNamed);
  const titleWrongCache = {};
  const titleWrong = (item) => titleWrongCache[item.id] || (titleWrongCache[item.id] = titleWrongRaw(item));
  function titleWrongRaw(item) {
    return ITEMS.filter(
      (c) =>
        c.id !== item.id &&
        c.category === item.category &&
        !inCommonGroup(SAME_EVENT, item, c) &&
        !inCommonGroup(SIMILAR, item, c) &&
        !nameds(item).some((a) => (c.characters || []).some((b) => samePerson(a, b)))
    );
  }
  function buildTitle(item) {
    const passages = shuffle(passagesFor(item));
    const wrongAll = titleWrong(item);
    for (const passage of passages) {
      const wrong = byScore(
        item,
        wrongAll.filter((c) => !showsTitle(passage, c.title))
      );
      if (wrong.length >= 3) {
        return make("title", item, { passage, ask: "這段文字出自哪一個故事？" }, shuffle([item.title, ...wrong.slice(0, 3).map((c) => c.title)]), item.title);
      }
    }
    return null;
  }

  // ---- session -----------------------------------------------------------------------------------------------------------
  function make(kind, item, extra, options, correct) {
    return Object.assign({ itemId: item.id, kind, category: item.category }, extra, { options, correctIndex: options.indexOf(correct) });
  }
  const BUILDERS = { person: buildPerson, period: buildPeriod, order: buildOrder, lesson: buildLesson, title: buildTitle };

  // Can this kind be built from this story? (deterministic: a story's fields decide, not the dice)
  const eligibleCache = {};
  function eligible(kind, item) {
    const key = kind + "|" + item.id;
    if (eligibleCache[key] === undefined) {
      let ok = false;
      switch (kind) {
        case "person":
          ok = !!preparePerson(item);
          break;
        case "period":
          ok = !!periodCandidates(item);
          break;
        case "order":
          ok = partnersFor(item).length > 0;
          break;
        case "lesson":
          ok = !!item.lesson && !showsTitle(item.lesson, item.title) && lessonWrong(item).length >= 3;
          break;
        default:
          ok = passagesFor(item).length > 0 && titleWrong(item).length >= 3;
      }
      eligibleCache[key] = ok;
    }
    return eligibleCache[key];
  }

  // `chooseFrom` (defaults to `pool`) is the set of stories actually asked about; the wrong options always come from the whole library.
  function buildQuestions(pool, count, chooseFrom) {
    const n = count || QUESTION_COUNT;
    const source = chooseFrom && chooseFrom.length ? chooseFrom : pool && pool.length ? pool : ITEMS;
    // Some stories cannot be asked every kind (e.g. 人物配故事 needs a person who is not already named in the title / first sentence), so
    // a draw that cannot give every kind its share is drawn again (the module's fallback below still covers an impossible case).
    let plan = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = planKinds(sampleWithRepeats(source, n), KINDS, eligible);
      plan = candidate;
      const counts = {};
      candidate.forEach((p) => {
        counts[p.kind] = (counts[p.kind] || 0) + 1;
      });
      if (KINDS.every((k) => (counts[k] || 0) >= Math.floor(n / KINDS.length))) break;
    }
    const out = [];
    plan.forEach(({ kind, item }) => {
      let q = eligible(kind, item) ? BUILDERS[kind](item) : null;
      // safety net: the dice found no valid wrong options although the story qualified -> try its other kinds, then another story
      for (const k of shuffle(KINDS)) {
        if (q) break;
        if (k !== kind && eligible(k, item)) q = BUILDERS[k](item);
      }
      for (let tries = 0; !q && tries < 60; tries++) {
        const other = source[Math.floor(Math.random() * source.length)];
        const k = shuffle(KINDS).find((kk) => eligible(kk, other));
        if (k) q = BUILDERS[k](other);
      }
      if (q) {
        out.push(q);
      }
    });
    return out;
  }

  // the year gap that 人物配故事 uses for this story (100, 50 when relaxed) or null when the story is not asked this kind
  const personGap = (item) => {
    const prep = preparePerson(item);
    return prep ? prep.gap : null;
  };

  window.App.HistoryQuiz = { QUESTION_COUNT, KINDS, buildQuestions, eligible, personGap, samePerson, mentions, sentencesOf, titleParts, firstSentence };
})();
