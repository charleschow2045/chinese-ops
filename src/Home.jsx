// Home screen — 階段 6b: "A2" style (deep-indigo band + 科舉稱號 card + near-white cards on a lilac
// backdrop), following design-preview/style-a2.html. Colours come from the A2 tokens in theme.jsx;
// the few decorative values the sample has but A2 does not define are the LV_* / BAND_* constants below.
// All behaviour (daily missions, streak, 保護符, level chips, badges entry, backup panel) is unchanged.
// Layout is tuned for an iPad held upright (~820px wide) and a phone (~390px): no text under 13px,
// every pressable at least 44px high. The 稱號 and each module's 節數 are computed from
// `stats.sessions` only (Storage.getTitleView / getModuleMilestoneView) — nothing new is stored.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { A2, MODULE_ICONS, A2ModuleIcon } = window.App.UI;

  const MODULE_BY_KEY = Object.fromEntries(Storage.MODULES.map((m) => [m.key, m]));
  const SERIF = '"Noto Serif TC","Songti TC",serif';

  // Decorative values taken from style-a2.html that the A2 token set does not contain.
  const BAND_GLOW_1 = "radial-gradient(circle,rgba(150,126,255,.5),transparent 68%)"; // .band::before
  const BAND_GLOW_2 = "radial-gradient(circle,rgba(110,84,230,.45),transparent 68%)"; // .band::after
  const AVATAR_BG = "rgba(255,255,255,.16)";
  const AVATAR_BD = "rgba(255,255,255,.42)";
  const LV_BAR_FILL = "linear-gradient(90deg,#fff,#DCD3FF)";
  const LV_DOT_BD = "rgba(255,255,255,.7)";
  const LV_NOW_DOT = "#E5483B";
  const LV_NOW_RING = "rgba(255,255,255,.24)";
  const STAMP_SHADOW = "0 12px 18px -8px rgba(60,10,8,.7), inset 0 0 0 3px rgba(255,235,225,.35)";
  const SEAL_SHADOW = "0 3px 8px rgba(150,36,28,.4)";

  const cardBox = {
    background: A2.glass,
    border: `1px solid ${A2.glassBd}`,
    boxShadow: A2.shadow,
    color: A2.ink,
    fontFamily: A2.font,
  };

  // Small static stylesheet: media queries (decorations hidden on narrow screens, one-column layouts),
  // press feedback and focus rings cannot be written as inline styles.
  const HOME_CSS = `
.a2h-pair{display:grid;grid-template-columns:1.25fr 1fr;gap:14px}
.a2h-modules{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}
.a2h-ladder li{flex:1 1 0;min-width:0}
.a2h-backup > div > button{min-height:48px;min-width:96px}
.a2h-root button:focus-visible{outline:3px solid ${A2.acc};outline-offset:2px}
@media (max-width:620px){.a2h-pair{grid-template-columns:1fr}}
@media (max-width:479px){.a2h-deco{display:none !important}}
@media (prefers-reduced-motion:no-preference){.a2h-press{transition:transform .12s ease}}
.a2h-press:active{transform:scale(.98)}
`;

  function greetingFor(date) {
    const h = date.getHours();
    return h >= 5 && h < 12 ? "早安" : h >= 12 && h < 18 ? "午安" : "晚安";
  }

  function dateLabel(dateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
    return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : "";
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

  // ---- top band: greeting + 科舉稱號 card ----
  function Cloud() {
    return (
      <svg
        className="a2h-deco"
        viewBox="0 0 120 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ position: "absolute", right: 72, top: -6, width: 120, height: 60, opacity: 0.7, color: A2.cloud }}
      >
        <path d="M14 46c-8 0-11-9-5-13 1-9 11-12 17-7 3-9 17-11 22-2 9-4 19 3 16 12 8-1 14 6 9 12H20" />
        <path d="M62 24c3-6 11-7 15-2 7-3 14 3 12 10" />
        <path d="M86 46h20c7 0 9-8 3-11" />
      </svg>
    );
  }

  function TitleLadder({ view }) {
    return (
      <ol
        className="a2h-ladder"
        aria-label="科舉之路"
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          borderTop: `1px solid ${A2.lvBd}`,
          listStyle: "none",
          margin: "6px 0 0",
          padding: "14px 0 0",
        }}
      >
        {Storage.TITLE_TIERS.map((tier, i) => {
          const state = i < view.index ? "past" : i === view.index ? "now" : "future";
          const dot =
            state === "now"
              ? { width: 18, height: 18, margin: "-3px 0", background: LV_NOW_DOT, border: "2px solid #fff", boxShadow: `0 0 0 5px ${LV_NOW_RING}` }
              : state === "past"
              ? { width: 12, height: 12, background: "#fff", border: "2px solid #fff" }
              : { width: 12, height: 12, background: "transparent", border: `2px solid ${LV_DOT_BD}` };
          return (
            <li
              key={tier.key}
              aria-current={state === "now" ? "step" : undefined}
              aria-label={`${tier.name}（${state === "past" ? "已達成" : state === "now" ? "現時稱號" : "未達成"}）`}
              style={{
                display: "grid",
                justifyItems: "center",
                alignContent: "start",
                gap: 7,
                fontSize: 14,
                fontWeight: state === "now" ? 900 : 700,
                color: state === "now" ? "#fff" : "rgba(255,255,255,.92)",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              <span aria-hidden="true" style={{ ...dot, borderRadius: "50%", boxSizing: "content-box" }} />
              {tier.name}
            </li>
          );
        })}
      </ol>
    );
  }

  function TitleCard({ state }) {
    const view = Storage.getTitleView(state);
    const pct = Math.round(view.ratio * 100);
    return (
      <section
        aria-label="科舉稱號"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "12px 20px",
          alignItems: "center",
          padding: "22px 20px 16px",
          borderRadius: 30,
          background: A2.lvBg,
          border: `1px solid ${A2.lvBd}`,
          boxShadow: A2.lvShadow,
          color: "#fff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "clamp(62px, 12vw, 72px)",
            height: "clamp(82px, 15vw, 94px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: A2.stampBg,
            color: A2.stampInk,
            borderRadius: 9,
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: "clamp(27px, 4.5vw, 32px)",
            lineHeight: 1.05,
            transform: "rotate(-3deg)",
            boxShadow: STAMP_SHADOW,
          }}
        >
          {view.name.split("").map((ch, i) => (
            <b key={i}>{ch}</b>
          ))}
        </div>
        <div style={{ display: "grid", gap: 7, minWidth: 0 }}>
          <p style={{ fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>科舉稱號：</span>
            <span style={{ fontSize: "clamp(23px, 4vw, 26px)" }}>{view.name}</span>
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
            {view.isMax ? (
              <>累計練習 <span style={{ fontFamily: A2.numFont, fontWeight: 800, fontSize: 16 }}>{view.total}</span> 節</>
            ) : (
              <>累計練習 <span style={{ fontFamily: A2.numFont, fontWeight: 800, fontSize: 16 }}>{view.total}</span> / <span style={{ fontFamily: A2.numFont, fontWeight: 800, fontSize: 16 }}>{view.nextAt}</span> 節</>
            )}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="科舉稱號進度"
            style={{ height: 10, borderRadius: 99, background: A2.lvBd, overflow: "hidden" }}
          >
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: LV_BAR_FILL }} />
          </div>
          <p style={{ fontSize: 14, margin: 0 }}>
            {view.isMax ? "已登狀元" : `再完成 ${view.remaining} 節練習，晉升「${view.nextName}」`}
          </p>
        </div>
        <TitleLadder view={view} />
      </section>
    );
  }

  function TopBand({ state, today }) {
    const topPad = Storage.TEST_MODE ? "18px" : "calc(18px + var(--sat))";
    const label = dateLabel(today);
    return (
      <div
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          overflow: "hidden",
          background: A2.band,
          borderRadius: "0 0 40px 40px",
          boxShadow: A2.bandShadow,
          fontFamily: A2.font,
        }}
      >
        <div
          aria-hidden="true"
          style={{ position: "absolute", right: -70, top: -90, width: 300, height: 300, borderRadius: "50%", background: BAND_GLOW_1 }}
        />
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: -90, bottom: -120, width: 300, height: 300, borderRadius: "50%", background: BAND_GLOW_2 }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 672,
            margin: "0 auto",
            padding: `${topPad} max(1rem, var(--sar)) 30px max(1rem, var(--sal))`,
            boxSizing: "border-box",
          }}
        >
          <header style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "clamp(24px, 4vw, 27px)", fontWeight: 900, lineHeight: 1.2, letterSpacing: ".02em", color: "#fff", margin: 0 }}>
                {greetingFor(new Date())}，同學
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.9)", margin: "2px 0 0" }}>
                {label ? `${label} · ` : ""}今天也一起學習中文吧
              </p>
            </div>
            <Cloud />
            <div
              className="a2h-deco"
              aria-hidden="true"
              style={{
                width: 58,
                height: 58,
                flex: "none",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 31,
                background: AVATAR_BG,
                border: `1px solid ${AVATAR_BD}`,
              }}
            >
              🐲
            </div>
          </header>
          <TitleCard state={state} />
        </div>
      </div>
    );
  }

  // ---- 今日任務 ----
  function MissionRow({ mod, done, onOpen }) {
    return (
      <li style={{ listStyle: "none" }}>
        <button
          onClick={onOpen}
          aria-label={`${mod.label}，${done ? "已完成" : "尚未完成，按此開始"}`}
          className="a2h-press"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 64,
            padding: "8px 14px 8px 10px",
            borderRadius: 22,
            textAlign: "left",
            background: done ? A2.rowDone : A2.row,
            border: `1px solid ${A2.rowBd}`,
            color: A2.ink,
            fontFamily: A2.font,
            cursor: "pointer",
          }}
        >
          <A2ModuleIcon moduleKey={mod.key} size={46} />
          <span style={{ flex: 1, display: "grid", minWidth: 0 }}>
            <b style={{ fontSize: 16, fontWeight: 900 }}>{mod.label}</b>
            <span style={{ fontSize: 14, color: A2.sub }}>{done ? "已完成" : "完成一節練習即可"}</span>
          </span>
          {done ? (
            <span
              aria-hidden="true"
              style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: A2.ok, color: "#fff", fontWeight: 900, fontSize: 17 }}
            >
              ✓
            </span>
          ) : (
            <span style={{ fontWeight: 900, color: A2.accD, fontSize: 15, whiteSpace: "nowrap" }}>開始 ›</span>
          )}
        </button>
      </li>
    );
  }

  function MissionsCard({ state, today, onOpenModule }) {
    const daily = Storage.getDaily(state, today);
    const view = Storage.getStreakView(state, today);
    const doneCount = daily.done.length;
    const total = daily.missions.length;
    const allDone = doneCount === total;
    const broken = view.status === "broken";
    // Highlight the two situations that need attention: a streak held up by protection charms
    // ("saved") and one that has lapsed ("broken").
    const boxed = !allDone && (view.status === "saved" || broken);
    const boxStyle = !boxed
      ? {}
      : view.status === "saved"
      ? { background: A2.shieldBg, color: A2.shieldInk }
      : { background: A2.row, border: `1px solid ${A2.rowBd}`, color: A2.sub };
    const chip = { display: "inline-flex", alignItems: "center", gap: 4, minHeight: 36, borderRadius: 999, padding: "4px 13px", fontSize: 14, fontWeight: 800 };

    return (
      <section aria-label="今日任務" style={{ ...cardBox, borderRadius: 26, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px 14px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 23, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>今日任務</h2>
            <p style={{ fontSize: 15, fontWeight: 800, color: allDone ? A2.ok : A2.accD, margin: 0 }}>
              {doneCount} / {total} 已完成
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chip, background: broken ? A2.segTrack : A2.fireBg, color: broken ? A2.sub : A2.fireInk }}>
              <span style={broken ? { filter: "grayscale(1)", opacity: 0.6 } : undefined}>🔥</span> 連續 {view.count} 日
            </span>
            <span style={{ ...chip, background: A2.shieldBg, color: A2.shieldInk }}>🛡️ 保護符 ×{state.streakFreezes}</span>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: A2.sub,
            margin: "10px 0 12px",
            ...(boxed ? { borderRadius: 14, padding: "8px 12px" } : {}),
            ...boxStyle,
          }}
        >
          {view.status === "saved" && !allDone ? "🛡️ " : ""}
          {streakMessage(view, allDone, state.stats.bestStreak)}
        </p>
        <ul style={{ display: "grid", gap: 10, margin: 0, padding: 0 }}>
          {daily.missions.map((key) => (
            <MissionRow key={key} mod={MODULE_BY_KEY[key]} done={daily.done.includes(key)} onOpen={() => onOpenModule(key)} />
          ))}
        </ul>
      </section>
    );
  }

  // ---- 程度 ----
  function LevelCard({ level, onChangeLevel }) {
    return (
      <section aria-label="程度" style={{ ...cardBox, borderRadius: 26, padding: "14px 16px", display: "grid", gap: 10, alignContent: "start" }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>程度</h3>
        <div style={{ display: "flex", gap: 6, background: A2.segTrack, padding: 5, borderRadius: 999 }}>
          {Storage.LEVELS.map((l) => {
            const active = level === l.key;
            return (
              <button
                key={l.key}
                aria-pressed={active}
                onClick={() => onChangeLevel(l.key)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 999,
                  fontFamily: A2.font,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: "pointer",
                  border: 0,
                  ...(active ? { background: A2.segOn, color: "#fff", boxShadow: A2.segOnShadow } : { background: "transparent", color: A2.sub }),
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ---- 徽章 entry ----
  function BadgesEntry({ state, onOpen }) {
    const earnedBadges = Storage.BADGES.filter((b) => Storage.isBadgeEarned(state, b));
    const total = Storage.BADGES.length;
    // The locked badge that is closest to being earned (same rule as the badge screen).
    let next = null;
    Storage.BADGES.forEach((b) => {
      const { cur, target } = Storage.badgeProgress(state, b);
      if (cur >= target) return;
      if (!next || cur / target > next.ratio) next = { badge: b, cur, target, ratio: cur / target };
    });
    const preview = earnedBadges.slice(0, 3);
    const seal = { display: "inline-grid", placeItems: "center", width: 30, height: 30, borderRadius: 7, background: A2.sealBg, color: A2.sealInk, fontFamily: SERIF, fontWeight: 900, fontSize: 16, lineHeight: 1, transform: "rotate(6deg)", boxShadow: SEAL_SHADOW };
    return (
      <button
        onClick={onOpen}
        aria-label={`徽章 ${earnedBadges.length} / ${total}，按此查看`}
        className="a2h-press"
        style={{ ...cardBox, borderRadius: 26, padding: "14px 16px", display: "grid", gap: 8, alignContent: "start", textAlign: "left", cursor: "pointer", minHeight: 44 }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>🏅 徽章</span>
          <span style={{ fontFamily: A2.numFont, fontWeight: 800, fontSize: 19, color: A2.accD }}>
            {earnedBadges.length} / {total}
          </span>
        </span>
        {preview.length > 0 && (
          <span aria-hidden="true" style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 36 }}>
            {preview.map((b) => (
              <span key={b.key} style={seal}>
                {b.seal}
              </span>
            ))}
            {earnedBadges.length < total && (
              <span style={{ width: 30, height: 30, borderRadius: 7, border: `2px dashed ${A2.sub}`, display: "grid", placeItems: "center", color: A2.sub, fontWeight: 900, fontSize: 15 }}>
                ？
              </span>
            )}
          </span>
        )}
        <span style={{ fontSize: 14, color: A2.sub }}>
          {next ? `下一個：${next.badge.name}（${next.cur} / ${next.target}）` : "全部徽章都已獲得！"}
        </span>
      </button>
    );
  }

  // ---- 學習模組 ----
  function ModuleCard({ mod, state, isMissionToday, onOpen }) {
    const icon = MODULE_ICONS[mod.key] || MODULE_ICONS.poetry;
    const progress = state.moduleProgress[mod.key];
    const { correct, attempts } = progress.practiceStats;
    const mistakes = progress.mistakes.length;
    const ms = Storage.getModuleMilestoneView(state, mod.key);
    const pct = Math.round(ms.ratio * 100);
    return (
      <button
        onClick={mod.implemented ? onOpen : undefined}
        disabled={!mod.implemented}
        className="a2h-press"
        style={{
          ...cardBox,
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: 88,
          padding: "12px 14px",
          borderRadius: 24,
          textAlign: "left",
          cursor: mod.implemented ? "pointer" : "default",
          opacity: mod.implemented ? 1 : 0.5,
        }}
      >
        <A2ModuleIcon moduleKey={mod.key} size={54} />
        <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <b style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.25 }}>{mod.label}</b>
            {isMissionToday && (
              <span style={{ fontSize: 13, fontWeight: 800, borderRadius: 999, padding: "0 8px", lineHeight: 1.55, background: A2.todayBg, color: A2.todayInk }}>
                今日任務
              </span>
            )}
          </span>
          <span style={{ fontSize: 14, color: A2.sub, lineHeight: 1.3 }}>
            {!mod.implemented ? (
              "即將推出"
            ) : attempts === 0 ? (
              "未開始"
            ) : (
              <>
                答對 {correct} 題
                {mistakes > 0 && (
                  <>
                    {" · "}
                    <em style={{ fontStyle: "normal", fontWeight: 800, color: A2.hotInk }}>錯題 {mistakes}</em>
                  </>
                )}
              </>
            )}
          </span>
          {mod.implemented && (
            <span
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={`${mod.label}里程進度`}
              style={{ display: "block", height: 8, borderRadius: 99, background: A2.barTrack, overflow: "hidden", marginTop: 2 }}
            >
              <span style={{ display: "block", width: `${pct}%`, height: "100%", borderRadius: 99, background: icon.bar }} />
            </span>
          )}
        </span>
        {mod.implemented && (
          <span style={{ alignSelf: "flex-start", fontFamily: A2.numFont, fontWeight: 800, lineHeight: 1.2, color: A2.accD, whiteSpace: "nowrap" }}>
            {ms.isMastered ? (
              <span style={{ fontFamily: A2.font, fontSize: 15, fontWeight: 900 }}>已精通</span>
            ) : (
              <>
                <span style={{ fontFamily: A2.font, fontSize: 13 }}>第 </span>
                <span style={{ fontSize: 20 }}>{ms.sessions}</span>
                <span style={{ fontFamily: A2.font, fontSize: 13 }}> 節</span>
              </>
            )}
          </span>
        )}
      </button>
    );
  }

  function Home({ state, today, onChangeLevel, onOpenModule, onOpenBadges, onRestore }) {
    const { BackupSettings } = window.App;
    const day = today || Storage.todayStr();
    const missionKeys = Storage.getDaily(state, day).missions;
    return (
      <div className="a2h-root" style={{ fontFamily: A2.font, color: A2.ink }}>
        <style>{HOME_CSS}</style>
        <TopBand state={state} today={day} />

        <div style={{ display: "grid", gap: 16, paddingTop: 24 }}>
          <MissionsCard state={state} today={day} onOpenModule={onOpenModule} />

          <div className="a2h-pair">
            <LevelCard level={state.level} onChangeLevel={onChangeLevel} />
            <BadgesEntry state={state} onOpen={onOpenBadges} />
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 900, margin: "4px 4px -4px" }}>學習模組</h2>
          <div className="a2h-modules" role="list" aria-label="學習模組">
            {Storage.MODULES.map((mod) => (
              <div role="listitem" key={mod.key} style={{ display: "grid" }}>
                <ModuleCard mod={mod} state={state} isMissionToday={missionKeys.includes(mod.key)} onOpen={() => onOpenModule(mod.key)} />
              </div>
            ))}
          </div>

          {/* The backup panel itself is unchanged (still the 文房 look until 6d); only its buttons are enlarged here. */}
          <div className="a2h-backup">
            <BackupSettings state={state} onRestore={onRestore} />
          </div>
        </div>
      </div>
    );
  }

  window.App.Home = Home;
})();
