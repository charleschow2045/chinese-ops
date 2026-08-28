// Curated 普通話 (Mandarin/Putonghua) vocabulary + sentences for listening,
// speaking, reading-aloud, and pinyin-writing practice.
// `pinyin` carries tone marks for display; practice input is compared after
// stripping tone marks (see src/speechUtils.jsx `normalizePinyin`), since
// typing diacritics isn't realistic for a child on a normal keyboard.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const MANDARIN_ITEMS = [
    // ---- words (kind: "word") ----
    { id: "ni-hao", kind: "word", hanzi: "你好", pinyin: "nǐ hǎo", meaning: "見面時的問候語", level: "p5" },
    { id: "xiexie", kind: "word", hanzi: "謝謝", pinyin: "xièxie", meaning: "表示感謝", level: "p5" },
    { id: "zaijian", kind: "word", hanzi: "再見", pinyin: "zàijiàn", meaning: "分別時所說的話", level: "p5" },
    { id: "laoshi", kind: "word", hanzi: "老師", pinyin: "lǎoshī", meaning: "教導學生的人", level: "p5" },
    { id: "tongxue", kind: "word", hanzi: "同學", pinyin: "tóngxué", meaning: "一起讀書的同伴", level: "p5" },
    { id: "pengyou", kind: "word", hanzi: "朋友", pinyin: "péngyou", meaning: "熟悉友好的人", level: "p5" },
    { id: "xuexiao", kind: "word", hanzi: "學校", pinyin: "xuéxiào", meaning: "讀書學習的地方", level: "p5" },
    { id: "jintian", kind: "word", hanzi: "今天", pinyin: "jīntiān", meaning: "現在這一天", level: "p5" },
    { id: "mingtian", kind: "word", hanzi: "明天", pinyin: "míngtiān", meaning: "今天之後的一天", level: "p5" },
    { id: "zuotian", kind: "word", hanzi: "昨天", pinyin: "zuótiān", meaning: "今天之前的一天", level: "p5" },

    { id: "duibuqi", kind: "word", hanzi: "對不起", pinyin: "duìbuqǐ", meaning: "表示道歉", level: "p6" },
    { id: "meiguanxi", kind: "word", hanzi: "沒關係", pinyin: "méi guānxi", meaning: "表示不要緊", level: "p6" },
    { id: "tushuguan", kind: "word", hanzi: "圖書館", pinyin: "túshūguǎn", meaning: "借閱圖書的地方", level: "p6" },
    { id: "yundong", kind: "word", hanzi: "運動", pinyin: "yùndòng", meaning: "活動身體的活動", level: "p6" },
    { id: "tianqi", kind: "word", hanzi: "天氣", pinyin: "tiānqì", meaning: "天空的狀況（晴、雨等）", level: "p6" },
    { id: "gaoxing", kind: "word", hanzi: "高興", pinyin: "gāoxìng", meaning: "開心的心情", level: "p6" },
    { id: "xihuan", kind: "word", hanzi: "喜歡", pinyin: "xǐhuan", meaning: "對某事物有好感", level: "p6" },
    { id: "xingqi", kind: "word", hanzi: "星期", pinyin: "xīngqī", meaning: "七天為一個單位", level: "p6" },

    { id: "qingwen", kind: "word", hanzi: "請問", pinyin: "qǐngwèn", meaning: "有禮貌地詢問", level: "s1" },
    { id: "mafan", kind: "word", hanzi: "麻煩", pinyin: "máfan", meaning: "表示不好意思打擾別人", level: "s1" },
    { id: "xinku", kind: "word", hanzi: "辛苦", pinyin: "xīnkǔ", meaning: "形容做事非常勞累", level: "s1" },
    { id: "zixin", kind: "word", hanzi: "自信", pinyin: "zìxìn", meaning: "相信自己的能力", level: "s1" },

    // ---- sentences (kind: "sentence") — for reading-aloud practice ----
    { id: "s-ni-hao-ma", kind: "sentence", hanzi: "你好嗎？", pinyin: "Nǐ hǎo ma?", meaning: "見面時詢問對方近況", level: "p5" },
    { id: "s-wo-hen-hao", kind: "sentence", hanzi: "我很好，謝謝。", pinyin: "Wǒ hěn hǎo, xièxie.", meaning: "回應對方的問候", level: "p5" },
    { id: "s-tianqi-hen-hao", kind: "sentence", hanzi: "今天天氣很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", meaning: "描述天氣狀況", level: "p6" },
    { id: "s-xihuan-kanshu", kind: "sentence", hanzi: "我喜歡看書。", pinyin: "Wǒ xǐhuan kàn shū.", meaning: "表達個人興趣", level: "p6" },
    { id: "s-xishoujian", kind: "sentence", hanzi: "請問洗手間在哪裏？", pinyin: "Qǐngwèn xǐshǒujiān zài nǎlǐ?", meaning: "有禮貌地問路", level: "s1" },
    { id: "s-mingtian-jian", kind: "sentence", hanzi: "明天見。", pinyin: "Míngtiān jiàn.", meaning: "分別時的道別語", level: "s1" },
  ];

  const MANDARIN_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.MANDARIN_ITEMS = MANDARIN_ITEMS;
  window.App.Content.MANDARIN_LEVEL_LABEL = MANDARIN_LEVEL_LABEL;
})();
