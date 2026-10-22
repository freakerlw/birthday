/* ============================================================
 * content.js —— 全站唯一的内容来源
 * 所有文案、照片路径都写在这里；index.html / main.js 不写死任何内容。
 * 直接赋值 window.CONTENT 是为了兼容 file:// 双击打开（fetch 会被 CORS 拦截）。
 * ============================================================ */
window.CONTENT = {
  /* 她的名字 / 昵称 */
  herName: "王欣瑜",
  /* 生日日期（会同步进浏览器标题） */
  birthdayLabel: "9 月 14 日",
  /* hero 主标语，一句话 */
  heroTagline: "老婆，生日快乐。这一年，我们相识、结婚，一起去旅行，也有过争吵，有些时候没能照顾好你的感受，让你受了委屈。新的一岁，愿你想要的都慢慢抵达；我也会学着多听你说、多理解你，把对你的爱放进每天的小事里，让你在我身边更安心、更开心",

  /* 各段的小标题 */
  labels: {
    gallery: "照片墙",
    gallerySub: "从第一张合照开始，一直到现在",
    timeline: "我们的时间线",
    letter: "写给你",
    wishes: "要陪你做完的清单",
    surprise: "还有一个惊喜",
    giftHint: "礼物线索",
  },

  /* 照片墙：一条纵贯的时间线横滑带 —— 36 张严格按时间正序排到底
   * photos[].src     以 content.js 所在目录为基准的相对路径
   * photos[].alt     必填，写出画面内容（读屏与加载失败时都会用到）
   * photos[].caption 图注，跟随中心那张切换；同一地点的写法前后保持一致
   * photos[].ratio   可选，"4 / 3" 或 "3 / 4"，用于撑开占位、避免布局抖动
   */
  gallery: {
    photos: [
      { src: "assets/photos/flower-wreath-v-sign.jpg", caption: "我们俩的第一张合照", alt: "我们俩的第一张合照，站在彩色花环雕塑前比耶", ratio: "3 / 4" },
      { src: "assets/photos/lake-boat-v-sign.jpg", caption: "两家人第一次一起出游", alt: "游船上两家人一起出游，她坐在船头比耶", ratio: "3 / 4" },
      { src: "assets/photos/wedding-red.jpg", caption: "婚纱照", alt: "影棚红裙婚纱照，她坐在红木椅上，我穿黑西装站在左侧", ratio: "2 / 3" },
      { src: "assets/photos/bridal-bouquet.jpg", caption: "拍完婚纱照，手机拍的", alt: "拍完婚纱照后我用手机拍的，她低头捧着白色花束", ratio: "4 / 5" },
      { src: "assets/photos/seaside-golden-hour.jpg", caption: "婚纱照", alt: "海边夕阳下的婚纱照，她侧脸抱着花束", ratio: "2 / 3" },
      { src: "assets/photos/wedding-parents.jpg", caption: "婚礼那天 · 全家福", alt: "婚礼当天与双方父母在喜字墙前合影，桌上摆着苹果香蕉", ratio: "3 / 2" },
      { src: "assets/photos/bell-tower-polo.jpg", caption: "第一次一起旅行 · 路过西安", alt: "西安钟楼夜景前，我们穿条纹上衣的合影", ratio: "2 / 3" },
      { src: "assets/photos/bell-tower-fan.jpg", caption: "西安 · 钟楼夜色", alt: "西安钟楼夜色里，她举着写有「长安」的折扇", ratio: "2 / 3" },
      { src: "assets/photos/night-market-snack.jpg", caption: "西宁 · 夜市", alt: "西宁夜市档口自拍，她手里拿着饼，画面有手绘贴纸", ratio: "3 / 4" },
      { src: "assets/photos/temple-stupa-plaque.jpg", caption: "塔尔寺", alt: "塔尔寺白塔与石碑前，她披着蓝色披肩张开手", ratio: "792 / 1038" },
      { src: "assets/photos/temple-stupa-selfie.jpg", caption: "塔尔寺", alt: "塔尔寺白塔前的自拍，我们靠在一起", ratio: "3 / 4" },
      { src: "assets/photos/prayer-wheel-corridor.jpg", caption: "塔尔寺 · 转经筒", alt: "塔尔寺转经筒长廊，她伸手去转经筒", ratio: "929 / 1200" },
      { src: "assets/photos/prayer-flags-lamb.jpg", caption: "日月山 · 经幡", alt: "日月山经幡前，她抱着小羊", ratio: "754 / 1200" },
      { src: "assets/photos/prayer-flags-tower.jpg", caption: "日月山 · 经幡", alt: "日月山经幡塔前的草地上，她比了个手势", ratio: "9 / 16" },
      { src: "assets/photos/salt-lake-selfie.jpg", caption: "翡翠湖", alt: "翡翠湖边的草地自拍，草帽墨镜，画面有猫咪贴纸", ratio: "3 / 4" },
      { src: "assets/photos/salt-lake-water.jpg", caption: "翡翠湖", alt: "翡翠湖水边，她穿着米黄毛衣向水面伸手", ratio: "3 / 4" },
      { src: "assets/photos/salt-lake-profile.jpg", caption: "翡翠湖", alt: "翡翠湖边侧身背影，黄毛衣与草编包", ratio: "3 / 4" },
      { src: "assets/photos/salt-lake-straw-hat.jpg", caption: "翡翠湖", alt: "翡翠湖水边，她抱着草帽，耳饰被风吹起", ratio: "3 / 4" },
      { src: "assets/photos/desert-blue-hood.jpg", caption: "黑独山", alt: "黑独山下，她裹着蓝色连帽披肩侧脸望向远处", ratio: "9 / 16" },
      { src: "assets/photos/gobi-road-arms-open.jpg", caption: "U 型公路", alt: "U 型公路上她张开双臂，草帽与绿色上衣", ratio: "9 / 16" },
      { src: "assets/photos/desert-road-lookback.jpg", caption: "U 型公路", alt: "U 型公路边侧身回头，绿色上衣与碎花裙", ratio: "9 / 16" },
      { src: "assets/photos/mars-avenue-sign.jpg", caption: "大柴旦 · 红崖", alt: "火星大道路牌下，她抱着手臂站着", ratio: "9 / 16" },
      { src: "assets/photos/dune-sunset-hat.jpg", caption: "敦煌 · 鸣沙山", alt: "鸣沙山日落，她戴牛仔帽站在沙丘前", ratio: "9 / 16" },
      { src: "assets/photos/temple-golden-buddha.jpg", caption: "敦煌 · 丝绸遗产城", alt: "敦煌丝绸遗产城的金色佛像前，她侧脸仰头", ratio: "9 / 16" },
      { src: "assets/photos/danxia-viewpoint.jpg", caption: "张掖 · 七彩丹霞", alt: "张掖七彩丹霞观景台上，她张开一只手，身后是赭红色山体", ratio: "9 / 16" },
      { src: "assets/photos/prayer-flags-selfie.jpg", caption: "祁连山 · 草原经幡", alt: "祁连山草原经幡前的自拍，她戴着白色毛边帽", ratio: "9 / 16" },
      { src: "assets/photos/tibetan-town-dusk.jpg", caption: "祁连山 · 9 号公路", alt: "祁连山 9 号网红公路旁的镇子上，她披着蓝色披肩，身后是雪山", ratio: "9 / 16" },
      { src: "assets/photos/bund-night.jpg", caption: "上海 · 出差路过", alt: "上海外滩夜景，她站在钟楼建筑前", ratio: "9 / 16" },
      { src: "assets/photos/mall-mirror-selfie.jpg", caption: "上海 · 出差路过", alt: "上海商场里对镜自拍，我们俩都戴着墨镜", ratio: "9 / 16" },
      { src: "assets/photos/riverside-night-dress.jpg", caption: "南通 · 第一次出差", alt: "南通夜晚的河边栏杆旁，她穿黑色碎花连衣裙", ratio: "3 / 4" },
      { src: "assets/photos/gallery-poster-wall.jpg", caption: "南通 · 第二次出差", alt: "南通展馆海报墙前，她穿绿色露肩上衣", ratio: "9 / 16" },
      { src: "assets/photos/white-wall-green.jpg", caption: "南通 · 第二次出差", alt: "白墙前，她穿绿色上衣，手扶额头", ratio: "9 / 16" },
      { src: "assets/photos/garden-path-lilac.jpg", caption: "大理", alt: "大理的花园小径，她穿紫色外套，两侧是蓝花与红草", ratio: "9 / 16" },
      { src: "assets/photos/riverside-reeds.jpg", caption: "大理", alt: "大理江边芦苇旁，她穿紫色外套手拿咖啡", ratio: "9 / 16" },
      { src: "assets/photos/ping-an-joy-wall.jpg", caption: "大理", alt: "大理「平安喜乐」红墙前，她张开双臂", ratio: "9 / 16" },
      { src: "assets/photos/pink-flower-deck.jpg", caption: "大理", alt: "大理粉色花丛前，她坐在木栈道上", ratio: "9 / 16" },
    ],
  },

  /* 时间线：四个节点，只说阶段，不写年份和日期 */
  timeline: [
    { date: "开始", text: "我们的第一张合照，和两家人第一次一起出门" },
    { date: "婚礼", text: "婚纱照、那天你用手机拍的那张，还有全家福" },
    { date: "第一次一起旅行", text: "从西安一路到祁连，绕了大西北一整圈" },
    { date: "之后的日子", text: "上海与南通的出差，还有大理的风" },
  ],

  /* 信：每个元素是一段 */
  letterParagraphs: [
    "亲爱的，写这封信之前我想了很久，最后发现想说的其实只有一句：谢谢你一直在。",
    "谢谢你在我笨拙的时候没有走开，在我沉默的时候愿意等，在我开心的时候比我更开心。",
    "这一年我们都辛苦了。愿你想做的事都顺利，想见的人都能见到，想休息的时候可以安心休息。",
    "生日快乐。往后的每一年，我都想在。",
  ],

  /* 要陪你做完的清单：groups[].title 是分组小标题，items 是逐条标签文案
   * 文案保持原样，不加修饰词 */
  wishlist: [
    {
      title: "想带你吃的",
      items: ["鸡", "鱼", "海鲜", "鹅", "肥肠", "肠粉", "皮皮虾", "苹果", "天山雪莲果"],
    },
    {
      title: "想陪你喝的",
      items: ["手工酸奶", "水"],
    },
    {
      title: "想和你一起疯的",
      items: ["滑雪", "蹦极", "跳伞", "酒吧"],
    },
    {
      title: "想带你去的",
      items: ["大连", "哈尔滨"],
    },
    {
      title: "想慢慢实现的",
      items: ["一栋带院子的小楼", "白水晶浴缸", "宝格丽住一晚"],
    },
  ],

  /* 点击后才会出现的内容 */
  surprise: {
    buttonLabel: "点开看看",
    message: "其实礼物已经准备好了，只是还想先跟你说一句：今天你最大，什么都不用做。",
    giftHint: "线索：去我们第一次一起吃饭的那家店，问问老板「老位置」。（占位，待替换）",
  },

  /* 页脚署名 */
  footerSign: "永远爱你的 · 我",

  /* 音乐：src 留空则整个音乐按钮不渲染 */
  music: {
    src: "",
    label: "播放音乐",
  },
};
