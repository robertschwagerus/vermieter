/* Videoseite Vermieter: Autoplay stumm mit "Für Ton tippen", Quartile 25/50/75/100,
   UTM Weitergabe an alle Knöpfe. Übernommen von steuern-sparen.makerus-consulting.de. */
(function () {
  "use strict";
  function ph(name, props) {
    props = props || {};
    if (window.posthog && posthog.capture) posthog.capture(name, props);
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, props));
  }
  var v = document.getElementById("mainVideo");
  var ov = document.getElementById("playOverlay");
  if (v && ov) {
    var unmute = function () { v.muted = false; if (v.paused) v.play().catch(function () {}); ov.classList.add("hidden"); };
    ov.addEventListener("click", unmute);
    ov.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unmute(); } });
    var fired = {}, unmuted = false;
    v.addEventListener("play", function () { if (!fired.play) { fired.play = 1; ph("video_play", { duration: Math.round(v.duration || 0), muted: v.muted }); } });
    v.addEventListener("volumechange", function () {
      if (!v.muted) { ov.classList.add("hidden"); if (!unmuted) { unmuted = true; ph("video_unmute", { at: Math.round(v.currentTime) }); } }
    });
    v.addEventListener("timeupdate", function () {
      if (!v.duration) return;
      var p = v.currentTime / v.duration * 100;
      [25, 50, 75].forEach(function (q) { if (p >= q && !fired[q]) { fired[q] = 1; ph("video_" + q, { duration: Math.round(v.duration) }); } });
    });
    v.addEventListener("ended", function () { if (!fired[100]) { fired[100] = 1; ph("video_100", { duration: Math.round(v.duration || 0) }); } });
    v.play().catch(function () {});
  }
  // Andere Kundenvideos starten: Hauptvideo anhalten
  [].forEach.call(document.querySelectorAll(".kv-play"), function (b) { b.addEventListener("click", function () { if (v) v.pause(); }); });

  var inc = new URLSearchParams(location.search), had = false;
  [].forEach.call(document.querySelectorAll("[data-cta]"), function (a) {
    var url = new URL(a.href);
    inc.forEach(function (val, k) { if (k.indexOf("utm_") === 0 || k === "ref") { url.searchParams.set(k, val); had = true; } });
    if (!url.searchParams.has("utm_source")) { url.searchParams.set("utm_source", "videolp"); url.searchParams.set("utm_medium", "cta"); }
    // Calendly: Name und E Mail aus den Fragen vorausfüllen (03.11.26)
    try { var ml = JSON.parse(localStorage.getItem("makerus_lead") || "null");
      if (ml && url.hostname.indexOf("calendly.com") > -1) {
        var nm = ((ml.firstname || "") + " " + (ml.lastname || "")).trim();
        if (nm) url.searchParams.set("name", nm);
        if (ml.email) url.searchParams.set("email", ml.email);
      } } catch (x) {}
    a.href = url.toString();
    a.addEventListener("click", function () {
      ph("cta_click", { cta_location: a.getAttribute("data-cta"), video_time: v ? Math.round(v.currentTime) : null,
        video_pct: v && v.duration ? Math.round(v.currentTime / v.duration * 100) : null, had_incoming_utm: had });
    });
  });
})();
/* Runde 2: Begrüßung mit Vorname, Knopf leuchtet ab 70 %, feste Leiste am Handy */
(function () {
  "use strict";
  var hi = document.querySelector("[data-hi]");
  try {
    var lead = JSON.parse(sessionStorage.getItem("rr_lead") || "null");
    var vn = lead && lead.vorname ? String(lead.vorname).trim() : "";
    if (hi && vn) { hi.textContent = vn + ", schön, dass du da bist."; hi.hidden = false; }
  } catch (x) {}
  var v = document.getElementById("mainVideo");
  var btn = document.querySelector("#cta-video .vh-cta");
  if (v && btn) {
    var lit = false;
    v.addEventListener("timeupdate", function () {
      if (!lit && v.duration && v.currentTime / v.duration >= 0.7) { lit = true; btn.classList.add("lit"); }
    });
  }
  var bar = document.getElementById("mvSticky");
  var a = document.getElementById("cta-video"), z = document.getElementById("gespraech");
  if (bar && a && z && "IntersectionObserver" in window) {
    var aOut = false, zIn = false;
    var set = function () { var on = aOut && !zIn; bar.classList.toggle("on", on); bar.setAttribute("aria-hidden", on ? "false" : "true"); };
    new IntersectionObserver(function (e) { aOut = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; set(); }).observe(a);
    new IntersectionObserver(function (e) { zIn = e[0].isIntersecting; set(); }).observe(z);
  }
})();
