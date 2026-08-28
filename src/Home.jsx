// Home screen: level selector + 9-module dashboard grid
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { Card, COLORS } = window.App.UI;

  function LevelSelector({ level, onChangeLevel }) {
    return (
      <div className="flex gap-2">
        {Storage.LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => onChangeLevel(l.key)}
            className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all ${
              level === l.key ? "bg-red-500 border-red-700 text-white" : "bg-white border-red-100 text-red-300"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  function ModuleCard({ mod, onOpen }) {
    const c = COLORS[mod.color] || COLORS.rose;
    return (
      <button
        onClick={mod.implemented ? onOpen : undefined}
        disabled={!mod.implemented}
        className={`flex flex-col items-center justify-center gap-2 bg-white border-4 rounded-2xl p-4 text-center transition-all aspect-square
          ${mod.implemented ? `${c.border} active:translate-y-[2px]` : "border-stone-200 opacity-60"}`}
      >
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${mod.implemented ? c.bg : "bg-stone-100"}`}>
          {mod.emoji}
        </div>
        <p className="font-extrabold text-stone-800 text-sm leading-tight">{mod.label}</p>
        <p className="text-[11px] font-bold text-stone-400">{mod.implemented ? "點擊開始" : "即將推出"}</p>
      </button>
    );
  }

  function Home({ state, onChangeLevel, onOpenModule }) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold text-stone-400 mb-2">程度</p>
          <LevelSelector level={state.level} onChangeLevel={onChangeLevel} />
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {Storage.MODULES.map((mod) => (
            <ModuleCard key={mod.key} mod={mod} onOpen={() => onOpenModule(mod.key)} />
          ))}
        </div>
      </div>
    );
  }

  window.App.Home = Home;
})();
