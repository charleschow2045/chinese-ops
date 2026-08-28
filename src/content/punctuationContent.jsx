// Curated 標點符號 (punctuation) reference + practice items.
// PUNCTUATION_MARKS is the reference list (10 marks, studied via list/detail).
// PRACTICE_ITEMS has two distinct shapes ("kind"), because single-character
// marks (。，、？！：；) and pair/multi-character marks (「」——……) need
// different question mechanics to stay unambiguous and fair as MC:
//   - kind "fill": a sentence with ONE single-character mark blanked out
//     (`before`/`after` around the blank); options are single-char marks
//     only, so distractors are same "shape" as the answer.
//   - kind "identify": a fully-punctuated sentence with the target mark
//     (`highlightedMark`, an exact substring — may be a whole quoted/dash/
//     ellipsis segment) shown highlighted inline; asks for the mark's NAME,
//     sidestepping the problem of generating plausible same-length
//     distractor segments for pair marks.
// See RhetoricModule.jsx for the sibling pattern this reuses conceptually.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const PUNCTUATION_MARKS = [
    {
      id: "juhao",
      mark: "。",
      name: "句號",
      usage: "用在完整的陳述句尾，表示一句說話講完。",
      examples: ["今天天氣很好。", "他每天都會看書。"],
    },
    {
      id: "douhao",
      mark: "，",
      name: "逗號",
      usage: "用在句子中間，分隔意思上有停頓的部分，讓句子讀起來更加清晰。",
      examples: ["我今天很累，所以想早點睡覺。", "雖然下雨，我們還是去了公園。"],
    },
    {
      id: "dunhao",
      mark: "、",
      name: "頓號",
      usage: "用在並列的詞語之間，例如列舉幾樣事物的時候。",
      examples: ["我喜歡蘋果、橙、香蕉。", "書包裏有課本、文具、水壺。"],
    },
    {
      id: "wenhao",
      mark: "？",
      name: "問號",
      usage: "用在疑問句尾，表示發問。",
      examples: ["你今天吃了午飯嗎？", "這是誰的鉛筆？"],
    },
    {
      id: "gantanhao",
      mark: "！",
      name: "感嘆號",
      usage: "用在感嘆句或祈使句尾，表達強烈的情感或語氣。",
      examples: ["這裏的風景真美啊！", "小心，前面有車！"],
    },
    {
      id: "maohao",
      mark: "：",
      name: "冒號",
      usage: "用在提出解釋、列舉，或者引出說話內容之前。",
      examples: ["今天要買的東西有：蘋果、麵包、牛奶。", "老師說：「明天要交功課。」"],
    },
    {
      id: "fenhao",
      mark: "；",
      name: "分號",
      usage: "用在兩個或以上意思相關但可以獨立成句的分句之間，分句之間的關係比逗號更疏離。",
      examples: ["他喜歡畫畫；哥哥則喜歡音樂。", "春天百花盛開；秋天碩果纍纍。"],
    },
    {
      id: "yinhao",
      mark: "「」",
      name: "引號",
      usage: "用在引用別人所說的話，或者強調某個詞語的時候。",
      examples: ["老師說：「明天要交功課。」", "他被稱為「小天才」。"],
    },
    {
      id: "poshehao",
      mark: "——",
      name: "破折號",
      usage: "用在說明、解釋、話題轉折，或者聲音延續的時候。",
      examples: ["他終於做到了——經過無數次的努力。", "轟——一聲巨響，嚇了大家一跳。"],
    },
    {
      id: "shenglvehao",
      mark: "……",
      name: "省略號",
      usage: "用在省略了的內容，或者說話斷斷續續、意猶未盡的時候。",
      examples: ["書包裏有課本、文具、水壺……", "他支支吾吾地說：「我……我不是故意的。」"],
    },
  ];

  const PRACTICE_ITEMS = [
    // ---- kind: "fill" (single-character marks) ----
    { id: "f-juhao-1", kind: "fill", before: "今天天氣很好", after: "", markChar: "。", markName: "句號", level: "p5" },
    { id: "f-juhao-2", kind: "fill", before: "他每天都會看書", after: "", markChar: "。", markName: "句號", level: "p5" },
    {
      id: "f-douhao-1",
      kind: "fill",
      before: "我今天很累",
      after: "所以想早點睡覺。",
      markChar: "，",
      markName: "逗號",
      level: "p5",
    },
    {
      id: "f-douhao-2",
      kind: "fill",
      before: "雖然下雨",
      after: "我們還是去了公園。",
      markChar: "，",
      markName: "逗號",
      level: "p6",
    },
    { id: "f-dunhao-1", kind: "fill", before: "我喜歡蘋果", after: "橙子。", markChar: "、", markName: "頓號", level: "p5" },
    {
      id: "f-dunhao-2",
      kind: "fill",
      before: "書包裏有課本",
      after: "文具和水壺。",
      markChar: "、",
      markName: "頓號",
      level: "p6",
    },
    { id: "f-wenhao-1", kind: "fill", before: "你今天吃了午飯嗎", after: "", markChar: "？", markName: "問號", level: "p5" },
    { id: "f-wenhao-2", kind: "fill", before: "這是誰的鉛筆", after: "", markChar: "？", markName: "問號", level: "p5" },
    { id: "f-gantanhao-1", kind: "fill", before: "這裏的風景真美啊", after: "", markChar: "！", markName: "感嘆號", level: "p5" },
    {
      id: "f-gantanhao-2",
      kind: "fill",
      before: "前面有車，大家要小心",
      after: "",
      markChar: "！",
      markName: "感嘆號",
      level: "p6",
    },
    {
      id: "f-maohao-1",
      kind: "fill",
      before: "今天要買的東西有",
      after: "蘋果、麵包和牛奶。",
      markChar: "：",
      markName: "冒號",
      level: "p6",
    },
    {
      id: "f-maohao-2",
      kind: "fill",
      before: "這個道理很簡單",
      after: "努力就會有收穫。",
      markChar: "：",
      markName: "冒號",
      level: "s1",
    },
    {
      id: "f-fenhao-1",
      kind: "fill",
      before: "他喜歡畫畫",
      after: "哥哥則喜歡音樂。",
      markChar: "；",
      markName: "分號",
      level: "s1",
    },
    {
      id: "f-fenhao-2",
      kind: "fill",
      before: "春天百花盛開",
      after: "秋天碩果纍纍。",
      markChar: "；",
      markName: "分號",
      level: "s1",
    },

    // ---- expansion (user feedback: "too easy... level up and longer") ----
    {
      id: "f-juhao-3",
      kind: "fill",
      before: "經過不斷努力，他終於考獲全級第一名",
      after: "",
      markChar: "。",
      markName: "句號",
      level: "p6",
    },
    {
      id: "f-douhao-3",
      kind: "fill",
      before: "雖然天氣寒冷",
      after: "我們仍然堅持晨跑鍛煉身體。",
      markChar: "，",
      markName: "逗號",
      level: "p6",
    },
    {
      id: "f-dunhao-3",
      kind: "fill",
      before: "這個書架上放滿了小說、詩集",
      after: "散文集等各類書籍。",
      markChar: "、",
      markName: "頓號",
      level: "s1",
    },
    {
      id: "f-wenhao-3",
      kind: "fill",
      before: "你認為這個做法是否恰當",
      after: "",
      markChar: "？",
      markName: "問號",
      level: "p6",
    },
    {
      id: "f-gantanhao-3",
      kind: "fill",
      before: "多麼壯麗的日出景色啊",
      after: "",
      markChar: "！",
      markName: "感嘆號",
      level: "p6",
    },
    {
      id: "f-maohao-3",
      kind: "fill",
      before: "班長清點人數後宣布",
      after: "全班同學都已經到齊了。",
      markChar: "：",
      markName: "冒號",
      level: "s1",
    },
    {
      id: "f-fenhao-3",
      kind: "fill",
      before: "讀書使人充實",
      after: "討論使人機智。",
      markChar: "；",
      markName: "分號",
      level: "s1",
    },

    // ---- kind: "identify" (pair / multi-character marks) ----
    {
      id: "i-yinhao-1",
      kind: "identify",
      sentence: "老師說：「明天要交功課。」",
      highlightedMark: "「明天要交功課。」",
      markName: "引號",
      level: "p6",
    },
    {
      id: "i-yinhao-2",
      kind: "identify",
      sentence: "他被稱為「小天才」，因為數學成績特別好。",
      highlightedMark: "「小天才」",
      markName: "引號",
      level: "s1",
    },
    {
      id: "i-poshehao-1",
      kind: "identify",
      sentence: "他終於做到了——經過無數次的努力。",
      highlightedMark: "——",
      markName: "破折號",
      level: "s1",
    },
    {
      id: "i-poshehao-2",
      kind: "identify",
      sentence: "轟——一聲巨響，嚇了大家一跳。",
      highlightedMark: "——",
      markName: "破折號",
      level: "s1",
    },
    {
      id: "i-shenglvehao-1",
      kind: "identify",
      sentence: "書包裏有課本、文具、水壺……",
      highlightedMark: "……",
      markName: "省略號",
      level: "p6",
    },
    {
      id: "i-shenglvehao-2",
      kind: "identify",
      sentence: "他支支吾吾地說：「我……我不是故意的。」",
      highlightedMark: "……",
      markName: "省略號",
      level: "s1",
    },
    {
      id: "i-yinhao-3",
      kind: "identify",
      sentence: "班長宣布：「明天旅行改為星期五出發。」",
      highlightedMark: "「明天旅行改為星期五出發。」",
      markName: "引號",
      level: "s1",
    },
    {
      id: "i-poshehao-3",
      kind: "identify",
      sentence: "他終於考獲佳績——這是他多年努力的成果。",
      highlightedMark: "——",
      markName: "破折號",
      level: "s1",
    },
    {
      id: "i-shenglvehao-3",
      kind: "identify",
      sentence: "面對突如其來的變故，她一時不知所措，只喃喃地說：「怎麼會這樣……」",
      highlightedMark: "……",
      markName: "省略號",
      level: "s1",
    },
  ];

  const PUNCTUATION_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.PUNCTUATION_MARKS = PUNCTUATION_MARKS;
  window.App.Content.PUNCTUATION_PRACTICE_ITEMS = PRACTICE_ITEMS;
  window.App.Content.PUNCTUATION_LEVEL_LABEL = PUNCTUATION_LEVEL_LABEL;
})();
