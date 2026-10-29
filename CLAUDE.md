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
Four levels (階段 10a added the fourth): `p5` (小五), `p6` (小六), `s1` (中一), `s2` (中二 — covers 中二至中三, never split by year; see "階段 10").
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
10. **文言文選讀 (Classical Chinese Reading)** — ✅ built, standalone, 35
    texts across 4 batches (27 + 8 中二 in 階段 10b; see Module 10 details below) — added after the
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
  - **practice** — a **15-question** mixed quiz (階段 9b-2: seven kinds, built by `src/poetryQuiz.jsx` — see "階段 9b" at the end of this
    file; it was 8 questions of three kinds) auto-generated from whichever
    pool is in scope (the current level filter, or all items if the filter
    has fewer than 4 items): fill-in-the-blank (one line of a poem is hidden,
    4 whole-line options — the correct line plus 3 sampled from other poems —
    all tap-to-select, no typing), author MC ("《題目》的作者是誰？"), and
    meaning MC (shows the first line, asks which paraphrase matches), plus 接下句, 詩句配詩題, 字詞註釋 and 朝代. Ends
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
  - **practice** — a **15-question** mixed quiz (階段 9c: five kinds, 3 of each, built by `src/essayQuiz.jsx` — see "階段 9c" at the end of this
    file; it was 16 questions of three kinds): fill-in-the-blank (the
    `keyPhrase` is blanked out of the sentence, 4 tap-to-select phrase
    options — correct + 3 sampled from other items' `keyPhrase`),
    scenario-match ("情境：...，以下哪一句金句最適合？", 4 whole-sentence options),
    theme classification (shows the sentence, asks 描寫/抒情/論說 — all
    3 themes always shown, shuffled), plus 用法配對 and 情境是非. Same score-screen/persistence pattern
    as Module 1; results go to `moduleProgress.essay.practiceStats`.
- **Practice question count doubled from 8 to 16** per user feedback ("double up the question"); **階段 9c changed it to 15**
  (`EssayQuiz.QUESTION_COUNT`; five kinds × 3). Nothing stored depends on the session length (no stage-based 稱號 here — 科舉稱號 and 徽章
  count finished sessions), so no compatibility measure was needed.
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
  - **practice** — a **15-question** "成語猜猜"-style mixed game (階段 9b-1: five kinds, 3 of each, built by `src/idiomQuiz.jsx` — see "階段 9b"
    at the end of this file; it was 8 questions of three kinds), all
    tap-to-select (idioms are one of the modules where free typing is
    *not* appropriate, per the design brief): guess-the-idiom-from-clue
    (`clue` shown, 4 idiom options), match-idiom-to-meaning (idiom shown,
    4 meaning options), fill-the-missing-character (one character of
    the idiom blanked, 4 character options sampled from other idioms'
    characters), 故事猜成語 (the `origin` shown) and 是非判斷. Same score-screen/persistence pattern as earlier modules;
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
    `Math.floor(practiceStats.attempts / 8)` — safe because
    `Storage.recordPracticeResult` always adds the full `total` to `attempts` regardless of how many were answered
    correctly. **階段 9b changed the session length from 8 to 15 questions but NOT this unit:** the 8 is now
    `IdiomQuiz.STAGE_SIZE` (idiomQuiz.jsx, "legacy stage"), `IdiomQuiz.stagesFromAttempts(attempts)` is the one place that applies it, and a
    finished session adds 15 to `attempts`. So nobody's existing 成語稱號 drops (e.g. `attempts` 80 is still 10 stages = 舉人); the price is that
    a title now needs fewer *sessions* than before (秀才: 24 questions = 2 sessions instead of 3). `IdiomQuiz.sessionsToReach(attempts, minStages)`
    gives the 「再完成 N 次成語練習」 number. If `STAGE_SIZE` ever changes, stage counts computed from *old* `attempts` shift retroactively.
  - Shows a `MasteryBadge` card (current tier + emoji + blurb + "再完成 N
    次練習，即可晉升為「X」！") on the list view, computed from
    `priorAttempts` (`practiceStats.attempts` before the current session).
  - On the practice completion screen, compares the tier at `priorAttempts`
    vs. `priorAttempts + 15` (always the full session, not the correct count, since finishing a
    session — right or wrong — always advances the same amount); if they differ,
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
  level: "p5" | "p6" | "s1" | "s2",   // Storage.LEVELS; an unknown value falls back to "p5"
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

## Module 10 details — 文言文選讀 (new module, 35 texts across 4 batches)
- Added after the original 9 modules, following explicit user feedback
  ("修改要求5") that neither `poetryContent.jsx` (poems + a handful of prose
  excerpts folded into Module 1's generated MC-quiz flow) nor
  `historyContent.jsx` (vernacular-retold stories, no original classical
  text at all) actually deliver "read real classical-Chinese text with
  translation + glossary + comprehension questions" as its own standalone
  experience — hence a dedicated new module rather than extending either.
- Content: `src/content/classicalProseContent.jsx` — `CLASSICAL_PROSE_ITEMS`,
  35 entries (9×p5, 9×p6, 9×s1, 8×s2 — 階段 10b) with fixed fields: `id`, `title`, `source`
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
  this state should still wait for the user to ask again** — each
  batch was an explicit request; don't add a batch 5 to `CLASSICAL_PROSE_ITEMS` unprompted.
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

### 階段 10b — 文言文選讀 +8 中二 (s2) passages (Oct 2026) — 35 texts, 9 / 9 / 9 / 8 (小五 / 小六 / 中一 / 中二) — 已審核並已合併 (reviewed by the user against the 教育局 PDF and MERGED into master; the 「不肯定」 lists below are superseded by 「對照教育局 PDF 核對」)
Content-only change (`classicalProseContent.jsx`, `tests/content.test.js`, this file; `ClassicalProseModule.jsx` untouched — list, detail, seal, quiz and 錯題 chip are all driven by the data). Every item is `level: "s2"`
(shown as 「中二」; nothing says 中三 and no field claims a passage belongs to 中二 or 中三). Same schema as the other 27 (`lines` / `lineExplanations` equal length, `glossary` terms occur in `lines` or `title`, 5 questions each:
3 理解 + 1 字詞解釋 + 1 語譯填空, 4 different options, `correctIndex` 10 / 10 / 10 / 10 over the 40 questions, ≥ 3 positions per passage).
- **The 8 (all on the 教育局 junior-secondary recommended list, 第三學習階段; ids in `tests/content.test.js` `PROSE_10B`):** 傷仲永 (王安石, 北宋, whole text, 11 lines) · 鄒忌諷齊王納諫（節錄）(《戰國策．齊策一》, 戰國, 4 lines) · 賣柑者言（節錄）(劉基, 元末明初, 8 lines) ·
  楊修之死（節錄）(《三國演義》第七十二回, 元末明初, 8 lines) · 習慣說 (劉蓉, 清, 6 lines) · 貓捕雀 (薛福成, 清, 10 lines, whole text) · 管寧、華歆共園中鋤菜 (《世說新語．德行》, 南朝宋, 3 lines) · 荀巨伯遠看友人疾 (《世說新語．德行》, 南朝宋, 5 lines).
  Seals follow the existing rule (《世說新語．德行》 → 世說, 《戰國策．齊策一》 → 戰國, 《三國演義》第七十二回 → 三國, a single-author source → the author's first two characters: 王安 / 劉基 / 劉蓉 / 薛福).
- **愚公移山 was NOT added; 荀巨伯遠看友人疾 stands in (as the user's rule said).** The 教育局 text (KS3_03) writes 「太形、王屋二山」 where most textbooks write 「太行」, and printed editions also differ in 厝/措, 隴/陵 and other characters; the 教育局 PDF could not be opened, so the edition could not be settled.
  荀巨伯 is itself a 教育局 passage (KS3_07, 《世說新語》兩則 together with 管寧、華歆).
- **VERIFICATION LEVEL (be honest about it):** the sandbox cannot open edb.gov.hk, zh.wikisource.org, ctext.org or words.hk (egress policy, HTTP 403 / DNS), so **no 原文 was compared with a page character by character.** What was done: WebSearch only (its answers are summaries, and page titles
  show the first ~60–120 characters of the 教育局 KS3_xx PDFs). Each passage was checked (a) against the opening of the 教育局 PDF as shown in search results and (b) by asking, per paragraph, whether a draft differs from the 教育局 text / 維基文庫 / other sites; where the summaries reported the 教育局 wording it was followed.
  The drafts of 賣柑者言, 楊修之死 and 習慣說 were first written from memory and then corrected after the summaries showed differences (e.g. 楊修之死 opening, 賣柑者言 「予貿得其一」, 習慣說 first lines); **a human must still compare all 8 with the 教育局 PDFs**.
  Per passage: 傷仲永 — opening and first half reported identical to the 教育局 text; second half reported with 予 (not 余) and 邪 (not 耶), which were adopted (punctuation also followed the 教育局 text: 「問焉。曰：「泯然眾人矣。」」). 鄒忌 — only the second half is used (see 不肯定). 賣柑者言 — opening lines as in the 教育局 PDF title (「涉寒暑不潰；出之燁然…剖之如有煙撲口鼻」); the rest agrees with the summaries of 古文觀止 versions; after the review the vendor's sentence 「吾售之，人取之，未聞有言，而獨不足於子乎？」 was written back (see 審核後修正 below).
  楊修之死 — wording of the 教育局 text (沈吟, 食之無肉，棄之有味, 臨時慌亂, 遂亦收拾行裝) adopted over the 毛本 snippets (食之無味，棄之可惜, 遂亦收拾行裝 without 自 …); the second half was compared only partially. 習慣說 — opening line is quoted in the 教育局 PDF title; lines 2–6 rest on search summaries (one source for lines 4–6).
  貓捕雀 — the whole text was reported identical in the 教育局 text and 維基文庫 (two HK worksheets also show the first paragraph). 管寧、華歆 — 《世說新語》 text found on several sites; the 教育局 07b text was not seen. 荀巨伯 — reported identical to the 教育局 KS3_07 text (punctuation too).
- **粵拼 (jyutping): only 8 entries have one — each found on a dictionary page via search; everything else is deliberately left without `jyutping`** (the test `JYUTPING_10B_CHECKED` fails if another one is added):
  泯 man5 (泯滅 man5 mit6, Jyut Dictionary) · 蔽 bai3 (jyut.net table, words.hk) · 謗 bong3 (誹謗 fei2 bong3, Jyut Dictionary) · 柑 gam1 (柑桔 gam1 gat1, Jyut Dictionary) · 庖 paau4 (越俎代庖 … doi6 paau4, Jyut Dictionary) · 雞肋 gai1 laak6 (Jyut Dictionary) · 噬 sai6 (吞噬 tan1 sai6; the same site lists a different sai4 for another sense) · 噪 cou3 (噪音 cou3 jam1).
  Left out (no dictionary page found): 隸 扳 謁 諫 刺 鬻 貿 籩 瞽 衒 斁 糜 躓 窪 俛 輒 蹴 窒 雛 攫 啁啾 眈 歆 荀 軒冕 惇 …
- **楊修之死 is a novel:** the `background` says it is from 《三國演義》 (小說, 虛構和藝術加工), that the historical 楊修 is to be read from 《後漢書》 and other histories, and that the two differ; no historical detail is written (the 《後漢書》 text was not compared). The excerpt is only the 雞肋 incident (the 教育局 text's paragraphs 1–3 plus the end of that scene);
  the rest of the 教育局 text (other episodes) is not included. Test: the `background` must contain 《三國演義》, 小說, 《後漢書》 and 史實.
- **Excerpts (marked in the title and in `background`; 賣柑者言 updated by the review):** 鄒忌 = from 「於是入朝見威王」 to 「無可進者」 (the opening comparison with 徐公 and the closing 「燕、趙、韓、魏聞之，皆朝於齊」 are described in the `background`). 賣柑者言 = from the start to 「而以察吾柑」; only the author's last paragraph is left out (the 「……」 that first stood for one sentence of the vendor's speech is gone, see 審核後修正). 楊修之死 = the 雞肋 scene.
- **Edition choices to check (列入「不肯定」):** 傷仲永 予 / 余, 邪 / 耶, 金溪 / 金谿 (金溪 kept). 鄒忌: 羣臣 (the 教育局 teaching design writes 羣) and 蔽 (維基文庫 shows 敝); one other HK file reads 「臣吏民」 — 「羣臣吏民」 kept. **鄒忌 first half NOT used because the wife's reply is 「徐公何能及公也」 in some sources and 「及君也」 in others and it could not be settled.**
  賣柑者言: 禦 / 御 and 糜 / 縻 (**now 御 — the 教育局 PDF check confirmed 「不知御」; 糜 and 拖長紳 were confirmed unchanged**); 「鬻」 glossed as 買 (textbook habit; original sense 賣); the source book (《誠意伯文集》 / 《郁離子》) is not written; dynasty written 「元末明初」. 楊修之死: 楊修 / 楊脩; 羅貫中's dynasty written 「元末明初」 (his dates are unknown); 《三國演義》's edition is not named; the claim that the earliest 嘉靖本 has no 雞肋 episode (from a social-media post) is not written.
  習慣說: the text is the textbook version (整理自 《養晦堂文集》 〈習說〉; the remark about its length was removed from the 背景 at the review); 父 (not 先君子), 蹴然 (not 蹶然), 天下國家 (not 家國), 貴慎始 (not 貴乎慎始), 足苦躓焉 (not 足若躓焉) follow the 教育局 text as reported. 貓捕雀: the volume of 《庸盦文編》 and whether the title was added later are not written (some sites misprint 噪 as 嗓). 管寧、華歆: 寧讀如故 (some sites 寧讀書如故), 割席分坐 (some 分座).
  荀巨伯: 維基百科 shows 「敗義而求生」 against the 教育局 「敗義以求生」 (教育局 kept); his dates are not written. 傷仲永's date of writing and the 《王臨川集》 volume are not written (the book name is from an RTHK handout).
- **Tests (`content.test.js` 48 → 57 after the review fixes and the 教育局 PDF check; whole suite 13 files, 233 tests):** 35 passages, 9 / 9 / 9 / 8; every one of the four levels has a 文言文選讀 passage (only this module is checked against s2 — `FILLED_LEVELS` for the other modules still excludes it); the 8 ids are present, all s2, correct answers spread 10 / 10 / 10 / 10; 愚公移山 absent;
  a 節錄 title is explained in the `background`; 楊修之死 background words; no jyutping except the 8 checked ones; no 「中二」 / 「中三」 anywhere in the new items; a colloquial-word scan (呢個 咩 嘅 咗 唔 喺 …) and **「同」 only inside ordinary compounds (同學 同時 相同 共同 同情 不同 同一 同樣 同鄉 同窗 同類 同宗族)** over everything a child sees except the 原文 (the 原文 keeps 「又嘗同席讀書」);
  the settled wording of each 原文 (予…邪, 羣臣, 剖之如有煙撲口鼻, 沈吟…臨時慌亂…遂亦收拾行裝, 蹴然以驚 …) so a variant cannot slip in unnoticed.
- **審核後修正 (user review of 10b, six items; nothing else touched):**
  1. 賣柑者言 question 4 is now 「字詞解釋：「涉寒暑不潰」的「涉」，在句中的意思是」 with 涉水 / 牽連 / 經歷 / 干預, correct 「經歷」 kept at the same `correctIndex` (2), so the 40 answers are still 10 / 10 / 10 / 10 over positions 0 / 1 / 2 / 3. The glossary entry 「鬻」 stays, meaning → 「本義是賣，課文這裏解作買」 (the 「涉」 glossary entry already existed).
  2. 賣柑者言's omitted sentence checked by WebSearch (summaries only; edb.gov.hk / wikisource still cannot be opened). The user's wording 「吾售之，人取之，未嘗有言，而獨不足子所乎？」 is found in several 古文觀止-based sites (古詩文網, 讀古詩詞網, 永恆墨詩, 古文之家 and a 高中 classical-text site — 「未嘗有言」 + 「子所乎」), **but the 教育局 KS3_22 text was reported by two search summaries as 「未聞有言，而獨不足於子乎」,
     and one summary gives 「未嘗有言…於子乎」 for 維基文庫.** So the sentence is attested in ≥ 2 sources in both forms; as the rule says (教育局 or common textbook wording) the **教育局 wording 「吾售之，人取之，未聞有言，而獨不足於子乎？」 was written back**, with its 白話 (「我把柑子賣給別人，別人買去，從來沒有誰說過什麼，為什麼偏偏您不滿意呢？」) and the 「……」 / 「（中間有一句省略。）」 removed; the `background` now says only the last paragraph is left out (no 「各版本用字不同」).
     **Please compare this one sentence with the 教育局 PDF** (the alternatives are 未嘗有言 and 子所乎 / 於子所乎). A test checks the sentence is present and no 「……」 remains.
  3. 習慣說 `background`: 「，篇幅比原文簡短」 deleted. 4. 管寧、華歆 `background`: 「早年是同窗」 → 「兩人本是朋友」. 5. 鄒忌 `background`: 「成書約在秦統一天下以後」 → 「由西漢劉向整理編訂為《戰國策》」, then at a second review the whole clause became 「大抵不是一時一人之作，後來由西漢劉向整理編訂成書」 (the repeated 《戰國策》 is gone). 6. 楊修之死 `background`: 「課文其餘部分記述楊修平日的其他言行，這裏沒有收錄」 → 「小說中另有楊修的其他故事，這裏沒有收錄」.
  Test `prose 10b review fixes` covers all six; the settled-wording test now also checks the 賣柑者言 sentence.
- **對照教育局 PDF 核對（8 篇逐字，已審核）:** the user (Charles) compared all 8 passages with the 教育局《初中建議學習篇章》 PDF word by word. **Decision: 用字及標點全部跟教育局版.** 傷仲永 and 貓捕雀 were identical (not touched); everything the earlier 「不肯定」 lists named as a 教育局 reading was confirmed (予…邪, 羣臣, 蔽, 未聞有言…於子乎, 糜, 拖長紳, 沈吟, 臨時慌亂, 遂亦收拾行裝, 蹴然以驚, 天下國家, 寧讀如故, 敗義以求生, 噪).
  Only the following were changed (all `lines`, plus the places that quote them):
  - **用字 (3):** 賣柑者言 「不知禦」 → 「不知御」 (line 6 and the 語譯填空 question 「盜起而不知御，民困而不知救」, which is question 5 — question 4 is the 「涉」 word question; 白話 keeps 「抵禦」, the option 「治國禦敵」 is a different word and stays; new glossary entry 「御」：通「禦」，抵禦) ·
    習慣說 「嗚呼！習之中人甚矣哉！」 → 「噫！習之中人甚矣哉！」 (no question / glossary / 白話 quoted 「嗚呼」; no glossary entry for 「噫」 was added because none was asked) · 楊修之死 「繞寨私行」 → 「遶寨私行」 (new glossary entry 「遶」：同「繞」，繞着; the 白話 keeps 「繞着營寨」). The 貓捕雀 glossary 「烏虖：相當於「嗚呼」」 is correct and was not touched.
  - **標點 (逐句，改成教育局版):** 鄒忌 line 2 (「宮婦左右，莫不私王；朝廷之臣，莫不畏王，四境之內，莫不有求於王。由此觀之，王之蔽甚矣。」) · 賣柑者言 (「實籩豆、奉祭祀、供賓客乎」, 「甚矣哉，為欺也！」, 「吾業是有年矣。吾賴是以食吾軀」, 「世之為欺者，不寡矣」, 「授孫吳之略耶」, 「建伊皋之業耶」, 「而不知恥；」, 「敗絮其中也哉！」) ·
    楊修之死 (10 places: 「進雞湯，操見」, 「口號，操隨口曰：「雞肋，雞肋。」」, 「楊修見傳」, 「夏侯惇，惇大驚」, 「退兵歸也。雞肋者」, 「班師矣，故先」, 「肺腑也。」, 「行裝，於是」, 「楊德祖，先知」, 「造言亂我軍心」) · 習慣說 (「何以天下國家為？」, 「坦然則既平矣！已而復然」) · 管寧、華歆 (「寧割席分坐曰：「子非吾友也。」」) · 荀巨伯 (「子令吾去；敗義以求生」).
  - **Two quotations of the old punctuation were synced too (the grep over `lines` / `lineExplanations` / `glossary` / `questions` / `background` found them):** the 賣柑者言 question 2 prompt 「世之為欺者不寡矣」 → 「世之為欺者，不寡矣」 and the 楊修之死 白話 「曹操隨口說：「雞肋！雞肋！」」 → 「雞肋，雞肋。」 (punctuation inside the quotation only).
  - **Tests:** the 賣柑者言 settled-wording assertions were updated (御, 「世之為欺者，不寡矣」); new test `prose 10b 教育局 PDF 對照` checks the 3 用字 changes (and no 「不知禦」 / 「嗚呼」 / 「繞寨私行」 in any of lines / 白話 / glossary / questions / background of the passage), every new punctuation string is in `lines` and every old one is nowhere. The 字詞 scan for 「同」 now ignores 「同「…」」 (a 通假 gloss, i.e. 「同「繞」」).
  The 「VERIFICATION LEVEL」 paragraph above describes the state before this check (WebSearch summaries only); the 教育局 PDF comparison by the user replaces it for these 8 passages.
- **Verified (Playwright, test mode, 820 and 390):** at 中二 the 文言文選讀 list shows exactly the 8 titles, no 「中二內容陸續加入」 note, no truncated list line; each passage opened (all 原文 lines, 白話, glossary terms / meanings, 粵拼, 背景 present; seal as above; no horizontal overflow, no clipped text, text ≥ 13 px, taps ≥ 44 px); each quiz run with question 2 answered wrong → 「答對了 4 / 5 題」, the chip 「📝 只看錯題 (8)」 appears and 8 ids are stored; a perfect rerun of one passage clears it (8 → 7);
  `chineseOps:v1` never written; the other 7 levelled modules still show the note at 中二; console errors 0. **Hash comparison with master `5ffba8e` (412 screens at 820 / 390: home and the 10 modules' first screens at 小五 / 小六 / 中一, every 小五 / 小六 / 中一 passage's detail and first question, plus the earlier 232-screen suite):** 404 identical; the 8 that differ are all the 文言文選讀 list with the 全部 tab (6 in the new check + the 2 `7-back-to-list` screens of the old suite, which sit on 全部), which now has 8 more rows.

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
- [x] Module 10 — 文言文選讀 (35 texts across 4 batches; see Module 10 notes)

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
- [ ] Expand reading passage library further beyond the current 50 curated items (34 + 8 中二 from 階段 10c-1 + 8 中二 from 階段 10c-2 — new 理解/語文 question format — see Module 7 REBUILD, 階段 7 C 批, 階段 10c-1 and 階段 10c-2)
- [ ] Expand rhetoric practice sentences further beyond the current 200 curated items
- [ ] Expand punctuation practice items further beyond the current 30 curated items
- [ ] Classical prose library at 35 texts (4 batches so far: 9 / 9 / 9 / 8 at 小五 / 小六 / 中一 / 中二) — expand
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
  `stateRef` snapshot instead. Idiom's stage count (`attempts / IdiomQuiz.STAGE_SIZE`, 8) is unaffected.
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
  all passed). Run one file: `node tests/storage.test.js`. Expected today: 13 files, **247 tests**.
- **How it works:** `tests/helpers.js` reads `src/Storage.jsx` (plain JS, no JSX) and runs it in a
  `node:vm` sandbox with a stub `window` / `localStorage` / `URLSearchParams`, exactly as the browser
  loads it, then hands back `window.App.Storage`. `loadStorage({ initial, search })` pre-fills
  `chineseOps:v1` and/or sets the URL query (`"?today=2026-10-12"` = 測試模式); `makeRunner(label)`
  gives the `t(name, fn)` / `t.done()` helpers. A failed `assert` makes the file exit non-zero.
- **Files:** `storage.test.js` (28 — 階段 10a added 5: LEVELS, s2 save / backup round trip, unknown level → p5; v1/v2 backup import, `loadState` migration, garbage input, dates,
  `pickMissions`, `recordSession` streak / 保護符 / rollover / clock-went-back scenarios,
  `getStreakView`, `removeMistake` counting) · `badges.test.js` (12 — exact approved names/order,
  thresholds, retroactive 累計答對, module badges, backup round trip) · `notices.test.js` (13 —
  `buildNotices` wording and "never re-announce an already-earned badge") · `test-mode.test.js` (7 —
  the test key never touches `chineseOps:v1`; test backups refused in normal mode) ·
  `titles.test.js` (12 — 科舉稱號 tiers / 模組里程 boundaries, junk input, read-only; see "UI system — A2") ·
  `idiom-compat.test.js` (8 — 階段 8d: retired idiom ids vs old saves / old v1+v2 backups / `pruneUnknownMistakes`; see "階段 8d") ·
  `level.test.js` (9 — 階段 10a: `QuizUtils.itemsForLevel` (the empty-level fallback) on the real and on patched content for the 8 levelled modules, every `*_LEVEL_LABEL` knows s2, the modules take their level options from `Storage.LEVELS`; see "階段 10") ·
  `history-quiz.test.js` (27 — 階段 9d: runs `src/historyQuiz.jsx` (+ `quizPlan.jsx`) thousands of times and checks one defensible answer per question, the 朝代歸一 table, `HISTORY_SIMILAR_GROUPS`, the same-event / shared-person rule, 事件先後 and the tricky-people cases; see "階段 9d") ·
  `essay-quiz.test.js` (15 — 階段 9c: runs `src/essayQuiz.jsx` thousands of times and checks one defensible answer per question, `ESSAY_SIMILAR_GROUPS`, same-theme wrong options, 情境是非 balance; see "階段 9c") ·
  `idiom-quiz.test.js` (15 — 階段 9b-1: runs `src/idiomQuiz.jsx` (+ `quizPlan.jsx`) thousands of times and checks one defensible answer per question, the synonym groups, story fallback, 是非題 balance and 成語稱號 compatibility; see "階段 9b") ·
  `poetry-quiz.test.js` (15 — 階段 9b-2: runs `src/poetryQuiz.jsx` thousands of times; real library + small synthetic libraries for cases the library does not contain yet — a line in two poems, no annotations, < 4 dynasties; see "階段 9b") ·
  `rhetoric-quiz.test.js` (15 — 階段 9a: runs `src/rhetoricQuiz.jsx` thousands of times with a seeded `Math.random` and checks every question has one defensible answer; see "階段 9a") ·
  `content.test.js` (71 — rhetoric, essay, 文言文選讀 (incl. the 8 中二 passages of 階段 10b), 閱讀理解 (incl. the 16 中二 passages of 階段 10c-1 / 10c-2), 成語 and 歷史故事 content; it loads the content files in a `node:vm` sandbox, so a
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

## 階段 9a — 修辭手法：5 種題型、15 題、加強辨析 (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master; the 「待確認」 list below stays open)
Changes: `src/rhetoricQuiz.jsx` (new, question generation only — plain JavaScript, no JSX / React, so node tests can run it), `RhetoricModule.jsx` (renders the objects it returns; header comment now says 10 devices), `rhetoricContent.jsx` (new optional fields), `index.html` (one script tag, after `rhetoricContent.jsx`), `tests/rhetoric-quiz.test.js` (new, 15 tests). No storage / backup change, no new stored field.
- **A session is 15 questions** (`RhetoricQuiz.QUESTION_COUNT`), five kinds in a random order (blocks of five, each a shuffle of all five kinds; never the same kind twice in a row), 3 of each: `device` 「這句運用了什麼修辭手法？」 · `effect` 「這句運用了「X」，這樣寫有什麼作用？」 · `find-sentence` 「以下哪一句運用了「X」？」(4 sentences) · `true-false` 「這句運用了「X」。這個說法正確嗎？」(正確 / 不正確 — `QuestionBlock` already draws any number of options, so 2 options work and no 4-option fallback was needed) · `effect-device` 「哪一種修辭手法的作用是「…」？」(effect shown without its final 。). Every question still returns `itemId` (the sentence it came from) so a wrong answer goes into 錯題本 as before; 練習錯題 (`chooseFrom`) still restricts which sentences are asked about while `pool` supplies wrong options.
- **`alsoDevices` (optional, on a practice sentence): other devices it genuinely also uses.** Such a sentence is never a wrong option for those devices (`find-sentence`), never a wrong option in 「這句運用了什麼修辭手法？」 / the 作用 question, and never the stem of a 是非題 (it is swapped into another kind, or asked as `device`). **14 sentences carry it (all approved by the user in two reviews):** `paibi-4` 排比 + 比喻 (青春是歌／畫／旅程) · `duiou-4` 對偶 + 對比 · `duiou-12` 對偶 + 對比 · `niren-6` 擬人 + 比喻 (彷彿) · `niren-9` 擬人 + 比喻 (好像…似的) · `kuazhang-9` 誇張 + 比喻 · `kuazhang-13` 誇張 + 比喻 · `kuazhang-6` 誇張 + 比喻 (流成一條小河) · `paibi-15` 排比 + 比喻 (澆灌希望) · `biyu-14` 比喻 + 對比 (不是…而是) · `duiou-9` 對偶 + 對比 · `duiou-3` 對偶 + 對比 + 比喻 · `duiou-2` 對偶 + 比喻 (書山／學海) · `duiou-14` 對偶 + 比喻 (若比鄰). `tests/rhetoric-quiz.test.js` fails if any other sentence gets `alsoDevices` — a new one needs an explicit approval.
- **`confusableWith` (optional, on a device): devices students mix it up with — always two-way, 1–3 entries.** 比喻: 擬人 誇張 · 擬人: 比喻 · 誇張: 比喻 · 對偶: 排比 對比 引用 · 排比: 對偶 反覆 · 反問: 設問 · 設問: 反問 · 反覆: 排比 · 引用: 對偶 · 對比: 對偶. Wrong options prefer these (`pickDeviceNames`: up to two confusable devices, the rest random; a device with only one confusable device gets just that one). Wrong 是非題 claims are always a confusable device of the sentence's own device.
- **`RHETORIC_EFFECT_CLASHES`** (rhetoricContent.jsx, 10 pairs): devices whose `effect` texts are too close for a student to tell apart. Two devices of a pair are never offered together in a question that shows effects (the 作用 question and `effect-device`). Strong: 比喻–擬人, 排比–反問, 排比–誇張, 誇張–反問, 誇張–反覆, 排比–反覆, 反問–設問; moderate: 反問–反覆, 擬人–誇張, 誇張–對比. **The effect texts themselves were NOT changed** (the user decides whether to reword them). Because of this rule a confusable device that also clashes (e.g. 反覆 next to 排比) is skipped in effect questions.
- **待確認 — still open, NOT given `alsoDevices` (the user decided not to add them for now):** 排比 + 反覆 (the app's own 反覆 tip says 開頭相同的三項屬排比): `paibi-1`, `paibi-7`, `paibi-12`, `paibi-13` · 設問 + 排比: `shewen-13` · 比喻 + 對比: `biyu-19` · 對偶 + 誇張: `duiou-16`. They can still appear as wrong options next to those devices.
- **Register fixes (user-approved, done):** `kuazhang-3` 「隔壁條街」 → 「隔壁那條街」; the 設問 `tip` 「問完之後自己即刻回答」 → 「問完之後自己立刻回答」. A scan of `rhetoricContent.jsx`, `RhetoricModule.jsx` and `rhetoricQuiz.jsx` for 呢個 咩 嘅 咗 唔 喺 哋 嘢 啲 佢 冇 乜 嚟 點解 邊個 而家 即刻 嗰 咁 好似 and 條 as a Cantonese classifier found nothing else (the other 條 are ordinary written Chinese: 有條理, 一條小河, 這條河, 一條長長的鐵鏈; the sentence-final 呢 in 反問 sentences is ordinary written Chinese too). The test now scans every sentence, definition, tip, effect and example for these words.
- **Tests:** `tests/rhetoric-quiz.test.js` (15): the approved `alsoDevices` list is exact; `confusableWith` valid and two-way; clash list valid and every device keeps a clash-free option set; 15 questions with 3 of each kind for the full pool and each level; 4 distinct options (2 for 是非題) and a valid `correctIndex`; 「device」「effect」 wrong options never an `alsoDevices` and ≥ 2 confusable (as far as the clash rule allows); `find-sentence` has exactly one option using the asked device (device or alsoDevices) and four different devices; 是非題 stems never have `alsoDevices`, false claims are confusable devices, 2 + 1 true/false per session; `effect-device` effect belongs to the right option and no two options clash; 練習錯題 sessions and a 4-sentence pool still work; no colloquial wording. Checked to be sensitive: ignoring `alsoDevices`, switching off the clash rule, dropping the 是非題 guard and using non-confusable false claims each made the file fail (then reverted).

## 階段 9b — 成語、詩詞：新題型、每次 15 題 (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master; two commits: 9b-1 成語 `e14f1d0`, 9b-2 詩詞 `f49aae4`; the 待確認 lists below stay open)
Shared helper `src/quizPlan.jsx` (`window.App.QuizPlan = { planKinds, trueFalseFlags }`, loaded after `quizUtils.jsx`): `planKinds(items, kinds, eligible)` deals the question kinds out in
blocks, each block a shuffle of all kinds, a block never starts with the kind the previous block ended on (so no kind twice in a row); an item that a kind cannot be built from
(`eligible(kind, item)` false) is swapped with another slot that suits both, or its slot is changed to the eligible kind used least so far — never an empty / broken question.
`trueFalseFlags(n)` = the 9a 是非題 rule (about half true over many sessions: alternating flags, shuffled, the majority side chosen at random per session).
Like 9a, the generators are plain JavaScript with no screen code (`src/idiomQuiz.jsx`, `src/poetryQuiz.jsx` → `window.App.IdiomQuiz` / `PoetryQuiz`, `buildQuestions(pool, count, chooseFrom)`
returns plain objects with `itemId`); the module files only draw them. `chooseFrom` (練習錯題) restricts the asked items while `pool` / the whole library supplies wrong options.

### 9b-1 成語 (`idiomQuiz.jsx`, `IdiomModule.jsx`, `idiomContent.jsx`)
- **A session is 15 questions: 3 of each of 5 kinds** in a random order — `clue` 成語猜猜 · `meaning` 「X」是什麼意思？ · `fill-char` 填字砌成語 · **`story` 故事猜成語**
  (stem = the `origin`, 「這個故事和哪個成語有關？」, 4 idiom options) · **`true-false` 是非判斷** (「X」的意思是「Y」。這個說法正確嗎？ — 正確／不正確, true ≈ half; a false
  claim uses the meaning of an unrelated idiom, preferring the same level).
- **故事猜成語 only for idioms whose `origin` does not give them away** (`IdiomQuiz.storyUsable`): 235 of the 270 idioms with an `origin` (p5 23 / p6 148 / s1 64). The other 35 — whose origin
  contains the whole idiom or 3 consecutive characters of it (these are the older entries; the 8b entries never do) — are never asked as a story: 半途而廢 一鳴驚人 罄竹難書 尾大不掉 大煞風景 毛遂自薦
  司空見慣 作繭自縛 每況愈下 刮目相待 東窗事發 孤注一擲 炙手可熱 恃強凌弱 流連忘返 袖手旁觀 唇槍舌劍 鹿死誰手 無濟於事 義不容辭 綽綽有餘 維妙維肖 實事求是 裹足不前 樂不思蜀
  隨波逐流 獨當一面 獨佔鰲頭 鞠躬盡瘁 鍥而不捨 豁然開朗 覆水難收 歸根結蒂 穩操勝券 躊躇滿志. Wrong story options never come from the same story (the two `origin` texts share no run of 3 characters,
  and the wrong idiom is not named in the origin). `buildQuestions` first makes sure the 15 asked idioms contain enough usable origins for the 3 story slots whenever the source has them; an idiom
  without one in a slot is swapped or its slot changes kind (練習錯題 of idioms without origin therefore has fewer or no story questions, never an error).
- **`IDIOM_SYNONYM_GROUPS`** (idiomContent.jsx, written by idiom text, **83 groups covering 249 idioms**, an idiom may sit in several groups; the list is in the 9b report and below only in the file): idioms whose
  meanings are close enough that a student could fairly pick either. **A wrong option is never in a common group with the right answer** (clue, meaning, story options; the 是非題's false meaning).
  Second, automatic guard `IdiomQuiz.meaningsSimilar`: cleaned `meaning` texts that share ≥ 2 bigrams and have bigram-Jaccard ≥ 0.2 are also "related" (catches pairs the list does not name, mostly
  antonyms / topic neighbours such as 表裏如一 vs 表裏不一, 名副其實 vs 名不副實, 因地制宜 vs 因時制宜 — 27 such pairs exist beyond the groups; the scan found 76 pairs in all, 49 of them inside groups).
  No two idioms have the identical `meaning`. **Borderline cases are NOT forced into the list — see 待確認.**
- **成語稱號 compatibility (decision, approved by the user — keep ÷ 8):** progress is still `floor(practiceStats.attempts / 8)` (`IdiomQuiz.STAGE_SIZE = 8`, `stagesFromAttempts`); a session adds 15. Nobody's title goes
  down (attempts 80 = 10 stages = 舉人 before and after). A new title needs fewer sessions than before (秀才 = 24 questions = 2 sessions, was 3). Alternative: divide by 15 — would demote existing records.
- **待確認 (idiom groups, loose edges):** group 7 (勤學：手不釋卷 … 廢寢忘食, 7 members), group 25 (堅持：持之以恆 … 堅苦卓絕, 9), group 29 (交情：管鮑之交 … 心心相印, 5), group 39 (景色：山清水秀 … 春花秋月, 6),
  group 51 (守舊：食古不化 … 按圖索驥, 6), group 83 (刎頸之交／生死與共 bridge) — kept broad on purpose because a too-wide group only removes some wrong options, but they could be trimmed. The 27
  auto-guard-only pairs (list in the 9b report) are left to the similarity guard rather than added to the list.
- **Tests:** `tests/idiom-quiz.test.js` (15): group members exist; 15 questions, 3 of each kind, no kind twice in a row (full pool + each level); random kind order; unique `itemId`s; **5000 sessions over the full
  pool + 800 per level + 練習錯題 sets: every question has exactly one defensible answer (0 violations)**; story fallback when the mistaken idioms have no usable origin; origin leak rule; 是非題 true share within ±0.05
  over 5000 sessions; `STAGE_SIZE` compatibility; 書面語 scan. Mutation-checked (each made the file fail, then reverted): drop the whole synonym rule / only the groups / only the similarity guard /
  the same-story rule, all-true 是非題, fixed kind order, fill-char without the "does not complete another idiom" rule, story without the leak rule, story kind without the eligibility repair.

### 9b-2 詩詞 (`poetryQuiz.jsx`, `PoetryModule.jsx`)
- **A session is 15 questions over 7 kinds** (was 8 questions of 3 kinds): the existing `fill` 填空 · `author` 作者 · `meaning` 句意, plus **`next-line` 接下句** (a line is shown with 《title》·author; pick the line that directly
  follows) · **`line-title` 詩句配詩題** (a line → 《title》) · **`annotation` 字詞註釋** (「在《X》中，「term」是什麼意思？」, the line containing the term is shown) · **`dynasty` 朝代** (「《X》的作者是「Y」。這位作者生活在哪一個朝代？」 — 「這位作者」, not 他/她).
  **Kind rule (approved by the user):** `planKinds` deals the 7 kinds in blocks of seven (each block a shuffle of all seven, never starting with the kind the previous block ended on) → 15 = two full blocks + the first
  slot of a third, so **every kind appears at least twice, exactly one kind (random) three times, never the same kind twice in a row**. An item a kind cannot be built from is swapped to another slot or its slot changes kind.
- **Rules per kind** (all in the file header comment): "……" (the 節錄 omission marker) is never a stem / answer / option (only lines with a Chinese character count). *next-line:* stem and answer are neighbouring real lines of
  the same work; a stem line occurring twice in its work is skipped; a wrong line is never a line of the same work; wrong lines come from other works (the asked pool first, then the whole library), preferring the same kind of work
  (poem / prose), a similar length and **the same closing punctuation** (otherwise the 「，」/「。」 pattern gives the answer away). *line-title:* only a line that occurs **exactly once in the whole library** (`lineCount`) and does not
  contain a part of its own title; wrong titles never share the answer's base title (憫農（其一）／（其二）) and are not named in the line. The real library currently has **no** line occurring in two poems — the rule is tested with a
  synthetic library (a copy of 靜夜思). *annotation:* wrong meanings come from other terms, share no two-character word with the right meaning (very short meanings: no shared character), mention neither term, prefer the same kind of
  explanation (`meaningKind`: place / state / thing / figure / refer / variant / word) and a similar length; **meanings are shown without a closing 「。」** (only some entries have one — it would give the answer away). *dynasty:* wrong
  dynasties are other dynasties of the library (**6: 唐 45 / 宋 22 / 晉 3 / 清 2 / 春秋 1 / 戰國 1 poems**); 春秋 and 戰國 are never offered against each other; `DYNASTY_BORDERS` = 陶淵明 → 宋 (his life ran into 劉宋) is never a
  wrong option; with fewer than four dynasties the options are padded from `COMMON_DYNASTIES` (漢 三國 隋 唐 宋 元 明 清) — not used with the real library, tested with a 唐/宋-only library.
- **Scope unchanged:** `PoetryModule` still passes the level-filtered list or, from the 戰爭詩詞 tab, the 10-poem `scopeItems` as `pool`; 練習錯題 passes `chooseFrom`. `buildQuestions(pool, count, chooseFrom, allItems)` takes the whole library as an
  optional fourth argument (default `POETRY_ITEMS`) so tests can inject synthetic libraries.
- **待確認 (poetry):** (1) 朝代 tags are the file's `dynasty` field as is (陶淵明 晉, 孔子及其弟子 春秋, 孟子 戰國, 文天祥 宋); only 陶淵明 / 春秋–戰國 were judged ambiguous. (2) 字詞註釋 asks the entry's meaning *in that poem*; a few
  single-character terms (斯, 爾, 渠, 元) are context-specific, the shown line gives the context. (3) The existing `meaning` question (`meaningQuiz` sentences) was not changed — its wrong options can still be near-synonyms of
  the right sentence in principle (not checked here).
- **Tests:** `tests/poetry-quiz.test.js` (15): 15 questions, kinds ≥2 each / one 3 times, never repeated in a row (full, level, scope pools); random order; **5000 full-library sessions + 1000 per level + 1500 ten-poem scope sessions + 800 練習錯題
  sets, 0 violations of "exactly one defensible answer"**; omission-line poems; synthetic libraries (duplicate line, no annotations, unusable stems, < 4 dynasties); 書面語 scan (no 同). Mutation-checked (each made the file fail,
  then reverted): drop the duplicate-line rule, drop the same-work-lines rule, allow "……" options, fixed kind order, drop the annotation word-overlap rule, drop the 春秋/戰國 rule, drop the 陶淵明 border, drop the same-base-title rule,
  annotation kind without its eligibility repair, keep the closing 「。」 in annotation options.

## 階段 9c — 作文金句：2 種新題型、每次 15 題 (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master; the 待確認 list below stays open)
Changes: `src/essayQuiz.jsx` (new, question generation only — plain JavaScript, same pattern as `idiomQuiz.jsx` / `poetryQuiz.jsx`; kinds dealt by `quizPlan.jsx`), `EssayModule.jsx` (renders the objects it returns),
`essayContent.jsx` (new constant `ESSAY_SIMILAR_GROUPS`), `index.html` (one script tag after `essayContent.jsx`), `tests/essay-quiz.test.js` (new, 15 tests). No storage / backup change, no new stored field.
- **A session is 15 questions: 3 of each of 5 kinds** in a random order (blocks of five, never the same kind twice in a row), was 16 questions of three kinds: `fill` 填空 · `scenario` 情境配金句 · `theme` 主題分類 ·
  **`usage` 用法配對** (the sentence is shown, 「這句金句的用法是哪一項？」, options = 4 `usage` texts) · **`scenario-tf` 情境是非** (「情境『…』適合用這句金句：『…』。這個說法正確嗎？」 — 正確／不正確,
  true ≈ half by the 9a rule; a false claim uses the scenario of an unrelated sentence). 練習錯題 (`chooseFrom`) uses all five kinds; wrong options always come from the whole library when the mistake set is small.
  No compatibility measure was needed: nothing stored depends on the number of questions per session (no stage-based 稱號 in this module; 科舉稱號 / 徽章 count finished sessions).
- **Wrong options** (`pickWrong`): never a sentence of a common `ESSAY_SIMILAR_GROUPS` group with the asked one; **same theme preferred**, then the asked pool, then a similar length (so the length of the right
  phrase / sentence / usage does not give it away); never the same text twice; a wrong 填空 phrase never occurs inside the sentence itself (真實例子：「咬緊牙關」 is inside the 長跑 sentence). The existing 情境配金句 question
  now uses the same rule (it used to take random other sentences of the pool).
- **`ESSAY_SIMILAR_GROUPS`** (essayContent.jsx, written by id, **36 groups covering 81 of the 150 sentences** (24 from the first version + 12 added after the user's review, see below), a sentence may sit in several groups): sentences whose `scenario` / `usage` are close enough
  that a student could fairly say either sentence fits the other's situation. Hand-made: a text-similarity guard was tried (bigram overlap of scenario / usage) and **rejected** — it flags pairs that are only
  worded alike (愛護公物 / 愛護動物, 閱讀 / 自律「對個人成長的重要性」) and misses close ones, so it would have been noise. Keyword scans (堅持, 感激, 思念, 不捨, 友誼, …) were used to find pairs the first reading missed.
  Scenarios, usages, keyPhrases and sentences are all unique (a test enforces it).
1. parents-love、parents-sacrifice、mother-cold-towel
2. gritting-teeth、unyielding-spirit、facing-setback、drop-wears-stone、chasing-dreams、late-study、tired-runner
3. missing-family、distant-friendship
4. missing-family、hometown-longing
5. grateful-teacher、teacher-white-hair
6. school-farewell、transfer-school、farewell-sorrow
7. farewell-sorrow、first-trip-alone
8. time-flies、childhood-album、corridor-memory
9. old-wine-friendship、distant-friendship
10. rain-pearls、storm-wind
11. bustling-market、playground-joy、beach-play
12. busy-city、mtr-crowd
13. nervous-heartbeat、exam-nerves、starting-line
14. autumn-leaves、autumn-valley
15. mountain-dawn、fishing-village-fog
16. winter-snow、winter-breath
17. no-gain-without-effort、drop-wears-stone
18. knowledge-ladder、value-of-reading、never-stop-learning
19. time-management、plan-ahead
20. tolerance-wisdom、respect-views、empathy-bridge
21. importance-of-exercise、early-to-bed、balanced-diet
22. frugality-virtue、waste-food
23. power-of-words、online-responsibility
24. finish-line-tears、first-bike
25. grandma-cooking、quiet-support、kind-stranger、silent-father
26. mother-hands、mother-growing-old
27. empty-rocking-chair、hometown-longing、distant-friendship
28. old-wine-friendship、true-friendship、being-accepted
29. facing-setback、failure-letting-go
30. details-decide、stay-focused、plan-ahead
31. knowledge-ladder、apply-knowledge、practice-makes-perfect
32. lonely-lane、city-night-train、late-study
33. chasing-dreams、dream-and-action
34. environmental-duty、public-property、sense-of-duty
35. quiet-night、library-mood、fishing-village-fog
36. teamwork-building、teammates-thanks
- **User review (階段 9c, after 12e1e21):** added groups 25–36 (感激身邊人 grandma-cooking / quiet-support / kind-stranger / silent-father · 母親 · 思念 empty-rocking-chair / hometown-longing / distant-friendship · 友誼 old-wine-friendship /
  true-friendship / being-accepted · 挫折 facing-setback / failure-letting-go · 專注 details-decide / stay-focused / plan-ahead · 學習 knowledge-ladder / apply-knowledge / practice-makes-perfect · 孤單 · 夢想 · 責任 · 寧靜 · 合作) and put
  `tired-runner` into group 2. The largest set of related sentences for one sentence is 8 (`late-study`), so at least 141 unrelated sentences remain for wrong options. **Safety net:** `essayQuiz.buildQuestions` only plans a
  kind (fill / scenario / usage need 3 unrelated wrong options, scenario-tf needs 1) for an item that has enough unrelated sentences; otherwise the item moves to another slot or the slot becomes another kind
  (在極端情況下只剩 主題分類), so a question never has fewer than 4 options or a defensible second answer (tested with patched content where all sentences, or all but two, are in one group).
- **待確認 — still NOT in a group (the user decided to leave them out):** 美德 humility-value / politeness-value / frugality-virtue · 成長 growing-cost / life-journey / peace-with-solitude · friends-drift-apart (友誼).
  They can still appear as wrong options next to each other (same-theme preference makes a same-theme neighbour likelier).
- **Tests:** `tests/essay-quiz.test.js` (15): group ids exist / 2+ members / no duplicate group; unique scenario / usage / keyPhrase / sentence; 15 questions, 3 of each kind, no kind twice in a row (full pool, each level, each theme);
  random kind order; unique `itemId`s; **5000 sessions over the full pool (also checking wrong options are from the same theme) + 1000 per level and per theme + 1500 練習錯題 sets + every window of 4 sentences (147 pools × 10 sessions): every question has exactly one
  defensible answer, 0 violations**; 情境是非 true share within ±0.05 over 5000 sessions (2 + 1 per session); the 填空 rule (checked on a patched copy of the content because the real library's same-theme pairs never trigger it);
  the review-approved groups are present and the still-ungrouped ones are not; the "too few unrelated sentences" fallback; 書面語 scan. Mutation-checked (each made the file fail, then reverted): drop the group rule, the fallback, all-true 情境是非, fixed kind order, usage options taking the asked sentence's own usage, scenario options taking the asked
  sentence, 填空 without the "not inside the sentence" rule, no same-theme preference, a false 情境是非 using the sentence's own scenario.

## 階段 9d — 歷史故事「綜合練習」 (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master; includes the 審核後修正 below and the two extra `HISTORY_PERSON_NOT_OPTION` entries)
Changes: `src/historyQuiz.jsx` (new, question generation only — plain JavaScript, same pattern as `essayQuiz.jsx`; kinds dealt by `quizPlan.jsx`), `HistoryModule.jsx` (new `mixed` view, `MixedPracticeSession`, `toQuestion`; list gets a 「綜合練習」 card with a
「開始綜合練習 🎯」 button above the 類別 tabs), `historyContent.jsx` (new constants only; no story changed), `index.html` (one script tag after `historyContent.jsx`), `tests/history-quiz.test.js` (new, 27 tests). No storage / backup change, no new stored field,
`Root.jsx` untouched.
- **Entry / flow:** list → 綜合練習 → 15 questions (`QuestionBlock`, same look as the other generated sessions) → 「答對了 N / 15 題」 → 完成. `onRecordPractice(correct, total)` is called once at 完成 (mission / streak / badge logic as everywhere); `practiceStats.attempts` +15 per session.
  Scope: all 90 stories (the 戰爭詩詞 tab holds poems, not stories, and is not part of it). The existing one-story flow (list → story → 開始問答) is unchanged.
- **Five kinds, 3 each, random order, never the same kind twice in a row** (`planKinds`; the draw is repeated, up to 40 times, until every kind gets its 3 — `人物配故事` is the scarce one, only 51 of 90 stories qualify): `person` 人物配故事 · `period` 朝代配故事 · `order` 事件先後 · `lesson` 啟示配故事 · `title` 故事猜標題.
  A story that cannot give a kind (see below) is swapped to another slot or its slot changes kind; as a last safety net the generator tries the story's other kinds, then another story — never an empty question or an error.
  - `person`: stem = 《title》 + the first complete sentence of `story` (quote-aware); options = 4 names. The right person is a named person of `characters` who is **not named in that stem** (otherwise the title gives the answer away — this is my reading of 「不得出現答案人物以外的洩題」, **please confirm**; 51 of 90 stories qualify, the other 39 are asked other kinds).
    A wrong person is a named person of another story who is not (an alias of) any person of this story, is never named in this story's title or text, and no two options are one person.
    **審核後新增 (年代差):** a wrong person's *nearest* story (`years` of every story he is a named character of) must be **≥ 100 years** from the asked story's `sortYear`, so a contemporary (秦昭襄王 for 長平之戰 / 觸龍說趙太后, 魏徵 for 玄武門之變) cannot be offered. Only when fewer than three different people qualify is the gap relaxed to **50 years**; when even that is not enough the story is not asked 人物配故事
    (`HistoryQuiz.personGap(story)` → 100 / 50 / null). With the real library all 51 qualifying stories use 100 (none needs the relaxed gap); the number of stories that can be asked this kind is still 51 of 90.
    **`HISTORY_PERSON_NOT_OPTION`** (historyContent.jsx, story id → names that are never a wrong option, whatever the year rule says; matched with the alias table, so 秦始皇（嬴政） also covers 嬴政): 觸龍說趙太后 → 秦昭襄王 · 長平之戰 → 秦昭襄王 · 玄武門之變 → 魏徵 · 商鞅變法 → 秦始皇（嬴政） (秦國日後的統一者，課文沒提名字；與商鞅變法相差 129 年，年代差規則擋不住) ·
    光武中興 → 漢景帝、漢文帝、漢武帝、劉邦 (劉秀是漢室後裔，課文提「西漢」「漢朝」但沒提這些人). The last two entries were added by the user at the final approval of 9d. A new entry needs the user's approval. The scan also looked at every other pair 100–260 years apart inside the same era: the rest are only same-era strangers, not defensible answers. Generic entries (百姓, 秦王, 父親, 黃香的父親 …, `HISTORY_GENERIC_CHARACTERS`) are never options.
    `HISTORY_CHARACTER_ALIASES` (李世民＝唐太宗, 秦始皇（嬴政）＝嬴政, 孝文帝＝拓跋宏 …) and `HISTORY_RULER_ALIASES` (a story listing 秦王 never offers 秦昭襄王 / 秦始皇 …) cover one person under several names. One-character names (鯀) match exactly.
  - `period`: stem = the title; the answer = the label of `HISTORY_PERIOD_NORM[story.period]`; the four options have **pairwise disjoint `families`** (see the table below). Wrong labels prefer nearer eras.
  - `order`: 「以下兩個故事，哪一個發生得比較早？」 options = the two titles. Only stories with `sortYear` ≥ 100 years apart and **never** `source` 神話與民間傳說 / 小說演義 (8 stories are never asked: 女媧補天, 精衛填海, 后羿射日, 木蘭代父從軍, 鐵杵磨成針, 蔣幹盜書, 草船借箭, 空城計). `itemId` = the story the question was drawn from.
  - `lesson`: stem = `lesson` (not for a story whose lesson contains its own title — only 楚莊王一鳴驚人 today); options = 4 titles; a wrong story is never in a common `HISTORY_SIMILAR_GROUPS` group with the right one and its title is not named in the lesson. Same category preferred, then nearer era.
  - `title`: stem = one or two consecutive sentences (20–120 characters) of the story that **do not contain the title** — the whole title, the （…） part (破釜沉舟), the last 3 characters (不思蜀, 磨成針) and, for titles of 6+ characters, the last 4 (胡服騎射). Wrong titles are from the **same 類別**,
    never share a named person with the right story, never belong to a common `HISTORY_SAME_EVENT_GROUPS` **or `HISTORY_SIMILAR_GROUPS`** group (審核後新增: a story with the same lesson can fit the passage's theme too), and are not named in the passage.
- **錯題做法 (decision):** `Root.answerItem(itemId, isCorrect)` calls `removeMistake` when `isCorrect` is true, so the mixed session calls `onAnswerItem(itemId, false)` **only for a wrong answer** (`MixedPracticeSession.selectOption`); a right answer calls nothing. A story is flagged (one entry per story id, same list and
  「📝 只看錯題」 chip as the one-story flow); only a perfect run of the story's own questions (`finishQuestions`) clears it, because one mixed question per story does not show that the whole story is understood. No parameter was added to `Root` / `answerItem`.
  Verified in the browser: with all 90 ids already in the 錯題本, three sessions (4, 8 and 1 right answers) left it at 90.
- **朝代歸一 (`HISTORY_PERIOD_NORM`, used only for the quiz; every `period` string of the 90 stories has an entry, a test enforces it).** One label has one family set; two options never share a family.
  | raw `period` | label | families |
  |---|---|---|
  | 神話傳說 | 神話傳說 | myth |
  | 夏朝 | 夏朝 | xia, myth |
  | 商朝 | 商朝 | shang |
  | 西周 | 西周 | zhou |
  | 春秋、春秋末年 | 春秋時期 | zhou |
  | 戰國、戰國（秦國）、戰國／秦 | 戰國時期 | zhou, qinhan |
  | 秦 | 秦朝 | qinhan |
  | 秦末 | 秦朝末年 | qinhan |
  | 秦末／楚漢相爭、楚漢相爭 | 秦末漢初 | qinhan |
  | 西漢 · 漢朝 · 東漢 | 西漢 · 漢朝 · 東漢 | qinhan |
  | 東漢末年、東漢末年／三國 | 東漢末年 | qinhan, sanguo |
  | 三國 | 三國時期 | sanguo |
  | 晉朝 | 晉朝 | jinnbc, sanguo |
  | 東晉／十六國 | 東晉 | jinnbc |
  | 北魏、南北朝 | 北魏、南北朝 | jinnbc |
  | 隋 | 隋朝 | sui |
  | 唐、唐朝 | 唐朝 | tang |
  | 北宋、北宋末年 | 北宋 | song |
  | 宋、宋朝 | 宋朝 | song |
  | 南宋 | 南宋 | song, yuan |
  | 元朝 | 元朝 | yuan |
  | 元末明初 | 元末明初 | yuan, ming |
  | 明、明朝 | 明朝 | ming |
  | 清朝 | 清朝 | qing |
  | 清末 | 清朝末年 | qing |
  | 清末民初 | 清末民初 | qing, minguo |
  Consequences: 春秋 and 戰國 (and 西周), 北宋 / 南宋 / 宋朝, 西漢 / 東漢 / 漢朝 / 秦朝 / 戰國, 南宋 and 元朝, 東漢末年 and 三國 and 晉朝, 晉朝 and 南北朝, 夏朝 and 神話傳說 are never offered together; 唐朝, 清朝, 明朝, 隋朝, 商朝, 元朝 can sit with most others.
- **`HISTORY_SIMILAR_GROUPS` (30 groups = the 24 below + the 6 pairs added after the first review; written by id; lessons close enough that either story could fairly be chosen — complete list in the report and in `historyContent.jsx`):** 堅持不懈 · 刻苦勤學 · 孝順 · 順應自然疏導 · 求賢用人納諫 · 變法改革 · 以弱勝強／善用計謀 · 驕傲輕敵 · 不留退路 · 臨危冷靜 · 動腦筋解難題 ·
  誠信守諾 · 為政愛民 · 君主荒廢而衰亡 · 濫用民力 · 忠誠氣節 · 民族友好往來 · 親身考察 · 技術改良 · 教養孩子 · 軍紀嚴明 · 勇於承擔為民除害 · 法制制度 · 以德服人.
  **審核後新增的 6 組（兩個故事一組）:** 完璧歸趙 ↔ 毛遂自薦 · 觸龍說趙太后 ↔ 完璧歸趙 · 負荊請罪 ↔ 孔融讓梨 · 辛亥革命 ↔ 衛青、霍去病抗擊匈奴 · 空城計 ↔ 草船借箭 · 精衛填海 ↔ 女媧補天 (管仲治齊 and 張騫出使西域 keep their old places). **No text-similarity guard** (the 9c experience: it flags pairs that are only worded alike).
- **`HISTORY_SAME_EVENT_GROUPS` (11 groups):** 楚漢相爭 (巨鹿·鴻門宴·暗度陳倉·背水一戰·垓下) · 赤壁 (赤壁·蔣幹盜書·草船借箭) · 孫臏 (田忌賽馬·圍魏救趙·增兵減灶) · 藺相如 (完璧歸趙·負荊請罪) · 管仲 · 唐太宗 (玄武門·貞觀之治·文成公主·玄奘) · 玄宗 (開元盛世·安史之亂·郭子儀) ·
  諸葛亮 (三顧茅廬·七擒孟獲·空城計·草船借箭) · 秦 (荊軻·統一) · 兩宋之際 (靖康之難·岳飛) · 漢武帝 (張騫·衛青霍去病·蘇武·司馬遷). Stories that share a named person are also excluded automatically (`titleWrong`).
- **待確認:** 管仲治齊 inside the 改革 group, 張騫 inside both 堅持 and 友好往來 (both kept as they are by the user's decision); the 6 pairs above were the former 待確認 pairs and are now grouped. The period labels 「春秋時期／戰國時期」 follow the textbook habit; 戰國 touches 秦漢 on purpose (the last years of 戰國 are the 秦 conquest). 事件先後 relies on the approximate `sortYear`; the 100-year rule keeps the error out of it.
- **Tests (`tests/history-quiz.test.js`, 27; +6 after the review: the 6 new groups, the 100-year gap over 5000 full sessions, HISTORY_PERSON_NOT_OPTION, a patched library where the table alone decides, the relaxed 50-year gap / not asked at all, 故事猜標題 vs SIMILAR groups):** period table complete / one family set per label / required overlaps and non-overlaps; groups valid (24 similar groups); character tables; every kind can be built from enough stories; 15 questions, 3 of each kind, no kind twice in a row, 15 different stories; random order;
  **5000 full-library sessions with 0 violations of "exactly one defensible answer"** (checked by an independent implementation of alias / overlap / title-leak rules) + every story × many draws per kind; small asked sets (1–3 stories); patched libraries (missing lesson / unusable story / unknown period; a category with < 3 other stories; a wrong title named in the passage);
  HISTORY_PERSON_NOT_OPTION (5 stories, 5000 draws each, 0 offers); known tricky people (貞觀之治 never offers 李世民, 完璧歸趙 never offers 秦昭襄王); 書面語 scan incl. 同. Mutation-checked (each made the file fail, then reverted): no 朝代歸一, no 傳說／演義 exclusion in 事件先後, no 100-year rule, no similar-group exclusion, no same-event exclusion, no shared-person exclusion,
  wrong people taken from the story itself, fixed kind order, right person named in the stem, passage containing the title, wrong titles of other categories, no alias handling, no generic-name exclusion, no kind balancing, no ruler aliases, one-character names ignored, wrong titles named in the passage, wrong answer of 事件先後 reversed; after the review also: no 100-year gap, no HISTORY_PERSON_NOT_OPTION, no SIMILAR exclusion in 故事猜標題, relaxed gap of 0 instead of 50, no relaxation at all.
- **Not verified:** a real iPad / the real CDN; whether 人物配故事 at 51/90 eligible is too few for a child to meet it often.

## 階段 10 — 中二級別 (s2) — 階段 10a done (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master)
**階段 10a only builds the level foundation; it adds NO content.** Content batches follow later, one module at a time (see the order and the rules below).
- **What `s2` means:** the fourth level, label **「中二」**. In content terms it covers 中二 to 中三, but it is **not split by year**: on screen and in the data it is only ever called 「中二」 (never 「中三」), and no item may claim to be 中二 or 中三 specifically (the 教育局 junior-secondary
  recommended passages are not graded by year). An item is simply tagged `level: "s2"`. **The level tags of all existing content stay as they are** (p5 / p6 / s1; nothing was re-tagged).
- **Storage (`Storage.jsx`):** `LEVELS` gained `{ key: "s2", label: "中二", note: "中二內容涵蓋中二至中三" }` (after 中一); `LEVEL_KEYS` is derived from it, so `loadState` / `sanitizeState` accept s2 automatically; an unknown value still falls back to `p5`. **No backup change:** `BACKUP_VERSION` stays 2, no new field.
  **An old app (before 10a) that reads a save or a backup with `level: "s2"`** does not error: its whitelist is p5 / p6 / s1, so the level falls back to `p5`, every other piece of progress is kept, and if that old app saves again the stored level becomes p5 (checked by loading the 8d94dfa `Storage.jsx`).
- **Home (`Home.jsx` `LevelCard`):** four buttons (71 × 44 at 820, 74 × 44 at 390, one line, 16 px); while a level that has a `note` is selected the note is shown under the buttons in 14 px (中二: 「中二內容涵蓋中二至中三」). BackupSettings' restore screen and everything else that shows a level name read `Storage.LEVELS`, so nothing was hard-coded there.
- **Every module's 程度 filter (8 modules: Poetry, Essay, Idiom, Rhetoric, Punctuation, Reading, ClassicalProse, Mandarin; History and Cangjie have no level filter and got none):** the options come from `theme.jsx` `LEVEL_FILTERS` (全部 + `Storage.LEVELS`), no module hard-codes the levels any more. How each filter worked before (unchanged except for the empty-level fallback):
  | module | what the level filter does | pool too small |
  |---|---|---|
  | 詩詞 | filters the poem list; 開始隨機練習 and the detail's 開始練習 practise the filtered list | `startPractice`: pool < 4 → the whole library; 練習錯題 passes the whole library + the mistaken poems |
  | 作文金句 | level AND theme filter the list; practice = the filtered list | pool < 4 → whole library; 練習錯題 as Poetry |
  | 成語 | filters the list; practice = filtered list | pool < 4 → whole library; 練習錯題 as Poetry |
  | 修辭手法 | the list always shows the 10 devices; the level only chooses the PRACTICE sentences | pool < 4 → all sentences; 練習錯題 as Poetry |
  | 標點符號 | the list always shows the 10 marks; the level only chooses the PRACTICE items | pool < 4 → all items; 練習錯題 as Poetry |
  | 閱讀理解 | filters the passage list (+ 只看錯題); one passage at a time, no pool | — |
  | 文言文選讀 | filters the text list (+ 只看錯題); one text at a time, no pool | — |
  | 普通話 | the hub's level picks the pool of the 5 drills (and the homophone drill) | `withFallback(pool, kind, min)`: too few of that kind → all items of the kind; the homophone drill: < 4 → all |
- **Empty-level fallback (`QuizUtils.itemsForLevel(items, level)` → `{ items, empty }`, shared by the 8 modules; the note is `theme.jsx` `A2LevelNotice`):** when the chosen level has **no item at all** in that module (today: 中二 everywhere) the module shows / practises **all levels** instead of a blank list, and a one-line note sits under the level control:
  「中二內容陸續加入，暫時顯示全部程度的內容」 (the level's own label is used, so it would read 「小五…」 if p5 were ever empty). The note appears **only** when the level really has no content in that module (Essay: the level is tested before the theme filter) and switches itself off as soon as the first item is tagged `s2` — no code change needed.
  Practice and 練習錯題 always get a usable pool (the filtered list is all levels then). The 10 `*_LEVEL_LABEL` maps in `src/content/*.jsx` gained `s2: "中二"` so future s2 items render with a label (a display map only; no item was touched).
- **Files changed:** `Storage.jsx`, `Home.jsx`, `theme.jsx` (`LEVEL_FILTERS`, `A2LevelNotice`), `quizUtils.jsx` (`itemsForLevel`), the 8 `*Module.jsx`, the 10 `content/*Content.jsx` label maps, `tests/storage.test.js` (+5), `tests/content.test.js` (level whitelist includes s2, "every level has items" checks use p5 / p6 / s1), new `tests/level.test.js` (9), this file.
  Hard-coded level names found by a full-text search of the repo: only `Storage.LEVELS` (edited), `defaultState` / the `loadState` fallback (`"p5"`, kept), the 8 modules' local `LEVEL_FILTERS` (replaced) and the 10 label maps (s2 added); `BackupSettings.jsx` / `Home.jsx` read `Storage.LEVELS`; item tags in content, story text such as 「中一同學」 and `docs/idiom-audit.md`'s level column are data, not display code, and were not touched.
- **Order and rules for adding 中二 content (later phases, one module at a time, each only when the user asks):** 文言文選讀 → 閱讀理解 → 修辭手法 → 作文金句 → 成語 → 詩詞 (歷史, 普通話 and 倉頡 are not levelled by content and need nothing).
  Rules for every batch: 文言文 passages come **only from the 教育局 junior-secondary recommended list (第三學習階段)**; every 原文, 粵音 and answer is verified, and anything not certain is **not written but listed**; any uncertain edition difference (e.g. 《愚公移山》 — see Module 10 batch 3)
  means **stop and tell the user first**. Tag every new item `level: "s2"` — never 「中三」, and never claim a passage belongs to 中二 or to 中三. When the first s2 item of a module lands, that module's 中二 list shows only s2 items and the fallback note disappears by itself; the tests that say
  "every level has items" (`content.test.js` `FILLED_LEVELS`) and the per-level counts of that module need to be updated in the same batch.
- **Verified (Playwright, test mode, 820 and 390):** home 中二 selected (note shown, buttons one line, ≥ 44 px, no horizontal overflow); each of the 8 modules opened at 中二: note shown, list / hub non-empty, 開始練習 (or the first passage's 開始問答, or 聆聽練習) works, 練習錯題 works, switching to 小五 inside the module removes the note and shows that level's items; essay patched so every item is s2: no note at 中二 (150 items), the note (「小五內容陸續加入…」) at 小五; console errors 0; the real key `chineseOps:v1` never written.

- **階段 10b (done, 已審核並已合併):** 文言文選讀 now has 8 中二 passages (see "Module 10 details → 階段 10b"); its 中二 list shows them and the fallback note is gone for that module only. The other 7 levelled modules still show the note at 中二 (verified in the browser). `tests/content.test.js` `FILLED_LEVELS` is unchanged on purpose; a separate test checks that 文言文選讀 has all four levels.

## 階段 10c-1 — 閱讀理解新增中二（s2）第一批 8 篇 (Oct 2026) — 已審核並已合併 (reviewed by the user and MERGED into master at `92e47df`, Pages run #57 success; the 3 審核後修正 below are applied; the second batch is 階段 10c-2 below)
Content-only change (`readingContent.jsx`, `tests/content.test.js`, this file; `ReadingModule.jsx` and every other file untouched). 閱讀理解 34 → **42 passages: 小五 12 / 小六 10 / 中一 12 / 中二 8**. The target is 16 中二 passages in total; the second batch (10c-2) comes later and only when the user asks.
Format is exactly the one of "Module 7 — REBUILD" / "階段 7 C 批" (ids end `-v2`, `level: "s2"`, 3 `vocab`, 7 `comprehension` [4 mc + 1 multi 「哪兩項」(5 options, 2 answers) + 2 open] and 3 `language` [all mc], skills only from the existing names, no 「文言句意」 anywhere because no 原文 is used, explanations never refer to option letters and cite 「第 N 段」, every open question has `hint` / `points` / `scheme` (「共 N 分」) / `modelAnswer`). Total marks 14 for seven passages, 15 for 颱風.
- **The 8 (genre shown as 「中二 · …」):**
  | id | title | genre | 字數 | 題數 | 總分 |
  |---|---|---|---|---|---|
  | `tibu-qiuyuan-v2` | 替補球員 | 記敘文 | 887 | 7 + 3 | 14 |
  | `waipo-de-jiu-xiangbu-v2` | 外婆的舊相簿 | 記敘文 | 889 | 7 + 3 | 14 |
  | `yi-ba-jiechu-de-yusan-v2` | 一把借出的雨傘 | 記敘文（兼議論） | 937 | 7 + 3 | 14 |
  | `taifeng-shi-zenyang-xingcheng-de-v2` | 颱風是怎樣形成的 | 說明文 | 929 | 7 + 3 | 15 |
  | `chaoxi-weishenme-meitian-dou-you-zhangluo-v2` | 潮汐為甚麼每天都有漲落 | 說明文 | 796 | 7 + 3 | 14 |
  | `duli-sikao-yu-renyun-yiyun-v2` | 獨立思考與人云亦云 | 議論文 | 865 | 7 + 3 | 14 |
  | `zhiben-shu-yu-dianzishu-v2` | 紙本書與電子書，各有所長 | 議論文 | 881 | 7 + 3 | 14 |
  | `shenqing-tushuguan-dashi-xin-v2` | 申請擔任圖書館大使 | 實用文（申請信） | 441 | 7 + 3 | 14 |
  Ranges used: 記敘文 / 說明文 / 議論文 750–950 漢字, 實用文 400–600 (word count = 漢字 only). The three 記敘文 and the 實用文 are fictional (all people — 梁志軒, 文俊, 嘉琪, 黎思朗, 吳主任 … — and the class / 學會 are invented; 實用文 has 稱呼, 4 body paragraphs, 結語 「此致　敬禮！」 numbered, then 署名 and 日期 as `{ text, align: "right", numbered: false }`;
  its date 二〇二六年十一月九日 is a Monday but no weekday is written, and the only weekdays in any passage — 星期三 / 星期一 in 一把借出的雨傘, 星期六 in 外婆的舊相簿, 逢星期二和星期四 in the letter — are relative or generic, so no calendar check is needed). 「中二丙班」 appears only as the applicant's fictional class; the word 「中三」 appears in no s2 text. No theme repeats the existing 34 (the 失敗 / 堅持 / 團隊 passages are about experiments and practice, not a dropped team player; 外公的算盤 is about a skill taught, not an album; the 網絡 passages are about online risks, 獨立思考 uses a fairy tale and daily choices, not 網上資訊).
- **Fact-check (WebSearch only — the search tool returns summaries; the 香港天文台 pages themselves were not opened by me):**
  - **熱帶氣旋警告信號 (HKO, English table of warning criteria `tc2017`–`tc2024`, `warnlegend`, plus Chinese pages):** 一號戒備 = a tropical cyclone centred within about 800 km of Hong Kong that may affect it (HKO's own blog says it does not issue it for every cyclone entering the range → the passage says 「考慮發出」 and 「並非所有進入這個範圍的熱帶氣旋都會令天文台發出信號」); 三號強風 = sustained 41–62 km/h, 八號烈風或暴風 = sustained 63–117 km/h, 九號烈風或暴風風力增強 = gale or storm wind increasing (or expected to increase) significantly, 十號颶風 = sustained 118 km/h or above.
    **The results matched the expectation in the request (戒備 / 強風 / 烈風或暴風 / 烈風或暴風風力增強 / 颶風) and no revision of the system in 2025–2026 was found, so nothing was stopped.** Written: only the official names, the 800 km criterion, and the three sustained-wind ranges. Deliberately NOT written: gust figures (110 / 180 / 220 km/h), the four directions of the 八號信號, the history or numbers of other (unused) signals, any 2026 typhoon (search snippets disagree on its name).
  - **形成條件:** sea surface about 26.5 °C or above (but ~5 % of formations occur over cooler water, hence 「一般來說…約需」), enough Coriolis force (HKO education article: negligible near the equator, hardly any formation within about 5° of it), low-level disturbance / convergence (輻合), plenty of moisture / instability (latent heat released when vapour condenses). The passage names four conditions (海溫, 科氏力, 輻合, 水汽). Not written: low vertical wind shear (listed by other sources but not asked), the size of the eye, the naming thresholds of 熱帶低氣壓 / 熱帶風暴 / 強烈熱帶風暴 / 颱風 (not re-checked), 颶風 naming only by region (大西洋 / 東太平洋) was dropped for length.
  - **潮汐 (HKO 「潮汐」 education page, 日本國立天文台 暦Wiki, JMA, Tokyo University notes):** the Moon is the main cause and the Sun the smaller one (written 「約為月球的一半」 — the 暦Wiki figure, not an exact ratio); 大潮 at 新月 / 滿月 (朔望, 農曆初一和十五前後), 小潮 at 上弦 / 下弦; the Earth must turn about 50 minutes more to face the Moon again, so two successive high tides are about 12 h 25 min apart and the tide is about 50 minutes later each day; many places have two highs and two lows a day.
    Not written because not certain / not needed: the delay between 朔望 and the biggest spring tide (潮齡, 1–2 days in Japan — place-dependent), exact dates of 上弦 / 下弦 in the lunar month, Hong Kong's mixed-tide inequality (the two highs differ in height), any figure for the tidal range of a named place, tidal power.
    **Two statements rest on general knowledge, not on a quoted source — please check them:** 「有些地方一天大約只有一次」(diurnal tides, e.g. in some gulfs) and 「大潮期間若遇上颱風，海水更容易漫上岸邊，造成水浸」 (spring tide + storm surge; written softly, no place or figure).
  - 獨立思考 quotes only 《論語．為政》 「學而不思則罔，思而不學則殆」 (the wording used in textbooks) and 《皇帝的新衣》 (安徒生, public tale). The explanation of 罔 / 殆 is a paraphrase (「迷惘而無所得」/「思考也沒有穩固的基礎」), not a gloss of 殆 — editions differ on that word.
- **Tests (`content.test.js` 57 → 64 at the first build, → 66 after the 審核後修正; whole suite 13 files, 242 tests):** the level test now expects 42 with 12 / 10 / 12 / 8; new `READING_FILLED_LEVELS = [...FILLED_LEVELS, "s2"]` (reading only — essay / rhetoric still use `FILLED_LEVELS`) and a test that all four levels have a passage, the s2 ids are exactly the 8 above, unique and end `-v2`; genres; 7 + 3 questions, 3 vocab, kinds, explanations cite a paragraph and name no option letter, 「共 N 分」, 11–15 marks; length ranges; the 實用文's last two entries, 稱呼 first and 結語 before them; never 「中三」, no 「文言句意」, colloquial scan (incl. 什麼 / 裡) and **「同」 only in ordinary compounds (同學 同時 相同 共同 同情 不同 同一 同樣 同桌 陪同 同意)**; the agreed 警告信號 wording / numbers and tide numbers are in the text (and no 二號 / 四號 … in the 颱風 passage).
  One false positive was fixed on the way: the prompt 「請寫出其中三項」 contains the characters 中三 by accident, so it now reads 「請寫出三項」; an older, non-s2 passage (about an online friend) legitimately says 中三學生 and is not checked.
- **Answer positions of the 56 new mc questions:** 15 / 13 / 15 / 13 over the four slots (the module shuffles options anyway).
- **Verified (Playwright, test mode, 820 and 390):** at 中二 the 閱讀理解 list shows exactly the 8 titles and no 「中二內容陸續加入」 note; 全部 = 42, 小五 12, 小六 10, 中一 12, 中二 8; all 8 passages opened (every paragraph, vocab, focus, genre label 「中二 · …」, circled numbers ①–⑧ only on numbered paragraphs, 署名 / 日期 right-aligned), and a full session of each run with wrong answers on some mc / multi questions and open questions rated 全部答到 / 答到一部分: the score on the result page matched the expected marks every time; sessions.reading +8, 8 mistakes flagged, backup export → import identical (version 2); no horizontal overflow, text ≥ 13 px, taps ≥ 44 px, 0 console errors. Not verified on a real iPad / the real CDN.
- **審核後修正 (user review of 10c-1, 80 questions read; content judged reliable, only these 3 items changed, nothing else touched):**
  1. **潮汐 小潮 「互相抵消」 → 「部分互相抵消」** (at quarter moons the Sun's pull is at right angles to the Moon's, so it only partly cancels the Moon's tide). Four places in `chaoxi-weishenme-meitian-dou-you-zhangluo-v2`: passage ④ 「兩者的引力部分互相抵消，漲落的幅度最小」 · 語文題 3 prompt 「第四段「兩者的引力部分互相抵消」中，「抵消」的意思是」 (options unchanged) and its explanation 「作用互相消去」 → 「作用有一部分互相消去」 ·
     理解題 4's wrong option (the one that describes 小潮) → 「太陽、月球和地球成直角，引力部分互相抵消」 (the right answer is still only 「…大致排成一直線，兩者的引力互相配合」) · 理解題 5 explanation 「這時兩者的引力部分互相抵消，漲落的幅度最小」. No other passage contains 「抵消」; `CLAUDE.md` and the tests had none.
  2. **詞語運用 explanations must not name an option's position** (options are shuffled on every attempt): `duli-sikao-yu-renyun-yiyun-v2` 語文題 3 「只有第二句的情況」 → 「只有「大家都說這部電影好看，他沒有看過，也隨聲附和地稱讚了一番」的情況」; `shenqing-tushuguan-dashi-xin-v2` 語文題 2 「只有第三句的用法正確」 → 「只有「得悉學校將舉辦書展，我立即向老師查詢詳情」的用法正確」.
     A scan of every hint / explanation / scheme / model answer / option of all 42 passages for 「第 N 句 / 項 / 個選項」, 「選項一」, 「最後一項」, 「首項」, 「前者 / 後者」 found only things that are NOT option positions (listed in the report, left alone): s2 — 潮汐 hint 「留意第五段的第一句和第二句」 (sentences of the passage), 獨立思考 option 「等第一個發言的人…」, 紙本書 explanation 「選取後者」 (the second part of 「與其……，不如……」); older passages — 星星 explanation 「否定前者、肯定後者」, 樹木的年輪 hint 「第五段的第一句和第二句」, 紙的故事 option 「第一個用紙寫字的人」.
  3. **「柺杖」 → 「拐杖」** (`tibu-qiuyuan-v2` ⑦). A variant-character scan of the 8 passages found only things that are reported, not changed: 「揹着沉重的書包」 (紙本書 ②) against 「背着球袋」 (替補球員 ③) — the same 背/揹 + 着 written two ways in different passages; 「週末」 (雨傘 ③) against 「周」 in 周圍 / 四周 / 自轉一周 (週 = week, 周 = round, so consistent by meaning); 「顯著」 is the only 「著」, every other 「着」 (61×) is consistent. No 「后／後」, 「裏／裡」, 「爲／為」 or 「牀／床」 mixing.
- **New tests (`content.test.js` 64 → 66):** (a) for ALL 42 passages, no `explanation` points to an option by position (「第一／二／三／四…句／項／個選項」, 「選項一」, 「最後一項」, 「首項」, 「上一項」, 「下一項」; 「第 N 段」 is a paragraph and allowed); the scan found no old passage in violation, so nothing had to be exempted. (b) the three fixes above: every 「互相抵消」 in the tide passage is 「部分互相抵消」 (4×), the 小潮 sentence / prompt / explanations / the still-single right answer of 理解題 4, the two quoted-sentence explanations (and that the quoted sentence is the answer option), 「拐杖」 present and 「柺」 absent from all 8 passages.

## 階段 10c-2 — 閱讀理解新增中二（s2）第二批 8 篇 (Oct 2026) — 待審核 (built on the dev branch `claude/elegant-volta-ihb51l`, pushed for review, NOT merged into master)
Content-only change (`readingContent.jsx`, `tests/content.test.js`, this file; `ReadingModule.jsx` and the 42 existing passages untouched). 閱讀理解 42 → **50 passages: 小五 12 / 小六 10 / 中一 12 / 中二 16** (the planned 16 中二 are now complete).
Format, fields and rules are exactly those of 10c-1 (ids end `-v2`, `level: "s2"`, 3 `vocab`, 7 `comprehension` [4 mc + 1 multi 「哪兩項」 + 2 open] + 3 `language` [all mc], existing skill names only — no 「文言句意」 because no 原文 is used —, explanations cite 「第 N 段」, never name an option letter or an option position, every open question has `hint` / `points` / `scheme` (「共 N 分」) / `modelAnswer`, total 14 marks each).
- **The 8 (genre shown as 「中二 · …」):**
  | id | title | genre | 字數 | 題數 | 總分 |
  |---|---|---|---|---|---|
  | `diyici-duzi-dache-v2` | 第一次獨自搭車 | 記敘文 | 827 | 7 + 3 | 14 |
  | `chufang-li-de-fuqin-v2` | 廚房裏的父親 | 記敘文 | 769 | 7 + 3 | 14 |
  | `banjia-nayitian-v2` | 搬家那一天 | 記敘文 | 787 | 7 + 3 | 14 |
  | `shengyin-shi-zenyang-chuanbo-de-v2` | 聲音是怎樣傳播的 | 說明文 | 856 | 7 + 3 | 14 |
  | `maipu-de-houniao-v2` | 香港米埔的候鳥 | 說明文 | 777 | 7 + 3 | 14 |
  | `gongping-yu-pingdeng-de-fenbie-v2` | 公平與平等的分別 | 議論文 | 770 | 7 + 3 | 14 |
  | `jieyue-yu-langfei-v2` | 節儉與浪費 | 議論文 | 763 | 7 + 3 | 14 |
  | `yaoqing-xiaoyou-fenxiang-shengxue-dianyou-v2` | 邀請校友分享升學經驗 | 實用文（電郵） | 440 | 7 + 3 | 14 |
  Ranges: 記敘文 / 說明文 / 議論文 750–950 漢字, 實用文 400–600. The 記敘文 and the 電郵 are fictional (柳溪坊, 學苑街, 朗悅中學, 嘉樂, 阿霖, 黃老師, 天朗, 陳俊廷, 林芷晴 … are all invented; no real estate, school, bus company or route is named; the bus lines 「十七」 / 「十七A」 are invented and no fare, concession, age rule or timetable is written).
  The 電郵 has 收件人, 主旨, 稱呼, 4 body paragraphs, 謝語, 結語 「此致　敬禮！」 (9 numbered entries) and then 署名 and 日期 as `{ text, align: "right", numbered: false }`. Its dates are fictional but the weekdays are real 2026 ones: 二〇二六年十二月十一日（星期五）, 十一月三十日（星期一）, sent 二〇二六年十一月十六日 (a Monday); a test computes them. The words 「中三」 / 「中二」 do not appear in any new passage (the 電郵 says 「初中同學」).
  Themes deliberately avoid those of 10c-1 (挫折與堅持, 祖孫情, 誠信與信任, 颱風, 潮汐, 獨立思考, 紙本書與電子書, 申請信): 成長與獨立 (第一次獨自搭車), 父愛 shown by action (廚房裏的父親 — not the 10c-1 line about love not spoken), 告別與適應 (搬家 — the 門框 height marks, not photos), 公平 vs 平等 (daily school examples, no politics), 節儉 vs 浪費 (not 舊物交換).
- **New rule from the 10c-1 review — answer options must be similar in length (this batch only; 10c-1 and older passages are untouched):** every mc has four options of near-equal length and the correct one is not systematically the longest. Result: the correct option is the **single longest in 17 of the 56 mc (30 %)** (10c-1: 73 %, older passages: 70 %); within one question the longest option is at most 1.25 × the shortest (the test allows 1.35). Wrong options were written to be as concrete and complete as the right one. The correct answers sit at positions 0 / 1 / 2 / 3 = **14 / 14 / 14 / 14** (the module shuffles anyway). Rule for any later batch: keep it.
- **Fact-check (WebSearch only — summaries; no Observatory or textbook page was opened by me):**
  - **聲音傳播:** 振動產生聲音; needs a medium (氣體、液體、固體), 真空不能傳聲 (a 波以耳-type bell-jar experiment appears in the teaching material found); speed 固體 > 液體 > 氣體; in air v ≈ 331 + 0.6 T m/s, which gives ≈ 340 m/s at 15 °C (343–344 at 20 °C) → written 「氣溫約攝氏十五度時，每秒約三百四十米」 and 「氣溫愈高，聲音傳播得愈快」, with the remark that 340 is only an approximate figure; 水中 ≈ 1 480–1 500 m/s (fresh), 1 535 (sea) → written 「約每秒一千五百米」; 回音: reflected sound must lag the original by about 0.1 s, 0.1 s × 340 m/s ÷ 2 = 17 m (textbook answer; 17.2 m at 344 m/s) → written 「約零點一秒」 and 「至少要約十七米」.
    **Written only as vague:** 鋼鐵等固體 「每秒數千米」 — the only figure found (≈ 5 120 m/s) came from a Q&A site, no textbook value, so no number is given. **Textbook simplifications, please check:** the 0.1 s hearing threshold is the usual school figure, not a precise physiological constant; the 聲納 example (0.4 s, 1 500 m/s → 300 m) is an invented illustration computed from those numbers; 太空艙外太空人聽不到對方 / 要靠無線電, 聲納 and 蝙蝠 的高頻回音定位 are general knowledge (only the echo rule itself was searched). Not written: speeds for other materials, the effect of humidity, any exact speed in steel.
  - **米埔:** 由世界自然基金會香港分會管理; a 《拉姆薩爾公約》 國際重要濕地 (Ramsar site no. 750 「Mai Po Marshes and Inner Deep Bay」), 毗鄰后海灣, 位於新界西北; the Ramsar sheet lists it as an East Asia-Australasian Flyway Network Site; 候鳥 breed in the north, and move south in autumn / winter (colder, less food) and back in spring; the 東亞—澳大拉西亞遷飛路線 runs from the northern breeding grounds through East and South-East Asia to Australia and New Zealand, Hong Kong is both a stop-over and a wintering place; 基圍 = tidal shrimp ponds (water level follows the tide), now used for conservation management where staff adjust the water level in season so that waterbirds come to feed; 黑臉琵鷺 is endangered (WWF) and Mai Po is an important wintering site; the bill is long, flat and spoon-shaped and swept sideways in shallow water.
    **Deliberately NOT written because the sources disagree or the figure changes:** the year Mai Po became a Ramsar site (one tourism page says 1995, the Ramsar sheet says it was first designated by the UK and transferred in 1997 — unverified); the year WWF started managing it (1983 vs 1984); any bird count (≈ 60 000 wintering waterbirds, 389 species / 77 % of Hong Kong's species, the spoonbill's global population — 288 → 2 726 in one WWF text, 「六千多」 in another —, 13 % vs > 20 % of the world's spoonbills); when the 基圍 were first dug (1930s vs 1940s); the number of 基圍 (17); the water buffalo (2006); the 13 000 km length of the route and the 50 million birds; the reserve's area (not searched); mangroves (not searched). A test checks that the passage contains no digit, no year and no bird count.
- **Tests (`content.test.js` 66 → 71; whole suite 13 files, 247 tests):** the level test now expects **50 with 12 / 10 / 12 / 16**; the s2 ids are exactly the 16 (8 + 8), unique, ending `-v2`; the counts / kinds / citation / 共 N 分 / 11–15 marks, the length ranges and the never-「中三」 / 書面語 / 「同」 scans now run over **all 16** s2 passages; new: the genres of the 8 (3 記敘文, 2 說明文, 2 議論文, 1 電郵); the 電郵 layout and its weekdays against the 2026 calendar; **option lengths (≤ 1.35 ×) and the 「正確選項是唯一最長」 share ≤ 50 %** over the 56 mc; answer positions between 15 % and 35 %; the agreed wording / numbers of the two 說明文 and the absence of years / digits / counts in 米埔.
  False positives met on the way (the passage text was reworded, the scan was not weakened): 「觀點解釋」 contains 「點解」, 「連同」 is not on the 「同」 list, 「十七A」 is not an option letter (the option-letter regex now looks for 「選項A」, 「(A)」, 「A、」…); added to the 「同」 list: 一視同仁 (成語).
- **Verified (Playwright, test mode, 820 and 390):** at 中二 the 閱讀理解 list shows **16** titles and no 「中二內容陸續加入」 note; 全部 = 50, 小五 12, 小六 10, 中一 12, 中二 16; all 8 new passages opened (every paragraph, vocab, focus, 「中二 · …」 label, circled numbers on numbered paragraphs only, 署名 / 日期 right-aligned) and a full session of each run (wrong answers on some mc / multi, open questions rated 全部答到 / 答到一部分): every result page matched the expected marks, sessions.reading +8, 8 mistakes flagged, backup export → import identical (version 2); no horizontal overflow, text ≥ 13 px, taps ≥ 44 px, 0 console errors. Not verified on a real iPad / the real CDN.
