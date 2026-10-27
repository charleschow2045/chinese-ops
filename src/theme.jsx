// Shared UI primitives: the A2 style system.
//   - Colour tokens: `A2` (the A2 palette / gradients / shadows / fonts), `INK` (the few core ink colours still used
//     by Cangjie's 五色 chart and History's 出處 tags), `MODULE_ACCENTS` (per-module colour entries — only passed as an
//     `accent` prop today, see below), `MODULE_ICONS` (home-screen tile colours + emoji per module).
//   - Components: `PaperCard`, `InkButton`, `Seal` (A2 look; the `accent` prop is accepted but ignored), `A2Card`,
//     `A2Button`, `A2BackButton`, `A2ModuleIcon`, `A2Background`; hook `useScrollToTop`; shared screen pieces `A2SegControl`, `A2Section`, `A2Header`, `A2ListRow`, `A2ReviewButton`.
// `A2_MIN_FONT_PX` / `A2_MIN_TAP_PX` are the size floors the components enforce on themselves.
window.App = window.App || {};

(function () {
  // Core ink colours (宣紙白 / 墨黑 / 印泥紅 / 竹青 / 赭金 / 靛青).
  const INK = {
    paper: "#F7F0E3", // 宣紙白 — page background
    ink: "#241F1B", // 墨黑 — primary text
    vermillion: "#B0342A", // 印泥紅 — primary accent
    bamboo: "#48603E", // 竹青 — secondary accent (idiom/history family)
    ochre: "#A9812F", // 赭金 — badges/achievement/score accent
    indigo: "#37485B", // 靛青 — classical-text module family
  };

  // Every module keeps its OWN color (per explicit instruction not to
  // collapse all 10 into one look), but each one is now a tonal variant
  // within one of the four accent families above, instead of an arbitrary
  // Tailwind hue picked ad hoc per module. `ochre` itself is reserved
  // mainly for badges/mastery UI (see `Seal` and IdiomModule's 稱號 card)
  // but Cangjie/Reading/Rhetoric also sit in its family since "skill
  // mastery" fits their content best.
  //   - indigo family (cool, literary contrast): poetry, classicalProse
  //   - bamboo family (tradition/story): idiom, history
  //   - vermillion family (active/expressive): essay, mandarin, punctuation
  //   - ochre family (craft/mastery): cangjie, reading, rhetoric
  // `on` is the text/icon color to place on top of `solid` — paper (light)
  // for the darker hues, ink (dark) for the two lighter ochre tones where
  // light text would fail contrast.
  const MODULE_ACCENTS = {
    poetry: { solid: "#37485B", dark: "#23303D", tint: "#E4E8EC", tintBorder: "#C3CDD6", on: INK.paper, family: "indigo" },
    classicalProse: { solid: "#4B5F73", dark: "#2E3B48", tint: "#E7ECEF", tintBorder: "#C7D1D8", on: INK.paper, family: "indigo" },
    idiom: { solid: "#48603E", dark: "#2F4028", tint: "#E4E9DE", tintBorder: "#C9D4BE", on: INK.paper, family: "bamboo" },
    history: { solid: "#5C6E3F", dark: "#3C4929", tint: "#E9EADD", tintBorder: "#CFD3B9", on: INK.paper, family: "bamboo" },
    essay: { solid: "#B0342A", dark: "#7A211A", tint: "#F6E4E1", tintBorder: "#E8C4BE", on: INK.paper, family: "vermillion" },
    mandarin: { solid: "#C1503A", dark: "#8A3324", tint: "#F7E6DE", tintBorder: "#EAC7B5", on: INK.paper, family: "vermillion" },
    punctuation: { solid: "#8B2B24", dark: "#5E1C17", tint: "#EFDBD8", tintBorder: "#DCB6B0", on: INK.paper, family: "vermillion" },
    cangjie: { solid: "#A9812F", dark: "#7A5D20", tint: "#F1E7CF", tintBorder: "#E2CE9E", on: INK.ink, family: "ochre" },
    reading: { solid: "#8C6B28", dark: "#5F491A", tint: "#EDE3CB", tintBorder: "#D9C592", on: INK.paper, family: "ochre" },
    rhetoric: { solid: "#BE9648", dark: "#8C6D30", tint: "#F4EBD6", tintBorder: "#E6D4A8", on: INK.ink, family: "ochre" },
  };

  // Content card: the near-white A2 card. `accent` (a MODULE_ACCENTS entry) is accepted because every caller passes
  // it, but it is not used.
  function PaperCard({ children, className = "", accent, style = {} }) {
    return (
      <div
        className={`relative p-5 ${className}`}
        style={{
          background: A2.glass,
          border: `1px solid ${A2.glassBd}`,
          borderRadius: 26,
          boxShadow: A2.shadow,
          color: A2.ink,
          fontFamily: A2.font,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Primary-action button: the A2 primary button (A2.acc, white 16 px text, >= 48 px high, sinks 2 px). `accent` is
  // ignored. Callers' `!important` size overrides (e.g. `!text-sm`, `!py-2`) are dropped so they cannot push the
  // button below the A2 size floors.
  function InkButton({ children, onClick, accent, className = "", disabled = false, type = "button" }) {
    const kept = String(className).split(/\s+/).filter((c) => c && !c.startsWith("!")).join(" ");
    return (
      <A2Button type={type} onClick={onClick} disabled={disabled} className={kept}>
        {children}
      </A2Button>
    );
  }

  // Small rotated square "chop" badge in the A2 seal red (serif face) — used as a corner citation stamp (e.g. a
  // 2-character source-book abbreviation on a classical-text card). Absolutely positioned by the caller's own
  // `className` (the parent must be `relative`; `PaperCard` already is). `accent` is ignored.
  function Seal({ label, accent, className = "" }) {
    return (
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center font-serif font-black text-base leading-none select-none ${className}`}
        style={{ background: A2.sealBg, color: A2.sealInk, transform: "rotate(6deg)", boxShadow: "0 3px 8px rgba(150,36,28,.4)" }}
      >
        {label}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // A2 system. The tokens below were copied from the A2 design sample (design-preview/style-a2.html, since deleted); the
  // names are prefixed `A2` / `MODULE_ICONS`.
  // ---------------------------------------------------------------------
  // Scrolls the page to the top whenever `dep` changes (and once on mount). Modules call it with their internal `view`
  // so that every screen change inside a module starts at the top, like Root does for module changes.
  function useScrollToTop(dep) {
    React.useLayoutEffect(() => {
      window.scrollTo(0, 0);
    }, [dep]);
  }

  const A2_MIN_FONT_PX = 13; // no text inside an A2 component may be smaller than this
  const A2_MIN_TAP_PX = 44; // pressable elements: at least 44 px (back / primary buttons: 48 px)

  const A2 = {
    // fonts: rounded face first, then Traditional-Chinese fallbacks, so the layout still works when
    // the Google Fonts request is blocked or slow
    font: '"Zen Maru Gothic","Noto Sans TC","PingFang HK","PingFang TC","Hiragino Maru Gothic ProN",system-ui,sans-serif',
    numFont: '"Baloo 2","Zen Maru Gothic",system-ui,sans-serif',
    // text + accent
    ink: "#1B1840",
    sub: "#46406C",
    acc: "#4A39C8",
    accD: "#3626A8",
    accInk: "#fff",
    accShadow: "#2B1F9A",
    // page background (gradient + three blurred blobs, see A2Background)
    bg: "linear-gradient(180deg,#ECE8FB 0%,#F5F1FD 45%,#F9EFFA 100%)",
    blob1: "#B9A8FF",
    blob2: "#FFB3D9",
    blob3: "#A8D4FF",
    cloud: "#BDB0FF",
    // cards
    glass: "rgba(255,255,255,.97)",
    glassBd: "#E0D9F6",
    glassSolid: "#FFFFFF",
    shadow: "0 14px 28px -16px rgba(52,38,150,.4),0 1px 2px rgba(30,20,90,.1)",
    // top band + level card
    band: "linear-gradient(160deg,#15123F 0%,#241D7B 52%,#3A2CAA 100%)",
    bandShadow: "0 26px 46px -26px rgba(21,18,63,.7)",
    lvBg: "linear-gradient(135deg,#3F31BC 0%,#5A3FD2 55%,#6C44DB 100%)",
    lvBd: "rgba(255,255,255,.28)",
    lvShadow: "0 22px 40px -16px rgba(12,8,60,.75),inset 0 1px 0 rgba(255,255,255,.32)",
    // seals (red chop badges / title stamp)
    sealBg: "linear-gradient(145deg,#CC4232,#A32A21)",
    sealInk: "#FFF6EF",
    stampBg: "linear-gradient(150deg,#D0443A,#A32A21)",
    stampInk: "#FFF3EC",
    // chips, rows, tracks
    fireBg: "#FFE3CF",
    fireInk: "#7A3000",
    shieldBg: "#E0E5FF",
    shieldInk: "#243B98",
    row: "#F4F1FE",
    rowBd: "#E3DCF8",
    rowDone: "#DDF3E8",
    ok: "#157A52",
    segTrack: "#ECE7FB",
    barTrack: "#E3DDF5",
    hot: "#C42A21",
    hotInk: "#A7231B",
    todayBg: "#FFDDE6",
    todayInk: "#9A1239",
    // segmented control (selected) + bottom dock
    segOn: "linear-gradient(135deg,#3F31BC,#5640D4)",
    segOnShadow: "0 10px 18px -10px #2B1F9A",
    dock: "rgba(22,18,66,.95)",
    dockShadow: "0 22px 44px -14px rgba(22,18,66,.7)",
    dockInk: "#D4CDFF",
    dockOn: "linear-gradient(135deg,#7458EA,#5640D4)",
    dockOnShadow: "0 10px 20px -8px #5640D4",
    noteBg: "rgba(255,255,255,.9)",
    noteBd: "#DCD4F5",
  };

  // One entry per module (keys match Storage.MODULES): emoji, soft tint for the icon tile, its
  // border, and the progress-bar colour. Copied from the module list of style-a2.html.
  const MODULE_ICONS = {
    poetry: { emoji: "📜", tint: "#ECE7FF", tintBorder: "#D5CBFF", bar: "#7B61F2" },
    essay: { emoji: "✍️", tint: "#FFE4F1", tintBorder: "#FBC3DD", bar: "#E8559A" },
    cangjie: { emoji: "⌨️", tint: "#FFEBD7", tintBorder: "#FBCFA3", bar: "#EE8226" },
    mandarin: { emoji: "🗣️", tint: "#FFE4DF", tintBorder: "#FBC0B8", bar: "#E5584A" },
    idiom: { emoji: "🀄", tint: "#DDF6F1", tintBorder: "#AEE8DE", bar: "#1FA08E" },
    history: { emoji: "🏯", tint: "#E7F4D9", tintBorder: "#C7E4A6", bar: "#4C9A3F" },
    reading: { emoji: "📖", tint: "#E0EEFF", tintBorder: "#B7D6FB", bar: "#3B83E0" },
    rhetoric: { emoji: "🎭", tint: "#F3E1FC", tintBorder: "#E0B4F4", bar: "#B054DC" },
    punctuation: { emoji: "❝", tint: "#FFE1E7", tintBorder: "#F8B9C6", bar: "#D14B6A" },
    classicalProse: { emoji: "🏺", tint: "#E2E8FF", tintBorder: "#BCC8F7", bar: "#4A62C9" },
  };
  const MODULE_ICON_FALLBACK = { emoji: "📘", tint: A2.segTrack, tintBorder: A2.glassBd, bar: A2.acc };

  // Near-solid white card (style-a2 `.card`). `style` may override anything except what the
  // card needs to stay readable: text colour and font default to the A2 ink / font.
  function A2Card({ children, className = "", style = {} }) {
    return (
      <div
        className={className}
        style={{
          background: A2.glass,
          border: `1px solid ${A2.glassBd}`,
          borderRadius: 26,
          boxShadow: A2.shadow,
          padding: 18,
          color: A2.ink,
          fontFamily: A2.font,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Primary button: deep indigo, white 16 px bold text, >= 48 px tall, sinks 2 px when pressed.
  // The size floors are applied AFTER `style`, so a caller cannot make it smaller than the floors.
  function A2Button({ children, onClick, className = "", style = {}, disabled = false, type = "button" }) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          border: 0,
          borderRadius: 999,
          background: A2.acc,
          color: A2.accInk,
          fontFamily: A2.font,
          fontWeight: 900,
          lineHeight: 1.25,
          boxShadow: `0 10px 18px -10px ${A2.accShadow}`,
          WebkitTapHighlightColor: "transparent",
          cursor: "pointer",
          ...style,
          minHeight: Math.max(48, style.minHeight || 0),
          minWidth: Math.max(A2_MIN_TAP_PX, style.minWidth || 0),
          fontSize: Math.max(16, style.fontSize || 16),
        }}
      >
        {children}
      </button>
    );
  }

  // Back button (will replace each module's own small "← 返回" / "← 返回主頁"): >= 48 px tall and
  // >= 96 px wide, 16 px bold text in the dark accent colour on a light tile.
  function A2BackButton({ label = "← 返回", onClick, className = "", style = {} }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`active:translate-y-[2px] ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
          border: 0,
          borderRadius: 999,
          background: A2.segTrack,
          color: A2.accD,
          fontFamily: A2.font,
          fontWeight: 900,
          lineHeight: 1.25,
          WebkitTapHighlightColor: "transparent",
          cursor: "pointer",
          ...style,
          minHeight: Math.max(48, style.minHeight || 0),
          minWidth: Math.max(96, style.minWidth || 0),
          fontSize: Math.max(16, style.fontSize || 16),
        }}
      >
        {label}
      </button>
    );
  }

  // Rounded tile with a module's emoji on its soft tint (style-a2 `.ico`; 54 px by default).
  // Radius and emoji size scale with `size`; the emoji never goes below A2_MIN_FONT_PX.
  function A2ModuleIcon({ moduleKey, size = 54, className = "", style = {} }) {
    const m = MODULE_ICONS[moduleKey] || MODULE_ICON_FALLBACK;
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{
          width: size,
          height: size,
          flex: "none",
          display: "grid",
          placeItems: "center",
          borderRadius: Math.round((size * 19) / 54),
          background: m.tint,
          border: `1px solid ${m.tintBorder}`,
          fontSize: Math.max(A2_MIN_FONT_PX, Math.round((size * 29) / 54)),
          lineHeight: 1,
          ...style,
        }}
      >
        {m.emoji}
      </div>
    );
  }

  // Fixed full-screen backdrop: A2 gradient plus three blurred colour blobs. Root mounts it behind every screen.
  // (The design sample hid the blobs; `blobs={false}` reproduces that.)
  function A2Background({ blobs = true }) {
    const blob = { position: "absolute", borderRadius: "50%", filter: "blur(60px)", opacity: 0.55 };
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden", zIndex: 0, background: A2.bg }}
      >
        {blobs && (
          <>
            <div style={{ ...blob, width: 360, height: 360, left: -100, top: -60, background: A2.blob1 }} />
            <div style={{ ...blob, width: 420, height: 420, right: -140, top: 200, background: A2.blob2 }} />
            <div style={{ ...blob, width: 380, height: 380, left: "18%", bottom: -130, background: A2.blob3 }} />
          </>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Screen pieces shared by the module files (list screens, detail cards, filters).
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };

  function A2SegControl({ options, value, onChange, label }) {
    return (
      <div role="group" aria-label={label} style={{ display: "flex", gap: 6, background: A2.segTrack, padding: 5, borderRadius: 999 }}>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              aria-pressed={active}
              onClick={() => onChange(o.key)}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(active ? { background: A2.segOn, color: "#fff", boxShadow: A2.segOnShadow } : { background: "transparent", color: A2.sub }),
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  // 階段 10: the level options every module's 程度 filter shows (全部 + every level of Storage.LEVELS) and the one-line note shown when the
  // chosen level has no content yet (see QuizUtils.itemsForLevel).
  const LEVEL_FILTERS = [{ key: "all", label: "全部" }].concat(window.App.Storage.LEVELS.map((l) => ({ key: l.key, label: l.label })));

  function A2LevelNotice({ level }) {
    const lv = window.App.Storage.LEVELS.find((l) => l.key === level);
    return (
      <p role="status" style={{ fontFamily: A2.font, fontSize: 14, lineHeight: 1.7, color: A2.sub, margin: "10px 0 0", borderRadius: 12, padding: "8px 12px", background: A2.row, border: `1px solid ${A2.rowBd}` }}>
        {(lv ? lv.label : "此程度")}內容陸續加入，暫時顯示全部程度的內容
      </p>
    );
  }

  function A2Section({ title, children }) {
    return (
      <PaperCard>
        <h3 style={{ ...A2_LABEL, marginBottom: 8 }}>{title}</h3>
        {children}
      </PaperCard>
    );
  }

  function A2Header({ moduleKey, title, onBack }) {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <A2BackButton label="← 返回主頁" onClick={onBack} />
        <div className="flex items-center gap-2">
          <A2ModuleIcon moduleKey={moduleKey} size={44} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0, fontFamily: A2.font }}>{title}</h1>
        </div>
      </div>
    );
  }

  function A2ListRow({ moduleKey, tile, title, serifTitle, sub, onOpen }) {
    const m = MODULE_ICONS[moduleKey];
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 text-left active:translate-y-[2px] transition-all"
        style={{
          minHeight: 72,
          padding: "10px 14px 10px 12px",
          borderRadius: 22,
          background: A2.glass,
          border: `1px solid ${A2.glassBd}`,
          boxShadow: A2.shadow,
          color: A2.ink,
          fontFamily: A2.font,
          cursor: "pointer",
        }}
      >
        <div
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 17, background: m.tint, border: `1px solid ${m.tintBorder}`, fontSize: 24, lineHeight: 1 }}
        >
          {tile}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate${serifTitle ? " font-serif" : ""}`} style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
            {title}
          </p>
          {sub && (
            <p className="truncate" style={{ fontSize: 14, color: A2.sub, margin: 0 }}>
              {sub}
            </p>
          )}
        </div>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 900, color: A2.accD }}>
          ›
        </span>
      </button>
    );
  }

  // 練習錯題 is a secondary action (filter-style chip), not a second primary button.
  function A2ReviewButton({ count, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-full mt-2 transition-all"
        style={{ minHeight: 48, borderRadius: 999, border: 0, background: A2.fireBg, color: A2.fireInk, fontFamily: A2.font, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
      >
        練習錯題 ({count}) 📝
      </button>
    );
  }

  window.App.UI = {
    INK,
    MODULE_ACCENTS,
    PaperCard,
    InkButton,
    Seal,
    A2,
    A2_MIN_FONT_PX,
    A2_MIN_TAP_PX,
    MODULE_ICONS,
    A2Card,
    A2Button,
    A2BackButton,
    A2ModuleIcon,
    A2Background,
    useScrollToTop,
    A2SegControl,
    LEVEL_FILTERS,
    A2LevelNotice,
    A2Section,
    A2Header,
    A2ListRow,
    A2ReviewButton,
  };
})();
