# Project: 中文學習 App (Chinese Learning App)

A web app to help a Hong Kong student (Primary 5 to Secondary 1 level, so
content difficulty spans a few levels) practice Chinese language and culture
across multiple areas.

## Tech stack
- Single-page web app: React + Tailwind CSS
- No backend — all data stored in browser localStorage (single-device, single-user app)
- Deployed as static site, added to iPad/tablet home screen
- Mobile-first layout
- All UI text and content in Traditional Chinese (繁體中文), **書面語 (formal
  written Chinese) register throughout — not colloquial Cantonese**. Modules
  1–9 originally shipped with Cantonese-register quiz prompts/feedback
  (呢個/咩/嘅/咗/唔/喺 etc.); all of that was converted to 書面語 after user
  feedback. When adding new UI copy or content, write it in 書面語 from the
  start — don't reintroduce colloquial phrasing.
  - **The sneakiest recurring slip is 同 used as "and" between two nouns**
    (e.g. "文具同水壺", "蘋果、麵包同牛奶") — it reads as an easy, natural
    word choice while drafting quickly, but it's colloquial Cantonese; the
    formal equivalent is 和 or 與. This one isn't caught by an obvious
    character blacklist the way 呢/咩/嘅 are, since 同 is *also* correct
    formal Chinese in other roles (同學, 同時, 相同, 共同, 同情, 不同).
    Several instances slipped through the original conversion pass and were
    only caught during later content-expansion work — when writing new
    content, read back any "X同Y" construction and ask whether 同 is being
    used as a coordinating "and"; if so, swap it for 和/與.

### Implementation detail: no build step
- No Node.js required: React, ReactDOM, Babel Standalone, and Tailwind are
  loaded via `<script>` CDN tags (same pattern as the sibling `beetle-care-app`,
  `english-ops`, and `sketch-echo` projects)
- JSX files are plain classic `<script type="text/babel" src="...">` tags,
  loaded in dependency order, sharing a single global namespace object `App`
  (each file attaches what it defines to `window.App.*`) — no ES modules,
  no bundler
- Requires being served over http(s) (not opened via `file://`) because
  Babel Standalone fetches `src` scripts via XHR. Local testing uses
  `.claude/static-server.ps1` (same tiny PowerShell HTTP server used by the
  sibling projects) — run it with
  `powershell -File .claude/static-server.ps1 -Root chinese-ops -Port 5700`
  - **Known quirk: the server is single-threaded** (one blocking
    `AcceptTcpClient()` loop, no concurrency) — `index.html` now loads ~34
    separate `<script>`/content files, and a browser's parallel-connection
    burst on first load can overwhelm it, producing a page full of
    `net::ERR_CONNECTION_RESET`/`ERR_CONNECTION_REFUSED` errors on that
    first attempt. If this happens: kill whatever's holding the port
    (`Get-NetTCPConnection -LocalPort 5700 | Stop-Process -Force` on the
    owning process id) and restart the server fresh — a second load after a
    clean restart succeeds because the browser's connections are no longer
    all racing at once against an already-busy accept loop. This is a
    dev-server-only issue; it doesn't affect the shipped static site.

## Difficulty levels
Three levels spanning 小五至中一 (P5–S1): `p5` (小五), `p6` (小六), `s1` (中一).
Each module has its own simple level selector/filter so difficulty can scale
within the module; content items are individually tagged with a level.

## Core modules (build in this order — each is largely independent)
1. **詩詞學習 (Classical Poetry)** — ✅ built
2. **作文金句 (Essay Golden Sentences)** — ✅ built
3. **倉頡輸入法教學 (Cangjie Input Method Tutorial)** — ✅ built, standalone
4. **普通話練習 (Mandarin Practice)** — ✅ built, standalone
5. **成語學習 (Idiom Learning)** — ✅ built, game-style, standalone
6. **中國歷史故事 (Chinese History Stories)** — ✅ built, standalone
7. **閱讀理解 (Reading Comprehension)** — ✅ built
8. **修辭手法 (Rhetorical Devices)** — ✅ built
9. **標點符號練習 (Punctuation Practice)** — ✅ built
10. **文言文選讀 (Classical Chinese Reading)** — ✅ built, standalone, 27
    texts across 3 batches (see Module 10 details below) — added after the
    original 9 modules, per explicit user feedback that none of them
    actually present original classical-Chinese text with translation +
    glossary + comprehension questions together

Full spec for each module (practice mechanics, content requirements) is in
the original project brief — see "Module details" below for what's already
decided for Module 1; ask before assuming details for unbuilt modules.

## UI system — "A2" (深靛型格 + 磨砂玻璃), FULLY ROLLED OUT (Phase 6 complete, Oct 2026)
The app went through two looks: the first "文房" (scholar's-study: paper / ink / seal colours,
`PaperCard` with a warm border, layered `InkButton`) and then, after the user compared three
mock-ups, **A2** (a pale-lilac gradient page, frosted-glass near-white cards, a deep-indigo header
band, deep-indigo buttons). **A2 is the only look in the code now** — every 文房 branch, the legacy
Tailwind-colour `COLORS`/`Button`/`Card`, `FEEDBACK`/`REVIEW_ACCENT`/`TYPE`, the `A2Context`/`useA2()`
switch and `design-preview/` were deleted in Phase 6d-2. Don't reintroduce a second look or a context switch.
- **Where it lives:** `src/theme.jsx` → `window.App.UI`. Exports:
  - `A2` — colour / gradient / shadow / font tokens (`bg`, `ink`, `sub`, `acc`, `accD`, `glass`, `glassSolid`,
    `row`, `rowBd`, `rowDone`, `ok`, `hot`, `hotInk`, `todayBg`, `fireBg`, `fireInk`, `segTrack`, `barTrack`,
    `sealBg`, `sealInk`, `shieldBg`, `shieldInk`, `shadow`, `font`, …). Font stack: Zen Maru Gothic → Noto Sans TC →
    PingFang HK → PingFang TC → Hiragino Maru Gothic ProN → system-ui; numerals Baloo 2; Noto Serif TC
    (`font-serif`) is kept for quoted classical text, poem lines, example sentences, glossary terms and seals.
  - `A2Card`, `A2Button` (≥ 48 px high, ≥ 16 px text), `A2BackButton` (≥ 48 px high, ≥ 96 px wide, ≥ 16 px bold,
    `label` default 「← 返回」, `onClick`), `A2ModuleIcon` (`moduleKey`, `size`), `A2Background` (fixed gradient +
    3 blurred blobs, mounted once in `Root.jsx`), `MODULE_ICONS` (10 keys = `Storage.MODULES`; `{emoji, tint,
    tintBorder, bar}`), `A2_MIN_FONT_PX = 13`, `A2_MIN_TAP_PX = 44`.
  - `PaperCard`, `InkButton`, `Seal` — the names the module files already used, now **A2-only** (they keep their
    old names on purpose; renaming them would have made the diff huge — a rename is a separate decision).
    `PaperCard` = a near-white `A2.glass` card; `InkButton` = `A2Button` (drops any `!`-prefixed class such as
    `!py-2 !text-sm`, so a caller cannot go below the size floors); `Seal` = the red rotated stamp.
    **`accent` is still passed by every caller but ignored by these A2 components** (kept because
    `AudioButtons.jsx` — which falls back to `MODULE_ACCENTS.essay` — and ~all call sites still pass it).
  - `INK` (the six 文房 colours: `paper`, `ink`, `vermillion`, `bamboo`, `ochre`, `indigo`) and
    `MODULE_ACCENTS` (per-module `solid/dark/tint/tintBorder/on/family`) are kept: Cangjie's 五色 chart,
    History's 出處 tags and every `ACCENT = MODULE_ACCENTS.<moduleKey>` constant still read them.
  - `useScrollToTop(dep)` — a `useLayoutEffect` that calls `window.scrollTo(0, 0)` whenever `dep` changes.
  - `A2SegControl`, `A2Section`, `A2Header`, `A2ListRow`, `A2ReviewButton` — the shared screen pieces listed under "Standard module-file shape".
- **Floors the A2 components enforce (and every new screen must respect):** text ≥ 13 px (body ≥ 14 px),
  pressables ≥ 44 px high, back buttons ≥ 96 × 48, primary buttons ≥ 48 px high. Pinyin with tone marks in
  Mandarin screens uses `A2_PINYIN_FONT` (Noto Sans TC first) because the rounded fonts may lack tone-mark glyphs.
- **Page shell (`Root.jsx`):** one `A2Background` + `A2.bg`/`A2.ink` wrapper for every view; the home screen draws its own
  deep-indigo band (the app-title header is not rendered); other views get a spacer that keeps the safe-area top padding.
  `TestModeBanner` (sticky, above the page) and `NoticeStack` (fixed, bottom) are siblings of the page and use A2 directly.
  `Root` calls `window.scrollTo(0, 0)` on every `view` change.
- **Scroll to top inside a module (Phase 6d-2, commit 3):** each module that has an internal `view` state calls
  `useScrollToTop(view)` right after `const [view, setView] = useState(...)`, so every internal switch — list → detail,
  detail → list (back), teaching → practice, hub → sub-activity — starts at the top. `ReadingModule` uses its own
  `useLayoutEffect` instead: every screen starts at 0 **except** going back from the questions to the passage, which
  restores the saved reading position (`passageScroll`). Steps inside one quiz (next question) are not module views and
  do not reset the scroll, apart from Reading, which also resets per question.
- **Standard module-file shape (copy this for a new module):**
  1. `const { PaperCard, InkButton, Seal, INK, MODULE_ACCENTS, A2, A2BackButton, A2ModuleIcon, useScrollToTop } = window.App.UI;`
     (only what the file uses) and `const ACCENT = MODULE_ACCENTS.<moduleKey>;`.
  2. Shared screen pieces come from `theme.jsx` (destructure them from `window.App.UI`): `A2SegControl` (44 px segmented
     filter), `A2Section` (card with an `<h3>` title), `A2Header` (back button + title + `A2ModuleIcon`), `A2ListRow`
     (72 px list row with a tinted tile) and `A2ReviewButton` (練習錯題 / 只看錯題 as a secondary 48 px chip using
     `A2.fireBg`/`A2.fireInk`). Exception: `CangjieModule.jsx` and `MandarinModule.jsx` keep their own local `A2Section`, which only
     renders the `<h3>` when `title` is truthy (the shared one always renders it) — they were not merged because the code differs.
     Each module file still defines its own `A2_LABEL` / `A2_BODY` style objects (`theme.jsx` has a private copy of `A2_LABEL`).
  3. Text is `fontFamily: A2.font` (inline style); quoted classical text / poems / example sentences use `font-serif`.
     Colours are applied through inline `style` (not Tailwind arbitrary-value classes) so nothing depends on the Play
     CDN's bracket parsing.
  4. Quiz screens go through `QuestionBlock` / `FixedQuizFlow` (`QuizQuestion.jsx`, A2-only, options on `A2.row`,
     ≥ 48 px, correct = `A2.rowDone`/`A2.ok`, wrong = `A2.todayBg`/`A2.hot`). Read-aloud buttons use `AudioButtons`.
  5. Call `onRecordPractice(correct, total)` exactly once when a session finishes (the mission / streak / badge logic
     hooks in there; the module never touches it) and, if the module tracks mistakes, `onAnswerItem`.
  6. To add a module: add its key to `Storage.MODULES` (and, for 每日任務, to the right group in `pickMissions`), an entry in
     `MODULE_ACCENTS` and `MODULE_ICONS` (`theme.jsx`), the content + module `<script>` tags in `index.html` (before
     `Home.jsx`/`Root.jsx`), a `view === "<key>"` branch and a record handler in `Root.jsx`, and — if it has internal views —
     `useScrollToTop(view)`. Home and the backup / badge code pick the module up from `Storage.MODULES`.
- **Cangjie's 五色:** the root chart needs five genuinely distinct tones for the "五色學倉頡" mnemonic, so
  `CangjieModule.jsx` has its own local `CATEGORY_TONES` (keyed by the `rose/orange/amber/emerald/violet` strings in
  `cangjieContent.jsx`) and `TONE_TEXT` (darker text shade of the same hue, because the plain tone text on its tint was ≈ 3 : 1).
- **Per-module notes that still matter:** 文言文選讀 shows a `Seal` with the source book's 2-character abbreviation
  (`sourceAbbrev()`, e.g. "《韓非子．五蠹》" → "韓非"); 成語 shows `MasteryBadgeA2` (a warm panel labelled
  「成語稱號（只計算成語學習的練習）」, deliberately different from the home 科舉稱號 card) and `CharacterPinyinCardA2`;
  歷史 uses category tabs (2-column 48 px pills with counts), `SourceTagA2` (神話與民間傳說 uses the darker ochre `#7A5D20`
  for contrast) and its own local `FormPillA2` (Poetry has the same pill; the old exported `FormPill` / `window.App.PoetryParts` was
  removed); Mandarin's `SpeechDrill` buttons pass `!px-2 !py-2 !text-base`,
  which the A2 `InkButton` drops (each button 295 × 48 at 820 px, 154 × 48 at 390 px).
- **Home (`Home.jsx`), top to bottom:** full-bleed deep-indigo band (`100vw` + `marginLeft: calc(50% - 50vw)`, safe-area top
  padding except in 測試模式) with greeting (早安 5–11 時 / 午安 12–17 時 / 晚安 otherwise, 「，同學」) and the date from
  `today` → 科舉稱號 card (stamp, 「科舉稱號：秀才」, 「累計練習 37 / 45 節」, progress bar, next-step text, seven-step ladder on one
  row; 狀元 shows 「已登狀元」; no 「Lv.」 number) → 今日任務 card → 程度 segmented control + 徽章 entry (up to three earned seals
  labelled 「已獲得」 — the first three in `BADGES` order, not the latest — plus the closest-to-earned badge) → 10 module cards
  (`A2ModuleIcon`, 「第 N 節」 only when `stats.sessions[module] > 0`, 「已精通」 from 100, milestone bar in `MODULE_ICONS[key].bar`,
  「下一里程 N 節」, 「今日任務」 tag, 「答對 N 題 · 錯題 N」 / 未開始) → backup panel. A small `<style>` block (`HOME_CSS`) holds the
  media queries (cloud + 🐲 hidden below 480 px, one-column pair below 620 px), press feedback and the focus ring. Container is
  `max-w-2xl` (640 px on iPad).
- **稱號 and 模組里程 are read-only views of `stats.sessions`** (no stored field, no backup change). **`stats.sessions` only
  counts sessions finished since 每日任務 shipped, so a child with older practice history starts at 童生 / 第 0 節 even if
  `practiceStats` is large (no retroactive credit — the user accepted this).**
  `Storage.jsx` (pure, never writes, never throws; bad values count as 0): `TITLE_TIERS`, `getTitleView(state)` →
  `{ index, key, name, seal, total, currentAt, nextName, nextAt, remaining, ratio, isMax }` (`ratio = total ÷ nextAt`, capped at 1),
  `MODULE_MILESTONES`, `getModuleMilestoneView(state, key)` → `{ sessions, nextAt, ratio, isMastered }`.
  | 稱號 | 童生 | 秀才 | 舉人 | 進士 | 探花 | 榜眼 | 狀元 |
  |---|---|---|---|---|---|---|---|
  | 印章字 | 童 | 秀 | 舉 | 進 | 探 | 榜 | 狀 |
  | 累計節數 ≥ | 0 | 10 | 45 | 100 | 180 | 300 | 600 |
  模組里程 (sessions per module): **5 → 15 → 30 → 60 → 100** (≥ 100 = 已精通). Covered by `tests/titles.test.js` (12 tests).
- **Other A2 screens:** `BadgesScreen.jsx` (exports `BadgesScreenA2` as `window.App.BadgesScreen`; summary card, 6 group sections, earned =
  white tile + red seal + 「✓ 已獲得」, locked = lilac dashed tile with 「？」 and progress; every earned seal is the same red);
  `BackupSettings.jsx` (`A2Card`/`A2Button`, buttons ≥ 48 px); `NoticeStack.jsx` (white card with a coloured edge per kind, 44 px
  「×」 / 「查看徽章 ›」 / 「全部關閉 ×」); `TestModeBanner.jsx` (deep-indigo sticky bar, 44 px buttons).
- **Verification method used for the whole restyle (scripts live in the session scratchpad, NOT in the repo):** Playwright +
  Chromium with React / Babel from npm and a Tailwind-CLI stylesheet in place of the CDN scripts, seeded `Math.random`, frozen
  `Date`, 測試模式 (`?today=2026-10-12`), and a SHA-256 of `#root.innerHTML` per screen compared with the previous commit
  (232 screens across home, backup panel, badges, notices, test banner and every module's list / first question / correct / wrong /
  result). Not verified on a real iPad or with the real CDN / Google Fonts.
- **Phase 6d-2 (final clean-up, 3 commits):** `f5323cd` removed the 文房 branches, `useA2()` switches and helpers only they used from
  the 10 module files; `4bfb402` removed the legacy theme components, the 文房 backdrop, `A2Context` and `design-preview/`;
  the third commit adds `useScrollToTop` and rewrites this file. All three were verified render-neutral against `a8af8f2`
  (232 screens, identical hashes).

## Design notes
- Bright, encouraging, age-appropriate tone (Primary 5 to Secondary 1 student)
- Page colours / cards / buttons follow the A2 system (see "UI system — A2" above); the pre-A2 palettes are gone from the code.
- Font: Zen Maru Gothic first, then "Noto Sans TC" / PingFang HK (Traditional Chinese), "Baloo 2" for numerals, and "Noto Serif TC" for classical
  text and seals — see "UI system — A2" above
- Since the child cannot type Chinese fluently yet, prefer selection-based
  input (multiple choice, drag, tap-to-build) over free typing in modules
  1, 2, 5, 7, 8, 9 — free typing is only appropriate within module 3 (Cangjie
  practice) and module 4 (Mandarin/pinyin)
- Simple navigation: a home dashboard of the 10 modules (2 columns × 5 rows on an
  iPad held upright, 1 column on a phone — see 每日任務 notes), tap a module to open
  it full-screen with a "← 返回主頁" back button (hub-and-spoke, same pattern
  as `english-ops`)
- `src/AudioButtons.jsx` — shared 🔊 普通話 / 🔊 粵語 read-aloud buttons
  (`window.App.AudioButtons`, a `{ text, accent, className }` component —
  `accent` takes a `MODULE_ACCENTS` entry; the A2 `InkButton` ignores it.
  Both buttons are 48 px high A2 buttons). Loads
  `speechUtils.jsx`'s voices once via `getVoicesAsync()` in a `useEffect`,
  picks a voice with `pickMandarinVoice`/`pickCantoneseVoice`, and calls
  `speak(text, voice, fallbackLang)` on click. Originally built inline for
  Module 5's idiom detail view, then extracted here and reused by Module 1
  (reads the whole poem/prose via `item.lines.join("")`) and Module 6 (reads
  `item.story`) after user request. Loads in `index.html` right after
  `speechUtils.jsx` and before `QuizQuestion.jsx` — any new caller must
  appear after that point in load order. If a future module wants this too,
  just import `window.App.AudioButtons` and pass `text` + `accent={ACCENT}`
  (that module's own `MODULE_ACCENTS` entry) — no per-module voice-loading
  needed.
- Shared UI primitives live in `src/theme.jsx` (`A2`, `A2Card`, `A2Button`, `A2BackButton`, `A2ModuleIcon`, `PaperCard`, `InkButton`, `Seal`,
  `INK`, `MODULE_ACCENTS`, `MODULE_ICONS`, `useScrollToTop` — see "UI system — A2") and `src/QuizQuestion.jsx`:
  - `QuestionBlock` — generic multiple-choice renderer with immediate
    feedback; `q.prompt` can be a plain string or a JSX element, so modules
    can render rich prompts (e.g. a whole poem with one line blanked out)
    through the same component. Options are A2 rows (≥ 48 px); correct = `A2.rowDone`/`A2.ok`,
    wrong = `A2.todayBg`/`A2.hot`. Prompt
    text is `text-xl` and option-button text is `text-lg` (bumped up from
    the unstyled ~16px default after user feedback asking for bigger
    exercise text) — since every module renders its practice questions
    through this one component (directly, or via `FixedQuizFlow`), this
    single change affects the question/answer text across all quiz-based
    modules at once. Several modules also build their own custom JSX
    `prompt` with an explicit Tailwind size (e.g. the sentence/clue shown
    above the options) — those don't inherit this wrapper's size and were
    bumped individually alongside this change (`text-lg` → `text-xl` for
    sentence/clue prompts, `text-3xl` → `text-4xl` for Idiom's
    blanked-character display). Cangjie and Mandarin's typing drills don't
    use `QuestionBlock` at all and were left alone — their question text was
    already large (`text-6xl` for the character being asked about) where it
    mattered.
  - `FixedQuizFlow` — steps through a **fixed** `questions` array (list →
    score screen), for modules whose questions are hand-authored per content
    item rather than generated at runtime (History, Reading, ClassicalProse
    — see their module details below). Takes `{questions, accent,
    headerLabel, onBack, onFinish}` — `accent` is passed through but the A2 look
    ignores it. Options are shuffled once per attempt.
- `src/quizUtils.jsx` holds `shuffle`/`sampleOthers`/`sampleWithRepeats`,
  shared by every module that auto-generates MC questions at runtime (see
  Module 1/2/5 details below) — reuse these rather than re-implementing
  per-module random-pick logic.
  - **`sampleWithRepeats(pool, count)` is the only correct way to pick N
    random practice questions from a pool.** A real bug shipped in six
    call sites (Poetry, Essay, Idiom, Rhetoric, Punctuation, and Mandarin's
    Listening drill): each built its question set with
    `for (i=0;i<count;i++) chosen.push(pool[i % pool.length])` — which
    always takes the same deterministic prefix of `pool` in file order
    (only the PRESENTATION order was shuffled afterwards). With `count`
    smaller than the pool, early items (e.g. 江雪, 7th in
    `poetryContent.jsx`) appeared in every single practice session while
    later items never appeared at all — this is what a user reported as
    "every time I open it, it's always 江雪." Fixed by using
    `sampleWithRepeats`, which reshuffles a fresh copy of the pool each time
    it needs to wrap around. If you add a new module with this "pick N from
    a pool" pattern, use `sampleWithRepeats` — never hand-roll the
    `pool[i % pool.length]` loop again.
  - **Two different question-generation shapes exist in this codebase
  — know which one a module needs before copying a pattern:**
  - *Generated at runtime* (Modules 1, 2, 5): questions are built from
    generic content fields via `quizUtils` helpers; adding more content
    items needs no new questions, just the right fields.
  - *Fixed per-item* (Modules 6, 7): each content item carries its own
    hand-authored `questions` array, rendered via `FixedQuizFlow`; adding a
    new item means writing that item's own questions by hand, because its
    facts aren't derivable from a generic field.

## Explicitly out of scope for v1
- No backend, accounts, or login
- No multi-user / classroom features
- Full 150-poem library can come later — started with a smaller curated set

## Module 1 details — 詩詞學習 (built, deepened after user feedback)
- Content: `src/content/poetryContent.jsx` — **54 classical poems** (唐/宋/晉/清)
  + 7 短篇文言文 (Analects excerpt, 陋室銘, 賣油翁, 愛蓮說, 揠苗助長, 記承天寺
  夜遊, 桃花源記節錄), each tagged `level: "p5"|"p6"|"s1"` and
  `type: "poem"|"prose"`. Original spec target is ~150 poems — 54 is a
  meaningful expansion from the initial 20 (via 38, then this 16-poem/
  2-prose "author coverage" batch), not the final count; keep expanding
  using the same template below.
  - **The 16-poem/2-prose expansion batch** was driven by author coverage,
    not just volume: added more representative works by authors already in
    the file (李白 ×2, 杜甫 ×2, 蘇軾 ×2 incl. the prose piece, 王維 ×2), and
    introduced 3 major poets that had zero entries before despite being
    core secondary-school-Chinese figures — 白居易 (3), 陶淵明 (3 incl. the
    prose piece), 李商隱 (4). Every 原文 was verified via `WebSearch` against
    multiple independent sources — several matched Hong Kong Education
    Bureau (`edb.gov.hk`) recommended-passage PDFs directly (月下獨酌其一,
    水調歌頭, 賦得古原草送別, 夜雨寄北), a useful independent check on both
    textual accuracy and HK-curriculum level-appropriateness.
  - **水調歌頭．明月幾時有（節錄）is deliberately excerpted**, unlike every
    other `type: "poem"` entry (all previously full-length): the user's own
    request labelled it "節錄". Uses a literal `"……"` as its own `lines`/
    `pinyin` array entry to mark the omitted middle section, with the
    omitted range spelled out in `background` — do not treat the `"……"`
    entry as a rendering bug; it's intentional and the pinyin-toggle/
    practice-quiz code handles it fine (never gets selected as a fill-blank
    answer since `buildFillBlankQuestion` picks by random index same as
    any other line, but distractor-sampling never targets it specially —
    if this ever surfaces "……" as a distractor option in practice, that's
    a real gap to fix, not expected today since no other poem has that
    exact line).
  - **Classical-prose placement decision**: 記承天寺夜遊 and 桃花源記（節錄）
    went into *this* file's existing 文言文 sub-section (same
    `lineExplanations`/`meaningQuiz` schema as the other 5 prose pieces
    here), **not** `classicalProseContent.jsx` (Module 10) — this file
    already collects short 文言文 excerpts and feeds them into the same
    runtime-generated practice quiz as the poems, whereas Module 10 uses a
    different, heavier schema (`glossary`, hand-authored `questions` array,
    `source`/`dynasty` instead of `author`) for its own standalone fixed-
    question flow. Keep new short classical-prose pieces here going forward
    unless they're specifically meant for Module 10's fixed-question format.
- Every item carries:
  - `explanation` — a short one-sentence paraphrase (still used as the
    fallback if `translation` is absent, and unrelated to `meaningQuiz`)
  - `annotations` — array of `{ term, jyutping?, meaning }`, glossing the
    genuinely hard/uncommon words in the piece (not every word — only what
    a real annotated-poetry reference would footnote). **`jyutping` must be
    a verified Cantonese reading, not a guess** — this project treats wrong
    pronunciation claims as seriously as the Cangjie key-mapping accuracy
    concern (Module 3): verify via a source like jyut.net before adding a
    reading, and omit `jyutping` entirely (keep just `meaning`) for terms
    you can't verify, as was done for 蔞 (couldn't find a reliable jyutping
    source for it).
  - `translation` (poems only) — a fuller modern-Chinese vernacular
    rendering of the whole piece (譯文), in the style of the reference sites
    the user linked (dugushici.com, classicalchineseliterature.org).
    `PoetryModule.jsx`'s detail view shows `translation` under a "譯文"
    heading, falling back to `explanation` if a poem doesn't have one yet.
  - `background`, and (poems only) `meaningQuiz` — a one-sentence paraphrase
    used as the correct option in meaning-based quiz questions (distinct
    from `explanation`/`translation`, which are display-only)
  - prose pieces additionally carry `lineExplanations` (parallel to `lines`)
    for the extra line-by-line depth 文言文 needs, per spec
- `src/PoetryModule.jsx` has three views:
  - **list** — level filter chips (全部/小五/小六/中一) + scrollable list of
    items, tap to open
  - **detail** — full text with a "顯示拼音" toggle, 詞語註釋 (if present),
    譯文/explanation, background, `AudioButtons` (reads the whole poem/prose
    aloud via `item.lines.join("")` — added after user request, reusing the
    shared component built for Module 5, see the shared-primitives note
    above), "開始練習" button
  - **practice** — an 8-question mixed quiz auto-generated from whichever
    pool is in scope (the current level filter, or all items if the filter
    has fewer than 4 items): fill-in-the-blank (one line of a poem is hidden,
    4 whole-line options — the correct line plus 3 sampled from other poems —
    all tap-to-select, no typing), author MC ("《題目》的作者是誰？"), and
    meaning MC (shows the first line, asks which paraphrase matches). Ends
    on a score screen; results are folded into
    `moduleProgress.poetry.practiceStats` in localStorage.
- Practice questions are **generated at runtime** from the content list
  (author/meaning distractors sampled from sibling items in the same pool)
  rather than hand-authored per poem — this is why every item needs an
  accurate `author`/`meaningQuiz` field even though there's no dedicated
  "questions" array in the content file. Keep this in mind when adding more
  poems: no extra authoring is needed beyond the content fields above (plus
  the new `annotations`/`translation` fields for depth).

## Module 2 details — 作文金句 (built, expanded after user feedback)
- Content: `src/content/essayContent.jsx` — **150 curated golden sentences**
  (18 → 60 → 75 → 150 across four rounds; user feedback called the original set "too
  easy, too little"), 50 per theme (描寫/抒情/論說), each tagged
  `level: "p5"|"p6"|"s1"` with a `keyPhrase` (exact substring of `sentence`,
  used for the fill-in-the-blank question — **must be verified as an exact
  substring**, e.g. programmatically via `sentence.includes(keyPhrase)`,
  before shipping a new entry, or the blank-rendering split silently fails),
  a `usage` note (when/why to use it in an essay), and a `scenario` (a short
  writing situation used for the scenario-match question).
- `src/EssayModule.jsx` has three views:
  - **list** — theme filter chips (全部/描寫/抒情/論說) + level filter chips,
    scrollable list, tap to open
  - **detail** — the sentence as a large quote, usage note, applicable
    scenario, "開始練習" button
  - **practice** — an 8-question mixed quiz: fill-in-the-blank (the
    `keyPhrase` is blanked out of the sentence, 4 tap-to-select phrase
    options — correct + 3 sampled from other items' `keyPhrase`),
    scenario-match ("情境：...，以下哪一句金句最適合？", 4 whole-sentence options),
    and theme classification (shows the sentence, asks 描寫/抒情/論說 — all
    3 themes always shown, shuffled). Same score-screen/persistence pattern
    as Module 1; results go to `moduleProgress.essay.practiceStats`.
- **Practice question count doubled from 8 to 16** (`EssayModule.jsx`'s
  `PracticeSession`) per user feedback ("double up the question") — a
  plain constant change, no content/schema impact.
- Like Module 1, questions are generated at runtime from the content fields
  (no hand-authored "questions" array) — adding more golden sentences only
  requires the fields above (`theme`, `level`, `sentence`, `keyPhrase`,
  `usage`, `scenario`), each `keyPhrase` must be an exact substring of its
  `sentence` or the blank-rendering split will silently fail to blank it out.

## Module 3 details — 倉頡輸入法教學 (built)
- **This is the one module (besides Mandarin/pinyin, not yet built) where
  free typing is appropriate** — the child types plain keyboard letters
  (A–Y), never Chinese characters directly, so it doesn't hit the "typing
  Chinese is hard" constraint.
- Content: `src/content/cangjieContent.jsx` — the 24 basic root letters plus
  the special 難 (X) "doesn't fit elsewhere" key, grouped into the 4
  traditional colour-coded categories (哲理科/筆劃科/人身科/字形科) plus the
  難 special group, echoing the "五色學倉頡" visual teaching style. Also holds
  **12 verified compound-character examples** (明=AB, 林=DD, 森=DDD, 炎=FF,
  品=RRR, 早=AJ, 旦=AM, 圭=GG, 昌=AA, 淼=EEE, 二=MM, 三=MMM — expanded from an
  initial 5 after user feedback asked for more), **8 verified 輔助字形
  (auxiliary shapes)** (水/氵, 火/灬, 人/亻, 心/忄, 手/扌, 竹/⺮, 金/丷, 土/士,
  each with common-character examples), and one 速成 (Quick Cangjie) example
  (體: full BBTW → quick BW).
  **Every letter/code in this file was cross-checked against multiple
  independent Cangjie references via web search before being written** —
  unlike a poem's interpretation, a wrong keystroke mapping here would
  actively mis-teach the child, so don't hand-edit these without re-verifying.
- **The 輔助字形 list is deliberately a small verified subset, not a complete
  table** — every Cangjie reference site stores most of its full auxiliary
  shape table as images (hkcards, wikibooks, ifreesite all confirmed
  unextractable as text for most entries), and a WebFetch summarization
  pass over them produces vague, unverifiable paraphrases, not exact
  glyphs. Rather than fabricate uncertain entries, only shapes
  independently confirmed via multiple text-based sources — **and** with a
  concrete example-character list found in text (not guessed from general
  knowledge of the shape) — are included.
  - A second expansion pass (6→8 entries) found `cangjieking.com` — a
    dedicated Cangjie learning site with a genuinely comprehensive
    text-based table (`/learn/radicals-intro`, "119 輔助字形") — which
    cross-confirmed all 6 existing entries verbatim (same examples: 你/他/
    位/作 for 亻, 海/湖/游/泡 for 氵, etc.) and surfaced two new shapes with
    usable text examples: **丷 (金/C)**, examples 公/分/半, and **士
    (土/G)**, examples self-derived from character decomposition (吉=士+口,
    志=士+心, 壯=士+爿) rather than a source's own example list, same
    method already used for the original 6 entries' examples.
  - That same pass also *confirmed the existence* of several more
    auxiliary shapes across 2+ sources — 又 and 氺 (both 水/E), 冂/冖/爫 (all
    月/B), 辶 (卜/Y) — but every source's example-character list for these
    is image-only, so they were deliberately left out rather than paired
    with guessed examples. One source (hkcards.com) separately claimed 亠
    as an auxiliary of 卜/Y, but `cangjieking.com`'s comprehensive table
    lists Y's full auxiliary set *without* 亠 — a direct contradiction
    between sources — so that one was dropped entirely rather than trusted
    either way.
  - If asked to expand this table further, don't guess at any of the
    ~111 remaining auxiliary shapes from general knowledge — the same two
    conditions apply: the shape-to-root mapping needs 2+ independent
    sources, and the example characters need to come from a text source
    (or be individually decomposition-verified, as done for 士 above), not
    assumed from familiarity with the shape.
- Composing arbitrary multi-root characters beyond the 12 verified examples
  is still **out of scope for v1** (would need a verified full Cangjie code
  dictionary); the typing drill's phase 2 samples 8 of the 12 compound
  examples per session (`shuffle().slice(0, 8)`) rather than using all 12
  every time, keeping session length reasonable as this list grows.
- **組字例子（拆解圖）** — each compound example renders a visual
  root-by-root breakdown (`DecompositionDiagram` in `CangjieModule.jsx`):
  one tile per letter in `ex.code`, showing that letter's root character
  above its own letter, joined by "+", ending in "=" and a highlighted tile
  with the resulting character. The letter→root-character lookup
  (`ROOT_CHAR_BY_LETTER`) is **derived from `CANGJIE_ROOTS` at module load
  time, not duplicated as separate data** — this keeps the diagram
  automatically correct if `CANGJIE_ROOTS` is ever edited. Follow this same
  "derive, don't duplicate" pattern for any future visual built from
  already-verified content.
- `src/CangjieModule.jsx` has two views (no level filter — this module isn't
  P5/P6/S1-tiered):
  - **reference** — the colour-coded root chart, the 輔助字形 section, compound
    examples (with the 拆解圖 above), and the 速成 explainer, all on one
    scrollable page; "開始打字練習" button
  - **practice** — a real-typing drill (16 questions): phase 1 (8 questions)
    shows a root character and asks the child to type its letter; phase 2
    (8 questions, sampled from the compound examples) asks the child to type
    the full code for a compound character. Uses a plain `<input>` (uppercase,
    case-insensitive check), not the MC `QuestionBlock` — this is the first
    module using free-text input. Same score-screen/persistence pattern as
    Modules 1–2; results go to `moduleProgress.cangjie.practiceStats`.
- No other module currently requires the child to type Chinese, so there's
  no cross-module "link back to Cangjie if stuck" wiring yet — revisit this
  when a future module (e.g. Writing, if added) needs free Chinese text entry.

## Module 4 details — 普通話練習 (built)
- **This is the other module (besides Cangjie) where free typing is
  appropriate** — the 拼音默寫 drill has the child type plain pinyin letters
  (no tone marks required), never Chinese characters.
- Content: `src/content/mandarinContent.jsx` — 22 words + 6 short sentences,
  each with `hanzi`, `pinyin` (tone marks, for display), `meaning`, and
  `level`. Sentences are tagged `kind: "sentence"` and used only for the
  reading-aloud drill; words are `kind: "word"` and used for listening,
  pinyin-writing, and speaking.
- `src/speechUtils.jsx` — shared TTS/recognition helpers: `getVoicesAsync`
  (voice lists load async in most browsers) + `pickMandarinVoice` (prefers
  `zh-CN`, falls back to any `zh*` voice), `speak(text, voice)`,
  `normalizePinyin` (strips tone-mark diacritics via NFD decomposition, then
  a combining-marks regex built from `String.fromCharCode(0x0300)` through
  `String.fromCharCode(0x036f)` — **deliberately not written as a literal
  backslash-u escape sequence in source**, because hand-editing tools kept
  silently corrupting that escape (into raw invisible Unicode characters, or
  a doubled backslash) when this file was edited; the numeric-char-code form
  sidesteps the whole bug class — see the comment above `DIACRITICS_RE`),
  `normalizeHanzi` (strips punctuation/whitespace for recognition-transcript
  comparison), `isRecognitionSupported`, `createRecognizer`.
- `src/MandarinModule.jsx` has a home hub (level filter + 5 activity cards)
  plus five practice views, all reading from the same level-filtered pool
  (falls back to the full unfiltered list if a level+kind combo has too few
  items for a drill):
  - **聆聽練習 (Listening)** — MC via the shared `QuestionBlock`: TTS speaks
    a word (auto-plays on question change, plus a 🔊 重播 replay button),
    child taps the matching hanzi from 4 options.
  - **拼音默寫 (Pinyin writing)** — free-text input, checked via
    `normalizePinyin` so tone marks aren't required (types "nihao" or
    "ni3hao3", both match "nǐ hǎo").
  - **朗讀練習 (Reading aloud)** / **說話練習 (Speaking)** — share one
    `SpeechDrill` component (sentences vs. words is the only difference):
    🔊 播放示範 (TTS model playback), 🎙️ 開始錄音 (attempts
    `SpeechRecognition`, `lang: "zh-CN"`, comparing the transcript to the
    target via `normalizeHanzi`), and an always-visible manual "我已經讀了"
    fallback. Mirrors `english-ops`'s Speaking-module reliability pattern:
    explicit `getUserMedia` permission request before starting recognition,
    try/catch around `rec.start()`, a 7-second hard timeout, graceful
    messages (書面語, not colloquial — see the register note near the top of
    this file) for every failure path — denied mic, unsupported browser,
    recognition error, or timeout. Manual
    fallback answers count toward `attempts` but not `correct` (self-report,
    ungraded — there's no way to verify pronunciation without a real
    recognition match).
  - **拼音輸入法 (Pinyin IME)** — added after user feedback asking for a
    section teaching how to type Chinese via pinyin (distinct from 拼音默寫,
    which only tests knowing a word's pinyin spelling). Content lives in
    `src/content/pinyinImeContent.jsx`: a foundational **`PINYIN_IME_BASICS`**
    card (added after a follow-up review found the intro "開門見山" jumped
    straight to the typing mechanic without ever explaining what pinyin
    *is* — a real gap for a complete beginner), then the operational intro
    (`PINYIN_IME_INTRO`, `PINYIN_IME_EXAMPLE`, `PINYIN_IME_WHY_CANDIDATES`),
    both shown via `PinyinIMEIntro` before the drill, then
    `PINYIN_IME_HOMOPHONE_ITEMS` (13
    items) — each a `clue` sentence with a blanked character, that
    character's toneless `pinyin`, and 4 `candidates` (real 同音字 —
    homophones sharing that *exact* toneless spelling) including the
    `correct` one. `PinyinIMEDrill` runs each item as **two stages**: type
    the toneless pinyin (free text, checked via `normalizePinyin`, same as
    拼音默寫), then — simulating what a real pinyin IME does next — pick the
    right character from the candidate list via `QuestionBlock` (built
    inline as `{prompt, options, correctIndex}`). Both stages count toward
    `moduleProgress.mandarin.practiceStats` (`totalSteps = questions.length * 2`).
    **Every candidate set must share the exact same toneless pinyin as the
    target** — this is what makes the drill realistic (in real pinyin IMEs,
    homophone confusion is the whole reason candidate lists exist), so
    verify any new item's candidates the same way before adding them.
  - **`PINYIN_IME_BASICS`** covers three things, deliberately non-overlapping
    with `EXAMPLE` (demonstrates picking a candidate for a whole word) and
    `WHY_CANDIDATES` (explains 同音字): (1) `whatIsPinyin` — pinyin is a
    romanization system for Mandarin pronunciation, not English spelling;
    (2) `syllableStructure` + `examples` (an array, currently 好=h+ao and
    媽=m+a) — a syllable is 聲母 (initial, consonant-like) + 韻母 (final,
    vowel-like); (3) `toneNote` — clarifies that "不需要輸入聲調" in this
    drill means typing bare romanized letters only, no tone-mark diacritics
    (ā/á/ǎ/à), not that pinyin itself lacks tones. If adding more example
    syllables, keep the `{ syllable, initial, final, char }` shape so
    `PinyinIMEIntro`'s render (splits into 聲母/韻母 tiles) doesn't need
    changes.
  - Verified end-to-end in-browser including the mic-denied path (this
    sandbox has no real microphone) — confirms the catch block engages
    cleanly with no console errors, not just that the code looks right.
- No level-tiering scaling logic beyond filtering which pool items are
  eligible — difficulty comes entirely from which items are in the content
  file at each level, same as Modules 1–2.

## Module 5 details — 成語學習 (built, expanded four times after user feedback)
- Content: `src/content/idiomContent.jsx` — **696 idioms total** (653 + 58 added by 階段 8b = 711, then −15 +0 by 階段 8d — see "階段 8d" at the end of this file; **270 carry `origin`**: 158 + 54
  補上 + 58 new — see "階段 8b" at the end of this file; the tier descriptions below describe the 653 before 8b). Three tiers
  of depth, all sharing the same base fields (`idiom`, `pinyin`, `level`,
  `meaning`, `clue`):
  - **The original 39** (curated, first expansion) additionally carry
    `origin` (the story/背景, deliberately never names the idiom itself —
    see below) and, for 15 of them, `annotations` (rare/multi-reading
    character Cantonese pronunciation notes, individually verified via
    jyut.net — see the notes further down, unchanged from before).
  - **495 more** (second, much larger expansion — user feedback explicitly
    asked for "at least 500-800 成語" and, when asked whether to keep full
    per-item depth or push for volume, **chose volume over depth**) use a
    **lighter schema**: only `idiom`/`pinyin`/`level`/`meaning`/`clue`, no
    `origin` or `annotations`. This was a deliberate, user-approved
    trade-off — see the two `AskUserQuestion` answers in this session:
    "Push for 500-800, minimal depth" and "Enhance current MC game
    (recommended)" (not a full crossword-puzzle engine). Because pinyin for
    ~500 idioms couldn't each be individually externally verified the way
    the smaller curated set was, treat this batch's pinyin as best-effort
    rather than dictionary-checked — spot-check before relying on any
    single entry for teaching a hard reading.
  - **119 more** (third expansion, "修改要求4" — user compared `IDIOM_ITEMS`
    against a real P6 chengyu textbook's table of contents, organised by
    stroke count, and named 122 specific idioms present in the textbook but
    missing here). Unlike the 495-item lighter-schema batch, this tier
    **does carry `origin`**, and every `meaning`/`origin` pair was
    individually web-verified (not written from memory) against Taiwan's
    Ministry of Education 《成語典》 (dict.idioms.moe.edu.tw) and/or 漢典
    (zdic.net), per the user's explicit no-fabrication instruction for this
    batch ("每個成語嘅 meaning、origin 一定要上網核實，唔好靠記憶老作"). All
    119 are tagged `level: "p6"` per user instruction (no per-item level
    judgment). 3 of the user's original 122 named idioms were skipped as
    variant-character duplicates of existing entries, confirmed via
    `AskUserQuestion` (user chose to skip rather than add near-duplicates):
    卧薪嘗膽/**臥薪嘗膽** (already present), 螳臂擋車/**螳臂當車** (already
    present), 鷸蚌相持/**鷸蚌相爭** (already present) — bold form is the one
    already in the file.
  - **`origin` and `annotations` are both optional now** — `IdiomDetail` in
    `IdiomModule.jsx` renders the 出處及故事 card and the 難字讀音 card only
    `{item.origin && (...)}` / `{item.annotations && (...)}`. Don't assume
    every idiom has a background story; most of the 495-item lighter-schema
    batch don't (the 119-item batch above does).
  - **No idiom in this file may contain a comma or non-4/5/6-character
    punctuation** — the practice game's fill-the-missing-character question
    blanks out one character by array index (`item.idiom.split("")`), so a
    comma-containing phrase (e.g. a two-clause proverb like
    "頭痛醫頭，腳痛醫腳") would sometimes blank the comma itself. One such
    entry was caught and removed during content review; check for this
    before adding idioms outside the standard 4-character form.
  - Level split heuristics: the 495-item batch spans 94×p5, 194×p6, 246×s1
    (heuristic difficulty judgment, not individually reasoned per item like
    the original 39); the 119-item batch is entirely `p6` per explicit user
    instruction, not a difficulty judgment call.
- **`pinyin` (Hanyu Pinyin, with tone marks, one space-separated syllable
  per character)** — the one-syllable-per-character spacing convention is
  load-bearing: `CharacterPinyinCard` in `IdiomModule.jsx` does
  `item.pinyin.split(" ")` and zips it against `item.idiom.split("")` to
  render the per-character pinyin/hanzi tiles (see below) — breaking that
  1:1 spacing on a new entry will misalign the display.
- **`annotations` (optional array of `{term, jyutping, meaning}`)** — added
  for idioms containing a genuinely rare character or a character whose
  Cantonese reading changes with meaning, per user feedback asking for
  pronunciation teaching (their example: 櫝 in 買櫝還珠, verified `duk6`).
  15 of the 39 idioms carry this field, e.g.:
  - Rare characters: 竽(jyu4, 濫竽充數), 璧(bik1, 完璧歸趙), 荊(ging1,
    負荊請罪), 釜(fu2, 破釜沉舟), 顰(pan4, 東施效顰), 螳(tong4, 螳臂當車),
    邯鄲(hon4 daan1, 邯鄲學步), 鷸/蚌(wat6/pong5, 鷸蚌相爭), 狽(bui3,
    狼狽為奸), 諱(wai5, 諱疾忌醫), 罄(hing3, 罄竹難書)
  - **Multi-reading characters** (same character, different Cantonese
    reading depending on meaning — arguably the most valuable "how to
    speak" teaching of the batch): 好 reads `hou3` when it means "to like"
    (葉公好龍) vs `hou2` for "good"; 塞 reads `coi3` for "frontier/fortress"
    (塞翁失馬) vs `sak1` for "to block"; 彈 reads `taan4` for "to play [an
    instrument]" (對牛彈琴) vs `daan6` for "bullet". Each annotation states
    the contrast explicitly, not just the reading in isolation.
  - **Every reading here was verified via a live Cantonese pronunciation
    dictionary (jyut.net) before being added** — this rigor applies to the
    original 39's `annotations` specifically; it was not repeated for the
    495-item lighter-schema batch (see above), since the user explicitly
    chose volume over per-item depth for that batch.
- **`origin` never names the idiom, and `clue` is written distinctly from
  `meaning`** — both are deliberate: the guessing game prompts from `clue`,
  not `origin`, but chengyu origin stories conventionally end with "...後人
  就用『XX』來比喻" (naming the idiom) — if `origin` text is ever reused as a
  game prompt later, it would leak the answer. Keep origin text
  idiom-name-free when adding more entries with this field.
- `src/IdiomModule.jsx` has three views (list/detail/practice, same shape as
  Modules 1–2):
  - **list** — level filter chips, a `MasteryBadge` (see below), scrollable
    list, tap to open
  - **detail** — `CharacterPinyinCard` (per-character pinyin-over-hanzi
    tiles, plus 🔊 普通話 / 🔊 粵語 pronunciation buttons — see below),
    meaning, 難字讀音 (annotations, if present), origin story (if present),
    "開始成語猜猜" button
  - **practice** — an 8-question "成語猜猜"-style mixed game, all
    tap-to-select (idioms are one of the modules where free typing is
    *not* appropriate, per the design brief): guess-the-idiom-from-clue
    (`clue` shown, 4 idiom options), match-idiom-to-meaning (idiom shown,
    4 meaning options), and fill-the-missing-character (one character of
    the idiom blanked, 4 character options sampled from other idioms'
    characters). Same score-screen/persistence pattern as earlier modules;
    results go to `moduleProgress.idiom.practiceStats`.
- Like Modules 1–2, questions are generated at runtime from the content
  fields (no hand-authored "questions" array) — adding more idioms only
  requires the base fields (`idiom`, `pinyin`, `level`, `meaning`, `clue`);
  `origin`/`annotations` are optional extras, not required.
- **`CharacterPinyinCard`** (in `IdiomModule.jsx`) renders one tile per
  character (pinyin syllable above, hanzi below) plus the shared
  `AudioButtons` component (see the shared-primitives note near the top of
  this file), in the style of the reference idiom-app screenshots the user
  shared. `pickCantoneseVoice` (falls back to any `zh*` voice if no
  `zh-HK` voice is installed) and `speak(text, voice, fallbackLang)`'s
  third parameter were both added to `speechUtils.jsx` for this feature —
  `AudioButtons` was originally written inline here, then extracted once
  Poetry and History needed the same read-aloud capability.
- **科舉 scholarly-title mastery badges, now stage-based (not
  correctness-gated)** — after building this once against raw correct-answer
  count, it was reworked when the idiom bank/game redesign request
  explicitly asked for a "complete level N" style like the reference
  screenshots (完成第X關), where a finished session always advances
  progress regardless of score. `MASTERY_TIERS` in `idiomContent.jsx` is
  now `{ minStages, title, emoji, blurb }` spanning 童生 → 秀才 (3) → 舉人
  (8) → 進士 (15) → 探花 (25) → 榜眼 (40) → 狀元 (60), where a "stage" is
  one completed practice session, not one correct answer.
  `getIdiomMasteryTier(stagesCompleted)` / `getNextIdiomMasteryTier(...)`
  work the same as before, just re-keyed. `IdiomModule.jsx`:
  - `stagesCompleted` is derived, not stored separately:
    `Math.floor(practiceStats.attempts / QUESTION_COUNT)` — safe because
    `Storage.recordPracticeResult` always adds the full `total` (here always
    `QUESTION_COUNT`) to `attempts` regardless of how many were answered
    correctly, and `QUESTION_COUNT` (8) is a module-level constant shared by
    `IdiomModule` and `PracticeSession`. If `QUESTION_COUNT` ever changes,
    stage counts computed from *old* `attempts` history will shift
    retroactively — that's expected, not a bug, since stages are always
    reconstructed from raw attempts rather than persisted directly.
  - Shows a `MasteryBadge` card (current tier + emoji + blurb + "再完成 N
    次練習，即可晉升為「X」！") on the list view, computed from
    `priorStages` (before the current session).
  - On the practice completion screen, compares the tier at `priorStages`
    vs. `priorStages + 1` (always +1, not +correctCount, since finishing a
    session — right or wrong — always advances one stage); if they differ,
    shows the level-up congratulation ("恭喜！你晉升為「X」了！") with the
    new tier's emoji instead of the generic "練習完成！" message.
  - `practiceStats` is passed into `IdiomModule` from `Root.jsx` (the only
    module with a badge derived from cumulative stats) — follow this same
    prop-threading pattern rather than reading localStorage directly inside
    a module, if another module gets a similar reward system.
  - Verified end-to-end in-browser after the rework: badge renders the
    right tier/progress text, and forcing `practiceStats.attempts` to 16
    (2 stages) then completing one session — **deliberately answering only
    2 of 8 correctly** — still produced "恭喜！你晉升為「秀才」了！",
    confirming progression is stage-gated, not correctness-gated. No
    console errors on list, detail (including the 🔊 buttons), or practice
    views.

## Module 6 details — 中國歷史故事 (built, expanded twice after user feedback)
- **This module works differently from Modules 1/2/5** — per spec ("simple
  comprehension questions after each story"), it does NOT auto-generate a
  randomized cross-story quiz. Each story carries its own fixed
  `questions` array (hand-authored, since facts are unique per story),
  answered in a straight read-then-answer flow: list → read the story →
  answer that story's own questions → completion summary → back to list.
- Content: `src/content/historyContent.jsx` — **36 stories** (10 original +
  10 s1-level additions from the first expansion + **16 more p5/p6-level
  additions** from a second expansion — user feedback said p5/p6 coverage
  was "too little, too simple, at least 20-30 sample", and the original
  8 p5/p6 stories fell well short). Level split: **12×p5, 12×p6, 12×s1**
  (24 combined p5+p6, within the requested 20-30 range). Each item is
  tagged `level: "p5"|"p6"|"s1"` with `title`, `period`, `story`, and a
  fixed `questions` array (2–4 items each; every question is
  `{ prompt, options, correctIndex }`, same shape `QuestionBlock` expects
  elsewhere).
  - The **original 10** are simple children's-story/fable style (大禹治水,
    孟母三遷, 曹沖稱象, 司馬光砸缸, 木蘭代父從軍, 烽火戲諸侯, 三顧茅廬,
    荊軻刺秦王, 貞觀之治, 岳飛精忠報國) — kept for p5/p6 variety.
  - The **10 s1 additions** (first expansion) are deliberately
    secondary-school-level political/military history rather than fables —
    reforms, wars, and dynastic turning points, with comprehension
    questions that probe cause-and-effect/significance, not just plot
    recall: 商鞅變法, 秦始皇統一六國, 鴻門宴, 赤壁之戰, 淝水之戰, 玄武門之變,
    安史之亂, 王安石變法, 鄭和下西洋 (p6 — the one gentler entry in this
    batch), 靖康之難. All 9 of the harder ones are tagged `s1`.
  - The **16 p5/p6 additions** (second expansion) are well-known,
    kid-friendly fables/mythology/simple history episodes distinct in tone
    from the s1 batch: 8×p5 (精衛填海, 女媧補天, 后羿射日, 孔融讓梨, 鐵杵磨成針,
    卧冰求鯉, 望梅止渴, 鑿壁偷光 — mythology + moral fables) and 8×p6 (程門立雪,
    囊螢映雪, 田忌賽馬, 完璧歸趙, 負荊請罪, 樂不思蜀, 卧薪嘗膽, 文成公主入藏 —
    slightly more history-context but still simple). Some of these overlap
    in subject with Module 5's idiom bank (e.g. 完璧歸趙, 負荊請罪, 卧薪嘗膽,
    望梅止渴 also exist as idioms) — that's intentional cross-module reuse
    at different depth, not a conflict to resolve.
- `src/HistoryModule.jsx` has three views: **list** (level filter chips) →
  **story** (read the story, `AudioButtons` reading `item.story` aloud —
  added after user request, same shared component as Module 1, "開始問答"
  button) → **questions** (renders `item.questions` via the shared
  `FixedQuizFlow` — see the QuizQuestion.jsx note above; this used to be a
  hand-rolled copy of that stepping logic before Module 7 needed the
  identical shape and it got extracted). Results go to
  `moduleProgress.history.practiceStats`.
- Adding more stories requires writing that story's own 2–4 questions by
  hand (unlike Modules 1/2/5, there's no generic field this module can
  auto-derive questions from — the whole point is testing comprehension of
  facts specific to that one story).

## Module 7 — 閱讀理解 REBUILD (COMPLETE: 22 passages in phases 1+2, +12 in 階段 7 C 批 = 34)
User asked for a full rebuild modelled on real textbooks (樂思 P.6 26週 and
領先中文 閱讀理解50篇 小五; the user shared screenshots of both): longer
passages, and a two-part question set with tagged skills and marks. Phase 1
= 6 sample passages (approved); Phase 2 = the other 16. **All 22 passages
now use the new format and ids end `-v2`; the old-format `questions` /
`FixedQuizFlow` branch in ReadingModule.jsx is dead code kept as a fallback.**
Not yet committed/pushed until the user says so.
- Passage fields: `passage` (array of paragraphs, shown with ①②③; an entry is a string, or — 階段 8a, see below — `{ text, align: "right", numbered: false }`),
  `genre`, `focus` (學習重點), `vocab` (詞語角), `comprehension` (理解能力)
  and `language` (語文能力). Question `kind`: `mc` (4 options) | `multi`
  ("哪兩項", 5 options, answer = 2 indices, all-or-nothing) | `open`
  (申述題); each has `skill` (重整/解釋/伸展/評鑑; language: 成語解釋/詞語解釋/
  修辭手法/詞語運用/語文運用/說明方法/文言句意) and `marks`.
  `mc`/`multi` have `answer` + `explanation`; `open` has `points`,
  `scheme`, `modelAnswer`, `hint`. Every passage: 6–7 理解 questions
  (mc + 1 multi + 1–2 open) and 3 語文 mc; total 11–15 marks.
- `ReadingModule.jsx`: options of mc/multi are **shuffled once per attempt**
  (`shuffleOptions`, answer remapped) so authored answer positions don't
  leak — never write explanations that refer to option letters (A/B/C).
  Open questions are **self-marked**: the child writes an answer (optional),
  reveals the reference points + model answer, then rates themselves
  全部答到 / 答到一部分 (ceil(marks/2)) / 未答到. Score is in marks;
  `onFinish(fullMarkQuestions, totalQuestions)` feeds per-passage mistake
  tracking (perfect = every question full marks). Mistake ids of retired
  passages are ignored (`liveMistakes`).
- Word counts (漢字, excl. punctuation): p5 399–537, p6 484–702, s1 596–745.
- Facts web-verified before writing: cats sleep 12–16 h and are crepuscular;
  HK water (Dongjiang ~70–80%, seawater flushing); 大館 (see above);
  rainbow (refraction–reflection–refraction, sun behind observer, 副虹
  reversed); stars invisible by day due to atmospheric scattering; HK tram
  opened 30 Jul 1904, ~13 km Kennedy Town–Shau Kei Wan, 165 double-deckers,
  only all-double-deck tram system, first double-deckers 1912; hiccups
  (diaphragm spasm, glottis closes; >48 h → see doctor); 曾子殺彘
  (《韓非子·外儲說左上》「嬰兒非與戲也」) and 《論語·為政》「人而無信，不知其可也」;
  防騙易 18222 (ADCC, consultation only; report at police station);
  MIT/Science 2018 fake-news study (126,000 cascades, six fact-checkers, false
  news ~70% more likely retweeted, ~6× faster to 1,500 people, humans not bots).
  Story passages (記敘文) are fictional; 荀子「鍥而不舍，金石可鏤」 and the
  李白「鐵杵磨成針」 legend are quoted as 相傳.

### 階段 7 C 批 — 閱讀理解 22 → 34 passages (小五 12 / 小六 10 / 中一 12) — reviewed and approved by the user, MERGED into master (with one follow-up: moca-li-de-liang-mian-v2 C4 option 「工程師」→「人類」)
Content-only change (`readingContent.jsx`, `tests/content.test.js`, this file; `ReadingModule.jsx` untouched — nothing there depends on
the `genre` string, it is only displayed). Ids end `-v2`. Format identical to the other 22 (`passage` paragraphs, `focus`, `vocab` 2 (小五) / 3
(小六, 中一), `comprehension` 6 (小五) / 7, `language` 3; every passage has mc + multi + open; skills only from the existing names).
- **New `genre` values** (displayed as 「小五 · 實用文（通告）」): 實用文（通告）, （書信）, （電郵）, （建議信）. 實用文 passages are 300–500 字; the rest
  follow 小五 450–620 / 小六 540–810 / 中一 690–850.
  - **How 實用文 renders (updated by 階段 8a):** every notice / letter part (稱呼, 結語, 祝頌語, 主旨 …) is its own `passage` entry with its own ①②③ number and
    counts in "第 N 段"; the last two entries (署名, 日期) are `{ text, align: "right", numbered: false }` — right-aligned, no number, not counted.
- **The 12:** 小五 — 閱讀嘉年華通告, 給小欣的慰問信, 小廚師的第一碗麵 (記敘文), 樹木的年輪 (說明文). 小六 — 查詢參觀回收中心的電郵, 外公的算盤 (記敘文), 海水為甚麼是鹹的,
  紙的故事 (說明文). 中一 — 建議舉辦舊物交換日 (建議信), 摩擦力的兩面, 指南針與磁偏角 (說明文), 寬容不是軟弱 (議論文). The 記敘文 and 實用文 are fictional (the
  names 新苗小學, 綠田回收中心 and all people are invented; dates are fictional and every 星期 matches the real 2026 calendar).
- **Facts the 說明文 / 議論文 rely on** (kept to what does not change; checked against general references and, where noted, a web search in this session):
  - 年輪: 形成層 adds a ring of new wood each year; 春季至初夏 wood is larger-celled and lighter, 夏末和秋季 smaller-celled and darker, growth mostly pauses in 冬季; one light + one dark = one year in
    places with distinct seasons; ring width reflects drought / cold; the 生長錐 takes a core without felling (web search confirmed increment boring and that
    many tropical trees have no clear annual rings).
  - 海水: average salinity ≈ 35 g per kg (3.5 %); 氯化鈉 is the largest part; salts come from rock weathering carried by rivers and from the sea floor
    (volcanoes, hot springs); evaporation removes water, not salt; a part of the salt is removed again by settling into sea-floor sediment (no claim about organisms taking up salt — an independent review found that overstated); salinity differs by region (higher where evaporation is strong, lower where rivers / meltwater
    enter); 死海 has no outlet and is far saltier, so a person floats; ocean salinity is roughly steady over long times (web search confirmed 35 ‰, NaCl ≈ 85 %
    and the steady-state view).
  - 紙: 《後漢書．蔡倫傳》 — 蔡倫 used 樹膚, 麻頭, 敝布, 魚網; 元興元年 (105) he presented it, and it was called 「蔡侯紙」 (web search confirmed the quotation and the
    date); paper fragments older than 蔡倫 have been found in Han-dynasty sites and tombs (web search: Lop Nur 1933, Xi'an 1957, Juyan 1973–74 — which is why the text
    says 「遺址和墓葬」); 學富五車 comes from 《莊子．天下》 on 惠施 「其書五車」; paper reached 朝鮮, 日本 and, via 中亞 / 阿拉伯, 歐洲, where it replaced parchment.
  - 摩擦力: roughness at microscopic level, friction opposes relative motion; tyre treads clear water; brake pads wear; rubbing hands makes heat; sand on ice and
    pressure raise friction; lubricant, rolling and ball bearings lower it; hovercraft and maglev reduce contact friction.
  - 指南針: Earth acts like a giant magnet; the needle points to magnetic north, which differs from true north by the 磁偏角, which varies with place and slowly with time;
    司南 is in ancient books and is generally thought to be a lodestone device; 沈括 《夢溪筆談》 describes magnetising a needle by rubbing it on a lodestone and the
    declination (「常微偏東，不全南也」); 朱彧 《萍洲可談》 records compass use at sea on overcast days (web search confirmed both books and that 《萍洲可談》 is
    regarded as the earliest such record). **The exact wording of the two quotations and of 《萍洲可談》 was not found verbatim in the search results — the user
    should compare them with a 點校本.**
  - 寬容: 《史記．廉頗藺相如列傳》 — 完璧歸趙, 澠池之會, 藺相如 made 上卿 above 廉頗, 廉頗's threat, 藺相如 avoiding him, the speech 「先國家之急而後私仇」 (web search
    confirmed the speech; the 「引車避匿」 and 「位在廉頗之右」 details were not re-found in the search), 負荊請罪, 刎頸之交 (written 「生死與共的好朋友」).
- **Checks (tests/content.test.js, 33 tests now):** 34 passages / unique ids / 12-10-12; passage array; vocab terms occur in the passage; known skill, positive marks;
  mc 4 / multi 5 distinct options and valid answers; explanations; open has hint / points / scheme / modelAnswer and marks ≤ number of points; every 「第 N 段」 ≤ the passage's
  paragraph count; for the 12 new ones also the genre per level, question counts, kinds, explanation cites a paragraph, `scheme` says 「共 N 分」 and the length in 字.
  Three things in the OLD 22 do not meet the strictest rule and were left alone on purpose (listed in the test file): vocab 「防騙易18222」 (wangluo-xianjing-v2) and
  「心裏打鼓」 (chengshi-de-xuanze-v2) are written differently in the passage, and baoyu-wenhua-yichan-v2 has a 3-mark open question with 2 reference points.
- Answer positions of the new mc questions were balanced (about 20 per slot over the four slots) although the module shuffles options anyway.
- A read-only independent review of the 12 passages (answer keys, 「第 N 段」, facts, 書面語) found no wrong key; its minor points were applied (e.g. 「請用自己的話」, 「試想一想」, 「逐漸被廣泛使用」, 通告 signed 「新苗小學校長」, no repeated 學富五車 question).

### 階段 8a — 實用文 署名 / 日期 right-aligned and un-numbered (reviewed and approved by the user, MERGED into master)
- `ReadingModule.jsx` (`PassageDetailA2` only): a `passage` entry may now be a string (as before) **or** `{ text, align: "right", numbered: false }`. Un-numbered entries
  get `textAlign: "right"` and no circled number; the number counter only advances on numbered entries, so the other paragraphs keep ①②③… exactly as before.
  String-only passages render the same DOM as before (the old-format hashes are identical to `bb37b25`). The old string-passage fallback is untouched.
- Content: only the four 實用文 use it (their last two entries): 閱讀嘉年華通告 (8 numbered + 署名 + 日期), 給小欣的慰問信 (7 + 2), 查詢參觀回收中心的電郵 (8 + 2),
  建議舉辦舊物交換日 (7 + 2). The 結語 「特此通知」 / 「此致　敬禮！」 stays numbered. None of the other 30 passages (incl. the original 22, which contain no
  notice / letter / email) has an object entry. No question, hint or explanation pointed at 署名 / 日期 by 「第 N 段」, so no text had to change.
- Tests (`content.test.js`, 35): an un-numbered entry has exactly the keys `text / align / numbered` with `align: "right"`, sits in the last two positions with no numbered paragraph after it;
  every 實用文 has exactly two, no other genre has any; 「第 N 段」 must be ≤ the number of **numbered** paragraphs; vocab / length checks read `text` of object entries.
- **If a new 實用文 is added:** write the 署名 and 日期 as the last two entries in this object form; "第 N 段" then counts only the numbered ones.

## Module 7 details — 閱讀理解 (built, expanded after user feedback; describes the OLD format)
- **Same flow shape as Module 6** (list → read → `FixedQuizFlow` → summary),
  reusing the same shared component — see the QuizQuestion.jsx note above.
- **"Short answer" is implemented as inference-flavoured multiple-choice,
  not free-text typing** — this is a deliberate reconciliation of a tension
  in the spec: the module's own bullet list says "multiple choice, short
  answer", but the app-wide design brief says modules 1/2/5/7/8/9 should
  avoid free typing (the child can't type Chinese fluently). Since typing
  is fine in `english-ops` (an English app — the child *can* type English),
  but not here, each passage's questions are tagged `type: "recall"` (literal
  understanding) or `type: "inference"` (the "why"/reasoning kind of
  question a short-answer field would normally probe), both rendered as
  4-option MC. If this reconciliation ever turns out to be wrong (i.e. the
  user actually wants typed short answers here), that's a deliberate
  decision to revisit, not a bug.
- Content: `src/content/readingContent.jsx` — **22 passages** across three
  expansion rounds, each tagged `level: "p5"|"p6"|"s1"` with `title`,
  `passage`, and a fixed **5-question** `questions` array (3 `recall` + 2
  `inference` per passage).
  - Round 1 (8→16 passages): user feedback called the original 8 "too
    easy", asked to level up and lengthen. The 8 new passages are longer
    (~200–350 characters vs. the original ~100–250) and cover more mature,
    secondary-level themes — cyberbullying, community service, academic
    honesty, water conservation, resilience after failure, heritage
    conservation, misinformation online, and teamwork — skewing p6/s1
    rather than p5.
  - Round 2 (3→5 questions per passage): a later round of feedback said
    this module had "too little question"; every one of the 16 passages at
    the time got the same +1 recall/+1 inference treatment, so the passage
    count didn't need to grow, only the question depth per passage.
  - Round 3 (16→22 passages, all p5): a code-review pass found (a) 7
    passages where two of the five questions substantively overlapped
    (tested the exact same fact/moral just reworded — not merely similar
    wording, but no distinct information point), and (b) the level split
    was unbalanced (2×p5 vs 6×p6 vs 8×s1). Fixed by: rewriting the
    duplicate half of each overlapping pair to test a genuinely different
    angle (a different fact, a "what if" counterfactual, or a character's
    emotional arc instead of restating the same "moral of the story"), and
    adding 6 new p5 passages (彩虹的秘密, 貓咪為什麼經常在睡覺, 星星為什麼只
    在晚上出現, 香港的叮叮車, 蜜蜂的重要工作, 為什麼會打嗝) — deliberately
    informational/science/local-culture topics rather than more
    moral-story fiction, since the existing passages (across all levels)
    already clustered heavily around 助人/誠實/堅持/換位思考-style themes.
    **The 香港的叮叮車 passage's facts (1904 opening, Hong Kong Island-only
    route, originally single-deck, "叮叮" nickname from the bell) were
    verified via web search before writing** — same rigor this project
    applies to any fact/reading that isn't common knowledge (see Module
    1/3/5's verification notes) — don't assume a fact like this is safe to
    write from memory without the same check.
  - **When rewriting an "overlapping question," change what fact/angle is
    being tested, not just the wording** — two questions with different
    phrasing but the same underlying answer content are still duplicates
    from the child's perspective. Recall questions were shifted at the
    same distinct level of angle (a different named detail, not just a
    reworded time), and duplicate inference questions were shifted toward
    counterfactuals ("如果...就會...") or character-growth framing rather
    than re-asking "what's the moral of the story" a second time.
  - Round 4 (same 22 passages, prompt-only rewrite): a further review found
    that Round 3's fix hadn't gone far enough — across the passages
    untouched by Round 3, one inference question per passage was still a
    generic "一句萬能問題" reused near-verbatim: "這個故事想帶出什麼道理？"
    (5×), "這個故事想帶出什麼訊息？" (3×), plus near-duplicate variants
    "這個故事最想帶出什麼道理/訊息？" and "...想提醒讀者什麼？" (5× more,
    including one **within-passage** duplicate this review caught in
    `wangluo-shijie-de-xianjing` that Round 3 had missed — its Q3 and Q5
    were both "network safety" advice questions with the same underlying
    answer). All 13 were rewritten to test something specific to that
    passage: a character's motivation, what a specific action/quote reveals
    about someone's personality, or a counterfactual grounded in a named
    detail — never a template question that could be dropped into any
    other passage unchanged. **This is the real test for "is an inference
    question generic": could this exact prompt be copy-pasted into a
    different passage in this file and still make sense?** If yes, it needs
    a detail specific to this passage folded into the question itself (a
    character's name, a quoted line, a specific action), not just reworded
    to sound different.
  - All content is original, not adapted from any existing copyrighted
    text.
- `src/ReadingModule.jsx` mirrors `HistoryModule.jsx`'s structure closely
  (list/passage/questions) — if the two ever drift in behavior, that's
  worth reconciling rather than treating as two independent designs.

## Module 8 details — 修辭手法 (built, expanded twice after user feedback)
- **Back to the "generated at runtime" pattern** (Modules 1/2/5), not the
  fixed-per-item pattern (Modules 6/7) — "identify the device used in a
  sentence" is naturally multiple-choice, so there's no typing-vs-spec
  tension like Module 7 had, and no need for hand-authored questions.
- Content: `src/content/rhetoricContent.jsx` — two separate arrays:
  `RHETORIC_DEVICES` (10 devices — 比喻, 擬人, 誇張, 對偶, 排比, 反問, 設問, 反覆, 引用, 對比 —
  each with `id`, `name`, `definition`, `tip`, `examples`, and (added in the
  second expansion) `effect` — a one-sentence explanation of *why* a writer
  would use this device, used by the new effect-question type below; this
  is the reference material, studied via list → detail) and
  `RHETORIC_PRACTICE_SENTENCES` (**200 sentences, 20 per device** — expanded
  from 21 → 42 → 63 → 105 → 200 across rounds of "too easy" feedback, tagged
  `device` + `level`, **deliberately distinct from `DEVICES`' own example
  sentences** so practice isn't just rote memorization of what was just
  read). The newest 3-per-device batch deliberately avoids the obvious
  keyword giveaways the earlier batches sometimes had (e.g. 反問 sentences
  no longer all start with "難道", 比喻 sentences aren't always flagged by
  "像"/"如") so the quiz can't be solved by pattern-matching one signal word.
- **Two question types now, alternating** *(superseded by 階段 9a — five kinds, 15 questions, built in `src/rhetoricQuiz.jsx`; see the end of this file)* (`RhetoricModule.jsx`'s
  `buildQuestions`): the original `buildDeviceQuestion` ("這句運用了什麼修辭
  手法？", 4 device-name options) and a new `buildEffectQuestion` ("這樣寫有
  什麼作用？", 4 `effect` strings sampled from `RHETORIC_DEVICES` as
  distractors) — added because "identify the device" alone was judged too
  easy; the effect question tests understanding of *why* the device works,
  not just keyword pattern-matching.
- `src/RhetoricModule.jsx` has three views: **list** (the 10 devices) →
  **detail** (definition, tip, examples, "開始練習" button) → **practice**
  (15-question quiz of five kinds generated from `RHETORIC_PRACTICE_SENTENCES` by `rhetoricQuiz.jsx` (階段 9a), filtered
  by the level chips on the list screen). Results go to `moduleProgress.rhetoric.practiceStats`.
- 反問 vs 設問 are commonly confused in Chinese-language teaching generally —
  keep their examples/practice sentences unambiguous (設問 must show a clear
  question immediately followed by its own answer; 反問 gets no answer at
  all) if adding more.

## Module 9 details — 標點符號練習 (built, expanded after user feedback)
- **Generated at runtime** (Modules 1/2/5/8's pattern), same reasoning as
  Module 8: "insert/correct punctuation" is naturally multiple-choice.
- Content: `src/content/punctuationContent.jsx` — `PUNCTUATION_MARKS` (10
  reference marks: 。，、？！：；「」——……, each with `usage` + `examples`,
  studied via list → detail) and `PUNCTUATION_PRACTICE_ITEMS` (**30 items**
  — expanded from an initial 20 after user feedback called it "too easy" —
  **two distinct shapes tagged by `kind`** — this is the part to understand
  before adding more):
  - `kind: "fill"` (21 items, single-character marks only: 。，、？！：；) —
    `before`/`after` around a blank, `markChar` is the answer. Distractors
    are sampled from *other fill items'* `markChar` only, so options are
    always same "shape" (single characters) — never mixed with a pair mark.
  - `kind: "identify"` (9 items, pair/multi-character marks: 「」——……) — a
    fully-punctuated `sentence` with `highlightedMark` (an exact substring,
    possibly a whole quoted clause) shown inline in a highlighted color;
    asks for the mark's **name**, not the mark itself. This sidesteps a
    real design problem: pair-mark segments differ wildly in length/content,
    so offering them as direct-replacement options (like `fill` does) would
    make the correct answer visually obvious by shape alone.
  - **Do not cross-pollinate the two `kind`s' distractor pools** — a
    single-char mark option next to a whole quoted clause is exactly the
    "obviously different length" giveaway this split was designed to avoid.
- `src/PunctuationModule.jsx` has three views (list/detail/practice, same
  shape as Modules 1/2/5/8): **list** (the 10 marks) → **detail** (usage,
  examples, "開始練習") → **practice** (8-question quiz mixing both `kind`s,
  dispatched via `item.kind` to the matching question builder). Results go
  to `moduleProgress.punctuation.practiceStats`.
- All 30 items were validated programmatically (not just eyeballed) for:
  exactly-one-occurrence of `highlightedMark` within its `sentence` (so the
  `.split()` blank-rendering never silently fails), and non-empty,
  self-excluding distractor sets for both `kind`s.

## Data model (localStorage key `chineseOps:v1`)
```
{
  level: "p5" | "p6" | "s1",
  moduleProgress: {
    <moduleKey>: {
      practiceStats: { correct: number, attempts: number },
      mistakes: string[]   // content-item ids — see 錯題重溫 below
    },
    // one entry per key in Storage.jsx's MODULES array (all 10 modules)
  },
  // added by 每日任務 (backup version 2) — details in that section:
  daily: { date: "YYYY-MM-DD", missions: [key, key, key], done: [key…] },
  streak: { count: number, lastDate: "YYYY-MM-DD" | null },
  streakFreezes: 0..2,
  stats: { daysCompleted, missionsCompleted, bestStreak, freezesUsed,
           perfectSessions, mistakesCleared, sessions: { <moduleKey>: number } }
}
```
All 10 modules use the same `{ practiceStats, mistakes }` shape (generated
generically from `MODULES` in `Storage.jsx`'s `defaultModuleProgress()`, not
hand-listed per key) — extend this data model with a new top-level field
(not a new per-module shape) if a future feature needs more than these two.
**Any new top-level field MUST be added to `normalizeGamification` (or a sibling
whitelist call in `sanitizeState`), otherwise it is silently dropped when a backup
is restored.** (The key is `chineseOps:test` instead of `chineseOps:v1` in 測試模式.)

## 錯題重溫 (Mistake Review) — cross-module feature
Built after user request ("any feature suggest?" → picked mistake review).
Tracks which content items a child has answered wrong and not yet answered
correctly since, and lets them specifically re-practice just those.
- **Data + Storage.jsx**: `moduleProgress[key].mistakes` is an array of
  content-item ids. `Storage.addMistake(state, moduleKey, itemId)` /
  `Storage.removeMistake(state, moduleKey, itemId)` return a new state with
  the id added/removed (no-op if already in the target state, so callers
  don't need to check first). `loadState()` migrates old saves missing
  `mistakes` by adding `[]` — don't assume it's always present on data saved
  before this feature shipped.
- **Root.jsx** exposes one generic `answerItem(moduleKey, itemId, isCorrect)`
  that calls `addMistake`/`removeMistake` accordingly, and passes
  `mistakes={state.moduleProgress[key].mistakes}` +
  `onAnswerItem={(itemId, isCorrect) => answerItem(key, itemId, isCorrect)}`
  into each of the 7 modules that implement this (see below). A **correct**
  answer always clears the mistake — including inside a review session
  itself — since either way the child has now demonstrated they know it.
- **Two implementation patterns**, matching the two question-generation
  shapes already documented per-module above:
  - **Runtime-generated modules (Poetry, Essay, Idiom, Rhetoric,
    Punctuation)** track mistakes at the *individual question's source
    item* level. Each `buildXQuestion` function now returns `itemId: item.id`
    alongside `prompt`/`options`/`correctIndex`. `buildQuestions(pool, count,
    chooseFrom)` gained a third parameter: `chooseFrom` (defaults to `pool`)
    is the set of items actually sampled via `sampleWithRepeats` and asked
    about, while `pool` is still passed to each builder for *distractor*
    generation. This split matters because a mistake set can be as small as
    1-3 items — sampling distractors from that same tiny set would run dry,
    so distractors always draw from the full unfiltered content array
    regardless of what's being reviewed. Each module's `PracticeSession`
    gained `chooseFrom`/`onAnswerItem` props; `selectOption` now also calls
    `onAnswerItem(q.itemId, correct)`. The list view computes
    `mistakeItems = useMemo(() => FULL_ITEMS.filter(it =>
    (mistakes||[]).includes(it.id)), [mistakes])` and shows a
    "練習錯題 (N) 📝" button (only when `mistakeItems.length > 0`) that calls
    `startPractice(FULL_ITEMS, mistakeItems)` — passing the *full* unfiltered
    array as `pool` (for distractors) and `mistakeItems` as `chooseFrom`,
    ignoring the current level filter so review always has enough
    distractor variety. The button's color is `amber` for every module
    except Essay (whose own theme *is* amber — that module's button uses
    `orange` instead, to stay visually distinct from "開始隨機練習").
  - **Fixed-per-item modules (History, Reading)** track mistakes at the
    *whole story/passage* level, not per-question — simpler because each
    `FixedQuizFlow` run already only ever tests one item's questions.
    `finishQuestions` calls `onAnswerItem(selectedItem.id, correctCount ===
    total)`: a perfect run clears the mistake, any wrong answer flags the
    whole item. No changes to `QuizQuestion.jsx`/`FixedQuizFlow` were
    needed. Instead of a separate practice mode, the list view gets a
    "📝 只看錯題 (N)" toggle chip (only shown when `mistakes.length > 0`)
    that filters the existing list in place, alongside the level filter —
    simpler than adding a new flow since these modules already navigate
    list → item → questions per story.
  - **Deliberately not implemented for Cangjie or Mandarin** — both use
    free-text typing and/or multiple sub-activities (listening/pinyin
    writing/speaking) rather than the tap-to-select MC pattern the above two
    approaches assume; retrofitting mistake tracking there needs a separate
    design, not a mechanical copy of this pattern.
  - Verified end-to-end in-browser for all 7 modules: forced a wrong answer,
    confirmed the id landed in `localStorage`, confirmed the review
    button/chip appeared, and (for Rhetoric) confirmed a correct answer
    inside the review session cleared the mistake — with no console errors
    on any of the three points per module.

## Module 10 details — 文言文選讀 (new module, 27 texts across 3 batches)
- Added after the original 9 modules, following explicit user feedback
  ("修改要求5") that neither `poetryContent.jsx` (poems + a handful of prose
  excerpts folded into Module 1's generated MC-quiz flow) nor
  `historyContent.jsx` (vernacular-retold stories, no original classical
  text at all) actually deliver "read real classical-Chinese text with
  translation + glossary + comprehension questions" as its own standalone
  experience — hence a dedicated new module rather than extending either.
- Content: `src/content/classicalProseContent.jsx` — `CLASSICAL_PROSE_ITEMS`,
  27 entries (9×p5, 9×p6, 9×s1) with fixed fields: `id`, `title`, `source`
  (出處，e.g. "《韓非子．五蠹》"), `dynasty`, `level`, `lines` (原文, split
  into sentence-level chunks — same "one array entry per rendered
  paragraph" convention as the `prose`-type entries in `poetryContent.jsx`),
  `lineExplanations` (白話語譯, parallel array to `lines`), `glossary`
  (重點文言字詞, array of `{term, jyutping?, meaning}` — same shape as
  `annotations` elsewhere in the app, just named `glossary` in this file),
  `background` (出處及故事背景), and `questions` (2-3 fixed comprehension
  MC questions, `{prompt, options, correctIndex}` — same shape as
  `HISTORY_ITEMS`' questions).
- **The user's reference material was a real textbook's 26-week classical-
  reading curriculum outline, given explicitly as a starting-point
  reference, not a list to copy verbatim in the same arrangement.** That
  outline named: 世說新語．假譎, 列子．湯問, 左傳．襄公十五年, 戰國策．魏策一,
  韓非子．外儲說左上, 後漢書．列女傳.
  - Batch 1 (8 texts) reuses 韓非子．外儲說左上 and 列子．湯問 exactly (same
    book and chapter — 鄭人買履 and 兩小兒辯日 respectively), uses a
    different 世說新語 chapter (言語, alongside 假譎 itself for 望梅止渴),
    substitutes a different 左傳 chapter (莊公十年 — 曹劌論戰 — instead of
    襄公十五年, since it's far more level-appropriate for P5–S1 and is one
    of Hong Kong's most commonly taught classical passages), and adds
    韓非子．五蠹 (守株待兔), 呂氏春秋．察今 (刻舟求劍), and 戰國策．楚策一
    (狐假虎威, a different 策 than the referenced 魏策一) as comparable
    classical sources.
  - Batch 2 (9 more texts, total now 17) was added after the user reviewed
    batch 1 and asked to keep expanding toward the referenced ~26-text
    scope. The user no longer had the original textbook's full 26-week
    title list, so this batch was self-selected (with the user's explicit
    go-ahead) from the same six referenced books (different chapters again
    — 韓非子．難一 for 自相矛盾, 韓非子．內儲說上 for 濫竽充數, 韓非子．
    外儲說左上 reused a second time for 買櫝還珠) plus other comparable
    classical sources not in the original list (淮南子．人間訓 for 塞翁
    失馬, 說苑．正諫 for 螳螂捕蟬黃雀在後, 晏子春秋 for 晏子使楚, 左傳．
    僖公三十年 for 燭之武退秦師, and 清代彭端淑〈為學一首示子姪〉). This
    batch finally uses 後漢書．列女傳 (樂羊子妻), which batch 1 didn't reach.
  - 左傳．襄公十五年 (the specific chapter originally referenced) still
    hasn't been used in either batch — if expanding further, that plus any
    other untouched chapters of the six referenced books are the first
    places to check.
- **Every 原文 excerpt was verified via `WebSearch` against multiple
  independent sources before being written** (ctext.org-adjacent classical-
  text sites, cross-referenced against Hong Kong Education Bureau or
  HKedCity curriculum material where available) — not recalled from memory,
  per the user's explicit no-fabrication instruction for this module.
  Several entries happened to surface HK-education-authority sources
  directly, a useful independent confirmation that level tagging is
  age-appropriate rather than a guess: 鄭人買履 and 自相矛盾 both match
  passages listed on `edb.gov.hk`'s official curriculum-resource PDFs
  (KS2/primary), and 望梅止渴 and 塞翁失馬 both appear in HKedCity-hosted
  primary-school classical-reading compilations.
- Component: `src/ClassicalProseModule.jsx` — structurally a copy of
  `HistoryModule.jsx`'s list → detail → `FixedQuizFlow` → list flow (fixed
  per-item questions, not runtime-generated, since each passage's
  comprehension questions are hand-authored and passage-specific). The
  detail view additionally renders two cards not present in
  `HistoryModule.jsx`: a 重點文言字詞 glossary card and a 白話語譯（逐句對照）
  card that pairs each `lines[i]` with `lineExplanations[i]` side by side —
  styled after the `type === "prose"` branch of `PoetryModule.jsx`'s detail
  view (`rounded-xl bg-{color}-50` blocks), not copied from it. No changes
  were needed to this component for batch 2 — it was already fully
  data-driven off `CLASSICAL_PROSE_ITEMS`.
- Module colour: `MODULE_ACCENTS.classicalProse` / `MODULE_ICONS.classicalProse` (🏺) distinguish it from the other nine.
- Wiring: `src/content/classicalProseContent.jsx` and
  `src/ClassicalProseModule.jsx` script tags added to `index.html` (content
  file alongside the other `src/content/*.jsx` tags, module file alongside
  the other `src/*Module.jsx` tags — both before `Home.jsx`/`Root.jsx` per
  the existing dependency order); `classicalProse` module entry added to
  `Storage.MODULES` (`Home.jsx` needs no changes — it already renders
  whatever `Storage.MODULES` lists) and to `Storage.defaultModuleProgress`'s
  auto-initialization loop; `Root.jsx` gained the
  `recordClassicalProsePractice` handler and a `view === "classicalProse"`
  branch, following the exact same per-module pattern as every other module.
- Mistake tracking (📝 只看錯題) works identically to History/Reading — a
  per-passage toggle chip on the list view, not a separate review mode.
- Verified end-to-end in-browser after both batches: all items render in the
  "全部" filter view under the correct level, with correct counts (17 total,
  6×p5/6×p6/5×s1, no duplicate `id`s) and balanced braces in the content
  file. Opened 曹劌論戰（節錄）(batch 1) and 燭之武退秦師（節錄）(batch 2, the
  longest/most complex new entry) in detail view — confirmed original text,
  glossary, line-by-line translation, and background all render correctly
  with no console errors. Ran 曹劌論戰's 3-question quiz forcing one
  deliberate wrong answer, confirmed the ✅/💛 feedback states, the "答對了
  2 / 3 題" finish screen, and — after returning to the list — the "📝 只看
  錯題 (1)" chip appeared, confirming the mistake was written to
  `localStorage` correctly.
- **Per the user's original scope-limiting instruction, expansion beyond
  this 27-text state should still wait for the user to ask again** — each
  batch was an explicit request; don't add a batch 4 to `CLASSICAL_PROSE_ITEMS` unprompted.
- **Batch 3 (階段 7 B 批, 27 texts total, 9×p5 / 9×p6 / 9×s1)** — +3 p5 (掩耳盜鈴《呂氏春秋．自知》, 畫蛇添足《戰國策．齊策二》,
  鷸蚌相爭（節錄）《戰國策．燕策二》), +3 p6 (王戎不取道旁李《世說新語．雅量》, 曾子殺彘《韓非子．外儲說左上》, 鑿壁偷光《西京雜記》),
  +4 s1 (論語選章（論學）, 愛蓮說 周敦頤, 陋室銘 劉禹錫, 岳陽樓記（節錄）范仲淹). Same schema; 5 questions each (3 comprehension,
  1 字詞解釋, 1 語譯填空), `correctIndex` spread over 0–3 (13/13/12/12) although `FixedQuizFlow` shuffles options anyway.
  Source-line convention: a book title in 《》 gives a 2-character seal from the title (《呂氏春秋．自知》 → 「呂氏」); for a single
  author-named essay `source` is the author (周敦頤 → 「周敦」, like 彭端淑).
  - **愚公移山 was NOT used** although it was on the user's candidate list (long, and its printed editions differ in many characters —
    厝/措, 亡/無, 隴/陵 — that could not be checked); 王戎不取道旁李 replaces it. 愛蓮說 and 陋室銘 also exist as prose entries in
    `poetryContent.jsx` (Module 1), 曾子殺彘 / 鑿壁偷光 appear in Module 6 / 7 as vernacular stories — the same text in different modules.
  - **VERIFICATION LEVEL (be honest about it):** the sandbox that wrote batch 3 could not open zh.wikisource.org, ctext.org or edb.gov.hk
    (egress policy, HTTP 403), so the author compared no 原文 with a page character by character — only cross-checked through WebSearch
    result summaries, with the common textbook wording used. **The user then reviewed batch 3 themselves and confirmed 原文 / 白話 / 答案 /
    粵音 ("B 批已核對…通過").** Chosen variants: 掩 (not 揜), 悖矣 (not 悖也), 鐘 (not 鍾), 卮, 并禽, 淨植, 引 (not 借) 其光.
  - **Four follow-up fixes after that review (own commit):** 岳陽樓記 last 白話 → 「我與誰同道呢？」 (a scan of the new passages found no other
    colloquial 同); 陋室銘 background no longer calls it a 駢體文 (now 「全文句式整齊，多用對偶，節奏明快」); 鷸蚌相爭 quotation marks —
    蘇代's whole speech is in 「」 (opens on line 2, closes at the end of the excerpt, line 5) and the 鷸曰 / 蚌曰 speeches inside it are in 『』,
    in both `lines` and `lineExplanations`; 狐假虎威's glossary has 「假」(借助) back.
  - **Glossary rule (tests/content.test.js):** every glossary term must occur in the passage's `lines` **or its `title`** (狐假虎威's 「假」
    is only in the title); nothing else was relaxed.

## Build status
- [x] Project scaffold — theme, storage, Home dashboard (see 每日任務 notes for the current layout), hub-and-spoke nav
- [x] Module 1 — 詩詞學習 (Classical Poetry + 文言文)
- [x] Module 2 — 作文金句
- [x] Module 3 — 倉頡輸入法教學
- [x] Module 4 — 普通話練習
- [x] Module 5 — 成語學習
- [x] Module 6 — 中國歷史故事
- [x] Module 7 — 閱讀理解
- [x] Module 8 — 修辭手法
- [x] Module 9 — 標點符號練習
- [x] Module 10 — 文言文選讀 (27 texts across 3 batches; see Module 10 notes)

**All 10 modules are built.** Remaining known gaps (content depth, not
missing features):
- [ ] Expand poem library further beyond the current 54+7 curated items (spec target: ~150)
- [ ] Expand essay golden sentence library further beyond the current 150 curated items
- [ ] Expand Mandarin vocabulary/sentence bank beyond the initial 22+6 curated items
- [ ] Idiom library now at 696 (711 before 階段 8d removed 15; 39 fully-verified + 495 lighter-schema + 119
      curriculum-gap batch + 58 from 階段 8b; 54 of the lighter-schema entries
      got an `origin` in 8b — see Module 5 notes and 階段 8b); could still have
      `origin` added back to the other ~440 lighter-schema entries if depth matters
      more than volume later
- [ ] Expand history story library further beyond the current 90 curated items (see 歷史故事改版 and 階段 8c)
- [ ] Expand reading passage library further beyond the current 34 curated items (new 理解/語文 question format — see Module 7 REBUILD and 階段 7 C 批)
- [ ] Expand rhetoric practice sentences further beyond the current 200 curated items
- [ ] Expand punctuation practice items further beyond the current 30 curated items
- [ ] Classical prose library at 27 texts (3 batches so far, 9 / 9 / 9) — expand
      further only if the user asks again, per Module 10 notes
- [ ] Composing arbitrary multi-root Cangjie characters (currently scoped to
      the 24 basic roots + 5 verified compound examples — see Module 3 notes)
- [ ] Cross-module linking from other modules back to Cangjie if a child
      gets stuck typing (no module currently needs free Chinese text entry
      besides Cangjie/Mandarin themselves, so this hasn't come up yet)

## Content expansion batch (指令 B) — done
- 作文金句: 60 → 75 (+5 per theme, ids like `summer-cicada`; none repeat the originals).
- 倉頡 (`cangjieContent.jsx` + `CangjieModule.jsx`): categories renamed to the
  official 哲理類/筆劃類/人體類/字形類 (source: 朱邦復工作室《第五代倉頡輸入法手冊》),
  roots H–N/S–W/Y carry the official `definition` (斜點交叉縱橫鉤／側並仰紐方卜).
  `輔助字形總覽` lists only text-verifiable shapes (32 shapes, 20/24 letters;
  R 口 is officially "none"; A 日, D 木, V 女 still missing — non-Unicode glyphs in
  the official table image the user supplied). 跟打練習 (TypingPractice): phrases
  built only from verified-code characters, shows 拆解圖, Space/Enter to confirm,
  reports 字/分鐘 + first-try accuracy. Each example
  was checked: its Unihan/hkcards code contains the owning letter. Fixed old
  errors: 想 removed from 忄, 半 removed from 丷. `拆字練習`: 50 chars, each code
  agreed by Unihan kCangjie + en.wiktionary `canj` + hkcards per-char breakdown
  (~110 candidates tested; 黃 rejected — hkcards shows two variants).
- 拼音 (`pinyinImeContent.jsx` + `MandarinModule.jsx` PinyinCharLookup): 50 chars,
  Unihan kMandarin + kXHC1983 + en.wiktionary all agree; only single-reading
  characters (多音字 like 大/上/樂/行 deliberately excluded).
- 歷史故事: 36 → 48 (+12: 商湯, 管鮑, 楚莊王, 張騫, 司馬遷, 蔡倫, 隋運河, 黃道婆,
  李時珍, 虎門銷煙, 詹天佑, 辛亥革命); facts web-verified (see comment above them).
- 修辭手法: 63 → 105 practice sentences (15 per device; 對偶 = famous couplets). *(superseded by 階段 7 A 批 below: 200)*
- 文言文選讀: +2 questions per text (字詞解釋 + 語譯), 3 → 5 each; 原文 untouched.
- `FixedQuizFlow` (QuizQuestion.jsx) now shuffles options per attempt — most
  hand-authored fixed questions had the answer in slot 0. Never write
  explanations/prompts that depend on option order.
- Local dev tip: `.claude/static-server.ps1` (single-threaded) hangs easily;
  `.claude/StaticServer.exe --root chinese-ops --port 5701` is faster.

## 備份與還原 (BackupSettings.jsx)
- Home footer link "💾 備份與還原進度" opens an inline panel. The app uses exactly one
  localStorage key (`chineseOps:v1`); the backup file is
  `{ app: "chinese-ops", version: 2, exportedAt, data: { "chineseOps:v1": state } }`,
  downloaded as `chinese-ops-backup-YYYY-MM-DD.json` (local date).
- **`BACKUP_VERSION` is 2** (v2 = 每日任務 fields). v1 files still import: missing
  `daily`/`streak`/`streakFreezes`/`stats` fall back to defaults, a malformed piece
  falls back per piece, the file is never rejected for it. A file with a *newer*
  version is refused ("請重新載入") — this also protects a stale cached copy on the
  iPad from silently dropping the streak. Bump the version again if a future change
  cannot be read by the previous app.
- `Storage.parseBackup(text)` never throws; rejects with reason invalid / wrongApp /
  newerVersion / tooBig, and `sanitizeState` rebuilds state from known fields only.
  Restore always goes through a confirm screen (file date, level, 答對/練習題數, 錯題數,
  連續日數（最長）, 徽章 n / 23).
- `loadState` and `sanitizeState` share `normalizeGamification(raw, today)`, so a saved
  state of any age and an imported file end up in exactly the same shape (day rolled
  over to today; dates must be real calendar dates; counters capped; only known
  module keys; `done ⊆ missions`; unknown top-level fields dropped).
- 測試模式 backups: see "每日任務 · 連續日數 · 徽章 → 測試模式" (separate key, `TEST` in the
  file name, `testMode: true`, refused by normal mode with reason `testFile`).
- If a second localStorage key is ever added, add it to `buildBackup`/`parseBackup`.

## 每日任務 · 連續日數 · 徽章 (built Oct 2026, 5 phases, all deployed; Phase 6 = A2 restyle, complete)
Modelled on the sibling `english-ops` (`DailyMissions.jsx` / `BadgesScreen.jsx` /
`storage.jsx`, read-only reference — never edit it) but deliberately different:
1. english-ops needs *every* module done each day; here **3 missions/day** (10 modules is too
   much for a P5 child).
2. english-ops lets one streak freeze cover a gap of ANY length; here **one 保護符 per missed day**.
3. english-ops' `markModuleComplete` never rolls the date over (an app left open past midnight
   counts into yesterday); `recordSession` always rolls over first.
4. english-ops shows the stored streak count even after missed days; here `getStreakView` shows
   the *effective* streak (已中斷 → 0).
5. english-ops' import rejects a file lacking `dailyProgress`; here missing pieces default.
6. Everything about 測試模式 (below) is new.
- **Data + logic** live in `Storage.jsx` as pure functions (no localStorage, `today` is a parameter
  defaulting to `todayStr()`), so they can be unit-tested by loading the file in `node:vm`.
- **Hook point:** all 10 modules already call `onRecordPractice(correct, total)` exactly once when a
  session finishes. `Root.recordPractice(moduleKey)` turns that into
  `recordPracticeResult` + `recordSession` — **no module file knows about missions or badges**.
  State is updated with a *functional* `setState` because History/Reading/ClassicalProse call
  `onRecordPractice` and then `onAnswerItem` in the same event; the notices are computed from a
  `stateRef` snapshot instead. Idiom's stage count (`attempts / QUESTION_COUNT`) is unaffected.
- **Missions:** `pickMissions(dateStr)` is deterministic per date, one module from each group:
  A 語文基礎 `idiom, rhetoric, punctuation, essay` · B 閱讀文化 `poetry, classicalProse, history,
  reading` · C 字音輸入 `mandarin, cangjie` (group B uses `(day + floor(day/4)) % 4` so the A/B
  pairing does not repeat on a fixed 4-day cycle). The day's three are stored in `daily.missions`
  (so adding a module mid-day cannot change them). **Done = one finished session of that module,
  any score** (same philosophy as 成語's stage-based 稱號); `total >= 1` required. Sessions in other
  modules still count toward `stats`/badges, not toward missions.
- **Streak:** the day counts when all 3 are done. `gap = daysBetween(lastDate, today)`: gap 1 → +1;
  gap ≥ 2 → needs `gap − 1` 保護符 (consumed, streak +1) else reset to 1; `gap ≤ 0` (device clock
  moved back) → not counted twice. Start with 1 保護符, +1 at every 7th streak day, cap 2.
  `getStreakView(state, today)` → `doneToday | pending | saved | broken | none`; Home shows 「保住」
  (ochre box + 🛡️) and 「已中斷」 (grey flame, 0 日, 最長紀錄).
  Known limits: a `lastDate` far in the future (clock set forward, a session done, clock set back)
  parks the streak until the real date catches up; restoring an older backup can make the app see
  missed days (保護符 used or streak reset on the next completed day).
- **Badges (23)** — `BADGES` in `Storage.jsx`, each `{ key, seal (one unique character), name, group,
  condition, meaning, progress(state) → {cur,target} }`; earned = `cur >= target`, **always computed
  (`earnedBadgeKeys`), never stored**. Streak badges use `stats.bestStreak`, so they survive a break.
  `累計答對` comes from the existing `practiceStats` (retroactive for old saves); per-module
  sessions, perfect sessions, mistakes cleared and the rest count from the day 每日任務 shipped.
  | group | badges (condition) |
  |---|---|
  | 連續日數 | 循序漸進 (3 日) · 持之以恆 (7) · 日積月累 (14) · 鍥而不捨 (30) · 水滴石穿 (60) · 有備無患 (首次用保護符) |
  | 起步與累計 | 初試啼聲 (第 1 節) · 大功告成 (首次完成一日 3 任務) · 積少成多 (答對 100) · 學富五車 (答對 1000) |
  | 模組 (各 5 節) | 詩情畫意 詩詞 · 出口成章 作文金句 · 得心應手 倉頡 · 字正腔圓 普通話 · 言簡意賅 成語 · 博古通今 歷史 · 開卷有益 閱讀理解 · 畫龍點睛 修辭 · 一絲不苟 標點 · 溫故知新 文言文 |
  | 特別 | 博學多才 (10 模組各 ≥1 節) · 一字不差 (≥5 題全對) · 知過必改 (清除 10 條錯題) |
  **All 23 names are real 成語 and were checked against 教育部《成語典》** (writing + meaning, Oct 2026;
  有備無患 replaced 亡羊補牢 for the 保護符 badge at the user's request — a charm is prepared in advance).
  Pitfalls recorded on purpose: 持之以**恆** (not 恒),
  鍥而不**捨**, 言簡意**賅** (not 該), and the dictionary has **知過必改** (not 知過能改) and
  **妙語如珠** (not 妙語連珠, which is why it is not used). Earlier invented names
  (三日成章, 七日不輟, 初試筆墨, 日課有成, 倉頡傳人, 小有所成) were rejected for not being 成語 — don't
  reintroduce made-up four-character names; verify any new one first. To add a badge: append to
  `BADGES` (unique `key` and `seal`), no storage/backup change needed.
- **回饋橫幅 (`NoticeStack.jsx`)**: `Storage.buildNotices(before, after, events, moduleKey)` →
  完成任務 / 今日任務全部完成 / 已使用保護符 / 獲得保護符 / 獲得徽章 (only badges not already earned
  *before* the session). Fixed to the bottom of ANY screen, 44px × buttons + 全部關閉, auto-dismiss
  after 25 s, adds bottom padding to the page while visible (it covered the 備份 link before that),
  max 4. **In memory only** — never saved, never in a backup.
- **主頁版面:** see "UI system — A2 → Home". Content / logic: 今日任務 card (3 mission rows, 🔥 N 日, 🛡️ 保護符 ×k, status line), 程度 control, 🏅 徽章 n / 23, 10 module cards, 備份連結.
  `BadgesScreen.jsx`: a seal tile per badge, locked ones dashed 「？」 + progress bar, 成語意思 on every tile, 「下一個目標」.
- **測試模式**: open the site with `?today=YYYY-MM-DD` (any `today` parameter, even empty/invalid,
  selects it; an invalid value uses the real date). Then the app uses localStorage key
  **`chineseOps:test`** and pretends it is that date, and **never reads or writes `chineseOps:v1`**.
  A sticky 「測試模式」banner (`TestModeBanner.jsx`) is always on top: ◀ 前一日 / 後一日 ▶ (reloads with the
  new date, test data kept) / 清除測試資料 (removes only the test key) / 離開測試模式. Backups made in
  test mode are named `…-TEST-…`, carry `testMode: true` and `data["chineseOps:test"]`, and normal mode
  refuses them (`testFile`); test mode may import a normal backup (writes the test key only).
  Purpose: test streaks on the iPad the child really uses without touching the real streak.
  Mode is decided once at load from the URL (`Storage.TEST_MODE`).
- **Safe area:** `index.html` defines `--sat/--sar/--sab/--sal` from `env(safe-area-inset-*)`; the title,
  side/bottom padding, the test banner (its background extends under the status bar) and NoticeStack use
  them, because the home-screen version has `black-translucent` + `viewport-fit=cover`. All 0 in a
  Safari tab. (Verified only by overriding the variables, not on a real home-screen app.)
- **Real-iPad notes:** the home-screen app and the Safari tab have SEPARATE localStorage on iOS — test in
  a Safari tab with `?today=`, and export a backup first.
- **How it was verified (cloud sandbox has no CDN access):** unit tests load `Storage.jsx` in `node:vm`
  with a stub `window`/`localStorage` (backup v1/v2, garbage input, dates, streak/freeze scenarios,
  badges, notices — 48 checks); browser tests used Playwright + Chromium with React/Babel from npm and
  a Tailwind 3 CLI-built stylesheet substituted for the CDN scripts (same engine as the Play CDN, but NOT
  the real CDN build, Google fonts or iPad Safari). A driver finished one real session in each of the 10
  modules and confirmed it was recorded, the 3 missions completed, streak 1 and 初試啼聲 / 大功告成 /
  博學多才 earned. The node unit tests are now in `tests/` (see 單元測試); the Playwright browser
  scripts lived in the session scratchpad and are **not in the repo**.
- **Deploy:** GitHub Pages serves `master`; each phase was merged (fast-forward) into `master` and pushed.
- **Phase 6 — visual restyle to A2: COMPLETE.** Details of the finished system, the standard module-file shape and the steps for
  adding a module are in "UI system — A2" near the top of this file. History in one line each: three mock-ups → the user chose A2 →
  6a added the tokens/components → 6b restyled Home → 6c-1…6c-4 switched the modules batch by batch → 6d-1 did the badges page, backup
  panel, notices and test banner → 6d-2 deleted the old look and made module-internal switches scroll to the top. The old step-by-step
  plans, per-batch verification logs and the `design-preview/` mock-ups were removed from this file and from the repo.

## 單元測試 (tests/)
Pure-node tests for the logic in `src/Storage.jsx` (backup, daily missions, streak / 保護符, badges,
notices, 測試模式) and for the content files `rhetoricContent.jsx` / `essayContent.jsx` (`content.test.js`). **Optional dev tooling — the app itself still needs no Node, no build step.**
- **Run all:** `node tests/run-all.js` (from the repo root; Node 18+; no `npm install`; exit code 0 =
  all passed). Run one file: `node tests/storage.test.js`. Expected today: 8 files, **137 tests**.
- **How it works:** `tests/helpers.js` reads `src/Storage.jsx` (plain JS, no JSX) and runs it in a
  `node:vm` sandbox with a stub `window` / `localStorage` / `URLSearchParams`, exactly as the browser
  loads it, then hands back `window.App.Storage`. `loadStorage({ initial, search })` pre-fills
  `chineseOps:v1` and/or sets the URL query (`"?today=2026-10-12"` = 測試模式); `makeRunner(label)`
  gives the `t(name, fn)` / `t.done()` helpers. A failed `assert` makes the file exit non-zero.
- **Files:** `storage.test.js` (23 — v1/v2 backup import, `loadState` migration, garbage input, dates,
  `pickMissions`, `recordSession` streak / 保護符 / rollover / clock-went-back scenarios,
  `getStreakView`, `removeMistake` counting) · `badges.test.js` (12 — exact approved names/order,
  thresholds, retroactive 累計答對, module badges, backup round trip) · `notices.test.js` (13 —
  `buildNotices` wording and "never re-announce an already-earned badge") · `test-mode.test.js` (7 —
  the test key never touches `chineseOps:v1`; test backups refused in normal mode) ·
  `titles.test.js` (12 — 科舉稱號 tiers / 模組里程 boundaries, junk input, read-only; see "UI system — A2") ·
  `idiom-compat.test.js` (8 — 階段 8d: retired idiom ids vs old saves / old v1+v2 backups / `pruneUnknownMistakes`; see "階段 8d") ·
  `rhetoric-quiz.test.js` (14 — 階段 9a: runs `src/rhetoricQuiz.jsx` thousands of times with a seeded `Math.random` and checks every question has one defensible answer; see "階段 9a") ·
  `content.test.js` (48 — rhetoric, essay, 文言文選讀, 閱讀理解, 成語 and 歷史故事 content; it loads the content files in a `node:vm` sandbox, so a
  broken `keyPhrase`, an unknown `device`, a duplicate id / sentence, a glossary term that is not in the lines, a passage that does not
  have exactly 5 questions with 4 different options, a reading passage whose vocab term / 「第 N 段」 does not fit, an idiom whose origin / clue names itself, a duplicate idiom or id, or a wrong count fails the run).
- **When to run:** before pushing any change to `Storage.jsx` (or to anything it depends on). When you
  add a stored field, add it to `normalizeGamification` AND a round-trip assertion to
  `storage.test.js`; when you add a badge, update the approved-names list in `badges.test.js`
  (the test fails on purpose if a name changes unnoticed).
- **Checked to be sensitive:** deliberately breaking `BACKUP_VERSION`, and making test mode use the real
  key, each made the relevant files FAIL (then reverted).
- **Not covered:** screens, layout, touch behaviour, fonts — those need a real browser / the iPad.
  Because `tests/` sits in the repo root it is also served by GitHub Pages (harmless static files).

## 歷史故事改版 第 1 次 (按主題分類) — done
- `HistoryModule.jsx`: level filter replaced by category tabs (戰爭故事 12 / 治國與時代發展 9 /
  計謀 9 / 品德與勵志 18; 戰爭詩詞 is hidden while empty). Stories are ordered by
  `sortYear` (approximate; BCE negative) inside each tab. `level` stays in the data.
- New per-story fields in `historyContent.jsx`: `category`, `characters` (2–4), `lesson`,
  `source` (one of `HISTORY_SOURCES`: 史書記載 / 小說演義 / 筆記軼事 / 神話與民間傳說 — every
  story has one), plus helper fields `sortYear`, `sourceRef` (verified origin text) and the
  optional `sourceNote` (shown on the story page for 7 mixed/disputed stories: 烽火戲諸侯,
  三顧茅廬, 岳飛精忠報國, 卧冰求鯉, 囊螢映雪, 大禹治水, 卧薪嘗膽). Counts: 38 史書記載, 5 筆記軼事, 5 神話與民間傳說,
  0 小說演義. The story page now shows 主要人物 and 故事道理.
- Backup (`sanitizeState`) unaffected: story ids and the progress format did not change.

## 歷史故事改版 第 2 次 — 詩詞 +13 (poetryContent.jsx, now 74 poems)
- Added: 黃鶴樓, 登高, 錦瑟, 念奴嬌·赤壁懷古, 西江月·夜行黃沙道中, 破陣子·為陳同甫賦壯詞以寄之,
  如夢令·常記溪亭日暮, 一剪梅·紅藕香殘玉簟秋, 雨霖鈴·寒蟬淒切（節錄）, 從軍行（青海長雲暗雪山）,
  夏日絕句, 示兒, 過零丁洋. All have `form`; the 6 詞 carry `ciTune`; 黃鶴樓 has a `formNote`
  (七律 per textbook convention, 格律 disputed). Texts were compared across ≥2 online sources;
  variant wording is recorded in each poem's `background`. Pinyin was generated from Unicode Unihan
  with manual polyphone/tone-sandhi fixes. The original 61 poems are untouched.
- Known quirk (pre-existing, more likely now): the 填空 question can pick a "……" omission line
  of a 節錄 poem (水調歌頭, 雨霖鈴) as the line to blank.

## 歷史故事改版 第 3 次 — 戰爭詩詞分頁 + 詩詞/故事配對
- Commit A: poetry quiz generators skip "……" omission lines (`isRealLine`) for the blank answer,
  distractors and the meaning-question line (brute-force checked on 10,000+ generated questions).
- Commit B: the 戰爭詩詞 tab is back in the history module. `historyContent.jsx` exports
  `HISTORY_WAR_POEM_IDS` (10 poem ids, chronological) and `HISTORY_POEM_STORY_LINKS`
  (`{ poemId, storyId, relation: 事件背景|同一時代|同一主題, note }`, 7 pairings). Poems are
  referenced by id only (text stays in poetryContent.jsx). Unpaired for now: 出塞, 兩首涼州詞, 過零丁洋.
- Cross-module links go through Root's `navigate(key, opts)` → `nav` prop on Poetry/History:
  `{ poemId | storyId, scopeIds?, from: { module, opts } }`; `from` drives the back button, `scopeIds`
  limits poem practice to the war-poem set. Story page shows 相關詩詞; poem detail shows 相關歷史故事.

## 歷史故事改版 第 4 次 — 戰爭故事 +7 (now 55 stories, 戰爭故事 19)
- New: 長平之戰, 巨鹿之戰（破釜沉舟）, 垓下之戰（四面楚歌）, 衛青、霍去病抗擊匈奴, 官渡之戰,
  薛仁貴三箭定天山, 戚繼光抗倭. Facts checked online (史記·項羽本紀 etc.); casualties kept gentle.
  `sourceNote` on 垓下 (楚歌是否漢軍有意為之屬後世解讀) and 薛仁貴 (正史只記三箭射倒三人，其餘有爭議／被小說加工).
- Quiz options deliberately length-balanced (correct answer strictly longest in only 2/21 questions).
- New pairings (HISTORY_POEM_STORY_LINKS now 12): 夏日絕句↔垓下之戰 (事件背景); 出塞, 從軍行,
  兩首涼州詞 ↔ 衛青、霍去病抗擊匈奴 (同一主題; 出塞 note keeps the 龍城飛將 衛青/李廣 dispute).
  過零丁洋 stays unpaired. Existing stories/poems untouched.

## 歷史故事改版 第 5 次 — 治國與時代發展 +7 (now 62 stories; 治國與時代發展 16)
- New: 管仲治齊, 趙武靈王胡服騎射, 文景之治, 光武中興, 開元盛世, 張居正改革, 康熙平三藩.
  Facts web-verified (see comment above them in historyContent.jsx). `sourceNote` on 管仲治齊 (《管子》
  非管仲親撰), 趙武靈王 (前307/前306 年份有不同說法), 張居正 (評價及數字不一). Disputed numbers
  (e.g. 張居正 田畝面積) are left out of the stories.
- New relation label 「詩中所詠」 — used ONLY for 夏日絕句 ↔ 垓下之戰 (poem plainly describes 項羽).
  出塞 ↔ 衛青、霍去病 stays 「同一主題」 because 龍城飛將 may be 李廣 (a label of 詩中所詠 would assert 衛青).
- Quiz options length-balanced again (correct answer strictly longest in only 2/21, by 1 character).
- Suggestion not yet done (needs user OK): pair 春望 ↔ 開元盛世 (同一時代) to complete the 開元→安史→春望 line.

## 歷史故事改版 第 6 次 — 計謀 +10 (now 72 stories; 計謀 19)
- New (史書記載 7): 圍魏救趙, 增兵減灶（馬陵之戰）, 退避三舍, 假道伐虢（唇亡齒寒）, 田單火牛陣, 暗度陳倉, 七擒孟獲.
  (小說演義 3 — first use of that label): 蔣幹盜書（反間計）, 草船借箭, 空城計; each `sourceNote` says what the
  histories actually record (《江表傳》/《魏略》/裴注引《蜀記》) and the story text opens with 「在小說《三國演義》裏」.
- 暗度陳倉 tagged 史書記載 + note: 史記 only has 「從故道還，襲雍王章邯」; 「明修棧道」 is a later (元雜劇) addition.
- 七擒孟獲 tagged 史書記載 + note: not in 《三國志》 main text; core in 裴注引《漢晉春秋》/《華陽國志》; 演義 details
  (藤甲兵 etc.) deliberately left out. USER TO CONFIRM this label (it could arguably be 小說演義/傳說).
- 開元盛世 ending now reads 「亂事平定後，詩人杜甫回憶說…」 (憶昔二首 ≈764, after 春望 757) and sourceRef records 764;
  the story never mentions 春望. 春望 ↔ 開元盛世 pairing was declined by the user.
- Quiz options length-balanced (correct answer strictly longest in 5/30, never by 2+ characters).

## 歷史故事改版 第 7 次 — 品德與勵志 +6 (now 78 stories; 品德與勵志 24) — 改版完結
- New: 曾子殺彘 (筆記軼事, 《韓非子·外儲說左上》, 諸子書), 黃香溫席 (史書記載 + note: 「扇枕溫席」見《東觀漢記》，
  《後漢書》較簡略，《二十四孝》再普及), 蘇武牧羊 (史書記載, 《漢書》), 范仲淹斷齏畫粥 (史書記載 + note — changed from
  筆記軼事 at the user's request: 《宋史》 records the core event 刻苦讀書、「食不給，至以糜粥繼之」；畫粥斷齏 detail is from
  《湘山野錄》), 宋濂借書 (筆記軼事 + note: 依據本人《送東陽馬生序》自述), 徐霞客 (筆記軼事 + note:
  依據《徐霞客遊記》、陳函輝墓誌銘、錢謙益傳，非正史). Facts web-verified; disputed/unverified details left out.
- Label decisions confirmed by the user: 黃香 stays 史書記載 + note; 范仲淹 = 史書記載 + note; 宋濂 and 徐霞客 stay 筆記軼事
  (self-narration / epitaph & travelogue, not a standard history). See the 核心事件 principle below.
- Quiz options length-balanced (correct answer strictly longest in 1/18 new questions, never by 2+ characters).

### 歷史故事改版 — 最終結構 (7 次總結)
- **78 stories** (階段 8c later added 12 → 90: 戰爭故事 22 / 治國與時代發展 22 / 計謀 22 / 品德與勵志 24): 戰爭故事 19 / 治國與時代發展 16 / 計謀 19 / 品德與勵志 24, plus the 戰爭詩詞 tab (10 poems, no stories of
  its own; ids in `HISTORY_WAR_POEM_IDS`, text stays in poetryContent.jsx, now 74 poems).
- Category tabs replace the old level filter; stories sort by `sortYear` (BCE negative, ties keep array order). `level`
  stays in the data. Story fields: `id, title, period, level, category, sortYear, source, sourceRef, [sourceNote],
  characters (2–4), lesson, story, questions (3 × 4 options)`. Story page shows 出處 tag (+ 出處說明), 主要人物, 故事道理, 相關詩詞.
- Source labels (`HISTORY_SOURCES`): 史書記載 62 / 小說演義 3 / 筆記軼事 8 / 神話與民間傳說 5.
  - **標籤原則 (use this for every story added from now on): 核心事件有正史記載 → 「史書記載」+ `sourceNote` 說明哪些
    細節來自筆記/後世加工 (cf. 三顧茅廬, 范仲淹斷齏畫粥, 黃香溫席); 核心事件不在正史 (only in 諸子書、筆記、本人自述、
    家傳、墓誌銘/傳記) → 「筆記軼事」 (cf. 孟母三遷, 孔融讓梨, 曾子殺彘, 宋濂借書, 徐霞客).** 小說《三國演義》 plot → 「小說演義」;
    神話/民間傳說 → 「神話與民間傳說」. If the core event cannot be placed, tell the user instead of guessing.
  - Applied so far: mixed cases tagged 史書記載 + note: 囊螢映雪, 七擒孟獲, 暗度陳倉, 黃香溫席, 范仲淹斷齏畫粥; 田單火牛陣 is in 《史記·田單列傳》 so no note; 小說演義 only for 蔣幹盜書, 草船借箭, 空城計 (story text opens
  with 「在小說《三國演義》裏」). 七擒孟獲 = 史書記載 + note (user confirmed).
- Poem↔story pairings: `HISTORY_POEM_STORY_LINKS` (12; `relation` 事件背景 / 同一時代 / 同一主題 / 詩中所詠). 「詩中所詠」
  is used ONLY for 夏日絕句 ↔ 垓下之戰. Unpaired: 過零丁洋. 春望 ↔ 開元盛世 was declined (開元盛世 ending never mentions 春望).
  Navigation both ways via Root `navigate(key, opts)` → `nav` prop `{poemId|storyId, scopeIds?, from}`.
- Backup/restore unaffected throughout (story ids unchanged; mistakes stored by id).

## 階段 7 內容擴充 A 批 (Oct 2026) — 修辭手法 + 作文金句
Content-only change (no screen, logic, storage or backup change; `RhetoricModule.jsx` / `EssayModule.jsx` untouched — nothing
on screen hard-codes the number of devices or sentences). Added by the user's spec "階段 7 A 批".
- **修辭手法: 7 → 10 devices, 105 → 200 sentences (20 per device).** New devices (ids `fanfu` / `yinyong` / `duibi`, appended after
  設問, same fields as the others): **反覆**, **引用**, **對比**. New sentences are `fanfu-1…20`, `yinyong-1…20`, `duibi-1…20`; the
  original seven devices got `…-16…20` (+5 each). Every device is now **6 / 7 / 7** (小五 / 小六 / 中一) except 對偶, which is
  4 / 7 / 9 because it started at 1 / 5 / 9 and +5 cannot reach 6 / 7 / 7 (totals: 小五 58, 小六 70, 中一 72).
  - **Rules the new sentences follow (keep them for any later batch):** one clear device per sentence. 引用 = a direct quotation of a
    public-domain classic (論語、孟子、荀子、老子、周易、屈原、陶淵明、李白、蘇軾) or a 成語/俗語, always with an explicit frame
    (「孔子說：「…」」, 「李白在詩中寫道：「…」」) and never a quote that is itself a 對偶 / 反問 / 反覆 line. 對比 = opposition in *meaning*,
    deliberately not written as two equal-length parallel clauses (that would be 對偶). 反覆 = a word or sentence visibly repeated for
    emphasis, not three parallel clauses (that would be 排比). Existing 對偶 sentences are bare famous couplets (no quotation frame),
    which is what separates them from 引用.
  - New devices' `effect` texts are worded to share no key phrase with the others (they are used as each other's quiz distractors).
  - **Known overlap of OLD sentences with the new devices** (deliberately not changed — the user decides): `paibi-1`, `paibi-7`,
    `paibi-12`, `paibi-13` also repeat a phrase (反覆); `duiou-4` and `duiou-12` also contain a contrast (對比); `duiou-9` and `duiou-15` are
    contrast-flavoured couplets; every `duiou-*` couplet is a bare famous line, so a student could call it 引用.
- **作文金句: 75 → 150 (50 per theme).** +25 per theme; by level 小五 +25 / 小六 +20 / 中一 +30 (描寫 +4/+7/+14, 抒情 +9/+7/+9,
  論說 +12/+6/+7). New ids are English kebab-case (e.g. `lotus-pond`, `grandma-cooking`, `punctuality`). Scenarios, `keyPhrase`s and
  sentences are all unique (they are quiz options / prompts), and each topic is new — no scenario repeats one of the old 75.
- **`tests/content.test.js` (18 tests, auto-discovered by `run-all.js`):** unique ids; required fields; `level` ∈ p5/p6/s1; every
  `device` exists; 20 per device (200 total) and 10 devices; unique 效果 texts; no duplicate sentences and no sentence equal to a
  reference example; every device has every level; new devices split 6/7/7; every 引用 sentence has 「」 and a speaker; every 反覆
  sentence repeats a chunk; essay: 150 items, 50 per theme, `theme` ∈ 描寫/抒情/論說, each `keyPhrase` occurs **exactly once** in its
  sentence, no duplicate sentence / `keyPhrase` / `scenario`. Run `node tests/run-all.js` after touching either content file.
- Verified in a browser (820 / 390 wide): rhetoric list shows 10 rows; the three new detail pages; one correct and one wrong answer
  for every new device in both question types (「這句運用了什麼修辭手法？」 and the 作用 question, 4 distinct options each); one full
  session per essay theme with new sentences appearing; backup export → import identical, version 2. Content in this batch was written
  for this project (not copied from textbooks or papers); quoted classics are public domain.

## 階段 8b — 成語學習擴充 (Oct 2026): 653 → 711 idioms, 54 idioms gained an `origin` — 已審核並已合併 (reviewed by the user and MERGED into master; the 「不肯定」 list below stays open for a human check of the dictionary pages)
Content-only change (`idiomContent.jsx`, `tests/content.test.js`, this file; `IdiomModule.jsx` untouched — it already shows 出處及故事 only `{item.origin && …}`).
- **(A) 補 origin: 54 existing lightweight idioms** (level / pinyin / meaning / clue NOT touched — existing doubts are only listed below): p5 溫故知新, 有始有終;
  p6 九牛一毛, 鶴立雞群, 水落石出, 不翼而飛, 出人頭地, 得心應手, 有備無患, 舉一反三, 不恥下問, 後來居上, 廢寢忘食, 如魚得水, 三思而後行, 依樣畫葫蘆, 更上一層樓, 眾志成城, 不自量力, 自暴自棄,
  飲水思源, 取長補短, 精益求精, 大同小異, 知己知彼; s1 打草驚蛇, 畫虎類犬, 羊質虎皮, 狼子野心, 遊刃有餘, 笑裏藏刀, 一諾千金, 忠言逆耳, 焦頭爛額, 如坐針氈, 生吞活剝, 世外桃源, 高山流水, 草木皆兵,
  運籌帷幄, 妄自菲薄, 披荊斬棘, 未雨綢繆, 居安思危, 功虧一簣, 茅塞頓開, 青出於藍, 家徒四壁, 孤掌難鳴, 分道揚鑣, 食言而肥, 從善如流, 以管窺天, 引而不發. (The full list is `IDIOM_8B_ORIGIN_ADDED` in the test file.)
- **Review round 1 (user-requested rewrites, each re-checked by WebSearch):** 驚弓之鳥 (speaker = 趙國使者魏加 to 楚國春申君, against 臨武君 as 主將; 《戰國策．楚策四》 — 趙使者 and 「曾敗給秦國」 rest on an online article + 國語辭典 summary, not the original text), 羊質虎皮 (《法言．吾子》 asks whether someone calling himself 孔子 is 孔子; the reply is paraphrased, not quoted — the verbatim 「其文是也，其質非也」 was not shown in the search results), 南轅北轍 (季梁, 太行山, 馬好 / 盤纏多 / 車夫能幹; 《戰國策．魏策四》), 返璞歸真 (洪仁玕 sentence removed; the quotation 「歸真反璞…」 is from 《戰國策．齊策四》 per 國語辭典, and the idiom itself appears in 《成語典》 only among 題辭), 高山流水 (「春秋時代」 — HK 教材 describes 伯牙 as a 春秋時代 琴師; 「楚國」 dropped, no reliable basis), 虎頭蛇尾 (origin removed, see above).
- **(B) 58 new idioms**, all six fields (`IDIOM_8B_NEW` in the test file), level as suggested: 15 p5 / 23 p6 / 20 s1. Ids = toneless pinyin hyphenated (unique; existing ids end in digits where they clash).
- **How the facts were obtained:** the sandbox cannot open dict.idioms.moe.edu.tw or zdic.net (proxy 403), so every idiom was checked through `WebSearch` summaries of 《成語典》/漢典 by 12 delegated agents; each draft
  was then read and checked by script (no idiom / no 3 consecutive characters in `origin` and `clue`, pinyin = one syllable per character, no duplicate vs the existing list incl. variant characters, 書面語 scan).
  **Rule applied:** where 《成語典》 and 漢典 disagreed on the 典源 (or nothing explicit was found) the idiom was NOT added / NOT given an origin and is listed below. Pinyin summaries were rarely shown, so most new pinyin is the standard reading, not a quoted dictionary line.
- **Not added / no origin (needs a human check of the dictionary page):** 典源 conflict — 一舉兩得 (《戰國策．秦策二》 vs 《晉書．束皙傳》), 如虎添翼 (《將苑》 vs 《心書》), 雪中送炭 (《四字經》 vs 范成大詩), 水滴石穿 (《尸子》 vs 《漢書》), 口蜜腹劍 (《開元天寶遺事》 vs 《資治通鑑》),
  言過其實, 指鹿為馬 (《新語．辨惑》 vs 《史記》), 手不釋卷, 管中窺豹 (《晉書》 vs 《世說新語》), 隔岸觀火, 一勞永逸, 因小失大, 夜郎自大 (《史記》 vs 《漢書》), 胸有成竹, 背水一戰, 高枕無憂, 路不拾遺, 點石成金, 鐵面無私; 查不到 — 醍醐灌頂;
  典源不確定 — 虎頭蛇尾 (origin removed after review: 《成語典》 itself says only 「語或出」 元．康進之《李逵負荊》第二折, and 漢典 reads that line as 「裝着虎頭、拖着蛇尾」, i.e. a different meaning from today's idiom — an `origin` cannot be written as a certain statement; the entry stays as a lightweight one); 寫法 — 鐵杵成針 (《成語典》 only has 鐵杵磨成針 / 磨杵成針), 洗耳恭聽 (only a late 書證, no story), 揚揚自得 (《成語典》 headword is 洋洋自得; only one sentence of story), 前功盡棄 (no story text found).
- **Kept with a note:** 囊螢映雪 (only 漢典 has this order; 《成語典》 has 映雪囊螢 / 聚螢映雪), 一葉障目 and 妙筆生花 (only 漢典 has these 4-character headwords; 《成語典》 has 一葉蔽目，不見泰山 / 生花妙筆), and in (A) 三思而後行 (《成語典》: 三思而行) and 畫虎類犬 (《成語典》: 畫虎類狗) — the existing writing was kept.
- **Sensitive topics** (笑裏藏刀、草木皆兵、投鼠忌器、懸壺濟世、狼子野心) use a neutral origin; 草木皆兵 does not name the river (sources wrote 肥水 / 淝水).
- **Existing entries with doubts (reported, NOT edited):** 27 older `origin`s contain their own idiom and 2 older `clue`s do (listed in the test as `IDIOM_OLD_*`, the test fails if the list grows or shrinks); 九牛一毛 meaning lacks 「極大數量中的極小部分」; 出人頭地 meaning leans to 出類拔萃;
  運籌帷幄 meaning says 「在後方」 (**correction made in 階段 8d: this note and the 8b report were wrong — 漢典 does say 「在後方擬定作戰策略」; only 《成語典》 says 「在軍帳中出謀策劃」; the meaning is kept**); 揚揚自得 meaning 「滿足自誇」 vs 「十分得意」; 引而不發 meaning lacks the 《孟子》 原義 (善於啟發誘導); 依樣畫葫蘆 pinyin ends in a neutral-tone `lu` (dictionaries `lú`).
- **Tests:** `content.test.js` 35 → 42 (711 items, unique ids / idioms incl. 卧-臥 and 裡-裏 variants, base fields, one pinyin syllable per character, 54 + 58 lists, 270 origins, origin / clue never contain the idiom or 3 consecutive characters for the 113 touched items, 書面語 scan); whole suite 6 files, 109 tests.

## 階段 8c — 歷史故事 +12 (78 → 90): 戰爭故事 22 / 治國與時代發展 22 / 計謀 22 / 品德與勵志 24 — 已審核並已合併 (reviewed by the user and MERGED into master; the 「不肯定」 list below stays open for a human check of the original texts)
Content-only change (`historyContent.jsx`, `tests/content.test.js`, this file; `HistoryModule.jsx` untouched — tabs, counts and 相關詩詞 are all derived from the data). The 12 were approved by the user from my candidate list (no backups used). History questions have **no `skill` tag** (that field belongs to the 閱讀理解 module); format is the existing `{ prompt, options, correctIndex }`, 3 questions per new story, `correctIndex` 0 (FixedQuizFlow shuffles).
- **治國與時代發展 +6:** 玄奘西行取經 (p6), 王昭君出塞 (p6), 杯酒釋兵權 (s1), 李冰修都江堰 (p6), 魏孝文帝遷都洛陽 (s1, 北魏), 燕昭王千金買骨 (p6). **戰爭故事 +3:** 周亞夫細柳營 (p6), 文天祥抗元與〈過零丁洋〉 (s1), 郭子儀單騎退回紇 (s1). **計謀 +3:** 韓信背水一戰 (s1), 毛遂自薦 (p6), 觸龍說趙太后 (s1). All are `史書記載`, with a `sourceNote` wherever a detail is disputed or only in a later source.
- **Pairing:** only 文天祥 ↔ 〈過零丁洋〉 (`relation: 事件背景`, the one war poem that was still unpaired); `HISTORY_POEM_STORY_LINKS` is now 13. The other 11 stories are deliberately unpaired (a test enforces "exactly one link for the new stories").
- **How facts were checked:** `WebSearch` only (the sandbox cannot open ctext / wikisource / zdic pages), ≥ 2 independent results per story; the original 《史記》《漢書》《宋史》《舊唐書》《資治通鑑》《魏書》 texts were mostly NOT retrieved, so several stories rest on dictionary pages, school / museum teaching material and encyclopaedia summaries. Details that only one popular source gave, or that sources disagreed on, were left out of the story and are listed here.
- **Written with a caveat in `sourceNote`:** 玄奘 出發年份 627 (道宣《廣弘明集》, 日韓文獻) vs 629 (中文資料) — the story gives no year; 王昭君 毛延壽 (《西京雜記》, 作者有爭議) and 落雁 are 相傳, only in `sourceNote`; 昭君 「主動請行」 is from the 《後漢書》 only; 杯酒釋兵權 — 罷兵權 is in the 《宋史．太祖本紀》, the banquet dialogue only in 筆記 and its truth is questioned (the story says 「據筆記記載」, and gives the gist, not a quotation); 李冰 公元前256 (also 256–251) and the dispute over whether he did it alone; 孝文帝 = 北魏拓跋宏 (not 漢文帝), 493 以南伐為名 / 494 正式遷都; 燕昭王 黃金台 = 後世傳說; 文天祥 就義 = 農曆至元十九年十二月初九 = 1283-01-09 (so sources say 1282 or 1283); 郭子儀 聯軍人數 (10 萬 / 30 萬) not written; 韓信 兵力 numbers not written (only 「先派一萬人」); 毛遂 前257 vs 《資治通鑑》前258, and some of the dialogue is 史家渲染; 觸龍 / 觸讋 (the HK 教育局 material uses 觸讋).
- **不肯定 (searched, not found or sources disagree — NOT written in the stories):** 玄奘 高昌 / 麴文泰 and the number of years at 那爛陀寺; 《匈奴傳贊》 「邊城晏閉…」 (how many years of peace after 昭君); 杯酒 original wording in 《涑水記聞》 and the scholar who questioned it (only a popular article); 都江堰 飛沙堰 function, 二郎神 / 石人, 「天府之國」; 孝文帝 任城王元澄's role and 馮太后's role in the story, exact year of 禁胡服; 燕昭王 破齊 year, 「三年」 in the horse story; 文天祥 location of the execution (柴市: one source 城北, one 城南), the date the poem was written, 張弘範 being moved by the poem; 郭子儀 兵數 and who stopped him from going; 韓信 陳餘 / 李左車's roles; 毛遂 「三年」 and the sword-and-steps details; 觸龍 the year and 《史記．趙世家》's spelling of the name.
- **Tests:** `content.test.js` 42 → 48 (90 stories, unique ids / titles, 22 / 22 / 22 / 24, required fields, 4 distinct options, the 12 ids in order with 3 questions each, 書面語 scan incl. 同, the agreed caveats for 玄奘 / 昭君 / 孝文帝 / 觸龍 / 文天祥, link well-formedness and "only 文天祥 is paired"); whole suite 6 files, 115 tests.

## 階段 8d — 成語核對修正 (Oct 2026): 711 → 696 idioms — 已審核並已合併 (reviewed by the user and MERGED into master together with `docs/idiom-audit.md`; the 「不肯定」 lists below stay open) (本節由 `docs/idiom-audit.md` 的核對報告而來，只做用戶批准的部分)
Content change (`idiomContent.jsx`, `tests/content.test.js` 711 → 696, new `tests/idiom-compat.test.js`) plus one small logic addition (`Storage.pruneUnknownMistakes`, hooked in `Root.jsx`). `IdiomModule.jsx` untouched.
- **Deleted (15, all ids removed):** 煥然不同, 度量寬宏, 應付了事, 運籌決策, 正正當當, 重重困難, 由此可見, 意見分歧, 分出高下, 機會難得, 果敢決斷, 靈活變通, 碧水藍天, 大題小作, 自不量力 (自不量力 is a non-standard form of 不自量力, which stays).
- **克服萬難 → 排除萬難** (id `pai-chu-wan-nan`, a new id; the old id `ke-fu-wan-nan` is retired): 排除萬難 was NOT in the file; 《成語典》 does list 排除萬難 (ID 12487, 修訂本參考資料), so the entry was rewritten (pinyin, meaning, clue).
- **固步自封 → 故步自封:** 《成語典》 says explicitly that 「故」 must not be written 「固」, so the headword was changed; **id `gu-bu-zi-feng` kept** so learner records stay attached.
- **發憤圖強:** pinyin → `fā fèn tú qiáng` (id `fen-fa-tu-qiang` kept).
- **九牛一毛 / 引而不發 meanings extended with the dictionary's original sense** (quotes from search summaries of 《成語典》, not the page): 九牛一毛 「九頭牛身上的一根毫毛，比喻極大數量中的一小部分」 (國語辭典: 「許多牛身上的一根毛。比喻多數中的極少部分」); 引而不發 「拉開弓弦而不射箭。語出《孟子．盡心上》…後用以比喻善於啟發誘導，使其跟從學習，或準備妥當，伺機而行動」. Both were rewritten in 書面語 for P5–S1.
- **NOT changed — 歸根結蒂:** 《成語典》 lists 「歸根結蒂」 as an 也作 form (not as non-standard) and 漢典 treats it as the main form, so the user's condition (原寫法被明確列為不標準) is not met. 不肯定.
- **Registered as 不肯定 and left untouched (user decision):** 知恩圖報, 風景如畫, 輝煌燦爛, 苦思冥想, 團結一致, 山明水秀 / 山清水秀, 隨機應變 / 臨機應變, 無畏無懼, 難於上青天, 馬馬虎虎 (pinyin), 依樣畫葫蘆 (neutral-tone `lu`), 出人頭地 (meaning leans to 出類拔萃), 揚揚自得 (meaning), 冰釋前嫌, 標本兼治 and the other word-level items of `docs/idiom-audit.md`; the older doubts listed in 階段 8b (27 origins / 2 clues containing their own idiom, 九牛一毛 and 引而不發 now fixed) stay as they were. **運籌帷幄's meaning is kept; the earlier claim that 詞典 has no 「在後方」 was wrong (see 8b note).**
- **How learner data is keyed (checked before deleting):** the only per-idiom record is `moduleProgress.idiom.mistakes`, an array of idiom **ids** (strings). `practiceStats` and `stats.sessions` are plain counters; 稱號 / 里程 / 徽章 are computed from counters; the 成語稱號 stage count is `attempts / QUESTION_COUNT`. Nothing is keyed by idiom text. `sanitizeState` keeps any string id ≤ 100 chars (a backup of any age imports without error), `IdiomModule` filters `IDIOM_ITEMS` by `mistakes.includes(id)` (an unknown id simply never matches — no error).
- **Finding fixed on the way:** a retired id left in `mistakes` was harmless in the module but was still **counted** by Home / BackupSettings (`mistakes.length`), so deleting idioms would have inflated 「錯題 N」 forever. `Storage.pruneUnknownMistakes(state, moduleKey, validIds)` (pure; never throws; touches only that module's `mistakes`; returns the same object when nothing was dropped; does NOT count as 清除錯題) is called by `Root.jsx` (`dropRetiredIdiomMistakes`) when the state is first loaded and after a backup restore. Saving happens through the normal state effect; the stored backup file is never modified.
- **Tests:** `idiom-compat.test.js` (8): retired ids gone / fixes present; an old save with retired ids loads without error and keeps the strings; the review-list filter ignores them; prune drops only retired ids, mutates nothing, leaves every other module (incl. the same string in `history`) and all counters untouched, is idempotent, accepts junk; v1 and v2 old backups containing retired ids import fine (also round-trip through `buildBackup`). `content.test.js` count 711 → 696. Whole suite: 7 files, 123 tests.

## 階段 9a — 修辭手法：5 種題型、15 題、加強辨析 (Oct 2026) — 待審核 (NOT merged; waits for the user's review)
Changes: `src/rhetoricQuiz.jsx` (new, question generation only — plain JavaScript, no JSX / React, so node tests can run it), `RhetoricModule.jsx` (renders the objects it returns; header comment now says 10 devices), `rhetoricContent.jsx` (new optional fields), `index.html` (one script tag, after `rhetoricContent.jsx`), `tests/rhetoric-quiz.test.js` (new, 14 tests). No storage / backup change, no new stored field.
- **A session is 15 questions** (`RhetoricQuiz.QUESTION_COUNT`), five kinds in a random order (blocks of five, each a shuffle of all five kinds; never the same kind twice in a row), 3 of each: `device` 「這句運用了什麼修辭手法？」 · `effect` 「這句運用了「X」，這樣寫有什麼作用？」 · `find-sentence` 「以下哪一句運用了「X」？」(4 sentences) · `true-false` 「這句運用了「X」。這個說法正確嗎？」(正確 / 不正確 — `QuestionBlock` already draws any number of options, so 2 options work and no 4-option fallback was needed) · `effect-device` 「哪一種修辭手法的作用是「…」？」(effect shown without its final 。). Every question still returns `itemId` (the sentence it came from) so a wrong answer goes into 錯題本 as before; 練習錯題 (`chooseFrom`) still restricts which sentences are asked about while `pool` supplies wrong options.
- **`alsoDevices` (optional, on a practice sentence): other devices it genuinely also uses.** Such a sentence is never a wrong option for those devices (`find-sentence`), never a wrong option in 「這句運用了什麼修辭手法？」 / the 作用 question, and never the stem of a 是非題 (it is swapped into another kind, or asked as `device`). Only three sentences carry it (user-reviewed list in the 9a report): `paibi-4` 排比 + 比喻 (青春是歌／畫／旅程), `duiou-4` 對偶 + 對比, `duiou-12` 對偶 + 對比. `tests/rhetoric-quiz.test.js` fails if any other sentence gets `alsoDevices` — a new one needs an explicit approval.
- **`confusableWith` (optional, on a device): devices students mix it up with — always two-way, 1–3 entries.** 比喻: 擬人 誇張 · 擬人: 比喻 · 誇張: 比喻 · 對偶: 排比 對比 引用 · 排比: 對偶 反覆 · 反問: 設問 · 設問: 反問 · 反覆: 排比 · 引用: 對偶 · 對比: 對偶. Wrong options prefer these (`pickDeviceNames`: up to two confusable devices, the rest random; a device with only one confusable device gets just that one). Wrong 是非題 claims are always a confusable device of the sentence's own device.
- **`RHETORIC_EFFECT_CLASHES`** (rhetoricContent.jsx, 10 pairs): devices whose `effect` texts are too close for a student to tell apart. Two devices of a pair are never offered together in a question that shows effects (the 作用 question and `effect-device`). Strong: 比喻–擬人, 排比–反問, 排比–誇張, 誇張–反問, 誇張–反覆, 排比–反覆, 反問–設問; moderate: 反問–反覆, 擬人–誇張, 誇張–對比. **The effect texts themselves were NOT changed** (the user decides whether to reword them). Because of this rule a confusable device that also clashes (e.g. 反覆 next to 排比) is skipped in effect questions.
- **待確認 — sentences that may also use a second device, NOT given `alsoDevices` (the user decides):** 擬人 + 比喻 (彷彿／好像…似的): `niren-6`, `niren-9` · 誇張 + 比喻: `kuazhang-9`, `kuazhang-13`, `kuazhang-6` (+ 對比 for `kuazhang-9`) · 排比 + 反覆 (the app's own 反覆 tip says 開頭相同的三項屬排比): `paibi-1`, `paibi-7`, `paibi-12`, `paibi-13` · 排比 + 比喻 (澆灌希望): `paibi-15` · 設問 + 排比: `shewen-13` · 比喻 + 對比: `biyu-14`, `biyu-19` · 對偶 + 對比: `duiou-9`, `duiou-3` · 對偶 + 比喻: `duiou-2` (書山／學海), `duiou-14` (若比鄰) · 對偶 + 誇張: `duiou-16`. Until decided they can still appear as wrong options next to those devices.
- **Known register slips found while auditing, NOT changed (not asked for):** `kuazhang-3` 「隔壁條街」 (條 is Cantonese), the 設問 `tip` 「問完之後自己即刻回答」 (即刻 is Cantonese). The sentence-final particle 呢 in the 反問 sentences is ordinary written Chinese and was left.
- **Tests:** `tests/rhetoric-quiz.test.js` (14): the approved `alsoDevices` list is exact; `confusableWith` valid and two-way; clash list valid and every device keeps a clash-free option set; 15 questions with 3 of each kind for the full pool and each level; 4 distinct options (2 for 是非題) and a valid `correctIndex`; 「device」「effect」 wrong options never an `alsoDevices` and ≥ 2 confusable (as far as the clash rule allows); `find-sentence` has exactly one option using the asked device (device or alsoDevices) and four different devices; 是非題 stems never have `alsoDevices`, false claims are confusable devices, 2 + 1 true/false per session; `effect-device` effect belongs to the right option and no two options clash; 練習錯題 sessions and a 4-sentence pool still work; no colloquial wording. Checked to be sensitive: ignoring `alsoDevices`, switching off the clash rule, dropping the 是非題 guard and using non-confusable false claims each made the file fail (then reverted).
