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
    { key: "philosophy", label: "哲理科", color: "rose" },
    { key: "stroke", label: "筆劃科", color: "orange" },
    { key: "body", label: "人身科", color: "amber" },
    { key: "shape", label: "字形科", color: "emerald" },
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

    { letter: "H", char: "竹", meaning: "竹", category: "stroke" },
    { letter: "I", char: "戈", meaning: "武器", category: "stroke" },
    { letter: "J", char: "十", meaning: "十字", category: "stroke" },
    { letter: "K", char: "大", meaning: "大", category: "stroke" },
    { letter: "L", char: "中", meaning: "中間", category: "stroke" },
    { letter: "M", char: "一", meaning: "一橫", category: "stroke" },
    { letter: "N", char: "弓", meaning: "弓", category: "stroke" },

    { letter: "O", char: "人", meaning: "人", category: "body" },
    { letter: "P", char: "心", meaning: "心", category: "body" },
    { letter: "Q", char: "手", meaning: "手", category: "body" },
    { letter: "R", char: "口", meaning: "口", category: "body" },

    { letter: "S", char: "尸", meaning: "身體", category: "shape" },
    { letter: "T", char: "廿", meaning: "二十", category: "shape" },
    { letter: "U", char: "山", meaning: "山", category: "shape" },
    { letter: "V", char: "女", meaning: "女性", category: "shape" },
    { letter: "W", char: "田", meaning: "田地", category: "shape" },
    { letter: "Y", char: "卜", meaning: "占卜", category: "shape" },

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

  // A small, verified subset of 輔助字形 (auxiliary shapes) — the compact
  // "side-form" variants of some root characters, which appear inside
  // thousands of common Chinese characters. Real Cangjie teaching covers
  // many more auxiliary shapes per key than shown here, but most sources
  // store their full tables as images (not extractable/verifiable text),
  // so this list is deliberately scoped to shapes independently confirmed
  // via multiple sources rather than a complete (but unverifiable) table —
  // see CLAUDE.md Module 3 notes before adding more entries here.
  const AUXILIARY_SHAPES = [
    { rootLetter: "E", rootChar: "水", shape: "氵", examples: ["海", "湖", "游", "泡"] },
    { rootLetter: "F", rootChar: "火", shape: "灬", examples: ["熱", "煮", "熟", "黑"] },
    { rootLetter: "O", rootChar: "人", shape: "亻", examples: ["你", "他", "位", "作"] },
    { rootLetter: "P", rootChar: "心", shape: "忄", examples: ["快", "怕", "情", "想"] },
    { rootLetter: "Q", rootChar: "手", shape: "扌", examples: ["打", "拉", "推", "提"] },
    { rootLetter: "H", rootChar: "竹", shape: "⺮", examples: ["筆", "答", "節", "笑"] },
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
})();
