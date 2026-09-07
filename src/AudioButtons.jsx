// Shared 🔊 普通話 / 🔊 粵語 pronunciation buttons, built for Module 5's
// per-character pinyin cards and reused across most modules so they get the
// same read-aloud capability without duplicating the voice-loading logic.
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
  const { InkButton, MODULE_ACCENTS } = window.App.UI;
  const { getVoicesAsync, pickMandarinVoice, pickCantoneseVoice, speak } = window.App.SpeechUtils;

  // `text` is read aloud in full on each button press; `accent` is a
  // MODULE_ACCENTS entry (see theme.jsx) matching the calling module's own
  // color family, so these buttons always sit in the same palette as the
  // rest of that module rather than a fixed legacy color.
  function AudioButtons({ text, accent, className = "" }) {
    const [voices, setVoices] = useState([]);
    useEffect(() => {
      let cancelled = false;
      getVoicesAsync().then((v) => {
        if (!cancelled) setVoices(v);
      });
      return () => {
        cancelled = true;
      };
    }, []);

    const mandarinVoice = pickMandarinVoice(voices);
    const cantoneseVoice = pickCantoneseVoice(voices);
    const a = accent || MODULE_ACCENTS.essay;

    return (
      <div className={`flex gap-2 ${className}`}>
        <InkButton accent={a} className="flex-1 !py-2 !text-sm" onClick={() => speak(text, mandarinVoice, "zh-CN")}>
          🔊 普通話
        </InkButton>
        <InkButton accent={a} className="flex-1 !py-2 !text-sm" onClick={() => speak(text, cantoneseVoice, "zh-HK")}>
          🔊 粵語
        </InkButton>
      </div>
    );
  }

  window.App.AudioButtons = AudioButtons;
})();
