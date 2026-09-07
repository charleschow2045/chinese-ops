// Home screen: level selector + module dashboard grid.
// First of the 3 "文房" redesign sample screens — see theme.jsx header
// comment and CLAUDE.md "UI redesign" notes for the system this draws from.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { INK, MODULE_ACCENTS, TYPE } = window.App.UI;

  function LevelSelector({ level, onChangeLevel }) {
    return (
      <div className="flex gap-2">
        {Storage.LEVELS.map((l) => {
          const active = level === l.key;
          return (
            <button
              key={l.key}
              onClick={() => onChangeLevel(l.key)}
              className={`flex-1 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
              style={
                active
                  ? { backgroundColor: INK.vermillion, color: INK.paper, boxShadow: "0 3px 0 #7A211A" }
                  : { backgroundColor: INK.paperCard, color: INK.mutedInk, border: `1.5px solid #E9DFC7` }
              }
            >
              {l.label}
            </button>
          );
        })}
      </div>
    );
  }

  function ModuleCard({ mod, onOpen }) {
    const a = MODULE_ACCENTS[mod.key] || MODULE_ACCENTS.essay;
    return (
      <button
        onClick={mod.implemented ? onOpen : undefined}
        disabled={!mod.implemented}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center overflow-hidden aspect-square transition-all ${
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
        <p className={`text-sm leading-tight ${TYPE.heading}`} style={{ color: INK.ink }}>
          {mod.label}
        </p>
        <p className={`text-[11px] ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
          {mod.implemented ? "點擊開始" : "即將推出"}
        </p>
        {mod.implemented && (
          <span className="absolute left-0 right-0 bottom-0 h-[5px]" style={{ backgroundColor: a.solid }} />
        )}
      </button>
    );
  }

  function Home({ state, onChangeLevel, onOpenModule }) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="rounded-3xl p-5"
          style={{
            backgroundColor: INK.paperCard,
            border: "1.5px solid #E9DFC7",
            boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 10px 24px -10px rgba(36,31,27,0.16)",
          }}
        >
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            程度
          </p>
          <LevelSelector level={state.level} onChangeLevel={onChangeLevel} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Storage.MODULES.map((mod) => (
            <ModuleCard key={mod.key} mod={mod} onOpen={() => onOpenModule(mod.key)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.Home = Home;
})();
