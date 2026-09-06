// Shared UI primitives — bright, encouraging theme, red/gold accents for a
// Chinese-learning feel, tuned for a Primary 5 – Secondary 1 student.
window.App = window.App || {};

(function () {
  // Full literal class-name strings per key, not template-interpolated
  // (e.g. never `text-${color}-600`) — keeps every class name Tailwind's
  // Play CDN can see as-is, and avoids re-deriving color classes elsewhere.
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

  window.App.UI = { COLORS, Button, Card };
})();
