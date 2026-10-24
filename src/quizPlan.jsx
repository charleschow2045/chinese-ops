// 階段 9b — shared planning helper for the question kinds of a practice session (used by idiomQuiz.jsx and poetryQuiz.jsx; plain
// JavaScript, no screen code). Given the sentences / idioms / poems that will be asked about, it decides which KIND of question each
// one becomes:
//  - kinds come in blocks, each block a shuffle of all kinds, so every kind appears (a partial last block holds distinct kinds),
//    and a block never starts with the kind the previous block ended on (no kind twice in a row);
//  - a kind that cannot be built from an item (e.g. 故事猜成語 for an idiom without an `origin`, 字詞註釋 for a poem without
//    `annotations`) is repaired: the item is swapped with another slot that suits both, or the slot is changed to the eligible kind
//    used least so far (never leaving an empty or broken question).
window.App = window.App || {};

(function () {
  const { shuffle } = window.App.QuizUtils;

  function planKinds(items, kinds, eligible) {
    const n = items.length;
    const seq = [];
    while (seq.length < n) {
      let block = shuffle(kinds);
      for (let tries = 0; seq.length && block[0] === seq[seq.length - 1] && tries < 30; tries++) block = shuffle(kinds);
      seq.push(...block);
    }
    seq.length = n;
    const list = items.slice();

    for (let i = 0; i < n; i++) {
      if (eligible(seq[i], list[i])) continue;
      // 1. swap items with a slot that suits both
      const j = list.findIndex((it, k) => k !== i && eligible(seq[i], it) && eligible(seq[k], list[i]));
      if (j >= 0) {
        const t = list[i];
        list[i] = list[j];
        list[j] = t;
        continue;
      }
      // 2. otherwise change this slot's kind: the eligible kind used least so far, not equal to a neighbour's kind if possible
      const used = {};
      kinds.forEach((k) => {
        used[k] = 0;
      });
      seq.forEach((k, idx) => {
        if (idx !== i) used[k] += 1;
      });
      const options = shuffle(kinds.filter((k) => eligible(k, list[i])));
      options.sort((a, b) => {
        const na = (a === seq[i - 1] ? 1 : 0) + (a === seq[i + 1] ? 1 : 0);
        const nb = (b === seq[i - 1] ? 1 : 0) + (b === seq[i + 1] ? 1 : 0);
        return na - nb || used[a] - used[b];
      });
      if (options.length) seq[i] = options[0];
    }
    return seq.map((kind, i) => ({ kind, item: list[i] }));
  }

  // True / false flags for the 是非題 of a session: about half true (3 questions give 2 + 1, either way round, decided at random).
  function trueFalseFlags(count) {
    const flip = Math.random() < 0.5;
    return shuffle(Array.from({ length: count }, (_, i) => (i % 2 === 0) !== flip));
  }

  window.App.QuizPlan = { planKinds, trueFalseFlags };
})();
