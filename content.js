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
  heroTagline: "生日快乐。愿这一年，你被温柔以待，想要的都慢慢抵达。",

  /* 各段的小标题 */
  labels: {
    gallery: "照片墙",
    timeline: "我们的时间线",
    letter: "写给你",
    wishes: "要陪你做完的清单",
    surprise: "还有一个惊喜",
    giftHint: "礼物线索",
  },

  /* 照片墙：可自由增删分组与照片
   * photos[].src   以 content.js 所在目录为基准的相对路径
   * photos[].alt   必填，读屏与加载失败时都会用到
   * photos[].ratio 可选，"4 / 3" 或 "3 / 4"，用于撑开占位、避免布局抖动
   */
  galleryGroups: [
    {
      title: "婚礼那天",
      photos: [
        { src: "assets/photos/wedding-red.jpg", alt: "中式红裙婚纱照：她坐在红木椅上，我穿黑西装站在左侧", ratio: "2 / 3" },
        { src: "assets/photos/wedding-parents.jpg", alt: "婚礼当天和双方父母在喜字墙前合影，红桌上摆着苹果和香蕉", ratio: "3 / 2" },
        { src: "assets/photos/bridal-bouquet.jpg", alt: "室内柔光里，她低头捧着白色花束的侧脸", ratio: "4 / 5" },
        { src: "assets/photos/seaside-golden-hour.jpg", alt: "海边夕阳下，她别着蝴蝶发饰、穿粉色礼服抱着花束的侧脸", ratio: "2 / 3" },
      ],
    },
    {
      title: "西安与钟楼",
      photos: [
        { src: "assets/photos/bell-tower-polo.jpg", alt: "西安钟楼夜景前，我们穿着条纹 polo 衫的合影", ratio: "2 / 3" },
        { src: "assets/photos/bell-tower-fan.jpg", alt: "钟楼夜景前，她举着写有「长安」的折扇", ratio: "2 / 3" },
      ],
    },
    {
      title: "青海：寺庙与经幡",
      photos: [
        { src: "assets/photos/temple-golden-buddha.jpg", alt: "塔尔寺金色佛像前，她侧脸仰头，日光很亮", ratio: "9 / 16" },
        { src: "assets/photos/temple-stupa-plaque.jpg", alt: "塔尔寺白塔与石碑前，她披着蓝色披肩张开双手", ratio: "792 / 1038" },
        { src: "assets/photos/temple-stupa-selfie.jpg", alt: "塔尔寺白塔前的自拍，我们俩靠在一起", ratio: "3 / 4" },
        { src: "assets/photos/prayer-wheel-corridor.jpg", alt: "塔尔寺转经筒长廊里，她伸手去转经筒", ratio: "929 / 1200" },
        { src: "assets/photos/prayer-flags-lamb.jpg", alt: "经幡前，她戴着牛仔帽低头抱着一只小羊", ratio: "754 / 1200" },
        { src: "assets/photos/prayer-flags-tower.jpg", alt: "草原上的经幡塔前，她披着蓝色披肩比耶，风很大", ratio: "9 / 16" },
        { src: "assets/photos/prayer-flags-selfie.jpg", alt: "经幡前的合影自拍，她戴着白色毛边帽", ratio: "9 / 16" },
        { src: "assets/photos/lake-boat-v-sign.jpg", alt: "青海湖游船船头，她比着耶，身后家人举着手", ratio: "3 / 4" },
        { src: "assets/photos/tibetan-town-dusk.jpg", alt: "藏族小镇的街上，她披着蓝色披肩，身后是雪山和亮起的路灯", ratio: "9 / 16" },
      ],
    },
    {
      title: "戈壁、丹霞与盐湖",
      photos: [
        { src: "assets/photos/salt-lake-selfie.jpg", alt: "盐湖边草地上戴草帽墨镜的自拍，画面上贴着猫咪贴纸", ratio: "3 / 4" },
        { src: "assets/photos/salt-lake-water.jpg", alt: "盐湖水边，她穿米黄毛衣、戴草帽，伸手探向水面", ratio: "3 / 4" },
        { src: "assets/photos/salt-lake-profile.jpg", alt: "盐湖水边的侧身背影，黄毛衣配草编包", ratio: "3 / 4" },
        { src: "assets/photos/salt-lake-straw-hat.jpg", alt: "盐湖水边，她抱着草帽，蓝耳饰被风吹起", ratio: "3 / 4" },
        { src: "assets/photos/desert-blue-hood.jpg", alt: "沙漠里，她裹着蓝色连帽披肩，侧脸望向远处", ratio: "9 / 16" },
        { src: "assets/photos/gobi-road-arms-open.jpg", alt: "戈壁公路上她张开双臂，草帽配绿色上衣", ratio: "9 / 16" },
        { src: "assets/photos/desert-road-lookback.jpg", alt: "沙漠公路边，她穿绿色上衣和碎花裙，侧身回头", ratio: "9 / 16" },
        { src: "assets/photos/mars-avenue-sign.jpg", alt: "「火星大道·只此一条你我走过」路牌下，她抱着手臂站着", ratio: "9 / 16" },
        { src: "assets/photos/dune-sunset-hat.jpg", alt: "沙丘日落里，她戴牛仔帽、穿皮夹克，逆光的侧脸", ratio: "9 / 16" },
        { src: "assets/photos/danxia-viewpoint.jpg", alt: "丹霞地貌的观景台上她张开一只手，身后是赭红色的山体", ratio: "9 / 16" },
      ],
    },
    {
      title: "城市与夜晚",
      photos: [
        { src: "assets/photos/bund-night.jpg", alt: "上海外滩的夜里，她站在钟楼建筑前", ratio: "9 / 16" },
        { src: "assets/photos/riverside-night-dress.jpg", alt: "夜晚河边的栏杆旁，她穿黑色碎花连衣裙", ratio: "3 / 4" },
        { src: "assets/photos/night-market-snack.jpg", alt: "夜市档口前的自拍，手里拿着饼，画面有手绘贴纸", ratio: "3 / 4" },
        { src: "assets/photos/mall-mirror-selfie.jpg", alt: "商场里对着镜子自拍，我们俩都戴墨镜、穿黑白条纹", ratio: "9 / 16" },
      ],
    },
    {
      title: "日常的样子",
      photos: [
        { src: "assets/photos/flower-wreath-v-sign.jpg", alt: "晴天里，我们站在彩色花环雕塑前比耶", ratio: "3 / 4" },
        { src: "assets/photos/garden-path-lilac.jpg", alt: "花园小径上，她穿紫色外套，两侧是蓝花和红草", ratio: "9 / 16" },
        { src: "assets/photos/gallery-poster-wall.jpg", alt: "展馆的海报墙前，她穿绿色露肩上衣", ratio: "9 / 16" },
        { src: "assets/photos/white-wall-green.jpg", alt: "白墙前，她穿绿色上衣，手扶着额头", ratio: "9 / 16" },
        { src: "assets/photos/riverside-reeds.jpg", alt: "江边芦苇旁，她穿紫色外套，手里拿着咖啡", ratio: "9 / 16" },
        { src: "assets/photos/ping-an-joy-wall.jpg", alt: "「平安喜乐」红墙前张开双臂", ratio: "9 / 16" },
        { src: "assets/photos/pink-flower-deck.jpg", alt: "粉色花丛前的木栈道上坐着，穿紫色外套", ratio: "9 / 16" },
      ],
    },
  ],

  /* 时间线：按时间正序排列 */
  timeline: [
    { date: "婚礼", text: "红裙和喜字贴在墙上，亲戚们挤进同一张照片，那天的话不多，但都记得住。" },
    { date: "西安", text: "钟楼的灯亮到很晚，她举着写有「长安」的折扇，说下次还来。" },
    { date: "青海", text: "塔尔寺的转经筒一只接一只转过去，经幡底下她抱着一只小羊。" },
    { date: "戈壁与盐湖", text: "在公路上张开双臂，风从盐湖那边吹过来，帽子差点被吹走。" },
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
