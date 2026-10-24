// Curated 修辭手法 (rhetorical devices) reference + practice sentences.
// DEVICES is the reference list (studied first); PRACTICE_SENTENCES is a
// separate pool of example sentences (not the same as DEVICES' own example
// sentences, so practice isn't just rote memorization of what was just
// read), each tagged with the `device` name it demonstrates — this mirrors
// the generic-field pattern from Poetry/Essay/Idiom, so questions are
// generated at runtime (see RhetoricModule.jsx / rhetoricQuiz.jsx), not hand-authored.
//
// 階段 9a optional fields: DEVICES[].confusableWith (names of the devices students mix this one up with; always two-way) and
// PRACTICE_SENTENCES[].alsoDevices (names of OTHER devices the sentence also genuinely uses; such a sentence is never offered
// as a wrong option for those devices and never used as a 是非題 stem).
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
      confusableWith: ["擬人", "誇張"],
      examples: ["月亮像一個銀盤掛在天上。", "他的心像鐵一樣硬。"],
    },
    {
      id: "niren",
      name: "擬人",
      definition: "把沒有生命的事物或者動物當成人一樣，賦予它們人類的動作、情感或者性格。",
      tip: "留意句子裏的事物有沒有做着「只有人才會做」的動作或情感（例如說話、微笑、傷心）。",
      effect: "令景物變得生動、有生命力，拉近讀者與描寫對象的距離，使文字更富感染力。",
      confusableWith: ["比喻"],
      examples: ["小草從泥土裏探出頭來。", "風兒輕輕地唱着歌。"],
    },
    {
      id: "kuazhang",
      name: "誇張",
      definition: "為了突出事物的特點或者強調某種感受，故意誇大或者縮小事實的描述。",
      tip: "留意句子裏有沒有明顯誇大到不可能是事實的描述。",
      effect: "強烈突出事物的特點，加深讀者的印象，增強語氣的感染力。",
      confusableWith: ["比喻"],
      examples: ["他嚇得魂飛魄散。", "教室裏靜得連一根針掉在地上都聽得見。"],
    },
    {
      id: "duiou",
      name: "對偶",
      definition: "用字數相等、結構相同或相似的兩個句子或短語，表達相關或相反的意思，讀起來工整、有節奏感。",
      tip: "留意有沒有兩句字數相同、結構對稱的句子並列出現。",
      effect: "使句子結構工整，讀起來朗朗上口，富有節奏感和音韻美。",
      confusableWith: ["排比", "對比", "引用"],
      examples: ["山重水複疑無路，柳暗花明又一村。", "野火燒不盡，春風吹又生。"],
    },
    {
      id: "paibi",
      name: "排比",
      definition: "用三個或以上結構相似、字數相近的句子或短語排列在一起，加強語氣和節奏感。",
      tip: "留意有沒有三個或以上結構相似的句子連續出現。",
      effect: "加強語氣，層層遞進地渲染情感或說理，使文章讀起來氣勢磅礴。",
      confusableWith: ["對偶", "反覆"],
      examples: ["他熱愛學習，熱愛運動，熱愛生活。", "書本是老師，書本是朋友，書本是通往世界的橋樑。"],
    },
    {
      id: "fanwen",
      name: "反問",
      definition: "用疑問的形式表達肯定或否定的意思，不需要對方回答，用來加強語氣。",
      tip: "留意這個「問題」背後是不是其實已經有一個明顯的答案，並非真的想發問。",
      effect: "加強肯定或否定的語氣，比直接敘述更能引發讀者思考，加深說服力。",
      confusableWith: ["設問"],
      examples: ["難道我們不應該珍惜時間嗎？", "這樣做，你認為對嗎？"],
    },
    {
      id: "shewen",
      name: "設問",
      definition: "先提出問題，然後自己回答，用來引起讀者注意，帶出下文重點。",
      tip: "留意句子是不是有「問完之後自己立刻回答」的結構。",
      effect: "引起讀者的注意和思考，順勢帶出下文要強調的重點，使論述更有條理。",
      confusableWith: ["反問"],
      examples: ["什麼是快樂？快樂就是能夠與家人在一起。", "誰是最可愛的人？當然是默默付出的人。"],
    },
    {
      id: "fanfu",
      name: "反覆",
      definition:
        "為了強調某個意思、突出某種感情，有意重複使用相同的詞語或句子。重複的詞語可以緊接着出現（連續反覆），也可以中間隔着其他詞語（間隔反覆）。",
      tip: "留意句子裏有沒有同一個詞語或同一個句子刻意出現兩次或以上，而且是為了強調才重複，並非無意中用了相同的字。只是句子開頭相同、後面內容各不相同，而且有三項或以上的，屬排比，不是反覆。",
      effect: "突出所要強調的詞語或意思，把強烈的感情反覆地抒發出來，使情感更加濃烈。",
      confusableWith: ["排比"],
      examples: ["加油，加油，我們一定能贏！", "一年又一年，一年又一年，爺爺依然守着那間小店。"],
    },
    {
      id: "yinyong",
      name: "引用",
      definition:
        "在寫作時引用名言、詩句或別人說過的話，並說明說話的人或出處，用來證明自己的看法或增添文采。引用時要原封不動地照錄原文，並用引號標示。",
      tip: "留意句子裏有沒有「某人說」、「古人云」或引號中的名言、詩句，並且是原封不動地引用別人的話。沒有說明出處或說話人、單獨出現的名句，不算引用。",
      effect: "借助名人名言、詩句或成語，令論點更有根據、更具權威，同時增添文句的文采和韻味。",
      confusableWith: ["對偶"],
      examples: ["老子說：「知足者富。」", "荀子說：「學不可以已。」"],
    },
    {
      id: "duibi",
      name: "對比",
      definition:
        "把兩種相反或相對的事物，或者同一事物的兩個方面，放在一起互相對照，使事物的特點更加鮮明。",
      tip: "留意句子裏有沒有意思相反或相對的事物並列對照（例如大與小、苦與樂、過去與現在）。重點在內容上的對照；對偶則講求字數相等、結構相同。",
      effect: "把相反的事物並列對照，使雙方的差別更加鮮明，令讀者一目了然，並突出所要強調的一方。",
      confusableWith: ["對偶"],
      examples: ["弟弟活潑好動，姐姐卻文靜內向。", "城市白天熙來攘往，夜晚卻異常冷清。"],
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
    { id: "kuazhang-3", sentence: "他的音量大到隔壁那條街都聽得到。", device: "誇張", level: "s1" },

    { id: "duiou-1", sentence: "海闊憑魚躍，天空任鳥飛。", device: "對偶", level: "p6" },
    { id: "duiou-2", sentence: "書山有路勤為徑，學海無涯苦作舟。", device: "對偶", level: "s1", alsoDevices: ["比喻"] },
    { id: "duiou-3", sentence: "橫眉冷對千夫指，俯首甘為孺子牛。", device: "對偶", level: "s1", alsoDevices: ["對比", "比喻"] },

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
    { id: "niren-6", sentence: "微風輕撫過臉頰，彷彿在跟我打招呼。", device: "擬人", level: "p5", alsoDevices: ["比喻"] },

    { id: "kuazhang-4", sentence: "他嚇得整個人跳起三尺高。", device: "誇張", level: "p5" },
    { id: "kuazhang-5", sentence: "那間餐廳的排隊人龍，長得幾乎望不到盡頭。", device: "誇張", level: "p6" },
    { id: "kuazhang-6", sentence: "這件事令他傷心欲絕，眼淚幾乎流成一條小河。", device: "誇張", level: "s1", alsoDevices: ["比喻"] },

    { id: "duiou-4", sentence: "業精於勤，荒於嬉；行成於思，毀於隨。", device: "對偶", level: "s1", alsoDevices: ["對比"] },
    { id: "duiou-5", sentence: "海納百川，有容乃大；壁立千仞，無欲則剛。", device: "對偶", level: "s1" },
    { id: "duiou-6", sentence: "讀萬卷書，行萬里路。", device: "對偶", level: "p6" },

    { id: "paibi-4", sentence: "青春是一首歌，是一幅畫，更是一場永不重來的旅程。", device: "排比", level: "s1", alsoDevices: ["比喻"] },
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
    { id: "niren-9", sentence: "海浪一次又一次撲向岸邊，好像捨不得離開似的。", device: "擬人", level: "p6", alsoDevices: ["比喻"] },

    { id: "kuazhang-7", sentence: "這個消息一傳開，全城的人幾乎都知道了。", device: "誇張", level: "p6" },
    { id: "kuazhang-8", sentence: "他讀書讀到廢寢忘餐，幾乎把整個圖書館都搬回家。", device: "誇張", level: "s1" },
    { id: "kuazhang-9", sentence: "只是遲到五分鐘，媽媽卻好像等了一輩子那麼久。", device: "誇張", level: "p5", alsoDevices: ["比喻"] },

    { id: "duiou-7", sentence: "近水樓台先得月，向陽花木易為春。", device: "對偶", level: "s1" },
    { id: "duiou-8", sentence: "寧靜致遠，淡泊明志。", device: "對偶", level: "s1" },
    { id: "duiou-9", sentence: "台上一分鐘，台下十年功。", device: "對偶", level: "p6", alsoDevices: ["對比"] },

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
    { id: "biyu-14", sentence: "人生就像一場馬拉松，比的不是誰跑得最快，而是誰堅持得最久。", device: "比喻", level: "s1", alsoDevices: ["對比"] },
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
    { id: "kuazhang-13", sentence: "一天沒見到你，就好像過了三年那麼長。", device: "誇張", level: "p6", alsoDevices: ["比喻"] },
    { id: "kuazhang-14", sentence: "他的笑聲震得整幢大樓都在搖晃。", device: "誇張", level: "s1" },
    { id: "kuazhang-15", sentence: "作業堆得比山還高，我一輩子也做不完。", device: "誇張", level: "s1" },

    { id: "duiou-10", sentence: "白日依山盡，黃河入海流。", device: "對偶", level: "p5" },
    { id: "duiou-11", sentence: "兩個黃鸝鳴翠柳，一行白鷺上青天。", device: "對偶", level: "p6" },
    { id: "duiou-12", sentence: "勿以善小而不為，勿以惡小而為之。", device: "對偶", level: "p6", alsoDevices: ["對比"] },
    { id: "duiou-13", sentence: "大漠孤煙直，長河落日圓。", device: "對偶", level: "s1" },
    { id: "duiou-14", sentence: "海內存知己，天涯若比鄰。", device: "對偶", level: "s1", alsoDevices: ["比喻"] },
    { id: "duiou-15", sentence: "山不在高，有仙則名；水不在深，有龍則靈。", device: "對偶", level: "s1" },

    { id: "paibi-10", sentence: "春天的花是紅的，夏天的樹是綠的，秋天的果是黃的。", device: "排比", level: "p5" },
    { id: "paibi-11", sentence: "有的同學在打籃球，有的同學在跳繩，有的同學在追逐嬉戲。", device: "排比", level: "p5" },
    { id: "paibi-12", sentence: "讀書使人明智，讀書使人充實，讀書使人快樂。", device: "排比", level: "p6" },
    { id: "paibi-13", sentence: "我們要學會感恩：感恩父母的養育，感恩老師的教導，感恩朋友的陪伴。", device: "排比", level: "p6" },
    { id: "paibi-14", sentence: "人生需要勇氣去面對，需要智慧去選擇，需要毅力去堅持。", device: "排比", level: "s1" },
    { id: "paibi-15", sentence: "他用勤勞耕耘土地，用汗水澆灌希望，用雙手創造未來。", device: "排比", level: "s1", alsoDevices: ["比喻"] },

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

    // ---- 階段 7 A 批：原有七種各補 5 句（共 20 句），新增 反覆／引用／對比 各 20 句。
    // 每句只含一種修辭；引用句均為「名言／詩句／成語」的直接引用（有「某某說」或「在…中寫道」等說明）；
    // 對比句講內容相反、不講字數工整（以免與對偶重疊）。 ----
    { id: "biyu-16", sentence: "晨霧像一層薄薄的輕紗，輕輕籠罩着整個山谷。", device: "比喻", level: "p5" },
    { id: "biyu-17", sentence: "讀書是一艘小船，載着我們駛向遙遠的知識海洋。", device: "比喻", level: "p6" },
    { id: "biyu-18", sentence: "公路上的車龍像一條長長的鐵鏈，緩緩地向前移動。", device: "比喻", level: "p6" },
    { id: "biyu-19", sentence: "回憶是一張發黃的舊照片，輪廓依稀可辨，色彩卻早已褪去。", device: "比喻", level: "s1" },
    { id: "biyu-20", sentence: "競爭激烈的社會好比一場永不停息的接力賽，誰也不能停下腳步。", device: "比喻", level: "s1" },

    { id: "niren-16", sentence: "小貓在陽光下伸了個懶腰，笑瞇瞇地向我道了一聲早安。", device: "擬人", level: "p5" },
    { id: "niren-17", sentence: "舊書店的書架上，一本本泛黃的書靜靜地等待着有緣人。", device: "擬人", level: "s1" },
    { id: "niren-18", sentence: "城市從沉睡中慢慢甦醒，早班的巴士揉着惺忪的睡眼駛出總站。", device: "擬人", level: "s1" },
    { id: "niren-19", sentence: "月光溫柔地撫摸着窗台上的茉莉，茉莉羞澀地低下了頭。", device: "擬人", level: "s1" },
    { id: "niren-20", sentence: "冬天躡手躡腳地走近，把寒意悄悄放進每個人的衣領裏。", device: "擬人", level: "s1" },

    { id: "kuazhang-16", sentence: "這隻小狗跑得比風還快，一眨眼就不見了。", device: "誇張", level: "p5" },
    { id: "kuazhang-17", sentence: "這間房間小得連轉身的空間都沒有，我只好側着身子走路。", device: "誇張", level: "p6" },
    { id: "kuazhang-18", sentence: "他一出場，全場觀眾的歡呼聲幾乎掀翻了屋頂。", device: "誇張", level: "p6" },
    { id: "kuazhang-19", sentence: "他為這個夢想付出的汗水，大概可以注滿整個維多利亞港。", device: "誇張", level: "s1" },
    { id: "kuazhang-20", sentence: "他固執起來，就算十頭牛也拉不回來。", device: "誇張", level: "s1" },

    { id: "duiou-16", sentence: "千山鳥飛絕，萬徑人蹤滅。", device: "對偶", level: "p5" },
    { id: "duiou-17", sentence: "明月松間照，清泉石上流。", device: "對偶", level: "p5" },
    { id: "duiou-18", sentence: "青山橫北郭，白水繞東城。", device: "對偶", level: "p5" },
    { id: "duiou-19", sentence: "綠樹村邊合，青山郭外斜。", device: "對偶", level: "p6" },
    { id: "duiou-20", sentence: "落霞與孤鶩齊飛，秋水共長天一色。", device: "對偶", level: "p6" },

    { id: "paibi-16", sentence: "媽媽為我縫補衣服，為我準備早餐，為我整理書包。", device: "排比", level: "p5" },
    { id: "paibi-17", sentence: "小鳥在樹上歌唱，蝴蝶在花叢中飛舞，蜜蜂在花蕊間忙碌。", device: "排比", level: "p5" },
    { id: "paibi-18", sentence: "這座城市有古老的廟宇，有現代的高樓，有熱鬧的街市，也有寧靜的公園。", device: "排比", level: "p6" },
    { id: "paibi-19", sentence: "他的故事教會我們堅強，教會我們感恩，教會我們珍惜眼前的一切。", device: "排比", level: "p6" },
    { id: "paibi-20", sentence: "真正的學習，是主動去探索，是用心去思考，是勇敢地去質疑。", device: "排比", level: "s1" },

    { id: "fanwen-16", sentence: "垃圾桶就在旁邊，你怎麼可以隨手亂扔呢？", device: "反問", level: "p5" },
    { id: "fanwen-17", sentence: "這麼可愛的小動物，誰會忍心傷害牠們呢？", device: "反問", level: "p5" },
    { id: "fanwen-18", sentence: "大家都在認真聽講，你怎麼好意思吵鬧呢？", device: "反問", level: "p5" },
    { id: "fanwen-19", sentence: "難道你想一輩子都依賴別人嗎？", device: "反問", level: "p5" },
    { id: "fanwen-20", sentence: "春天的花園這麼美，誰不想去看看呢？", device: "反問", level: "p5" },

    { id: "shewen-16", sentence: "小草為什麼這樣堅強？因為它的根深深地扎在泥土裏。", device: "設問", level: "p5" },
    { id: "shewen-17", sentence: "夏天什麼最解渴？一杯冰涼的檸檬茶最解渴。", device: "設問", level: "p5" },
    { id: "shewen-18", sentence: "我們為什麼要早睡？因為充足的睡眠能讓身體恢復精神。", device: "設問", level: "p5" },
    { id: "shewen-19", sentence: "學校裏誰最辛苦？是每天為我們準備午餐的工作人員。", device: "設問", level: "p5" },
    { id: "shewen-20", sentence: "怎樣才能做到誠實？就是說話算數，做錯了勇於承認。", device: "設問", level: "p6" },

    { id: "fanfu-1", sentence: "加油，加油，大家再堅持一下就到終點了！", device: "反覆", level: "p5" },
    { id: "fanfu-2", sentence: "下雨了，下雨了，快把窗戶關上！", device: "反覆", level: "p5" },
    { id: "fanfu-3", sentence: "媽媽，媽媽，你快來看，彩虹出現了！", device: "反覆", level: "p5" },
    { id: "fanfu-4", sentence: "謝謝你，謝謝你在我生病的時候來探望我。", device: "反覆", level: "p5" },
    { id: "fanfu-5", sentence: "走啊走，走啊走，天都黑了，還沒有走到山腳下。", device: "反覆", level: "p5" },
    { id: "fanfu-6", sentence: "快看，快看，天上飛來一隻大風箏！", device: "反覆", level: "p5" },
    { id: "fanfu-7", sentence: "他看着我，看着我，眼眶漸漸紅了。", device: "反覆", level: "p6" },
    { id: "fanfu-8", sentence: "回家，回家，這是遊子心中最強烈的願望。", device: "反覆", level: "p6" },
    { id: "fanfu-9", sentence: "靜一靜，靜一靜，讓我們先聽聽他怎麼說。", device: "反覆", level: "p6" },
    { id: "fanfu-10", sentence: "別忘了，別忘了那個約定，我們說好要一起考上同一所中學。", device: "反覆", level: "p6" },
    { id: "fanfu-11", sentence: "團結，團結，再團結，這是我們取勝的關鍵。", device: "反覆", level: "p6" },
    { id: "fanfu-12", sentence: "我要去，我一定要去，不管路有多遠。", device: "反覆", level: "p6" },
    { id: "fanfu-13", sentence: "忘不了，忘不了，那個冬天老師為我披上的外套。", device: "反覆", level: "p6" },
    { id: "fanfu-14", sentence: "歲月靜好，歲月靜好，願我們都能在平淡中尋得安穩。", device: "反覆", level: "s1" },
    { id: "fanfu-15", sentence: "沒有人知道，真的沒有人知道，他在深夜裏默默付出了多少。", device: "反覆", level: "s1" },
    { id: "fanfu-16", sentence: "再見，再見，他終究沒有勇氣說出口。", device: "反覆", level: "s1" },
    { id: "fanfu-17", sentence: "他不斷地說服自己，不斷地說服自己：這一次一定可以。", device: "反覆", level: "s1" },
    { id: "fanfu-18", sentence: "回不去了，回不去了，那些無憂無慮的童年時光。", device: "反覆", level: "s1" },
    { id: "fanfu-19", sentence: "我們要記住，永遠記住，是誰在困難的日子裏向我們伸出了援手。", device: "反覆", level: "s1" },
    { id: "fanfu-20", sentence: "放下吧，放下吧，執着於過去只會讓自己更疲憊。", device: "反覆", level: "s1" },

    { id: "yinyong-1", sentence: "孔子說：「三人行，必有我師焉。」我們應該虛心向身邊每一個人學習。", device: "引用", level: "p5" },
    { id: "yinyong-2", sentence: "老子說：「千里之行，始於足下。」做任何事都要從第一步開始。", device: "引用", level: "p5" },
    { id: "yinyong-3", sentence: "古語說：「有志者事竟成。」只要有決心，我們一定可以達成目標。", device: "引用", level: "p5" },
    { id: "yinyong-4", sentence: "孔子說：「己所不欲，勿施於人。」自己不喜歡的事，也不要強加給別人。", device: "引用", level: "p5" },
    { id: "yinyong-5", sentence: "孔子說：「欲速則不達。」做事太心急，反而得不到好結果。", device: "引用", level: "p5" },
    { id: "yinyong-6", sentence: "孔子說：「有教無類。」意思是每一個人都有接受教育的權利。", device: "引用", level: "p5" },
    { id: "yinyong-7", sentence: "孔子說：「溫故而知新，可以為師矣。」溫習舊知識，就會有新的體會。", device: "引用", level: "p6" },
    { id: "yinyong-8", sentence: "孔子說：「過猶不及。」凡事做得過分，與做得不足同樣不好。", device: "引用", level: "p6" },
    { id: "yinyong-9", sentence: "孟子說：「盡信書，則不如無書。」讀書時也要有自己的思考。", device: "引用", level: "p6" },
    { id: "yinyong-10", sentence: "李白在詩中寫道：「天生我材必有用。」這句話鼓勵我們要相信自己。", device: "引用", level: "p6" },
    { id: "yinyong-11", sentence: "李白在《行路難》中寫道：「長風破浪會有時。」我們要相信總有一天能實現理想。", device: "引用", level: "p6" },
    { id: "yinyong-12", sentence: "蘇軾在詞中寫道：「但願人長久，千里共嬋娟。」表達了對遠方親人的思念與祝福。", device: "引用", level: "p6" },
    { id: "yinyong-13", sentence: "陶淵明在詩中提醒我們：「歲月不待人。」要把握時間努力上進。", device: "引用", level: "p6" },
    { id: "yinyong-14", sentence: "《周易》說：「天行健，君子以自強不息。」這句話一直激勵着後人奮發向上。", device: "引用", level: "s1" },
    { id: "yinyong-15", sentence: "荀子在《勸學》中說：「君子博學而日參省乎己，則知明而行無過矣。」", device: "引用", level: "s1" },
    { id: "yinyong-16", sentence: "荀子在《勸學》中寫道：「積土成山，風雨興焉。」可見成就來自點滴的積累。", device: "引用", level: "s1" },
    { id: "yinyong-17", sentence: "屈原在《離騷》中寫道：「路漫漫其修遠兮，吾將上下而求索。」", device: "引用", level: "s1" },
    { id: "yinyong-18", sentence: "孔子說：「士不可以不弘毅，任重而道遠。」讀書人必須胸懷寬廣、意志堅定。", device: "引用", level: "s1" },
    { id: "yinyong-19", sentence: "蘇軾在《晁錯論》中說：「古之立大事者，不惟有超世之才，亦必有堅忍不拔之志。」", device: "引用", level: "s1" },
    { id: "yinyong-20", sentence: "孟子說：「天將降大任於是人也，必先苦其心志。」困難正是磨練意志的機會。", device: "引用", level: "s1" },

    { id: "duibi-1", sentence: "哥哥性格活潑，妹妹卻文靜內向。", device: "對比", level: "p5" },
    { id: "duibi-2", sentence: "白天的街道人來人往，到了深夜卻空無一人。", device: "對比", level: "p5" },
    { id: "duibi-3", sentence: "這隻小狗平時很兇，見到主人時卻變得十分溫馴。", device: "對比", level: "p5" },
    { id: "duibi-4", sentence: "雖然只相差一歲，姐姐已經很獨立，弟弟卻事事依賴媽媽。", device: "對比", level: "p5" },
    { id: "duibi-5", sentence: "他個子雖然矮小，志氣卻比誰都高。", device: "對比", level: "p5" },
    { id: "duibi-6", sentence: "教室裏，上課時鴉雀無聲，下課後卻熱鬧非凡。", device: "對比", level: "p5" },
    { id: "duibi-7", sentence: "他在台上滔滔不絕，走到台下卻變得沉默寡言。", device: "對比", level: "p6" },
    { id: "duibi-8", sentence: "新建的商場燈火輝煌，旁邊的舊樓房卻漆黑一片。", device: "對比", level: "p6" },
    { id: "duibi-9", sentence: "他表面上若無其事，內心卻十分緊張。", device: "對比", level: "p6" },
    { id: "duibi-10", sentence: "過去這條河清澈見底，如今卻佈滿了垃圾。", device: "對比", level: "p6" },
    { id: "duibi-11", sentence: "考試前，他終日貪玩；成績公布後，卻後悔莫及。", device: "對比", level: "p6" },
    { id: "duibi-12", sentence: "大家只看到他今日的成就，卻沒有留意他當年付出的汗水。", device: "對比", level: "p6" },
    { id: "duibi-13", sentence: "弟弟喜歡熱鬧，我卻喜歡一個人安靜地看書。", device: "對比", level: "p6" },
    { id: "duibi-14", sentence: "富人的宴席上，珍饈美饌被隨意倒掉；街角的流浪漢，卻連一頓飽飯也吃不上。", device: "對比", level: "s1" },
    { id: "duibi-15", sentence: "小時候，我總盼望快點長大；長大以後，卻懷念起無憂無慮的童年。", device: "對比", level: "s1" },
    { id: "duibi-16", sentence: "有些人腰纏萬貫，心靈卻十分貧乏。", device: "對比", level: "s1" },
    { id: "duibi-17", sentence: "科技讓世界各地的人聯繫得更緊密，可是面對面坐着的人，反而愈來愈疏遠。", device: "對比", level: "s1" },
    { id: "duibi-18", sentence: "他在順境中志得意滿，一遇到挫折就一蹶不振。", device: "對比", level: "s1" },
    { id: "duibi-19", sentence: "口頭上高談闊論的人很多，真正肯付諸行動的人卻寥寥無幾。", device: "對比", level: "s1" },
    { id: "duibi-20", sentence: "大家都羨慕他光鮮的外表，卻沒有人了解他背後的孤獨。", device: "對比", level: "s1" },
  ];

  const RHETORIC_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  // 階段 9a. Pairs of devices whose `effect` texts are too close for a student to tell apart (they share the "加強語氣 /
  // 突出強調 / 引起思考 / 生動形象" kind of wording). The quiz never puts two devices of a pair into the same
  // 「作用」 question (as options of the 作用對應手法 question, or as an option next to the correct effect). The effect
  // texts themselves are NOT changed here — that is a separate decision. strong = very hard to tell apart, moderate = partly.
  const EFFECT_CLASHES = [
    ["比喻", "擬人"], // strong
    ["排比", "反問"], // strong (both open with 「加強…語氣」)
    ["排比", "誇張"], // strong
    ["誇張", "反問"], // strong
    ["誇張", "反覆"], // strong
    ["排比", "反覆"], // strong
    ["反問", "設問"], // strong (both about 引起 / 引發思考)
    ["反問", "反覆"], // moderate
    ["擬人", "誇張"], // moderate (both end in 感染力)
    ["誇張", "對比"], // moderate (both 突出)
  ];

  window.App.Content.RHETORIC_DEVICES = DEVICES;
  window.App.Content.RHETORIC_PRACTICE_SENTENCES = PRACTICE_SENTENCES;
  window.App.Content.RHETORIC_LEVEL_LABEL = RHETORIC_LEVEL_LABEL;
  window.App.Content.RHETORIC_EFFECT_CLASHES = EFFECT_CLASHES;
})();
