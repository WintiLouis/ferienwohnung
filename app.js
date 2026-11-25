// =========================================================
// 1. ALLGEMEIN
// =========================================================

// Aktuelles Jahr im Footer anzeigen
document.getElementById("jahr").textContent = new Date().getFullYear();

// Mobiles Menü: Klick auf den Menü-Button öffnet bzw. schliesst die Navigation
const menueButton = document.getElementById("menue-button");
const navigation = document.getElementById("navigation");

menueButton.addEventListener("click", function () {
  const istOffen = navigation.classList.toggle("offen");
  menueButton.setAttribute("aria-expanded", istOffen);
});

// Nach Klick auf einen Link das Menü wieder schliessen
navigation.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navigation.classList.remove("offen");
    menueButton.setAttribute("aria-expanded", false);
  });
});


// =========================================================
// 2. DATEN: belegte Zeiträume und Preise
// =========================================================

// "von" = Anreisetag der bestehenden Buchung, "bis" = Abreisetag.
// Am Abreisetag kann der nächste Gast schon wieder anreisen.
const belegteZeitraeume = [
  { von: "2026-11-27", bis: "2026-11-30" },
  { von: "2026-12-20", bis: "2027-01-03" },
  { von: "2027-01-15", bis: "2027-01-19" },
  { von: "2027-02-07", bis: "2027-02-14" },
  { von: "2027-04-03", bis: "2027-04-10" }
];

const PREIS_NEBENSAISON = 360;
const PREIS_HAUPTSAISON = 480;
const ENDREINIGUNG = 240;
const MINDEST_NAECHTE = 3;


// =========================================================
// 3. HILFSFUNKTIONEN FÜR DATUM
// =========================================================

// Datum -> Text "2026-11-27" (so wie im <input type="date">)
function zuText(datum) {
  const jahr = datum.getFullYear();
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");
  return jahr + "-" + monat + "-" + tag;
}

// Text "2026-11-27" -> Datum (ohne Uhrzeit-Probleme)
function zuDatum(text) {
  const teile = text.split("-");
  return new Date(Number(teile[0]), Number(teile[1]) - 1, Number(teile[2]));
}

// Datum schön anzeigen, z. B. "27. November 2026"
function schoen(datum) {
  return datum.toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
}

function plusTage(datum, anzahl) {
  return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate() + anzahl);
}

function heute() {
  const jetzt = new Date();
  return new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
}

// Ist die Nacht, die an diesem Tag beginnt, schon gebucht?
function istBelegt(datum) {
  const text = zuText(datum);
  return belegteZeitraeume.some(function (z) {
    return text >= z.von && text < z.bis; // Texte im Format JJJJ-MM-TT kann man direkt vergleichen
  });
}

// Sind alle Nächte von "anreise" bis "abreise" frei?
function istZeitraumFrei(anreise, abreise) {
  for (let tag = anreise; tag < abreise; tag = plusTage(tag, 1)) {
    if (istBelegt(tag)) {
      return false;
    }
  }
  return true;
}

function anzahlNaechte(anreise, abreise) {
  return Math.round((abreise - anreise) / (1000 * 60 * 60 * 24));
}

// Hauptsaison: Mai (4) bis September (8)
function preisProNacht(datum) {
  const monat = datum.getMonth();
  return monat >= 4 && monat <= 8 ? PREIS_HAUPTSAISON : PREIS_NEBENSAISON;
}

function gesamtpreis(anreise, abreise) {
  let summe = 0;
  for (let tag = anreise; tag < abreise; tag = plusTage(tag, 1)) {
    summe += preisProNacht(tag);
  }
  return summe;
}


// =========================================================
// 4. BELEGUNGSKALENDER
// =========================================================

const monatsnamen = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];

let angezeigterMonat = new Date(heute().getFullYear(), heute().getMonth(), 1);
let anreise = null;
let abreise = null;

const kalenderTage = document.getElementById("kalender-tage");
const monatTitel = document.getElementById("monat-titel");
const knopfZurueck = document.getElementById("monat-zurueck");
const auswahlText = document.getElementById("auswahl-text");

function kalenderZeichnen() {
  const jahr = angezeigterMonat.getFullYear();
  const monat = angezeigterMonat.getMonth();

  monatTitel.textContent = monatsnamen[monat] + " " + jahr;
  kalenderTage.innerHTML = "";

  // Nicht in die Vergangenheit blättern
  knopfZurueck.disabled = jahr === heute().getFullYear() && monat === heute().getMonth();

  // Leere Felder vor dem 1. (Woche beginnt am Montag)
  const ersterTag = new Date(jahr, monat, 1);
  const leereFelder = (ersterTag.getDay() + 6) % 7;
  for (let i = 0; i < leereFelder; i++) {
    kalenderTage.appendChild(document.createElement("span"));
  }

  const tageImMonat = new Date(jahr, monat + 1, 0).getDate();
  for (let tag = 1; tag <= tageImMonat; tag++) {
    const datum = new Date(jahr, monat, tag);
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.textContent = tag;
    knopf.className = "tag";

    if (datum < heute()) {
      knopf.classList.add("vergangen");
      knopf.disabled = true;
    } else if (istBelegt(datum)) {
      knopf.classList.add("belegt");
      knopf.setAttribute("aria-label", tag + ". belegt");
    }

    if (zuText(datum) === zuText(heute())) {
      knopf.classList.add("heute");
    }

    // Auswahl markieren
    if (anreise && zuText(datum) === zuText(anreise)) knopf.classList.add("gewaehlt");
    if (abreise && zuText(datum) === zuText(abreise)) knopf.classList.add("gewaehlt");
    if (anreise && abreise && datum > anreise && datum < abreise) knopf.classList.add("im-zeitraum");

    knopf.addEventListener("click", function () {
      tagGeklickt(datum);
    });

    kalenderTage.appendChild(knopf);
  }
}

function tagGeklickt(datum) {
  // Fall 1: noch nichts gewählt oder schon fertig gewählt -> neue Anreise
  if (!anreise || abreise || datum <= anreise) {
    if (istBelegt(datum)) {
      auswahlText.textContent = "Dieser Tag ist leider schon belegt.";
      return;
    }
    anreise = datum;
    abreise = null;
  } else {
    // Fall 2: Anreise steht, jetzt die Abreise
    if (!istZeitraumFrei(anreise, datum)) {
      auswahlText.textContent = "In diesem Zeitraum ist die Wohnung schon belegt. Bitte andere Daten wählen.";
      return;
    }
    abreise = datum;
  }

  auswahlAnzeigen();
  formularAusfuellen();
  kalenderZeichnen();
}

function auswahlAnzeigen() {
  if (anreise && abreise) {
    auswahlText.textContent = "Ihre Auswahl: " + schoen(anreise) + " bis " + schoen(abreise) +
      " (" + anzahlNaechte(anreise, abreise) + " Nächte)";
  } else if (anreise) {
    auswahlText.textContent = "Anreise: " + schoen(anreise) + " – jetzt den Abreisetag wählen.";
  } else {
    auswahlText.textContent = "Noch keine Daten gewählt.";
  }
}

document.getElementById("monat-zurueck").addEventListener("click", function () {
  angezeigterMonat = new Date(angezeigterMonat.getFullYear(), angezeigterMonat.getMonth() - 1, 1);
  kalenderZeichnen();
});

document.getElementById("monat-vor").addEventListener("click", function () {
  angezeigterMonat = new Date(angezeigterMonat.getFullYear(), angezeigterMonat.getMonth() + 1, 1);
  kalenderZeichnen();
});

kalenderZeichnen();


// =========================================================
// 5. BUCHUNGSFORMULAR
// =========================================================

const MAX_GAESTE = 4;

const formular = document.getElementById("buchungs-formular");
const feldAnreise = document.getElementById("anreise");
const feldAbreise = document.getElementById("abreise");
const feldErwachsene = document.getElementById("erwachsene");
const feldKinder = document.getElementById("kinder");
const zusammenfassung = document.getElementById("zusammenfassung");
const zusammenfassungLeer = document.getElementById("zusammenfassung-leer");
const bestaetigung = document.getElementById("bestaetigung");

// Im Datumsfeld keine vergangenen Tage erlauben
feldAnreise.min = zuText(heute());
feldAbreise.min = zuText(plusTage(heute(), 1));

// Kalender -> Formular
function formularAusfuellen() {
  feldAnreise.value = anreise ? zuText(anreise) : "";
  feldAbreise.value = abreise ? zuText(abreise) : "";
  zusammenfassungZeigen();
}

// Formular -> Kalender (wenn jemand die Daten direkt eintippt)
function datenAusFormular() {
  anreise = feldAnreise.value ? zuDatum(feldAnreise.value) : null;
  abreise = feldAbreise.value ? zuDatum(feldAbreise.value) : null;
  if (anreise) {
    angezeigterMonat = new Date(anreise.getFullYear(), anreise.getMonth(), 1);
  }
  auswahlAnzeigen();
  kalenderZeichnen();
  zusammenfassungZeigen();
}

feldAnreise.addEventListener("change", datenAusFormular);
feldAbreise.addEventListener("change", datenAusFormular);
feldErwachsene.addEventListener("change", zusammenfassungZeigen);
feldKinder.addEventListener("change", zusammenfassungZeigen);

// Text wie "2 Erwachsene, 1 Kind"
function gaesteText() {
  const erwachsene = Number(feldErwachsene.value);
  const kinder = Number(feldKinder.value);
  let text = erwachsene + (erwachsene === 1 ? " erwachsene Person" : " Erwachsene");
  if (kinder > 0) {
    text += ", " + kinder + (kinder === 1 ? " Kind" : " Kinder");
  }
  return text;
}

// Eine Zeile in der Zusammenfassung: Begriff links, Wert rechts
function zeileHinzufuegen(begriff, wert, istSumme) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = begriff;
  dd.textContent = wert;
  if (istSumme) {
    dt.className = "summe";
    dd.className = "summe";
  }
  zusammenfassung.append(dt, dd);
}

// Rechte Spalte "Ihre Buchung" mit Daten und Preis füllen
function zusammenfassungZeigen() {
  zusammenfassung.innerHTML = "";
  const datenOk = anreise && abreise && abreise > anreise;
  zusammenfassungLeer.hidden = datenOk;
  if (!datenOk) {
    return;
  }

  const naechte = anzahlNaechte(anreise, abreise);
  const uebernachtungen = gesamtpreis(anreise, abreise);

  zeileHinzufuegen("Anreise", schoen(anreise));
  zeileHinzufuegen("Abreise", schoen(abreise));
  zeileHinzufuegen("Gäste", gaesteText());
  zeileHinzufuegen(naechte + (naechte === 1 ? " Nacht" : " Nächte"), "CHF " + uebernachtungen + ".–");
  zeileHinzufuegen("Endreinigung", "CHF " + ENDREINIGUNG + ".–");
  zeileHinzufuegen("Total", "CHF " + (uebernachtungen + ENDREINIGUNG) + ".–", true);
}

// Fehlermeldung bei einem Feld anzeigen oder entfernen
function fehlerSetzen(feldId, meldung) {
  const feld = document.getElementById(feldId);
  document.getElementById("fehler-" + feldId).textContent = meldung;
  feld.classList.toggle("ungueltig", meldung !== "");
}

// Pflichtfeld prüfen: leer -> Fehlermeldung, sonst Regel (regex) testen
function textfeldPruefen(feldId, meldungLeer, regel, meldungFalsch) {
  const wert = document.getElementById(feldId).value.trim();
  if (wert === "") {
    fehlerSetzen(feldId, meldungLeer);
    return false;
  }
  if (regel && !regel.test(wert)) {
    fehlerSetzen(feldId, meldungFalsch);
    return false;
  }
  fehlerSetzen(feldId, "");
  return true;
}

function formularPruefen() {
  let allesOk = true;

  // Mit "&&" würde nach dem ersten Fehler nicht mehr weitergeprüft,
  // darum wird jedes Feld einzeln geprüft.
  const ergebnisse = [
    textfeldPruefen("vorname", "Bitte geben Sie Ihren Vornamen ein."),
    textfeldPruefen("nachname", "Bitte geben Sie Ihren Nachnamen ein."),
    // einfache Prüfung: etwas@etwas.etwas
    textfeldPruefen("email", "Bitte geben Sie Ihre E-Mail-Adresse ein.",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Bitte geben Sie eine gültige E-Mail-Adresse ein."),
    // mindestens 8 Zeichen aus Ziffern, Leerzeichen, + / -
    textfeldPruefen("telefon", "Bitte geben Sie eine Telefonnummer ein.",
      /^\+?[\d\s\/-]{8,}$/, "Bitte geben Sie eine gültige Telefonnummer ein."),
    textfeldPruefen("strasse", "Bitte geben Sie Strasse und Hausnummer ein."),
    textfeldPruefen("plz", "Bitte PLZ eingeben.", /^\d{4,5}$/, "4 oder 5 Ziffern."),
    textfeldPruefen("ort", "Bitte geben Sie Ihren Wohnort ein.")
  ];
  if (ergebnisse.includes(false)) {
    allesOk = false;
  }

  const gaeste = Number(feldErwachsene.value) + Number(feldKinder.value);
  if (gaeste > MAX_GAESTE) {
    fehlerSetzen("kinder", "Die Wohnung ist für höchstens " + MAX_GAESTE + " Personen.");
    allesOk = false;
  } else {
    fehlerSetzen("kinder", "");
  }

  if (!document.getElementById("bedingungen").checked) {
    fehlerSetzen("bedingungen", "Bitte bestätigen Sie, dass Sie die Hinweise gelesen haben.");
    allesOk = false;
  } else {
    fehlerSetzen("bedingungen", "");
  }

  if (!anreise) {
    fehlerSetzen("anreise", "Bitte wählen Sie einen Anreisetag.");
    allesOk = false;
  } else if (anreise < heute()) {
    fehlerSetzen("anreise", "Der Anreisetag liegt in der Vergangenheit.");
    allesOk = false;
  } else {
    fehlerSetzen("anreise", "");
  }

  if (!abreise) {
    fehlerSetzen("abreise", "Bitte wählen Sie einen Abreisetag.");
    allesOk = false;
  } else if (anreise && abreise <= anreise) {
    fehlerSetzen("abreise", "Die Abreise muss nach der Anreise sein.");
    allesOk = false;
  } else if (anreise && anzahlNaechte(anreise, abreise) < MINDEST_NAECHTE) {
    fehlerSetzen("abreise", "Der Mindestaufenthalt ist " + MINDEST_NAECHTE + " Nächte.");
    allesOk = false;
  } else if (anreise && !istZeitraumFrei(anreise, abreise)) {
    fehlerSetzen("abreise", "In diesem Zeitraum ist die Wohnung schon belegt.");
    allesOk = false;
  } else {
    fehlerSetzen("abreise", "");
  }

  return allesOk;
}

formular.addEventListener("submit", function (ereignis) {
  ereignis.preventDefault(); // Seite nicht neu laden

  if (!formularPruefen()) {
    // zum ersten Feld mit Fehler springen
    const ersterFehler = formular.querySelector(".ungueltig");
    if (ersterFehler) {
      ersterFehler.focus();
    }
    return;
  }

  const vorname = document.getElementById("vorname").value.trim();
  const zahlung = formular.querySelector("input[name='zahlung']:checked").value;
  const preis = gesamtpreis(anreise, abreise) + ENDREINIGUNG;

  // Buchungsnummer, z. B. "SB-2026-4821"
  const nummer = "SB-" + anreise.getFullYear() + "-" + (1000 + Math.floor(Math.random() * 9000));

  document.getElementById("buchungsnummer").textContent = nummer;
  document.getElementById("bestaetigung-text").textContent =
    vorname + ", Ihre Buchung für " + gaesteText() + " vom " + schoen(anreise) +
    " bis " + schoen(abreise) + " ist bestätigt. Total: CHF " + preis + ".–, Bezahlung: " + zahlung + ".";

  // Zeitraum im Kalender als belegt eintragen (nur bis die Seite neu geladen wird)
  belegteZeitraeume.push({ von: zuText(anreise), bis: zuText(abreise) });
  anreise = null;
  abreise = null;
  auswahlAnzeigen();
  kalenderZeichnen();

  formular.hidden = true;
  bestaetigung.hidden = false;
  document.getElementById("buchen").scrollIntoView();
});

document.getElementById("neue-buchung").addEventListener("click", function () {
  formular.reset();
  anreise = null;
  abreise = null;
  auswahlAnzeigen();
  kalenderZeichnen();
  zusammenfassungZeigen();
  bestaetigung.hidden = true;
  formular.hidden = false;
});

zusammenfassungZeigen();
