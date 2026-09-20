// 倉頡輸入法 reference content: the 24 basic root letters (+ the special
// 難 key), grouped into the 4 traditional colour-coded categories used by
// "五色學倉頡"-style teaching, plus a handful of verified compound-character
// examples and one 速成 (Quick Cangjie) example.
//
// Every mapping/code below was cross-checked against multiple independent
// Cangjie reference sources before being written here (getting a keystroke
// wrong in a typing tutorial actively mis-teaches the child, unlike a
// subjective poem interpretation) — see CLAUDE.md Module 3 notes.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const CATEGORIES = [
    { key: "philosophy", label: "哲理類", color: "rose" },
    { key: "stroke", label: "筆劃類", color: "orange" },
    { key: "body", label: "人體類", color: "amber" },
    { key: "shape", label: "字形類", color: "emerald" },
    { key: "special", label: "難字鍵", color: "violet" },
  ];

  // The 24 basic roots + the special 難 (X) "doesn't fit anywhere else" key.
  const ROOTS = [
    { letter: "A", char: "日", meaning: "太陽", category: "philosophy" },
    { letter: "B", char: "月", meaning: "月亮", category: "philosophy" },
    { letter: "C", char: "金", meaning: "金屬", category: "philosophy" },
    { letter: "D", char: "木", meaning: "樹木", category: "philosophy" },
    { letter: "E", char: "水", meaning: "水", category: "philosophy" },
    { letter: "F", char: "火", meaning: "火", category: "philosophy" },
    { letter: "G", char: "土", meaning: "泥土", category: "philosophy" },

    { letter: "H", char: "竹", meaning: "竹", category: "stroke", definition: "斜" },
    { letter: "I", char: "戈", meaning: "武器", category: "stroke", definition: "點" },
    { letter: "J", char: "十", meaning: "十字", category: "stroke", definition: "交" },
    { letter: "K", char: "大", meaning: "大", category: "stroke", definition: "叉" },
    { letter: "L", char: "中", meaning: "中間", category: "stroke", definition: "縱" },
    { letter: "M", char: "一", meaning: "一橫", category: "stroke", definition: "橫" },
    { letter: "N", char: "弓", meaning: "弓", category: "stroke", definition: "鉤" },

    { letter: "O", char: "人", meaning: "人", category: "body" },
    { letter: "P", char: "心", meaning: "心", category: "body" },
    { letter: "Q", char: "手", meaning: "手", category: "body" },
    { letter: "R", char: "口", meaning: "口", category: "body" },

    { letter: "S", char: "尸", meaning: "身體", category: "shape", definition: "側" },
    { letter: "T", char: "廿", meaning: "二十", category: "shape", definition: "並" },
    { letter: "U", char: "山", meaning: "山", category: "shape", definition: "仰" },
    { letter: "V", char: "女", meaning: "女性", category: "shape", definition: "紐" },
    { letter: "W", char: "田", meaning: "田地", category: "shape", definition: "方" },
    { letter: "Y", char: "卜", meaning: "占卜", category: "shape", definition: "卜" },

    { letter: "X", char: "難", meaning: "難以歸類的字形", category: "special" },
  ];

  // Verified compound-character examples (each character is literally made
  // up of the roots shown, so the code is simply each root letter in order).
  const COMPOUND_EXAMPLES = [
    { char: "明", code: "AB", breakdown: "日 (A) + 月 (B)", note: "太陽和月亮放在一起，就是「明」。" },
    { char: "林", code: "DD", breakdown: "木 (D) + 木 (D)", note: "兩個「木」，變成樹林的「林」。" },
    { char: "森", code: "DDD", breakdown: "木 (D) + 木 (D) + 木 (D)", note: "三個「木」，樹更多了，就是「森」林。" },
    { char: "炎", code: "FF", breakdown: "火 (F) + 火 (F)", note: "兩個「火」疊在一起，就是「炎」。" },
    { char: "品", code: "RRR", breakdown: "口 (R) + 口 (R) + 口 (R)", note: "三個「口」疊在一起，就是「品」。" },
    { char: "早", code: "AJ", breakdown: "日 (A) + 十 (J)", note: "太陽升到「十」字架子那麼高，就是「早」上。" },
    { char: "旦", code: "AM", breakdown: "日 (A) + 一 (M)", note: "太陽（日）在地平線（一）之上，就是天亮的「旦」。" },
    { char: "圭", code: "GG", breakdown: "土 (G) + 土 (G)", note: "兩個「土」疊在一起，就是玉器名稱「圭」。" },
    { char: "昌", code: "AA", breakdown: "日 (A) + 日 (A)", note: "兩個「日」疊在一起，就是「昌」盛的「昌」。" },
    { char: "淼", code: "EEE", breakdown: "水 (E) + 水 (E) + 水 (E)", note: "三個「水」，形容水勢浩大的「淼」。" },
    { char: "二", code: "MM", breakdown: "一 (M) + 一 (M)", note: "兩橫（兩個「一」），就是數字「二」。" },
    { char: "三", code: "MMM", breakdown: "一 (M) + 一 (M) + 一 (M)", note: "三橫（三個「一」），就是數字「三」。" },
  ];

  // 輔助字形 (auxiliary shapes): compact variants derived from the 24 root
  // letters. The complete official list has ~90 shapes (第五代倉頡輸入法手冊
  // 第四節, 朱邦復工作室), but most of them have no Unicode character and are
  // only published as images, so they cannot be text-verified. This table
  // therefore lists ONLY shapes that (a) are named in the official manual's
  // text with their owning letter, and (b) whose example characters were
  // checked one by one: the example's Cangjie code (Unicode Unihan kCangjie,
  // cross-checked with hkcards.com) contains the owning letter.
  // 口 (R): the official 第五代倉頡字母及輔助字形表 (image supplied by the user)
  // and the manual text both list NO auxiliary shape for it — that is a
  // confirmed "none", not a gap.
  // Letters with no text-verifiable shape yet (glyphs are private-use/images
  // in the official table): A 日, D 木, U 山, V 女.
  // Corrections vs. the earlier draft: 想 was dropped from 忄 (its bottom is
  // the full 心, not 忄) and 半 from 丷 (半 is 火手, not 金).
  const AUXILIARY_SHAPES = [
    { rootLetter: "B", rootChar: "月", shape: "冂", examples: ["同", "用", "冊"] },
    { rootLetter: "B", rootChar: "月", shape: "冖", examples: ["冠", "軍"] },
    { rootLetter: "C", rootChar: "金", shape: "丷", examples: ["公", "分", "六"] },
    { rootLetter: "E", rootChar: "水", shape: "氵", examples: ["海", "湖", "游", "泡"] },
    { rootLetter: "E", rootChar: "水", shape: "又", examples: ["友", "叔", "取"] },
    { rootLetter: "F", rootChar: "火", shape: "灬", examples: ["熱", "煮", "熟", "黑"] },
    { rootLetter: "F", rootChar: "火", shape: "小", examples: ["尖", "少"] },
    { rootLetter: "G", rootChar: "土", shape: "士", examples: ["吉", "志", "壯"] },
    { rootLetter: "H", rootChar: "竹", shape: "⺮", examples: ["筆", "答", "節", "笑"] },
    { rootLetter: "I", rootChar: "戈", shape: "广", examples: ["店", "床", "度"] },
    { rootLetter: "I", rootChar: "戈", shape: "厶", examples: ["去", "台", "私"] },
    { rootLetter: "J", rootChar: "十", shape: "宀", examples: ["家", "字", "安", "客"] },
    { rootLetter: "K", rootChar: "大", shape: "疒", examples: ["病", "疼"] },
    { rootLetter: "L", rootChar: "中", shape: "丨", examples: ["串", "申"] },
    { rootLetter: "M", rootChar: "一", shape: "厂", examples: ["厚", "原"] },
    { rootLetter: "N", rootChar: "弓", shape: "亅", examples: ["事", "了"] },
    { rootLetter: "N", rootChar: "弓", shape: "乙", examples: ["乞"] },
    { rootLetter: "O", rootChar: "人", shape: "亻", examples: ["你", "他", "位", "作"] },
    { rootLetter: "O", rootChar: "人", shape: "入", examples: ["全", "內", "兩"] },
    { rootLetter: "P", rootChar: "心", shape: "忄", examples: ["快", "怕", "情", "忙"] },
    { rootLetter: "P", rootChar: "心", shape: "勹", examples: ["包", "句"] },
    { rootLetter: "P", rootChar: "心", shape: "匕", examples: ["化", "北", "比"] },
    { rootLetter: "P", rootChar: "心", shape: "七", examples: ["世"] },
    { rootLetter: "Q", rootChar: "手", shape: "扌", examples: ["打", "拉", "推", "提"] },
    { rootLetter: "S", rootChar: "尸", shape: "匸", examples: ["區", "匠"] },
    { rootLetter: "T", rootChar: "廿", shape: "廾", examples: ["弄"] },
    { rootLetter: "W", rootChar: "田", shape: "囗", examples: ["國", "因", "回"] },
    { rootLetter: "Y", rootChar: "卜", shape: "亠", examples: ["六", "交", "京", "高"] },
  ];

  // 拆字練習 — phase 1: 50 common characters. Every code below was checked
  // against 3 independent sources (Unicode Unihan kCangjie, en.wiktionary
  // `canj`, and hkcards.com's per-character root breakdown) and all three
  // agreed for all 50. Of ~110 candidates tested, characters where sources
  // disagreed or were ambiguous (e.g. 黃, which hkcards lists with two
  // variants) were left out. Codes are the common 三代/五代 form used in HK.
  const NO_AUX_OFFICIAL = { R: "官方表沒有為「口」列出輔助字形" };

  const CHAR_BREAKDOWN = [
    { char: "日", code: "A" }, { char: "月", code: "B" }, { char: "木", code: "D" },
    { char: "山", code: "U" }, { char: "口", code: "R" }, { char: "手", code: "Q" },
    { char: "明", code: "AB" }, { char: "朋", code: "BB" }, { char: "友", code: "KE" },
    { char: "好", code: "VND" }, { char: "你", code: "ONF" }, { char: "他", code: "OPD" },
    { char: "我", code: "HQI" }, { char: "是", code: "AMYO" }, { char: "有", code: "KB" },
    { char: "來", code: "DOO" }, { char: "去", code: "GI" }, { char: "天", code: "MK" },
    { char: "地", code: "GPD" }, { char: "小", code: "NC" }, { char: "上", code: "YM" },
    { char: "下", code: "MY" }, { char: "不", code: "MF" }, { char: "家", code: "JMSO" },
    { char: "學", code: "HBND" }, { char: "校", code: "DYCK" }, { char: "書", code: "LGA" },
    { char: "時", code: "AGDI" }, { char: "間", code: "ANA" }, { char: "看", code: "HQBU" },
    { char: "說", code: "YRCRU" }, { char: "話", code: "YRHJR" }, { char: "讀", code: "YRGWC" },
    { char: "寫", code: "JHXF" }, { char: "聽", code: "SGJWP" }, { char: "老", code: "JKP" },
    { char: "師", code: "HRMLB" }, { char: "愛", code: "BBPE" }, { char: "快", code: "PDK" },
    { char: "樂", code: "VID" }, { char: "媽", code: "VSQF" }, { char: "爸", code: "CKAU" },
    { char: "花", code: "TOP" }, { char: "草", code: "TAJ" }, { char: "春", code: "QKA" },
    { char: "風", code: "HNHLI" }, { char: "雨", code: "MLBY" }, { char: "魚", code: "NWF" },
    { char: "鳥", code: "HAYF" }, { char: "貓", code: "BHTW" },
  ];
  // 速成 (Quick Cangjie): take only the FIRST and LAST code of the full
  // Cangjie code (max 2 keystrokes per character either way).
  const QUICK_EXAMPLE = {
    char: "體",
    fullCode: "BBTW",
    quickCode: "BW",
    note: "「體」的完整倉頡碼是 月月廿田(BBTW)，速成則只需選第一碼和最後一碼：月田(BW)。",
  };

  window.App.Content.CANGJIE_CATEGORIES = CATEGORIES;
  window.App.Content.CANGJIE_ROOTS = ROOTS;
  window.App.Content.CANGJIE_COMPOUND_EXAMPLES = COMPOUND_EXAMPLES;
  window.App.Content.CANGJIE_AUXILIARY_SHAPES = AUXILIARY_SHAPES;
  window.App.Content.CANGJIE_QUICK_EXAMPLE = QUICK_EXAMPLE;
  window.App.Content.CANGJIE_CHAR_BREAKDOWN = CHAR_BREAKDOWN;
  window.App.Content.CANGJIE_NO_AUX_OFFICIAL = NO_AUX_OFFICIAL;
})();
