/* ============================================================
 * anim.js —— 电影感动效层
 * 只做动效，不产生任何文案；缺了它页面依然是完整终态。
 * 逐帧计算全部复用 main.js 暴露的 window.__frame（全站唯一的 rAF 入口）。
 * ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var frame = window.__frame;
  var mq = window.matchMedia;

  /* reduced-motion：head 里不会挂 is-opening，这里也整体不介入 */
  if (!mq || mq("(prefers-reduced-motion: reduce)").matches) return;

  var fine = mq("(pointer: fine)").matches;
  var OPENING = "is-opening";

  function toArray(list) { return Array.prototype.slice.call(list); }
  function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  /* 逐字拆分：mask 负责遮罩，char 负责位移 */
  function splitChars(node, maskClass, charClass) {
    var text = node.textContent || "";
    var parts = typeof Array.from === "function" ? Array.from(text) : text.split("");
    var frag = document.createDocumentFragment();
    node.textContent = "";
    for (var i = 0; i < parts.length; i++) {
      var mask = document.createElement("span");
      mask.className = maskClass;
      var ch = document.createElement("span");
      ch.className = charClass;
      ch.style.setProperty("--i", i);
      ch.textContent = parts[i];
      mask.appendChild(ch);
      frag.appendChild(mask);
    }
    node.appendChild(frag);
    return node;
  }

  /* ---------- 一、开场序列：0–3.0s，任意输入立刻到终态 ---------- */
  (function opening() {
    var hero = document.getElementById("hero");
    var name = document.getElementById("hero-name");
    if (!hero || !name || !hero.querySelector(".hero-inner")) return;

    splitChars(name, "hero-mask", "hero-char");

    var rule = document.createElement("span");
    rule.className = "hero-rule hero-rule--name";
    rule.setAttribute("aria-hidden", "true");
    name.parentNode.insertBefore(rule, name.nextSibling);

    var line = document.createElement("span");
    line.className = "hero-descend";
    line.setAttribute("aria-hidden", "true");
    var lineInner = document.createElement("span");
    lineInner.className = "hero-descend-line";
    line.appendChild(lineInner);
    hero.appendChild(line);

    /* C1 名字金色流光：开场后 300ms 一次 */
    var shined = false;
    function shine() {
      if (shined) return;
      shined = true;
      name.classList.add("name-shimmer");
      window.setTimeout(function () { name.classList.remove("name-shimmer"); }, 1200);
    }

    var timer = 0;
    function end() {
      if (!root.classList.contains(OPENING)) return;
      root.classList.remove(OPENING);
      if (timer) window.clearTimeout(timer);
      timer = 0;
      window.removeEventListener("click", end, true);
      window.removeEventListener("keydown", end, true);
      window.removeEventListener("wheel", end, true);
      window.removeEventListener("touchstart", end, true);
      window.setTimeout(shine, 300);
    }

    window.addEventListener("click", end, { capture: true, passive: true });
    window.addEventListener("keydown", end, { capture: true, passive: true });
    window.addEventListener("wheel", end, { capture: true, passive: true });
    window.addEventListener("touchstart", end, { capture: true, passive: true });
    timer = window.setTimeout(end, 3000);
  })();

  if (!frame) return;

  /* ---------- ① 段标题逐字揭示 ---------- */
  toArray(document.querySelectorAll(".section-title")).forEach(function (title) {
    splitChars(title, "st-mask", "st-char");
  });

  /* ---------- ⑧ 同段内 .reveal 错峰（最多 6 档 × 70ms，已有 inline delay 的不覆盖） ---------- */
  toArray(document.querySelectorAll(".reveal")).forEach(function (node) {
    if (node.style.transitionDelay) return;
    var parent = node.parentNode;
    if (!parent) return;
    var n = parent.__stagger || 0;
    if (n) node.style.transitionDelay = Math.min(n, 5) * 70 + "ms";
    parent.__stagger = n + 1;
  });

  var films = toArray(document.querySelectorAll(".film"));
  var glows = toArray(document.querySelectorAll(".hero-glow"));
  var timeline = document.querySelector(".timeline");

  /* ③ 胶片带自身的横向滚动（键盘 / 拖拽 / 触控板）同样重算焦点，不靠 setInterval */
  films.forEach(function (film) {
    film.addEventListener("scroll", function () {
      scrollDirty = true;
      needFrame();
    }, { passive: true });
  });

  /* ---------- ④ 胶片带入场上浮：第一次进视口时错峰，仅一次 ---------- */
  if (films.length && typeof window.IntersectionObserver === "function") {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var film = entry.target;
        if (!entry.isIntersecting || film.classList.contains("film--in")) return;
        io.unobserve(film);
        film.classList.add("film--in");
        window.setTimeout(function () {
          film.classList.remove("film--pending");
        }, 1500);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    films.forEach(function (film) {
      film.classList.add("film--pending");
      var items = film.children;
      for (var i = 0; i < items.length; i++) items[i].style.setProperty("--d", Math.min(i, 5));
      io.observe(film);
    });
  }

  /* ---------- ⑤ 桌面指针光斑 ---------- */
  var spot = null;
  var spotDot = null;
  if (fine) {
    spot = document.createElement("div");
    spot.className = "spotlight";
    spot.setAttribute("aria-hidden", "true");
    spotDot = document.createElement("div");
    spotDot.className = "spotlight-dot";
    spot.appendChild(spotDot);
    document.body.appendChild(spot);
  }

  /* C2 遮罩揭示：整条带首次接近视口时，各张按 --d 错峰揭开一次 */
  var clipFilms = toArray(document.querySelectorAll(".film"));
  if (clipFilms.length && window.IntersectionObserver) {
    var clipIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        clipIO.unobserve(e.target);
        toArray(e.target.children).forEach(function (it) { it.classList.add("clip-in"); });
      });
    }, { rootMargin: "0px 0px 400px 0px" });
    clipFilms.forEach(function (f) { f.classList.add("clip-wait"); clipIO.observe(f); });
  }

  /* C3 拖动惯性：lerp(0.14) 减速，触屏不接管 */
  var glide = null;
  function stopGlide() {
    if (glide) glide.film.classList.remove("is-gliding");
    glide = null;
  }
  function startGlide(film, v) {
    if (Math.abs(v) < 0.25) return;
    stopGlide();
    film.classList.add("is-gliding", "is-free"); /* 拖过之后保持自由滚动，避免吸附把滑行拽回 */
    glide = { film: film, pos: film.scrollLeft, v: v * 16.7, start: performance.now() };
    needFrame();
  }
  if (fine) films.forEach(function (film) {
    var tr = null;
    film.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (glide && glide.film === film) stopGlide();
      tr = { x: e.clientX, t: performance.now(), v: 0 };
    }, { passive: true });
    film.addEventListener("pointermove", function (e) {
      if (!tr) return;
      var t = performance.now(), dt = t - tr.t;
      if (dt > 0) { tr.v = tr.v * 0.6 + (e.clientX - tr.x) / dt * 0.4; tr.x = e.clientX; tr.t = t; }
    }, { passive: true });
    function fin() {
      if (!tr) return;
      var v = performance.now() - tr.t > 120 ? 0 : tr.v;
      tr = null;
      startGlide(film, -v);
    }
    film.addEventListener("pointerup", fin);
    film.addEventListener("pointercancel", fin);
  });

  /* C4 hero 聚光灯（仅 pointer:fine） */
  var heroEl = document.getElementById("hero");
  var heroSpot = null, heroOn = false, hxo = 0, hyo = 0, heroDirty = false;
  if (fine && heroEl) {
    heroSpot = document.createElement("div");
    heroSpot.className = "hero-spot";
    heroSpot.setAttribute("aria-hidden", "true");
    heroEl.appendChild(heroSpot);
  }

  /* ---------- 单帧循环 ---------- */
  var queued = false;
  var scrollDirty = true;
  var lastParallax = null;
  var tlValue = -1;
  var spotOn = false;
  var sx = -2000, sy = -2000, px = -2000, py = -2000;
  var hoverItem = null, hx = 0, hy = 0;

  function needFrame() {
    if (queued) return;
    queued = true;
    frame(function () { queued = false; tick(); });
  }

  function tick() {
    var vh = window.innerHeight || 0;
    var y = window.pageYOffset || 0;
    var again = false;
    var i;

    /* ② 视差：只有 hero 两团光晕，translate 与 CSS transform 动画互不干扰 */
    if (glows.length) {
      var off = (y * 0.06).toFixed(1) + "px";
      if (off !== lastParallax) {
        lastParallax = off;
        for (i = 0; i < glows.length; i++) glows[i].style.translate = "0px " + off;
      }
    }

    if (scrollDirty) {
      scrollDirty = false;

      /* ③ 胶片带焦点：边缘优先（最左 = 第 1 张，最右 = 最后一张），其余离容器中心最近。
         判定规则只有 main.js 的 activeItem 一处，图注 / 计数器读的是同一张。 */
      for (i = 0; i < films.length; i++) {
        var film = films[i];
        var items = film.children;
        if (!items.length) continue;
        var best = window.__filmActive ? window.__filmActive(film) : null;
        if (!best) {
          var fr = film.getBoundingClientRect();
          var cx = fr.left + fr.width / 2;
          var bestD = Infinity;
          for (var j = 0; j < items.length; j++) {
            var ir = items[j].getBoundingClientRect();
            var d = Math.abs(ir.left + ir.width / 2 - cx);
            if (d < bestD) { bestD = d; best = items[j]; }
          }
        }
        if (best !== film.__focus) {
          if (film.__focus) film.__focus.classList.remove("is-focus");
          if (best) best.classList.add("is-focus");
          film.__focus = best;
          if (window.__filmCaption) window.__filmCaption(film, best);
        }
      }

      /* ⑥ 时间线金线按进入视口的比例绘制 */
      if (timeline) {
        var tr = timeline.getBoundingClientRect();
        var progress = clamp01((vh - tr.top) / (vh + tr.height));
        if (Math.abs(progress - tlValue) > 0.004) {
          tlValue = progress;
          timeline.style.setProperty("--tl", progress.toFixed(3));
        }
      }
    }

    /* ⑤ 光斑以 0.12 插值跟随 */
    if (spotOn) {
      var dx = px - sx;
      var dy = py - sy;
      if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
        sx = px; sy = py;
      } else {
        sx += dx * 0.12;
        sy += dy * 0.12;
        again = true;
      }
      spotDot.style.transform = "translate3d(" + (sx - 600).toFixed(1) + "px," + (sy - 600).toFixed(1) + "px,0)";
    }

    /* ⑦ 照片 hover 3D 倾斜（±6°，perspective 由 .film 提供） */
    if (hoverItem) {
      var b = hoverItem.getBoundingClientRect();
      var nx = (hx - (b.left + b.width / 2)) / (b.width / 2);
      var ny = (hy - (b.top + b.height / 2)) / (b.height / 2);
      nx = nx < -1 ? -1 : nx > 1 ? 1 : nx;
      ny = ny < -1 ? -1 : ny > 1 ? 1 : ny;
      hoverItem.style.setProperty("--ry", (nx * 6).toFixed(2) + "deg");
      hoverItem.style.setProperty("--rx", (-ny * 6).toFixed(2) + "deg");
    }

    /* C3 惯性滑行 */
    if (glide) {
      glide.film.scrollLeft = glide.pos += glide.v;
      glide.v += -glide.v * 0.14;
      if (Math.abs(glide.v) < 0.25 || performance.now() - glide.start > 600) stopGlide();
      else again = true;
    }

    /* C4 聚光灯跟随（hero 内坐标 → translate3d） */
    if (heroDirty) {
      heroDirty = false;
      heroSpot.style.transform = "translate3d(" + (hxo - 520).toFixed(1) + "px," + (hyo - 520).toFixed(1) + "px,0)";
    }

    if (again) needFrame();
  }

  function onScroll() {
    scrollDirty = true;
    needFrame();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", onScroll, { passive: true });

  if (fine) {
    document.addEventListener("pointermove", function (event) {
      if (spot) {
        if (!spotOn) {
          spotOn = true;
          sx = event.clientX;
          sy = event.clientY;
          spot.classList.add("is-on");
        }
        px = event.clientX;
        py = event.clientY;
      }

      if (heroSpot) {
        var hb = heroEl.getBoundingClientRect();
        if (event.clientX > hb.left && event.clientX < hb.right && event.clientY > hb.top && event.clientY < hb.bottom) {
          hxo = event.clientX - hb.left;
          hyo = event.clientY - hb.top;
          heroDirty = true;
          if (!heroOn) { heroOn = true; heroSpot.classList.add("is-on"); }
        } else if (heroOn) {
          heroOn = false;
          heroSpot.classList.remove("is-on");
        }
      }

      var target = event.target;
      var item = target && target.closest ? target.closest(".film-item") : null;
      if (event.buttons > 0) item = null; /* 拖拽 / 按住时不倾斜 */
      if (item !== hoverItem) {
        if (hoverItem) {
          hoverItem.style.removeProperty("--rx");
          hoverItem.style.removeProperty("--ry");
        }
        hoverItem = item;
      }
      if (item) { hx = event.clientX; hy = event.clientY; }
      needFrame();
    }, { passive: true });

    function clearTilt() {
      if (!hoverItem) return;
      hoverItem.style.removeProperty("--rx");
      hoverItem.style.removeProperty("--ry");
      hoverItem = null;
    }
    window.addEventListener("blur", clearTilt);
    document.addEventListener("pointerleave", clearTilt);
  }

  /* 初始一轮：焦点与时间线进度在首帧就位 */
  needFrame();
  window.setTimeout(onScroll, 260);
})();
