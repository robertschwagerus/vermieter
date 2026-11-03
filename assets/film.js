/* Film auf der Seite, wie auf krmqntno.github.io (components/film):
   1. Einflug: das Blatt liegt beim Laden schräg, als schaue die Kamera tief über
      dem Hero die Seite hinauf. Scrollen kippt es in 70 Prozent einer
      Bildschirmhöhe flach. Teile mit data-stand stehen dabei zur Linse auf.
      Die schwebenden Makerus Kacheln sind auf Kerims Wunsch raus (29.10.26).
   2. Lift: Karten mit data-lift kommen unten aufgerichtet ins Bild und liegen in
      der Mitte fast flach, knapp über dem Blatt.
   3. (Vorbeiziehende Kachel links in der Seitenmitte, auf Kerims Wunsch raus 29.10.26.)
   4. Finale: unter dem Blatt steigt die Kamera auf, die ganze Seite steht als
      Streifen da, dann stürzt sie auf den Hero, der als Karte unter der
      Schlusszeile landet. Standbilder: assets/img/seite.jpg und seite-hero.jpg.
   Ein requestAnimationFrame für alles, nur Scrollposition und Fenstergröße. */
(function () {
  "use strict";
  if (/[?&]shot\b/.test(location.search)) return; // Standbilder ohne Film
  var doc = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var smoother = function (t) { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
  var easeInOutQuad = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  /* ---------- ein Takt ---------- */
  var subs = [], raf = 0;
  function run() { raf = 0; var f = { y: window.scrollY, vw: window.innerWidth, vh: window.innerHeight }; subs.forEach(function (fn) { fn(f); }); }
  function request() { if (!raf) raf = requestAnimationFrame(run); }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("load", request);
  function subscribe(fn) { subs.push(fn); request(); }

  var MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 17V9M12 20V4M17 15V10"/></svg>';
  function docTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }

  var sheet = doc.querySelector("main.sheet");
  if (!sheet) return;

  /* ---------- 1. Einflug ---------- */
  var anchor = doc.querySelector("[data-tile-anchor]");
  var head = doc.querySelector(".hero h1");
  var stage = doc.querySelector(".hero .stage");
  var stands = [].slice.call(doc.querySelectorAll("[data-stand]"));
  stands.forEach(function (el) { el.style.transition = "opacity .8s cubic-bezier(.2,.8,.2,1)"; });

  if (anchor && head && !reduce) {
    var layer = doc.createElement("div");
    layer.className = "film-layer";
    layer.setAttribute("aria-hidden", "true");
    var far = doc.createElement("div"); far.className = "dof-band dof-far";
    var near = doc.createElement("div"); near.className = "dof-band dof-near";
    layer.appendChild(far); layer.appendChild(near);
    doc.body.appendChild(layer);

    subscribe(function (f) {
      var y = f.y, vw = f.vw, vh = f.vh, desk = vw >= 1024;
      var k = 1 - smooth(0, vh * 0.7, y);

      // Blatt kippen. Drehpunkt bei 78 Prozent der Bildhöhe: darüber weicht die
      // Seite zurück, darunter kommt sie der Linse nah.
      if (k > 0.001) {
        var origin = y + vh * 0.78 - sheet.offsetTop;
        sheet.style.transformOrigin = "50% " + origin.toFixed(0) + "px";
        sheet.style.transformStyle = "preserve-3d";
        sheet.style.transform = "perspective(" + (desk ? 1500 : 1100) + "px) rotateX(" + ((desk ? 34 : 18) * k).toFixed(2) + "deg)";
      } else if (sheet.style.transform) {
        sheet.style.transform = "";
        sheet.style.transformStyle = "";
      }

      stands.forEach(function (el) {
        var z = Number(el.getAttribute("data-stand")) || 30;
        var tilt = el.hasAttribute("data-tilt") ? Number(el.getAttribute("data-tilt")) : 30;
        el.style.transform = k > 0.001 ? "translateZ(" + (z * k).toFixed(1) + "px) rotateX(" + (-tilt * k).toFixed(2) + "deg)" : "";
      });

      near.style.opacity = k.toFixed(3);
      far.style.opacity = (k * 0.8).toFixed(3);

    });
  } else {
    stands.forEach(function (el) { el.style.transform = ""; });
  }

  /* ---------- 2. Lift ---------- */
  var lifts = [].slice.call(doc.querySelectorAll("[data-lift]")).map(function (el) {
    var v = el.getAttribute("data-lift").split(",").map(Number);
    el.style.transition = "opacity .8s cubic-bezier(.2,.8,.2,1)";
    el.style.willChange = "transform";
    return { el: el, z: v[0] || 30, tilt: v[1] === undefined ? 14 : v[1], rest: v[2] === undefined ? 0.2 : v[2] };
  });
  if (!reduce && lifts.length) {
    subscribe(function (f) {
      var vh = f.vh, k = f.vw < 1024 ? 0.5 : 1;
      lifts.forEach(function (L) {
        var top = docTop(L.el) - f.y, h = L.el.offsetHeight;
        if (top + h < -300 || top > vh + 300) return;
        var p = (top + h / 2 - vh * 0.5) / (vh * 0.5);
        var e = smooth(0, 1.1, p);
        var max = L.z * k;
        var lift = max * (L.rest + (1 - L.rest) * e);
        var ang = L.tilt * k * e;
        L.el.style.transform = "perspective(1400px) translateZ(" + lift.toFixed(1) + "px) rotateX(" + (-ang).toFixed(2) + "deg)";
        // Schatten wandert mit der Höhe z nach (0.10 z, 4 + 0.36 z), wie im Film
        var a = 0.08 + (0.14 * lift) / (max || 1);
        L.el.style.boxShadow = "0 1px 2px rgba(26,33,51,.05), " + (0.1 * lift).toFixed(1) + "px " + (4 + 0.36 * lift).toFixed(1) + "px " + (7 + 0.5 * lift).toFixed(1) + "px rgba(26,33,51," + a.toFixed(3) + ")";
      });
    });
  }

  /* ---------- 4. Finale ---------- */
  var footer = doc.querySelector(".site-footer");
  var cfg = { w: 1280, h: 7109, hero: 1013 }; // aus tools/capture-sheet.mjs, bei Layoutänderung neu aufnehmen
  if (!footer) return;
  var LINE = ["Nur", "Sachwerte", "sind", "Geld,"];
  var TAIL = ["der", "Rest", "ist", "Währung."];
  var sec = doc.createElement("section");
  sec.id = "schluss"; sec.setAttribute("aria-label", "Schluss");
  var n = 0, words = "";
  LINE.forEach(function (w) { words += '<span data-w="' + (++n) + '" class="fw">' + w + " </span>"; });
  var tail = "";
  TAIL.forEach(function (w) { tail += '<span data-w="' + (++n + 2) + '" class="fw">' + w + " </span>"; });
  sec.innerHTML =
    '<div class="finale-stage floor">' +
      '<div class="finale-title">' +
        '<span data-w="0" class="fw finale-badge"><span class="mark">' + MARK + '</span>Makerus Consulting</span>' +
        '<h2 class="display">' + words + '<span class="tail">' + tail + '</span></h2>' +
      '</div>' +
      '<div class="finale-card" style="width:' + cfg.w + 'px;height:' + cfg.h + 'px">' +
        '<img src="assets/img/seite.jpg" alt="" width="' + cfg.w + '" height="' + cfg.h + '" loading="lazy" decoding="async">' +
        '<img src="assets/img/seite-hero.jpg" alt="" width="' + cfg.w + '" height="' + cfg.hero + '" loading="lazy" decoding="async" style="height:' + cfg.hero + 'px">' +
      '</div>' +
    '</div>';
  var stageEl = sec.firstChild;
  footer.parentNode.insertBefore(sec, footer);

  var card = sec.querySelector(".finale-card");
  var ti = sec.querySelector(".finale-title");
  var fws = [].slice.call(sec.querySelectorAll("[data-w]"));
  var DESK = { rise: [0, 0.34], over: [0.34, 0.44], dive: [0.44, 0.66], title: 0.63, hold: 0.8 };
  var MOB = { rise: [0, 0], over: [0, 0.12], dive: [0.12, 0.5], title: 0.48, hold: 0.66 };
  var span = function (u, r) { return r[1] > r[0] ? clamp((u - r[0]) / (r[1] - r[0])) : 1; };
  var W = cfg.w, H = cfg.h, HERO = cfg.hero, sizeKey = "";

  subscribe(function (f) {
    var y = f.y, vw = f.vw, vh = f.vh;
    var desk = vw >= 1024 && !reduce;
    var key = vw + "x" + vh + "x" + desk;
    if (key !== sizeKey) {
      sizeKey = key;
      sec.style.marginTop = desk ? -vh + "px" : "0px";
      sec.style.height = (reduce ? vh : desk ? vh * 3.6 : vh * 2.6) + "px";
    }
    var top = sec.offsetTop, len = sec.offsetHeight - vh;
    // Standbilder rechtzeitig laden, bevor das Finale beginnt
    if (!sec._loaded && y > top - vh * 3) { sec._loaded = true; [].forEach.call(sec.querySelectorAll("img"), function (im) { im.loading = "eager"; }); }
    var u = reduce || len <= 0 ? 1 : clamp((y - top) / len);
    stageEl.style.visibility = !desk || y > top + 1 ? "visible" : "hidden";
    var P = desk ? DESK : MOB;

    // Schlusszeile und Karte als Block, senkrecht mittig
    var minTop = Math.max(desk ? 80 : 72, vh * 0.055); // unter dem Kopf der Seite
    var titleH = ti.offsetHeight;
    var aspect = W / HERO;
    var cardW = Math.min(vw * (desk ? 0.7 : 1) - (desk ? 0 : 32), 1018, (vh - minTop - titleH - 26 - 36) * aspect);
    var titleTop = Math.max(minTop, (vh - (titleH + 26 + cardW / aspect)) / 2);
    ti.style.top = titleTop + "px";
    var cardTop = titleTop + titleH + 26;
    var sCard = cardW / W;
    var margin = desk ? 42 : 28;
    var sFit = (vh - 2 * margin) / H;
    var s0 = sheet.offsetWidth / W;

    var sc, yTop, hv = H, fade = 0, rad, land = 0;
    var d = span(u, P.dive);
    if (u < P.over[0]) {
      // Aufstieg: logarithmisch zoomen, Unterkante fällt auf die 42 px Linie
      var a = span(u, P.rise);
      sc = s0 * Math.pow(sFit / s0, smoother(a));
      var bottom = vh - margin * smooth(0, 0.35, a);
      yTop = bottom - H * sc;
      rad = 24 * sc;
    } else if (u < P.dive[0]) {
      // Draufsicht: ganze Seite als Streifen, kriecht 3,5 Prozent näher
      var b = span(u, P.over);
      sc = sFit * (1 + 0.035 * smooth(0, 1, b));
      yTop = (vh - H * sc) / 2;
      rad = 24 * sc;
    } else {
      // Sturz: Oberkante bleibt oben, wächst, dann sinkt sie auf die Kartenposition
      var s1 = sFit * 1.035;
      sc = s1 * Math.pow(sCard / s1, easeInOutQuad(d));
      var top0 = (vh - H * s1) / 2;
      yTop = lerp(top0, cardTop, smooth(0.55, 1, d));
      hv = lerp(H, HERO, smooth(0.25, 0.85, d));
      fade = smooth(0.05, 0.55, d);
      rad = lerp(Math.max(3, 24 * sc), 38, smooth(0.5, 1, d));
      land = smooth(0.7, 1, d);
      var hh = clamp((u - P.hold) / (1 - P.hold));
      sc *= 1 + 0.02 * smooth(0, 1, hh);
    }

    var cw = W * sc, ch = hv * sc, x = (vw - cw) / 2;
    card.style.height = hv.toFixed(1) + "px";
    card.style.borderRadius = (rad / sc).toFixed(1) + "px";
    card.style.transform = "translate3d(" + x.toFixed(1) + "px," + yTop.toFixed(1) + "px,0) scale(" + sc.toFixed(5) + ")";
    // Erst in den Dunst blenden, dann abschneiden: alles unter dem Hero wird
    // durchsichtig, der Hero bleibt voll stehen.
    var m = "linear-gradient(to bottom, #000 " + HERO + "px, rgba(0,0,0," + (1 - fade).toFixed(3) + ") " + (HERO + 1) + "px)";
    card.style.maskImage = m; card.style.webkitMaskImage = m;
    card.style.setProperty("--land", land.toFixed(3));

    // Schlusszeile Wort für Wort, jedes steigt 16 px aus 12 px Unschärfe
    fws.forEach(function (w) {
      var at = P.title + Number(w.getAttribute("data-w")) * 0.012;
      var t = smooth(at, at + 0.035, u);
      w.style.opacity = t.toFixed(3);
      w.style.transform = "translateY(" + ((1 - t) * 16).toFixed(1) + "px)";
      w.style.filter = t < 1 ? "blur(" + ((1 - t) * 12).toFixed(1) + "px)" : "";
    });

  });
})();
