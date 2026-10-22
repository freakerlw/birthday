/* ============================================================
 * webgl-bg.js —— 手写 WebGL 全屏背景：流动星云 + 漂浮金尘
 * 无库、无外部请求、file:// 可跑。WebGL 不可用 / shader 编译失败 /
 * context lost 时整层静默移除，页面其余部分不受任何影响。
 * 层级：canvas z-index 0（body 背景之前），内容 z-index 1。
 * ============================================================ */
(function () {
  "use strict";

  var diag = window.__bg = {
    mode: "none", shaders: [], logs: [], draws: 0,
    raf: false, running: false, count: 0, dpr: 1, w: 0, h: 0,
    paused: false, reason: ""
  };
  var reduce = false;
  try {
    reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (e) {}

  var canvas = null, gl = null, isGL2 = false;
  var progN = null, progP = null, triBuf = null, ptBuf = null;
  var uniN = {}, uniP = {}, count = 0, scale = 1, w = 1, h = 1;
  var time = 0, last = 0, raf = 0, running = false, dead = false;
  var intersect = true, shown = false;
  var mx = -1e5, my = -1e5, hasPointer = false;

  /* ---------- GLSL：全屏三角 ---------- */
  var VS_COVER = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  /* ---------- GLSL：四层 fBm + 域扭曲的星云 ---------- */
  var FS_NEBULA = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uGold;
uniform vec3 uWarm;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(7.3, 11.9);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * ar, uv.y) * 3.1;
  float t = uTime * 0.020;            /* 一次完整演化约 50s */
  vec2 q = vec2(
    fbm(p + vec2(t * 0.65, t * 0.30)),
    fbm(p * 1.11 + vec2(5.2 - t * 0.45, 1.7 + t * 0.55))
  );
  float n = fbm(p + q * 1.7 + vec2(-t * 0.25, t * 0.18));
  float cloud = smoothstep(0.30, 0.63, n);
  float ridge = 1.0 - abs(n * 2.0 - 1.0);
  float wisp = smoothstep(0.55, 0.94, ridge);
  float fil = smoothstep(0.88, 0.995, ridge);   /* 细纤维：静止截图也看得出走向 */
  float vig = smoothstep(1.36, 0.14, length((uv - vec2(0.5, 0.52)) * vec2(ar, 1.0)) * 1.18);
  float lx = (uv.x - 0.5) / 0.32;
  float lane = 1.0 - 0.42 * exp(-lx * lx);   /* 正文所在中央栏压暗 */
  vec3 col = uBase;
  col += uWarm * (cloud * 0.10);
  col += uGold * (cloud * cloud * 0.28 + wisp * 0.09 + fil * 0.10);
  col *= mix(0.32, 1.0, vig);          /* 四角仍压到近 #0B0A09 */
  col *= lane;
  col *= 1.0 + 0.85 * smoothstep(0.34, 0.50, abs(uv.x - 0.5));  /* 光集中在画面左右边缘 */
  col *= 1.0 - 0.82 * smoothstep(0.82, 0.98, length((uv - vec2(0.5, 0.5)) * vec2(ar, 1.0)));  /* 四角压回近黑 */
  col *= mix(0.58, 1.24, cloud);       /* 明暗对比拉开：亮云更亮、暗处仍暗 */
  col *= 1.30;
  col = col / (1.0 + col * 1.45);      /* 高光软压缩：亮斑不刺眼，副文字仍 ≥4.5:1 */
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.004;  /* 压暗阶带 */
  gl_FragColor = vec4(col, 1.0);
}`;

  /* ---------- GLSL：金尘（位移全在 GPU，逐粒子无 CPU 计算） ---------- */
  var VS_DUST = `attribute vec4 aP;      /* x, y, seed, size */
uniform vec2 uRes;
uniform float uTime;
uniform float uDpr;
uniform vec2 uMouse;
varying float vA;
void main() {
  float sp = 0.006 + fract(aP.z * 7.0) * 0.014;
  vec2 p = aP.xy;
  p.y = fract(p.y - uTime * sp);
  p.x = fract(p.x + sin(uTime * 0.08 + aP.z * 31.0) * 0.010 + uTime * 0.0015);
  vec2 px = p * uRes;
  vec2 d = px - uMouse;
  float dist = length(d);
  float push = 1.0 - smoothstep(0.0, 96.0, dist);   /* 96px 排斥半径 */
  px += (d / max(dist, 0.001)) * push * 20.0;       /* 幅度 20px，很轻 */
  float tw = 0.55 + 0.45 * sin(uTime * 0.9 + aP.z * 40.0);
  vA = 0.25 + 0.75 * tw;
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = aP.w * uDpr * (0.85 + 0.5 * tw);
}`;

  var FS_DUST = `precision mediump float;
uniform vec3 uCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float halo = pow(max(0.0, 1.0 - d), 2.5);
  float core = smoothstep(0.55, 0.0, d);
  vec3 col = uCol * (halo * 0.36 + core * 0.50) * vA;
  gl_FragColor = vec4(col, col.r);
}`;

  function shader(type, src, name) {
    var s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    var ok = !!gl.getShaderParameter(s, gl.COMPILE_STATUS);
    var log = ok ? "" : String(gl.getShaderInfoLog(s) || "compile failed");
    diag.shaders.push({ name: name, ok: ok, log: log });
    if (!ok) { gl.deleteShader(s); return null; }
    return s;
  }

  function link(vsSrc, fsSrc, name, attr) {
    var vs = shader(gl.VERTEX_SHADER, vsSrc, name + "-vs");
    var fs = shader(gl.FRAGMENT_SHADER, fsSrc, name + "-fs");
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, attr);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      diag.logs.push(name + ": " + String(gl.getProgramInfoLog(p) || "link failed"));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }

  function buildDust(n) {
    var data = new Float32Array(n * 4);
    for (var i = 0; i < n; i++) {
      data[i * 4] = Math.random();
      data[i * 4 + 1] = Math.random();
      data[i * 4 + 2] = Math.random();
      data[i * 4 + 3] = 2.0 + Math.random() * 1.0;   /* 2–3 CSS px */
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    count = n;
    diag.count = n;
  }

  function dustCount() {
    var vw = window.innerWidth || 1440;
    var n = vw < 640 ? 1100 : vw < 1024 ? 1700 : 2200;   /* 375 宽正好减半 */
    if (scale >= 1.45 && vw >= 640) n = Math.round(n * 0.85);
    return n;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    var nw = Math.round(vw * dpr), nh = Math.round(vh * dpr);
    var cap = 3.2e6;                                  /* 超大屏再降一档 */
    if (nw * nh > cap) {
      dpr *= Math.sqrt(cap / (nw * nh));
      nw = Math.round(vw * dpr);
      nh = Math.round(vh * dpr);
    }
    scale = dpr;
    w = nw;
    h = nh;
    canvas.width = nw;
    canvas.height = nh;
    diag.dpr = Math.round(dpr * 100) / 100;
    diag.w = nw;
    diag.h = nh;
    var want = dustCount();
    if (want !== count) buildDust(want);
    gl.viewport(0, 0, nw, nh);
  }

  function draw() {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.030, 0.027, 0.024, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* 第一笔：星云（整屏一个三角） */
    gl.disable(gl.BLEND);
    gl.useProgram(progN);
    gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uniN.res, w, h);
    gl.uniform1f(uniN.time, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* 第二笔：金尘（加色混合） */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(progP);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uniP.res, w, h);
    gl.uniform1f(uniP.time, time);
    gl.uniform1f(uniP.dpr, scale);
    gl.uniform2f(uniP.mouse, hasPointer ? mx * scale : -1e5, hasPointer ? my * scale : -1e5);
    gl.drawArrays(gl.POINTS, 0, count);

    diag.draws++;
    if (!shown && canvas) {
      shown = true;
      canvas.classList.add("is-on");
    }
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    time += Math.min(0.1, (now - last) / 1000);
    last = now;
    try {
      draw();
    } catch (e) {
      fail("draw-error");
      return;
    }
    if (running) raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (dead || running || reduce || !intersect || document.hidden) return;
    running = true;
    diag.running = true;
    diag.raf = true;
    diag.paused = false;
    last = performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  function stop(reason) {
    running = false;
    diag.running = false;
    diag.raf = false;
    if (reason) diag.paused = true;
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function fail(reason) {
    if (dead) return;
    dead = true;
    diag.reason = reason;
    diag.mode = "none";
    stop();
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = null;
    gl = null;
  }

  function setup() {
    try {
      canvas = document.createElement("canvas");
      canvas.className = "bg-webgl";
      canvas.setAttribute("aria-hidden", "true");
      document.body.insertBefore(canvas, document.body.firstChild);

      var opts = {
        alpha: false, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: false,
        powerPreference: "low-power"
      };
      gl = canvas.getContext("webgl2", opts);
      if (gl) isGL2 = true;
      if (!gl) gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
      if (!gl) { fail("no-context"); return; }
      diag.mode = isGL2 ? "webgl2" : "webgl";

      canvas.addEventListener("webglcontextlost", function (event) {
        event.preventDefault();
        fail("context-lost");
      }, false);

      progN = link(VS_COVER, FS_NEBULA, "nebula", "aPos");
      progP = link(VS_DUST, FS_DUST, "dust", "aP");
      if (!progN || !progP) { fail("shader"); return; }

      uniN.res = gl.getUniformLocation(progN, "uRes");
      uniN.time = gl.getUniformLocation(progN, "uTime");
      gl.useProgram(progN);
      gl.uniform3f(gl.getUniformLocation(progN, "uBase"), 0.030, 0.027, 0.024);
      gl.uniform3f(gl.getUniformLocation(progN, "uGold"), 0.95, 0.78, 0.44);
      gl.uniform3f(gl.getUniformLocation(progN, "uWarm"), 0.22, 0.148, 0.088);

      uniP.res = gl.getUniformLocation(progP, "uRes");
      uniP.time = gl.getUniformLocation(progP, "uTime");
      uniP.dpr = gl.getUniformLocation(progP, "uDpr");
      uniP.mouse = gl.getUniformLocation(progP, "uMouse");
      gl.useProgram(progP);
      gl.uniform3f(gl.getUniformLocation(progP, "uCol"), 0.784, 0.663, 0.416);

      triBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      ptBuf = gl.createBuffer();
      resize();
      draw();                                   /* 第一帧：缩略图 / reduced-motion 也有静态底 */

      if (reduce) { diag.reason = "reduced-motion"; return; }

      if (typeof IntersectionObserver === "function") {
        var io = new IntersectionObserver(function (entries) {
          intersect = !!entries[entries.length - 1].isIntersecting;
          if (intersect) start(); else stop(true);
        }, { threshold: 0 });
        io.observe(canvas);
      } else {
        start();
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(true); else start();
      }, false);

      if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("pointermove", function (event) {
          if (event.pointerType && event.pointerType !== "mouse") return;
          mx = event.clientX;
          my = event.clientY;
          hasPointer = true;
        }, { passive: true });
        window.addEventListener("pointerleave", function () { hasPointer = false; }, { passive: true });
        window.addEventListener("blur", function () { hasPointer = false; });
      }

      var resizeTimer = 0;
      window.addEventListener("resize", function () {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          resizeTimer = 0;
          try { resize(); } catch (e) { fail("resize-error"); }
        }, 180);
      }, { passive: true });

      window.addEventListener("pagehide", function () { stop(true); }, false);
    } catch (e) {
      fail("setup-error");
    }
  }

  function idle() {
    if (window.requestIdleCallback) window.requestIdleCallback(setup, { timeout: 600 });
    else window.setTimeout(setup, 180);
  }

  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
})();
