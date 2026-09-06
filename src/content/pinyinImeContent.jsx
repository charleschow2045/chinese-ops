// 拼音輸入法 (Pinyin IME) tutorial content — a new section added to Module 4
// after user feedback ("add a section teaching how to type Chinese using
// pinyin"). Unlike 拼音默寫 (which tests knowing a word's pinyin spelling),
// this teaches the actual typing mechanic: type toneless pinyin, then pick
// the right character from a list of homophones (同音字) that share that
// exact spelling — the real bottleneck a pinyin-IME beginner faces.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  // Foundational "what is pinyin" content, shown BEFORE `INTRO` below.
  // `INTRO` explains the *typing mechanic* (type pinyin, pick a candidate)
  // assuming the reader already knows what pinyin itself is — for a true
  // beginner that assumption doesn't hold, so this fills that gap. Kept
  // deliberately separate from `EXAMPLE` (demonstrates picking a candidate
  // for a whole word) and `WHY_CANDIDATES` (explains 同音字) — this only
  // covers what pinyin is and how 聲母/韻母 combine into a syllable.
  const BASICS = {
    whatIsPinyin:
      "拼音是用羅馬字母（即a、b、c等英文字母）記錄普通話讀音的系統，用來標示漢字應該怎樣讀。雖然拼音使用英文字母的寫法，但它並不是英文串法——「拼音」和「英文」是兩套不同的系統，讀音規則完全不同，同一個字母在拼音裏的讀法，未必和英文相同。",
    syllableStructure:
      "一個普通話音節，通常由「聲母」和「韻母」兩部分組成：聲母在音節的前面，讀音短促，作用有點像英文的輔音；韻母在音節的後面，讀音較長，作用有點像英文的元音。將聲母和韻母合起來讀，就是一個完整音節的讀音。",
    examples: [
      { syllable: "hao", initial: "h", final: "ao", char: "好" },
      { syllable: "ma", initial: "m", final: "a", char: "媽" },
    ],
    toneNote:
      "拼音本來每個音節都帶有聲調（例如陰平、陽平、上聲、去聲），用來標示讀音的高低升降。不過在這個打字練習中，「不需要輸入聲調」是指打字時只需要輸入羅馬字母本身（例如「hao」），不用輸入聲調符號（例如 ā、á、ǎ、à），電腦就會自動列出所有讀音相同或相近的字，讓你從中選出正確的一個。",
  };

  const INTRO =
    "拼音輸入法是根據漢字的普通話讀音來打字：只需要輸入該字的拼音（不需要輸入聲調），電腦就會列出所有讀音相同或相近的字，讓你從中選出正確的一個。";

  const EXAMPLE = {
    pinyin: "nihao",
    candidates: ["你好", "泥好", "尼好"],
    correct: "你好",
    note: "輸入「nihao」，電腦會列出「你好」等候選詞，選出意思正確的一個就可以了。",
  };

  const WHY_CANDIDATES =
    "普通話裏有很多字讀音完全相同（稱為「同音字」），單憑拼音無法分辨應該用哪一個字，所以拼音輸入法一定會列出候選字清單，靠使用者根據句子的意思選出正確的字。";

  // Each item: type the toneless pinyin for the blanked word, then pick the
  // correct character from candidates that all share that exact pinyin
  // spelling (a real 同音字 set) using the clue sentence's meaning.
  const HOMOPHONE_ITEMS = [
    {
      id: "shi",
      pinyin: "shi",
      clue: "表示肯定意思的動詞，例如「這＿蘋果」",
      correct: "是",
      candidates: ["是", "十", "市", "式"],
      level: "p5",
    },
    {
      id: "mai",
      pinyin: "mai",
      clue: "用金錢換取貨物，例如「媽媽去市場＿菜」",
      correct: "買",
      candidates: ["買", "賣", "麥", "埋"],
      level: "p5",
    },
    {
      id: "yi-yisheng",
      pinyin: "yi",
      clue: "在醫院為病人診治的人，稱為＿生",
      correct: "醫",
      candidates: ["醫", "衣", "一", "依"],
      level: "p6",
    },
    {
      id: "shu",
      pinyin: "shu",
      clue: "用來閱讀的印刷品，稱為＿本",
      correct: "書",
      candidates: ["書", "輸", "叔", "梳"],
      level: "p5",
    },
    {
      id: "hua",
      pinyin: "hua",
      clue: "與人交談時所說的言語，稱為說＿",
      correct: "話",
      candidates: ["話", "畫", "化", "花"],
      level: "p6",
    },
    {
      id: "zhi",
      pinyin: "zhi",
      clue: "明白事理，稱為＿道",
      correct: "知",
      candidates: ["知", "隻", "之", "枝"],
      level: "p6",
    },
    {
      id: "xin",
      pinyin: "xin",
      clue: "郵寄的文件，稱為＿件",
      correct: "信",
      candidates: ["信", "心", "新", "辛"],
      level: "p5",
    },
    {
      id: "gong",
      pinyin: "gong",
      clue: "學生每天要完成的作業，稱為做＿課",
      correct: "功",
      candidates: ["功", "工", "公", "弓"],
      level: "p6",
    },
    {
      id: "fen",
      pinyin: "fen",
      clue: "把整體分開的動作，稱為＿開",
      correct: "分",
      candidates: ["分", "份", "紛", "芬"],
      level: "p6",
    },
    {
      id: "xiao",
      pinyin: "xiao",
      clue: "學生讀書的地方，稱為學＿",
      correct: "校",
      candidates: ["校", "笑", "效", "孝"],
      level: "p5",
    },
    {
      id: "xue",
      pinyin: "xue",
      clue: "每天到學校讀書，稱為上＿",
      correct: "學",
      candidates: ["學", "雪", "血", "削"],
      level: "p5",
    },
    {
      id: "zhong",
      pinyin: "zhong",
      clue: "計算時間的工具，稱為時＿",
      correct: "鐘",
      candidates: ["鐘", "中", "種", "重"],
      level: "p6",
    },
    {
      id: "yi-yiyi",
      pinyin: "yi",
      clue: "文章想表達的道理，稱為意＿",
      correct: "義",
      candidates: ["義", "意", "藝", "易"],
      level: "s1",
    },
  ];

  const PINYIN_IME_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.PINYIN_IME_BASICS = BASICS;
  window.App.Content.PINYIN_IME_INTRO = INTRO;
  window.App.Content.PINYIN_IME_EXAMPLE = EXAMPLE;
  window.App.Content.PINYIN_IME_WHY_CANDIDATES = WHY_CANDIDATES;
  window.App.Content.PINYIN_IME_HOMOPHONE_ITEMS = HOMOPHONE_ITEMS;
  window.App.Content.PINYIN_IME_LEVEL_LABEL = PINYIN_IME_LEVEL_LABEL;
})();
