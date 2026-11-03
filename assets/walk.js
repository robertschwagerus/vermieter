/* Wohnung als fester Hintergrund (Kerim 29.10.26). Der Scroll über die ganze
   Seite wird zu p von 0 bis 1 und spult den Film (nur Keyframes, als Blob
   geladen, damit er auch ohne Range-Anfragen springt). Ohne Film blendet der
   neue Flur über den alten. */
(function () {
  "use strict";
  var body = document.body;
  var bg = document.querySelector(".walk-bg");
  if (!bg) return;
  var film = bg.querySelector(".walk-film");
  var clamp = function (x) { return Math.min(1, Math.max(0, x)); };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  var hasFilm = false, shown = 0, target = 0, raf = 0;
  if (film && film.dataset.src) {
    fetch(film.dataset.src).then(function (r) { if (!r.ok) throw r; return r.blob(); })
      .then(function (b) { film.src = URL.createObjectURL(b); })
      .catch(function () {});
    film.addEventListener("loadeddata", function () { hasFilm = true; body.classList.add("has-film"); request(); }, { once: true });
  }

  function progress() {
    var len = document.documentElement.scrollHeight - window.innerHeight;
    return len > 0 ? clamp(window.scrollY / len) : 0;
  }
  function tick() {
    raf = 0;
    target = progress();
    // Weich nachziehen, damit das Spulen am Mausrad nicht springt
    shown += (target - shown) * 0.18;
    if (Math.abs(target - shown) < 0.0005) shown = target;
    var p = shown;
    // Bis knapp vor dem Ende fertig saniert, die Fragen stehen im neuen Flur
    var f = smooth(0.02, 0.85, p);
    bg.style.setProperty("--neu", f.toFixed(3));
    if (hasFilm && film.duration) {
      var t = f * (film.duration - 0.05);
      if (Math.abs(film.currentTime - t) > 0.02) film.currentTime = t;
    }
    if (shown !== target) raf = requestAnimationFrame(tick);
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  tick();
})();
