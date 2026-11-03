/* Rentenreport Seite: Kopfleiste, Einblenden, Zähler, Cover Neigung,
   Formular, Video Seite. Kein Framework, keine externen Anfragen. */
(function () {
  "use strict";
  var RR = window.RR || {};
  var doc = document;
  doc.documentElement.classList.add("js");
  var shot = /[?&]shot\b/.test(location.search); // nur für Standbilder
  var reduce = shot || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (shot) doc.documentElement.classList.add("shot");

  /* ---------- Kopfleiste ---------- */
  var header = doc.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Einblenden ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Zähler ---------- */
  var fmt = new Intl.NumberFormat("de-DE");
  function count(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var suffix = (el.getAttribute("data-suffix") || "").replace(/^ /, "\u00a0");
    var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
    if (reduce) { el.textContent = fmt.format(to) + suffix; return; }
    var dur = 1600;
    setTimeout(function () {
      var t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt.format(Math.round(to * e)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay);
  }
  var counters = [].slice.call(doc.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { count(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(count);
  }

  /* ---------- Cover Neigung nach Zeigerposition ---------- */
  var stage = doc.querySelector(".stage");
  if (stage && !reduce && window.matchMedia("(pointer: fine)").matches) {
    var book = stage.querySelector(".book");
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--px", x.toFixed(3));
      stage.style.setProperty("--py", y.toFixed(3));
      book.style.setProperty("--ry", (-22 + x * 16).toFixed(2) + "deg");
      book.style.setProperty("--rx", (7 - y * 12).toFixed(2) + "deg");
    });
    stage.addEventListener("pointerleave", function () {
      stage.style.setProperty("--px", 0); stage.style.setProperty("--py", 0);
      book.style.setProperty("--ry", "-22deg"); book.style.setProperty("--rx", "7deg");
    });
  }

  /* ---------- Scroll zum Formular ---------- */
  [].forEach.call(doc.querySelectorAll("[data-to-form]"), function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var f = doc.querySelector("#eintragen");
      if (f) {
        f.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        setTimeout(function () { var i = f.querySelector("input"); if (i) i.focus({ preventScroll: true }); }, 500);
      }
    });
  });

  /* ---------- Formular ---------- */
  var MC = new URLSearchParams(location.search).get("mc") || "";
  var mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var telRe = /^\+?[\d\s()\/.]{6,20}$/;

  function setErr(field, on) { if (field) field.classList.toggle("err", on); }

  async function sendHubspot(d) {
    var h = RR.hubspot || {};
    if (!h.portalId || !h.formGuid) return { ok: true, demo: true };
    var felder = [
      { name: "firstname", value: d.vorname },
      { name: "lastname", value: d.nachname || "" },
      { name: "email", value: d.email },
      { name: "phone", value: d.tel || "" },
      { name: "message", value: (d.anliegen || "Rentenreport angefordert") + (MC ? "\nManyChat: " + MC : "") + "\nEinwilligung: " + RR.einwilligung }
    ];
    try {
      var r = await fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + h.portalId + "/" + h.formGuid, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: felder,
          context: { pageUri: location.href, pageName: doc.title },
          legalConsentOptions: { consent: { consentToProcess: true, text: RR.einwilligung } }
        })
      });
      return { ok: r.ok, status: r.status };
    } catch (e) { return { ok: false, grund: String(e) }; }
  }

  [].forEach.call(doc.querySelectorAll("form[data-lead]"), function (form) {
    var fName = form.querySelector('[data-f="name"]');
    var fMail = form.querySelector('[data-f="mail"]');
    var fTel = form.querySelector('[data-f="tel"]'); // nur wo das Formular nach der Nummer fragt
    var cons = form.querySelector(".consent");
    var err = form.querySelector(".form-error");
    var btn = form.querySelector("button[type=submit]");
    var label = btn.innerHTML;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      // Feld mit data-voll fragt Vor und Nachname in einem, erstes Wort ist der Vorname
      var nIn = fName.querySelector("input");
      var teile = nIn.value.trim().split(/\s+/);
      var voll = nIn.hasAttribute("data-voll");
      var vorname = teile.shift() || "";
      var nachname = teile.join(" ");
      var nameOk = vorname.length >= 2 && (!voll || nachname.length >= 2);
      var email = fMail.querySelector("input").value.trim();
      var tel = fTel ? fTel.querySelector("input").value.trim() : "";
      var telOk = !fTel || telRe.test(tel);
      var ok = cons.querySelector("input").checked;
      setErr(fName, !nameOk);
      setErr(fMail, !mailOk.test(email));
      setErr(fTel, !telOk);
      cons.classList.toggle("err", !ok);
      err.classList.remove("on");
      if (!nameOk || !mailOk.test(email) || !telOk || !ok) return;

      btn.disabled = true; btn.setAttribute("disabled", ""); btn.innerHTML = "Einen Moment";
      var res = await sendHubspot({ vorname: vorname, nachname: nachname, email: email, tel: tel, anliegen: form.getAttribute("data-anliegen") });
      if (!res.ok) {
        btn.removeAttribute("disabled"); btn.disabled = false; btn.innerHTML = label;
        err.textContent = "Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib an " + (RR.email || "") + ".";
        err.classList.add("on");
        return;
      }
      // PostHog: Person an die E Mail binden, damit Opt-in, Video und Buchung als eine zählen (03.11.26)
      try { if (window.posthog && posthog.identify) { posthog.identify(email.toLowerCase(), { email: email.toLowerCase(), vorname: vorname }); posthog.capture("optin_submit", { anliegen: form.getAttribute("data-anliegen") || "" }); } } catch (x) {}
      try { sessionStorage.setItem("rr_lead", JSON.stringify({ vorname: vorname, nachname: nachname, email: email, tel: tel, t: Date.now() })); /* für die Terminseite vorausgefüllt (03.11.26) */ } catch (x) {}
      // UTM und ref an die nächste Seite weitergeben (03.11.26)
      var q = new URLSearchParams();
      new URLSearchParams(location.search).forEach(function (val, k) { if (k.indexOf("utm_") === 0 || k === "ref") q.set(k, val); });
      if (MC) q.set("mc", MC);
      location.href = (form.getAttribute("data-next") || "video.html") + (q.toString() ? "?" + q.toString() : "");
    });
    [fName, fMail, fTel].filter(Boolean).forEach(function (f) {
      f.querySelector("input").addEventListener("input", function () { setErr(f, false); });
    });
    cons.querySelector("input").addEventListener("change", function () { cons.classList.remove("err"); });
  });

  /* ---------- Video Seite ---------- */
  var gate = doc.querySelector(".gate");
  var main = doc.querySelector("[data-after-gate]");
  if (gate && main) {
    var lead = null;
    try { lead = JSON.parse(sessionStorage.getItem("rr_lead") || "null"); } catch (x) {}
    var preview = new URLSearchParams(location.search).has("preview");
    if (!lead && !preview) {
      main.hidden = true; gate.classList.add("on");
      // Ohne Eintragung kein PDF über den Kopf Button
      [].forEach.call(doc.querySelectorAll(".site-header [data-pdf]"), function (a) { a.remove(); });
    } else {
      var ttl = doc.querySelector("[data-title]");
      if (ttl && lead && lead.vorname) ttl.textContent = lead.vorname + ", dein Report liegt bereit.";
    }
  }

  var player = doc.querySelector(".player");
  if (player) {
    var v = player.querySelector("video");
    var playBtn = player.querySelector(".play");
    var next = doc.querySelector(".next");
    v.src = RR.video; v.poster = RR.poster;
    playBtn.addEventListener("click", function () { v.play(); });
    v.addEventListener("play", function () { player.classList.add("started"); });
    v.addEventListener("ended", function () {
      if (!next) return;
      next.classList.add("pulse");
      next.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      setTimeout(function () { next.classList.remove("pulse"); }, 2600);
    });
    [].forEach.call(doc.querySelectorAll("[data-pdf]"), function (a) {
      a.href = RR.pdf;
    });
  }

  /* ---------- Termin ---------- */
  var book = doc.querySelector("[data-book]");
  if (book) {
    if (RR.kalender) {
      book.addEventListener("click", function (e) {
        e.preventDefault();
        var holder = doc.querySelector("[data-cal]");
        if (!holder.firstChild) {
          var f = doc.createElement("iframe");
          f.src = RR.kalender; f.title = "Termin wählen"; f.loading = "lazy";
          holder.appendChild(f);
        }
        holder.hidden = false;
        holder.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      });
    } else {
      book.href = "mailto:" + RR.email + "?subject=" + encodeURIComponent("Erstgespräch nach dem Rentenreport") +
        "&body=" + encodeURIComponent("Hallo Roberts Team,\n\nich habe den Rentenreport gelesen und möchte ein gratis Erstgespräch.\n\nViele Grüße");
    }
  }
  [].forEach.call(doc.querySelectorAll("[data-ig]"), function (a) {
    a.href = "https://instagram.com/" + RR.instagram;
  });
  [].forEach.call(doc.querySelectorAll("[data-mail]"), function (a) {
    a.href = "mailto:" + RR.email; a.textContent = RR.email;
  });
})();
