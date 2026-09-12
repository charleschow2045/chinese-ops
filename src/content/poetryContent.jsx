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

    // ---- Author-coverage expansion batch — 16 more poems + 2 more prose
    // pieces added after user review, to (a) add more representative works
    // by authors already in the file (李白/杜甫/蘇軾/王維) and (b) introduce
    // 3 major poets not yet covered at all (白居易/陶淵明/李商隱). Every
    // 原文 below was verified via WebSearch against multiple independent
    // sources before being written here — several also happened to match
    // Hong Kong Education Bureau (edb.gov.hk) recommended-passage PDFs
    // directly (月下獨酌其一, 水調歌頭, 賦得古原草送別, 夜雨寄北), a useful
    // independent confirmation of both textual accuracy and HK-curriculum
    // level-appropriateness. Not fabricated/recalled from memory, per this
    // project's no-fabrication rule for anything historical/factual.
    {
      id: "du-zuo-jingting-shan",
      type: "poem",
      title: "獨坐敬亭山",
      author: "李白",
      dynasty: "唐",
      level: "p6",
      lines: ["眾鳥高飛盡，", "孤雲獨去閒。", "相看兩不厭，", "只有敬亭山。"],
      pinyin: [
        "Zhòng niǎo gāo fēi jìn，",
        "gū yún dú qù xián。",
        "xiāng kàn liǎng bú yàn，",
        "zhǐ yǒu Jìngtíng Shān。",
      ],
      explanation:
        "群鳥高飛，消失得無影無蹤；一片孤雲也獨自悠閒地飄走了。我與敬亭山互相對望，彼此都不感到厭倦，此刻眼前只剩下這座敬亭山陪伴着我。",
      annotations: [
        { term: "盡", meaning: "消失，完了" },
        { term: "厭", meaning: "厭倦" },
      ],
      translation:
        "群鳥高飛，消失得無影無蹤；一片孤雲也獨自悠閒地飄走了。我與敬亭山互相對望，彼此都不感到厭倦，此刻眼前只剩下這座敬亭山陪伴着我。",
      background:
        "此詩作於李白晚年，當時他被讒言中傷、被迫離京已十年，飽經漂泊冷暖後寄情山水，借與敬亭山相看不厭，抒發孤獨中怡然自得的心境。",
      meaningQuiz: "詩人與敬亭山相看兩不厭，抒發孤獨漂泊中怡然自得的心境。",
    },
    {
      id: "yuexia-duzhuo-qiyi",
      type: "poem",
      title: "月下獨酌（其一）",
      author: "李白",
      dynasty: "唐",
      level: "s1",
      lines: [
        "花間一壺酒，",
        "獨酌無相親。",
        "舉杯邀明月，",
        "對影成三人。",
        "月既不解飲，",
        "影徒隨我身。",
        "暫伴月將影，",
        "行樂須及春。",
        "我歌月徘徊，",
        "我舞影零亂。",
        "醒時同交歡，",
        "醉後各分散。",
        "永結無情遊，",
        "相期邈雲漢。",
      ],
      pinyin: [
        "Huā jiān yí hú jiǔ，",
        "dú zhuó wú xiāng qīn。",
        "jǔ bēi yāo míng yuè，",
        "duì yǐng chéng sān rén。",
        "yuè jì bù jiě yǐn，",
        "yǐng tú suí wǒ shēn。",
        "zàn bàn yuè jiāng yǐng，",
        "xíng lè xū jí chūn。",
        "wǒ gē yuè páihuái，",
        "wǒ wǔ yǐng língluàn。",
        "xǐng shí tóng jiāo huān，",
        "zuì hòu gè fēn sàn。",
        "yǒng jié wú qíng yóu，",
        "xiāng qī miǎo Yúnhàn。",
      ],
      explanation:
        "在花叢之間擺上一壺美酒，獨自斟酌，身邊沒有相親相伴的人。舉起酒杯邀請天上的明月，加上自己的影子，正好湊成三人。明月不懂得飲酒的樂趣，影子也只是徒然跟隨着我的身軀。暫且伴着明月和身影，趁着春光及時行樂。我唱歌時，月亮彷彿隨着我徘徊；我起舞時，影子也散亂搖晃。清醒時我們一同歡樂，醉了以後便各自分散。願與明月、身影結下不受世俗牽絆的友誼，相約在遙遠的天河再會。",
      annotations: [
        { term: "獨酌", meaning: "獨自飲酒" },
        { term: "邈", jyutping: "miu5", meaning: "遙遠" },
        { term: "雲漢", meaning: "銀河，這裏指遙遠的天上" },
      ],
      translation:
        "在花叢之間擺上一壺美酒，獨自斟酌，身邊沒有相親相伴的人。舉起酒杯邀請天上的明月，加上自己的影子，正好湊成三人。明月不懂得飲酒的樂趣，影子也只是徒然跟隨着我的身軀。暫且伴着明月和身影，趁着春光及時行樂。我唱歌時，月亮彷彿隨着我徘徊；我起舞時，影子也散亂搖晃。清醒時我們一同歡樂，醉了以後便各自分散。願與明月、身影結下不受世俗牽絆的友誼，相約在遙遠的天河再會。",
      background:
        "李白於月夜獨自飲酒時所作《月下獨酌》組詩之一，想像明月與身影相伴，以奇特的想像排遣內心的孤寂，展現豪放飄逸而又寂寞的情懷，是這組詩中最著名的一首，香港教育局中國語文課程也曾將此詩列為建議篇章。",
      meaningQuiz: "詩人月夜獨飲，想像邀月共舞、與影為伴，以奇特想像排遣心中的寂寞。",
    },
    {
      id: "chunwang",
      type: "poem",
      title: "春望",
      author: "杜甫",
      dynasty: "唐",
      level: "s1",
      lines: [
        "國破山河在，",
        "城春草木深。",
        "感時花濺淚，",
        "恨別鳥驚心。",
        "烽火連三月，",
        "家書抵萬金。",
        "白頭搔更短，",
        "渾欲不勝簪。",
      ],
      pinyin: [
        "Guó pò shānhé zài，",
        "chéng chūn cǎomù shēn。",
        "gǎn shí huā jiàn lèi，",
        "hèn bié niǎo jīng xīn。",
        "fēnghuǒ lián sān yuè，",
        "jiāshū dǐ wàn jīn。",
        "báitóu sāo gèng duǎn，",
        "hún yù bù shèng zān。",
      ],
      explanation:
        "國都已經淪陷殘破，只有山河依舊；春天來到城中，草木長得特別茂密荒蕪。感傷時局，看見花開也不禁流淚；痛恨離別，聽見鳥鳴也心驚膽戰。戰火連續三個月不曾停息，一封家書竟然抵得上萬兩黃金那麼珍貴。愁緒滿懷，搔頭的白髮越搔越稀少，簡直連髮簪也插不住了。",
      annotations: [
        { term: "渾", meaning: "簡直，幾乎" },
        { term: "簪", jyutping: "zaam1", meaning: "古代用來綰住頭髮的飾物" },
      ],
      translation:
        "國都已經淪陷殘破，只有山河依舊；春天來到城中，草木長得特別茂密荒蕪。感傷時局，看見花開也不禁流淚；痛恨離別，聽見鳥鳴也心驚膽戰。戰火連續三個月不曾停息，一封家書竟然抵得上萬兩黃金那麼珍貴。愁緒滿懷，搔頭的白髮越搔越稀少，簡直連髮簪也插不住了。",
      background:
        "此詩作於唐肅宗至德二年（757年），安史之亂中長安淪陷，杜甫身陷城中，目睹國破家亡的慘況而作，抒發憂國憂民、思念家人的沉痛心情，是杜甫「詩史」風格的代表作之一。",
      meaningQuiz: "詩人目睹國都淪陷的慘況，感時傷別，並因久未收到家書而更添白髮。",
    },
    {
      id: "jiangnan-feng-li-guinian",
      type: "poem",
      title: "江南逢李龜年",
      author: "杜甫",
      dynasty: "唐",
      level: "s1",
      lines: [
        "岐王宅裏尋常見，",
        "崔九堂前幾度聞。",
        "正是江南好風景，",
        "落花時節又逢君。",
      ],
      pinyin: [
        "Qíwáng zhái lǐ xúncháng jiàn，",
        "Cuījiǔ táng qián jǐ dù wén。",
        "zhèng shì Jiāngnán hǎo fēngjǐng，",
        "luòhuā shíjié yòu féng jūn。",
      ],
      explanation:
        "當年在岐王的府邸裏，我常常見到你；也曾多次在崔九堂前，聽你歌唱。如今正是江南風景最美好的時節，卻在這落花紛飛的暮春，又與你重逢。",
      annotations: [
        { term: "岐王", meaning: "唐玄宗之弟，喜好文藝，李龜年常在其府中獻藝" },
        { term: "崔九", meaning: "指崔滌，唐玄宗寵臣" },
      ],
      translation:
        "當年在岐王的府邸裏，我常常見到你；也曾多次在崔九堂前，聽你歌唱。如今正是江南風景最美好的時節，卻在這落花紛飛的暮春，又與你重逢。",
      background:
        "此詩作於杜甫晚年（約770年），在江南偶遇曾經紅極一時的宮廷樂師李龜年，兩人皆歷經安史之亂後的衰落飄零，詩人借今昔對比，感慨盛世不再、人生滄桑，語言平淡卻蘊含無限感慨。",
      meaningQuiz: "詩人在江南重逢舊識的宮廷樂師，感慨盛世繁華不再、人生飄零滄桑。",
    },
    {
      id: "shuidiao-getou-mingyue-jieshi-you",
      type: "poem",
      title: "水調歌頭．明月幾時有（節錄）",
      author: "蘇軾",
      dynasty: "宋",
      level: "s1",
      lines: ["明月幾時有？", "把酒問青天。", "……", "但願人長久，", "千里共嬋娟。"],
      pinyin: [
        "Míngyuè jǐ shí yǒu？",
        "bǎ jiǔ wèn qīngtiān。",
        "……",
        "dàn yuàn rén cháng jiǔ，",
        "qiānlǐ gòng chánjuān。",
      ],
      explanation:
        "明月甚麼時候才會出現呢？我端起酒杯，向着青天發問。……只願世上人們都能平安長久，即使相隔千里，也能一同欣賞這美好的月色。",
      annotations: [
        { term: "把酒", meaning: "端起酒杯" },
        { term: "嬋娟", jyutping: "sim4 gyun1", meaning: "指美好的月色，也可用來形容美人" },
      ],
      translation:
        "明月甚麼時候才會出現呢？我端起酒杯，向着青天發問。……只願世上人們都能平安長久，即使相隔千里，也能一同欣賞這美好的月色。",
      background:
        "蘇軾於中秋夜大醉後所作，並懷念遠方的弟弟蘇轍（子由），全詞由問月起興，抒發人生離合無常的感慨，末以「但願人長久，千里共嬋娟」互相勉勵，是流傳千古的中秋詞代表作，香港教育局亦曾將全詞列為建議篇章。此處只節錄開首問月及末尾祝願的部分，中間省略了「不知天上宮闕」至「此事古難全」一段。",
      meaningQuiz: "詞人中秋望月，感慨人生離合無常，最後以「但願人長久，千里共嬋娟」互相勉勵祝福。",
    },
    {
      id: "fude-guyuan-caosong-bie",
      type: "poem",
      title: "賦得古原草送別",
      author: "白居易",
      dynasty: "唐",
      level: "p5",
      lines: [
        "離離原上草，",
        "一歲一枯榮。",
        "野火燒不盡，",
        "春風吹又生。",
        "遠芳侵古道，",
        "晴翠接荒城。",
        "又送王孫去，",
        "萋萋滿別情。",
      ],
      pinyin: [
        "Lílí yuán shàng cǎo，",
        "yí suì yí kū róng。",
        "yěhuǒ shāo bú jìn，",
        "chūnfēng chuī yòu shēng。",
        "yuǎn fāng qīn gǔdào，",
        "qíng cuì jiē huāngchéng。",
        "yòu sòng wángsūn qù，",
        "qīqī mǎn biéqíng。",
      ],
      explanation:
        "原野上的青草茂盛繁密，每年都經歷一次枯萎與繁榮。野火無法把它燒盡，春風一吹，它又重新生長起來。遠處的芳草蔓延，侵佔了古老的道路；晴日下翠綠的草色，一直連接到荒蕪的古城。我又一次在這裏送別友人遠行，茂盛的芳草彷彿也充滿了離別的情意。",
      annotations: [
        { term: "離離", meaning: "形容野草茂盛的樣子" },
        { term: "王孫", meaning: "原指貴族子孫，這裏借指遠行的友人" },
      ],
      translation:
        "原野上的青草茂盛繁密，每年都經歷一次枯萎與繁榮。野火無法把它燒盡，春風一吹，它又重新生長起來。遠處的芳草蔓延，侵佔了古老的道路；晴日下翠綠的草色，一直連接到荒蕪的古城。我又一次在這裏送別友人遠行，茂盛的芳草彷彿也充滿了離別的情意。",
      background:
        "相傳白居易十六歲應考習作，題目前須加「賦得」二字。詩借野草頑強的生命力，比喻送別友人時依依不捨、生生不息的情意，「野火燒不盡，春風吹又生」更成為千古傳誦的名句，是香港教育局建議篇章之一。",
      meaningQuiz: "詩人借野草雖遭野火焚燒仍能重生，比喻送別時依依不捨、綿延不絕的情意。",
    },
    {
      id: "chi-shang",
      type: "poem",
      title: "池上",
      author: "白居易",
      dynasty: "唐",
      level: "p5",
      lines: ["小娃撐小艇，", "偷採白蓮回。", "不解藏蹤跡，", "浮萍一道開。"],
      pinyin: [
        "Xiǎo wá chēng xiǎo tǐng，",
        "tōu cǎi báilián huí。",
        "bù jiě cáng zōngjì，",
        "fúpíng yí dào kāi。",
      ],
      explanation:
        "一個小孩撐着小船，偷偷地採了白蓮回來。他不懂得隱藏自己的行蹤，水面的浮萍被划出一條痕跡，清楚地敞開了。",
      annotations: [
        { term: "艇", meaning: "小船" },
        { term: "浮萍", meaning: "一種浮在水面的水生植物" },
      ],
      translation:
        "一個小孩撐着小船，偷偷地採了白蓮回來。他不懂得隱藏自己的行蹤，水面的浮萍被划出一條痕跡，清楚地敞開了。",
      background: "白居易描寫小孩偷採白蓮、天真爛漫卻又不懂掩藏行蹤的可愛情景，畫面生動有趣，充滿童趣。",
      meaningQuiz: "詩歌描寫小孩偷採白蓮後，因划開水面浮萍而露出行蹤的天真情景。",
    },
    {
      id: "yi-jiangnan",
      type: "poem",
      title: "憶江南",
      author: "白居易",
      dynasty: "唐",
      level: "p6",
      lines: ["江南好，", "風景舊曾諳。", "日出江花紅勝火，", "春來江水綠如藍。", "能不憶江南？"],
      pinyin: [
        "Jiāngnán hǎo，",
        "fēngjǐng jiù céng ān。",
        "rì chū jiānghuā hóng shèng huǒ，",
        "chūn lái jiāngshuǐ lǜ rú lán。",
        "néng bù yì Jiāngnán？",
      ],
      explanation:
        "江南是個好地方，那裏的風景，我從前就已經熟悉。太陽出來時，江邊的花朵比火焰還要紅艷；春天來臨時，江水如藍草般碧綠。這樣的江南，怎能讓人不常常思念呢？",
      annotations: [
        { term: "諳", jyutping: "am1", meaning: "熟悉" },
        { term: "藍", meaning: "這裏指藍草，一種可提取藍色染料的植物，比喻顏色濃綠" },
      ],
      translation:
        "江南是個好地方，那裏的風景，我從前就已經熟悉。太陽出來時，江邊的花朵比火焰還要紅艷；春天來臨時，江水如藍草般碧綠。這樣的江南，怎能讓人不常常思念呢？",
      background:
        "白居易晚年曾任杭州、蘇州刺史，對江南風光印象深刻，晚年回到洛陽後追憶江南美景而作此詞，是「憶江南」組詞三首中最著名的一首。",
      meaningQuiz: "詞人追憶江南的花紅水綠美景，表達對江南深切的懷念。",
    },
    {
      id: "zhu-li-guan",
      type: "poem",
      title: "竹里館",
      author: "王維",
      dynasty: "唐",
      level: "p6",
      lines: ["獨坐幽篁裏，", "彈琴復長嘯。", "深林人不知，", "明月來相照。"],
      pinyin: [
        "Dú zuò yōu huáng lǐ，",
        "tán qín fù cháng xiào。",
        "shēn lín rén bù zhī，",
        "míng yuè lái xiāng zhào。",
      ],
      explanation:
        "獨自坐在幽靜的竹林裏，一邊彈琴，一邊長聲呼嘯。深林之中沒有人知道我在這裏，只有天上的明月前來相伴照耀。",
      annotations: [
        { term: "幽篁", jyutping: "jau1 wong4", meaning: "幽靜深邃的竹林" },
        { term: "長嘯", meaning: "拉長聲音呼叫或吟嘯，古人抒發情懷的一種方式" },
      ],
      translation:
        "獨自坐在幽靜的竹林裏，一邊彈琴，一邊長聲呼嘯。深林之中沒有人知道我在這裏，只有天上的明月前來相伴照耀。",
      background:
        "選自王維《輞川集》，描寫詩人晚年隱居輞川時彈琴長嘯、與明月相伴的閒適心境，意境清幽脫俗，是山水田園詩的代表作。",
      meaningQuiz: "詩歌描寫詩人獨自在竹林彈琴長嘯，只有明月相伴的清幽閒適心境。",
    },
    {
      id: "lu-zhai",
      type: "poem",
      title: "鹿柴",
      author: "王維",
      dynasty: "唐",
      level: "p6",
      lines: ["空山不見人，", "但聞人語響。", "返景入深林，", "復照青苔上。"],
      pinyin: [
        "Kōng shān bú jiàn rén，",
        "dàn wén rén yǔ xiǎng。",
        "fǎn jǐng rù shēn lín，",
        "fù zhào qīngtái shàng。",
      ],
      explanation:
        "空寂的山中不見人影，只聽到有人說話的聲音迴響。夕陽的餘暉映入幽深的樹林，又照射在青翠的苔蘚上。",
      annotations: [
        { term: "返景", jyutping: "faan2 ging2", meaning: "夕陽反照的光" },
        { term: "青苔", meaning: "生長在陰濕地方的苔蘚植物" },
      ],
      translation:
        "空寂的山中不見人影，只聽到有人說話的聲音迴響。夕陽的餘暉映入幽深的樹林，又照射在青翠的苔蘚上。",
      background:
        "選自王維《輞川集》，以極簡的筆觸描寫空山寂靜中偶爾傳來的人聲，以及夕陽穿林照苔的光影變化，於靜中見動，展現「詩中有畫」的意境。",
      meaningQuiz: "詩歌以空山人語和夕陽照苔的光影，展現靜謐幽深的山林意境。",
    },
    {
      id: "yin-jiu-qiwu",
      type: "poem",
      title: "飲酒（其五）",
      author: "陶淵明",
      dynasty: "晉",
      level: "s1",
      lines: [
        "結廬在人境，",
        "而無車馬喧。",
        "問君何能爾？",
        "心遠地自偏。",
        "採菊東籬下，",
        "悠然見南山。",
        "山氣日夕佳，",
        "飛鳥相與還。",
        "此中有真意，",
        "欲辨已忘言。",
      ],
      pinyin: [
        "Jié lú zài rén jìng，",
        "ér wú chēmǎ xuān。",
        "wèn jūn hé néng ěr？",
        "xīn yuǎn dì zì piān。",
        "cǎi jú dōng lí xià，",
        "yōurán jiàn nánshān。",
        "shān qì rì xì jiā，",
        "fēiniǎo xiāng yǔ huán。",
        "cǐ zhōng yǒu zhēnyì，",
        "yù biàn yǐ wàng yán。",
      ],
      explanation:
        "把房屋建在人群聚居的地方，卻聽不到車馬的喧鬧聲。問我為甚麼能夠這樣，因為心境高遠，所住的地方自然變得偏僻清靜。在東邊的籬笆下採摘菊花，悠然自得地看見遠處的南山。山中的雲氣在黃昏時分格外美好，成群的飛鳥結伴歸巢。這當中蘊含着人生的真正意趣，想要辨明說清楚，卻已經忘記了如何用言語表達。",
      annotations: [
        { term: "爾", meaning: "這樣" },
        { term: "悠然", meaning: "悠閒自得的樣子" },
      ],
      translation:
        "把房屋建在人群聚居的地方，卻聽不到車馬的喧鬧聲。問我為甚麼能夠這樣，因為心境高遠，所住的地方自然變得偏僻清靜。在東邊的籬笆下採摘菊花，悠然自得地看見遠處的南山。山中的雲氣在黃昏時分格外美好，成群的飛鳥結伴歸巢。這當中蘊含着人生的真正意趣，想要辨明說清楚，卻已經忘記了如何用言語表達。",
      background:
        "陶淵明辭去官職、歸隱田園後所作《飲酒》組詩之一，抒發遠離塵囂、心境自然清靜的體會，「採菊東籬下，悠然見南山」是家喻戶曉的名句，展現詩人淡泊名利、回歸自然的人生態度。",
      meaningQuiz: "詩人歸隱田園後，體會到只要心境高遠，即使身處人境也能感到清靜安寧。",
    },
    {
      id: "gui-yuantian-ju-qisan",
      type: "poem",
      title: "歸園田居（其三）",
      author: "陶淵明",
      dynasty: "晉",
      level: "s1",
      lines: [
        "種豆南山下，",
        "草盛豆苗稀。",
        "晨興理荒穢，",
        "帶月荷鋤歸。",
        "道狹草木長，",
        "夕露沾我衣。",
        "衣沾不足惜，",
        "但使願無違。",
      ],
      pinyin: [
        "Zhòng dòu nánshān xià，",
        "cǎo shèng dòu miáo xī。",
        "chén xīng lǐ huānghuì，",
        "dài yuè hè chú guī。",
        "dào xiá cǎomù zhǎng，",
        "xī lù zhān wǒ yī。",
        "yī zhān bù zú xī，",
        "dàn shǐ yuàn wú wéi。",
      ],
      explanation:
        "在南山下種植豆子，雜草長得茂盛，豆苗卻十分稀疏。清晨早起清除田裏的雜草，直到夜幕降臨，才頂着月光扛着鋤頭回家。田間小路狹窄，草木長得很茂密，夜晚的露水沾濕了我的衣裳。衣裳被沾濕並不值得可惜，只要能夠不違背自己歸隱田園的心願就足夠了。",
      annotations: [
        { term: "荒穢", jyutping: "fong1 wai3", meaning: "荒蕪雜亂的雜草" },
        { term: "荷鋤", meaning: "扛着鋤頭" },
      ],
      translation:
        "在南山下種植豆子，雜草長得茂盛，豆苗卻十分稀疏。清晨早起清除田裏的雜草，直到夜幕降臨，才頂着月光扛着鋤頭回家。田間小路狹窄，草木長得很茂密，夜晚的露水沾濕了我的衣裳。衣裳被沾濕並不值得可惜，只要能夠不違背自己歸隱田園的心願就足夠了。",
      background:
        "陶淵明辭官歸隱後親自耕種的生活寫照，記述早出晚歸、辛勤耕作的日常，末句「衣沾不足惜，但使願無違」表明即使生活艱苦，仍甘之如飴，堅持歸隱田園、不與世俗同流的心志。",
      meaningQuiz: "詩人記述親自耕種的辛勞生活，表明即使艱苦，仍甘願堅持歸隱田園的心志。",
    },
    {
      id: "ye-yu-ji-bei",
      type: "poem",
      title: "夜雨寄北",
      author: "李商隱",
      dynasty: "唐",
      level: "p6",
      lines: ["君問歸期未有期，", "巴山夜雨漲秋池。", "何當共剪西窗燭，", "卻話巴山夜雨時。"],
      pinyin: [
        "Jūn wèn guī qī wèi yǒu qī，",
        "Bāshān yè yǔ zhǎng qiū chí。",
        "hé dāng gòng jiǎn xīchuāng zhú，",
        "què huà Bāshān yè yǔ shí。",
      ],
      explanation:
        "你問我甚麼時候回家，我卻沒有確定的歸期；此刻巴山下着夜雨，秋天的池塘水位都漲滿了。甚麼時候才能與你一起在西窗下剪去燭花，一邊回頭訴說此刻巴山夜雨時的心情呢？",
      annotations: [
        { term: "巴山", meaning: "泛指四川一帶的山" },
        { term: "剪燭", meaning: "剪去燒焦的燭芯，使燭光更明亮，比喻夜裏秉燭長談" },
      ],
      translation:
        "你問我甚麼時候回家，我卻沒有確定的歸期；此刻巴山下着夜雨，秋天的池塘水位都漲滿了。甚麼時候才能與你一起在西窗下剪去燭花，一邊回頭訴說此刻巴山夜雨時的心情呢？",
      background:
        "李商隱身處巴蜀，寫詩寄給遠方的親人（一說妻子），以眼前巴山夜雨的實景，想像日後重逢時剪燭夜談的情景，虛實交錯，情意深長，是抒發羈旅思念之情的名篇，香港教育局的小學古詩文誦讀材料亦有收錄。",
      meaningQuiz: "詩人身處異鄉，借眼前夜雨想像日後與親人重逢夜談的情景，抒發思念之情。",
    },
    {
      id: "le-you-yuan",
      type: "poem",
      title: "樂遊原",
      author: "李商隱",
      dynasty: "唐",
      level: "p6",
      lines: ["向晚意不適，", "驅車登古原。", "夕陽無限好，", "只是近黃昏。"],
      pinyin: [
        "Xiàng wǎn yì bú shì，",
        "qū chē dēng gǔyuán。",
        "xīyáng wúxiàn hǎo，",
        "zhǐshì jìn huánghūn。",
      ],
      explanation:
        "傍晚時分心情有點不舒暢，於是駕車登上古老的樂遊原。眼前的夕陽景色無限美好，只可惜已經接近黃昏時分了。",
      annotations: [
        { term: "意不適", meaning: "心情不舒暢" },
        { term: "樂遊原", meaning: "位於長安城南的高地，是唐代著名的登高遊覽勝地" },
      ],
      translation:
        "傍晚時分心情有點不舒暢，於是駕車登上古老的樂遊原。眼前的夕陽景色無限美好，只可惜已經接近黃昏時分了。",
      background:
        "李商隱心情鬱悶時登上樂遊原，眼前夕陽雖然無限美好，卻感慨美景將盡、好景不常，「夕陽無限好，只是近黃昏」成為千古傳誦的名句，蘊含對美好事物短暫易逝的深刻感悟。",
      meaningQuiz: "詩人登高望見夕陽美景，卻感慨美好的事物即將消逝，蘊含深刻的人生感悟。",
    },
    {
      id: "chang-e",
      type: "poem",
      title: "嫦娥",
      author: "李商隱",
      dynasty: "唐",
      level: "s1",
      lines: ["雲母屏風燭影深，", "長河漸落曉星沉。", "嫦娥應悔偷靈藥，", "碧海青天夜夜心。"],
      pinyin: [
        "Yúnmǔ píngfēng zhú yǐng shēn，",
        "Chánghé jiàn luò xiǎoxīng chén。",
        "Cháng'é yīng huǐ tōu língyào，",
        "bìhǎi qīngtiān yèyè xīn。",
      ],
      explanation:
        "雲母屏風上燭光的影子漸漸暗淡，銀河慢慢西沉，拂曉的星星也隨之隱沒。嫦娥應該後悔當初偷吃了長生不老的靈藥，如今獨自面對碧海青天，夜夜懷着孤寂的心情。",
      annotations: [
        { term: "雲母屏風", jyutping: "wan4 mou5", meaning: "用雲母（一種礦物）鑲嵌裝飾的屏風" },
        { term: "長河", meaning: "指銀河" },
      ],
      translation:
        "雲母屏風上燭光的影子漸漸暗淡，銀河慢慢西沉，拂曉的星星也隨之隱沒。嫦娥應該後悔當初偷吃了長生不老的靈藥，如今獨自面對碧海青天，夜夜懷着孤寂的心情。",
      background:
        "李商隱借嫦娥奔月後獨居廣寒宮、夜夜孤寂的傳說，抒發自身孤高而寂寞的心境，詩中「嫦娥應悔偷靈藥」一句意蘊豐富，歷來有多種解讀，或寄託對理想與現實矛盾的感慨。",
      meaningQuiz: "詩人借嫦娥奔月後夜夜孤寂的傳說，抒發自身孤高寂寞、進退兩難的心境。",
    },
    {
      id: "wuti-xiangjian-shinan",
      type: "poem",
      title: "無題（相見時難別亦難）",
      author: "李商隱",
      dynasty: "唐",
      level: "s1",
      lines: [
        "相見時難別亦難，",
        "東風無力百花殘。",
        "春蠶到死絲方盡，",
        "蠟炬成灰淚始乾。",
        "曉鏡但愁雲鬢改，",
        "夜吟應覺月光寒。",
        "蓬山此去無多路，",
        "青鳥殷勤為探看。",
      ],
      pinyin: [
        "Xiāng jiàn shí nán bié yì nán，",
        "dōngfēng wú lì bǎihuā cán。",
        "chūncán dào sǐ sī fāng jìn，",
        "làjù chéng huī lèi shǐ gān。",
        "xiǎo jìng dàn chóu yúnbìn gǎi，",
        "yè yín yīng jué yuèguāng hán。",
        "Péngshān cǐ qù wú duō lù，",
        "qīngniǎo yīnqín wèi tàn kàn。",
      ],
      explanation:
        "相見的機會難得，分別時更加難捨難分，暮春時節東風無力，百花都已凋殘。春蠶要到死去的那一刻，才會把絲吐盡；蠟燭要燃燒成灰燼，燭淚才會流乾，比喻至死不渝的深情。清晨對鏡梳妝，只擔憂鬢髮已經斑白改變；夜裏吟詩，應該會感覺到月光的寒冷。從這裏去蓬萊仙山，並沒有多遠的路程，希望青鳥能殷勤地替我前去探望。",
      annotations: [
        { term: "絲方盡", meaning: "「絲」諧音「思」，比喻思念至死方休" },
        { term: "青鳥", meaning: "神話中西王母的使者，這裏比喻傳遞消息的使者" },
      ],
      translation:
        "相見的機會難得，分別時更加難捨難分，暮春時節東風無力，百花都已凋殘。春蠶要到死去的那一刻，才會把絲吐盡；蠟燭要燃燒成灰燼，燭淚才會流乾，比喻至死不渝的深情。清晨對鏡梳妝，只擔憂鬢髮已經斑白改變；夜裏吟詩，應該會感覺到月光的寒冷。從這裏去蓬萊仙山，並沒有多遠的路程，希望青鳥能殷勤地替我前去探望。",
      background:
        "李商隱著名的愛情詩之一，以「春蠶到死絲方盡，蠟炬成灰淚始乾」比喻至死不渝的深情，成為千古傳誦的名句，全詩纏綿悱惻，借相思之苦抒發對理想與愛情堅貞執着的追求。",
      meaningQuiz: "詩人以春蠶吐絲、蠟炬成灰比喻至死不渝的深情，抒發刻骨銘心的相思之苦。",
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
    {
      id: "ji-chengtiansi-yeyou",
      type: "prose",
      title: "記承天寺夜遊",
      author: "蘇軾",
      dynasty: "宋",
      level: "s1",
      lines: [
        "元豐六年十月十二日夜，解衣欲睡，月色入戶，欣然起行。",
        "念無與為樂者，遂至承天寺尋張懷民。懷民亦未寢，相與步於中庭。",
        "庭下如積水空明，水中藻荇交橫，蓋竹柏影也。",
        "何夜無月？何處無竹柏？但少閒人如吾兩人者耳。",
      ],
      lineExplanations: [
        "元豐六年十月十二日夜晚，我脫下衣服正想睡覺，這時月光照進門內，我高興地起身出門走走。",
        "想到沒有可以一同遊樂的人，於是前往承天寺尋找張懷民。懷民也還沒有睡覺，我們便一起在庭院中散步。",
        "庭院中的月光就像積水般清澈透明，水中彷彿有水藻、荇菜交錯縱橫，原來那是竹子和柏樹的影子。",
        "哪一個夜晚沒有月光？哪個地方沒有竹子和柏樹？只是缺少像我們兩人這樣清閒的人罷了。",
      ],
      annotations: [
        { term: "念", meaning: "想到，考慮" },
        { term: "藻荇", jyutping: "zou2 hang6", meaning: "水草名，這裏比喻月光下竹柏的影子" },
        { term: "閒人", meaning: "清閒的人，這裏指不汲汲於名利、能欣賞眼前美景的人" },
      ],
      background:
        "蘇軾被貶謫至黃州時所作，記述與同樣被貶的友人張懷民月夜同遊承天寺的情景，以「積水空明」比喻月色、以竹柏影比喻水中藻荇，末段以「閒人」自嘲兼自豪，蘊含身處逆境仍能自得其樂的曠達胸懷。",
      meaningQuiz: "文章借月夜庭院美景，抒發作者身處逆境仍能隨遇而安、自得其樂的曠達心境。",
    },
    {
      id: "taohua-yuan-ji-jielu",
      type: "prose",
      title: "桃花源記（節錄）",
      author: "陶淵明",
      dynasty: "晉",
      level: "s1",
      lines: [
        "林盡水源，便得一山，山有小口，彷彿若有光。",
        "便捨船，從口入。初極狹，纔通人。復行數十步，豁然開朗。",
        "土地平曠，屋舍儼然，有良田美池桑竹之屬。阡陌交通，雞犬相聞。",
        "其中往來種作，男女衣著，悉如外人。黃髮垂髫，並怡然自樂。",
      ],
      lineExplanations: [
        "桃林的盡頭就是溪水的源頭，漁人於是看見一座山，山上有個小洞口，隱約好像有光線透出。",
        "漁人便捨棄了船，從洞口走進去。起初洞口十分狹窄，僅僅能容一人通過。又走了幾十步，眼前忽然變得開闊明亮。",
        "只見土地平坦寬廣，房屋整齊有序，還有肥沃的田地、美麗的池塘，以及桑樹、竹林之類的植物。田間小路交錯相通，雞鳴狗吠的聲音都能互相聽見。",
        "村裏的人來來往往耕田勞作，男女的穿着打扮，都和外面的人一樣。無論老人或小孩，都顯得安閒快樂。",
      ],
      annotations: [
        { term: "豁然開朗", meaning: "形容由狹窄陰暗忽然變得開闊明亮" },
        { term: "阡陌", jyutping: "cin1 mak6", meaning: "田間縱橫交錯的小路" },
        { term: "黃髮垂髫", meaning: "分別指老人和小孩（老人髮白轉黃，小孩頭髮下垂）" },
      ],
      background:
        "節錄自陶淵明《桃花源記》，記述漁人偶然發現與世隔絕的桃花源，村民生活安樂、與世無爭，寄託作者對理想社會的嚮往，是描寫「烏托邦」理想境界的經典名篇。",
      meaningQuiz: "文章描寫漁人發現的桃花源土地平曠、村民安居樂業，寄託作者對理想社會的嚮往。",
    },
  ];

  const LEVEL_LABEL = { p5: "小五", p6: "小六", s1: "中一" };

  window.App.Content.POETRY_ITEMS = POETRY_ITEMS;
  window.App.Content.POETRY_LEVEL_LABEL = LEVEL_LABEL;
})();
