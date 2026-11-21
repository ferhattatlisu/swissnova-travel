/* SwissNova Travel demo — hareket motoru. Kütüphane yok, düz JS.
   Mono tarzı açılış (marka yazısı küçülüp sol üstteki logoya oturur) + sayfalar arası panel geçişi, akıcı (inertia) kaydırma, kelime/harf belirmesi,
   paralaks, kayan yer adı bandı, imleç halkası, mıknatıslı düğmeler, hover görseli, hamburger menü.
   prefers-reduced-motion açıksa hareketlerin çoğu kapanır. Sayfa metni/içeriği js/main.js'te.
   (Bunun sadeleştirilmiş hali yedek-sade/ klasöründe duruyor.) */
(function () {
  "use strict";
  var reduce = false, fine = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; fine = matchMedia("(hover:hover) and (pointer:fine)").matches; } catch (e) {}
  var FX = window.FX = {};
  var root = document.documentElement;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* "AB CD" -> <span class="w"><i style="--c:0">A</i><i style="--c:1">B</i></span> <span class="w">…</span> */
  function chars(str) {
    var n = 0;
    return String(str).split(" ").map(function (w) {
      return '<span class="w">' + w.split("").map(function (c) { return '<i style="--c:' + (n++) + '">' + esc(c) + "</i>"; }).join("") + "</span>";
    }).join(" ");
  }
  FX.chars = chars;

  /* ---------- sayı sayma ---------- */
  function tween(el, from, to, dur, fmt) {
    if (!el) return;
    if (el._tw) cancelAnimationFrame(el._tw);
    if (reduce || dur <= 0) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function f(now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e);
      el._tw = p < 1 ? requestAnimationFrame(f) : 0;
    })(t0);
  }
  FX.tween = tween;

  /* ---------- açılış + sayfa geçişi (Mono Mimarlık düzeni) ----------
     Açılış: siyah ekranda büyük marka yazısı; yüklendikçe küçülür, sonra üst menüdeki logonun yerine oturur, siyah perde kalkar.
     Geçiş: renkli panel sağdan kayarak sayfayı kaplar (sayfa sola kayar); yeni sayfada panel sola çıkar, sayfa yerine oturur.
     html sınıfları (is-loading, mid-transition) js/boot.js tarafından sayfa çizilmeden önce konur. */
  var leaving = false, ready = false, onReady = null;
  var GRADS = window.__GRADS || ["linear-gradient(90deg,#b8ced8,#e4edf1)"];
  function buildPreloader() {
    if ($(".preloader")) return;
    var d = document.createElement("div"); d.className = "preloader"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<div class="preloader-bg"></div><div class="preloader-mark"><span class="logo-a">Swissnova</span></div>';
    document.body.appendChild(d);
  }
  function markReady() {
    if (ready) return;
    ready = true; document.body.classList.add("ready");
    startObs();
    if (onReady) { try { onReady(); } catch (e) {} }
  }
  function waitAssets(list) {
    var ps = [];
    (list || []).forEach(function (u) { if (!u) return; ps.push(new Promise(function (res) { var im = new Image(); im.onload = im.onerror = function () { res(); }; im.src = u; })); });
    return Promise.race([Promise.all(ps), new Promise(function (r) { setTimeout(r, 3500); })]);
  }
  function jumpHash() {
    if (!location.hash) { window.scrollTo(0, 0); return; }
    var el = document.getElementById(location.hash.slice(1));
    window.scrollTo(0, el ? Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 56) : 0);
  }
  function runIntro(opts, seen) {
    buildPreloader();
    var mark = $(".preloader-mark"), word = mark && $(".logo-a", mark), real = $("#nav .logo-a");
    var imageDone = false;
    waitAssets(opts.preload).then(function () { imageDone = true; }, function () { imageDone = true; });
    if (reduce || !word || !real) {
      setTimeout(function () { root.classList.remove("is-loading"); markReady(); }, 150);
      return;
    }
    var MIN = seen ? 1000 : 1600;   /* yazının küçülmesi en az bu kadar sürer (ms) */
    var MAX = 5000;                 /* görsel gelmese de en geç bu sürede açılır */
    var SHRINK = 0.62;              /* yükleme bitene kadar yazı bu oranda küçülür */
    var box = null, t0 = 0, timer = null;

    /* p: 0 (en büyük) -> 1 (yükleme bitti); yazı ekranın ortasında kalır */
    function place(p) {
      var e = p * p * (3 - 2 * p), s = 1 - SHRINK * e;
      var x = (root.clientWidth - box.width * s) / 2 - box.left * s;
      var y = (window.innerHeight - box.height * s) / 2 - box.top * s;
      mark.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
    }
    /* yazı üst menüdeki logonun tam üstüne oturur, siyah perde kalkar */
    function land() {
      root.classList.add("is-opening"); root.classList.remove("is-loading");
      var t = real.getBoundingClientRect(), s = t.width / box.width;
      mark.classList.add("is-landing");
      mark.style.color = getComputedStyle(navEl || real).color;
      mark.style.transform = "translate(" + (t.left - box.left * s).toFixed(2) + "px," + (t.top - box.top * s).toFixed(2) + "px) scale(" + s.toFixed(5) + ")";
      setTimeout(markReady, 350);
      setTimeout(function () { root.classList.remove("is-opening"); }, 1080);
    }
    function step() {
      var el = Date.now() - t0;
      var cap = imageDone ? 1 : 0.6 + 0.25 * clamp((el - MIN * 0.6) / 3000, 0, 1);
      var p = el >= MAX ? 1 : Math.min(el / MIN, cap);
      place(p);
      if (p >= 1) { clearInterval(timer); setTimeout(land, 420); }
    }
    function begin() {
      if (box) return;
      /* yazıyı ekranı dolduracak boyda kur; büyükten küçüğe ölçeklendiği için net kalır */
      var k = Math.min(0.72 * root.clientWidth / real.offsetWidth, 0.45 * window.innerHeight / real.offsetHeight);
      mark.style.fontSize = (parseFloat(getComputedStyle(real).fontSize) * k).toFixed(2) + "px";
      box = word.getBoundingClientRect();
      place(0); void mark.offsetWidth;
      mark.classList.add("is-ready", "is-live");
      t0 = Date.now(); timer = setInterval(step, 80);
    }
    /* yazı tipi gelmeden yazıyı gösterme (sonradan biçim değiştirmesin) */
    var font = document.fonts && document.fonts.load ? document.fonts.load('800 1em "Inter Tight"') : null;
    if (font && font.then) font.then(begin, begin);
    setTimeout(begin, 1200);
    /* yedek: ne olursa olsun site açılsın */
    setTimeout(function () { if (!ready) { root.classList.remove("is-loading", "is-opening"); markReady(); } }, MAX + 4000);
  }
  FX.boot = function (opts) {
    opts = opts || {}; onReady = opts.onReady || null;
    buildProgress(); buildCursor(); smoothInit(); wireGlobal();
    try { history.scrollRestoration = "manual"; } catch (e) {}
    var seen = ss("sn-seen"); ss("sn-seen", "1");
    jumpHash();
    if (root.classList.contains("mid-transition")) {
      /* geçişle gelindi: panel sola çıkar, içerik %20'den yerine kayar */
      if (reduce) { root.classList.remove("mid-transition"); markReady(); return; }
      var pg = document.getElementById("page");
      setTimeout(function () {
        if (pg) void pg.offsetWidth;
        root.classList.add("has-transitioned"); root.classList.remove("mid-transition");
        markReady();
        setTimeout(function () { root.classList.remove("has-transitioned"); }, 600);
      }, 100);
      return;
    }
    if (!root.classList.contains("is-loading")) root.classList.add("is-loading");
    runIntro(opts, !!seen);
  };
  function leave(url) {
    if (leaving) return; leaving = true;
    var i = 0;
    try { i = parseInt(sessionStorage.getItem("sn-gecis-sira"), 10) || 0; } catch (e) {}
    i = i % GRADS.length;
    root.style.setProperty("--panel", GRADS[i]);
    closeMenu(); root.classList.add("is-transitioning");
    setTimeout(function () {
      try { sessionStorage.setItem("sn-gecis", i + "|" + Date.now()); sessionStorage.setItem("sn-gecis-sira", String((i + 1) % GRADS.length)); } catch (e) {}
      location.href = url;
    }, reduce ? 0 : 430);
  }
  addEventListener("pageshow", function (e) {
    if (e.persisted) { leaving = false; root.classList.remove("is-transitioning"); }
  });

  /* ---------- akıcı kaydırma (yalnız fare/dokunmatik pad, hareket azaltma kapalıyken) ---------- */
  var sm = { y: 0, t: 0, on: false, last: 0 }, smoothOn = false;
  function maxY() { return Math.max(0, root.scrollHeight - innerHeight); }
  function smoothInit() {
    if (smoothOn || reduce || !fine) return; smoothOn = true;
    sm.y = sm.t = window.pageYOffset;
    addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (root.classList.contains("is-loading") || root.classList.contains("is-transitioning") || root.classList.contains("menu-open")) return;
      var tg = e.target; if (tg && tg.closest && tg.closest("textarea,select")) return;
      e.preventDefault();
      var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if (!sm.on) sm.y = window.pageYOffset;
      sm.t = clamp(sm.t + d, 0, maxY()); smRun();
    }, { passive: false });
    addEventListener("scroll", function () { if (!sm.on) { sm.y = sm.t = window.pageYOffset; } }, { passive: true });
  }
  function smRun() { if (sm.on) return; sm.on = true; sm.last = performance.now(); requestAnimationFrame(smStep); }
  function smStep(now) {
    var dt = Math.min(64, now - sm.last); sm.last = now;
    var k = 1 - Math.pow(1 - .105, dt / 16.67), d = sm.t - sm.y;
    if (Math.abs(d) < .5) { sm.y = sm.t; window.scrollTo(0, sm.y); sm.on = false; return; }
    sm.y += d * k; window.scrollTo(0, sm.y); requestAnimationFrame(smStep);
  }
  FX.scrollTo = function (y, instant) {
    y = clamp(y, 0, maxY());
    if (instant || reduce) { window.scrollTo(0, y); sm.y = sm.t = y; return; }
    if (smoothOn) { if (!sm.on) sm.y = window.pageYOffset; sm.t = y; smRun(); }
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  /* ---------- menü ---------- */
  function toggleMenu(open) {
    var o = open === undefined ? !root.classList.contains("menu-open") : open;
    root.classList.toggle("menu-open", o);
    var b = document.getElementById("burger"); if (b) b.setAttribute("aria-expanded", o ? "true" : "false");
  }
  function closeMenu() { toggleMenu(false); }

  /* ---------- global dinleyiciler (tek sefer) ---------- */
  var wired = false;
  function wireGlobal() {
    if (wired) return; wired = true;
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented) return;
      var tg = e.target;
      if (tg.closest && tg.closest("#burger")) { toggleMenu(); return; }
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = tg.closest && tg.closest("a[href]"); if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.protocol !== location.protocol || u.host !== location.host) return;
      var norm = function (p) { return p.replace(/index\.html$/, ""); };
      var same = norm(u.pathname) === norm(location.pathname) && u.search === location.search;
      if (same && u.hash) {
        var el = document.getElementById(u.hash.slice(1));
        e.preventDefault(); closeMenu();
        if (el) { FX.scrollTo(el.getBoundingClientRect().top + window.pageYOffset - 56); try { history.replaceState(null, "", u.hash); } catch (x) {} }
        return;
      }
      if (same) { e.preventDefault(); closeMenu(); FX.scrollTo(0); return; }
      e.preventDefault();
      leave(a.href);
    });
    addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    addEventListener("resize", function () { if (innerWidth > 860) closeMenu(); });
    /* hover görseli: tur satırında imleci izleyen kare */
    document.addEventListener("mouseover", function (e) {
      if (!fine) return;
      var el = document.getElementById("peek"); if (!el) return;
      var r = e.target.closest && e.target.closest(".row"), im = r && r.getAttribute("data-img");
      if (im) showPeek(el, im); else hidePeek(el);
    });
    document.addEventListener("mousemove", function (e) { pk.tx = e.clientX; pk.ty = e.clientY; }, { passive: true });
    document.addEventListener("visibilitychange", function () { last = performance.now(); });
  }
  var pk = { x: 0, y: 0, tx: 0, ty: 0, on: false, img: "", which: 0, rot: 0 };
  function showPeek(el, im) {
    var L = el.querySelectorAll(".pi");
    if (!pk.on) { pk.x = pk.tx; pk.y = pk.ty; }
    if (pk.img !== im) {
      var nx = L[pk.which ^ 1]; nx.style.backgroundImage = "url(" + im + ")";
      L[pk.which].classList.remove("on"); nx.classList.add("on"); pk.which ^= 1; pk.img = im;
    }
    el.classList.add("on"); pk.on = true;
  }
  function hidePeek(el) { el.classList.remove("on"); pk.on = false; }

  /* ---------- imleç halkası ---------- */
  var cur = null, cx = -100, cy = -100, ctx = -100, cty = -100;
  function buildCursor() {
    if (cur || !fine || reduce) return;
    cur = document.createElement("div"); cur.className = "cur"; cur.innerHTML = "<i></i><span></span>"; document.body.appendChild(cur);
    var lab = cur.querySelector("span");
    addEventListener("mousemove", function (e) { ctx = e.clientX; cty = e.clientY; if (!cur._v) { cx = ctx; cy = cty; cur._v = 1; } if (!cur.classList.contains("vis")) cur.classList.add("vis"); }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () { cur.classList.remove("vis"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target, st = "";
      if (t.closest) {
        var v = t.closest("[data-cur]");
        if (v) { lab.textContent = v.getAttribute("data-cur"); st = " view"; }
        else if (t.closest("input,select,textarea")) st = " txt";
        else if (t.closest("a,button,label,.chip")) st = " link";
      }
      cur.className = "cur vis" + st;
    });
  }

  /* ---------- ilerleme çubuğu ---------- */
  var prog = null;
  function buildProgress() { if (prog) return; var d = document.createElement("div"); d.className = "prog"; d.innerHTML = "<i></i>"; document.body.appendChild(d); prog = d.firstChild; }

  /* ---------- sayfa içi tarama: kelime bölme, yazı kayması, paralaks, bant, mıknatıs ---------- */
  var par = [], marq = [], pend = [], io = null, navEl = null, heroIn = null, cueEl = null;
  function splitWords(el) {
    if (el._sp) return; el._sp = 1; var n = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"), i = document.createElement("span");
            w.className = "wd"; i.className = "wi"; i.style.setProperty("--i", n++); i.textContent = p; w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.nodeName !== "BR") walk(c);
      });
    })(el);
    el.classList.add("split");
  }
  function rollify(r) {
    $$(".btn,.pill", r).forEach(function (el) {
      if (el._rl) return; el._rl = 1;
      [].slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) {
          var s = document.createElement("span"), a = document.createElement("span"), b;
          s.className = "rl"; a.textContent = n.nodeValue.trim(); b = a.cloneNode(true); b.setAttribute("aria-hidden", "true");
          s.appendChild(a); s.appendChild(b); el.replaceChild(s, n);
        }
      });
    });
  }
  function magnets(r) {
    if (!fine || reduce) return;
    $$(".btn,.pill.wa,.wafab", r).forEach(function (el) {
      if (el._mg) return; el._mg = 1;
      el.addEventListener("mouseenter", function () { el.classList.add("mg-on"); });
      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        el.style.transform = "translate3d(" + (dx * .26).toFixed(1) + "px," + (dy * .36).toFixed(1) + "px,0)";
      });
      el.addEventListener("mouseleave", function () { el.classList.remove("mg-on"); el.style.transform = ""; });
    });
  }
  FX.enhance = function (r, add) {
    r = r || document.getElementById("app"); if (!r) return;
    if (!add) {
      par = []; marq = []; pend = []; if (io) { io.disconnect(); io = null; }
      navEl = document.getElementById("nav"); heroIn = $(".hero-in"); cueEl = $(".cue");
    }
    $$('[data-rv="split"]', r).forEach(splitWords);
    $$('[data-rv="chars"]', r).forEach(function (el) { if (!el._ch) { el._ch = 1; el.classList.add("cs"); el.innerHTML = chars(el.textContent); } });
    $$("[data-d]", r).forEach(function (el) { el.style.setProperty("--d", el.getAttribute("data-d") + "ms"); });
    rollify(r); magnets(r);
    $$("[data-par]", r).forEach(function (el) { par.push({ el: el, host: el.parentElement, s: parseFloat(el.getAttribute("data-par")) || .2 }); });
    $$("[data-marq]", r).forEach(function (el) { marq.push({ el: el, inn: el.firstElementChild, x: 0, w: 0 }); });
    pend = pend.concat($$("[data-rv]", r));
    if (ready) startObs();
  };

  /* ---------- belirme (IntersectionObserver, aynı anda girenlere sıralı gecikme) ---------- */
  function show(el) {
    el.classList.add("in");
    if (el.hasAttribute("data-count")) { var to = parseFloat(el.getAttribute("data-count")) || 0; tween(el, 0, to, 1800, function (v) { return String(Math.round(v)); }); }
    try { el.dispatchEvent(new Event("fxin")); } catch (e) {}
  }
  function startObs() {
    var els = pend; pend = [];
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(show); return; }
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); })
          .forEach(function (e, k) {
            var el = e.target; io.unobserve(el);
            if (!el.hasAttribute("data-d")) el.style.setProperty("--d", Math.min(k, 9) * 85 + "ms");
            show(el);
          });
      }, { threshold: .12, rootMargin: "0px 0px -3% 0px" });
    }
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- dil değişiminde yumuşak geçiş ---------- */
  FX.swap = function (fn) {
    var app = document.getElementById("app");
    if (!app || reduce) { fn(); return; }
    app.classList.add("swap");
    setTimeout(function () {
      var y = window.pageYOffset; closeMenu(); fn();
      window.scrollTo(0, y); sm.y = sm.t = y;
      setTimeout(function () { app.classList.remove("swap"); }, 40);
    }, 380);
  };

  /* ---------- tek kare döngüsü ---------- */
  var last = performance.now(), lastY = window.pageYOffset, vel = 0, dirS = 1, frame = 0;
  function tick(now) {
    var dt = Math.min(64, now - last); last = now; frame++;
    var y = window.pageYOffset, vh = innerHeight, dy = y - lastY; lastY = y;
    vel += (dy - vel) * .18; if (Math.abs(dy) > 1) dirS = dy > 0 ? 1 : -1;
    /* okumalar */
    var pv = par.map(function (p) {
      var r = p.host.getBoundingClientRect();
      return (r.bottom < -120 || r.top > vh + 120) ? null : -((r.top + r.height / 2) - vh / 2) * p.s;
    });
    /* yazmalar */
    if (prog) { var m = maxY(); prog.style.transform = "scaleX(" + (m > 0 ? clamp(y / m, 0, 1) : 0).toFixed(4) + ")"; }
    if (navEl) {
      navEl.classList.toggle("solid", y > 60);
      if (!root.classList.contains("menu-open")) {
        if (dy > 6 && y > 320) navEl.classList.add("hide"); else if (dy < -4 || y < 200) navEl.classList.remove("hide");
      }
    }
    for (var i = 0; i < par.length; i++) if (pv[i] !== null) par[i].el.style.transform = "translate3d(0," + pv[i].toFixed(1) + "px,0)";
    if (heroIn) {
      var hp = clamp(y / (vh * .75), 0, 1);
      heroIn.style.transform = hp > 0 ? "translate3d(0," + (-hp * 70).toFixed(1) + "px,0)" : "";
      heroIn.style.opacity = hp > 0 ? String(1 - hp * 1.25 < 0 ? 0 : 1 - hp * 1.25) : "";
      if (cueEl) cueEl.style.opacity = hp > 0 ? String(Math.max(0, .8 - hp * 3)) : "";
    }
    if (!reduce) marq.forEach(function (m) {
      if (!m.w || frame % 120 === 0) m.w = m.inn.firstElementChild.offsetWidth;
      if (!m.w) return;
      m.x -= dirS * (70 + Math.min(Math.abs(vel) * 38, 520)) * dt / 1000;
      if (m.x <= -m.w) m.x += m.w; if (m.x > 0) m.x -= m.w;
      m.inn.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)";
    });
    if (cur) {
      var k = 1 - Math.pow(1 - .22, dt / 16.67); cx += (ctx - cx) * k; cy += (cty - cy) * k;
      cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    }
    var pe = document.getElementById("peek");
    if (pe && pk.on) {
      var kk = 1 - Math.pow(1 - .16, dt / 16.67), w = pe.offsetWidth, h = pe.offsetHeight;
      var tx = pk.tx + 64; if (tx + w > innerWidth - 16) tx = pk.tx - 64 - w;
      var ty = clamp(pk.ty - h / 2, 70, innerHeight - h - 16);
      pk.x += (tx - pk.x) * kk; pk.y += (ty - pk.y) * kk;
      pe.style.transform = "translate3d(" + pk.x.toFixed(1) + "px," + pk.y.toFixed(1) + "px,0)";
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
