// IndexedDB variables
let db;
const dbName = "ExpenseTrackerDB";
const storeName = "expenses";
let expenses = []; // Store in-memory expenses

// Open IndexedDB
function openDB() {
  const request = indexedDB.open(dbName, 1);

  // Handle database setup
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('amount', 'amount', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false }); // Add date index to track expenses by month
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("IndexedDB opened successfully");
    fetchExpenses(); // Load only this month's expenses on page load
    getTotalExpenditureForCurrentMonth();
  };

  request.onerror = function (event) {
    console.error("IndexedDB error:", event.target.errorCode);
  };
}

// Add an expense to IndexedDB
function addExpense(expense) {
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.add(expense);

  request.onsuccess = function () {
    console.log("Expense added to IndexedDB:", expense);
    fetchExpenses(); // Refresh the expense list with this month's expenses
    getTotalExpenditureForCurrentMonth(); // Update total expenditure after adding a new expense
  };

  request.onerror = function () {
    console.error("Error adding expense to IndexedDB");
  };
}

// Fetch only this month's expenses from IndexedDB
function fetchExpenses() {
  const transaction = db.transaction([storeName], "readonly");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.getAll();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  request.onsuccess = function (event) {
    expenses = event.target.result.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    renderExpenses(); // Render the list on the page with this month's expenses only
  };
}

// Function to render expenses to the DOM (without the date)
function renderExpenses() {
  const expenseList = document.getElementById('expense-list');
  expenseList.innerHTML = ''; // Clear the list before re-rendering

  expenses.forEach((expense, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>₹${expense.amount} - ${expense.name}</div>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    expenseList.appendChild(li);
  });
}

// Delete an expense from IndexedDB
function deleteExpenseFromDB(id) {
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.delete(id);

  request.onsuccess = function () {
    console.log("Expense deleted from IndexedDB");
    fetchExpenses(); // Refresh the expense list with this month's expenses
    getTotalExpenditureForCurrentMonth(); // Update total expenditure after deleting an expense
  };

  request.onerror = function () {
    console.error("Error deleting expense from IndexedDB");
  };
}

// Modify the form submission to add expense to IndexedDB
document.getElementById('expense-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const expenseName = document.getElementById('expense-name').value;
  const expenseAmount = document.getElementById('expense-amount').value;

  const newExpense = {
    name: expenseName,
    amount: parseFloat(expenseAmount).toFixed(2),
    date: new Date() // Automatically capture the current date
  };

  addExpense(newExpense); // Add the new expense to IndexedDB
  document.getElementById('expense-form').reset(); // Clear the form
});

// Function to calculate and display total expenditure for the current month
function getTotalExpenditureForCurrentMonth() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let total = 0;

  // Open the IndexedDB transaction
  const transaction = db.transaction([storeName], 'readonly');
  const objectStore = transaction.objectStore(storeName);
  
  const request = objectStore.openCursor();
  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const expenseDate = new Date(cursor.value.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        total += parseFloat(cursor.value.amount);
      }
      cursor.continue();
    } else {
      // Once we've processed all entries, update the total expenditure on the page
      displayTotalExpenditure(total, currentMonth);
    }
  };
  
  request.onerror = function(event) {
    console.log('Error fetching expenses:', event);
  };
}

// Function to display the total expenditure at the top
function displayTotalExpenditure(total, currentMonth) {
  let monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const totalDisplay = document.getElementById('total-expenditure');
  totalDisplay.innerText = `${monthNames[currentMonth]}: ₹${total.toFixed(2)}`;
}

// Modify the delete function to delete from IndexedDB
function deleteExpense(index) {
  const expenseId = expenses[index].id;
  deleteExpenseFromDB(expenseId); // Delete from IndexedDB
}

// Initialize the app by opening the database
openDB();

// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}
