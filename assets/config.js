/* Einstellungen für die Rentenreport Seite. Wie bei den Berater Seiten
   (KUNDE Block in mende.html): hier eintragen, sonst nichts anfassen. */
window.RR = {
  marke: "Makerus Consulting",
  firma: "Schwagerus Capital GmbH",
  instagram: "robertschwagerus",
  email: "info@makerus-consulting.de",

  // OFFEN: aus HubSpot, Marketing > Formulare > Einbetten. Leer heißt:
  // Demo Modus, es wird nichts verschickt, die Seite läuft trotzdem durch.
  hubspot: { portalId: "", formGuid: "" },

  // OFFEN: Termin Link von Robert (Calendly o. ä.). Leer heißt: Button
  // öffnet stattdessen eine E Mail an Roberts Team.
  kalender: "",

  pdf: "assets/Rentenreport_Robert_Schwagerus.pdf",
  video: "assets/video/robert-rede.mp4",
  poster: "assets/img/robert-poster.jpg",

  einwilligung:
    "Ich bin einverstanden, dass Makerus Consulting mir den Report und weitere Informationen zu meiner Anfrage per E Mail sendet, mich dazu telefonisch kontaktiert und meine Angaben dafür speichert.",
};
