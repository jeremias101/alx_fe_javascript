let quotes = [];
let filteredQuotes = [];
let lastCategory = 'all';

// Load from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];
  }
  lastCategory = localStorage.getItem('lastCategory') || 'all';
}

// Save to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
  const pool = filteredQuotes.length ? filteredQuotes : quotes;
  if (pool.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes available.";
    return;
  }
  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('quoteDisplay').innerText = `"${randomQuote.text}" - ${randomQuote.category}`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Add new quote
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

// Populate categories in filter dropdown
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

// Filter quotes by category
function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  lastCategory = category;
  localStorage.setItem('lastCategory', category);
  if (category === 'all') {
    filteredQuotes = [];
  } else {
    filteredQuotes = quotes.filter(q => q.category === category);
  }
  showRandomQuote();
}

// Export to JSON
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

// Import from JSON
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

// Simulate server sync (Task 3)
function syncWithServer() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(serverData => {
      const serverQuotes = serverData.slice(0, 2).map(post => ({
        text: post.title,
        category: "Server"
      }));

      // Conflict resolution: server takes precedence
      quotes = serverQuotes.concat(quotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Data synced with server. Server data took precedence.');
    });
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initialization
loadQuotes();
populateCategories();
filterQuotes();

// Periodic server sync simulation (every 60 seconds)
setInterval(syncWithServer, 60000);
