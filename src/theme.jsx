// Shared UI primitives.
//
// This file now carries TWO parallel systems during a staged visual
// redesign (see CLAUDE.md "UI redesign" notes):
//   - LEGACY: `COLORS`, `Button`, `Card` — the original bright Tailwind-
//     palette look (flat saturated bg + thick border + hard offset shadow).
//     Left completely unchanged so the 7 modules not yet migrated keep
//     rendering exactly as before with zero risk.
//   - NEW ("文房" / scholar's-study system): `INK`, `MODULE_ACCENTS`, `TYPE`,
//     `PaperCard`, `InkButton`, `Seal` — a warmer, more layered look built
//     around 5 ink/seal-inspired core colors instead of arbitrary Tailwind
//     hues. Only Home.jsx, IdiomModule.jsx, and ClassicalProseModule.jsx use
//     these so far (the 3 sample screens); the rest still use the legacy
//     system until the direction is approved and rolled out further.
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

  window.App.UI = {
    // legacy
    COLORS,
    Button,
    Card,
    // new "文房" system
    INK,
    MODULE_ACCENTS,
    TYPE,
    PaperCard,
    InkButton,
    Seal,
  };
})();
