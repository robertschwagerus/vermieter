/* Terminseite Vermieter: Angaben aus der Opt-in Seite vorausfüllen, 3 Fragen, HubSpot Formular 2,
   dann Calendly eingebettet, nach der Buchung Bestätigung. PostHog wie auf den anderen Seiten. */
(function () {
  "use strict";
  var RR = window.RR || {};
  function ph(n, p) { if (window.posthog && posthog.capture) posthog.capture(n, p || {}); }
  function $(id) { return document.getElementById(id); }
  var lead = null;
  try { lead = JSON.parse(sessionStorage.getItem("rr_lead") || "null"); } catch (x) {}
  if (lead) {
    if (lead.vorname) { $("tmVorname").value = lead.vorname; var hi = document.querySelector("[data-hi]"); if (hi) hi.textContent = lead.vorname + ", fast geschafft."; }
    if (lead.email) $("tmMail").value = lead.email;
    if (lead.tel) $("tmTel").value = lead.tel;
  }
  ph("termin_view", { vorausgefuellt: !!lead });

  var mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, telRe = /^[\d\s()+\/.]{6,20}$/;
  function telDigits(v) { return (v.match(/\d/g) || []).length; }
  var form = $("tmForm"), btn = $("tmBtn"), err = $("tmErr"), label = btn.textContent;
  function bad(id, on) { $(id).closest(".form-group").classList.toggle("err", on); return on; }

  async function sendHubspot(d) {
    var h = RR.hubspotTermin || {};
    if (!h.portalId || !h.formGuid) return { ok: true, demo: true };
    var msg = "Vermieter Funnel, Terminseite" + (d.passt ? "" : " (passt nicht, Steuerguide angeboten)") +
      "\nNetto: " + d.netto + "\nArbeitsvertrag: " + d.vertrag + "\nAngespart: " + d.kapital;
    try {
      var r = await fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + h.portalId + "/" + h.formGuid, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: [
          { name: "firstname", value: d.vorname }, { name: "email", value: d.email }, { name: "phone", value: d.tel },
          { name: "message", value: msg } ], context: { pageUri: location.href, pageName: document.title } })
      });
      return { ok: r.ok, status: r.status };
    } catch (e) { return { ok: false }; }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); err.classList.remove("show");
    var d = { vorname: $("tmVorname").value.trim(), email: $("tmMail").value.trim(), tel: $("tmTel").value.trim(),
      netto: $("tmNetto").value, vertrag: $("tmVertrag").value, kapital: $("tmKapital").value };
    var f = [bad("tmVorname", d.vorname.length < 2), bad("tmMail", !mailOk.test(d.email)), bad("tmTel", !telRe.test(d.tel) || telDigits(d.tel) < 7),
      bad("tmNetto", !d.netto), bad("tmVertrag", !d.vertrag), bad("tmKapital", !d.kapital)];
    if (f.some(Boolean)) { err.textContent = "Bitte fülle alle Felder aus."; err.classList.add("show"); ph("termin_validation_error"); return; }
    // Weiche (Kerim 03.11.26): mindestens 2.400 € netto und unbefristet nach der Probezeit, Regeln in config.js
    var rg = RR.terminRegeln || {};
    d.passt = (rg.nettoNein || []).indexOf(d.netto) < 0 && (rg.vertragJa || []).indexOf(d.vertrag) > -1;
    btn.disabled = true; btn.textContent = "Einen Moment";
    var res = await sendHubspot(d);
    if (!res.ok) {
      btn.disabled = false; btn.textContent = label;
      err.textContent = "Das hat nicht geklappt. Versuch es bitte noch einmal."; err.classList.add("show");
      ph("termin_submit_error", { status: res.status || null }); return;
    }
    try { if (window.posthog && posthog.identify) posthog.identify(d.email.toLowerCase(), { email: d.email.toLowerCase(), vorname: d.vorname }); } catch (x) {}
    ph(d.passt ? "termin_qualifiziert" : "termin_nicht_passend", { netto: d.netto, vertrag: d.vertrag, angespart: d.kapital, demo: !!res.demo });
    form.hidden = true;
    if (!d.passt) {
      $("tmNo").hidden = false;
      $("tmCard").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    $("tmCal").hidden = false;
    $("tmCard").scrollIntoView({ behavior: "smooth", block: "start" });
    openCal(d);
  });

  function openCal(d) {
    var url = RR.terminKalender; if (!url) return;
    var q = new URLSearchParams(location.search), utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      if (q.get(k)) utm[k.replace(/_([a-z])/g, function (m, c) { return c.toUpperCase(); })] = q.get(k);
    });
    function init() { Calendly.initInlineWidget({ url: url + (url.indexOf("?") > -1 ? "&" : "?") + "hide_gdpr_banner=1",
      parentElement: $("tmCalBox"), prefill: { name: d.vorname, email: d.email }, utm: utm }); }
    if (window.Calendly) return init();
    var s = document.createElement("script"); s.src = "https://assets.calendly.com/assets/external/widget.js"; s.async = true; s.onload = init;
    document.head.appendChild(s);
  }

  $("tmGuide").addEventListener("click", function () { ph("steuerguide_download"); });

  window.addEventListener("message", function (e) {
    if (e.origin.indexOf("calendly.com") < 0 || !e.data || !e.data.event) return;
    if (e.data.event === "calendly.date_and_time_selected") ph("termin_zeit_gewaehlt");
    if (e.data.event === "calendly.event_scheduled") {
      ph("termin_gebucht");
      $("tmCal").hidden = true; $("tmDone").hidden = false;
      $("tmCard").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
