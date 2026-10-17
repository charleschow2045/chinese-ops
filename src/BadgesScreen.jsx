// 徽章: the badge collection. Pure display of Storage.BADGES against the saved
// state — nothing about "earned" is stored (see Storage.jsx 徽章). Each badge is
// a 印章 (seal); locked ones are faded with a "？" and show their progress.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE, PaperCard, Seal, A2, A2Card, A2BackButton, useA2 } = window.App.UI;

  const SUB = INK.subInk;

  // Seal colour by badge group; module badges use their own module's accent.
  function accentFor(badge) {
    if (badge.group === "module") return MODULE_ACCENTS[badge.module];
    if (badge.group === "milestone") return REVIEW_ACCENT;
    if (badge.group === "special") return MODULE_ACCENTS.poetry;
    return MODULE_ACCENTS.essay; // streak: vermillion
  }

  function BadgeTile({ badge, state }) {
    const a = accentFor(badge);
    const { cur, target } = Storage.badgeProgress(state, badge);
    const earned = cur >= target;
    return (
      <div
        className="flex items-start gap-3 rounded-2xl p-3"
        style={{
          backgroundColor: earned ? INK.paperCard : "#EDE6D5",
          border: `1.5px solid ${earned ? a.tintBorder : "#D9CDB0"}`,
          boxShadow: earned ? "0 1px 2px rgba(36,31,27,0.05), 0 8px 18px -8px rgba(36,31,27,0.16)" : "none",
        }}
      >
        {earned ? (
          <Seal label={badge.seal} accent={a} className="!w-14 !h-14 !text-2xl shrink-0" />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-serif font-black shrink-0 select-none"
            style={{ border: "2px dashed #BFB291", color: "#9A8F78", transform: "rotate(6deg)" }}
          >
            ？
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-lg leading-tight ${TYPE.heading}`} style={{ color: earned ? INK.ink : SUB }}>
            {badge.name}
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: SUB }}>
            {badge.condition}
          </p>
          <p className="text-sm leading-snug mt-1" style={{ color: SUB }}>
            意思：{badge.meaning}
          </p>
          {earned ? (
            <p className="text-sm font-bold mt-1" style={{ color: INK.bamboo }}>
              ✓ 已獲得
            </p>
          ) : (
            <div className="mt-2">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#DDD2B6" }}>
                <div className="h-full rounded-full" style={{ width: `${(cur / target) * 100}%`, backgroundColor: a.solid }} />
              </div>
              <p className="text-sm font-bold mt-1" style={{ color: SUB }}>
                進度 {cur} / {target}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // 階段 6d-1: A2 version (used whenever Root's A2 switch is on). Same data, same earned / locked rule, same texts;
  // earned badges are white tiles with a red seal and 「✓ 已獲得」, locked ones are flat lilac tiles with a dashed 「？」
  // and a progress bar. Text >= 14 px (seal characters aside), back button is A2BackButton. The 文房 screen is kept below.
  // ---------------------------------------------------------------------
  const SERIF = '"Noto Serif TC","Songti TC",serif';

  function BadgeTileA2({ badge, state }) {
    const { cur, target } = Storage.badgeProgress(state, badge);
    const earned = cur >= target;
    return (
      <div
        className="flex items-start gap-3"
        style={{
          borderRadius: 22,
          padding: 14,
          fontFamily: A2.font,
          color: A2.ink,
          ...(earned
            ? { background: A2.glass, border: `1px solid ${A2.glassBd}`, boxShadow: A2.shadow }
            : { background: A2.row, border: `1px dashed ${A2.sub}` }),
        }}
      >
        {earned ? (
          <span
            aria-hidden="true"
            style={{ flex: "none", display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: 12, background: A2.sealBg, color: A2.sealInk, fontFamily: SERIF, fontWeight: 900, fontSize: 28, lineHeight: 1, transform: "rotate(6deg)", boxShadow: "0 3px 8px rgba(150,36,28,.4)" }}
          >
            {badge.seal}
          </span>
        ) : (
          <span
            aria-hidden="true"
            style={{ flex: "none", display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: 12, border: `2px dashed ${A2.sub}`, color: A2.sub, fontFamily: SERIF, fontWeight: 900, fontSize: 26, transform: "rotate(6deg)" }}
          >
            ？
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.3, margin: 0, color: earned ? A2.ink : A2.sub }}>{badge.name}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: "2px 0 0", color: A2.sub }}>{badge.condition}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: "4px 0 0", color: A2.sub }}>意思：{badge.meaning}</p>
          {earned ? (
            <p style={{ fontSize: 14, fontWeight: 900, margin: "6px 0 0", color: A2.ok }}>✓ 已獲得</p>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 8, borderRadius: 99, background: A2.barTrack, overflow: "hidden" }}>
                <div style={{ width: `${(cur / target) * 100}%`, height: "100%", borderRadius: 99, background: A2.acc }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 900, margin: "4px 0 0", color: A2.sub }}>
                進度 {cur} / {target}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function BadgesScreenA2({ state, onBack }) {
    const earnedCount = Storage.earnedBadgeKeys(state).length;
    const total = Storage.BADGES.length;
    let next = null;
    Storage.BADGES.forEach((b) => {
      const { cur, target } = Storage.badgeProgress(state, b);
      if (cur >= target) return;
      if (!next || cur / target > next.ratio) next = { badge: b, cur, target, ratio: cur / target };
    });
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font, color: A2.ink }}>
        <div>
          <A2BackButton label="← 返回主頁" onClick={onBack} />
        </div>

        <A2Card>
          <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.25, margin: 0 }}>🏅 徽章</h1>
          <p style={{ fontSize: 20, fontWeight: 900, color: A2.accD, margin: "4px 0 0" }}>
            已獲得 {earnedCount} / {total}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={earnedCount}
            aria-label="已獲得徽章"
            style={{ height: 10, borderRadius: 99, background: A2.barTrack, overflow: "hidden", margin: "10px 0" }}
          >
            <div style={{ width: `${(earnedCount / total) * 100}%`, height: "100%", borderRadius: 99, background: A2.acc }} />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: A2.sub, margin: 0 }}>
            {next
              ? `下一個目標：「${next.badge.name}」（${next.badge.condition}，進度 ${next.cur} / ${next.target}）`
              : "全部徽章都已獲得，真了不起！"}
          </p>
        </A2Card>

        {Storage.BADGE_GROUPS.map((g) => {
          const list = Storage.BADGES.filter((b) => b.group === g.key);
          const got = list.filter((b) => Storage.isBadgeEarned(state, b)).length;
          return (
            <section key={g.key} className="flex flex-col gap-2" aria-label={g.label}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "4px 4px 0", display: "flex", alignItems: "baseline", gap: 10 }}>
                {g.label}
                <span style={{ fontSize: 14, fontWeight: 900, color: A2.sub }}>
                  {got} / {list.length}
                </span>
              </h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 290px), 1fr))" }}>
                {list.map((b) => (
                  <BadgeTileA2 key={b.key} badge={b} state={state} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  function BadgesScreen({ state, onBack }) {
    const a2 = useA2();
    if (a2) return <BadgesScreenA2 state={state} onBack={onBack} />;
    const earnedCount = Storage.earnedBadgeKeys(state).length;
    const total = Storage.BADGES.length;

    // The locked badge that is closest to being earned.
    let next = null;
    Storage.BADGES.forEach((b) => {
      const { cur, target } = Storage.badgeProgress(state, b);
      if (cur >= target) return;
      if (!next || cur / target > next.ratio) next = { badge: b, cur, target, ratio: cur / target };
    });

    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className={`self-start rounded-2xl px-5 py-3 text-base transition-all active:translate-y-[2px] ${TYPE.heading}`}
          style={{ backgroundColor: INK.paperCard, border: "1.5px solid #D9CDB0", color: INK.ink, minHeight: 48 }}
        >
          ← 返回主頁
        </button>

        <PaperCard accent={REVIEW_ACCENT} className="!p-4">
          <p className={`text-2xl ${TYPE.display}`} style={{ color: INK.ink }}>
            🏅 徽章
          </p>
          <p className={`text-xl mt-1 ${TYPE.heading}`} style={{ color: REVIEW_ACCENT.dark }}>
            已獲得 {earnedCount} / {total}
          </p>
          <p className="text-sm leading-snug mt-2" style={{ color: SUB }}>
            {next
              ? `下一個目標：「${next.badge.name}」（${next.badge.condition}，進度 ${next.cur} / ${next.target}）`
              : "全部徽章都已獲得，真了不起！"}
          </p>
        </PaperCard>

        {Storage.BADGE_GROUPS.map((g) => {
          const list = Storage.BADGES.filter((b) => b.group === g.key);
          const got = list.filter((b) => Storage.isBadgeEarned(state, b)).length;
          return (
            <section key={g.key} className="flex flex-col gap-2">
              <p className={`text-lg ${TYPE.heading}`} style={{ color: INK.ink }}>
                {g.label}　<span className="text-sm font-bold" style={{ color: SUB }}>{got} / {list.length}</span>
              </p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
                {list.map((b) => (
                  <BadgeTile key={b.key} badge={b} state={state} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  window.App.BadgesScreen = BadgesScreen;
  window.App.badgeAccent = accentFor; // also used by NoticeStack
})();
