// 回饋橫幅: dismissible cards shown at the bottom of ANY screen right after a
// practice session is finished (mission done, day done, protection charm used or
// earned, new badge). Transient — Root keeps them in memory only, they are never
// saved or backed up. Bottom placement keeps clear of the sticky test-mode
// banner at the top and respects the home-screen safe area.
window.App = window.App || {};

(function () {
  const { useEffect, useRef } = React;
  const { INK, MODULE_ACCENTS, FEEDBACK, TYPE, Seal } = window.App.UI;
  const SUB = INK.subInk;

  const KIND_ACCENT = {
    day: MODULE_ACCENTS.essay, // vermillion
    mission: FEEDBACK.correct, // bamboo
    freeze: MODULE_ACCENTS.poetry, // indigo
  };

  function NoticeCard({ notice, onDismiss, onOpenBadges }) {
    const { Storage, badgeAccent } = window.App;
    const badge = notice.kind === "badge" ? Storage.BADGES.find((b) => b.key === notice.badgeKey) : null;
    const a = badge ? badgeAccent(badge) : KIND_ACCENT[notice.kind] || MODULE_ACCENTS.essay;
    return (
      <div
        className="flex items-center gap-3 rounded-2xl p-3"
        style={{
          pointerEvents: "auto",
          backgroundColor: INK.paperCard,
          border: `2px solid ${a.solid}`,
          boxShadow: "0 2px 4px rgba(36,31,27,0.10), 0 14px 28px -10px rgba(36,31,27,0.45)",
        }}
      >
        {badge ? (
          <Seal label={badge.seal} accent={a} className="!w-14 !h-14 !text-2xl shrink-0" />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: a.tint, border: `1.5px solid ${a.tintBorder}` }}
          >
            {notice.icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-base leading-tight ${TYPE.heading}`} style={{ color: INK.ink }}>
            {notice.title}
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: SUB }}>
            {notice.text}
          </p>
          {badge && (
            <button
              onClick={() => onOpenBadges(notice.id)}
              className="text-sm font-bold mt-1 underline underline-offset-4"
              style={{ color: a.dark, minHeight: 32 }}
            >
              查看徽章 ›
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(notice.id)}
          aria-label="關閉"
          className="shrink-0 rounded-xl text-xl font-bold flex items-center justify-center"
          style={{ width: 44, height: 44, color: SUB, backgroundColor: "#EFE8D6", border: "1.5px solid #D9CDB0" }}
        >
          ×
        </button>
      </div>
    );
  }

  const AUTO_DISMISS_MS = 25000;

  function NoticeStack({ notices, onDismiss, onDismissAll, onOpenBadges, onHeight }) {
    const boxRef = useRef(null);
    const timers = useRef({});

    // Each notice goes away by itself after a while (the × / 全部關閉 buttons are always there too).
    useEffect(() => {
      notices.forEach((n) => {
        if (!timers.current[n.id]) timers.current[n.id] = setTimeout(() => onDismiss(n.id), AUTO_DISMISS_MS);
      });
      Object.keys(timers.current).forEach((id) => {
        if (!notices.some((n) => n.id === id)) {
          clearTimeout(timers.current[id]);
          delete timers.current[id];
        }
      });
    }, [notices]);
    useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

    // Tell the page how tall the stack is so it can leave room underneath (otherwise it
    // would cover the bottom of whatever screen is open until it is dismissed).
    useEffect(() => {
      const el = boxRef.current;
      if (!el || typeof ResizeObserver === "undefined") return undefined;
      const ro = new ResizeObserver(() => onHeight && onHeight(el.offsetHeight));
      ro.observe(el);
      onHeight && onHeight(el.offsetHeight);
      return () => ro.disconnect();
    }, [notices.length > 0]);

    if (!notices.length) return null;
    return (
      <div
        ref={boxRef}
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          pointerEvents: "none",
          paddingLeft: "max(0.75rem, var(--sal))",
          paddingRight: "max(0.75rem, var(--sar))",
          paddingBottom: "calc(0.75rem + var(--sab))",
        }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {notices.length > 1 && (
            <button
              onClick={onDismissAll}
              className={`self-end rounded-xl px-4 text-sm ${TYPE.heading}`}
              style={{ pointerEvents: "auto", minHeight: 44, color: INK.ink, backgroundColor: INK.paperCard, border: "1.5px solid #D9CDB0", boxShadow: "0 6px 14px -6px rgba(36,31,27,0.35)" }}
            >
              全部關閉 ×
            </button>
          )}
          {notices.map((n) => (
            <NoticeCard key={n.id} notice={n} onDismiss={onDismiss} onOpenBadges={onOpenBadges} />
          ))}
        </div>
      </div>
    );
  }

  window.App.NoticeStack = NoticeStack;
})();
