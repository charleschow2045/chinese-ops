// 徽章: the badge collection. Pure display of Storage.BADGES against the saved
// state — nothing about "earned" is stored (see Storage.jsx 徽章). Each badge is
// a 印章 (seal); locked ones are faded with a "？" and show their progress.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { A2, A2Card, A2BackButton } = window.App.UI;

  // ---------------------------------------------------------------------
  // A2 screen. Same data, same earned / locked rule, same texts;
  // earned badges are white tiles with a red seal and 「✓ 已獲得」, locked ones are flat lilac tiles with a dashed 「？」
  // and a progress bar. Text >= 14 px (seal characters aside), back button is A2BackButton.
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

  window.App.BadgesScreen = BadgesScreenA2;
})();
