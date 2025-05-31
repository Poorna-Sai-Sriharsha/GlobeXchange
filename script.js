// DOM Element References
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const finalValue = document.querySelector(".finalValue");
const oamount = document.getElementById("oamount");
const recentList = document.getElementById("recentList");
// Supported currencies with their display names and flags
const currencies = {
  "USD": "🇺🇸 USD - US Dollar",
  "INR": "🇮🇳 INR - Indian Rupee",
  "EUR": "🇪🇺 EUR - Euro",
  "JPY": "🇯🇵 JPY - Japanese Yen",
  "GBP": "🇬🇧 GBP - British Pound",
  "AUD": "🇦🇺 AUD - Australian Dollar",
  "CAD": "🇨🇦 CAD - Canadian Dollar",
  "CHF": "🇨🇭 CHF - Swiss Franc",
  "CNY": "🇨🇳 CNY - Chinese Yuan",
  "ZAR": "🇿🇦 ZAR - South African Rand"
};
// Initialize currency dropdown menus
for (let code in currencies) {
  const optionFrom = document.createElement("option");
  optionFrom.value = code;
  optionFrom.textContent = currencies[code];
  fromSelect.appendChild(optionFrom);
  const optionTo = optionFrom.cloneNode(true);
  toSelect.appendChild(optionTo);
}
toSelect.value = "INR";
/*Fetches and converts currency using the Exchange Rate API & Updates the UI with the converted amount and adds to history */
async function convertCurrency() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(oamount.value);
  if (isNaN(amount)) return;
  
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    finalValue.textContent = converted;
    addRecentConversion(`${amount} ${from} = ${converted} ${to}`);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    finalValue.textContent = "Error";
  }
}
/*Adds a conversion entry to the recent conversions list & Maintains a maximum of 5 recent conversions*/
function addRecentConversion(entry) {
  const li = document.createElement("li");
  li.textContent = entry;
  recentList.prepend(li);
  if (recentList.children.length > 5) recentList.removeChild(recentList.lastChild);
}
/* Toggles between light and dark theme */
function toggleTheme() {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.querySelector(".theme-toggle").textContent = document.documentElement.dataset.theme === "dark" ? "🌞" : "🌙";
}
// Debounce timer for automatic conversion
let repeat;
/*Debounced function to trigger currency conversion & Prevents excessive API calls during rapid input changes*/
function history() {
  clearTimeout(repeat);
  repeat = setTimeout(convertCurrency, 700);
}
/*Implements voice input functionality for amount entry & Uses the Web Speech API for speech recognition*/
function startVoiceInput() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Try Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      console.log("Voice recognition started. Speak now.");
    };
    recognition.onspeechend = () => {
      recognition.stop();
      console.log("Speech ended.");
    };
    recognition.onresult = event => {
      const speechResult = event.results[0][0].transcript;
      console.log("Speech result:", speechResult);
      // Filter input to only numbers with optional decimal
      const numericValue = speechResult.match(/[\d\.]+/g)?.join('') || '';
      oamount.value = numericValue;
      debouncedConvert();
    };
    recognition.onerror = event => {
      console.error("Speech recognition error:", event.error);
      alert("Error during speech recognition: " + event.error);
    };
    recognition.start();
  } 
  catch (error) {
    console.error("Speech recognition setup failed:", error);
    alert("Speech recognition failed to start.");
  }
}


