/* ============================================================
 * main.js —— 把 window.CONTENT 渲染成页面
 * 这里不写任何文案、不写任何图片路径。
 * ============================================================ */
(function () {
  "use strict";

  var CONTENT = window.CONTENT;
  if (!CONTENT) return;

  var LABELS = CONTENT.labels || {};
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var FILM_GAP = 14; /* 与 styles.css 里 .film 的 gap 保持一致 */

  /* ---------- 全站唯一的逐帧调度入口 ----------
   * 所有逐帧计算（视差、胶片焦点、光斑、时间线进度、入场扫描）都排进这一条队列，
   * anim.js 通过 window.__frame 复用同一条 rAF，全站没有第二个 rAF 循环。 */
  var frameQueue = [];
  var frameOn = false;
  window.__frame = function (fn) {
    frameQueue.push(fn);
    if (frameOn) return;
    frameOn = true;
    window.requestAnimationFrame(function () {
      frameOn = false;
      var jobs = frameQueue;
      frameQueue = [];
      for (var i = 0; i < jobs.length; i++) {
        try { jobs[i](); } catch (err) { /* 单个动效出错不拖垮其余 */ }
      }
    });
  };

  /* ---------- 小工具 ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null && text !== "") node.textContent = String(text);
    return node;
  }

  function reveal(node, delayMs) {
    if (!node) return node;
    node.classList.add("reveal");
    if (delayMs) node.style.transitionDelay = delayMs + "ms";
    return node;
  }

  function sectionTitle(text) {
    if (!text) return null;
    return reveal(el("h2", "section-title", text));
  }

  function mount(id, nodes) {
    var host = document.getElementById(id);
    if (!host) return null;
    var inner = el("div", "section-inner");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i]) inner.appendChild(nodes[i]);
    }
    host.appendChild(inner);
    return host;
  }

  function twoDigits(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /* ---------- 浏览器标题：由 content 拼出 ---------- */
  var titleParts = [];
  if (CONTENT.herName) titleParts.push(CONTENT.herName);
  if (CONTENT.birthdayLabel) titleParts.push(CONTENT.birthdayLabel);
  if (titleParts.length) document.title = titleParts.join(" · ");

  /* ---------- 1. hero ---------- */
  (function buildHero() {
    var host = document.getElementById("hero");
    if (!host) return;

    var inner = el("div", "hero-inner");
    inner.appendChild(el("span", "hero-rule hero-rule--top"));

    /* hero 三个元素不走通用 reveal：开场序列（anim.js）自己管隐藏初态，
       无 JS 时它们必须是静态可见的终态 */
    if (CONTENT.herName) {
      var name = el("h1", "hero-name", CONTENT.herName);
      name.id = "hero-name";
      inner.appendChild(name);
    }
    if (CONTENT.birthdayLabel) {
      inner.appendChild(el("p", "hero-date", CONTENT.birthdayLabel));
    }
    if (CONTENT.heroTagline) {
      inner.appendChild(el("p", "hero-tagline", CONTENT.heroTagline));
    }

    inner.appendChild(el("span", "hero-rule hero-rule--bottom"));
    host.appendChild(inner);
  })();

/* ---------- 2. gallery：一条 36 张、按时间排到底的横滑带 ----------
 * 焦点判定是全站唯一一处几何规则：边缘优先（最左 = 第 1 张，最右 = 最后一张），
 * 其余取离容器中心最近的那张。图注、计数器、.is-focus 都读这一个函数。 */
function activeItem(film) {
  var items = film.children;
  var total = items.length;
  if (!total) return null;

  var max = film.scrollWidth - film.clientWidth;
  if (film.scrollLeft <= 2) return items[0];               /* 最左端认第 1 张 */
  if (max - film.scrollLeft <= 2) return items[total - 1]; /* 最右端认最后一张 */

  var fr = film.getBoundingClientRect();
  var cx = fr.left + fr.width / 2;
  var best = items[0];
  var bestD = Infinity;
  for (var i = 0; i < total; i++) {
    var ir = items[i].getBoundingClientRect();
    var d = Math.abs(ir.left + ir.width / 2 - cx);
    if (d < bestD) { bestD = d; best = items[i]; }
  }
  return best;
}
window.__filmActive = activeItem;

function buildFilm(photos) {
  var film = el("div", "film");
  film.tabIndex = 0;
  film.setAttribute("role", "group");
  film.setAttribute("aria-label", "照片墙，可左右滑动或按左右方向键浏览");

  photos.forEach(function (photo, index) {
    if (!photo || !photo.src) return;
    var figure = el("figure", "film-item");
    if (photo.ratio) figure.style.setProperty("--ratio", photo.ratio);
    if (photo.caption) figure.setAttribute("data-caption", photo.caption);

    var img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.alt || "";
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    if (index === 0) img.setAttribute("fetchpriority", "high");
    figure.appendChild(img);
    film.appendChild(figure);
  });

  return film;
}

/* 图注行：图注在左、计数器在右，同一行两端对齐；整条带一句图注都没有时整行不渲染。
   aria-live 让切换被读屏播报；文案是地点 / 时刻短语，与图片 alt 的画面描述不重复。 */
function buildCaption(film) {
  var total = film.children.length;
  var first = "";
  for (var i = 0; i < total; i++) {
    var text = film.children[i].getAttribute("data-caption");
    if (text) { first = text; break; }
  }
  if (!first) return null;

  var cap = el("p", "film-caption");
  cap.setAttribute("aria-live", "polite");
  cap.setAttribute("aria-atomic", "true");
  var span = el("span", "film-caption-text", first);
  var counter = el("span", "film-counter", "01 / " + twoDigits(total));
  cap.appendChild(span);
  cap.appendChild(counter);
  film.__cap = cap;
  film.__capText = span;
  film.__counter = counter;
  span.__shown = first;
  return cap;
}

/* 200ms 淡出 + 淡入；折减动效时直接换字 */
function showCaption(film, text) {
  var span = film.__capText;
  if (!span || span.__shown === text) return;
  span.__shown = text;
  film.__cap.hidden = !text; /* 空 caption 不留空行 */
  if (reduceMotion) {
    span.textContent = text;
    span.style.opacity = "1";
    return;
  }
  window.clearTimeout(film.__capTimer);
  span.style.transition = "opacity 80ms linear";
  span.style.opacity = "0";
  film.__capTimer = window.setTimeout(function () {
    span.textContent = text;
    span.style.transition = "opacity 120ms linear";
    span.style.opacity = "1";
  }, 80);
}

/* 图注 + 计数器：都跟着 activeItem 走 */
function paintCaption(film, item) {
  if (!film.__capText) return;
  var index = item ? Array.prototype.indexOf.call(film.children, item) : -1;
  if (index < 0) index = 0;
  showCaption(film, item ? item.getAttribute("data-caption") || "" : "");
  if (film.__counter) {
    film.__counter.textContent = twoDigits(index + 1) + " / " + twoDigits(film.children.length);
  }
}

/* 带子上方的极淡进度条：宽度 = 已滑比例。它是指示器，不是动画，折减动效下照常显示 */
function paintProgress(film) {
  var bar = film.__bar;
  if (!bar) return;
  var max = film.scrollWidth - film.clientWidth;
  var ratio = max > 1 ? film.scrollLeft / max : 0;
  if (ratio < 0) ratio = 0;
  if (ratio > 1) ratio = 1;
  bar.style.width = (ratio * 100).toFixed(2) + "%";
}

function syncFilm(film) {
  paintCaption(film, activeItem(film));
  paintProgress(film);
}

(function buildGallery() {
  var gallery = CONTENT.gallery;
  var photos = gallery && Array.isArray(gallery.photos) ? gallery.photos : [];
  if (!photos.length) return;

  var nodes = [sectionTitle(LABELS.gallery)];
  if (LABELS.gallerySub) nodes.push(el("p", "section-sub", LABELS.gallerySub));

  var film = buildFilm(photos);
  var track = el("div", "film-progress");
  track.setAttribute("aria-hidden", "true");
  var bar = el("span", "film-progress-bar");
  track.appendChild(bar);
  film.__bar = bar;

  var caption = buildCaption(film);
  var band = el("div", "gallery-band");
  band.appendChild(track);
  band.appendChild(film);
  if (caption) band.appendChild(caption);
  nodes.push(reveal(band));

  mount("gallery", nodes);

  /* 横向滑动只改进度条宽度；排进全站唯一的 rAF，不在 scroll 里做几何计算 */
  var queued = false;
  function request() {
    if (queued) return;
    queued = true;
    window.__frame(function () { queued = false; paintProgress(film); });
  }
  film.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("load", request);
  paintProgress(film);

  /* anim.js 每次重算 .is-focus 后回调这里，图注 / 计数器与焦点同一帧到位 */
  window.__filmCaption = function (target, item) {
    paintCaption(target, item || activeItem(target));
  };
})();

/* ---------- 2b. 图注 / 计数器 / 进度条：anim.js 缺席或折减动效时的同一套兜底 ---------- */
(function setupFilmFallback() {
  var films = Array.prototype.slice.call(document.querySelectorAll(".film"));
  if (!films.length) return;

  function refresh() {
    for (var i = 0; i < films.length; i++) syncFilm(films[i]);
  }

  function attach() {
    var queued = false;
    function request() {
      if (queued) return;
      queued = true;
      window.__frame(function () { queued = false; refresh(); });
    }
    films.forEach(function (film) {
      if (film.__capText) film.addEventListener("scroll", request, { passive: true });
    });
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("load", request);
    refresh();
    window.setTimeout(refresh, 300);
  }

  /* 正常动效下 anim.js 每一帧回算焦点，这里只在折减动效 / 找不到焦点时接管 */
  if (reduceMotion) {
    attach();
  } else {
    window.setTimeout(function () {
      if (!document.querySelector(".film-item.is-focus")) attach();
    }, 500);
  }
})();


  /* ---------- 胶片带的交互：键盘 + 桌面鼠标拖动 ---------- */
  (function setupFilms() {
    var films = Array.prototype.slice.call(document.querySelectorAll(".film"));
    if (!films.length) return;

    films.forEach(function (film) {
      /* 内容比容器窄时整条居中，不留一条假装能滑的空白 */
      if (film.scrollWidth <= film.clientWidth + 1) film.classList.add("film--fit");

      function step() {
        var item = film.querySelector(".film-item");
        return item ? item.getBoundingClientRect().width + FILM_GAP : film.clientWidth * 0.8;
      }
      function scrollByStep(delta) {
        film.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
      }

      film.addEventListener("keydown", function (event) {
        var key = event.key;
        if (key === "ArrowRight") {
          event.preventDefault();
          scrollByStep(step());
        } else if (key === "ArrowLeft") {
          event.preventDefault();
          scrollByStep(-step());
        } else if (key === "Home" || key === "End") {
          event.preventDefault();
          film.scrollTo({ left: key === "Home" ? 0 : film.scrollWidth, behavior: reduceMotion ? "auto" : "smooth" });
        }
      });

      /* 图片别把浏览器原生 drag 拖出来 */
      film.addEventListener("dragstart", function (event) { event.preventDefault(); });

      var drag = null;

      film.addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX, left: film.scrollLeft, moved: false };
        film.classList.add("is-dragging");
        try { film.setPointerCapture(event.pointerId); } catch (err) { /* 老浏览器忽略 */ }
      });

      film.addEventListener("pointermove", function (event) {
        if (!drag || event.pointerId !== drag.id) return;
        var dx = event.clientX - drag.x;
        if (!drag.moved) {
          if (Math.abs(dx) < 3) return;
          drag.moved = true;
        }
        event.preventDefault();
        film.scrollLeft = drag.left - dx;
      });

      function endDrag(event) {
        if (!drag) return;
        if (event && event.pointerId !== undefined && event.pointerId !== drag.id) return;
        var id = drag.id;
        drag = null;
        film.classList.remove("is-dragging");
        try { film.releasePointerCapture(id); } catch (err) { /* 已释放 */ }
      }

      film.addEventListener("pointerup", endDrag);
      film.addEventListener("pointercancel", endDrag);
      film.addEventListener("lostpointercapture", endDrag);
    });
  })();

  /* ---------- 胶片带预加载：进视口后 300ms 起，最多 4 张并发 ----------
   * 横向溢出时只有视口内的图会加载，横滑过去先看到空白；
   * 进视口把该带剩余 img 的 loading 改成 eager（实测会真正触发加载）。 */
  (function warmFilms() {
    var films = Array.prototype.slice.call(document.querySelectorAll(".film"));
    if (!films.length || typeof window.IntersectionObserver !== "function") return;

    /* 省流量 / 2G：保持纯 lazy */
    var conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(String(conn.effectiveType || "")))) return;

    var MAX = 4;
    var queue = [];
    var running = 0;

    function pump() {
      while (queue.length && running < MAX) {
        var img = queue.shift();
        if (img.complete) continue;
        run(img);
      }
    }

    function run(img) {
      running++;
      function finish() {
        img.removeEventListener("load", finish);
        img.removeEventListener("error", finish);
        running--;
        pump();
      }
      img.addEventListener("load", finish);
      img.addEventListener("error", finish);
      img.loading = "eager";
      if (img.complete) finish(); /* 已在缓存里：立刻让出额度 */
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        window.setTimeout(function () {
          var imgs = entry.target.getElementsByTagName("img");
          for (var i = 0; i < imgs.length; i++) queue.push(imgs[i]);
          pump();
        }, 300);
      });
    }, { rootMargin: "0px 0px 200px 0px" });

    films.forEach(function (film) { io.observe(film); });
  })();

  /* ---------- 3. timeline ---------- */
  (function buildTimeline() {
    var items = Array.isArray(CONTENT.timeline) ? CONTENT.timeline : [];
    if (!items.length) return;

    var list = el("ol", "timeline");
    items.forEach(function (item) {
      if (!item) return;
      var li = el("li", "tl-item");
      if (item.date) li.appendChild(el("div", "tl-date", item.date));
      if (item.text) li.appendChild(el("p", "tl-text", item.text));
      list.appendChild(reveal(li));
    });

    mount("timeline", [sectionTitle(LABELS.timeline), list]);
  })();

  /* ---------- 4. letter ---------- */
  (function buildLetter() {
    var paragraphs = Array.isArray(CONTENT.letterParagraphs) ? CONTENT.letterParagraphs : [];
    if (!paragraphs.length) return;

    var body = el("div", "letter-body");
    paragraphs.forEach(function (text, index) {
      if (!text) return;
      body.appendChild(reveal(el("p", "letter-p", text), Math.min(index, 5) * 90));
    });

    mount("letter", [sectionTitle(LABELS.letter), body]);
  })();

  /* ---------- 5. wishes ---------- */
  (function buildWishes() {
    var groups = Array.isArray(CONTENT.wishlist) ? CONTENT.wishlist : [];
    if (!groups.length) return;

    var nodes = [sectionTitle(LABELS.wishes)];

    groups.forEach(function (group, groupIndex) {
      if (!group) return;
      var block = el("div", "wish-group");
      var groupDelay = Math.min(groupIndex, 4) * 80;

      if (group.title) {
        block.appendChild(reveal(el("h3", "wish-group-title", group.title), groupDelay));
      }

      var list = el("ul", "wish-list");
      (Array.isArray(group.items) ? group.items : []).forEach(function (text, index) {
        if (!text) return;
        list.appendChild(reveal(el("li", "wish-tag", text), groupDelay + Math.min(index, 6) * 40));
      });
      if (list.childNodes.length) block.appendChild(list);
      nodes.push(block);
    });

    mount("wishes", nodes);
  })();

  /* ---------- 6. surprise ---------- */
  (function buildSurprise() {
    var data = CONTENT.surprise;
    if (!data) return;

    var nodes = [sectionTitle(LABELS.surprise)];

    var button = el("button", "surprise-button", data.buttonLabel);
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "surprise-panel");
    nodes.push(button);

    var panel = el("div", "surprise-panel");
    panel.id = "surprise-panel";
    panel.hidden = true;
    if (data.message) panel.appendChild(el("p", "surprise-message", data.message));
    if (data.giftHint) {
      var hint = el("div", "gift-hint");
      if (LABELS.giftHint) hint.appendChild(el("span", "gift-hint-label", LABELS.giftHint));
      hint.appendChild(el("p", "gift-hint-text", data.giftHint));
      panel.appendChild(hint);
    }
    nodes.push(panel);

    button.addEventListener("click", function () {
      var willOpen = panel.hidden;
      panel.hidden = !willOpen;
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      if (willOpen && panel.scrollIntoView) {
        panel.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      }
    });

    mount("surprise", nodes);
  })();

  /* ---------- 7. footer ---------- */
  (function buildFooter() {
    var host = document.getElementById("footer");
    if (!host) return;

    var inner = el("div", "footer-inner");
    if (CONTENT.footerSign) {
      inner.appendChild(el("p", "footer-sign", CONTENT.footerSign));
    }

    var music = CONTENT.music;
    if (music && music.src) {
      var audio = el("audio", "music-audio");
      audio.src = music.src;
      audio.loop = true;
      audio.preload = "none";

      var button = el("button", "music-toggle", music.label);
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        if (audio.paused) {
          var played = audio.play();
          if (played && typeof played.catch === "function") played.catch(function () {});
        } else {
          audio.pause();
        }
      });
      audio.addEventListener("play", function () { button.setAttribute("aria-pressed", "true"); });
      audio.addEventListener("pause", function () { button.setAttribute("aria-pressed", "false"); });

      inner.appendChild(audio);
      inner.appendChild(button);
    }

    host.appendChild(inner);
  })();

  /* ---------- 入场：滚动扫描（比 IntersectionObserver 更抗「直接跳到底」） ---------- */
  (function setupReveal() {
    var pending = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!pending.length) return;

    if (reduceMotion) {
      pending.forEach(function (node) { node.classList.add("is-visible"); });
      return;
    }

    var ticking = false;

    function sweep() {
      ticking = false;
      var vh = window.innerHeight || 0;
      var doc = document.documentElement;
      var atBottom = window.scrollY + vh >= doc.scrollHeight - 4;

      for (var i = pending.length - 1; i >= 0; i--) {
        var node = pending[i];
        if (node.classList.contains("is-visible")) {
          pending.splice(i, 1);
          continue;
        }
        var rect = node.getBoundingClientRect();
        if (atBottom || (rect.top < vh * 0.92 && rect.bottom > -24)) {
          node.classList.add("is-visible");
          pending.splice(i, 1);
        }
      }
    }

    function requestSweep() {
      if (ticking) return;
      ticking = true;
      window.__frame(sweep);
    }

    window.addEventListener("scroll", requestSweep, { passive: true });
    window.addEventListener("resize", requestSweep);
    window.addEventListener("load", requestSweep);
    requestSweep();
    window.setTimeout(requestSweep, 120);
  })();
})();
