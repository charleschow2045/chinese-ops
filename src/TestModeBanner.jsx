// 測試模式橫條: shown at the very top of every screen whenever the site was
// opened with `?today=YYYY-MM-DD` (see Storage.jsx "測試模式"). In that mode
// the app uses its own localStorage key and a pretend date, so the real
// progress is never touched. Renders nothing in normal mode.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { A2 } = window.App.UI;

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

    // A2 look: deep-indigo sticky bar with a warm 「測試模式」 chip so it still reads as "not the real data";
    // the buttons are 44 px high pills.
    const abtn = {
      minHeight: 44,
      padding: "0 16px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.45)",
      background: "rgba(255,255,255,.16)",
      color: "#fff",
      fontFamily: A2.font,
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer",
    };
    return (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "#1F1859",
          color: "#fff",
          fontFamily: A2.font,
          boxShadow: "0 6px 16px rgba(21,18,63,.45)",
          paddingTop: "var(--sat)",
        }}
      >
        <div
          className="max-w-2xl mx-auto flex flex-col gap-2"
          style={{ padding: "10px max(1rem, var(--sar)) 12px max(1rem, var(--sal))" }}
        >
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900, lineHeight: 1.5 }}>
            <span style={{ background: A2.fireBg, color: A2.fireInk, borderRadius: 999, padding: "1px 10px", marginRight: 8 }}>🧪 測試模式</span>
            測試日期 {date}
            {!validParam && <span style={{ fontSize: 14, fontWeight: 400 }}>（網址日期無效，已使用今日）</span>}
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,.92)" }}>這裏的進度只存放在測試區，不會影響正式進度。</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => goDay(-1)} style={abtn}>
              ◀ 前一日
            </button>
            <button onClick={() => goDay(1)} style={abtn}>
              後一日 ▶
            </button>
            <button onClick={resetTestData} style={abtn}>
              清除測試資料
            </button>
            <button onClick={exitTestMode} style={{ ...abtn, background: "#fff", color: "#1F1859", border: "1px solid #fff" }}>
              離開測試模式
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.App.TestModeBanner = TestModeBanner;
})();
