// Aktuelles Jahr im Footer anzeigen
document.getElementById("jahr").textContent = new Date().getFullYear();

// Hero-Button: scrollt weich zum Kontaktbereich
document.getElementById("hero-button").addEventListener("click", function () {
  document.getElementById("kontakt").scrollIntoView({ behavior: "smooth" });
});

// Reaktion auf den Button «Anfrage senden»
document.getElementById("anfrage-button").addEventListener("click", function () {
  alert("Danke für Ihre Anfrage! Wir melden uns bald.");
});
