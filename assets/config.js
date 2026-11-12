/* Einstellungen für die Rentenreport Seite. Wie bei den Berater Seiten
   (KUNDE Block in mende.html): hier eintragen, sonst nichts anfassen. */
window.RR = {
  marke: "Makerus Consulting",
  firma: "Schwagerus Capital GmbH",
  instagram: "robertschwagerus",
  email: "info@makerus-consulting.de",

  // OFFEN: aus HubSpot, Marketing > Formulare > Einbetten. Leer heißt:
  // Demo Modus, es wird nichts verschickt, die Seite läuft trotzdem durch.
  hubspot: { portalId: "139527252", formGuid: "43dfa7d0-ba7e-46dd-a7ea-a663d2e42aa2" }, // Vermieter Opt-in (Video anfordern), angelegt 03.11.26

  // OFFEN: Termin Link von Robert (Calendly o. ä.). Leer heißt: Button
  // öffnet stattdessen eine E Mail an Roberts Team.
  kalender: "",

  // Vermieter Funnel Seite 3 (termin.html), Briefing Simon 03.11.26.
  // OFFEN: zweites HubSpot Formular von Simon (eigene Form GUID). Leer heißt Demo, nichts wird gesendet.
  hubspotTermin: { portalId: "139527252", formGuid: "09fb462c-d926-4174-a7ec-470f4a9080d2" }, // Vermieter Termin (Qualifizierung + Buchung), angelegt 03.11.26
  // Kalender der Berater. Platzhalter: der Calendly Link aus start/analyse.html, bis Simon den finalen schickt.
  // Weiche auf der Terminseite (Kerim 03.11.26): passt nur mit mind. 2.400 € netto UND unbefristet nach der Probezeit.
  // Sonst Steuerguide statt Kalender. Texte müssen exakt den Optionen in termin.html entsprechen.
  terminRegeln: {
    nettoNein: ["Unter 2.400 €"],
    vertragJa: ["Unbefristet, Probezeit vorbei"],
  },
  terminKalender: "https://calendly.com/d/cq7g-6cd-hnm/erstgesprach-zum-vermogensaufbau",

  pdf: "assets/Rentenreport_Robert_Schwagerus.pdf",
  video: "assets/video/robert-rede.mp4",
  poster: "assets/img/robert-poster.jpg",

  einwilligung:
    "Ich bin einverstanden, dass Makerus Consulting mir den Report und weitere Informationen zu meiner Anfrage per E Mail sendet, mich dazu telefonisch kontaktiert und meine Angaben dafür speichert.",
};
