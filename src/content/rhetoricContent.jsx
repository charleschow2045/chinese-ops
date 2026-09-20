// Curated 修辭手法 (rhetorical devices) reference + practice sentences.
// DEVICES is the reference list (studied first); PRACTICE_SENTENCES is a
// separate pool of example sentences (not the same as DEVICES' own example
// sentences, so practice isn't just rote memorization of what was just
// read), each tagged with the `device` name it demonstrates — this mirrors
// the generic-field pattern from Poetry/Essay/Idiom, so questions are
// generated at runtime (see RhetoricModule.jsx), not hand-authored.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const DEVICES = [
    {
      id: "biyu",
      name: "比喻",
      definition:
        "用另一種事物來比方要說明的事物，使描寫更加生動具體。常見標誌詞包括「像」、「如」、「彷彿」等，但有時也可以不用標誌詞而直接比作。",
      tip: "留意句子裏有沒有「用另一件事物形容另一件事物」的情況。",
      effect: "使抽象或難以形容的事物變得具體、形象，幫助讀者更容易理解和想像。",
      examples: ["月亮像一個銀盤掛在天上。", "他的心像鐵一樣硬。"],
    },
    {
      id: "niren",
      name: "擬人",
      definition: "把沒有生命的事物或者動物當成人一樣，賦予它們人類的動作、情感或者性格。",
      tip: "留意句子裏的事物有沒有做着「只有人才會做」的動作或情感（例如說話、微笑、傷心）。",
      effect: "令景物變得生動、有生命力，拉近讀者與描寫對象的距離，使文字更富感染力。",
      examples: ["小草從泥土裏探出頭來。", "風兒輕輕地唱着歌。"],
    },
    {
      id: "kuazhang",
      name: "誇張",
      definition: "為了突出事物的特點或者強調某種感受，故意誇大或者縮小事實的描述。",
      tip: "留意句子裏有沒有明顯誇大到不可能是事實的描述。",
      effect: "強烈突出事物的特點，加深讀者的印象，增強語氣的感染力。",
      examples: ["他嚇得魂飛魄散。", "教室裏靜得連一根針掉在地上都聽得見。"],
    },
    {
      id: "duiou",
      name: "對偶",
      definition: "用字數相等、結構相同或相似的兩個句子或短語，表達相關或相反的意思，讀起來工整、有節奏感。",
      tip: "留意有沒有兩句字數相同、結構對稱的句子並列出現。",
      effect: "使句子結構工整，讀起來朗朗上口，富有節奏感和音韻美。",
      examples: ["山重水複疑無路，柳暗花明又一村。", "野火燒不盡，春風吹又生。"],
    },
    {
      id: "paibi",
      name: "排比",
      definition: "用三個或以上結構相似、字數相近的句子或短語排列在一起，加強語氣和節奏感。",
      tip: "留意有沒有三個或以上結構相似的句子連續出現。",
      effect: "加強語氣，層層遞進地渲染情感或說理，使文章讀起來氣勢磅礴。",
      examples: ["他熱愛學習，熱愛運動，熱愛生活。", "書本是老師，書本是朋友，書本是通往世界的橋樑。"],
    },
    {
      id: "fanwen",
      name: "反問",
      definition: "用疑問的形式表達肯定或否定的意思，不需要對方回答，用來加強語氣。",
      tip: "留意這個「問題」背後是不是其實已經有一個明顯的答案，並非真的想發問。",
      effect: "加強肯定或否定的語氣，比直接敘述更能引發讀者思考，加深說服力。",
      examples: ["難道我們不應該珍惜時間嗎？", "這樣做，你認為對嗎？"],
    },
    {
      id: "shewen",
      name: "設問",
      definition: "先提出問題，然後自己回答，用來引起讀者注意，帶出下文重點。",
      tip: "留意句子是不是有「問完之後自己即刻回答」的結構。",
      effect: "引起讀者的注意和思考，順勢帶出下文要強調的重點，使論述更有條理。",
      examples: ["什麼是快樂？快樂就是能夠與家人在一起。", "誰是最可愛的人？當然是默默付出的人。"],
    },
  ];

  const PRACTICE_SENTENCES = [
    { id: "biyu-1", sentence: "圓月像一面銀白色的鏡子，掛在夜空中。", device: "比喻", level: "p5" },
    { id: "biyu-2", sentence: "妹妹的臉蛋紅得像一個熟透的蘋果。", device: "比喻", level: "p5" },
    { id: "biyu-3", sentence: "知識就是照亮前路的明燈。", device: "比喻", level: "p6" },

    { id: "niren-1", sentence: "小花在風中點頭微笑。", device: "擬人", level: "p5" },
    { id: "niren-2", sentence: "星星在夜空中眨着眼睛。", device: "擬人", level: "p5" },
    { id: "niren-3", sentence: "秋天悄悄地帶走了樹上最後一片葉子。", device: "擬人", level: "p6" },

    { id: "kuazhang-1", sentence: "他一口氣就能吃下十個漢堡包。", device: "誇張", level: "p5" },
    { id: "kuazhang-2", sentence: "等了足足一個世紀，公車終於到了。", device: "誇張", level: "p6" },
    { id: "kuazhang-3", sentence: "他的音量大到隔壁條街都聽得到。", device: "誇張", level: "s1" },

    { id: "duiou-1", sentence: "海闊憑魚躍，天空任鳥飛。", device: "對偶", level: "p6" },
    { id: "duiou-2", sentence: "書山有路勤為徑，學海無涯苦作舟。", device: "對偶", level: "s1" },
    { id: "duiou-3", sentence: "橫眉冷對千夫指，俯首甘為孺子牛。", device: "對偶", level: "s1" },

    { id: "paibi-1", sentence: "我愛藍天，我愛白雲，我愛這片美麗的土地。", device: "排比", level: "p5" },
    { id: "paibi-2", sentence: "早晨的陽光，午後的微風，黃昏的餘暉，都令人陶醉。", device: "排比", level: "p6" },
    { id: "paibi-3", sentence: "成功需要努力，需要堅持，更需要永不放棄的決心。", device: "排比", level: "s1" },

    { id: "fanwen-1", sentence: "難道說謊就是對的嗎？", device: "反問", level: "p6" },
    { id: "fanwen-2", sentence: "這樣粗心大意，能不出錯嗎？", device: "反問", level: "p6" },
    { id: "fanwen-3", sentence: "浪費時間，難道不可惜嗎？", device: "反問", level: "s1" },

    { id: "shewen-1", sentence: "什麼是勇氣？勇氣就是即使害怕，仍然願意嘗試。", device: "設問", level: "p6" },
    { id: "shewen-2", sentence: "誰能不勞而獲？沒有人可以。", device: "設問", level: "s1" },
    { id: "shewen-3", sentence: "成功的秘訣是什麼？就是堅持不懈的努力。", device: "設問", level: "s1" },

    // ---- expansion (user feedback: "too easy... level up and longer") ----
    { id: "biyu-4", sentence: "他的話像一把利劍，刺痛了在場所有人的心。", device: "比喻", level: "s1" },
    { id: "biyu-5", sentence: "老師的教誨如同一盞明燈，指引我們走過人生的迷霧。", device: "比喻", level: "p6" },
    { id: "biyu-6", sentence: "運動場上，他快如閃電，瞬間衝過終點線。", device: "比喻", level: "p5" },

    { id: "niren-4", sentence: "夕陽依依不捨地向大地道別，才緩緩沉入地平線。", device: "擬人", level: "p6" },
    { id: "niren-5", sentence: "老樹默默地訴說着歲月的故事，見證了小鎮的變遷。", device: "擬人", level: "s1" },
    { id: "niren-6", sentence: "微風輕撫過臉頰，彷彿在跟我打招呼。", device: "擬人", level: "p5" },

    { id: "kuazhang-4", sentence: "他嚇得整個人跳起三尺高。", device: "誇張", level: "p5" },
    { id: "kuazhang-5", sentence: "那間餐廳的排隊人龍，長得幾乎望不到盡頭。", device: "誇張", level: "p6" },
    { id: "kuazhang-6", sentence: "這件事令他傷心欲絕，眼淚幾乎流成一條小河。", device: "誇張", level: "s1" },

    { id: "duiou-4", sentence: "業精於勤，荒於嬉；行成於思，毀於隨。", device: "對偶", level: "s1" },
    { id: "duiou-5", sentence: "海納百川，有容乃大；壁立千仞，無欲則剛。", device: "對偶", level: "s1" },
    { id: "duiou-6", sentence: "讀萬卷書，行萬里路。", device: "對偶", level: "p6" },

    { id: "paibi-4", sentence: "青春是一首歌，是一幅畫，更是一場永不重來的旅程。", device: "排比", level: "s1" },
    { id: "paibi-5", sentence: "他勤奮讀書，努力練習，堅持不懈，終於考獲佳績。", device: "排比", level: "p6" },
    { id: "paibi-6", sentence: "陽光灑落大地，雨水滋潤禾苗，微風吹拂麥浪。", device: "排比", level: "p5" },

    { id: "fanwen-4", sentence: "如此重要的考試，難道我們不應該全力以赴嗎？", device: "反問", level: "p6" },
    { id: "fanwen-5", sentence: "面對困難就退縮，這樣算是勇敢嗎？", device: "反問", level: "p6" },
    { id: "fanwen-6", sentence: "難道犧牲環境換取發展，真的值得嗎？", device: "反問", level: "s1" },

    { id: "shewen-4", sentence: "什麼令人終生難忘？無疑是與家人共渡的美好時光。", device: "設問", level: "s1" },
    { id: "shewen-5", sentence: "怎樣才能成功？答案就是不斷努力，永不言棄。", device: "設問", level: "p6" },
    { id: "shewen-6", sentence: "誰是我最敬佩的人？當然是默默耕耘的清潔工人。", device: "設問", level: "p6" },

    // ---- second expansion (user feedback: "too easy" again — subtler
    // cues, no obvious keyword giveaway like 像/難道/什麼是 for every item) ----
    { id: "biyu-7", sentence: "他是班上的一顆星星，總在最黑暗的時候給人希望。", device: "比喻", level: "p6" },
    { id: "biyu-8", sentence: "母親的雙手，是我這輩子讀過最溫暖的一本書。", device: "比喻", level: "s1" },
    { id: "biyu-9", sentence: "時間是一把沉默的刻刀，在每個人臉上留下痕跡。", device: "比喻", level: "s1" },

    { id: "niren-7", sentence: "路燈在寂靜的街角站了一整夜，靜靜守護着回家的人。", device: "擬人", level: "p6" },
    { id: "niren-8", sentence: "書桌上那盞舊枱燈，陪着他熬過一個又一個深夜。", device: "擬人", level: "s1" },
    { id: "niren-9", sentence: "海浪一次又一次撲向岸邊，好像捨不得離開似的。", device: "擬人", level: "p6" },

    { id: "kuazhang-7", sentence: "這個消息一傳開，全城的人幾乎都知道了。", device: "誇張", level: "p6" },
    { id: "kuazhang-8", sentence: "他讀書讀到廢寢忘餐，幾乎把整個圖書館都搬回家。", device: "誇張", level: "s1" },
    { id: "kuazhang-9", sentence: "只是遲到五分鐘，媽媽卻好像等了一輩子那麼久。", device: "誇張", level: "p5" },

    { id: "duiou-7", sentence: "近水樓台先得月，向陽花木易為春。", device: "對偶", level: "s1" },
    { id: "duiou-8", sentence: "寧靜致遠，淡泊明志。", device: "對偶", level: "s1" },
    { id: "duiou-9", sentence: "台上一分鐘，台下十年功。", device: "對偶", level: "p6" },

    { id: "paibi-7", sentence: "他不因挫折而退縮，不因批評而氣餒，不因孤獨而放棄。", device: "排比", level: "s1" },
    { id: "paibi-8", sentence: "細心觀察，用心感受，耐心等待，成果自然會到來。", device: "排比", level: "s1" },
    { id: "paibi-9", sentence: "圖書館裏，有人埋首苦讀，有人低聲討論，有人靜靜沉思。", device: "排比", level: "p6" },

    { id: "fanwen-7", sentence: "把時間都花在手機遊戲上，這樣的生活能算充實嗎？", device: "反問", level: "s1" },
    { id: "fanwen-8", sentence: "連自己的承諾都做不到，又怎能取得別人的信任？", device: "反問", level: "s1" },
    { id: "fanwen-9", sentence: "犧牲了健康換來的成就，真的稱得上成功嗎？", device: "反問", level: "s1" },

    { id: "shewen-7", sentence: "怎樣才能贏得別人的尊重？唯有先學會尊重別人。", device: "設問", level: "s1" },
    { id: "shewen-8", sentence: "是什麼支撐着運動員捱過無數次跌倒？是永不放棄的意志。", device: "設問", level: "s1" },
    { id: "shewen-9", sentence: "真正的朋友是什麼樣子？大概就是在你失意時仍願意陪着你的人。", device: "設問", level: "p6" },

    // ---- third expansion (+42: 6 per device). Each sentence uses exactly one
    // device so the answer stays unambiguous; 對偶 lines are well-known
    // classical couplets (杜甫、王之渙、劉備遺詔、王維、王勃、劉禹錫). ----
    { id: "biyu-10", sentence: "棉花糖似的白雲，一朵朵飄在藍天上。", device: "比喻", level: "p5" },
    { id: "biyu-11", sentence: "他的字跡工整得像印刷出來的一樣。", device: "比喻", level: "p5" },
    { id: "biyu-12", sentence: "孩子的笑聲像一串銀鈴，清脆悅耳。", device: "比喻", level: "p6" },
    { id: "biyu-13", sentence: "圖書館是知識的海洋，我們都是在其中探索的小船。", device: "比喻", level: "p6" },
    { id: "biyu-14", sentence: "人生就像一場馬拉松，比的不是誰跑得最快，而是誰堅持得最久。", device: "比喻", level: "s1" },
    { id: "biyu-15", sentence: "謠言是一團無形的野火，一經點燃便難以撲滅。", device: "比喻", level: "s1" },

    { id: "niren-10", sentence: "太陽公公笑瞇瞇地探出頭來，向大地問好。", device: "擬人", level: "p5" },
    { id: "niren-11", sentence: "小溪唱着歡快的歌，一路奔向大海。", device: "擬人", level: "p5" },
    { id: "niren-12", sentence: "烏雲生氣地板起臉孔，很快便下起傾盆大雨。", device: "擬人", level: "p6" },
    { id: "niren-13", sentence: "寒風張牙舞爪地撲向路上的行人。", device: "擬人", level: "p6" },
    { id: "niren-14", sentence: "月亮悄悄躲到雲層後面，似乎不好意思露面。", device: "擬人", level: "p6" },
    { id: "niren-15", sentence: "校園裏的老榕樹，靜靜地看着一屆又一屆的學生畢業離開。", device: "擬人", level: "s1" },

    { id: "kuazhang-10", sentence: "聽到這個好消息，他高興得幾乎要飛上天。", device: "誇張", level: "p5" },
    { id: "kuazhang-11", sentence: "弟弟餓得能吃下一頭牛。", device: "誇張", level: "p5" },
    { id: "kuazhang-12", sentence: "這道菜實在太辣了，我的嘴巴簡直要噴出火來。", device: "誇張", level: "p6" },
    { id: "kuazhang-13", sentence: "一天沒見到你，就好像過了三年那麼長。", device: "誇張", level: "p6" },
    { id: "kuazhang-14", sentence: "他的笑聲震得整幢大樓都在搖晃。", device: "誇張", level: "s1" },
    { id: "kuazhang-15", sentence: "作業堆得比山還高，我一輩子也做不完。", device: "誇張", level: "s1" },

    { id: "duiou-10", sentence: "白日依山盡，黃河入海流。", device: "對偶", level: "p5" },
    { id: "duiou-11", sentence: "兩個黃鸝鳴翠柳，一行白鷺上青天。", device: "對偶", level: "p6" },
    { id: "duiou-12", sentence: "勿以善小而不為，勿以惡小而為之。", device: "對偶", level: "p6" },
    { id: "duiou-13", sentence: "大漠孤煙直，長河落日圓。", device: "對偶", level: "s1" },
    { id: "duiou-14", sentence: "海內存知己，天涯若比鄰。", device: "對偶", level: "s1" },
    { id: "duiou-15", sentence: "山不在高，有仙則名；水不在深，有龍則靈。", device: "對偶", level: "s1" },

    { id: "paibi-10", sentence: "春天的花是紅的，夏天的樹是綠的，秋天的果是黃的。", device: "排比", level: "p5" },
    { id: "paibi-11", sentence: "有的同學在打籃球，有的同學在跳繩，有的同學在追逐嬉戲。", device: "排比", level: "p5" },
    { id: "paibi-12", sentence: "讀書使人明智，讀書使人充實，讀書使人快樂。", device: "排比", level: "p6" },
    { id: "paibi-13", sentence: "我們要學會感恩：感恩父母的養育，感恩老師的教導，感恩朋友的陪伴。", device: "排比", level: "p6" },
    { id: "paibi-14", sentence: "人生需要勇氣去面對，需要智慧去選擇，需要毅力去堅持。", device: "排比", level: "s1" },
    { id: "paibi-15", sentence: "他用勤勞耕耘土地，用汗水澆灌希望，用雙手創造未來。", device: "排比", level: "s1" },

    { id: "fanwen-10", sentence: "難道你忍心看着朋友受苦而不伸出援手嗎？", device: "反問", level: "p5" },
    { id: "fanwen-11", sentence: "這麼簡單的道理，你怎麼會不明白呢？", device: "反問", level: "p6" },
    { id: "fanwen-12", sentence: "誰不希望生活在一個安全的環境裏呢？", device: "反問", level: "p6" },
    { id: "fanwen-13", sentence: "垃圾隨處亂拋，我們的城市怎能乾淨呢？", device: "反問", level: "p6" },
    { id: "fanwen-14", sentence: "連最基本的禮貌都不懂，還談什麼尊重別人？", device: "反問", level: "s1" },
    { id: "fanwen-15", sentence: "既然事事推給別人，又怎能學到真本領？", device: "反問", level: "s1" },

    { id: "shewen-10", sentence: "什麼東西最珍貴？時間最珍貴，因為它一去不回。", device: "設問", level: "p5" },
    { id: "shewen-11", sentence: "小小的螞蟻有什麼本領？牠們懂得團結合作，能搬動比自己重很多倍的食物。", device: "設問", level: "p5" },
    { id: "shewen-12", sentence: "我們為什麼要保護環境？因為地球是我們唯一的家。", device: "設問", level: "p6" },
    { id: "shewen-13", sentence: "怎樣才能學好語文？多讀書、多寫作、多思考。", device: "設問", level: "p6" },
    { id: "shewen-14", sentence: "什麼是真正的富有？是內心的滿足，而不是擁有很多金錢。", device: "設問", level: "s1" },
    { id: "shewen-15", sentence: "是誰讓這座城市在深夜依然明亮？是那些默默值夜班的工作人員。", device: "設問", level: "s1" },
  ];

  const RHETORIC_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.RHETORIC_DEVICES = DEVICES;
  window.App.Content.RHETORIC_PRACTICE_SENTENCES = PRACTICE_SENTENCES;
  window.App.Content.RHETORIC_LEVEL_LABEL = RHETORIC_LEVEL_LABEL;
})();
