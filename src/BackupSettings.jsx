// 備份與還原: progress lives only in this browser's localStorage, so this is
// the sole defence against cleared browser data or a new device. Export
// downloads a JSON file; import validates it (right app, sane shape — never
// throws), shows a confirmation summary, and only then overwrites.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { PaperCard, InkButton, INK, TYPE } = window.App.UI;

  // Neutral indigo family so the panel reads as "settings", not a module.
  const ACCENT = { solid: INK.indigo, dark: "#243241", tint: "#E4E8EC", tintBorder: "#C3CDD6", on: INK.paper };

  const ERRORS = {
    invalid: "這個檔案無法讀取，可能已損壞，或不是備份檔。請選擇由本網站匯出的備份檔。",
    wrongApp: "這不是「中文學習」的備份檔，無法還原。請確認選擇了正確的檔案。",
    newerVersion: "這個備份檔來自較新版本的網站，請先重新載入網頁（或更新）後再試。",
    tooBig: "檔案過大，不是有效的備份檔。",
  };

  const pad = (n) => String(n).padStart(2, "0");
  const dateStamp = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dateLabel = (d) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  function summarize(state) {
    let attempts = 0;
    let correct = 0;
    let mistakes = 0;
    Object.values(state.moduleProgress).forEach((p) => {
      attempts += p.practiceStats.attempts;
      correct += p.practiceStats.correct;
      mistakes += p.mistakes.length;
    });
    const level = Storage.LEVELS.find((l) => l.key === state.level);
    return { attempts, correct, mistakes, levelLabel: level ? level.label : "" };
  }

  function BackupSettings({ state, onRestore }) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(null); // { state, exportedAt } awaiting confirmation
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function toggle() {
      setOpen((v) => !v);
      setPending(null);
      setError("");
      setSuccess(false);
    }

    function handleExport() {
      try {
        const json = JSON.stringify(Storage.buildBackup(state), null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chinese-ops-backup-${dateStamp(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setError("");
        setSuccess(false);
      } catch (e) {
        setError("匯出失敗，請稍後再試。");
      }
    }

    function handleFileSelect(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      setError("");
      setSuccess(false);
      if (file.size > 2 * 1024 * 1024) {
        setError(ERRORS.tooBig);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = Storage.parseBackup(reader.result);
        if (result.ok) setPending(result);
        else setError(ERRORS[result.reason] || ERRORS.invalid);
      };
      reader.onerror = () => setError(ERRORS.invalid);
      reader.readAsText(file);
    }

    function confirmRestore() {
      onRestore(pending.state);
      setPending(null);
      setSuccess(true);
    }

    const sum = pending ? summarize(pending.state) : null;
    const textStyle = { color: INK.mutedInk };

    return (
      <div className="mt-2">
        <button
          onClick={toggle}
          className={`mx-auto block text-xs underline underline-offset-4 ${TYPE.caption}`}
          style={{ color: INK.mutedInk }}
        >
          {open ? "收起" : "💾 備份與還原進度"}
        </button>

        {open && (
          <PaperCard accent={ACCENT} className="mt-3 !p-4">
            <p className={`text-sm mb-1 ${TYPE.caption}`} style={textStyle}>
              備份與還原
            </p>

            {pending ? (
              <div className="flex flex-col gap-3">
                <p className={`text-sm font-bold ${TYPE.heading}`} style={{ color: INK.vermillion }}>
                  確認還原？目前裝置上的進度將被覆蓋，無法復原。
                </p>
                <div
                  className="rounded-xl p-3 text-sm leading-relaxed"
                  style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}`, color: INK.ink }}
                >
                  <p>備份日期：{pending.exportedAt ? dateLabel(pending.exportedAt) : "（檔案沒有記錄日期）"}</p>
                  <p>程度：{sum.levelLabel}</p>
                  <p>
                    累計練習：{sum.correct} / {sum.attempts} 題答對
                  </p>
                  <p>練習錯題：{sum.mistakes} 題</p>
                </div>
                <div className="flex gap-3">
                  <InkButton accent={ACCENT} className="flex-1 !text-base" onClick={confirmRestore}>
                    確認還原
                  </InkButton>
                  <button
                    onClick={() => setPending(null)}
                    className={`flex-1 rounded-2xl px-5 py-3 text-base ${TYPE.heading}`}
                    style={{ backgroundColor: INK.paper, border: "1.5px solid #E9DFC7", color: INK.ink }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className={`text-sm leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
                  學習進度和練習錯題只儲存在這部裝置的瀏覽器內。清除瀏覽器資料或更換裝置，進度便會消失。
                  <span className="font-bold">建議每星期備份一次。</span>
                </p>
                <p className={`text-xs leading-relaxed ${TYPE.body}`} style={textStyle}>
                  iPad 用家：請在 Safari 按「分享」圖示，選擇「加入主畫面」，以便隨時開啟。請留意，主畫面版本的資料可能與
                  Safari 分頁分開儲存，因此更需要定期備份。
                </p>

                <InkButton accent={ACCENT} className="w-full !text-base" onClick={handleExport}>
                  匯出備份檔
                </InkButton>

                <label
                  className={`cursor-pointer text-center rounded-2xl px-5 py-3 text-base ${TYPE.heading}`}
                  style={{ backgroundColor: INK.paper, border: `1.5px solid ${ACCENT.tintBorder}`, color: INK.ink }}
                >
                  從備份檔還原
                  <input type="file" accept="application/json,.json" onChange={handleFileSelect} className="hidden" />
                </label>

                {error && (
                  <p className="text-xs font-bold" style={{ color: INK.vermillion }}>
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-xs font-bold" style={{ color: INK.bamboo }}>
                    已成功還原進度。
                  </p>
                )}
              </div>
            )}
          </PaperCard>
        )}
      </div>
    );
  }

  window.App.BackupSettings = BackupSettings;
})();
