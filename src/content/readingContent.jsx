// Curated short reading-comprehension passages, each with a fixed set of
// hand-authored questions (same "fixed per-item questions" shape as
// historyContent.jsx — rendered via the shared FixedQuizFlow).
//
// Questions are tagged `type: "recall"|"inference"` — "recall" tests literal
// understanding of the passage, "inference" tests the "why"/reasoning kind
// of understanding a free-text short-answer question would normally probe.
// This app intentionally implements that as multiple-choice rather than a
// typed short answer: modules 1/2/5/7/8/9 are selection-based-input modules
// per the design brief (the child can't type Chinese fluently yet), so
// "short answer" here means an inference-flavoured question, not free text.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const READING_ITEMS = [
    {
      id: "xiaoxi-de-fenxiang",
      title: "小息的分享",
      level: "p5",
      passage:
        "今天小明忘記帶午飯，坐在座位上肚子餓得咕嚕作響。同班的小芳見到後，主動走過去，把自己的三文治分了一半給他。小明起初有點不好意思，不肯接受，但小芳笑着說：「大家是好朋友，有東西一起分享才開心啊！」小明感激地接過三文治，心裏暗暗決定，以後也要學習小芳樂於助人的精神。",
      questions: [
        { type: "recall", prompt: "小芳把什麼分給了小明？", options: ["三文治", "麵包", "生果", "水樽"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "小明起初有什麼反應？",
          options: ["立即開心接受", "有點不好意思，不肯接受", "發脾氣", "走開"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "小明從一開始不肯接受，到最後感激地接受，反映他有什麼心態轉變？",
          options: ["明白到朋友之間分享是快樂的事，因而放下顧忌", "覺得小芳的三文治更好吃", "只是不好意思拒絕小芳", "心裏其實仍然不情願"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "小芳把三文治分給小明時，是什麼態度？",
          options: ["笑着分享，態度友善", "勉強地分給他", "生氣地", "一言不發"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "從小芳的說話可以見到她是個怎樣的人？",
          options: ["樂於助人、重視友誼", "小氣自私", "驕傲自大", "怕事懦弱"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "gongyuan-de-xiaofaxian",
      title: "公園裏的小發現",
      level: "p5",
      passage:
        "星期日早上，哥哥帶妹妹到公園散步。妹妹在草地上發現一隻受傷的小鳥，牠的翅膀好像折斷了，不能飛起來。妹妹十分擔心，想立即帶小鳥回家照顧。哥哥提醒她，野生小鳥未必適合由人類飼養，於是他們決定聯絡附近的動物護理中心，請專業人士協助處理。工作人員很快便趕到，小心地把小鳥帶走治療。妹妹雖然依依不捨，但知道小鳥能夠得到適當的照顧，心裏也感到安慰。",
      questions: [
        {
          type: "recall",
          prompt: "妹妹在公園見到什麼？",
          options: ["一隻受傷的小鳥", "一隻迷路的小狗", "一個錢包", "一部相機"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "哥哥為什麼沒有立即帶小鳥回家？",
          options: ["他不喜歡動物", "他害怕小鳥襲擊他", "他知道野生小鳥未必適合由人飼養", "他趕着回家"],
          correctIndex: 2,
        },
        {
          type: "inference",
          prompt: "如果妹妹真的把受傷的小鳥帶回家照顧，最可能出現什麼問題？",
          options: ["未必懂得正確方法照顧，可能令小鳥情況更差", "小鳥會立即完全康復", "小鳥會變成家庭寵物快樂成長", "對小鳥完全沒有影響"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "哥哥和妹妹最後聯絡了什麼機構幫忙？",
          options: ["動物護理中心", "警察局", "醫院", "消防局"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "妹妹「依依不捨」反映她對小鳥有什麼感情？",
          options: ["關心和不捨", "討厭", "害怕", "毫不在意"],
          correctIndex: 0,
        },
      ],
    },

    // ---- p5-level additions (user feedback: level split was unbalanced —
    // only 2 p5 passages vs 6 p6 / 8 s1). These skew informational/science/
    // local-culture rather than moral-story fiction, per user feedback
    // asking for topic variety beyond 助人/誠實/堅持/換位思考. Every fact
    // here is either common-knowledge primary-school science or was
    // verified via web search before writing (see 香港的叮叮車 below). ----
    {
      id: "caihong-de-mimi",
      title: "彩虹的秘密",
      level: "p5",
      passage:
        "下雨過後，天空有時會出現一條七彩的彩虹，由紅、橙、黃、綠、藍、靛、紫七種顏色組成。原來彩虹是陽光穿過空氣中細小的雨點時，光線被折射和反射，分散成不同顏色，才形成這條美麗的彩虹。由於彩虹的出現需要同時有陽光和雨點，所以人們通常在雨後初晴的時候，才有機會看到它。",
      questions: [
        { type: "recall", prompt: "彩虹由多少種顏色組成？", options: ["七種", "五種", "三種", "九種"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "彩虹是怎樣形成的？",
          options: ["陽光穿過雨點時被折射和反射，分散成不同顏色", "陽光直接照射天空", "雨點本身有顏色", "雲層反射陽光"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "彩虹通常在什麼時候出現？",
          options: ["雨後初晴，同時有陽光和雨點", "只在晚上出現", "只在冬天出現", "只在打雷時出現"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "彩虹的七種顏色，排在最前和最後的分別是什麼顏色？",
          options: ["紅色和紫色", "藍色和黃色", "綠色和橙色", "靛色和紅色"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "為什麼下雨後未必一定看到彩虹？",
          options: ["因為還需要同時有陽光和雨點兩個條件", "因為彩虹只在冬天出現", "因為彩虹十分罕見", "因為需要等待很長時間"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "mao-de-shuimian",
      title: "貓咪為什麼經常在睡覺",
      level: "p5",
      passage:
        "小美家中飼養了一隻名叫「豆豆」的貓，牠幾乎大半天的時間都在睡覺，只有在吃飯或者玩耍時才會清醒。小美好奇地上網查資料，才知道原來貓是天生的獵食動物，牠們需要儲存大量體力，才能夠在捕獵獵物時迅速衝刺。此外，年幼的小貓需要更多睡眠，才能夠健康成長。所以貓咪長時間睡覺，其實是牠們與生俱來的習性，並不代表牠們生病或者不開心。",
      questions: [
        { type: "recall", prompt: "小美養的貓叫什麼名字？", options: ["豆豆", "妹妹", "花花", "咪咪"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "貓咪需要大量睡眠的原因之一是什麼？",
          options: ["儲存體力，方便捕獵時迅速衝刺", "貓咪天生怕光", "貓咪不喜歡運動", "貓咪的心跳很慢"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "哪個階段的貓需要更多睡眠？",
          options: ["年幼的小貓", "老年的貓", "肥胖的貓", "生病的貓"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "小美是怎樣知道貓咪睡這麼多覺的原因的？",
          options: ["上網查資料", "問獸醫", "看書", "問朋友"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "如果見到貓咪經常睡覺，可以推斷什麼？",
          options: ["這是貓咪與生俱來的習性，未必代表牠生病", "貓咪一定生病了", "貓咪一定不開心", "貓咪已經失去活力"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "xingxing-wei-shenme-wanshang-cai-chuxian",
      title: "星星為什麼只在晚上出現",
      level: "p5",
      passage:
        "小杰白天望向天空，只見到太陽和白雲，卻看不到一顆星星，他好奇地問媽媽，星星是不是只在晚上才出現。媽媽解釋，其實星星白天也一直存在，只是太陽的光線實在太猛烈，把微弱的星光完全蓋過，所以人們白天看不見星星。到了晚上，太陽下山後，天空變得漆黑，星星微弱的光線才能夠被人們看見。媽媽又說，遠離城市燈光的地方，晚上能看到的星星會更多更清楚。",
      questions: [
        { type: "recall", prompt: "小杰白天在天空看到什麼？", options: ["太陽和白雲", "星星和月亮", "彩虹", "什麼都看不到"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "媽媽說星星在白天是否不存在？",
          options: ["星星白天也一直存在，只是被陽光蓋過", "星星白天真的消失了", "星星白天飛到別的地方", "星星只在冬天出現"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "為什麼星星要等到晚上才看得見？",
          options: ["太陽下山後天空變黑，微弱星光才能被看見", "星星晚上才會發光", "星星白天飛得很遠", "星星害怕太陽"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "在什麼地方能看到更多更清楚的星星？",
          options: ["遠離城市燈光的地方", "市中心", "商場附近", "學校操場"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "根據這個故事，可以推斷城市燈光對觀星有什麼影響？",
          options: ["城市燈光會令星光更難被看見", "城市燈光可以令星星變得更多", "城市燈光和觀星完全無關", "城市燈光可以令星星更加閃爍"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "xianggang-dingding-che",
      title: "香港的叮叮車",
      level: "p5",
      passage:
        "香港電車在一九零四年正式開始行駛，是全世界歷史最悠久的電車系統之一，至今已經超過一百年歷史。電車每次到站前都會發出「叮叮」的響聲提醒乘客，所以香港人都親切地稱它為「叮叮車」。電車最初只是單層設計，後來才改建成雙層，方便載更多乘客。電車路線只行走於香港島，由堅尼地城一直到筲箕灣，是香港島居民日常代步的重要交通工具，也承載着不少香港人的集體回憶。",
      questions: [
        { type: "recall", prompt: "香港電車在哪一年開始行駛？", options: ["一九零四年", "一九一零年", "一九五零年", "二零零零年"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "香港人為什麼稱電車做「叮叮車」？",
          options: ["因為到站前會發出「叮叮」聲響", "因為車身是紅色", "因為速度很快", "因為只在香港島行駛"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "電車最初的設計是怎樣的？",
          options: ["單層設計", "雙層設計", "三層設計", "沒有車頂"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "電車路線行走於哪個地區？",
          options: ["香港島", "九龍", "新界", "離島"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "為什麼說電車「承載着不少香港人的集體回憶」？",
          options: ["因為電車有過百年歷史，一直陪伴香港人生活", "因為電車票價全香港最貴", "因為電車速度全香港最快", "因為電車只在節日才出現"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "mifeng-de-gongzuo",
      title: "蜜蜂的重要工作",
      level: "p5",
      passage:
        "蜜蜂每天飛到不同的花朵上，採集花蜜和花粉，用來釀造蜂蜜和餵養幼蜂。當蜜蜂在花朵之間穿梭時，牠們身上沾滿的花粉，會不知不覺地由一朵花傳到另一朵花，這個過程叫做「傳播花粉」。植物需要依靠傳播花粉，才能夠結出果實和種子，繁殖下一代。如果沒有蜜蜂幫忙傳播花粉，很多農作物的收成都會大大減少，所以蜜蜂對大自然和農業都非常重要。",
      questions: [
        {
          type: "recall",
          prompt: "蜜蜂採集花蜜和花粉用來做什麼？",
          options: ["釀造蜂蜜和餵養幼蜂", "建造蜂巢", "逃避天敵", "儲存水分"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "什麼是「傳播花粉」？",
          options: ["花粉由一朵花傳到另一朵花的過程", "蜜蜂互相傳遞訊息", "花朵自己散開花粉", "蜜蜂教其他蜜蜂採蜜"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "植物為什麼需要傳播花粉？",
          options: ["才能夠結出果實和種子，繁殖下一代", "才能夠長得更高", "才能夠改變顏色", "才能夠抵抗害蟲"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "如果沒有蜜蜂幫忙傳播花粉，會發生什麼事？",
          options: ["很多農作物的收成會大大減少", "花朵會變得更加鮮豔", "植物會長得更快", "對農業完全沒有影響"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "這篇文章想帶出蜜蜂對大自然有什麼重要性？",
          options: ["蜜蜂透過傳播花粉，對植物繁殖和農業都非常重要", "蜜蜂只對釀蜜有用", "蜜蜂對大自然沒有實際貢獻", "蜜蜂只在夏天才有用"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "wei-shenme-hui-daga",
      title: "為什麼會打嗝",
      level: "p5",
      passage:
        "小美吃飯吃得太急，突然「呃」一聲打起嗝來，接連打了好幾下，令她十分尷尬。爸爸告訴她，打嗝是因為橫膈膜這塊肌肉突然不受控制地抽動，令空氣被急速吸入喉嚨，發出「呃」的聲音。吃得太快、喝汽水，或者天氣忽然轉冷，都有可能引起打嗝。爸爸教小美慢慢地喝一小杯溫水，過了一會，打嗝終於停了下來。爸爸提醒她，打嗝雖然惱人，但通常很快會自行停止，不用太過擔心。",
      questions: [
        { type: "recall", prompt: "小美為什麼會打嗝？", options: ["吃飯吃得太急", "感冒了", "喝了很多水", "大聲說話"], correctIndex: 0 },
        {
          type: "recall",
          prompt: "打嗝是因為身體哪個部分郁動而引起？",
          options: ["橫膈膜突然不受控制地抽動", "心臟跳動太快", "肺部發炎", "喉嚨腫脹"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "除了吃得太急，還有什麼會引起打嗝？",
          options: ["喝汽水或天氣忽然轉冷", "睡得太多", "走得太快", "曬得太久"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "爸爸教小美用什麼方法止嗝？",
          options: ["慢慢喝一小杯溫水", "大力咳嗽", "用力拍背", "深呼吸十次"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "爸爸最後的提醒想帶出什麼訊息？",
          options: ["打嗝雖然惱人，但通常會自行停止，不用太擔心", "打嗝是嚴重的疾病", "打嗝一定要看醫生", "打嗝會一直持續不會停止"],
          correctIndex: 0,
        },
      ],
    },

    {
      id: "yi-chang-chilai-de-daoqian",
      title: "一場遲來的道歉",
      level: "p6",
      passage:
        "上星期，小華不小心弄污了同學小玲的美術作品，卻因為害怕被責罰，一直沒有向小玲道歉，反而假裝什麼事情也沒有發生過。小玲雖然十分傷心，但沒有向老師投訴，只是默默地重新畫過。直到有一天，小華看見小玲重新繪畫的過程十分認真，心裏十分慚愧，終於鼓起勇氣向小玲道歉，並且主動提出幫忙修補之前弄污的作品。小玲原諒了小華，兩人的友誼比之前更加要好。",
      questions: [
        {
          type: "recall",
          prompt: "小華做了什麼事？",
          options: ["弄污了小玲的美術作品", "偷了小玲的文具", "說了小玲的壞話", "推跌了小玲"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "小玲在事發後有什麼反應？",
          options: ["立即向老師投訴", "默默重新畫過，沒有投訴", "與小華絕交", "大哭大鬧"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "小華為什麼最後決定道歉？",
          options: ["被老師發現了", "見到小玲認真重畫，心裏慚愧", "小玲主動要求他道歉", "怕被家長責罵"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "小玲在事件中重新做了什麼？",
          options: ["重新繪畫美術作品", "向老師投訴", "找家長理論", "找小華對質"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "小玲沒有立即向老師投訴，反映她是個怎樣的人？",
          options: ["寬容、不計較", "懦弱怕事", "冷漠", "記仇"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "jianchi-lianxi-de-yiyi",
      title: "堅持練習的意義",
      level: "p6",
      passage:
        "子健自小學習拉小提琴，起初進度緩慢，經常拉錯音，甚至萌生放棄的念頭。媽媽鼓勵他，只要願意堅持每天練習，總有一天會有進步。子健聽從媽媽的話，即使遇到困難也沒有放棄，每天堅持練習半小時。半年後，子健在學校的音樂表演中，順利演奏了一首完整的樂曲，台下觀眾都報以熱烈的掌聲。子健這才明白，只要願意堅持不懈，任何困難都能夠克服。",
      questions: [
        { type: "recall", prompt: "子健學習什麼樂器？", options: ["鋼琴", "小提琴", "古箏", "笛子"], correctIndex: 1 },
        {
          type: "recall",
          prompt: "子健起初遇到什麼困難？",
          options: ["沒有錢買樂器", "經常拉錯音，一度想放棄", "被人取笑", "沒有時間練習"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "從子健「即使遇到困難也沒有放棄」，可以看出他是一個怎樣的人？",
          options: ["有毅力、肯堅持的人", "三分鐘熱度的人", "凡事依賴別人的人", "容易自滿的人"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "子健每天堅持練習多久？",
          options: ["半小時", "一小時", "十分鐘", "兩小時"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "若子健當初真的聽從自己想放棄的念頭，最可能發生什麼？",
          options: ["無法在音樂表演中順利演奏", "反而會學得更快", "媽媽會因此更開心", "對他沒有任何影響"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "yi-ci-shibai-de-shiyan",
      title: "一次失敗的實驗",
      level: "p6",
      passage:
        "美怡在科學課進行植物生長實驗，她滿心期待自己種的豆苗會長得又高又壯，怎料一星期後，豆苗竟然枯萎了。美怡十分灰心，一度想放棄這個實驗。老師鼓勵她不要灰心，反而應該找出失敗的原因。美怡認真檢查後，發現自己澆水過多，令豆苗的根部腐爛。在老師的指導下，美怡重新種植，這次她按時適量澆水，豆苗終於健康地成長，美怡也明白到，失敗背後往往隱藏着寶貴的學習機會。",
      questions: [
        {
          type: "recall",
          prompt: "美怡的豆苗為什麼會枯萎？",
          options: ["沒有澆水", "澆水過多，根部腐爛", "被蟲吃了", "放在沒有陽光的地方"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "老師怎樣鼓勵美怡？",
          options: ["叫她放棄實驗", "叫她不要灰心，找出失敗原因", "幫她重新種一盆", "責備她粗心大意"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "老師沒有立即幫美怡解決問題，而是引導她自己找出原因，這種教學方法有什麼好處？",
          options: ["讓學生學會自己分析問題，培養解難能力", "令學生浪費更多時間", "令學生對老師失去信心", "對學生沒有任何幫助"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "美怡發現豆苗枯萎後，起初有什麼反應？",
          options: ["十分灰心，一度想放棄實驗", "立即重新種植", "責怪老師", "若無其事，不以為意"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "美怡第二次種植成功，最主要因為她做了什麼？",
          options: ["按時適量澆水，改正錯誤", "用了更貴的花盆", "請同學代勞照顧", "換了新品種的豆"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "chengshi-de-jiazhi",
      title: "誠實的價值",
      level: "s1",
      passage:
        "班長小駿負責保管班費，一次點算時發現多了五十元，懷疑是自己計錯數。他沒有把多出來的錢據為己有，反而主動向老師報告，並且仔細核對每一筆收支紀錄，最終發現原來是早前有位同學多繳交了班費，卻忘記登記。小駿把多出的錢退還給那位同學，老師和同學都稱讚小駿誠實可靠，往後大家更放心把班務交託給他。",
      questions: [
        {
          type: "recall",
          prompt: "小駿發現了什麼問題？",
          options: ["班費不見了", "班費多了五十元", "班費被人偷了", "班費計錯了類別"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "小駿發現問題後怎樣做？",
          options: ["據為己有", "主動向老師報告，核對紀錄", "裝作沒有發現", "自己收起等下次再算"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "這件事之後，同學和老師怎樣看小駿？",
          options: ["覺得他麻煩", "稱讚他誠實可靠", "懷疑他虛報數目", "不再信任他"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "那多出的五十元最後是怎樣處理的？",
          options: ["退還給多繳交班費的同學", "充公作班會經費", "捐給慈善機構", "交給校長"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "小駿的做法為他帶來了什麼結果？",
          options: ["同學和老師更加信任他", "被誤會貪污", "被取消班長職務", "與同學產生誤會"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "huanwei-sikao-de-zhongyao",
      title: "換位思考的重要",
      level: "s1",
      passage:
        "兩兄弟因為爭玩具而吵架，弟弟哭着向媽媽投訴，說哥哥搶走了自己的玩具。媽媽沒有立即責備任何一方，反而請兩兄弟輪流說出自己的想法，並且嘗試站在對方的角度思考。哥哥這才明白，原來弟弟一直很珍惜這件玩具；弟弟也明白到，哥哥其實只是想邀請自己一起玩耍，並非有意搶奪。兩兄弟互相道歉後，決定輪流使用玩具，並且約定以後有爭執時，要先冷靜下來，嘗試了解對方的想法。",
      questions: [
        {
          type: "recall",
          prompt: "兩兄弟因為什麼事而吵架？",
          options: ["爭看電視", "爭玩具", "爭零食", "爭做功課"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "媽媽用什麼方法處理這場爭執？",
          options: ["立即責罰兩兄弟", "請他們輪流說出自己的想法，換位思考", "沒收玩具", "叫哥哥讓弟弟"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "兩兄弟最後約定以後爭執時要先冷靜下來，這反映了什麼？",
          options: ["他們願意汲取經驗，學習更成熟地解決紛爭", "他們其實仍未和好", "他們決定以後不再一起玩耍", "他們認為爭執是無法避免的"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "哥哥經過換位思考後，明白到什麼？",
          options: ["弟弟一直很珍惜這件玩具", "弟弟其實不喜歡玩具", "媽媽偏袒弟弟", "玩具已經壞了"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "「換位思考」在這個故事中具體指什麼？",
          options: ["嘗試站在對方角度理解感受", "互相對罵", "各自玩自己的玩具", "由父母代為決定"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "wangluo-shijie-de-xianjing",
      title: "網絡世界的陷阱",
      level: "s1",
      passage:
        "家俊在網上認識了一位自稱同齡的網友，對方經常邀請家俊分享個人資料，甚至提出見面的要求。家俊起初沒有為意，直到家人提醒他，網上身份未必真實，隨便透露個人資料可能帶來危險。家俊細心回想，發現對方的言行的確有可疑之處，於是決定停止與對方聯絡，並且把這件事告訴父母。父母稱讚家俊及時醒覺，並且提醒他日後在網上結交朋友時，一定要提高警覺，保護好自己的個人資料。",
      questions: [
        {
          type: "recall",
          prompt: "網友向家俊提出了什麼要求？",
          options: ["借錢", "分享個人資料和要求見面", "一起玩遊戲", "交換學校功課"],
          correctIndex: 1,
        },
        {
          type: "recall",
          prompt: "家俊為什麼決定停止聯絡這位網友？",
          options: ["網友不想再交談", "發現對方言行可疑", "父母強行禁止", "網友已讀不回"],
          correctIndex: 1,
        },
        {
          type: "inference",
          prompt: "家俊冷靜地停止聯絡網友，並將事情告訴父母，反映他是一個怎樣的人？",
          options: ["懂得警覺並主動求助的人", "過分害怕陌生人的人", "不懂得保護自己的人", "容易受人擺佈的人"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "是誰提醒家俊網上身份未必真實？",
          options: ["家人", "老師", "網友自己", "警察"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "這故事想提醒讀者，網上交友時應該有什麼態度？",
          options: ["保持警覺，不隨便透露個人資料", "完全信任網友", "盡量分享個人資料建立信任", "應該立即約網友見面確認身份"],
          correctIndex: 0,
        },
      ],
    },

    // ---- longer, harder passages (user feedback: "too easy... level up
    // and longer with much more database") ----
    {
      id: "wangshang-qiling",
      title: "一場網上欺凌的反思",
      level: "s1",
      passage:
        "小欣在社交媒體上見到有同學匿名留言，取笑班上一位轉校生的口音和衣着，她忍不住也留了一個「哈哈」的表情符號。怎料第二天，那位轉校生就沒有再上學，聽說她在家裏哭得眼睛紅腫，不敢再回校。小欣心裏十分內疚，她從來沒想過，一個小小的表情符號，也可能對人造成這麼大的傷害。她決定主動聯絡那位轉校生，向她道歉，並且在群組裏帶頭譴責網絡欺凌的行為。",
      questions: [
        {
          type: "recall",
          prompt: "小欣做了什麼事，令她後來感到內疚？",
          options: ["在欺凌留言下留了「哈哈」表情符號", "主動辱罵轉校生", "把轉校生的秘密公開", "搶走轉校生的朋友"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "轉校生受到欺凌後有什麼反應？",
          options: ["不敢再上學，在家中哭泣", "向老師投訴", "在群組反擊", "轉去另一間學校"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "小欣主動聯絡轉校生道歉，這個行動反映她有什麼性格特質？",
          options: ["勇於承認錯誤，並且願意承擔責任", "不在乎轉校生的感受", "只是害怕被老師責罰", "純粹想討好朋友"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "小欣後來做了什麼補救行動？",
          options: ["向轉校生道歉，並帶頭譴責網絡欺凌", "刪除自己的社交媒體帳戶", "只向老師投訴", "轉去另一間學校"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "這故事想帶出「旁觀者」在網絡欺凌中擔當什麼角色？",
          options: ["附和舉動也可能助長欺凌", "旁觀者沒有任何責任", "只有主動辱罵才算欺凌", "表情符號沒有實際影響"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "shequ-fuwu",
      title: "一次社區服務的體會",
      level: "s1",
      passage:
        "學校今年舉辦了一次探訪獨居長者的活動，志明起初覺得這類活動很沉悶，只是抱着交差的心態參加。怎料到了長者的家，他才發現對方已經獨自居住了差不多十年，經常一個人吃飯，沒有什麼親友探望。志明陪伴她聊了整個下午，聽她講述以前的故事，臨走時長者更拉着他的手依依不捨。這次經歷令志明明白到，一些在自己眼中微不足道的陪伴，對其他人來說可能已經是最珍貴的禮物。",
      questions: [
        {
          type: "recall",
          prompt: "志明起初對這次活動有什麼態度？",
          options: ["覺得沉悶，只想交差", "十分期待，主動報名", "擔心自己做得不好", "希望認識新朋友"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "那位長者的生活狀況是怎樣的？",
          options: ["獨自居住多年，缺乏親友探望", "與子女同住，生活熱鬧", "經常參加社區活動", "身體健康，行動自如"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "志明由起初覺得沉悶，到最後有所感悟，反映他有什麼轉變？",
          options: ["由交差心態轉為真心關懷他人", "由熱心轉為冷漠", "由自信轉為自卑", "完全沒有任何轉變"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "志明陪伴長者做了什麼？",
          options: ["陪她聊天，聽她講述以前的故事", "幫她打掃家居", "陪她去看醫生", "教她使用電話"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "從長者「依依不捨」的反應，可以看出這次探訪對她有什麼意義？",
          options: ["陪伴對她來說十分珍貴", "她根本不在乎志明的探訪", "她想志明留下來同住", "她其實想快點結束探訪"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "chengshi-de-xuanze",
      title: "一個關於誠實的選擇",
      level: "s1",
      passage:
        "小組報告的死線快將到來，家傑發現自己負責的部分做得比其他人遜色很多。他曾經想過把從網上找到的資料直接抄下來交差，甚至已經打算複製貼上，最後一刻卻停了下來。他想起老師平時的教導，覺得這種捷徑並不可取，於是決定連夜重新完成，雖然質素不算完美，但至少是自己的心血。交報告那天，他向組員坦白說出這件事，組員不但沒有責怪他，反而讚賞他的誠實。",
      questions: [
        {
          type: "recall",
          prompt: "家傑本來打算怎樣完成他負責的部分？",
          options: ["直接抄襲網上資料交差", "向老師求助", "放棄不做", "找同學代勞"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "家傑最終做了什麼決定？",
          options: ["連夜重新完成，並向組員坦白", "繼續抄襲，隱瞞事實", "退出小組", "要求延遲交報告"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "組員知道事情後有什麼反應，這反映了什麼？",
          options: [
            "沒有責怪他，反而讚賞他的誠實——反映誠實比表面的完美更重要",
            "十分生氣，要求他退組",
            "向老師投訴他",
            "要求重做整份報告",
          ],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "是什麼令家傑臨時打消抄襲的念頭？",
          options: ["想起老師平時的教導，覺得這種捷徑並不可取", "怕被老師發現", "組員阻止他這樣做", "突然沒有網絡連線"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "這個故事想帶出「誠實」和「表面完美」之間怎樣的關係？",
          options: ["誠實比表面的完美更重要", "完美比誠實更重要", "兩者沒有關係", "誠實只是次要的價值"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "zhenxi-shuiziyuan",
      title: "珍惜水資源",
      level: "p6",
      passage:
        "香港雖然雨量充沛，但由於地理環境所限，缺乏天然大河及湖泊儲存食水，過去曾經多次面臨制水危機。政府其後興建水塘及引入東江水，才逐步解決供水問題。然而，隨着人口增長及氣候變化加劇，全球淡水資源日益短缺，並非用之不盡。學校近日推行「節約用水運動」，鼓勵同學縮短洗澡時間、隨手關緊水龍頭，並且在洗手盆下放置水桶收集廢水，用來沖廁或澆花，藉此培養珍惜水資源的習慣。",
      questions: [
        {
          type: "recall",
          prompt: "香港過去面臨制水危機的主要原因是什麼？",
          options: ["缺乏天然大河及湖泊儲存食水", "雨量嚴重不足", "水質受到嚴重污染", "人口過度密集"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "學校推行的「節約用水運動」包括什麼措施？",
          options: ["縮短洗澡時間、收集廢水再利用", "增建水塘、開鑿水井", "禁止同學使用洗手盆", "要求同學每天記錄用水量"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "為什麼學校推行節約用水運動時，除了要求同學節省用水，還教他們收集廢水再利用？",
          options: ["希望同學透過實際行動，培養珍惜水資源的習慣", "因為學校水費太貴", "因為政府規定要這樣做", "因為東江水供應不足"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "政府用了什麼方法解決供水問題？",
          options: ["興建水塘及引入東江水", "興建海水化淡廠", "限制人口增長", "進口樽裝水"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "文中提到收集廢水可以用來做什麼？",
          options: ["沖廁或澆花", "飲用", "煮食", "洗澡"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "cong-shibai-zhan-qilai",
      title: "從失敗中站起來",
      level: "p6",
      passage:
        "美琪參加學界游泳比賽，賽前接受了半年密集訓練，滿懷信心地踏上起跳台，怎料比賽當日發揮失準，最終無緣獎牌，甚至排名比預期落後很多。她一度非常沮喪，甚至萌生放棄游泳的念頭。教練告訴她，失敗其實是最好的老師，只要認真檢討問題所在，下一次就能夠有所進步。美琪聽從教練的建議，重新檢視自己的訓練方法，找出出發時反應過慢的問題，加倍苦練，終於在下一屆比賽中，打破了個人最佳成績。",
      questions: [
        {
          type: "recall",
          prompt: "美琪在比賽當日的表現如何？",
          options: ["發揮失準，排名比預期落後", "打破個人最佳成績", "因傷退賽", "獲得亞軍"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "教練怎樣鼓勵美琪？",
          options: ["告訴她失敗是最好的老師，鼓勵她檢討問題", "叫她放棄游泳，轉修其他運動", "責備她練習不夠", "要求她立即退出隊伍"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "教練沒有責備美琪表現失準，反而鼓勵她檢討問題，這反映教練是怎樣的人？",
          options: ["懂得體諒和引導選手的人", "對選手要求過分嚴苛的人", "對比賽結果毫不在乎的人", "只顧個人成就的人"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "美琪發現自己出發時有什麼問題？",
          options: ["反應過慢", "呼吸節奏錯誤", "泳姿不正確", "體力不足"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "美琪從沮喪灰心到最終突破成績，反映她有什麼轉變？",
          options: ["由灰心喪志轉為積極檢討、加倍苦練", "由自信變得自負", "由積極變得消極怠惰", "心態上完全沒有改變"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "baoyu-wenhua-yichan",
      title: "保育文化遺產的意義",
      level: "s1",
      passage:
        "香港有不少歷史建築，例如舊警署、戰前唐樓等，隨着城市發展步伐加快，部分建築因為年久失修，或者阻礙重建計劃，一度面臨拆卸的命運。近年，社會各界對保育文化遺產的意識逐漸提高，不少團體發起聯署，呼籲政府保留具歷史價值的建築，並且透過活化再利用，例如改建為博物館、文化中心或者特色商店，讓建築物得以繼續發揮功能，同時保存珍貴的集體回憶。保育並非單純懷舊，而是讓下一代能夠透過實物，親身認識城市的歷史與文化根源。",
      questions: [
        {
          type: "recall",
          prompt: "文章提到香港部分歷史建築面臨什麼命運？",
          options: ["因年久失修或阻礙重建而被拆卸", "被列為必然保留的古蹟", "被翻新為現代化商場", "被政府徵用作辦公室"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "文章提到保育文化遺產可以透過什麼方式進行？",
          options: ["活化再利用，例如改建為博物館或文化中心", "全面清拆，興建新式建築", "置之不理，任其自然損毀", "禁止任何人進入建築物"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "文章提到將歷史建築改建為博物館或文化中心，這種做法有什麼好處？",
          options: ["讓建築物既能保留，又能繼續發揮實際功能", "令建築物完全失去原有價值", "純粹為了吸引遊客消費", "對城市發展沒有任何幫助"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "文中提到保育文化遺產的其中一個目的是什麼？",
          options: ["保存珍貴的集體回憶", "增加地產商的利潤", "減少城市發展空間", "吸引更多遊客消費"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "從文章可以推斷，社會對保育文化遺產的態度出現了什麼轉變？",
          options: ["由忽視逐漸轉為重視", "由重視逐漸轉為忽視", "一直都非常重視，從未改變", "一直都漠不關心"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "wangluo-zixun-zhenwei",
      title: "網絡資訊的真偽",
      level: "s1",
      passage:
        "隨着社交媒體普及，資訊傳播的速度大大加快，但同時亦令不少未經證實的消息，甚至是刻意捏造的假新聞得以迅速散播。有調查發現，部分聳人聽聞的假消息，其傳播速度甚至遠遠超過真實新聞，原因是這類消息往往更能夠吸引眼球、引起讀者的情緒反應。專家建議，讀者接收資訊時應該養成查證的習慣，包括核實消息來源是否可靠、比對多個獨立渠道的報道，切勿只憑一時衝動便轉發未經證實的消息，以免無意中助長假消息的散播。",
      questions: [
        {
          type: "recall",
          prompt: "文章指出假消息傳播快的原因是什麼？",
          options: ["這類消息往往更能吸引眼球，引起情緒反應", "假消息通常較短，容易閱讀", "政府刻意推廣假消息", "真實新聞通常沒有配圖"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "專家建議讀者接收資訊時應該怎樣做？",
          options: ["核實消息來源，比對多個獨立渠道的報道", "只相信朋友分享的消息", "立即轉發吸引眼球的消息", "停止使用社交媒體"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "專家建議要比對多個獨立渠道的報道，而不只核實一個來源，這個建議想帶出什麼道理？",
          options: ["單一來源未必可靠，多方查證才能更準確判斷資訊真偽", "只要核實一個來源已經足夠", "消息來源的數量並不重要", "查證資訊是記者的責任，與讀者無關"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "專家建議查證資訊時，除了核實來源，還應該怎樣做？",
          options: ["比對多個獨立渠道的報道", "只看標題", "詢問親友意見", "立即轉發求證"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "如果讀者未經查證就隨意轉發消息，最有可能導致什麼後果？",
          options: ["無意中助長假消息的散播", "令消息傳播得更慢", "令讀者更加信任社交媒體", "對社會沒有任何影響"],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "tuandui-hezuo",
      title: "團隊合作的重要",
      level: "p6",
      passage:
        "學校舉辦接力賽，家俊所在的隊伍當中，有位隊員平日跑步成績並不特別出色，隊友一度擔心會拖累整體成績，甚至有人提議換人。班主任卻鼓勵大家給予機會，並且安排隊員互相練習交接棒的技巧。比賽當日，雖然那位隊員的單圈時間不是最快，但由於交接棒配合純熟，全隊反而節省了不少時間，最終順利奪得季軍。這次經驗令家俊明白，團隊比賽講求的不只是個人能力，更重要的是隊員之間的默契與互相配合。",
      questions: [
        {
          type: "recall",
          prompt: "隊友起初對哪位隊員有什麼擔心？",
          options: ["跑步成績並不特別出色的隊員", "家俊自己", "班主任", "裁判"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "這隊最終在接力賽中表現如何？",
          options: ["憑純熟的交接棒配合，奪得季軍", "因隊員拖累，敬陪末席", "中途犯規被取消資格", "僅僅完成賽事，沒有名次"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "班主任沒有聽從部分隊友換人的提議，反而給予那位隊員機會，這反映班主任是怎樣的人？",
          options: ["懂得包容和發掘隊員潛能的人", "過分縱容表現較差的隊員", "對比賽勝負毫不在乎的人", "偏心對待某位隊員"],
          correctIndex: 0,
        },
        {
          type: "recall",
          prompt: "班主任怎樣安排隊員練習？",
          options: ["安排隊員互相練習交接棒技巧", "安排隊員各自練跑", "換走表現較弱的隊員", "取消接力賽資格"],
          correctIndex: 0,
        },
        {
          type: "inference",
          prompt: "如果班主任當初聽從隊友的提議換走那位隊員，最有可能發生什麼？",
          options: ["這隊未必能夠學會交接棒的默契，未必奪得季軍", "這隊一定能夠贏得冠軍", "對比賽結果沒有任何影響", "那位隊員會因此更努力練跑"],
          correctIndex: 0,
        },
      ],
    },
  ];

  const READING_LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.READING_ITEMS = READING_ITEMS;
  window.App.Content.READING_LEVEL_LABEL = READING_LEVEL_LABEL;
})();
