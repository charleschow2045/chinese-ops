// Shared helpers for generating multiple-choice practice questions at runtime
// (used by PoetryModule, EssayModule, and future modules with the same
// "auto-generate MC questions from a content list" pattern).
window.App = window.App || {};

(function () {
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Samples up to n distinct values of mapFn from pool items other than excludeItem,
  // excluding any value equal to mapFn(excludeItem).
  function sampleOthers(pool, excludeItem, n, mapFn) {
    const excludeValue = mapFn(excludeItem);
    const values = pool
      .filter((it) => it.id !== excludeItem.id)
      .map(mapFn)
      .filter((v, i, arr) => v && v !== excludeValue && arr.indexOf(v) === i);
    return shuffle(values).slice(0, n);
  }

  // Picks `count` items genuinely at random from `pool`, repeating pool
  // items (in a freshly-shuffled order each lap) if count > pool.length.
  // Use this for "pick N practice questions" — NOT `pool[i % pool.length]`
  // followed by a shuffle, which only randomizes the PRESENTATION order of
  // a fixed prefix of the pool (always the same first `count` items in
  // whatever order they happen to sit in the content file) and was the
  // cause of a real bug: with `count` smaller than the pool, some items
  // (e.g. an early poem in poetryContent.jsx) would appear in literally
  // every practice session while later items never appeared at all.
  function sampleWithRepeats(pool, count) {
    let result = [];
    while (result.length < count) result = result.concat(shuffle(pool));
    return shuffle(result).slice(0, count);
  }

  window.App.QuizUtils = { shuffle, sampleOthers, sampleWithRepeats };
})();
