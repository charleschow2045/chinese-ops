// 徽章: the badge collection. Pure display of Storage.BADGES against the saved
// state — nothing about "earned" is stored (see Storage.jsx 徽章). Each badge is
// a 印章 (seal); locked ones are faded with a "？" and show their progress.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE, PaperCard, Seal } = window.App.UI;

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

  function BadgesScreen({ state, onBack }) {
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
})();
