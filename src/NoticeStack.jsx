// 回饋橫幅: dismissible cards shown at the bottom of ANY screen right after a
// practice session is finished (mission done, day done, protection charm used or
// earned, new badge). Transient — Root keeps them in memory only, they are never
// saved or backed up. Bottom placement keeps clear of the sticky test-mode
// banner at the top and respects the home-screen safe area.
window.App = window.App || {};

(function () {
  const { useEffect, useRef } = React;
  const { INK, MODULE_ACCENTS, FEEDBACK, TYPE, Seal, A2, useA2 } = window.App.UI;
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

  // 階段 6d-1: A2 look (when Root's A2 switch is on). Same notices, same texts, same timing and dismiss behaviour;
  // near-white card with a coloured edge per kind, 44 px round close button, 44 px 「查看徽章」 link. The 文房 card is kept below.
  const KIND_A2 = {
    day: { edge: A2.hot, tile: A2.todayBg },
    mission: { edge: A2.ok, tile: A2.rowDone },
    freeze: { edge: A2.shieldInk, tile: A2.shieldBg },
    badge: { edge: A2.acc, tile: A2.row },
  };

  function NoticeCardA2({ notice, onDismiss, onOpenBadges }) {
    const { Storage } = window.App;
    const badge = notice.kind === "badge" ? Storage.BADGES.find((b) => b.key === notice.badgeKey) : null;
    const k = KIND_A2[notice.kind] || KIND_A2.mission;
    return (
      <div
        className="flex items-center gap-3"
        style={{
          pointerEvents: "auto",
          background: A2.glassSolid,
          border: `2px solid ${k.edge}`,
          borderRadius: 24,
          padding: 12,
          fontFamily: A2.font,
          color: A2.ink,
          boxShadow: "0 2px 4px rgba(30,20,90,0.12), 0 16px 30px -12px rgba(30,20,90,0.5)",
        }}
      >
        {badge ? (
          <span
            aria-hidden="true"
            style={{ flex: "none", display: "grid", placeItems: "center", width: 52, height: 52, borderRadius: 11, background: A2.sealBg, color: A2.sealInk, fontFamily: '"Noto Serif TC","Songti TC",serif', fontWeight: 900, fontSize: 26, lineHeight: 1, transform: "rotate(6deg)" }}
          >
            {badge.seal}
          </span>
        ) : (
          <span aria-hidden="true" style={{ flex: "none", display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 16, background: k.tile, fontSize: 24 }}>
            {notice.icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.3, margin: 0 }}>{notice.title}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: A2.sub, margin: "2px 0 0" }}>{notice.text}</p>
          {badge && (
            <button
              onClick={() => onOpenBadges(notice.id)}
              style={{ minHeight: 44, padding: "0 4px", fontSize: 15, fontWeight: 900, color: A2.accD, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer", fontFamily: A2.font }}
            >
              查看徽章 ›
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(notice.id)}
          aria-label="關閉"
          className="shrink-0"
          style={{ width: 44, height: 44, borderRadius: "50%", border: 0, background: A2.segTrack, color: A2.accD, fontSize: 22, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ×
        </button>
      </div>
    );
  }

  const AUTO_DISMISS_MS = 25000;

  function NoticeStack({ notices, onDismiss, onDismissAll, onOpenBadges, onHeight }) {
    const a2 = useA2();
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
            a2 ? (
              <button
                onClick={onDismissAll}
                className="self-end"
                style={{ pointerEvents: "auto", minHeight: 44, padding: "0 18px", borderRadius: 999, border: 0, background: A2.glassSolid, color: A2.accD, fontFamily: A2.font, fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 16px -8px rgba(30,20,90,0.5)" }}
              >
                全部關閉 ×
              </button>
            ) : (
            <button
              onClick={onDismissAll}
              className={`self-end rounded-xl px-4 text-sm ${TYPE.heading}`}
              style={{ pointerEvents: "auto", minHeight: 44, color: INK.ink, backgroundColor: INK.paperCard, border: "1.5px solid #D9CDB0", boxShadow: "0 6px 14px -6px rgba(36,31,27,0.35)" }}
            >
              全部關閉 ×
            </button>
            )
          )}
          {notices.map((n) =>
            a2 ? (
              <NoticeCardA2 key={n.id} notice={n} onDismiss={onDismiss} onOpenBadges={onOpenBadges} />
            ) : (
              <NoticeCard key={n.id} notice={n} onDismiss={onDismiss} onOpenBadges={onOpenBadges} />
            )
          )}
        </div>
      </div>
    );
  }

  window.App.NoticeStack = NoticeStack;
})();
