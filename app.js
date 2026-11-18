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

const PREIS_NEBENSAISON = 120;
const PREIS_HAUPTSAISON = 160;
const ENDREINIGUNG = 80;
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
// 5. ANFRAGEFORMULAR
// =========================================================

const formular = document.getElementById("anfrage-formular");
const feldAnreise = document.getElementById("anreise");
const feldAbreise = document.getElementById("abreise");
const preisVorschau = document.getElementById("preis-vorschau");
const bestaetigung = document.getElementById("bestaetigung");

// Im Datumsfeld keine vergangenen Tage erlauben
feldAnreise.min = zuText(heute());
feldAbreise.min = zuText(plusTage(heute(), 1));

// Kalender -> Formular
function formularAusfuellen() {
  feldAnreise.value = anreise ? zuText(anreise) : "";
  feldAbreise.value = abreise ? zuText(abreise) : "";
  preisBerechnen();
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
  preisBerechnen();
}

feldAnreise.addEventListener("change", datenAusFormular);
feldAbreise.addEventListener("change", datenAusFormular);

function preisBerechnen() {
  if (anreise && abreise && abreise > anreise) {
    const naechte = anzahlNaechte(anreise, abreise);
    const uebernachtungen = gesamtpreis(anreise, abreise);
    preisVorschau.textContent = naechte + " Nächte: CHF " + uebernachtungen + ".– + Endreinigung CHF " +
      ENDREINIGUNG + ".– = CHF " + (uebernachtungen + ENDREINIGUNG) + ".–";
  } else {
    preisVorschau.textContent = "";
  }
}

// Fehlermeldung bei einem Feld anzeigen oder entfernen
function fehlerSetzen(feldId, meldung) {
  const feld = document.getElementById(feldId);
  document.getElementById("fehler-" + feldId).textContent = meldung;
  feld.classList.toggle("ungueltig", meldung !== "");
}

function formularPruefen() {
  let allesOk = true;

  const name = document.getElementById("name").value.trim();
  if (name === "") {
    fehlerSetzen("name", "Bitte geben Sie Ihren Namen ein.");
    allesOk = false;
  } else {
    fehlerSetzen("name", "");
  }

  const email = document.getElementById("email").value.trim();
  // einfache Prüfung: etwas@etwas.etwas
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fehlerSetzen("email", "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    allesOk = false;
  } else {
    fehlerSetzen("email", "");
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
    return;
  }

  const name = document.getElementById("name").value.trim();
  const personen = document.getElementById("personen").value;
  const preis = gesamtpreis(anreise, abreise) + ENDREINIGUNG;

  document.getElementById("bestaetigung-text").textContent =
    name + ", Ihre Anfrage für " + personen + " Person(en) vom " + schoen(anreise) +
    " bis " + schoen(abreise) + " ist bei uns angekommen. Voraussichtlicher Preis: CHF " + preis + ".–";

  formular.hidden = true;
  bestaetigung.hidden = false;
});

document.getElementById("neue-anfrage").addEventListener("click", function () {
  formular.reset();
  anreise = null;
  abreise = null;
  auswahlAnzeigen();
  kalenderZeichnen();
  preisBerechnen();
  bestaetigung.hidden = true;
  formular.hidden = false;
});
