// =========================================================
// GALERIE-SEITE (galerie.html)
// =========================================================


// =========================================================
// 1. BILDER – nur hier eintragen!
//    Alle sechs Darstellungen auf der Seite werden automatisch
//    aus dieser Liste gebaut. Neues Bild: Datei in den Ordner
//    "img" legen und hier einen Eintrag ergänzen.
// =========================================================
const bilder = [
  {
    datei: "img/haus.jpg",
    titel: "Das Haus",
    kurz: "Unser Haus",
    text: "Direkt am Seeufer – mit Holzbalkon und eigenem Steg.",
    alt: "Haus am Seeufer mit Holzbalkon und Steg"
  },
  {
    datei: "img/wohnzimmer.jpg",
    titel: "Wohnzimmer",
    kurz: "Wohnzimmer",
    text: "Grünes Sofa, Holztisch und ein grosses Fenster zum See.",
    alt: "Wohnzimmer mit grünem Sofa, Holztisch und grossem Fenster zum See"
  },
  {
    datei: "img/schlafzimmer.jpg",
    titel: "Schlafzimmer",
    kurz: "Schlafzimmer",
    text: "Das Doppelbett – beim Aufwachen sieht man den See.",
    alt: "Schlafzimmer mit Doppelbett und grossem Fenster zum See"
  },
  {
    datei: "img/see.jpg",
    titel: "Der See am Abend",
    kurz: "Abends am See",
    text: "Zwei Minuten zu Fuss: der Bergsee im letzten Licht.",
    alt: "Bergsee am Abend mit Segelboot"
  }
];

// Hat jemand im Betriebssystem "weniger Bewegung" eingestellt?
const wenigBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// =========================================================
// 2. ALLGEMEIN – Jahr im Footer und Handy-Menü (wie in app.js)
// =========================================================
document.getElementById("jahr").textContent = new Date().getFullYear();

const menueButton = document.getElementById("menue-button");
const navigation = document.getElementById("navigation");

menueButton.addEventListener("click", function () {
  const istOffen = navigation.classList.toggle("offen");
  menueButton.setAttribute("aria-expanded", istOffen);
});

navigation.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navigation.classList.remove("offen");
    menueButton.setAttribute("aria-expanded", false);
  });
});


// =========================================================
// 3. HILFSFUNKTIONEN
// =========================================================

// Nummer "im Kreis": nach dem letzten Bild kommt wieder das erste
// (und vor dem ersten das letzte)
function imKreis(nummer) {
  return (nummer % bilder.length + bilder.length) % bilder.length;
}

// Neues HTML-Element mit Klasse erstellen
function neu(tag, klasse) {
  const element = document.createElement(tag);
  if (klasse) {
    element.className = klasse;
  }
  return element;
}

// <img> für ein Bild aus der Liste erstellen
function bildErstellen(bild, spaeterLaden) {
  const img = document.createElement("img");
  img.src = bild.datei;
  img.alt = bild.alt;
  img.width = 1536;
  img.height = 1024;
  if (spaeterLaden) {
    img.loading = "lazy"; // erst laden, wenn man in die Nähe scrollt
  }
  return img;
}


// =========================================================
// 4. LIGHTBOX – Bild in voller Grösse
//    Wird von fast allen Darstellungen unten benutzt.
// =========================================================
const lightbox = document.getElementById("lightbox");
const lightboxBild = document.getElementById("lightbox-bild");
let lightboxNummer = 0;

function lightboxZeigen(nummer) {
  lightboxNummer = imKreis(nummer);
  const bild = bilder[lightboxNummer];
  lightboxBild.src = bild.datei;
  lightboxBild.alt = bild.alt;
  document.getElementById("lightbox-titel").textContent = bild.titel;
  document.getElementById("lightbox-text").textContent = bild.text;
  document.getElementById("lightbox-zaehler").textContent = (lightboxNummer + 1) + " / " + bilder.length;
}

function lightboxOeffnen(nummer) {
  lightboxZeigen(nummer);
  lightbox.showModal(); // <dialog> legt sich über die ganze Seite, Esc schliesst automatisch
}

document.getElementById("lightbox-zu").addEventListener("click", function () {
  lightbox.close();
});
document.getElementById("lightbox-zurueck").addEventListener("click", function () {
  lightboxZeigen(lightboxNummer - 1);
});
document.getElementById("lightbox-vor").addEventListener("click", function () {
  lightboxZeigen(lightboxNummer + 1);
});

// Klick neben das Bild schliesst die Lightbox
lightbox.addEventListener("click", function (ereignis) {
  if (ereignis.target === lightbox || ereignis.target.classList.contains("lightbox-inhalt")) {
    lightbox.close();
  }
});

// Pfeiltasten auf der Tastatur
lightbox.addEventListener("keydown", function (ereignis) {
  if (ereignis.key === "ArrowLeft") lightboxZeigen(lightboxNummer - 1);
  if (ereignis.key === "ArrowRight") lightboxZeigen(lightboxNummer + 1);
});


// =========================================================
// 5. DIASHOW – Überblenden mit langsamem Zoom
//    Der Takt kommt vom Fortschrittsbalken: Die CSS-Animation
//    füllt ihn, und wenn sie fertig ist, kommt das nächste Bild.
//    Anhalten = Animation pausieren. So braucht es keinen Timer.
// =========================================================
const diashow = document.getElementById("diashow-box");
const diashowBilder = document.getElementById("diashow-bilder");
const diashowPunkte = document.getElementById("diashow-punkte");
const diashowBalken = document.getElementById("diashow-balken");
const diashowPause = document.getElementById("diashow-pause");
let diaNummer = 0;

bilder.forEach(function (bild, i) {
  const dia = neu("figure", "dia");
  dia.appendChild(bildErstellen(bild, false));

  const text = neu("figcaption");
  const titel = neu("strong");
  titel.textContent = bild.titel;
  const beschreibung = neu("span");
  beschreibung.textContent = bild.text;
  text.append(titel, beschreibung);
  dia.appendChild(text);
  diashowBilder.appendChild(dia);

  const punkt = neu("button", "punkt");
  punkt.type = "button";
  punkt.setAttribute("aria-label", "Bild " + (i + 1) + ": " + bild.titel);
  punkt.addEventListener("click", function () {
    diaZeigen(i);
  });
  diashowPunkte.appendChild(punkt);
});

function diaZeigen(nummer) {
  diaNummer = imKreis(nummer);

  diashowBilder.querySelectorAll(".dia").forEach(function (dia, i) {
    dia.classList.toggle("aktiv", i === diaNummer);
    dia.setAttribute("aria-hidden", i !== diaNummer);
  });
  diashowPunkte.querySelectorAll(".punkt").forEach(function (punkt, i) {
    punkt.classList.toggle("aktiv", i === diaNummer);
    punkt.setAttribute("aria-current", i === diaNummer);
  });

  // Fortschrittsbalken von vorne starten
  diashowBalken.classList.remove("laeuft");
  void diashowBalken.offsetWidth; // Trick: zwingt den Browser, die Animation neu zu starten
  diashowBalken.classList.add("laeuft");
}

function diashowPausieren(pausiert) {
  diashow.classList.toggle("pausiert", pausiert);
  diashowPause.setAttribute("aria-label", pausiert ? "Diashow abspielen" : "Diashow anhalten");
}

diashowBalken.addEventListener("animationend", function () {
  diaZeigen(diaNummer + 1);
});
diashowPause.addEventListener("click", function () {
  diashowPausieren(!diashow.classList.contains("pausiert"));
});
document.getElementById("diashow-zurueck").addEventListener("click", function () {
  diaZeigen(diaNummer - 1);
});
document.getElementById("diashow-vor").addEventListener("click", function () {
  diaZeigen(diaNummer + 1);
});

// Bei "weniger Bewegung" startet die Diashow angehalten
diashowPausieren(wenigBewegung);
void diashowBilder.offsetWidth; // damit auch beim ersten Bild der Zoom sichtbar ist
diaZeigen(0);


// =========================================================
// 6. RUNDGANG – Bilderband, das seitlich verschoben wird
// =========================================================
const rundgangFenster = document.getElementById("rundgang-fenster");
const rundgangBand = document.getElementById("rundgang-band");
const rundgangVorschau = document.getElementById("rundgang-vorschau");
let rundgangNummer = 0;

bilder.forEach(function (bild, i) {
  const img = bildErstellen(bild, false);
  img.draggable = false; // sonst zieht der Browser beim Wischen das Bild mit
  img.addEventListener("click", function () {
    if (!gewischt) {
      lightboxOeffnen(i);
    }
  });
  rundgangBand.appendChild(img);

  const knopf = neu("button", "vorschau-bild");
  knopf.type = "button";
  knopf.setAttribute("aria-label", "Bild " + (i + 1) + " zeigen: " + bild.titel);
  knopf.appendChild(bildErstellen(bild, true));
  knopf.addEventListener("click", function () {
    rundgangZeigen(i);
  });
  rundgangVorschau.appendChild(knopf);
});

function rundgangZeigen(nummer) {
  rundgangNummer = imKreis(nummer);
  const bild = bilder[rundgangNummer];

  // Band um ganze Bildbreiten nach links schieben
  rundgangBand.style.transform = "translateX(" + (rundgangNummer * -100) + "%)";

  document.getElementById("rundgang-zaehler").textContent = (rundgangNummer + 1) + " / " + bilder.length;
  document.getElementById("rundgang-titel").textContent = bild.titel;
  document.getElementById("rundgang-text").textContent = bild.text;

  rundgangVorschau.querySelectorAll(".vorschau-bild").forEach(function (knopf, i) {
    knopf.classList.toggle("aktiv", i === rundgangNummer);
    knopf.setAttribute("aria-current", i === rundgangNummer);
  });
}

document.getElementById("rundgang-zurueck").addEventListener("click", function () {
  rundgangZeigen(rundgangNummer - 1);
});
document.getElementById("rundgang-vor").addEventListener("click", function () {
  rundgangZeigen(rundgangNummer + 1);
});

// Wischen (Handy) bzw. Ziehen mit der Maus
let wischStart = null;
let gewischt = false;

rundgangFenster.addEventListener("pointerdown", function (ereignis) {
  wischStart = ereignis.clientX;
  gewischt = false;
});

rundgangFenster.addEventListener("pointerup", function (ereignis) {
  if (wischStart === null) {
    return;
  }
  const weg = ereignis.clientX - wischStart;
  wischStart = null;
  if (Math.abs(weg) > 40) {
    gewischt = true; // verhindert, dass danach noch die Lightbox aufgeht
    rundgangZeigen(rundgangNummer + (weg < 0 ? 1 : -1));
  }
});

rundgangZeigen(0);


// =========================================================
// 7. 3D-KARUSSELL
//    Jede Karte bekommt je nach Abstand zum vorderen Bild
//    eine andere Position, Drehung und Grösse.
// =========================================================
const karussell = document.getElementById("karussell");
let karussellNummer = 0;

const karten = bilder.map(function (bild, i) {
  const karte = neu("button", "karussell-karte");
  karte.type = "button";
  karte.setAttribute("aria-label", bild.titel);
  karte.appendChild(bildErstellen(bild, true));
  karte.addEventListener("click", function () {
    if (i === karussellNummer) {
      lightboxOeffnen(i);
    } else {
      karussellZeigen(i);
    }
  });
  karussell.appendChild(karte);
  return karte;
});

function karussellZeigen(nummer) {
  karussellNummer = imKreis(nummer);

  karten.forEach(function (karte, i) {
    // Abstand zum vorderen Bild: 0 = vorne, -1 = links daneben, 1 = rechts daneben ...
    let abstand = i - karussellNummer;
    if (abstand > bilder.length / 2) abstand -= bilder.length;
    if (abstand < -bilder.length / 2) abstand += bilder.length;
    const betrag = Math.abs(abstand);

    karte.style.transform =
      "translateX(" + (abstand * 48) + "%) " +
      "translateZ(" + (betrag * -220) + "px) " +
      "rotateY(" + (Math.sign(abstand) * -38) + "deg)";
    karte.style.zIndex = 10 - betrag;
    karte.style.opacity = betrag > 1 ? 0.45 : 1;
    karte.classList.toggle("aktiv", abstand === 0);
    karte.setAttribute("aria-label", bilder[i].titel + (abstand === 0 ? " – gross ansehen" : " – nach vorne holen"));
  });

  document.getElementById("karussell-titel").textContent = bilder[karussellNummer].titel;
}

document.getElementById("karussell-zurueck").addEventListener("click", function () {
  karussellZeigen(karussellNummer - 1);
});
document.getElementById("karussell-vor").addEventListener("click", function () {
  karussellZeigen(karussellNummer + 1);
});
karussell.addEventListener("keydown", function (ereignis) {
  if (ereignis.key === "ArrowLeft") karussellZeigen(karussellNummer - 1);
  if (ereignis.key === "ArrowRight") karussellZeigen(karussellNummer + 1);
});

karussellZeigen(0);


// =========================================================
// 8. PINNWAND – Sofortbilder
// =========================================================
const pinnwand = document.getElementById("pinnwand-bilder");

bilder.forEach(function (bild, i) {
  const foto = neu("button", "sofortbild");
  foto.type = "button";
  foto.setAttribute("aria-label", bild.titel + " – gross ansehen");
  foto.appendChild(bildErstellen(bild, true));
  const text = neu("span");
  text.textContent = bild.kurz;
  foto.appendChild(text);
  foto.addEventListener("click", function () {
    lightboxOeffnen(i);
  });
  pinnwand.appendChild(foto);
});


// =========================================================
// 9. FÄCHER – das Aufklappen macht nur CSS (:hover)
// =========================================================
const faecher = document.getElementById("faecher-bilder");

bilder.forEach(function (bild, i) {
  const teil = neu("button", "faecher-teil");
  teil.type = "button";
  teil.setAttribute("aria-label", bild.titel + " – gross ansehen");
  teil.appendChild(bildErstellen(bild, true));

  const text = neu("span", "faecher-text");
  const titel = neu("strong");
  titel.textContent = bild.titel;
  const beschreibung = neu("span");
  beschreibung.textContent = bild.text;
  text.append(titel, beschreibung);
  teil.appendChild(text);

  teil.addEventListener("click", function () {
    lightboxOeffnen(i);
  });
  faecher.appendChild(teil);
});


// =========================================================
// 10. LAUFBAND
//     Die Bilder kommen zweimal hintereinander ins Band.
//     Die CSS-Animation schiebt das Band um die Hälfte nach
//     links – dann sieht es genau aus wie am Anfang und die
//     Animation beginnt unbemerkt von vorne.
// =========================================================
document.querySelectorAll(".laufband-spur").forEach(function (spur) {
  for (let kopie = 0; kopie < 2; kopie++) {
    // Liste pro Kopie doppelt, damit das Band auch auf breiten Bildschirmen reicht
    for (let runde = 0; runde < 2; runde++) {
      bilder.forEach(function (bild) {
        const img = bildErstellen(bild, false);
        img.alt = ""; // Dekoration
        spur.appendChild(img);
      });
    }
  }
});
