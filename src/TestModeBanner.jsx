// 測試模式橫條: shown at the very top of every screen whenever the site was
// opened with `?today=YYYY-MM-DD` (see Storage.jsx "測試模式"). In that mode
// the app uses its own localStorage key and a pretend date, so the real
// progress is never touched. Renders nothing in normal mode.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;

  function withToday(date) {
    const url = new URL(window.location.href);
    if (date) url.searchParams.set("today", date);
    else url.searchParams.delete("today");
    return url.toString();
  }

  function TestModeBanner() {
    if (!Storage.TEST_MODE) return null;

    const date = Storage.todayStr();
    const validParam = Storage.isValidDateStr(Storage.TEST_DATE_PARAM);

    function goDay(delta) {
      window.location.href = withToday(Storage.addDays(date, delta));
    }

    function exitTestMode() {
      window.location.href = withToday(null);
    }

    function resetTestData() {
      // Only ever the test key — the real progress key is never touched here.
      if (Storage.STORAGE_KEY !== "chineseOps:test") return;
      if (!window.confirm("確定要清除所有測試資料嗎？（正式進度不受影響）")) return;
      try {
        localStorage.removeItem(Storage.STORAGE_KEY);
      } catch (e) {
        // ignore — reload below still shows whatever is stored
      }
      window.location.reload();
    }

    const pill = {
      backgroundColor: "rgba(247,240,227,0.16)",
      border: "1.5px solid rgba(247,240,227,0.5)",
      color: "#F7F0E3",
      minHeight: 40,
    };

    return (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          backgroundColor: "#5E1C17",
          color: "#F7F0E3",
          boxShadow: "0 3px 10px rgba(36,31,27,0.35)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-2 flex flex-col gap-2">
          <p className="text-base font-bold leading-snug">
            🧪 測試模式　測試日期 {date}
            {!validParam && <span className="text-sm font-normal">（網址日期無效，已使用今日）</span>}
          </p>
          <p className="text-sm leading-snug">這裏的進度只存放在測試區，不會影響正式進度。</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => goDay(-1)} className="rounded-xl px-3 text-sm font-bold" style={pill}>
              ◀ 前一日
            </button>
            <button onClick={() => goDay(1)} className="rounded-xl px-3 text-sm font-bold" style={pill}>
              後一日 ▶
            </button>
            <button onClick={resetTestData} className="rounded-xl px-3 text-sm font-bold" style={pill}>
              清除測試資料
            </button>
            <button onClick={exitTestMode} className="rounded-xl px-3 text-sm font-bold" style={{ ...pill, backgroundColor: "#F7F0E3", color: "#5E1C17" }}>
              離開測試模式
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.App.TestModeBanner = TestModeBanner;
})();
