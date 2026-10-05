// Module 6: 中國歷史故事 (standalone) — unlike Modules 1/2/5, comprehension
// questions here are hand-authored per story (fixed, not generated at
// runtime), since each story's facts are unique. Flow: list (tabbed by
// 類別) -> read the story -> answer that story's own questions -> completion
// summary.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PaperCard, InkButton, INK, MODULE_ACCENTS, REVIEW_ACCENT, TYPE } = window.App.UI;
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

  // `nav` (optional): { storyId?, category?, from? } set when another module
  // links here — open that story / tab directly; `from` ({ module, opts }) is
  // where the story page's back button returns to.
  function HistoryModule({ mistakes, onBack, onRecordPractice, onAnswerItem, nav, onNavigate }) {
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
      return (
        <StoryDetail
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
