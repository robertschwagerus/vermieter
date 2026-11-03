/* Kundenstimmen: Video startet erst beim Antippen, mit Ton. Startet eins, halten die anderen an. */
(function () {
  "use strict";
  var all = [].slice.call(document.querySelectorAll(".kv video"));
  all.forEach(function (v) {
    var box = v.parentNode, btn = box.querySelector(".kv-play");
    btn.addEventListener("click", function () {
      all.forEach(function (o) { if (o !== v) o.pause(); });
      v.controls = true; v.play();
    });
    v.addEventListener("play", function () { box.classList.add("on"); });
  });
})();
