document.addEventListener("DOMContentLoaded", function () {
  // Initialize navbar auth button
  updateAuthButton();
  
  // Mobile menu functionality
  const menu = document.getElementById("mobile-menu");
  const menuBtn = document.getElementById("menu-btn");

  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("-translate-x-full");
  });

  // Scroll Effect for Navbar
  window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Initialize search functionality
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("input", function() {
      filterTable(this.value);
    });
  }

  // Check user login status
  const userId = localStorage.getItem("userId");
  
  if (window.location.pathname.includes("history.html")) {
    if (userId) {
      // User is logged in - show content
      document.getElementById("main-content").classList.remove("blur-content");
      document.getElementById("login-overlay").classList.add("hidden");
      
      // Fetch real data
      fetchUserDetails(userId);
      fetchRecommendationHistory(userId);
    } else {
      // User is not logged in - blur content and show login message
      document.getElementById("main-content").classList.add("blur-content");
      document.getElementById("login-overlay").classList.remove("hidden");
      
      // Generate sample chart data for blurred background
      createSampleChart();
    }
  }
});

function closeMenu() {
  document.getElementById("mobile-menu").classList.add("-translate-x-full");
}

function updateAuthButton() {
  const userId = localStorage.getItem("userId");
  const authButtonDesktop = document.getElementById("authButton");
  const authButtonMobile = document.getElementById("mobileAuthButton");
  
  if (userId) {
    // User is logged in, show logout
    authButtonDesktop.innerHTML = `<a href="#" onclick="logout()" class="bg-yellow-400 text-green-800 px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors">Logout</a>`;
    authButtonMobile.textContent = "Logout";
    authButtonMobile.onclick = logout;
  } else {
    // User is not logged in, show login/signup
    authButtonDesktop.innerHTML = `<a href="login.html" class="bg-yellow-400 text-green-800 px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors">Login/Signup</a>`;
    authButtonMobile.textContent = "Login/Signup";
    authButtonMobile.onclick = () => { window.location.href = "login.html"; closeMenu(); };
  }
}

function handleAuthAction() {
  const userId = localStorage.getItem("userId");
  if (userId) {
    logout();
  } else {
    window.location.href = "login.html";
  }
  closeMenu();
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  Swal.fire({
    title: "Logged Out!",
    text: "You have been successfully logged out.",
    icon: "success",
    confirmButtonColor: "#15803d"
  }).then(() => {
    window.location.href = "home.html";
  });
}

function fetchUserDetails(userId) {
  fetch(`http://localhost:8080/users/details?userId=${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data) {
        document.querySelector(".user-name").innerText = data?.name;
        document.querySelector(".user-phone").innerHTML = `<strong>📞 Phone:</strong> ${data.phoneNumber}`;
        document.querySelector(".user-address").innerHTML = `<strong>📍 Address:</strong> ${data.pincode}, ${data.state}, ${data.country}`;
      } else {
        console.error("No User Details Found!");
      }
    })
    .catch((error) => {
      console.error("User Details Error:", error);
    });
}

function fetchRecommendationHistory(userId) {
  fetch(`http://localhost:8080/users/recommendation/history?userId=${userId}`)
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          return response.json().then(err => {
            throw new Error(`${err.errorShortDescription}: ${err.errorDescription}`);
          });
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.getElementById("history-body");
      tableBody.innerHTML = "";
      
      if (data.length === 0) {
        // Display a message when no recommendations exist
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" class="px-4 py-6 text-center text-gray-500">
              No recommendation history found. Try getting a new crop recommendation!
            </td>
          </tr>
        `;
        return;
      }
      
      data.forEach((rec) => {
        const row = `
          <tr class="hover:bg-gray-100">
            <td class="px-4 py-3">${rec.date || new Date().toISOString().split("T")[0]}</td>
            <td class="px-4 py-3">${rec.nitrogen}</td>
            <td class="px-4 py-3">${rec.phosphorus}</td>
            <td class="px-4 py-3">${rec.potassium}</td>
            <td class="px-4 py-3">${rec.temperature}</td>
            <td class="px-4 py-3">${rec.humidity}</td>
            <td class="px-4 py-3">${rec.pH}</td>
            <td class="px-4 py-3">${rec.rainfall}</td>
            <td class="px-4 py-3 font-bold text-green-700">${rec.recommendedCrop}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
      
      // Adjust table container height based on content
      adjustTableContainerHeight();
      
      // Create chart with the data
      createCropChart(data);
    })
    .catch((error) => {
      console.error("Recommendation History Error:", error);
      document.getElementById("history-body").innerHTML = `
        <tr>
          <td colspan="9" class="px-4 py-6 text-center text-red-500">
            Failed to load recommendation history. Please try again later.
          </td>
        </tr>
      `;
    });
}

function adjustTableContainerHeight() {
  const tableContainer = document.querySelector('.table-container');
  const table = document.getElementById('historyTable');
  const rowCount = document.getElementById('history-body').children.length;
  
  // Set minimum height based on number of rows (with a minimum of 200px)
  const calculatedHeight = Math.max(200, Math.min(rowCount * 60 + 60, window.innerHeight * 0.7));
  tableContainer.style.height = `${calculatedHeight}px`;
}

function filterTable(searchTerm) {
  const rows = document.querySelectorAll('#history-body tr');
  const lowercasedSearch = searchTerm.toLowerCase();
  
  rows.forEach(row => {
    const cropCell = row.querySelector('td:last-child');
    if (!cropCell) return;
    
    const cropName = cropCell.textContent.toLowerCase();
    if (cropName.includes(lowercasedSearch)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function sortTable(columnIndex) {
  const table = document.getElementById('historyTable');
  const tbody = document.getElementById('history-body');
  const rows = Array.from(tbody.rows);
  
  // Track sort direction
  const th = table.querySelector('th');
  const isAscending = th.textContent.includes('⬍');
  
  // Update header to show sort direction
  th.textContent = th.textContent.replace(isAscending ? '⬍' : '⬆', isAscending ? '⬆' : '⬍');
  
  // Sort the rows
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent;
    const bValue = b.cells[columnIndex].textContent;
    
    return isAscending ? 
      aValue.localeCompare(bValue) : 
      bValue.localeCompare(aValue);
  });
  
  // Append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}

function createCropChart(data) {
// Check if we have data to display
if (!data || data.length === 0) return;

// Group recommendations by crop
const cropCounts = {};
data.forEach(rec => {
const crop = rec.recommendedCrop;
cropCounts[crop] = (cropCounts[crop] || 0) + 1;
});

// Get chart canvas
const ctx = document.getElementById('cropChart');

// Destroy previous chart if it exists
if (window.cropPieChart) {
window.cropPieChart.destroy();
}

// Create new chart with reduced size
window.cropPieChart = new Chart(ctx, {
type: 'pie',
data: {
  labels: Object.keys(cropCounts),
  datasets: [{
    data: Object.values(cropCounts),
    backgroundColor: [
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', 
      '#FFC107', '#FF9800', '#FF5722', '#795548',
      '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'
    ],
    borderWidth: 1
  }]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: {
          size: 14
        },
        padding: 20
      }
    },
    title: {
      display: true,
      text: 'Crop Recommendation Distribution',
      font: {
        size: 16
      }
    }
  }
}
});

// Set the canvas container height and width
ctx.parentElement.style.height = '300px';
ctx.parentElement.style.maxWidth = '600px';
ctx.parentElement.style.margin = '0 auto';
}

function createSampleChart() {
// Sample data for blurred view
const sampleData = {
'Rice': 5,
'Wheat': 3,
'Maize': 2,
'Cotton': 1
};

// Get chart canvas
const ctx = document.getElementById('cropChart');

// Create sample chart with reduced size
window.cropPieChart = new Chart(ctx, {
type: 'pie',
data: {
  labels: Object.keys(sampleData),
  datasets: [{
    data: Object.values(sampleData),
    backgroundColor: [
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'
    ],
    borderWidth: 1
  }]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: {
          size: 14
        },
        padding: 20
      }
    },
    title: {
      display: true,
      text: 'Crop Recommendation Distribution',
      font: {
        size: 16
      }
    }
  }
}
});

// Set the canvas container height and width
ctx.parentElement.style.height = '300px';
ctx.parentElement.style.maxWidth = '600px';
ctx.parentElement.style.margin = '0 auto';

// Adjust table container height
adjustTableContainerHeight();
}
