// Shared helpers for text-to-speech (speechSynthesis) and speech recognition
// (SpeechRecognition), used by MandarinModule. Browser support for both is
// inconsistent (especially recognition, which needs mic permission and
// network access, and is unreliable/unsupported on some browsers) — every
// caller MUST handle the null/unsupported cases and offer a manual fallback.
window.App = window.App || {};

(function () {
  function pickMandarinVoice(voices) {
    return (
      voices.find((v) => v.lang === "zh-CN") ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh")) ||
      null
    );
  }

  // Cantonese voice — most platforms only ship one or two zh-HK voices (if
  // any). Falls back to any zh* voice like pickMandarinVoice does, since a
  // Mandarin voice reading Cantonese text is still better than no audio at
  // all; callers should treat this as best-effort, not guaranteed Cantonese.
  function pickCantoneseVoice(voices) {
    return (
      voices.find((v) => v.lang === "zh-HK") ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh-hk")) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh")) ||
      null
    );
  }

  // Voice lists load asynchronously in most browsers; resolves once populated
  // (or after a short timeout, with whatever's available at that point).
  function getVoicesAsync() {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve([]);
        return;
      }
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      const handler = () => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          window.speechSynthesis.removeEventListener("voiceschanged", handler);
          resolve(voices);
        }
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      }, 1000);
    });
  }

  // `fallbackLang` is used when no matching voice was found at all (e.g. no
  // zh-HK voice installed) — still hints the right language to the engine
  // rather than silently defaulting to zh-CN for a Cantonese request.
  function speak(text, voice, fallbackLang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = fallbackLang || "zh-CN";
    }
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }

  // Strips tone-mark diacritics and non-letter characters so pinyin typed
  // without tone marks (or with different spacing) still matches.
  // Built from numeric char codes (0x0300-0x036f = combining diacritical
  // marks) rather than a "̀" regex literal, to sidestep any tooling
  // that might mangle backslash-u escapes when this file is edited.
  const DIACRITICS_RE = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");

  function normalizePinyin(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITICS_RE, "")
      .replace(/[^a-z]/g, "");
  }

  function normalizeHanzi(s) {
    return (s || "").toString().replace(/[，。！？、\s,.!?]/g, "");
  }

  function isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function createRecognizer() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    return rec;
  }

  window.App.SpeechUtils = {
    pickMandarinVoice,
    pickCantoneseVoice,
    getVoicesAsync,
    speak,
    normalizePinyin,
    normalizeHanzi,
    isRecognitionSupported,
    createRecognizer,
  };
})();
