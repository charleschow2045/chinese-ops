// Shared UI primitives.
//
// This file carries TWO systems (see CLAUDE.md "UI redesign" notes):
//   - LEGACY: `COLORS`, `Button`, `Card` — the original bright Tailwind-
//     palette look (flat saturated bg + thick border + hard offset shadow).
//     Kept only for reference/rollback; as of the full rollout, no module
//     or shared component (AudioButtons, QuizQuestion) uses it any more.
//   - "文房" (scholar's-study system): `INK`, `MODULE_ACCENTS`, `FEEDBACK`,
//     `TYPE`, `PaperCard`, `InkButton`, `Seal` — a warmer, more layered look
//     built around 5 ink/seal-inspired core colors instead of arbitrary
//     Tailwind hues. Used by all 10 modules and both shared quiz/audio
//     components after the full-rollout pass.
window.App = window.App || {};

(function () {
  // ---------------------------------------------------------------------
  // LEGACY system — unchanged, still used by Poetry/Essay/Cangjie/Mandarin/
  // History/Reading/Rhetoric/Punctuation and by AudioButtons everywhere.
  // ---------------------------------------------------------------------
  const COLORS = {
    sky: { bg: "bg-sky-400", border: "border-sky-600", shadow: "shadow-[0_6px_0_#075985]", text: "text-sky-950" },
    rose: { bg: "bg-rose-400", border: "border-rose-600", shadow: "shadow-[0_6px_0_#881337]", text: "text-rose-950" },
    violet: { bg: "bg-violet-400", border: "border-violet-600", shadow: "shadow-[0_6px_0_#4c1d95]", text: "text-violet-950" },
    emerald: { bg: "bg-emerald-400", border: "border-emerald-600", shadow: "shadow-[0_6px_0_#065f46]", text: "text-emerald-950" },
    orange: { bg: "bg-orange-400", border: "border-orange-600", shadow: "shadow-[0_6px_0_#7c2d12]", text: "text-orange-950" },
    amber: { bg: "bg-amber-400", border: "border-amber-600", shadow: "shadow-[0_6px_0_#92400e]", text: "text-amber-950" },
    teal: { bg: "bg-teal-400", border: "border-teal-600", shadow: "shadow-[0_6px_0_#115e59]", text: "text-teal-950" },
    indigo: { bg: "bg-indigo-400", border: "border-indigo-600", shadow: "shadow-[0_6px_0_#312e81]", text: "text-indigo-950" },
    fuchsia: { bg: "bg-fuchsia-400", border: "border-fuchsia-600", shadow: "shadow-[0_6px_0_#701a75]", text: "text-fuchsia-950" },
    lime: { bg: "bg-lime-400", border: "border-lime-600", shadow: "shadow-[0_6px_0_#3f6212]", text: "text-lime-950" },
  };

  function Button({ children, onClick, color = "rose", className = "", disabled = false, type = "button" }) {
    const c = COLORS[color] || COLORS.rose;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${c.bg} ${c.text} border-4 ${c.border} ${c.shadow} rounded-2xl font-extrabold px-5 py-3 text-lg
          active:translate-y-[6px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      >
        {children}
      </button>
    );
  }

  function Card({ children, className = "" }) {
    return (
      <div className={`bg-white border-4 border-red-100 rounded-3xl shadow-[0_6px_0_rgba(225,29,72,0.10)] p-4 ${className}`}>
        {children}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // NEW "文房" system
  // ---------------------------------------------------------------------

  // Five core colors from the user's spec, plus one derived muted-ink tone
  // for auxiliary/caption text (a warm gray-brown, not a flat gray, so it
  // still feels part of the ink family rather than a generic UI gray).
  const INK = {
    paper: "#F7F0E3", // 宣紙白 — page background
    paperCard: "#FBF7EC", // slightly lighter paper tone for cards sitting on the page
    ink: "#241F1B", // 墨黑 — primary text
    mutedInk: "#8A7F6D", // derived — captions/meta text, still warm not gray
    subInk: "#5C5344", // darker warm brown for small text that must stay readable (7:1 on paperCard) — used by the home screen
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

  // Canonical correct/incorrect feedback tones for quiz UI (QuestionBlock/
  // FixedQuizFlow), reusing the same 5-core-color vocabulary rather than
  // inventing new Tailwind-style greens/ambers: bamboo (green) reads as
  // "growth/correct", vermillion (red) reads as "correction ink/wrong" —
  // a fitting callback to marking mistakes in red pen. Shape matches
  // MODULE_ACCENTS entries so both can be passed to the same components.
  const FEEDBACK = {
    correct: { solid: INK.bamboo, dark: "#2F4028", tint: "#E4E9DE", tintBorder: "#9DB48C", on: INK.paper },
    incorrect: { solid: INK.vermillion, dark: "#7A211A", tint: "#F6E4E1", tintBorder: "#D89C93", on: INK.paper },
  };

  // Shared "review mistakes" (練習錯題) accent — the same cross-cutting
  // ochre/achievement tone as a mastery badge, reused by every module's
  // 練習錯題 button so "review mode" reads as one consistent affordance
  // app-wide, distinct from each module's own accent color rather than a
  // different ad hoc color per module.
  const REVIEW_ACCENT = { solid: INK.ochre, dark: "#7A5D20", tint: "#F1E7CF", tintBorder: "#E2CE9E", on: INK.ink };

  // A minimal, deliberately-named type scale (4 levels, per spec): pair the
  // font family + weight here, let each call site pick its own text-size
  // utility for context (an app title and a card's item title are both
  // `heading`-ish but at different sizes).
  //   display  — 大標題: app title, big module/page headers
  //   heading  — 小標題: card section titles, item titles, idiom headwords
  //   body     — 內文: main content text
  //   caption  — 輔助文字: meta labels, level tags, source citations
  const TYPE = {
    display: "font-serif font-black tracking-tight",
    heading: "font-serif font-bold",
    body: "font-sans",
    caption: "font-sans font-bold uppercase tracking-wide",
  };

  // Content card: warm paper tint (not stark white), thin tinted border,
  // soft multi-layer shadow (a tight contact shadow + a diffuse ambient
  // one + a faint inner top highlight to suggest slight paper convexity)
  // instead of the old single flat hard-offset shadow. `accent` (an entry
  // from MODULE_ACCENTS) tints the border toward that module's color when
  // given; otherwise a neutral warm border is used.
  function PaperCard({ children, className = "", accent, style = {} }) {
    const a2 = useA2();
    // 階段 6c: inside an A2 screen the card becomes the near-white A2 card (`accent` is accepted but not used).
    if (a2) {
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
    const borderColor = accent ? accent.tintBorder : "#E9DFC7";
    return (
      <div
        className={`relative rounded-3xl p-5 ${className}`}
        style={{
          backgroundColor: INK.paperCard,
          border: `1.5px solid ${borderColor}`,
          boxShadow:
            "0 1px 2px rgba(36,31,27,0.05), 0 10px 24px -10px rgba(36,31,27,0.16), inset 0 1px 0 rgba(255,255,255,0.6)",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Primary-action button: keeps the chunky "press-down" affordance the
  // app already uses for main CTAs, but the resting shadow is now layered
  // (inner top highlight + a solid offset "thickness" layer in the
  // module's own dark shade + a soft diffuse drop shadow) rather than one
  // flat color block, so it reads as a raised lacquered/stamped object
  // instead of a flat hard-edged rectangle. `accent` is a MODULE_ACCENTS
  // entry; defaults to the essay (vermillion) tone if omitted.
  function InkButton({ children, onClick, accent, className = "", disabled = false, type = "button" }) {
    const a2 = useA2();
    // 階段 6c: inside an A2 screen every InkButton is the A2 primary button (A2.acc, white 16 px text,
    // >= 48 px high, sinks 2 px). `accent` is ignored. Callers' `!important` size overrides (e.g. `!text-sm`,
    // `!py-2`) are dropped so they cannot push the button below the A2 size floors.
    if (a2) {
      const kept = String(className).split(/\s+/).filter((c) => c && !c.startsWith("!")).join(" ");
      return (
        <A2Button type={type} onClick={onClick} disabled={disabled} className={kept}>
          {children}
        </A2Button>
      );
    }
    const a = accent || MODULE_ACCENTS.essay;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`rounded-2xl font-extrabold px-5 py-3 text-lg font-sans transition-all duration-100
          active:translate-y-[3px] disabled:opacity-50 disabled:pointer-events-none ${className}`}
        style={{
          backgroundColor: a.solid,
          color: a.on,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 0 ${a.dark}, 0 12px 20px -8px rgba(36,31,27,0.38)`,
        }}
      >
        {children}
      </button>
    );
  }

  // Small rotated square "chop" badge — used as a corner citation stamp
  // (e.g. a 2-character source-book abbreviation on a classical-text card)
  // per the optional visual-identity request. Absolutely positioned by the
  // caller's own `className` (the parent must be `relative`; `PaperCard`
  // already is).
  function Seal({ label, accent, className = "" }) {
    const a2 = useA2();
    // 階段 6c: inside an A2 screen the chop uses the A2 seal red (`accent` ignored); the serif face stays.
    if (a2) {
      return (
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-serif font-black text-base leading-none select-none ${className}`}
          style={{ background: A2.sealBg, color: A2.sealInk, transform: "rotate(6deg)", boxShadow: "0 3px 8px rgba(150,36,28,.4)" }}
        >
          {label}
        </div>
      );
    }
    const a = accent || MODULE_ACCENTS.classicalProse;
    return (
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center font-serif font-black text-base leading-none select-none ${className}`}
        style={{
          backgroundColor: a.solid,
          color: a.on,
          transform: "rotate(6deg)",
          boxShadow: "0 3px 8px rgba(36,31,27,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {label}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // A2 system (階段 6a) — ADDITIVE ONLY. Nothing above is changed and no screen
  // uses this yet (6b applies it to Home / Root). Every value below is copied
  // from design-preview/style-a2.html (its :root variables and A2 overrides);
  // do not tweak colours here without changing the sample first.
  // Names are prefixed `A2` / `MODULE_ICONS` so they cannot clash with the
  // "文房" (`INK`, `PaperCard`, …) or legacy names.
  // ---------------------------------------------------------------------
  // 階段 6c: "A2 switch". Root provides `true` while an A2 screen is showing; the shared components
  // (PaperCard, InkButton, Seal, QuestionBlock, FixedQuizFlow, and AudioButtons through InkButton) then
  // render their A2 look. The default is `false`, in which case they output exactly what they did before.
  const A2Context = React.createContext(false);
  const useA2 = () => React.useContext(A2Context);

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

  // Fixed full-screen backdrop: A2 gradient plus three blurred colour blobs (style-a2 `.bg`,
  // `.b1`–`.b3`). Not mounted anywhere yet. NOTE: style-a2.html itself hides the blobs
  // (`.bg{display:none}`), so pass `blobs={false}` to match the sample exactly.
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

  window.App.UI = {
    // legacy
    COLORS,
    Button,
    Card,
    // new "文房" system
    INK,
    MODULE_ACCENTS,
    FEEDBACK,
    REVIEW_ACCENT,
    TYPE,
    PaperCard,
    InkButton,
    Seal,
  };

  // 階段 6a: A2 additions, attached separately so the export above stays untouched.
  Object.assign(window.App.UI, {
    A2,
    A2_MIN_FONT_PX,
    A2_MIN_TAP_PX,
    MODULE_ICONS,
    A2Card,
    A2Button,
    A2BackButton,
    A2ModuleIcon,
    A2Background,
    A2Context,
    useA2,
  });
})();
