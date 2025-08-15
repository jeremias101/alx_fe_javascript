// Quotes data
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", category: "Inspiration" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", category: "Hard Work" }
];

// Select DOM elements
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteInput = document.getElementById("newQuoteText");
const newCategoryInput = document.getElementById("newQuoteCategory");

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteText.textContent = "No quotes available. Add one!";
    quoteCategory.textContent = "";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];
  quoteText.textContent = `"${selectedQuote.text}"`;
  quoteCategory.textContent = `— ${selectedQuote.category}`;
}

// Add a new quote dynamically
function addQuote() {
  const text = newQuoteInput.value.trim();
  const category = newCategoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    newQuoteInput.value = "";
    newCategoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields!");
  }
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
