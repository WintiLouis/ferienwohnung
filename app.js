// Aktuelles Jahr im Footer anzeigen
document.getElementById("jahr").textContent = new Date().getFullYear();

// Reaktion auf den Button «Anfrage senden»
document.getElementById("anfrage-button").addEventListener("click", function () {
  alert("Danke für Ihre Anfrage! Wir melden uns bald.");
});
