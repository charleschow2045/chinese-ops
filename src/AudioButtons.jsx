// Shared 🔊 普通話 / 🔊 粵語 pronunciation buttons, built for Module 5's
// per-character pinyin cards and reused here so Poetry and History get the
// same read-aloud capability without duplicating the voice-loading logic.
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
  const { Button } = window.App.UI;
  const { getVoicesAsync, pickMandarinVoice, pickCantoneseVoice, speak } = window.App.SpeechUtils;

  // `text` is read aloud in full on each button press; `color` matches the
  // calling module's theme color (see theme.jsx COLORS).
  function AudioButtons({ text, color = "rose", className = "" }) {
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

    return (
      <div className={`flex gap-2 ${className}`}>
        <Button color={color} className="flex-1 !py-2 !text-sm" onClick={() => speak(text, mandarinVoice, "zh-CN")}>
          🔊 普通話
        </Button>
        <Button color={color} className="flex-1 !py-2 !text-sm" onClick={() => speak(text, cantoneseVoice, "zh-HK")}>
          🔊 粵語
        </Button>
      </div>
    );
  }

  window.App.AudioButtons = AudioButtons;
})();
