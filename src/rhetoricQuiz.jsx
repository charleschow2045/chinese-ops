// 階段 9a — question generation for 修辭手法, kept free of any screen code (no JSX, no React) so that
// tests/rhetoric-quiz.test.js can run it in a node:vm sandbox thousands of times and check that every question has
// exactly one defensible answer. RhetoricModule.jsx only turns the plain objects returned here into screens.
//
// Five question kinds are used in a random order (a session is 15 questions, 3 of each kind):
//   device         「這句運用了什麼修辭手法？」          options = device names
//   effect         「這句運用了「X」，這樣寫有什麼作用？」 options = effect texts
//   find-sentence  「以下哪一句運用了「X」？」           options = 4 sentences (1 with X, 3 without)
//   true-false     「這句運用了「X」。這個說法正確嗎？」  options = 正確 / 不正確
//   effect-device  「哪一種修辭手法的作用是「…」？」      options = device names
//
// Rules that keep an answer unambiguous:
//  - a sentence may carry `alsoDevices` (other devices it genuinely uses). Such a sentence is never a wrong option for
//    those devices, never a wrong 「這句運用了…」 option, and is never the stem of a 是非題.
//  - wrong options prefer the devices students really confuse (`confusableWith`, two-way), see pickDeviceNames.
//  - two devices whose `effect` texts are too close (RHETORIC_EFFECT_CLASHES) never sit in the same 「作用」 question.
// Every question carries `itemId` (the sentence it was built from) so a wrong answer goes into 錯題本 as before.
window.App = window.App || {};

(function () {
  const { shuffle, sampleWithRepeats } = window.App.QuizUtils;
  const { RHETORIC_DEVICES, RHETORIC_PRACTICE_SENTENCES, RHETORIC_EFFECT_CLASHES } = window.App.Content;

  const QUESTION_COUNT = 15;
  const KINDS = ["device", "effect", "find-sentence", "true-false", "effect-device"];

  const DEVICE_BY_NAME = {};
  RHETORIC_DEVICES.forEach((d) => {
    DEVICE_BY_NAME[d.name] = d;
  });
  const ALL_NAMES = RHETORIC_DEVICES.map((d) => d.name);

  const alsoOf = (s) => s.alsoDevices || [];
  const usesDevice = (s, name) => s.device === name || alsoOf(s).includes(name);
  const confusablesOf = (name) => (DEVICE_BY_NAME[name] && DEVICE_BY_NAME[name].confusableWith) || [];
  const effectsClash = (a, b) => RHETORIC_EFFECT_CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Picks `n` device names to be wrong options next to `correct`.
  //  exclude      names that must not appear (e.g. the sentence's alsoDevices)
  //  avoidClash   keep devices with a too-similar effect out of the set (used for every question that shows effects)
  // Up to two of the picks come from `correct`'s confusableWith list (all of it when it has fewer than two); the rest
  // are random. If avoidClash cannot be satisfied the remaining places are filled without it (does not happen with the
  // current clash list — the test checks it).
  function pickDeviceNames(correct, n, opts) {
    const { exclude = [], avoidClash = false } = opts || {};
    const banned = new Set([correct, ...exclude]);
    const ok = (name, chosen) => !banned.has(name) && !chosen.includes(name) && (!avoidClash || (!effectsClash(name, correct) && !chosen.some((c) => effectsClash(c, name))));
    const chosen = [];
    for (const name of shuffle(confusablesOf(correct))) {
      if (chosen.length >= Math.min(2, n)) break;
      if (ok(name, chosen)) chosen.push(name);
    }
    for (const name of shuffle(ALL_NAMES)) {
      if (chosen.length >= n) break;
      if (ok(name, chosen)) chosen.push(name);
    }
    for (const name of shuffle(ALL_NAMES)) {
      if (chosen.length >= n) break;
      if (!banned.has(name) && !chosen.includes(name)) chosen.push(name);
    }
    return chosen;
  }

  function makeQuestion(kind, item, sentence, ask, options, correct) {
    return { itemId: item.id, kind, sentence, ask, options, correctIndex: options.indexOf(correct) };
  }

  function buildDeviceQuestion(pool, item) {
    const wrong = pickDeviceNames(item.device, 3, { exclude: alsoOf(item) });
    return makeQuestion("device", item, item.sentence, "這句運用了什麼修辭手法？", shuffle([item.device, ...wrong]), item.device);
  }

  // Asks what effect the stated device has — tests why a writer uses it, not just keyword spotting.
  function buildEffectQuestion(pool, item) {
    const correct = DEVICE_BY_NAME[item.device].effect;
    const wrong = pickDeviceNames(item.device, 3, { exclude: alsoOf(item), avoidClash: true }).map((nm) => DEVICE_BY_NAME[nm].effect);
    return makeQuestion("effect", item, item.sentence, `這句運用了「${item.device}」，這樣寫有什麼作用？`, shuffle([correct, ...wrong]), correct);
  }

  // Reverse of the first kind: the device is given, the child picks the sentence. The three wrong sentences come from
  // three different devices (confusable ones first) and none of them uses the target device.
  function buildFindSentenceQuestion(pool, item) {
    const target = item.device;
    const names = pickDeviceNames(target, 3);
    const wrong = names.map((nm) => {
      const fits = (s) => s.device === nm && !usesDevice(s, target) && s.id !== item.id;
      const local = pool.filter(fits);
      return pickOne(local.length ? local : RHETORIC_PRACTICE_SENTENCES.filter(fits)).sentence;
    });
    return makeQuestion("find-sentence", item, null, `以下哪一句運用了「${target}」？`, shuffle([item.sentence, ...wrong]), item.sentence);
  }

  // 是非題. `wantTrue` decides whether the stated device is the right one; a wrong claim always names a device the
  // sentence is commonly mistaken for. Only called with a sentence that has no alsoDevices.
  function buildTrueFalseQuestion(pool, item, wantTrue) {
    let claim = item.device;
    if (!wantTrue) {
      const choices = confusablesOf(item.device).filter((nm) => !usesDevice(item, nm));
      claim = choices.length ? pickOne(choices) : pickDeviceNames(item.device, 1, { exclude: alsoOf(item) })[0];
    }
    const options = ["正確", "不正確"];
    return makeQuestion("true-false", item, item.sentence, `這句運用了「${claim}」。這個說法正確嗎？`, options, wantTrue ? "正確" : "不正確");
  }

  // Effect text given, the child names the device. Wrong options prefer confusable devices but never one whose effect is
  // too close to the right one.
  function buildEffectDeviceQuestion(pool, item) {
    const wrong = pickDeviceNames(item.device, 3, { avoidClash: true });
    return makeQuestion("effect-device", item, null, `哪一種修辭手法的作用是「${DEVICE_BY_NAME[item.device].effect.replace(/。$/, "")}」？`, shuffle([item.device, ...wrong]), item.device);
  }

  // `chooseFrom` (defaults to `pool`) is the set of sentences actually asked about; `pool` supplies the wrong sentences.
  // This split lets 練習錯題 ask about only the mistaken sentences without shrinking the pool of wrong options.
  function buildQuestions(pool, count, chooseFrom) {
    const n = count || QUESTION_COUNT;
    const chosen = sampleWithRepeats(chooseFrom || pool, n);
    // Kinds come in blocks of five, each block a shuffle of all five kinds, so every kind appears (3 times in 15) in an
    // unpredictable order; a block never starts with the kind the previous block ended on.
    const kinds = [];
    while (kinds.length < chosen.length) {
      let block = shuffle(KINDS);
      while (kinds.length && block[0] === kinds[kinds.length - 1]) block = shuffle(KINDS);
      kinds.push(...block);
    }
    kinds.length = chosen.length;

    // A 是非題 needs a stem without alsoDevices: swap such a sentence into a slot of another kind, or ask a different kind.
    kinds.forEach((kind, i) => {
      if (kind !== "true-false" || !alsoOf(chosen[i]).length) return;
      const j = chosen.findIndex((it, k) => k !== i && kinds[k] !== "true-false" && !alsoOf(it).length);
      if (j >= 0) {
        const t = chosen[i];
        chosen[i] = chosen[j];
        chosen[j] = t;
      } else {
        kinds[i] = "device";
      }
    });

    // About half of the 是非題 are true: a shuffled alternating list, so 3 questions give 2 + 1.
    const tfCount = kinds.filter((k) => k === "true-false").length;
    const tfFlags = shuffle(Array.from({ length: tfCount }, (_, i) => i % 2 === 0));
    let tf = 0;
    return chosen.map((item, i) => {
      switch (kinds[i]) {
        case "effect":
          return buildEffectQuestion(pool, item);
        case "find-sentence":
          return buildFindSentenceQuestion(pool, item);
        case "true-false":
          return buildTrueFalseQuestion(pool, item, tfFlags[tf++]);
        case "effect-device":
          return buildEffectDeviceQuestion(pool, item);
        default:
          return buildDeviceQuestion(pool, item);
      }
    });
  }

  window.App.RhetoricQuiz = { QUESTION_COUNT, KINDS, buildQuestions, pickDeviceNames, usesDevice, effectsClash };
})();
