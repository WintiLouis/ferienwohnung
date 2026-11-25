# Ferienwohnung Seeblick

Einfache Webseite für die Vermietung einer Ferienwohnung.
Schulprojekt zum Einstieg in die Frontendentwicklung.

## Dateien
- `index.html` – Struktur der Seite
- `styles.css` – Gestaltung
- `app.js` – Interaktion
- `galerie.html` – Galerie-Seite mit Diashow, Rundgang, 3D-Karussell, Pinnwand, Fächer und Laufband
- `galerie.css` – Gestaltung nur für die Galerie-Seite (ergänzt `styles.css`)
- `galerie.js` – Bilderliste und Interaktion der Galerie (neue Bilder dort eintragen)

## Design-Prinzipien (abgeschaut bei den meistbesuchten Webseiten)
- Eine klare Hauptaktion (Google, ChatGPT)
- Bilder zuerst, einheitliches Raster (Instagram, YouTube)
- Fakten und Preis auf einen Blick (Amazon)
- Ruhige, gut lesbare Schrift mit viel Weissraum (Wikipedia)
- Einheitliche Linien-Icons statt Emojis, wenige Farben mit einem Akzent

## Bilder
- `img/*.jpg`: KI-generiert mit Microsoft Copilot, als JPG verkleinert
  (zusammen ca. 1,1 MB). Es sind **keine echten Fotos** der Wohnung.
- `img/*.svg`: eigene Illustrationen als SVG-Code, als Reserve.

## Features
- **Belegungskalender:** Monatsansicht mit belegten Tagen. Anreise und Abreise
  per Klick wählen, die Daten landen im Formular. Belegte Zeiträume stehen in
  `app.js` in der Liste `belegteZeitraeume`.
- **Anfrageformular:** prüft Name, E-Mail, Daten, Mindestaufenthalt und
  Belegung, berechnet den Preis. Demo: Es wird nichts verschickt.
- **Bewertungen:** Bereich mit Beispieltexten als Platzhalter für echte Bewertungen.

## Ideen für nächste Features
- Echte Bewertungen von Gästen einfügen
- Formular mit einem Dienst wie Formspree wirklich verschicken
- Echte Fotos der Wohnung statt KI-Bilder
