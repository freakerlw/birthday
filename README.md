# 生日纪念页 · 使用说明

纯静态、零依赖：双击 `index.html`（file://）就能看，放到任意静态服务器上也一样。
没有任何外部请求——字体只用系统栈，噪点、favicon 都是内联 data URI。

---

## 一、整站长什么样

深色电影感：

- 近黑暖底色 `#0B0A09`，暖白正文 `#EDE6DC`，香槟金 `#C8A96A` 只用在细线和小标签上。
- 显示体 Georgia / Songti SC，正文走系统无衬线；信正文用衬线，行高 1.95。
- 每段上下留白 `clamp(88px, 12vw, 180px)`，内容宽 1200px，文字块 720px；段与段之间只有 1px 细线，不堆卡片。
- 全站一层极淡胶片颗粒（`body::after`，opacity .025，内联 feTurbulence），hero 两团暖色光晕 46s / 58s 缓慢漂移。

七段顺序固定：**hero → gallery → timeline → letter → wishes → surprise → footer**。

- **gallery**：每组照片是一条横向胶片带 `.film`。每格的宽度由 `content.js` 里该照片的 `ratio` 决定，高度 `clamp(320px, 62vh, 560px)`。
  可以用鼠标拖、触屏滑、聚焦后按左右方向键（容器 `tabindex="0"`）；滚动条隐藏，两端有渐隐提示还有内容。
  每组第一张 `loading="eager"`，其余 `lazy`。
- **wishes**：要陪你做完的清单，5 组 20 条纯 CSS 胶囊标签，悬停时边框转金。

## 二、怎么换照片（替换同名文件即可）

1. 直接替换 `assets/photos/` 下的同名文件即可，不用改代码——文件名和 `content.js` 里 `galleryGroups` 的 `src` 一一对应。
2. 想换成别的文件名，就到 `content.js` 的 `galleryGroups` 里改对应的 `src`（路径以 `content.js` 所在目录为基准）和 `alt`（画面描述，读屏和加载失败时都会用到）。
3. 换的图和原来比例不一样时，把该条目的 `ratio` 改成新图的宽/高（例如 `"4 / 3"`、`"3 / 4"`）——它决定胶片带里那一格的宽度，加载前就占好位置，不会抖。

现在这 36 张是 jpg，长边 1200px（不超过 1400px）、单张 ≤180KB（合计约 4.9MB，六组）。想加分组，复制一组 `{ title, photos: [...] }` 即可。

## 三、怎么改文案（3 步）

1. 打开 `content.js`，改 `herName` 和 `birthdayLabel`——浏览器标题会自动跟着变。
2. 改 `heroTagline`、`timeline`、`letterParagraphs`、`wishlist`、`surprise`、`footerSign` 里对应的句子；每增加一段就多写一个字符串 / 一个对象。
3. 想放背景音乐：把音频文件（mp3）放到 `assets/`，把 `music.src` 填成 `"assets/你的音乐.mp3"`。留空则页脚不显示音乐按钮（默认关闭，点一下才播）。

## 四、怎么上线（3 步）

1. 把整个 `birthday-site` 文件夹上传到任意静态托管（GitHub Pages、Vercel、Netlify、对象存储都行），入口是 `index.html`。
2. 本地先验证一遍：在本文件夹里执行 `python3 -m http.server 8000`，浏览器打开 `http://localhost:8000/`。
3. 拿到公网地址后，用手机再打开一次确认排版（尤其照片朝向），把链接发给寿星就行。

> 不需要构建、不需要 npm install、没有任何外链请求，离线也能打开。

---

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面骨架：七个空 section + 页脚，内容由 JS 填入 |
| `styles.css` | 全部样式与动效，设计 token 收在 `:root` |
| `main.js` | 把 `window.CONTENT` 渲染成 DOM，胶片带交互、入场动效 |
| `content.js` | 全站唯一的内容来源（文案、照片路径、分组） |
| `webgl-bg.js` | 手写 WebGL 背景层：fBm 星云 + 金尘，WebGL 不可用时静默移除 |
| `assets/photos/` | 36 张照片，勿改名、勿重压、勿删除 |

## 兼容与可访问性

- file:// 直接打开：`content.js` 用 `window.CONTENT` 赋值，没有 fetch，不会撞 CORS。
- `prefers-reduced-motion: reduce` 下所有动画 / 过渡 / 平滑滚动都会关掉，`.reveal` 直接可见。
- 色彩对比（相对 `#0B0A09`）：`--text` 15.97:1，`--text-muted` 7.35:1，均高于 WCAG AA 的 4.5:1。
- 375px 宽下页面本身不出现横向滚动，横向滚动只发生在 `.film` 内部；胶片带可以键盘操作。
- 电影感动效层在 `anim.js`：开场序列（0–3.0s，任意点击/按键/滚轮/触摸立刻跳到终态）、段标题逐字揭示、胶片带焦点缩放与入场上浮、时间线金线绘制、指针光斑与照片 3D 倾斜；全部逐帧计算共用一个 rAF（`main.js` 里的 `window.__frame`）。
- 隐藏初态只挂在 `html.js.is-opening` 上：禁用 JS、脚本报错或 `prefers-reduced-motion: reduce` 时 hero 直接是完整终态，不会出现半透明残留。
