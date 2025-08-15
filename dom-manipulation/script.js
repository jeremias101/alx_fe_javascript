// ------- Storage Keys -------
const LS_KEY = "quotes-v1";
const SS_LAST_QUOTE_KEY = "lastQuote";

// ------- In-memory data store -------
let quotes = [];

// ------- Utilities: Storage -------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes to localStorage:", e);
    alert("Could not save quotes (storage might be full or blocked).");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      // Seed defaults if nothing saved yet
      quotes = [
        { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
        { text: "Don’t watch the clock; do what it does. Keep going.", category: "Inspiration" },
        { text: "The harder you work for something, the greater you’ll feel when you achieve it.", category: "Hard Work" }
      ];
      saveQuotes();
      return;
    }
    const parsed = JSON.parse(raw);
    // Validate structure
    if (Array.isArray(parsed)) {
      quotes = parsed
        .filter(q => q && typeof q.text === "string" && typeof q.category === "string")
        .map(q => ({ text: q.text, category: q.category }));
    } else {
      // Fallback to defaults if structure invalid
      quotes = [
        { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
        { text: "Don’t watch the clock; do what it does. Keep going.", category: "Inspiration" },
        { text: "The harder you work for something, the greater you’ll feel when you achieve it.", category: "Hard Work" }
      ];
      saveQuotes();
    }
  } catch (e) {
    console.error("Failed to load quotes:", e);
    quotes = [];
  }
}

function saveLastViewedToSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (e) {
    console.warn("Could not save last viewed quote to sessionStorage:", e);
  }
}

function getLastViewedFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.text === "string" && typeof parsed.category === "string") {
      return parsed;
    }
  } catch (e) {
    console.warn("Could not read last viewed quote from sessionStorage:", e);
  }
  return null;
}

// ------- DOM Helpers -------
function renderQuote(q) {
  const display = document.getElementById("quoteDisplay");
  if (!display) return;
  if (!q) {
    display.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }
  display.innerHTML = `
    <p>"${escapeHtml(q.text)}"</p>
    <small>Category: ${escapeHtml(q.category)}</small>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ------- Core Features -------

// Step 2: Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];
  renderQuote(q);
  saveLastViewedToSession(q); // sessionStorage demo
}

// Step 3: Add a new quote
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  if (!textEl || !catEl) return;

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields before adding a quote.");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();                  // Save to localStorage every add
  renderQuote(newQ);             // Show the newly added one
  saveLastViewedToSession(newQ); // Update session “last viewed”

  textEl.value = "";
  catEl.value = "";
  alert("Quote added successfully!");
}

// (Optional) Compatibility alias if your HTML ever used a misspelled name:
function addQuate() {
  return addQuote();
}

// Dynamically builds the Add Quote form if the static one is missing
function createAddQuoteForm() {
  if (document.getElementById("newQuoteText") && document.getElementById("newQuoteCategory")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "controls";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.addEventListener("click", addQuote);

  wrapper.append(textInput, catInput, btn);

  const controls = document.querySelector(".controls");
  (controls?.parentNode || document.body).appendChild(wrapper);
}

// ------- JSON Import / Export -------

// Export quotes as a JSON file
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed:", e);
    alert("Export failed. See console for details.");
  }
}

// Import quotes from a JSON file (matches your provided signature)
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (ev) {
    try {
      const imported = JSON.parse(ev.target.result);

      if (!Array.isArray(imported)) {
        throw new Error("JSON must be an array of { text, category } objects.");
      }

      // Validate and sanitize
      const valid = imported.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      ).map(q => ({ text: q.text, category: q.category }));

      if (valid.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      alert(`Quotes imported successfully! (${valid.length} added)`);
      // Optionally show one of the imported quotes
      renderQuote(valid[0]);
      saveLastViewedToSession(valid[0]);

    } catch (err) {
      console.error("Import failed:", err);
      alert("Invalid JSON format. Please upload an array of { text, category } objects.");
    } finally {
      // Clear the input so the same file can be chosen again
      event.target.value = "";
    }
  };
  fileReader.readAsText(file);
}

// ------- Init -------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();             // Load from localStorage (or defaults)
  createAddQuoteForm();     // Ensure form exists

  // Wire up buttons
  const newQuoteBtn = document.getElementById("newQuote");
  newQuoteBtn?.addEventListener("click", showRandomQuote);

  const exportBtn = document.getElementById("exportJson");
  exportBtn?.addEventListener("click", exportToJsonFile);

  const showLastBtn = document.getElementById("showLast");
  showLastBtn?.addEventListener("click", () => {
    const last = getLastViewedFromSession();
    if (last) renderQuote(last);
    else alert("No last viewed quote stored in this session yet.");
  });

  // If there is a last viewed in session, show it; else keep default message.
  const lastSessionQuote = getLastViewedFromSession();
  if (lastSessionQuote) {
    renderQuote(lastSessionQuote);
  }
});
