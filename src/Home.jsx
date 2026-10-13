// Home screen: today's missions + level selector + module dashboard.
// Layout is tuned for an iPad held upright (~820px wide): the missions card
// and all 10 modules fit on one screen. Small text is never below 13px and
// secondary text uses INK.subInk (7:1 contrast) rather than mutedInk.
// See theme.jsx header comment and CLAUDE.md "UI redesign" notes.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { INK, MODULE_ACCENTS, FEEDBACK, REVIEW_ACCENT, TYPE, PaperCard, Seal } = window.App.UI;

  const SUB = INK.subInk;
  const MISSION_ACCENT = MODULE_ACCENTS.essay; // vermillion family
  const MODULE_BY_KEY = Object.fromEntries(Storage.MODULES.map((m) => [m.key, m]));

  function LevelSelector({ level, onChangeLevel }) {
    return (
      <div className="flex items-center gap-3">
        <p className={`text-base shrink-0 ${TYPE.heading}`} style={{ color: INK.ink }}>
          程度
        </p>
        <div className="flex flex-1 gap-2">
          {Storage.LEVELS.map((l) => {
            const active = level === l.key;
            return (
              <button
                key={l.key}
                onClick={() => onChangeLevel(l.key)}
                className={`flex-1 rounded-xl py-2.5 text-base transition-all ${TYPE.heading}`}
                style={
                  active
                    ? { backgroundColor: INK.vermillion, color: INK.paper, boxShadow: "0 3px 0 #7A211A" }
                    : { backgroundColor: INK.paperCard, color: SUB, border: `1.5px solid #D9CDB0` }
                }
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function streakMessage(view, allDone, best) {
    if (allDone) return view.count > 0 ? `今日任務全部完成！已連續 ${view.count} 日。` : "今日任務全部完成！";
    switch (view.status) {
      case "doneToday":
        return `已連續 ${view.count} 日，今日任務尚未完成。`;
      case "pending":
        return `已連續 ${view.count} 日，完成今日 3 項任務即可延續。`;
      case "saved":
        return `已連續 ${view.count} 日，中間有 ${view.freezesNeeded} 日未練習，今日完成任務會使用 ${view.freezesNeeded} 個保護符保住連續日數。`;
      case "broken":
        return best > 0
          ? `連續日數已中斷（最長紀錄 ${best} 日），完成今日 3 項任務重新開始。`
          : "連續日數已中斷，完成今日 3 項任務重新開始。";
      default:
        return "完成今日 3 項任務，開始累積連續日數。";
    }
  }

  function MissionRow({ mod, done, onOpen }) {
    const a = MODULE_ACCENTS[mod.key] || MISSION_ACCENT;
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 rounded-2xl p-2.5 text-left transition-all active:translate-y-[2px]"
        style={{
          backgroundColor: done ? "#EFEBDD" : a.tint,
          border: `1.5px solid ${done ? "#D9CDB0" : a.tintBorder}`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: done ? "#E1DBC8" : INK.paperCard }}
        >
          {mod.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-base leading-tight ${TYPE.heading}`} style={{ color: INK.ink }}>
            {mod.label}
          </p>
          <p className="text-sm" style={{ color: SUB }}>
            {done ? "已完成" : "完成一節練習即可"}
          </p>
        </div>
        {done ? (
          <Seal label="完" accent={FEEDBACK.correct} className="!w-10 !h-10 !text-base shrink-0" />
        ) : (
          <span className={`text-base shrink-0 pr-1 ${TYPE.heading}`} style={{ color: a.dark }}>
            開始 ›
          </span>
        )}
      </button>
    );
  }

  function MissionsCard({ state, today, onOpenModule }) {
    const daily = Storage.getDaily(state, today);
    const view = Storage.getStreakView(state, today);
    const doneCount = daily.done.length;
    const total = daily.missions.length;
    const allDone = doneCount === total;
    const freezes = state.streakFreezes;
    // Highlight the two situations that need attention: a streak held up by
    // protection charms ("saved") and one that has lapsed ("broken").
    const boxed = !allDone && (view.status === "saved" || view.status === "broken");
    const boxStyle = !boxed
      ? {}
      : view.status === "saved"
      ? { backgroundColor: REVIEW_ACCENT.tint, border: `1.5px solid ${REVIEW_ACCENT.tintBorder}` }
      : { backgroundColor: "#EDE6D5", border: "1.5px solid #D9CDB0" };

    return (
      <PaperCard accent={MISSION_ACCENT} className="!p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className={`text-xl ${TYPE.display}`} style={{ color: INK.ink }}>
              今日任務
            </p>
            <p className={`text-base ${TYPE.heading}`} style={{ color: allDone ? INK.bamboo : INK.vermillion }}>
              {doneCount} / {total} 已完成
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-2xl leading-tight ${TYPE.display}`} style={{ color: view.status === "broken" ? SUB : INK.vermillion }}>
              <span style={view.status === "broken" ? { filter: "grayscale(1)", opacity: 0.6 } : undefined}>🔥</span> {view.count} 日
            </p>
            <p className="text-sm font-bold" style={{ color: SUB }}>
              🛡️ 保護符 ×{freezes}
            </p>
          </div>
        </div>
        <p
          className={`text-sm leading-snug mb-3 ${boxed ? "rounded-xl px-3 py-2" : ""}`}
          style={{ color: boxed ? INK.ink : SUB, ...boxStyle }}
        >
          {view.status === "saved" && !allDone ? "🛡️ " : ""}
          {streakMessage(view, allDone, state.stats.bestStreak)}
        </p>
        <div className="flex flex-col gap-2">
          {daily.missions.map((key) => (
            <MissionRow
              key={key}
              mod={MODULE_BY_KEY[key]}
              done={daily.done.includes(key)}
              onOpen={() => onOpenModule(key)}
            />
          ))}
        </div>
      </PaperCard>
    );
  }

  function ModuleCard({ mod, progress, onOpen }) {
    const a = MODULE_ACCENTS[mod.key] || MODULE_ACCENTS.essay;
    const { correct, attempts } = progress.practiceStats;
    const mistakes = progress.mistakes.length;
    return (
      <button
        onClick={mod.implemented ? onOpen : undefined}
        disabled={!mod.implemented}
        className={`relative flex items-center gap-3 rounded-2xl p-3 pb-4 text-left overflow-hidden transition-all ${
          mod.implemented ? "active:translate-y-[2px]" : "opacity-50"
        }`}
        style={{
          backgroundColor: INK.paperCard,
          border: `1.5px solid ${mod.implemented ? a.tintBorder : "#E9DFC7"}`,
          boxShadow: mod.implemented
            ? "0 1px 2px rgba(36,31,27,0.05), 0 8px 18px -8px rgba(36,31,27,0.16)"
            : "none",
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: mod.implemented ? a.tint : "#EFEAE0" }}
        >
          {mod.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-base leading-tight ${TYPE.heading}`} style={{ color: INK.ink }}>
            {mod.label}
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: SUB }}>
            {!mod.implemented ? (
              "即將推出"
            ) : attempts === 0 ? (
              "未開始"
            ) : (
              <>
                答對 {correct} 題
                {mistakes > 0 && (
                  <span className="font-bold" style={{ color: INK.vermillion }}>
                    {" "}
                    · 錯題 {mistakes}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        {mod.implemented && (
          <span className="absolute left-0 right-0 bottom-0 h-[5px]" style={{ backgroundColor: a.solid }} />
        )}
      </button>
    );
  }

  // Entry to the badge collection: shows how many are earned.
  function BadgesEntry({ state, onOpen }) {
    const earned = Storage.earnedBadgeKeys(state).length;
    return (
      <button
        onClick={onOpen}
        className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 transition-all active:translate-y-[2px]"
        style={{
          flex: "1 1 170px",
          backgroundColor: INK.paperCard,
          border: `1.5px solid ${REVIEW_ACCENT.tintBorder}`,
          boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 6px 14px -8px rgba(36,31,27,0.16)",
        }}
      >
        <span className="text-2xl">🏅</span>
        <span className="text-left">
          <span className={`block text-base leading-tight ${TYPE.heading}`} style={{ color: INK.ink }}>
            徽章
          </span>
          <span className="block text-sm font-bold leading-tight" style={{ color: SUB }}>
            {earned} / {Storage.BADGES.length}
          </span>
        </span>
      </button>
    );
  }

  function Home({ state, today, onChangeLevel, onOpenModule, onOpenBadges, onRestore }) {
    const { BackupSettings } = window.App;
    return (
      <div className="flex flex-col gap-3">
        <MissionsCard state={state} today={today || Storage.todayStr()} onOpenModule={onOpenModule} />

        <div className="flex flex-wrap gap-3">
          <div
            className="rounded-2xl p-3"
            style={{
              flex: "1 1 320px",
              backgroundColor: INK.paperCard,
              border: "1.5px solid #E9DFC7",
              boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 6px 14px -8px rgba(36,31,27,0.16)",
            }}
          >
            <LevelSelector level={state.level} onChangeLevel={onChangeLevel} />
          </div>
          <BadgesEntry state={state} onOpen={onOpenBadges} />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {Storage.MODULES.map((mod) => (
            <ModuleCard
              key={mod.key}
              mod={mod}
              progress={state.moduleProgress[mod.key]}
              onOpen={() => onOpenModule(mod.key)}
            />
          ))}
        </div>

        <BackupSettings state={state} onRestore={onRestore} />
      </div>
    );
  }

  window.App.Home = Home;
})();
