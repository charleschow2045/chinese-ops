// 備份與還原: progress lives only in this browser's localStorage, so this is
// the sole defence against cleared browser data or a new device. Export
// downloads a JSON file; import validates it (right app, sane shape — never
// throws), shows a confirmation summary, and only then overwrites.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { A2, A2Card, A2Button } = window.App.UI;

  const ERRORS = {
    invalid: "這個檔案無法讀取，可能已損壞，或不是備份檔。請選擇由本網站匯出的備份檔。",
    wrongApp: "這不是「中文學習」的備份檔，無法還原。請確認選擇了正確的檔案。",
    newerVersion: "這個備份檔來自較新版本的網站，請先重新載入網頁（或更新）後再試。",
    tooBig: "檔案過大，不是有效的備份檔。",
    testFile: "這是「測試模式」匯出的備份檔，不可還原到正式進度。",
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
    const streak = Storage.getStreakView(state, Storage.todayStr()).count;
    return { attempts, correct, mistakes, streak, badges: Storage.earnedBadgeKeys(state).length, bestStreak: state.stats.bestStreak, levelLabel: level ? level.label : "" };
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
        a.download = `chinese-ops${Storage.TEST_MODE ? "-TEST" : ""}-backup-${dateStamp(new Date())}.json`;
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
    // A2 look. Same texts, same flow (export, choose a file, confirm screen, overwrite); buttons >= 48 px, text >= 14 px.
    const note = { fontSize: 14, lineHeight: 1.7, color: A2.sub, margin: 0 };
    const pill = { minHeight: 48, borderRadius: 999, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer", padding: "0 24px" };
    const secondary = { ...pill, border: 0, background: A2.segTrack, color: A2.accD, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" };
    return (
      <div className="mt-2" style={{ fontFamily: A2.font, color: A2.ink }}>
        <button
          onClick={toggle}
          aria-expanded={open}
          className="mx-auto block"
          style={{ ...pill, border: 0, background: A2.glass, color: A2.accD, boxShadow: A2.shadow, minWidth: 96 }}
        >
          {open ? "收起" : "💾 備份與還原進度"}
        </button>

        {open && (
          <A2Card className="mt-3" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 10px" }}>備份與還原</h2>

            {pending ? (
              <div className="flex flex-col gap-3">
                <p style={{ fontSize: 16, fontWeight: 900, color: A2.hotInk, margin: 0, lineHeight: 1.6 }}>
                  確認還原？目前裝置上的進度將被覆蓋，無法復原。
                </p>
                <div style={{ borderRadius: 16, padding: 14, background: A2.row, border: `1px solid ${A2.rowBd}`, fontSize: 15, lineHeight: 1.8, color: A2.ink }}>
                  <p style={{ margin: 0 }}>備份日期：{pending.exportedAt ? dateLabel(pending.exportedAt) : "（檔案沒有記錄日期）"}</p>
                  <p style={{ margin: 0 }}>程度：{sum.levelLabel}</p>
                  <p style={{ margin: 0 }}>
                    累計練習：{sum.correct} / {sum.attempts} 題答對
                  </p>
                  <p style={{ margin: 0 }}>練習錯題：{sum.mistakes} 題</p>
                  <p style={{ margin: 0 }}>
                    連續日數：{sum.streak} 日（最長 {sum.bestStreak} 日）
                  </p>
                  <p style={{ margin: 0 }}>
                    徽章：{sum.badges} / {Storage.BADGES.length}
                  </p>
                </div>
                <div className="flex gap-3">
                  <A2Button className="flex-1" style={{ padding: "0 16px" }} onClick={confirmRestore}>
                    確認還原
                  </A2Button>
                  <button onClick={() => setPending(null)} className="flex-1" style={secondary}>
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Storage.TEST_MODE && (
                  <p style={{ fontSize: 14, fontWeight: 900, color: A2.hotInk, margin: 0, lineHeight: 1.6 }}>
                    目前是測試模式：匯出和還原只影響測試資料，不會動到正式進度。
                  </p>
                )}
                <p style={{ ...note, color: A2.ink }}>
                  學習進度和練習錯題只儲存在這部裝置的瀏覽器內。清除瀏覽器資料或更換裝置，進度便會消失。
                  <b>建議每星期備份一次。</b>
                </p>
                <p style={note}>
                  iPad 用家：請在 Safari 按「分享」圖示，選擇「加入主畫面」，以便隨時開啟。請留意，主畫面版本的資料可能與
                  Safari 分頁分開儲存，因此更需要定期備份。
                </p>

                <A2Button className="w-full" onClick={handleExport}>
                  匯出備份檔
                </A2Button>

                <label className="cursor-pointer" style={secondary}>
                  從備份檔還原
                  <input type="file" accept="application/json,.json" onChange={handleFileSelect} className="hidden" />
                </label>

                {error && (
                  <p style={{ fontSize: 14, fontWeight: 900, color: A2.hotInk, margin: 0, lineHeight: 1.6 }}>{error}</p>
                )}
                {success && (
                  <p style={{ fontSize: 14, fontWeight: 900, color: A2.ok, margin: 0, lineHeight: 1.6 }}>已成功還原進度。</p>
                )}
              </div>
            )}
          </A2Card>
        )}
      </div>
    );
  }

  window.App.BackupSettings = BackupSettings;
})();
