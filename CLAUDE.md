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
    `AcceptTcpClient()` loop, no concurrency) — `index.html` now loads ~28
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
10. **文言文選讀 (Classical Chinese Reading)** — ✅ built, standalone, 17
    texts across 2 batches (see Module 10 details below) — added after the
    original 9 modules, per explicit user feedback that none of them
    actually present original classical-Chinese text with translation +
    glossary + comprehension questions together

Full spec for each module (practice mechanics, content requirements) is in
the original project brief — see "Module details" below for what's already
decided for Module 1; ask before assuming details for unbuilt modules.

## Design notes
- Bright, encouraging, age-appropriate tone (Primary 5 to Secondary 1 student)
- Red/gold accent colours (auspicious Chinese palette) on a warm cream
  background (`bg-amber-50`), decorative low-opacity emoji (🏮📜🖌️🐉) and
  blurred colour blobs behind content, all `pointer-events-none`
- Font: "Noto Sans TC" / "Noto Sans HK" (Traditional Chinese, Google Fonts),
  falling back to "Baloo 2" for latin characters/numerals
- Since the child cannot type Chinese fluently yet, prefer selection-based
  input (multiple choice, drag, tap-to-build) over free typing in modules
  1, 2, 5, 7, 8, 9 — free typing is only appropriate within module 3 (Cangjie
  practice) and module 4 (Mandarin/pinyin)
- Simple navigation: a home dashboard grid of the 9 modules (3×3), tap a
  module to open it full-screen with a "← 返回主頁" back button (hub-and-spoke,
  same pattern as `english-ops`)
- `src/AudioButtons.jsx` — shared 🔊 普通話 / 🔊 粵語 read-aloud buttons
  (`window.App.AudioButtons`, a `{ text, color, className }` component).
  Loads `speechUtils.jsx`'s voices once via `getVoicesAsync()` in a
  `useEffect`, picks a voice with `pickMandarinVoice`/`pickCantoneseVoice`,
  and calls `speak(text, voice, fallbackLang)` on click. Originally built
  inline for Module 5's idiom detail view, then extracted here and reused
  by Module 1 (reads the whole poem/prose via `item.lines.join("")`) and
  Module 6 (reads `item.story`) after user request. Loads in `index.html`
  right after `speechUtils.jsx` and before `QuizQuestion.jsx` — any new
  caller must appear after that point in load order. If a future module
  wants this too, just import `window.App.AudioButtons` and pass `text` +
  a matching `color` from `COLORS` — no per-module voice-loading needed.
- Shared UI primitives live in `src/theme.jsx` (`Card`, `Button`, `COLORS` —
  9 colour keys, one per module) and `src/QuizQuestion.jsx`:
  - `QuestionBlock` — generic multiple-choice renderer with immediate
    feedback; `q.prompt` can be a plain string or a JSX element, so modules
    can render rich prompts (e.g. a whole poem with one line blanked out)
    through the same component. Prompt text is `text-xl` and option-button
    text is `text-lg` (bumped up from the unstyled ~16px default after user
    feedback asking for bigger exercise text) — since every module renders
    its practice questions through this one component (directly, or via
    `FixedQuizFlow`), this single change affects the question/answer text
    across all 7 quiz-based modules at once. Several modules also build
    their own custom JSX `prompt` with an explicit Tailwind size (e.g. the
    sentence/clue shown above the options) — those don't inherit this
    wrapper's size and were bumped individually alongside this change
    (`text-lg` → `text-xl` for sentence/clue prompts, `text-3xl` → `text-4xl`
    for Idiom's blanked-character display). Cangjie and Mandarin's typing
    drills don't use `QuestionBlock` at all and were left alone — their
    question text was already large (`text-6xl` for the character being
    asked about) where it mattered.
  - `FixedQuizFlow` — steps through a **fixed** `questions` array (list →
    score screen), for modules whose questions are hand-authored per content
    item rather than generated at runtime (History, Reading — see their
    module details below). Takes `{questions, color, headerLabel, onBack,
    onFinish}`; resolves `color` through an internal literal class-name map
    (`LINK_TEXT_CLASS`), not a template-interpolated `text-${color}-600` —
    same reasoning as `COLORS` in theme.jsx, see the note there.
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
- Content: `src/content/poetryContent.jsx` — **38 classical poems** (唐/宋/清)
  + 5 短篇文言文 (Analects excerpt, 陋室銘, 賣油翁, 愛蓮說, 揠苗助長), each
  tagged `level: "p5"|"p6"|"s1"` and `type: "poem"|"prose"`. Original spec
  target is ~150 poems — 38 is a meaningful expansion from the initial 20,
  not the final count; keep expanding using the same template below.
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
- Content: `src/content/essayContent.jsx` — **60 curated golden sentences**
  (expanded from an initial 18 — user feedback called the original set "too
  easy, too little"), 20 per theme (描寫/抒情/論說), each tagged
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

## Module 5 details — 成語學習 (built, expanded three times after user feedback)
- Content: `src/content/idiomContent.jsx` — **653 idioms total**. Three tiers
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

## Module 7 details — 閱讀理解 (built, expanded after user feedback)
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
  `RHETORIC_DEVICES` (7 devices — 比喻, 擬人, 誇張, 對偶, 排比, 反問, 設問 —
  each with `name`, `definition`, `tip`, `examples`, and (added in the
  second expansion) `effect` — a one-sentence explanation of *why* a writer
  would use this device, used by the new effect-question type below; this
  is the reference material, studied via list → detail) and
  `RHETORIC_PRACTICE_SENTENCES` (**63 sentences, 9 per device** — expanded
  from 21 → 42 → 63 across two rounds of "too easy" feedback, tagged
  `device` + `level`, **deliberately distinct from `DEVICES`' own example
  sentences** so practice isn't just rote memorization of what was just
  read). The newest 3-per-device batch deliberately avoids the obvious
  keyword giveaways the earlier batches sometimes had (e.g. 反問 sentences
  no longer all start with "難道", 比喻 sentences aren't always flagged by
  "像"/"如") so the quiz can't be solved by pattern-matching one signal word.
- **Two question types now, alternating** (`RhetoricModule.jsx`'s
  `buildQuestions`): the original `buildDeviceQuestion` ("這句運用了什麼修辭
  手法？", 4 device-name options) and a new `buildEffectQuestion` ("這樣寫有
  什麼作用？", 4 `effect` strings sampled from `RHETORIC_DEVICES` as
  distractors) — added because "identify the device" alone was judged too
  easy; the effect question tests understanding of *why* the device works,
  not just keyword pattern-matching.
- `src/RhetoricModule.jsx` has three views: **list** (the 7 devices) →
  **detail** (definition, tip, examples, "開始練習" button) → **practice**
  (8-question quiz generated from `RHETORIC_PRACTICE_SENTENCES`, filtered
  by the level chips on the list screen, alternating the two question
  types above). Results go to `moduleProgress.rhetoric.practiceStats`.
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
    // one entry per key in Storage.jsx's MODULES array (all 9 modules)
  }
}
```
All 9 modules use the same `{ practiceStats, mistakes }` shape (generated
generically from `MODULES` in `Storage.jsx`'s `defaultModuleProgress()`, not
hand-listed per key) — extend this data model with a new top-level field
(not a new per-module shape) if a future feature needs more than these two.

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

## Module 10 details — 文言文選讀 (new module, 17 texts across 2 batches)
- Added after the original 9 modules, following explicit user feedback
  ("修改要求5") that neither `poetryContent.jsx` (poems + a handful of prose
  excerpts folded into Module 1's generated MC-quiz flow) nor
  `historyContent.jsx` (vernacular-retold stories, no original classical
  text at all) actually deliver "read real classical-Chinese text with
  translation + glossary + comprehension questions" as its own standalone
  experience — hence a dedicated new module rather than extending either.
- Content: `src/content/classicalProseContent.jsx` — `CLASSICAL_PROSE_ITEMS`,
  17 entries (6×p5, 6×p6, 5×s1) with fixed fields: `id`, `title`, `source`
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
- New color: `theme.jsx`'s `COLORS` had exactly 9 entries (one per existing
  module, all already in use) — added a 10th, `lime`, for this module
  specifically so it doesn't share a color with any existing module card.
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
  this 17-text state should still wait for the user to ask again** — they
  explicitly asked for batch 2 after reviewing batch 1, but don't add a
  batch 3 to `CLASSICAL_PROSE_ITEMS` unprompted.

## Build status
- [x] Project scaffold — theme, storage, Home dashboard (3×3 module grid), hub-and-spoke nav
- [x] Module 1 — 詩詞學習 (Classical Poetry + 文言文)
- [x] Module 2 — 作文金句
- [x] Module 3 — 倉頡輸入法教學
- [x] Module 4 — 普通話練習
- [x] Module 5 — 成語學習
- [x] Module 6 — 中國歷史故事
- [x] Module 7 — 閱讀理解
- [x] Module 8 — 修辭手法
- [x] Module 9 — 標點符號練習
- [x] Module 10 — 文言文選讀 (17 texts across 2 batches; see Module 10 notes)

**All 10 modules are built.** Remaining known gaps (content depth, not
missing features):
- [ ] Expand poem library further beyond the current 38+5 curated items (spec target: ~150)
- [ ] Expand essay golden sentence library further beyond the current 60 curated items
- [ ] Expand Mandarin vocabulary/sentence bank beyond the initial 22+6 curated items
- [ ] Idiom library now at 653 (39 fully-verified + 495 lighter-schema + 119
      curriculum-gap batch with verified `origin` — see Module 5 notes);
      could still have `origin` added back to more of the 495 lighter-schema
      entries if depth matters more than volume later
- [ ] Expand history story library further beyond the current 36 curated items
- [ ] Expand reading passage library further beyond the current 16 curated items (now 5 questions each)
- [ ] Expand rhetoric practice sentences further beyond the current 63 curated items
- [ ] Expand punctuation practice items further beyond the current 30 curated items
- [ ] Classical prose library at 17 texts (2 batches so far) — expand
      further toward the referenced ~26-text curriculum only if the user
      asks again, per Module 10 notes
- [ ] Composing arbitrary multi-root Cangjie characters (currently scoped to
      the 24 basic roots + 5 verified compound examples — see Module 3 notes)
- [ ] Cross-module linking from other modules back to Cangjie if a child
      gets stuck typing (no module currently needs free Chinese text entry
      besides Cangjie/Mandarin themselves, so this hasn't come up yet)
