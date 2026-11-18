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

// Reaktion auf den Button «Anfrage senden»
document.getElementById("anfrage-button").addEventListener("click", function () {
  alert("Danke für Ihre Anfrage! Wir melden uns bald.");
});
