// Curated classical poetry (詩詞) + classical prose (文言文) content.
// Start with a smaller curated set (20 poems + 5 prose pieces); expand later.
// Each item: lines/pinyin are parallel arrays. Poems carry a single `explanation`;
// prose pieces carry `lineExplanations` (parallel to `lines`) for the extra
// line-by-line depth 文言文 needs. `meaningQuiz` is a short one-sentence
// paraphrase used as the "correct" option in meaning multiple-choice questions.
window.App = window.App || {};
window.App.Content = window.App.Content || {};

(function () {
  const POETRY_ITEMS = [
    {
      id: "jing-ye-si",
      type: "poem",
      title: "靜夜思",
      author: "李白",
      dynasty: "唐",
      level: "p5",
      lines: ["床前明月光，", "疑是地上霜。", "舉頭望明月，", "低頭思故鄉。"],
      pinyin: [
        "Chuáng qián míng yuè guāng，",
        "yí shì dì shàng shuāng。",
        "jǔ tóu wàng míng yuè，",
        "dī tóu sī gù xiāng。",
      ],
      explanation:
        "詩人半夜醒來，見到床前一片月光，恍惚以為是地上結了霜；抬頭看見明月，不禁低頭思念起故鄉。",
      annotations: [
        { term: "疑", meaning: "好像，以為" },
        { term: "舉頭", meaning: "抬起頭" },
      ],
      translation:
        "床前灑落一片明亮的月光，讓人恍惚以為是地上結了一層白霜。抬起頭來，望向天邊的明月；低下頭時，不禁思念起遠方的故鄉。",
      background:
        "李白在他鄉作客時所寫，是最廣為人知的思鄉詩之一，語言淺白但感情真摯。",
      meaningQuiz: "詩人望着月光，勾起思念家鄉的情懷。",
    },
    {
      id: "chun-xiao",
      type: "poem",
      title: "春曉",
      author: "孟浩然",
      dynasty: "唐",
      level: "p5",
      lines: ["春眠不覺曉，", "處處聞啼鳥。", "夜來風雨聲，", "花落知多少。"],
      pinyin: [
        "Chūn mián bù jué xiǎo，",
        "chù chù wén tí niǎo。",
        "yè lái fēng yǔ shēng，",
        "huā luò zhī duō shǎo。",
      ],
      explanation:
        "春天睡得香甜，不知不覺天已經亮了，四處都聽到鳥兒的叫聲；想起昨夜風雨交加，不知道花兒被吹落了多少。",
      annotations: [
        { term: "曉", meaning: "天亮" },
        { term: "啼鳥", meaning: "鳴叫的鳥兒" },
      ],
      translation:
        "春天睡得香甜，不知不覺天已經亮了，四處都聽到鳥兒的啼叫聲。回想起昨夜風雨交加的聲音，不知道花兒被吹落了多少。",
      background: "描寫春日清晨慵懶又惜春的心情，是家喻戶曉的唐詩之一。",
      meaningQuiz: "詩人在春天的早晨，聽見鳥鳴，想起昨夜風雨，擔心花朵被吹落。",
    },
    {
      id: "min-nong",
      type: "poem",
      title: "憫農（其二）",
      author: "李紳",
      dynasty: "唐",
      level: "p5",
      lines: ["鋤禾日當午，", "汗滴禾下土。", "誰知盤中餐，", "粒粒皆辛苦。"],
      pinyin: [
        "Chú hé rì dāng wǔ，",
        "hàn dī hé xià tǔ。",
        "shéi zhī pán zhōng cān，",
        "lì lì jiē xīn kǔ。",
      ],
      explanation:
        "農夫在正午烈日下鋤禾耕作，汗水滴落在禾苗下的泥土裏；有誰想到我們碗裏的飯食，每一粒都是農夫辛勤勞動得來的。",
      annotations: [
        { term: "鋤", jyutping: "co4", meaning: "用鋤頭耕地" },
        { term: "盤中餐", meaning: "碗碟裏的飯食" },
      ],
      translation:
        "農夫在正午烈日當空之時鋤地耕作，汗水一滴一滴落在禾苗下的泥土裏。有誰想到，我們碗中的飯食，每一粒都是農夫辛勤勞動換來的成果。",
      background: "提醒人們珍惜食物、體諒農民辛勞，是傳統品德教育常引用的詩。",
      meaningQuiz: "詩歌提醒我們要珍惜食物，因為每一粒米都得來不易。",
    },
    {
      id: "deng-guanque-lou",
      type: "poem",
      title: "登鸛雀樓",
      author: "王之渙",
      dynasty: "唐",
      level: "p5",
      lines: ["白日依山盡，", "黃河入海流。", "欲窮千里目，", "更上一層樓。"],
      pinyin: [
        "Bái rì yī shān jìn，",
        "huáng hé rù hǎi liú。",
        "yù qióng qiān lǐ mù，",
        "gèng shàng yī céng lóu。",
      ],
      explanation:
        "太陽依傍着山巒漸漸落下，黃河奔流向大海；如果想看得更遠，就要再登上更高的一層樓。",
      annotations: [
        { term: "鸛雀樓", jyutping: "gun3 zoek3 lau4", meaning: "位於今山西永濟的一座樓，因常有鸛雀棲息而得名" },
        { term: "欲窮", meaning: "想要看到盡頭" },
      ],
      translation:
        "太陽依傍着山巒漸漸西沉，黃河奔騰不息，流向大海。如果想把千里之外的景色盡收眼底，就要再登上更高的一層樓。",
      background:
        "借登樓遠眺抒發積極向上、追求更高目標的胸懷，是勵志詩的代表作。",
      meaningQuiz: "想要看得更遠，就要站得更高，勉勵人不斷向上。",
    },
    {
      id: "wang-lushan-pubu",
      type: "poem",
      title: "望廬山瀑布",
      author: "李白",
      dynasty: "唐",
      level: "p5",
      lines: [
        "日照香爐生紫煙，",
        "遙看瀑布掛前川。",
        "飛流直下三千尺，",
        "疑是銀河落九天。",
      ],
      pinyin: [
        "Rì zhào xiānglú shēng zǐ yān，",
        "yáo kàn pùbù guà qián chuān。",
        "fēi liú zhí xià sān qiān chǐ，",
        "yí shì yínhé luò jiǔ tiān。",
      ],
      explanation:
        "陽光照射在香爐峰上，升起紫色的雲煙；遠遠望去，瀑布就像掛在山前的河流。水流飛快直瀉而下，好像有三千尺那麼高，讓人懷疑是銀河從天上落下來。",
      annotations: [
        { term: "廬山", jyutping: "lou4 saan1", meaning: "位於江西的名山" },
        { term: "九天", meaning: "天的最高處，形容極高" },
      ],
      translation:
        "陽光照射在香爐峰上，升起紫色雲煙；遠望瀑布，就像一條大河懸掛在山前。水流飛快地直瀉而下，足有三千尺高，讓人懷疑是銀河從九天之上跌落下來。",
      background: "以誇張的想像描寫廬山瀑布的壯麗，展現李白豪放的詩風。",
      meaningQuiz: "詩人以誇張手法形容瀑布壯觀，彷彿銀河從天而降。",
    },
    {
      id: "yong-liu",
      type: "poem",
      title: "詠柳",
      author: "賀知章",
      dynasty: "唐",
      level: "p5",
      lines: [
        "碧玉妝成一樹高，",
        "萬條垂下綠絲絛。",
        "不知細葉誰裁出，",
        "二月春風似剪刀。",
      ],
      pinyin: [
        "Bìyù zhuāng chéng yí shù gāo，",
        "wàn tiáo chuí xià lǜ sī tāo。",
        "bù zhī xì yè shéi cái chū，",
        "èr yuè chūnfēng sì jiǎndāo。",
      ],
      explanation:
        "柳樹像用碧玉妝點而成，高高地聳立着，千萬條柳枝垂下，像綠色的絲帶。不知道這些細嫩的柳葉是誰裁剪出來的，原來是二月的春風，像剪刀一樣裁出了它們。",
      annotations: [
        { term: "絲絛", jyutping: "si1 tou1", meaning: "絲帶，這裏比喻柳條" },
        { term: "裁", meaning: "裁剪，比喻造就、造成" },
      ],
      translation:
        "柳樹像用碧玉妝點而成，高高地聳立着，千萬條枝條垂下，像一條條翠綠的絲帶。不知道這些細嫩的柳葉是誰裁剪出來的，原來是二月的春風，像剪刀一樣裁出了它們。",
      background: "以精巧的比喻歌詠春天柳樹的姿態，想像力豐富，是詠物詩的名篇。",
      meaningQuiz: "詩人把春風比喻成剪刀，裁出細嫩的柳葉，想像新奇。",
    },
    {
      id: "jiang-xue",
      type: "poem",
      title: "江雪",
      author: "柳宗元",
      dynasty: "唐",
      level: "p6",
      lines: ["千山鳥飛絕，", "萬徑人蹤滅。", "孤舟蓑笠翁，", "獨釣寒江雪。"],
      pinyin: [
        "Qiān shān niǎo fēi jué，",
        "wàn jìng rén zōng miè。",
        "gū zhōu suō lì wēng，",
        "dú diào hán jiāng xuě。",
      ],
      explanation:
        "千山萬嶺不見飛鳥，所有小路都沒有人的蹤影；只有一位披蓑戴笠的老翁，獨自在寒冷的江面上垂釣。",
      annotations: [
        { term: "蓑", jyutping: "so1", meaning: "蓑衣，用草或棕葉編成的防雨衣" },
        { term: "笠", meaning: "斗笠，戴在頭上防雨遮陽的帽子" },
      ],
      translation:
        "千山萬嶺不見飛鳥的蹤影，所有小徑都沒有行人的足跡。只有一葉孤舟上，一位披着蓑衣、戴着斗笠的老翁，獨自在寒冷的江面上垂釣。",
      background: "以孤寂雪景寄託作者被貶後孤高、不屈的心境。",
      meaningQuiz: "詩歌描寫大雪中萬物寂靜，只有一位老人獨自垂釣的孤高畫面。",
    },
    {
      id: "you-zi-yin",
      type: "poem",
      title: "遊子吟",
      author: "孟郊",
      dynasty: "唐",
      level: "p6",
      lines: [
        "慈母手中線，",
        "遊子身上衣。",
        "臨行密密縫，",
        "意恐遲遲歸。",
        "誰言寸草心，",
        "報得三春暉。",
      ],
      pinyin: [
        "Cí mǔ shǒu zhōng xiàn，",
        "yóu zǐ shēn shàng yī。",
        "lín xíng mì mì féng，",
        "yì kǒng chí chí guī。",
        "shéi yán cùn cǎo xīn，",
        "bào dé sān chūn huī。",
      ],
      explanation:
        "慈祥的母親手中拿着針線，為即將遠行的孩子縫製衣裳；臨行前縫得特別緊密，是擔心孩子遲遲不能回家。有誰能說，小草般的孝心，能報答得了春天陽光般的母愛呢？",
      annotations: [
        { term: "寸草心", meaning: "比喻子女微小的孝心" },
        { term: "三春暉", meaning: "比喻母親偉大的恩情，如春天的陽光" },
      ],
      translation:
        "慈愛的母親手裏拿着針線，為即將遠行的孩子縫製衣裳。臨行前縫得特別緊密，是擔心孩子遲遲未能歸來。有誰能說，小草般微小的孝心，能夠報答得了如春暉般廣大的母愛呢？",
      background: "歌頌母愛偉大、子女難以回報的深情，是最著名的親情詩之一。",
      meaningQuiz: "詩歌讚頌母親的愛如春暉般偉大，子女的孝心難以完全報答。",
    },
    {
      id: "zao-fa-baidi-cheng",
      type: "poem",
      title: "早發白帝城",
      author: "李白",
      dynasty: "唐",
      level: "p6",
      lines: [
        "朝辭白帝彩雲間，",
        "千里江陵一日還。",
        "兩岸猿聲啼不住，",
        "輕舟已過萬重山。",
      ],
      pinyin: [
        "Zhāo cí Báidì cǎiyún jiān，",
        "qiān lǐ Jiānglíng yī rì huán。",
        "liǎng àn yuán shēng tí bú zhù，",
        "qīng zhōu yǐ guò wàn chóng shān。",
      ],
      explanation:
        "清晨告別彩雲繚繞的白帝城，千里之外的江陵一天之內就能到達。兩岸猿猴的叫聲不斷傳來，輕快的小船已經越過重重山巒。",
      annotations: [
        { term: "白帝城", meaning: "位於四川，古代重要關隘" },
        { term: "江陵", meaning: "位於湖北的古地名" },
      ],
      translation:
        "清晨告別彩雲繚繞的白帝城，遠隔千里的江陵一天之內就能到達。兩岸猿猴的叫聲不斷傳來，輕快的小船已經越過重重山巒。",
      background:
        "描寫詩人流放遇赦、順流東下的暢快心情，節奏輕快，展現速度感。",
      meaningQuiz: "詩人乘船順流而下，速度飛快，心情輕鬆愉快。",
    },
    {
      id: "fengqiao-yebo",
      type: "poem",
      title: "楓橋夜泊",
      author: "張繼",
      dynasty: "唐",
      level: "p6",
      lines: [
        "月落烏啼霜滿天，",
        "江楓漁火對愁眠。",
        "姑蘇城外寒山寺，",
        "夜半鐘聲到客船。",
      ],
      pinyin: [
        "Yuè luò wū tí shuāng mǎn tiān，",
        "jiāng fēng yú huǒ duì chóu mián。",
        "Gūsū chéng wài Hánshān Sì，",
        "yèbàn zhōng shēng dào kè chuán。",
      ],
      explanation:
        "月亮落下，烏鴉啼叫，滿天霜氣；江邊的楓樹和漁船的燈火伴着愁緒難眠的旅人。姑蘇城外的寒山寺，半夜的鐘聲傳到了客船上。",
      annotations: [
        { term: "江楓", meaning: "江邊的楓樹" },
        { term: "姑蘇", jyutping: "gu1 sou1", meaning: "蘇州的古稱" },
      ],
      translation:
        "月亮落下，烏鴉啼叫，滿天霜氣瀰漫；江邊的楓樹和漁船的燈火，伴着愁緒難眠的旅人。姑蘇城外的寒山寺，半夜的鐘聲傳到了客船上。",
      background: "描寫詩人旅途中夜泊江邊，因思鄉而難以入眠的孤寂心情。",
      meaningQuiz: "詩人夜宿客船，愁緒滿懷，聽見遠處寺廟的鐘聲。",
    },
    {
      id: "qingming",
      type: "poem",
      title: "清明",
      author: "杜牧",
      dynasty: "唐",
      level: "p6",
      lines: [
        "清明時節雨紛紛，",
        "路上行人欲斷魂。",
        "借問酒家何處有，",
        "牧童遙指杏花村。",
      ],
      pinyin: [
        "Qīngmíng shíjié yǔ fēnfēn，",
        "lùshàng xíngrén yù duàn hún。",
        "jièwèn jiǔjiā héchù yǒu，",
        "mùtóng yáo zhǐ Xìnghuā Cūn。",
      ],
      explanation:
        "清明時節細雨紛紛落下，路上的行人心情低落、悲傷欲絕。詢問哪裏有酒家可以歇息，牧童遠遠指向杏花村的方向。",
      annotations: [
        { term: "斷魂", meaning: "形容極度悲傷、失魂落魄" },
        { term: "杏花村", meaning: "泛指開滿杏花、有酒家的村莊" },
      ],
      translation:
        "清明時節細雨紛紛落下，路上的行人個個神情落寞、悲傷欲絕。詢問哪裏有酒家可以歇息，牧童遠遠指向杏花村的方向。",
      background:
        "描寫清明掃墓時節雨中行人的哀傷心情，結尾轉為輕快，富有畫面感。",
      meaningQuiz: "詩歌描寫清明時節細雨中行人愁悶，向牧童問路找酒家。",
    },
    {
      id: "shan-xing",
      type: "poem",
      title: "山行",
      author: "杜牧",
      dynasty: "唐",
      level: "p6",
      lines: [
        "遠上寒山石徑斜，",
        "白雲生處有人家。",
        "停車坐愛楓林晚，",
        "霜葉紅於二月花。",
      ],
      pinyin: [
        "Yuǎn shàng hánshān shíjìng xié，",
        "báiyún shēng chù yǒu rénjiā。",
        "tíng chē zuò ài fēnglín wǎn，",
        "shuāng yè hóng yú èryuè huā。",
      ],
      explanation:
        "一條石頭小徑蜿蜒伸向遠處的秋山，白雲繚繞之處住着人家。停下車子是因為喜愛這片傍晚的楓林，經霜的楓葉比二月的花朵還要紅艷。",
      annotations: [
        { term: "石徑", meaning: "石頭砌成的小路" },
        { term: "坐愛", meaning: "因為喜愛" },
      ],
      translation:
        "一條石頭小徑蜿蜒地伸向遠處的深秋山嶺，白雲繚繞之處，隱約可見人家。停下車子，是因為喜愛這片黃昏的楓林；經霜的楓葉，竟比二月的春花還要紅艷。",
      background: "描寫秋日山中楓林美景，展現詩人對大自然的喜愛與讚嘆。",
      meaningQuiz: "詩人停車欣賞楓林晚景，認為霜後的楓葉比春花更美。",
    },
    {
      id: "juju-huangli",
      type: "poem",
      title: "絕句（兩個黃鸝鳴翠柳）",
      author: "杜甫",
      dynasty: "唐",
      level: "p6",
      lines: [
        "兩個黃鸝鳴翠柳，",
        "一行白鷺上青天。",
        "窗含西嶺千秋雪，",
        "門泊東吳萬里船。",
      ],
      pinyin: [
        "Liǎng gè huánglí míng cuì liǔ，",
        "yì háng báilù shàng qīng tiān。",
        "chuāng hán xī lǐng qiānqiū xuě，",
        "mén bó Dōngwú wànlǐ chuán。",
      ],
      explanation:
        "兩隻黃鶯在翠綠的柳樹上鳴叫，一行白鷺飛上蔚藍的天空。窗子彷彿框住了西嶺終年積雪的景色，門外停泊着從遙遠東吳來的船隻。",
      annotations: [
        { term: "黃鸝", jyutping: "wong4 lei4", meaning: "黃鶯，一種鳴聲悅耳的鳥" },
        { term: "白鷺", jyutping: "baak6 lou6", meaning: "一種羽毛潔白的水鳥" },
      ],
      translation:
        "兩隻黃鸝在翠綠的柳枝上鳴叫，一行白鷺飛上蔚藍的天空。窗子彷彿框住了西嶺終年不化的積雪，門外停泊着從遙遠東吳而來的船隻。",
      background:
        "描寫杜甫在成都草堂所見的春日美景，對仗工整，色彩鮮明。",
      meaningQuiz: "詩歌描寫窗前所見的黃鸝、白鷺、雪山與江船，畫面色彩繽紛。",
    },
    {
      id: "yuanri",
      type: "poem",
      title: "元日",
      author: "王安石",
      dynasty: "宋",
      level: "p6",
      lines: [
        "爆竹聲中一歲除，",
        "春風送暖入屠蘇。",
        "千門萬戶曈曈日，",
        "總把新桃換舊符。",
      ],
      pinyin: [
        "Bàozhú shēng zhōng yí suì chú，",
        "chūnfēng sòng nuǎn rù túsū。",
        "qiānmén wànhù tóngtóng rì，",
        "zǒng bǎ xīn táo huàn jiù fú。",
      ],
      explanation:
        "在爆竹聲中舊的一年過去了，春風送來暖意，人們喝着屠蘇酒。千家萬戶都沐浴在初升的陽光下，家家戶戶都把新的桃符換上舊的。",
      annotations: [
        { term: "屠蘇", meaning: "古代農曆新年飲用的一種藥酒" },
        { term: "曈曈日", jyutping: "tung4 tung4 jat6", meaning: "形容太陽剛升起、明亮温暖的樣子" },
      ],
      translation:
        "在爆竹聲中，舊的一年過去了；春風送來暖意，人們歡喜地喝着屠蘇酒。千家萬戶都沐浴在初升的陽光下，家家戶戶都把新的桃符換上了舊的。",
      background:
        "描寫古代新年時燃放爆竹、飲屠蘇酒、換桃符的習俗，充滿節日氣氛。",
      meaningQuiz: "詩歌描寫農曆新年爆竹聲聲、萬象更新的熱鬧景象。",
    },
    {
      id: "huanghelou-song",
      type: "poem",
      title: "黃鶴樓送孟浩然之廣陵",
      author: "李白",
      dynasty: "唐",
      level: "s1",
      lines: [
        "故人西辭黃鶴樓，",
        "煙花三月下揚州。",
        "孤帆遠影碧空盡，",
        "唯見長江天際流。",
      ],
      pinyin: [
        "Gùrén xī cí Huánghè Lóu，",
        "yānhuā sān yuè xià Yángzhōu。",
        "gū fān yuǎn yǐng bì kōng jìn，",
        "wéi jiàn Chángjiāng tiānjì liú。",
      ],
      explanation:
        "老朋友向西告別黃鶴樓，在繁花似錦的三月順流而下前往揚州。孤獨的帆船漸漸遠去，消失在碧藍的天空盡頭，只看見長江向天邊奔流。",
      annotations: [
        { term: "煙花三月", meaning: "形容陽春三月，繁花如霧似錦" },
        { term: "碧空", meaning: "蔚藍的天空" },
      ],
      translation:
        "老朋友向西告別黃鶴樓，在繁花似錦的三月順流東下，前往揚州。孤獨的帆影漸漸遠去，消失在碧藍的天際，只看見長江滾滾東流，一直流向天邊。",
      background: "李白送別好友孟浩然之作，借江景寄託依依不捨的離情。",
      meaningQuiz:
        "詩人目送友人的船漸行漸遠，只剩長江水流向天邊，抒發依依惜別之情。",
    },
    {
      id: "chunye-xi-yu",
      type: "poem",
      title: "春夜喜雨",
      author: "杜甫",
      dynasty: "唐",
      level: "s1",
      lines: ["好雨知時節，", "當春乃發生。", "隨風潛入夜，", "潤物細無聲。"],
      pinyin: [
        "Hǎo yǔ zhī shíjié，",
        "dāng chūn nǎi fāshēng。",
        "suí fēng qián rù yè，",
        "rùn wù xì wú shēng。",
      ],
      explanation:
        "好雨懂得配合時節，在春天來臨的時候降下。它隨着風悄悄地在夜裏來到，靜靜地滋潤萬物，沒有一點聲音。",
      annotations: [
        { term: "乃", meaning: "就，於是" },
        { term: "潛", meaning: "悄悄地，不知不覺" },
      ],
      translation:
        "好雨懂得配合時節，在春天來臨之際降下。它隨着微風，悄悄地在夜裏來到，靜靜地滋潤萬物，沒有一點聲息。",
      background: "讚美春雨適時而至、默默滋養萬物的美好，展現杜甫細膩的觀察。",
      meaningQuiz: "詩歌讚美春雨在夜裏悄悄滋潤大地萬物，不聲不響。",
    },
    {
      id: "huichong-chunjiang",
      type: "poem",
      title: "惠崇春江晚景",
      author: "蘇軾",
      dynasty: "宋",
      level: "s1",
      lines: [
        "竹外桃花三兩枝，",
        "春江水暖鴨先知。",
        "蔞蒿滿地蘆芽短，",
        "正是河豚欲上時。",
      ],
      pinyin: [
        "Zhú wài táohuā sān liǎng zhī，",
        "chūnjiāng shuǐ nuǎn yā xiān zhī。",
        "lóuhāo mǎn dì lúyá duǎn，",
        "zhèng shì hétún yù shàng shí。",
      ],
      explanation:
        "竹林外開着三兩枝桃花，春天江水回暖，鴨子最先察覺到。蔞蒿長滿了地面，蘆葦剛剛抽出短短的嫩芽，正是河豚將要洄游而上的時節。",
      annotations: [
        { term: "蒿", jyutping: "hou1", meaning: "一種可食用的野生植物" },
        { term: "蔞蒿", meaning: "一種生於水邊的野菜，古人認為河豚肥美時正值蔞蒿生長" },
        { term: "河豚", jyutping: "ho4 tyun4", meaning: "一種味道鮮美但帶有毒性的魚類" },
      ],
      translation:
        "竹林外開着三兩枝桃花，春天江水回暖，鴨子最先察覺得到。蔞蒿長滿了地面，蘆葦剛剛抽出短短的嫩芽，正是河豚將要逆流而上的時節。",
      background: "蘇軾為惠崇和尚的畫作題詩，描寫早春江邊生機盎然的景象。",
      meaningQuiz: "詩歌描寫早春江邊桃花初開、鴨子戲水、萬物復甦的景象。",
    },
    {
      id: "ti-xilin-bi",
      type: "poem",
      title: "題西林壁",
      author: "蘇軾",
      dynasty: "宋",
      level: "s1",
      lines: [
        "橫看成嶺側成峰，",
        "遠近高低各不同。",
        "不識廬山真面目，",
        "只緣身在此山中。",
      ],
      pinyin: [
        "Héng kàn chéng lǐng cè chéng fēng，",
        "yuǎn jìn gāo dī gè bù tóng。",
        "bù shí Lúshān zhēn miànmù，",
        "zhǐ yuán shēn zài cǐ shān zhōng。",
      ],
      explanation:
        "從正面看是連綿的山嶺，從側面看卻是聳立的山峰，從遠近高低各個角度看，樣子都不一樣。之所以認不清廬山真正的面貌，只是因為自己身處在這座山之中。",
      annotations: [
        { term: "緣", meaning: "因為" },
        { term: "真面目", meaning: "事物真正的面貌" },
      ],
      translation:
        "從正面看是連綿的山嶺，從側面看卻是聳立的山峰，從遠近高低不同角度看，樣子各有不同。之所以認不清廬山真正的面貌，只是因為自己身處在這座山之中。",
      background: "借景說理，說明當局者迷、旁觀者清的道理，是哲理詩的代表作。",
      meaningQuiz: "詩歌借觀察廬山說明：身處事情之中，反而難以看清全貌。",
    },
    {
      id: "yin-hu-shang",
      type: "poem",
      title: "飲湖上初晴後雨",
      author: "蘇軾",
      dynasty: "宋",
      level: "s1",
      lines: [
        "水光瀲灩晴方好，",
        "山色空濛雨亦奇。",
        "欲把西湖比西子，",
        "淡妝濃抹總相宜。",
      ],
      pinyin: [
        "Shuǐguāng liànyàn qíng fāng hǎo，",
        "shānsè kōngméng yǔ yì qí。",
        "yù bǎ Xīhú bǐ Xīzǐ，",
        "dànzhuāng nóngmǒ zǒng xiāngyí。",
      ],
      explanation:
        "晴天時湖水波光閃爍，景色正好；下雨時山色迷濛，別有一番奇妙。如果要把西湖比作西施，那麼無論淡妝或濃妝，西施都同樣美麗動人。",
      annotations: [
        { term: "瀲灩", jyutping: "lim6 jim6", meaning: "水波盪漾、閃動的樣子" },
        { term: "空濛", meaning: "雲霧迷茫的樣子" },
      ],
      translation:
        "晴天時，湖水波光盪漾，景色正好；下雨時，山色迷濛，也別有一番奇妙。如果要把西湖比作西施，那麼無論淡妝或濃妝，她都同樣美麗動人。",
      background: "蘇軾任杭州時所寫，以西施比喻西湖，晴雨皆美，傳誦千古。",
      meaningQuiz: "詩人以美人西施比喻西湖，無論晴天雨天都各具美態。",
    },
    {
      id: "chusai",
      type: "poem",
      title: "出塞",
      author: "王昌齡",
      dynasty: "唐",
      level: "s1",
      lines: [
        "秦時明月漢時關，",
        "萬里長征人未還。",
        "但使龍城飛將在，",
        "不教胡馬度陰山。",
      ],
      pinyin: [
        "Qín shí míngyuè Hàn shí guān，",
        "wànlǐ chángzhēng rén wèi huán。",
        "dàn shǐ Lóngchéng fēijiàng zài，",
        "bù jiào hú mǎ dù Yīnshān。",
      ],
      explanation:
        "依然是秦漢時代的明月和關塞，出征萬里的將士卻還沒有回來。只要有像李廣那樣英勇善戰的將軍鎮守龍城，就不會讓外族的騎兵越過陰山。",
      annotations: [
        { term: "龍城飛將", meaning: "指漢代名將李廣" },
        { term: "陰山", meaning: "位於內蒙古的山脈，古代邊防要地" },
      ],
      translation:
        "依然是秦漢時代的明月和關塞，出征萬里的將士至今仍未歸來。只要有像李廣那樣英勇的將領鎮守龍城，就不會讓外族的騎兵越過陰山。",
      background:
        "借古諷今，抒發對邊塞將士的同情，以及渴望良將守衛邊疆、平息戰亂的心願。",
      meaningQuiz: "詩歌感慨邊塞戰事長久，盼望有良將能守護邊疆、保家衛國。",
    },
    {
      id: "xiang-si",
      type: "poem",
      title: "相思",
      author: "王維",
      dynasty: "唐",
      level: "p5",
      lines: ["紅豆生南國，", "春來發幾枝。", "勸君多采擷，", "此物最相思。"],
      pinyin: [
        "Hóngdòu shēng nánguó，",
        "chūn lái fā jǐ zhī。",
        "quàn jūn duō cǎixié，",
        "cǐ wù zuì xiāngsī。",
      ],
      explanation:
        "紅豆生長在南方，春天來臨時不知抽發了多少新枝。勸你多多采摘它，因為這種東西最能寄託相思之情。",
      annotations: [
        { term: "紅豆", meaning: "又稱相思子，古人常用來象徵思念之情" },
        { term: "采擷", meaning: "採摘" },
      ],
      translation:
        "紅豆生長在南方，春天來臨時不知抽發了多少新枝。勸你多多采摘它，因為這種東西最能寄託相思之情。",
      background: "借紅豆寄託對朋友的思念，語言淺白，情意深長，是詠物寄情詩的代表作。",
      meaningQuiz: "詩人借紅豆寄託對朋友深切的思念之情。",
    },
    {
      id: "jiuyue-jiuri-yi-shandong-xiongdi",
      type: "poem",
      title: "九月九日憶山東兄弟",
      author: "王維",
      dynasty: "唐",
      level: "p6",
      lines: [
        "獨在異鄉為異客，",
        "每逢佳節倍思親。",
        "遙知兄弟登高處，",
        "遍插茱萸少一人。",
      ],
      pinyin: [
        "Dú zài yìxiāng wéi yìkè，",
        "měi féng jiājié bèi sī qīn。",
        "yáo zhī xiōngdì dēnggāo chù，",
        "biàn chā zhūyú shǎo yī rén。",
      ],
      explanation:
        "獨自一人在異鄉作客，每逢佳節就加倍思念家鄉的親人。遠遠猜想兄弟們今天重陽節登高的情景，他們身上都插滿了茱萸，卻少了我一個人。",
      annotations: [
        { term: "茱萸", jyutping: "zyu1 jyu4", meaning: "一種有香氣的植物，古人重陽節有插茱萸辟邪的習俗" },
        { term: "倍", meaning: "加倍" },
      ],
      translation:
        "獨自一人在異鄉作客，每逢佳節就加倍思念家鄉的親人。遠遠猜想兄弟們今天重陽節登高的情景，他們身上都插滿了茱萸，卻少了我一個人。",
      background:
        "王維十七歲時在重陽節思念家鄉兄弟而作，抒發遊子思親之情，「每逢佳節倍思親」成為千古名句。",
      meaningQuiz: "詩人在重陽節思念故鄉的兄弟，遺憾自己不能與他們一同登高。",
    },
    {
      id: "xun-yinzhe-bu-yu",
      type: "poem",
      title: "尋隱者不遇",
      author: "賈島",
      dynasty: "唐",
      level: "p5",
      lines: ["松下問童子，", "言師采藥去。", "只在此山中，", "雲深不知處。"],
      pinyin: [
        "Sōng xià wèn tóngzǐ，",
        "yán shī cǎiyào qù。",
        "zhǐ zài cǐ shān zhōng，",
        "yún shēn bù zhī chù。",
      ],
      explanation:
        "在松樹下詢問一位童子，他說師父採藥去了。師父就在這座山裏，但山中雲霧繚繞，不知道確實的地方。",
      annotations: [{ term: "童子", meaning: "未成年的少年，這裏指隱者的弟子" }],
      translation:
        "在松樹下詢問一位童子，他說師父採藥去了。師父就在這座山裏，但山中雲霧繚繞，不知道確實的地方。",
      background: "描寫詩人尋訪隱居山林的高人而不遇的情景，透過童子的回答層層遞進，意境悠遠。",
      meaningQuiz: "詩人上山尋訪隱士，卻因山中雲霧繚繞而遍尋不獲。",
    },
    {
      id: "liangzhou-ci-putao",
      type: "poem",
      title: "涼州詞（葡萄美酒夜光杯）",
      author: "王翰",
      dynasty: "唐",
      level: "s1",
      lines: [
        "葡萄美酒夜光杯，",
        "欲飲琵琶馬上催。",
        "醉臥沙場君莫笑，",
        "古來征戰幾人回。",
      ],
      pinyin: [
        "Pútáo měijiǔ yèguāng bēi，",
        "yù yǐn pípá mǎ shàng cuī。",
        "zuì wò shāchǎng jūn mò xiào，",
        "gǔlái zhēngzhàn jǐ rén huí。",
      ],
      explanation:
        "精美的葡萄美酒盛在夜光杯中，正想暢飲時，馬上的琵琶聲已經催促出發。即使醉倒在戰場上，也請不要見笑，自古以來出征打仗，有幾個人能夠活着回來呢？",
      annotations: [
        { term: "夜光杯", meaning: "用白玉製成、在夜間能發光的酒杯" },
        { term: "沙場", meaning: "戰場" },
      ],
      translation:
        "精美的葡萄美酒盛在夜光杯中，正想暢飲時，馬上的琵琶聲已經催促出發。即使醉倒在戰場上，也請不要見笑，自古以來出征打仗，有幾個人能夠活着回來呢？",
      background:
        "描寫邊塞將士出征前豪飲的場面，表面豪邁，卻暗含戰爭殘酷、視死如歸的悲壯情懷，是邊塞詩的名篇。",
      meaningQuiz: "詩歌描寫將士出征前開懷暢飲，同時流露視死如歸的悲壯情懷。",
    },
    {
      id: "furong-lou-song-xinjian",
      type: "poem",
      title: "芙蓉樓送辛漸",
      author: "王昌齡",
      dynasty: "唐",
      level: "s1",
      lines: [
        "寒雨連江夜入吳，",
        "平明送客楚山孤。",
        "洛陽親友如相問，",
        "一片冰心在玉壺。",
      ],
      pinyin: [
        "Hányǔ lián jiāng yè rù Wú，",
        "píngmíng sòng kè Chǔshān gū。",
        "Luòyáng qīnyǒu rú xiāng wèn，",
        "yī piàn bīngxīn zài yù hú。",
      ],
      explanation:
        "寒冷的雨伴隨江水，在夜裏籠罩着吳地；天亮時送別友人，只見楚山孤零零地矗立着。洛陽的親友如果問起我的近況，就說我的心依然像玉壺中的冰一樣純潔清白。",
      annotations: [
        { term: "冰心", meaning: "比喻心地純潔清白" },
        { term: "玉壺", meaning: "玉製的壺，這裏比喻高潔的品格" },
      ],
      translation:
        "寒冷的雨伴隨江水，在夜裏籠罩着吳地；天亮時送別友人，只見楚山孤零零地矗立着。洛陽的親友如果問起我的近況，就說我的心依然像玉壺中的冰一樣純潔清白。",
      background:
        "王昌齡送別友人辛漸時所作，借「一片冰心在玉壺」表明自己雖遭誣陷貶謫，仍堅持清白高潔的操守。",
      meaningQuiz: "詩人借「冰心玉壺」表明自己品格清白高潔，不受外界誣衊影響。",
    },
    {
      id: "wang-tianmen-shan",
      type: "poem",
      title: "望天門山",
      author: "李白",
      dynasty: "唐",
      level: "p6",
      lines: [
        "天門中斷楚江開，",
        "碧水東流至此回。",
        "兩岸青山相對出，",
        "孤帆一片日邊來。",
      ],
      pinyin: [
        "Tiānmén zhōngduàn Chǔjiāng kāi，",
        "bìshuǐ dōng liú zhì cǐ huí。",
        "liǎng àn qīngshān xiāngduì chū，",
        "gū fān yí piàn rì biān lái。",
      ],
      explanation:
        "天門山被長江從中間衝斷，江水向東奔流到這裏又迴旋轉向。兩岸青翠的山峰相對聳立，一片孤帆從太陽升起的地方緩緩駛來。",
      annotations: [
        { term: "天門山", meaning: "位於安徽，長江兩岸相對的兩座山" },
        { term: "楚江", meaning: "長江流經古楚地的一段" },
      ],
      translation:
        "天門山被長江從中間衝斷，江水向東奔流到這裏又迴旋轉向。兩岸青翠的山峰相對聳立，一片孤帆從太陽升起的地方緩緩駛來。",
      background: "李白年輕時初次沿江東下，途經天門山所作，展現壯闊豪邁的氣勢。",
      meaningQuiz: "詩歌描寫長江衝開天門山、兩岸青山對峙的壯闊景象。",
    },
    {
      id: "zeng-wang-lun",
      type: "poem",
      title: "贈汪倫",
      author: "李白",
      dynasty: "唐",
      level: "p5",
      lines: [
        "李白乘舟將欲行，",
        "忽聞岸上踏歌聲。",
        "桃花潭水深千尺，",
        "不及汪倫送我情。",
      ],
      pinyin: [
        "Lǐ Bái chéng zhōu jiāng yù xíng，",
        "hū wén àn shàng tàgē shēng。",
        "Táohuā Tán shuǐ shēn qiān chǐ，",
        "bù jí Wāng Lún sòng wǒ qíng。",
      ],
      explanation:
        "李白坐船正要出發，忽然聽到岸上傳來踏步高歌的送別聲。桃花潭的水縱使有千尺深，也比不上汪倫送別我的情誼深厚。",
      annotations: [
        { term: "踏歌", meaning: "一邊唱歌一邊用腳踏地打拍子的送別方式" },
        { term: "桃花潭", meaning: "位於安徽的深潭" },
      ],
      translation:
        "李白坐船正要出發，忽然聽到岸上傳來踏步高歌的送別聲。桃花潭的水縱使有千尺深，也比不上汪倫送別我的情誼深厚。",
      background:
        "李白離開桃花潭時，友人汪倫踏歌相送，詩人即興寫下此詩答謝，以潭水之深比喻友情之深，成為千古傳誦的送別詩。",
      meaningQuiz: "詩人以桃花潭水之深比喻汪倫送別自己的情誼深厚。",
    },
    {
      id: "bie-dongda",
      type: "poem",
      title: "別董大",
      author: "高適",
      dynasty: "唐",
      level: "p6",
      lines: [
        "千里黃雲白日曛，",
        "北風吹雁雪紛紛。",
        "莫愁前路無知己，",
        "天下誰人不識君。",
      ],
      pinyin: [
        "Qiānlǐ huángyún bái rì xūn，",
        "běifēng chuī yàn xuě fēnfēn。",
        "mò chóu qiánlù wú zhījǐ，",
        "tiānxià shéi rén bù shí jūn。",
      ],
      explanation:
        "千里黃雲籠罩，太陽也顯得昏暗，北風吹送雁群，大雪紛紛飄落。不要擔心前路沒有知己，天下有誰不認識你呢？",
      annotations: [
        { term: "曛", meaning: "昏暗，這裏指日光昏黃" },
        { term: "知己", meaning: "互相了解、情誼深厚的朋友" },
      ],
      translation:
        "千里黃雲籠罩，太陽也顯得昏暗，北風吹送雁群，大雪紛紛飄落。不要擔心前路沒有知己，天下有誰不認識你呢？",
      background: "高適送別音樂家董庭蘭時所作，以豪邁的語氣勉勵友人，一掃離別的哀傷之情。",
      meaningQuiz: "詩人以豪邁的語氣勉勵友人，即使遠行也不用擔心沒有知己。",
    },
    {
      id: "liangzhou-ci-huanghe",
      type: "poem",
      title: "涼州詞（黃河遠上白雲間）",
      author: "王之渙",
      dynasty: "唐",
      level: "p6",
      lines: [
        "黃河遠上白雲間，",
        "一片孤城萬仞山。",
        "羌笛何須怨楊柳，",
        "春風不度玉門關。",
      ],
      pinyin: [
        "Huánghé yuǎn shàng báiyún jiān，",
        "yí piàn gūchéng wàn rèn shān。",
        "Qiāngdí héxū yuàn Yángliǔ，",
        "chūnfēng bú dù Yùmén Guān。",
      ],
      explanation:
        "黃河好像從白雲之間奔流而來，一座孤城矗立在萬仞高山之中。何必用羌笛吹奏哀怨的《折楊柳》曲調呢，春風本來就吹不到玉門關外。",
      annotations: [
        { term: "羌笛", jyutping: "koeng1 dek6", meaning: "古代羌族的一種笛子" },
        { term: "玉門關", meaning: "古代通往西域的重要關口" },
      ],
      translation:
        "黃河好像從白雲之間奔流而來，一座孤城矗立在萬仞高山之中。何必用羌笛吹奏哀怨的《折楊柳》曲調呢，春風本來就吹不到玉門關外。",
      background: "描寫戍守邊塞將士的孤寂與思鄉之情，意境蒼涼壯闊，是邊塞詩的代表作。",
      meaningQuiz: "詩歌描寫邊塞的荒涼壯闊，抒發戍邊將士的思鄉之情。",
    },
    {
      id: "jiangpan-dubu-xunhua",
      type: "poem",
      title: "江畔獨步尋花",
      author: "杜甫",
      dynasty: "唐",
      level: "p6",
      lines: [
        "黃四孃家花滿蹊，",
        "千朵萬朵壓枝低。",
        "留連戲蝶時時舞，",
        "自在嬌鶯恰恰啼。",
      ],
      pinyin: [
        "Huáng sì niáng jiā huā mǎn xī，",
        "qiān duǒ wàn duǒ yā zhī dī。",
        "liúlián xìdié shíshí wǔ，",
        "zìzài jiāoyīng qiàqià tí。",
      ],
      explanation:
        "黃四孃家門前的小路開滿了鮮花，千朵萬朵壓得枝條低垂。蝴蝶留戀花叢時時飛舞，自由自在的黃鶯恰好啼叫得十分動聽。",
      annotations: [
        { term: "蹊", jyutping: "hai4", meaning: "小路" },
        { term: "留連", meaning: "捨不得離開" },
      ],
      translation:
        "黃四孃家門前的小路開滿了鮮花，千朵萬朵壓得枝條低垂。蝴蝶留戀花叢時時飛舞，自由自在的黃鶯恰好啼叫得十分動聽。",
      background: "杜甫在成都草堂閒居時所作，描寫春日賞花的悠閒心情，畫面生動明快。",
      meaningQuiz: "詩歌描寫春日花叢中蝴蝶蜜蜂穿梭飛舞的生動景象。",
    },
    {
      id: "zhu-shi",
      type: "poem",
      title: "竹石",
      author: "鄭燮",
      dynasty: "清",
      level: "p6",
      lines: [
        "咬定青山不放鬆，",
        "立根原在破巖中。",
        "千磨萬擊還堅勁，",
        "任爾東西南北風。",
      ],
      pinyin: [
        "Yǎodìng qīngshān bú fàngsōng，",
        "lì gēn yuán zài pò yán zhōng。",
        "qiān mó wàn jī hái jiānjìng，",
        "rèn ěr dōngxī nánběi fēng。",
      ],
      explanation:
        "竹子咬緊青山，牢牢紮根，深植在破裂的巖石之中。經歷千萬次磨練打擊仍然堅勁不屈，任憑你從東西南北哪個方向吹來的狂風。",
      annotations: [
        { term: "堅勁", meaning: "堅強有力" },
        { term: "任爾", meaning: "任憑你" },
      ],
      translation:
        "竹子咬緊青山，牢牢紮根，深植在破裂的巖石之中。經歷千萬次磨練打擊仍然堅勁不屈，任憑你從東西南北哪個方向吹來的狂風。",
      background: "鄭燮（板橋）借竹石堅忍不拔的形象，寄託自己剛正不阿、不畏強權的品格。",
      meaningQuiz: "詩人借竹子紮根巖石、不畏風雨的形象，寄託堅毅不屈的品格。",
    },
    {
      id: "youyuan-buzhi",
      type: "poem",
      title: "遊園不值",
      author: "葉紹翁",
      dynasty: "宋",
      level: "p6",
      lines: [
        "應憐屐齒印蒼苔，",
        "小扣柴扉久不開。",
        "春色滿園關不住，",
        "一枝紅杏出牆來。",
      ],
      pinyin: [
        "Yīng lián jīchǐ yìn cāngtái，",
        "xiǎo kòu cháifēi jiǔ bù kāi。",
        "chūnsè mǎn yuán guān bú zhù，",
        "yī zhī hóng xìng chū qiáng lái。",
      ],
      explanation:
        "大概是愛惜木屐踩壞了滿地青苔，我輕輕敲打柴門，過了很久也沒有人來開。滿園的春色終究是關不住的，你看，一枝紅杏已經探出牆頭來了。",
      annotations: [
        { term: "屐齒", jyutping: "kek6 ci2", meaning: "木屐底下的齒狀凸起" },
        { term: "柴扉", meaning: "用木柴做成的簡陋門扉" },
      ],
      translation:
        "大概是愛惜木屐踩壞了滿地青苔，我輕輕敲打柴門，過了很久也沒有人來開。滿園的春色終究是關不住的，你看，一枝紅杏已經探出牆頭來了。",
      background:
        "詩人拜訪友人的花園卻無人應門，卻意外從探出牆頭的紅杏聯想到滿園春色，蘊含新事物終究無法被壓抑的哲理。",
      meaningQuiz: "詩歌借探出牆頭的紅杏，說明美好的事物是無法被關鎖、壓抑的。",
    },
    {
      id: "xiao-chu-jingci-si-song-linzifang",
      type: "poem",
      title: "曉出淨慈寺送林子方",
      author: "楊萬里",
      dynasty: "宋",
      level: "p6",
      lines: [
        "畢竟西湖六月中，",
        "風光不與四時同。",
        "接天蓮葉無窮碧，",
        "映日荷花別樣紅。",
      ],
      pinyin: [
        "Bìjìng xīhú liùyuè zhōng，",
        "fēngguāng bù yǔ sìshí tóng。",
        "jiē tiān liányè wúqióng bì，",
        "yìng rì héhuā biéyàng hóng。",
      ],
      explanation:
        "畢竟是六月裏的西湖，風光景色與其他季節截然不同。滿眼蓮葉與天相接，一片無邊無際的碧綠；映着陽光的荷花，顯得格外嬌艷紅。",
      annotations: [
        { term: "四時", meaning: "四季" },
        { term: "別樣", meaning: "特別，格外" },
      ],
      translation:
        "畢竟是六月裏的西湖，風光景色與其他季節截然不同。滿眼蓮葉與天相接，一片無邊無際的碧綠；映着陽光的荷花，顯得格外嬌艷紅。",
      background: "楊萬里送別友人林子方時所作，藉描寫六月西湖荷花的美景抒發惜別之情。",
      meaningQuiz: "詩歌描寫六月西湖荷葉連天、荷花艷紅的獨特美景。",
    },
    {
      id: "chunri",
      type: "poem",
      title: "春日",
      author: "朱熹",
      dynasty: "宋",
      level: "p6",
      lines: [
        "勝日尋芳泗水濱，",
        "無邊光景一時新。",
        "等閒識得東風面，",
        "萬紫千紅總是春。",
      ],
      pinyin: [
        "Shèngrì xún fāng Sìshuǐ bīn，",
        "wúbiān guāngjǐng yìshí xīn。",
        "děngxián shídé dōngfēng miàn，",
        "wànzǐ qiānhóng zǒng shì chūn。",
      ],
      explanation:
        "在風和日麗的日子裏，到泗水河邊賞花踏青，無邊無際的景色一時間都煥然一新。輕易間就認出了春風的面貌，萬紫千紅的景象都是春天的氣息。",
      annotations: [
        { term: "勝日", meaning: "風和日麗的好日子" },
        { term: "等閒", meaning: "隨意，輕易" },
      ],
      translation:
        "在風和日麗的日子裏，到泗水河邊賞花踏青，無邊無際的景色一時間都煥然一新。輕易間就認出了春風的面貌，萬紫千紅的景象都是春天的氣息。",
      background:
        "表面描寫春遊賞花，實際上「泗水」暗喻孔門聖賢之地，藉春景比喻探求聖賢學問後煥然一新的體會，是一首富含哲理的說理詩。",
      meaningQuiz: "詩歌借春日萬紫千紅的景象，比喻探求學問後煥然一新的體會。",
    },
    {
      id: "guanshu-yougan",
      type: "poem",
      title: "觀書有感（其一）",
      author: "朱熹",
      dynasty: "宋",
      level: "s1",
      lines: [
        "半畝方塘一鑑開，",
        "天光雲影共徘徊。",
        "問渠那得清如許，",
        "為有源頭活水來。",
      ],
      pinyin: [
        "Bàn mǔ fāng táng yí jiàn kāi，",
        "tiān guāng yún yǐng gòng páihuái。",
        "wèn qú nǎ dé qīng rú xǔ，",
        "wèi yǒu yuántóu huóshuǐ lái。",
      ],
      explanation:
        "半畝大小的方形池塘像一面鏡子般展開，天光雲影一起在水面上晃動。問這池塘為甚麼能夠這樣清澈，是因為有源頭活水不斷注入。",
      annotations: [
        { term: "鑑", jyutping: "gaam3", meaning: "鏡子" },
        { term: "渠", meaning: "它，這裏指池塘" },
      ],
      translation:
        "半畝大小的方形池塘像一面鏡子般展開，天光雲影一起在水面上晃動。問這池塘為甚麼能夠這樣清澈，是因為有源頭活水不斷注入。",
      background:
        "借方塘因活水而清澈的道理，比喻做學問必須不斷汲取新知識，才能保持思想的清明活潑，是說理詩的名篇。",
      meaningQuiz: "詩歌借池塘因源頭活水而清澈，比喻做學問要不斷汲取新知識。",
    },
    {
      id: "jiangnan-chun",
      type: "poem",
      title: "江南春",
      author: "杜牧",
      dynasty: "唐",
      level: "s1",
      lines: [
        "千里鶯啼綠映紅，",
        "水村山郭酒旗風。",
        "南朝四百八十寺，",
        "多少樓臺煙雨中。",
      ],
      pinyin: [
        "Qiānlǐ yīng tí lǜ yìng hóng，",
        "shuǐcūn shānguō jiǔqí fēng。",
        "Náncháo sìbǎi bāshí sì，",
        "duōshǎo lóutái yānyǔ zhōng。",
      ],
      explanation:
        "千里江南處處鶯歌燕舞，綠樹紅花相映；水邊村莊、依山的城郭，到處都有隨風飄揚的酒旗。南朝遺留下來的四百八十座寺廟，如今有多少樓台籠罩在濛濛煙雨之中。",
      annotations: [
        { term: "酒旗", meaning: "古代酒家掛在門前作招牌的旗幟" },
        { term: "樓臺", meaning: "樓閣亭臺，泛指建築物" },
      ],
      translation:
        "千里江南處處鶯歌燕舞，綠樹紅花相映；水邊村莊、依山的城郭，到處都有隨風飄揚的酒旗。南朝遺留下來的四百八十座寺廟，如今有多少樓台籠罩在濛濛煙雨之中。",
      background: "描寫江南春天秀麗風光的同時，也借南朝眾多寺廟感慨歷史興衰。",
      meaningQuiz: "詩歌描寫江南春天鶯歌燕舞的美景，並借南朝古寺感慨歷史的變遷。",
    },
    {
      id: "bo-chuan-guazhou",
      type: "poem",
      title: "泊船瓜洲",
      author: "王安石",
      dynasty: "宋",
      level: "p6",
      lines: [
        "京口瓜洲一水間，",
        "鍾山只隔數重山。",
        "春風又綠江南岸，",
        "明月何時照我還。",
      ],
      pinyin: [
        "Jīngkǒu Guāzhōu yì shuǐ jiān，",
        "Zhōngshān zhǐ gé shù chóng shān。",
        "chūnfēng yòu lǜ Jiāngnán àn，",
        "míngyuè hé shí zhào wǒ huán。",
      ],
      explanation:
        "京口和瓜洲之間只隔着一條江水，鍾山離這裏也只隔着幾重山巒。春風又一次吹綠了江南岸邊，明月甚麼時候才能照着我回到家鄉呢？",
      annotations: [
        { term: "京口", meaning: "位於江蘇鎮江的古地名" },
        { term: "鍾山", meaning: "位於南京的山，是王安石家鄉所在" },
      ],
      translation:
        "京口和瓜洲之間只隔着一條江水，鍾山離這裏也只隔着幾重山巒。春風又一次吹綠了江南岸邊，明月甚麼時候才能照着我回到家鄉呢？",
      background:
        "王安石乘船北上任官途中，眺望江南觸景生情，抒發思鄉之情，「春風又綠江南岸」的「綠」字用得傳神，歷來為人稱道。",
      meaningQuiz: "詩人乘船途中眺望江南春色，勾起思鄉之情，盼望早日歸家。",
    },
    {
      id: "jihai-zashi",
      type: "poem",
      title: "己亥雜詩（其五）",
      author: "龔自珍",
      dynasty: "清",
      level: "s1",
      lines: [
        "浩蕩離愁白日斜，",
        "吟鞭東指即天涯。",
        "落紅不是無情物，",
        "化作春泥更護花。",
      ],
      pinyin: [
        "Hàodàng líchóu bái rì xié，",
        "yín biān dōng zhǐ jí tiānyá。",
        "luòhóng bú shì wúqíng wù，",
        "huàzuò chūnní gèng hù huā。",
      ],
      explanation:
        "離別的愁緒像浩蕩江水般湧上心頭，此時夕陽正緩緩西斜。馬鞭一揮指向東方，便是遙遠的天涯路途。凋落的花瓣並不是無情之物，它化作春天的泥土，仍然更能滋養、保護新的花朵。",
      annotations: [
        { term: "浩蕩", meaning: "形容水勢盛大，這裏形容愁緒之深廣" },
        { term: "落紅", meaning: "凋落的花瓣" },
      ],
      translation:
        "離別的愁緒像浩蕩江水般湧上心頭，此時夕陽正緩緩西斜。馬鞭一揮指向東方，便是遙遠的天涯路途。凋落的花瓣並不是無情之物，它化作春天的泥土，仍然更能滋養、保護新的花朵。",
      background:
        "龔自珍辭官離京南歸時所作，借落花化作春泥仍護花的形象，表達即使離開仕途，仍願意繼續貢獻社會的心志。",
      meaningQuiz: "詩人借落花化作春泥仍護花，表達即使離開崗位仍願意貢獻社會的心志。",
    },

    // ---- 文言文（classical prose）— shorter extracts, extra explanation depth ----
    {
      id: "lunyu-xueer",
      type: "prose",
      title: "論語．學而篇（節錄）",
      author: "孔子及其弟子",
      dynasty: "春秋",
      level: "s1",
      lines: [
        "子曰：「學而時習之，不亦說乎？",
        "有朋自遠方來，不亦樂乎？",
        "人不知而不慍，不亦君子乎？」",
      ],
      lineExplanations: [
        "孔子說：「學習了知識，並且能夠時常温習、實踐它，不也是一件令人喜悅的事嗎？」——說明學習需要不斷温習才能真正掌握。",
        "「有志同道合的朋友從遠方來相聚，不也是一件快樂的事嗎？」——說明與朋友交流、切磋學問的快樂。",
        "「即使別人不了解自己，自己也不生氣、不怨恨，這不也是有德行的君子嗎？」——說明君子應有寬廣的胸襟，不計較別人的看法。",
      ],
      annotations: [
        { term: "時習", meaning: "時常温習、實踐" },
        { term: "慍", jyutping: "wan3", meaning: "生氣、怨恨" },
      ],
      background:
        "選自《論語》開篇，是孔子及其弟子的言行紀錄，教導做學問、待人接物的道理，是中國傳統經典的入門篇章。",
      meaningQuiz:
        "這段説明學習要温習實踐、與朋友交流是樂事、君子應不計較他人是否了解自己。",
    },
    {
      id: "loushi-ming",
      type: "prose",
      title: "陋室銘（節錄）",
      author: "劉禹錫",
      dynasty: "唐",
      level: "s1",
      lines: [
        "山不在高，有仙則名；",
        "水不在深，有龍則靈。",
        "斯是陋室，惟吾德馨。",
      ],
      lineExplanations: [
        "山不一定要高，只要有仙人居住，就會聞名於世；",
        "水不一定要深，只要有神龍潛藏，就會顯得靈驗。",
        "這裏雖然是簡陋的居室，但因為我的品德高尚芬芳，所以並不簡陋。",
      ],
      annotations: [
        { term: "馨", jyutping: "hing1", meaning: "香氣，這裏指德行的芬芳" },
        { term: "斯", meaning: "這" },
      ],
      background:
        "劉禹錫被貶官後所居的簡陋屋子所寫的銘文，借物言志，表達品德高尚就不畏環境簡陋的態度。",
      meaningQuiz: "文章借「山」「水」的比喻，説明只要品德高尚，居所簡陋也不足為意。",
    },
    {
      id: "mai-you-weng",
      type: "prose",
      title: "賣油翁（節錄）",
      author: "歐陽修",
      dynasty: "宋",
      level: "s1",
      lines: [
        "陳康肅公善射，當世無雙，公亦以此自矜。",
        "嘗射於家圃，有賣油翁釋擔而立，睨之，久而不去。",
        "見其發矢十中八九，但微頷之。",
      ],
      lineExplanations: [
        "陳堯咨擅長射箭，當時的人沒有誰能比得上他，他也因此而自負。",
        "有一次他在自家的園子裏射箭，有個賣油的老翁放下擔子站着，斜着眼看他，看了很久也不離開。",
        "老翁看見他射十箭能中八九箭，只是微微點了點頭（表示不太佩服）。",
      ],
      annotations: [
        { term: "矜", jyutping: "ging1", meaning: "自負，自誇" },
        { term: "頷", jyutping: "ham5", meaning: "下巴，這裏指點頭" },
        { term: "睨", jyutping: "ngai6", meaning: "斜眼看" },
      ],
      background:
        "記述賣油老翁以「熟能生巧」的道理，勸戒陳堯咨射箭雖準，但不應自滿，篇末以倒油入葫蘆而不沾濕錢孔的技藝作比喻。",
      meaningQuiz:
        "故事帶出「熟能生巧」的道理：技藝高超，是靠不斷練習得來的，不應自滿驕傲。",
    },
    {
      id: "ai-lian-shuo",
      type: "prose",
      title: "愛蓮說（節錄）",
      author: "周敦頤",
      dynasty: "宋",
      level: "s1",
      lines: [
        "予獨愛蓮之出淤泥而不染，濯清漣而不妖，",
        "中通外直，不蔓不枝，香遠益清，亭亭淨植，",
        "可遠觀而不可褻玩焉。",
      ],
      lineExplanations: [
        "我唯獨喜愛蓮花，它從污泥中生長出來卻不沾染污穢，經過清水洗滌卻不顯得妖艷。",
        "它的莖中間貫通、外表挺直，不生蔓藤也不長枝節，香氣越遠越顯得清幽，筆直潔淨地立在水中。",
        "只可以遠遠地觀賞，卻不可以輕慢地把玩它。",
      ],
      annotations: [
        { term: "淤泥", jyutping: "jyu1 nai4", meaning: "污濁的泥土" },
        { term: "濯", jyutping: "zok6", meaning: "洗滌" },
        { term: "漣", jyutping: "lin4", meaning: "水面的波紋" },
        { term: "褻玩", jyutping: "sit3 wun2", meaning: "輕慢地玩弄" },
      ],
      background:
        "周敦頤借讚美蓮花「出淤泥而不染」的特質，寄託君子品格高潔、不同流合污的志向。",
      meaningQuiz:
        "作者以蓮花比喻君子：身處污濁環境仍能保持高潔品格，不隨波逐流。",
    },
    {
      id: "ya-miao-zhu-zhang",
      type: "prose",
      title: "揠苗助長",
      author: "孟子",
      dynasty: "戰國",
      level: "p6",
      lines: [
        "宋人有閔其苗之不長而揠之者，",
        "芒芒然歸，謂其人曰：「今日病矣！予助苗長矣！」",
        "其子趨而往視之，苗則槁矣。",
      ],
      lineExplanations: [
        "宋國有個人擔心自己田裏的禾苗長得太慢，就把禾苗一棵棵拔高。",
        "他疲憊地回到家，對家人說：「今天累壞了！我幫助禾苗長高了！」",
        "他的兒子趕快跑到田裏去看，禾苗卻已經全部枯萎了。",
      ],
      annotations: [
        { term: "揠", jyutping: "aat3", meaning: "拔起，向上拉" },
        { term: "槁", jyutping: "gou2", meaning: "枯萎" },
      ],
      background:
        "出自《孟子》，借「拔苗助長」的寓言故事，諷刺違反事物發展規律、急於求成反而壞事的行為，是著名的成語故事。",
      meaningQuiz: "故事諷刺不顧規律、急於求成的人，最終只會把事情弄糟（欲速則不達）。",
    },
  ];

  const LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.POETRY_ITEMS = POETRY_ITEMS;
  window.App.Content.POETRY_LEVEL_LABEL = LEVEL_LABEL;
})();
