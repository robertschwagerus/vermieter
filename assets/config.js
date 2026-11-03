/* Einstellungen für die Rentenreport Seite. Wie bei den Berater Seiten
   (KUNDE Block in mende.html): hier eintragen, sonst nichts anfassen. */
window.RR = {
  marke: "Makerus Consulting",
  firma: "Schwagerus Capital GmbH",
  instagram: "robertschwagerus",
  email: "info@makerus-consulting.de",

  // OFFEN: aus HubSpot, Marketing > Formulare > Einbetten. Leer heißt:
  // Demo Modus, es wird nichts verschickt, die Seite läuft trotzdem durch.
  hubspot: { portalId: "139527252", formGuid: "887bfec9-3666-42d0-bcb5-357a4747e603" }, // Übergang 03.11.26: Analyseformular, bis Simons Opt-in Form da ist

  // OFFEN: Termin Link von Robert (Calendly o. ä.). Leer heißt: Button
  // öffnet stattdessen eine E Mail an Roberts Team.
  kalender: "",

  // Vermieter Funnel Seite 3 (termin.html), Briefing Simon 03.11.26.
  // OFFEN: zweites HubSpot Formular von Simon (eigene Form GUID). Leer heißt Demo, nichts wird gesendet.
  hubspotTermin: { portalId: "139527252", formGuid: "887bfec9-3666-42d0-bcb5-357a4747e603" }, // Übergang 03.11.26, bis Simons Termin Form da ist
  // Kalender der Berater. Platzhalter: der Calendly Link aus start/analyse.html, bis Simon den finalen schickt.
  // Weiche auf der Terminseite (Kerim 03.11.26): passt nur mit mind. 2.800 € netto UND unbefristet nach der Probezeit.
  // Sonst Steuerguide statt Kalender. Texte müssen exakt den Optionen in termin.html entsprechen.
  terminRegeln: {
    nettoNein: ["Unter 2.800 €"],
    vertragJa: ["Unbefristet, Probezeit vorbei"],
  },
  terminKalender: "https://calendly.com/d/cq7g-6cd-hnm/erstgesprach-zum-vermogensaufbau",

  pdf: "assets/Rentenreport_Robert_Schwagerus.pdf",
  video: "assets/video/robert-rede.mp4",
  poster: "assets/img/robert-poster.jpg",

  einwilligung:
    "Ich bin einverstanden, dass Makerus Consulting mir den Report und weitere Informationen zu meiner Anfrage per E Mail sendet, mich dazu telefonisch kontaktiert und meine Angaben dafür speichert.",
};
