// Data store
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t watch the clock; do what it does. Keep going.", category: "Inspiration" },
  { text: "The harder you work for something, the greater you’ll feel when you achieve it.", category: "Hard Work" }
];

/** Displays a random quote in #quoteDisplay */
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  if (!display) return;

  if (quotes.length === 0) {
    display.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }

  const i = Math.floor(Math.random() * quotes.length);
  const q = quotes[i];
  display.innerHTML = `
    <p>"${q.text}"</p>
    <small>Category: ${q.category}</small>
  `;
}

/** Adds a new quote from input fields (created statically or dynamically) */
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

  quotes.push({ text, category });
  textEl.value = "";
  catEl.value = "";
  alert("Quote added successfully!");
}

/** Compatibility alias in case your HTML uses addQuate() by mistake */
function addQuate() { 
  return addQuote(); 
}

/** Builds the Add Quote form dynamically if it doesn’t exist */
function createAddQuoteForm() {
  // If the static form exists, don’t create another
  if (document.getElementById("newQuoteText") && document.getElementById("newQuoteCategory")) return;

  const wrapper = document.createElement("div");

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

  wrapper.appendChild(textInput);
  wrapper.appendChild(catInput);
  wrapper.appendChild(btn);

  // Insert after the “Show New Quote” button
  const newQuoteBtn = document.getElementById("newQuote");
  if (newQuoteBtn && newQuoteBtn.parentNode) {
    newQuoteBtn.parentNode.insertBefore(wrapper, newQuoteBtn.nextSibling);
  } else {
    document.body.appendChild(wrapper);
  }
}

// Wire up events after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Button to show a new random quote
  const btn = document.getElementById("newQuote");
  if (btn) btn.addEventListener("click", showRandomQuote);

  // Ensure the add-quote form exists one way or another
  createAddQuoteForm();
});
