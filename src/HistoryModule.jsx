// Module 6: 中國歷史故事 (standalone) — unlike Modules 1/2/5, comprehension
// questions here are hand-authored per story (fixed, not generated at
// runtime), since each story's facts are unique. Flow: list (tabbed by
// 類別) -> read the story -> answer that story's own questions -> completion
// summary.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE, A2, A2BackButton, A2ModuleIcon, MODULE_ICONS, useA2 } = window.App.UI;
  const ACCENT = MODULE_ACCENTS.history;
  const { FixedQuizFlow } = window.App.QuizQuestion;
  const { HISTORY_ITEMS, HISTORY_CATEGORIES, HISTORY_WAR_POEM_IDS, HISTORY_POEM_STORY_LINKS, POETRY_ITEMS } = window.App.Content;
  const { AudioButtons } = window.App;

  // 出處 tag. 史書記載 is a quiet outlined chip; the three non-正史 sources are
  // solid-filled with an icon so a child can tell at a glance it isn't
  // recorded history. Unknown/missing `source` renders nothing.
  const SOURCE_TAGS = {
    史書記載: { icon: "📜", bg: "#E4E9DE", border: "#C9D4BE", color: INK.bamboo, solid: false },
    小說演義: { icon: "🎭", bg: INK.vermillion, border: INK.vermillion, color: INK.paper, solid: true },
    筆記軼事: { icon: "📓", bg: INK.indigo, border: INK.indigo, color: INK.paper, solid: true },
    神話與民間傳說: { icon: "✨", bg: INK.ochre, border: INK.ochre, color: INK.paper, solid: true },
  };

  function SourceTag({ source }) {
    const s = SOURCE_TAGS[source];
    if (!s) return null;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-none whitespace-nowrap shrink-0 ${TYPE.heading}`}
        style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
      >
        <span aria-hidden="true">{s.icon}</span>
        {source}
      </span>
    );
  }

  const WAR_POEM_CATEGORY = "戰爭詩詞";
  const POEMS_BY_ID = Object.fromEntries(POETRY_ITEMS.map((p) => [p.id, p]));
  const STORIES_BY_ID = Object.fromEntries(HISTORY_ITEMS.map((s) => [s.id, s]));

  // A relation chip ("事件背景" / "同一時代" / "同一主題") so the pairing is never
  // mistaken for "this poem is about exactly this story".
  function RelationChip({ relation }) {
    return (
      <span
        className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold mr-1.5"
        style={{ backgroundColor: ACCENT.tint, color: ACCENT.dark, border: `1px solid ${ACCENT.tintBorder}` }}
      >
        {relation}
      </span>
    );
  }

  // Chronological order inside a category (sortYear is BCE-negative).
  function byEra(a, b) {
    return (a.sortYear ?? 0) - (b.sortYear ?? 0);
  }

  function StoryDetail({ item, onBack, onStartQuestions, onOpenPoem }) {
    const relatedPoems = HISTORY_POEM_STORY_LINKS.filter((l) => l.storyId === item.id && POEMS_BY_ID[l.poemId]);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回
          </button>
          <span className={`text-sm ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.period}
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h2 className={`text-xl ${TYPE.heading}`} style={{ color: INK.ink }}>
              {item.title}
            </h2>
            <SourceTag source={item.source} />
          </div>
          {item.sourceNote && (
            <p
              className={`text-xs leading-relaxed mb-3 rounded-lg px-3 py-2 ${TYPE.body}`}
              style={{ color: INK.mutedInk, backgroundColor: ACCENT.tint, border: `1px solid ${ACCENT.tintBorder}` }}
            >
              出處說明：{item.sourceNote}
            </p>
          )}
          <p className={`leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
            {item.story}
          </p>
          <AudioButtons text={item.story} accent={ACCENT} className="mt-3" />
        </PaperCard>

        {(item.characters || item.lesson) && (
          <PaperCard accent={ACCENT} className="!p-4">
            {item.characters && (
              <p className={`text-sm leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
                <span className={TYPE.heading} style={{ color: ACCENT.solid }}>
                  主要人物：
                </span>
                {item.characters.join("、")}
              </p>
            )}
            {item.lesson && (
              <p className={`text-sm leading-relaxed mt-2 ${TYPE.body}`} style={{ color: INK.ink }}>
                <span className={TYPE.heading} style={{ color: ACCENT.solid }}>
                  故事道理：
                </span>
                {item.lesson}
              </p>
            )}
          </PaperCard>
        )}

        {relatedPoems.length > 0 && (
          <PaperCard accent={ACCENT} className="!p-4">
            <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
              相關詩詞
            </p>
            <div className="flex flex-col gap-3">
              {relatedPoems.map((l) => {
                const poem = POEMS_BY_ID[l.poemId];
                return (
                  <div key={l.poemId}>
                    <p className={`text-sm leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
                      <RelationChip relation={l.relation} />
                      {l.note}
                    </p>
                    <button
                      onClick={() => onOpenPoem(l.poemId)}
                      className={`mt-1 text-sm underline text-left ${TYPE.heading}`}
                      style={{ color: ACCENT.solid }}
                    >
                      🖌️ 《{poem.title}》 · {poem.author} →
                    </button>
                  </div>
                );
              })}
            </div>
          </PaperCard>
        )}

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  function StoryListRow({ item, onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:translate-y-[2px] transition-all"
        style={{
          backgroundColor: INK.paperCard,
          border: `1.5px solid ${ACCENT.tintBorder}`,
          boxShadow: "0 1px 2px rgba(36,31,27,0.05), 0 6px 14px -8px rgba(36,31,27,0.14)",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: ACCENT.tint }}
        >
          🏯
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`truncate ${TYPE.heading}`} style={{ color: INK.ink }}>
              {item.title}
            </p>
            <SourceTag source={item.source} />
          </div>
          <p className={`text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {item.period}
          </p>
        </div>
      </button>
    );
  }

  // 戰爭詩詞 tab entry: poem info + (if paired) the relation sentence and a
  // link to each related story. The poem text itself is opened in the poetry
  // module (full text, translation, practice), not duplicated here.
  function WarPoemCard({ poem, links, onOpenPoem, onOpenStory }) {
    const { FormPill } = window.App.PoetryParts;
    return (
      <PaperCard accent={ACCENT} className="!p-4">
        <button onClick={onOpenPoem} className="block w-full text-left">
          <p className={`text-lg ${TYPE.heading}`} style={{ color: INK.ink }}>
            {poem.title}
          </p>
          <p className={`text-xs mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            {poem.dynasty} · {poem.author}
          </p>
          <FormPill item={poem} className="mb-0" />
          <span className={`ml-2 text-xs underline ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            看全文、語譯及練習 →
          </span>
        </button>
        {links.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {links.map((l) => (
              <div
                key={l.storyId}
                className="rounded-xl p-3"
                style={{ backgroundColor: ACCENT.tint, border: `1.5px solid ${ACCENT.tintBorder}` }}
              >
                <p className={`text-sm leading-relaxed ${TYPE.body}`} style={{ color: INK.ink }}>
                  <RelationChip relation={l.relation} />
                  {l.note}
                </p>
                <button
                  onClick={() => onOpenStory(l.storyId)}
                  className={`mt-1 text-sm underline text-left ${TYPE.heading}`}
                  style={{ color: ACCENT.solid }}
                >
                  📖 相關故事：{STORIES_BY_ID[l.storyId].title} →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`mt-3 text-xs ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            暫時未有相關的歷史故事。
          </p>
        )}
      </PaperCard>
    );
  }

  // ---------------------------------------------------------------------
  // 階段 6c-2: A2 versions of this module's screens, used only while Root's A2 switch is on (useA2()).
  // The 文房 screens above are untouched. UI text is A2.font; 原文 / 例句 stay serif; text >= 14 px;
  // every pressable >= 44 px; back buttons are A2BackButton (>= 96 x 48).
  // ---------------------------------------------------------------------
  const A2_LABEL = { fontSize: 16, fontWeight: 900, color: A2.ink, fontFamily: A2.font, margin: 0 };
  const A2_BODY = { fontSize: 16, color: A2.ink, margin: 0, lineHeight: 1.7 };

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

  // 出處 tag for A2: same four labels, icons and hues as SOURCE_TAGS, at 13 px. 神話與民間傳說 uses the darker ochre
  // (#7A5D20, REVIEW_ACCENT.dark) so the white text reaches >= 4.5:1; the labels are unchanged.
  const SOURCE_TAGS_A2 = {
    史書記載: { icon: "📜", bg: "#E4E9DE", border: "#C9D4BE", color: INK.bamboo },
    小說演義: { icon: "🎭", bg: INK.vermillion, border: INK.vermillion, color: "#fff" },
    筆記軼事: { icon: "📓", bg: INK.indigo, border: INK.indigo, color: "#fff" },
    神話與民間傳說: { icon: "✨", bg: "#7A5D20", border: "#7A5D20", color: "#fff" },
  };

  function SourceTagA2({ source }) {
    const t = SOURCE_TAGS_A2[source];
    if (!t) return null;
    return (
      <span
        className="inline-flex items-center gap-1 whitespace-nowrap shrink-0"
        style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color, borderRadius: 999, padding: "2px 10px", fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}
      >
        <span aria-hidden="true">{t.icon}</span>
        {source}
      </span>
    );
  }

  function RelationChipA2({ relation }) {
    return (
      <span style={{ display: "inline-block", borderRadius: 999, padding: "1px 10px", fontSize: 13, fontWeight: 800, marginRight: 6, background: A2.segTrack, color: A2.accD }}>
        {relation}
      </span>
    );
  }

  // Same tone table as PoetryModule's FormPill (that component is exported for the 文房 screens and left untouched).
  const FORM_PILL_TONES_A2 = [
    { match: (f) => f.includes("絕句"), bg: "#E4E9DE", text: "#2F4028" },
    { match: (f) => f.includes("律詩"), bg: "#E4E8EC", text: "#23303D" },
    { match: (f) => f.includes("古詩"), bg: "#F1E7CF", text: "#7A5D20" },
    { match: (f) => f === "詞", bg: "#F6E4E1", text: "#7A211A" },
    { match: (f) => f === "文言短文", bg: "#EAE5DB", text: "#6B6355" },
  ];

  function FormPillA2({ item }) {
    if (!item.form) return null;
    const tone = FORM_PILL_TONES_A2.find((t) => t.match(item.form));
    if (!tone) return null;
    const label = item.form === "詞" && item.ciTune ? `詞．${item.ciTune}` : item.form;
    return (
      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: tone.bg, color: tone.text }}>
        {label}
      </span>
    );
  }

  const A2_LINK = { minHeight: 44, display: "inline-flex", alignItems: "center", border: 0, background: "transparent", color: A2.accD, fontFamily: A2.font, fontSize: 16, fontWeight: 900, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer", textAlign: "left" };

  function StoryDetailA2({ item, onBack, onStartQuestions, onOpenPoem }) {
    const relatedPoems = HISTORY_POEM_STORY_LINKS.filter((l) => l.storyId === item.id && POEMS_BY_ID[l.poemId]);
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <A2BackButton label="← 返回" onClick={onBack} />
          <span style={{ fontSize: 14, fontWeight: 700, color: A2.sub }}>{item.period}</span>
        </div>

        <PaperCard>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h2 style={{ fontSize: 22, fontWeight: 900, color: A2.ink, margin: 0, lineHeight: 1.3 }}>{item.title}</h2>
            <SourceTagA2 source={item.source} />
          </div>
          {item.sourceNote && (
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 12px", borderRadius: 12, padding: "8px 12px", color: A2.sub, background: A2.row, border: `1px solid ${A2.rowBd}` }}>
              出處說明：{item.sourceNote}
            </p>
          )}
          <p className="font-serif" style={{ fontSize: 17, lineHeight: 1.95, color: A2.ink, margin: 0 }}>{item.story}</p>
          <AudioButtons text={item.story} accent={ACCENT} className="mt-3" />
        </PaperCard>

        {(item.characters || item.lesson) && (
          <PaperCard>
            {item.characters && (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>
                <span style={{ fontWeight: 900, color: A2.accD }}>主要人物：</span>
                {item.characters.join("、")}
              </p>
            )}
            {item.lesson && (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: item.characters ? "8px 0 0" : 0 }}>
                <span style={{ fontWeight: 900, color: A2.accD }}>故事道理：</span>
                {item.lesson}
              </p>
            )}
          </PaperCard>
        )}

        {relatedPoems.length > 0 && (
          <A2Section title="相關詩詞">
            <div className="flex flex-col gap-3">
              {relatedPoems.map((l) => {
                const poem = POEMS_BY_ID[l.poemId];
                return (
                  <div key={l.poemId}>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>
                      <RelationChipA2 relation={l.relation} />
                      {l.note}
                    </p>
                    <button onClick={() => onOpenPoem(l.poemId)} className="mt-1" style={A2_LINK}>
                      🖌️ 《{poem.title}》 · {poem.author} →
                    </button>
                  </div>
                );
              })}
            </div>
          </A2Section>
        )}

        <InkButton accent={ACCENT} className="w-full" onClick={onStartQuestions}>
          開始問答 ✏️
        </InkButton>
      </div>
    );
  }

  function StoryListRowA2({ item, onOpen }) {
    const m = MODULE_ICONS.history;
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 text-left active:translate-y-[2px] transition-all"
        style={{ minHeight: 72, padding: "10px 14px 10px 12px", borderRadius: 22, background: A2.glass, border: `1px solid ${A2.glassBd}`, boxShadow: A2.shadow, color: A2.ink, fontFamily: A2.font, cursor: "pointer" }}
      >
        <div aria-hidden="true" className="shrink-0 flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 17, background: m.tint, border: `1px solid ${m.tintBorder}`, fontSize: 24, lineHeight: 1 }}>
          🏯
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate" style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{item.title}</p>
            <SourceTagA2 source={item.source} />
          </div>
          <p style={{ fontSize: 14, color: A2.sub, margin: 0 }}>{item.period}</p>
        </div>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 900, color: A2.accD }}>›</span>
      </button>
    );
  }

  function WarPoemCardA2({ poem, links, onOpenPoem, onOpenStory }) {
    return (
      <PaperCard>
        <button onClick={onOpenPoem} className="block w-full text-left" style={{ minHeight: 44, background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: A2.font }}>
          <p className="font-serif" style={{ fontSize: 19, fontWeight: 900, color: A2.ink, margin: 0 }}>{poem.title}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: A2.sub, margin: "2px 0 8px" }}>
            {poem.dynasty} · {poem.author}
          </p>
          <FormPillA2 item={poem} />
          <span style={{ marginLeft: 8, fontSize: 15, fontWeight: 900, color: A2.accD, textDecoration: "underline", textUnderlineOffset: 4 }}>看全文、語譯及練習 →</span>
        </button>
        {links.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {links.map((l) => (
              <div key={l.storyId} className="rounded-xl p-3" style={{ background: A2.row, border: `1px solid ${A2.rowBd}` }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: A2.ink, margin: 0 }}>
                  <RelationChipA2 relation={l.relation} />
                  {l.note}
                </p>
                <button onClick={() => onOpenStory(l.storyId)} className="mt-1" style={A2_LINK}>
                  📖 相關故事：{STORIES_BY_ID[l.storyId].title} →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 12, fontSize: 14, color: A2.sub, marginBottom: 0 }}>暫時未有相關的歷史故事。</p>
        )}
      </PaperCard>
    );
  }

  function ListViewA2({ categories, category, setCategory, isWarPoems, mistakes, onlyMistakes, setOnlyMistakes, filtered, openItem, openPoem, onBack }) {
    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: A2.font }}>
        <A2Header moduleKey="history" title="中國歷史故事" onBack={onBack} />

        <PaperCard>
          <h2 style={{ ...A2_LABEL, marginBottom: 8 }}>類別</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const active = category === c;
              const count = c === WAR_POEM_CATEGORY ? HISTORY_WAR_POEM_IDS.length : HISTORY_ITEMS.filter((it) => it.category === c).length;
              return (
                <button
                  key={c}
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  className="transition-all"
                  style={{
                    minHeight: 48,
                    borderRadius: 999,
                    border: 0,
                    padding: "0 8px",
                    fontFamily: A2.font,
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: "pointer",
                    ...(active ? { background: A2.segOn, color: "#fff", boxShadow: A2.segOnShadow } : { background: A2.segTrack, color: A2.sub }),
                  }}
                >
                  {c}
                  <span style={{ marginLeft: 4, fontSize: 14, opacity: 0.9 }}>（{count}）</span>
                </button>
              );
            })}
          </div>
          {!isWarPoems && (mistakes || []).length > 0 && (
            <button
              aria-pressed={onlyMistakes}
              onClick={() => setOnlyMistakes((v) => !v)}
              className="w-full mt-2 transition-all"
              style={{
                minHeight: 48,
                borderRadius: 999,
                border: 0,
                fontFamily: A2.font,
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                ...(onlyMistakes ? { background: A2.fireInk, color: "#fff" } : { background: A2.fireBg, color: A2.fireInk }),
              }}
            >
              📝 只看錯題 ({mistakes.length})
            </button>
          )}
        </PaperCard>

        {isWarPoems && (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: 14, color: A2.sub, margin: 0, lineHeight: 1.7 }}>
              以下是與戰爭、從軍、家國有關的詩詞；點進去可以看全文、語譯和做練習。
            </p>
            {HISTORY_WAR_POEM_IDS.filter((id) => POEMS_BY_ID[id]).map((id) => (
              <WarPoemCardA2
                key={id}
                poem={POEMS_BY_ID[id]}
                links={HISTORY_POEM_STORY_LINKS.filter((l) => l.poemId === id && STORIES_BY_ID[l.storyId])}
                onOpenPoem={() => openPoem(id, { category: WAR_POEM_CATEGORY })}
                onOpenStory={(storyId) => openItem(storyId)}
              />
            ))}
          </div>
        )}

        {!isWarPoems && (
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && <p className="text-center py-4" style={{ fontSize: 14, color: A2.sub, margin: 0 }}>這個類別暫時沒有錯題。</p>}
            {filtered.map((item) => (
              <StoryListRowA2 key={item.id} item={item} onOpen={() => openItem(item.id)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // `nav` (optional): { storyId?, category?, from? } set when another module
  // links here — open that story / tab directly; `from` ({ module, opts }) is
  // where the story page's back button returns to.
  function HistoryModule({ mistakes, onBack, onRecordPractice, onAnswerItem, nav, onNavigate }) {
    const a2 = useA2();
    const navStory = nav && STORIES_BY_ID[nav.storyId] ? nav.storyId : null;
    const [view, setView] = useState(navStory ? "story" : "list"); // list | story | questions
    // A tab per category that has stories; 戰爭詩詞 holds poems (by id), not stories.
    const categories = HISTORY_CATEGORIES.filter((c) =>
      c === WAR_POEM_CATEGORY ? HISTORY_WAR_POEM_IDS.length > 0 : HISTORY_ITEMS.some((it) => it.category === c)
    );
    const [category, setCategory] = useState(
      navStory ? STORIES_BY_ID[navStory].category : nav && categories.includes(nav.category) ? nav.category : categories[0]
    );
    const [onlyMistakes, setOnlyMistakes] = useState(false);
    const [selectedId, setSelectedId] = useState(navStory);
    const isWarPoems = category === WAR_POEM_CATEGORY;

    const filtered = HISTORY_ITEMS.filter(
      (it) => it.category === category && (!onlyMistakes || (mistakes || []).includes(it.id))
    ).sort(byEra);
    const selectedItem = HISTORY_ITEMS.find((it) => it.id === selectedId);

    function openItem(id) {
      setSelectedId(id);
      setView("story");
    }

    // Jump to a poem in the poetry module; its back button returns here.
    function openPoem(poemId, fromOpts) {
      onNavigate &&
        onNavigate("poetry", {
          poemId,
          scopeIds: HISTORY_WAR_POEM_IDS,
          from: { module: "history", opts: fromOpts },
        });
    }

    // From a poem we opened a story: back goes to that poem; otherwise to the list.
    function leaveStory() {
      if (nav && nav.from && onNavigate) onNavigate(nav.from.module, nav.from.opts);
      else setView("list");
    }

    // Fixed-per-item modules track mistakes at story granularity (not
    // per-question): a perfect run clears it from the mistake list, any
    // wrong answer flags the whole story for 練習錯題 review.
    function finishQuestions(correctCount, total) {
      onRecordPractice(correctCount, total);
      onAnswerItem(selectedItem.id, correctCount === total);
      setView("list");
    }

    if (view === "story" && selectedItem) {
      const Detail = a2 ? StoryDetailA2 : StoryDetail;
      return (
        <Detail
          item={selectedItem}
          onBack={leaveStory}
          onStartQuestions={() => setView("questions")}
          onOpenPoem={(poemId) => openPoem(poemId, { storyId: selectedItem.id })}
        />
      );
    }

    if (view === "questions" && selectedItem) {
      return (
        <FixedQuizFlow
          questions={selectedItem.questions}
          accent={ACCENT}
          headerLabel={selectedItem.title}
          onBack={() => setView("story")}
          onFinish={finishQuestions}
        />
      );
    }

    if (a2) {
      return (
        <ListViewA2
          categories={categories}
          category={category}
          setCategory={setCategory}
          isWarPoems={isWarPoems}
          mistakes={mistakes}
          onlyMistakes={onlyMistakes}
          setOnlyMistakes={setOnlyMistakes}
          filtered={filtered}
          openItem={openItem}
          openPoem={openPoem}
          onBack={onBack}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={`text-sm ${TYPE.heading}`} style={{ color: ACCENT.solid }}>
            ← 返回主頁
          </button>
          <span className={`text-sm ${TYPE.heading}`} style={{ color: INK.ink }}>
            中國歷史故事
          </span>
        </div>

        <PaperCard accent={ACCENT}>
          <p className={`text-sm mb-2 ${TYPE.caption}`} style={{ color: INK.mutedInk }}>
            類別
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const active = category === c;
              const count =
                c === WAR_POEM_CATEGORY ? HISTORY_WAR_POEM_IDS.length : HISTORY_ITEMS.filter((it) => it.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl py-2 px-2 text-sm transition-all ${TYPE.heading}`}
                  style={
                    active
                      ? { backgroundColor: ACCENT.solid, color: ACCENT.on }
                      : { backgroundColor: INK.paper, color: INK.mutedInk, border: `1.5px solid ${ACCENT.tintBorder}` }
                  }
                >
                  {c}
                  <span className="ml-1 text-xs opacity-80">（{count}）</span>
                </button>
              );
            })}
          </div>
          {!isWarPoems && (mistakes || []).length > 0 && (
            <button
              onClick={() => setOnlyMistakes((v) => !v)}
              className={`w-full mt-2 rounded-xl py-2 text-sm transition-all ${TYPE.heading}`}
              style={
                onlyMistakes
                  ? { backgroundColor: REVIEW_ACCENT.solid, color: REVIEW_ACCENT.on }
                  : { backgroundColor: INK.paper, color: REVIEW_ACCENT.dark, border: `1.5px solid ${REVIEW_ACCENT.tintBorder}` }
              }
            >
              📝 只看錯題 ({mistakes.length})
            </button>
          )}
        </PaperCard>

        {isWarPoems && (
          <div className="flex flex-col gap-3">
            <p className={`text-xs ${TYPE.body}`} style={{ color: INK.mutedInk }}>
              以下是與戰爭、從軍、家國有關的詩詞；點進去可以看全文、語譯和做練習。
            </p>
            {HISTORY_WAR_POEM_IDS.filter((id) => POEMS_BY_ID[id]).map((id) => (
              <WarPoemCard
                key={id}
                poem={POEMS_BY_ID[id]}
                links={HISTORY_POEM_STORY_LINKS.filter((l) => l.poemId === id && STORIES_BY_ID[l.storyId])}
                onOpenPoem={() => openPoem(id, { category: WAR_POEM_CATEGORY })}
                onOpenStory={(storyId) => openItem(storyId)}
              />
            ))}
          </div>
        )}

        {!isWarPoems && (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className={`text-sm text-center py-4 ${TYPE.body}`} style={{ color: INK.mutedInk }}>
              這個類別暫時沒有錯題。
            </p>
          )}
          {filtered.map((item) => (
            <StoryListRow key={item.id} item={item} onOpen={() => openItem(item.id)} />
          ))}
        </div>
        )}
      </div>
    );
  }

  window.App.HistoryModule = HistoryModule;
})();
