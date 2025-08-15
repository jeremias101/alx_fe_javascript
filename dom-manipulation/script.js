// ==== QUOTES DATA & STORAGE ====
let quotes = [];
let filteredQuotes = [];
let lastCategory = 'all';

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to predict the future is to invent it.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
  ];
  lastCategory = localStorage.getItem('lastCategory') || 'all';
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Load last viewed quote from session storage
function loadLastViewedQuote() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  return stored ? JSON.parse(stored) : null;
}

// ==== RANDOM QUOTE DISPLAY ====
function showRandomQuote() {
  const pool = filteredQuotes.length ? filteredQuotes : quotes;
  if (!pool.length) {
    document.getElementById('quoteDisplay').innerText = "No quotes available.";
    return;
  }
  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('quoteDisplay').innerText = `"${randomQuote.text}" - ${randomQuote.category}`;
  saveLastViewedQuote(randomQuote);
}

// ==== DYNAMIC QUOTE FORM ====
function createAddQuoteForm() {
  const container = document.getElementById('addQuoteFormContainer');
  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) {
    alert('Please enter both quote and category.');
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// ==== CATEGORY FILTER ====
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === lastCategory) option.selected = true;
    categorySelect.appendChild(option);
  });
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  lastCategory = category;
  localStorage.setItem('lastCategory', category);
  filteredQuotes = category === 'all' ? [] : quotes.filter(q => q.category === category);
  showRandomQuote();
}

// ==== JSON IMPORT/EXPORT ====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes imported successfully!');
    } catch (error) {
      alert('Invalid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==== SERVER SYNC SIMULATION & CONFLICT RESOLUTION ====
function syncWithServer() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(serverData => {
      const serverQuotes = serverData.slice(0, 2).map(post => ({
        text: post.title,
        category: "Server"
      }));

      // Conflict resolution: server takes precedence
      const localOnly = quotes.filter(q => !serverQuotes.some(sq => sq.text === q.text));
      quotes = [...serverQuotes, ...localOnly];

      saveQuotes();
      populateCategories();
      filterQuotes();
      console.log('Data synced with server. Server data took precedence.');
    });
}

// ==== INITIALIZATION ====
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();

// Sync with server every 60 seconds
setInterval(syncWithServer, 60000);
