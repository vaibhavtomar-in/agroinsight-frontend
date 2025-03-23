document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showLogin = document.getElementById("showLogin");
  const showSignup = document.getElementById("showSignup");
  const switchToSignup = document.getElementById("switchToSignup");
  const switchToLogin = document.getElementById("switchToLogin");
  const mainContent = document.getElementById("main-content");
  const loggedInMessage = document.getElementById("logged-in-message");
  const authButtonContainer = document.getElementById("auth-button-container");
  const mobileAuthContainer = document.getElementById("mobile-auth-container");

  // Check if user is logged in
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";
  
  // Update auth button based on login status
  updateAuthButton();
  
  // If user is already logged in, show the message and blur the form
  if (userId) {
    mainContent.classList.add("content-blur");
    loggedInMessage.classList.remove("hidden");
  }

  function showLoginForm() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    showLogin.classList.add("border-b-2", "border-green-800", "text-green-800");
    showSignup.classList.remove("border-b-2", "border-green-800", "text-green-800");
    showSignup.classList.add("text-gray-600");
  }

  function showSignupForm() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    showSignup.classList.add("border-b-2", "border-green-800", "text-green-800");
    showLogin.classList.remove("border-b-2", "border-green-800", "text-green-800");
    showLogin.classList.add("text-gray-600");
  }

  // Add event listeners for form toggling
  showLogin.addEventListener("click", showLoginForm);
  showSignup.addEventListener("click", showSignupForm);
  switchToSignup.addEventListener("click", showSignupForm);
  switchToLogin.addEventListener("click", showLoginForm);

  // Function to update auth button based on login status
  function updateAuthButton() {
    if (userId) {
      // Create logout button for desktop
      authButtonContainer.innerHTML = `
        <button onclick="logoutUser()" class="bg-red-600 text-white hover:bg-red-500 px-6 py-2 rounded-lg transition-colors">
          Logout
        </button>
      `;
      
      // Create logout button for mobile
      mobileAuthContainer.innerHTML = `
        <button onclick="logoutUser()" class="mobile-link">Logout</button>
      `;
    } else {
      // Create login/signup button for desktop
      authButtonContainer.innerHTML = `
        <a href="#" class="bg-yellow-400 text-green-800 px-6 py-2 rounded-lg">Login/Signup</a>
      `;
      
      // Create login/signup button for mobile
      mobileAuthContainer.innerHTML = `
        <a href="#" class="mobile-link" onclick="closeMenu()">Login/Signup</a>
      `;
    }
  }

  // Check if we're on the history page
  if (window.location.pathname.includes("history.html")) {
    if (userId) {
      fetchUserDetails(userId);
      fetchRecommendationHistory(userId);
    } else {
      // Redirect to login if no userId
      window.location.href = "login.html";
    }
  }
});

// Logout function
function logoutUser() {
  // Clear local storage
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  
  // Reload the page to reset UI
  window.location.reload();
}


function signupUser(event) {
  event.preventDefault();
  
  // Get form data
  const requestData = {
    name: document.getElementById("signup-name").value,
    phoneNumber: document.getElementById("signup-phone").value,
    password: document.getElementById("signup-password").value,
    pincode: document.getElementById("signup-pincode").value,
    state: document.getElementById("signup-state").value,
    country: document.getElementById("signup-country").value,
  };

  // Disable form submission button
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Signing up...";

  fetch("http://localhost:8080/users/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      // Parse the response as JSON whether it's success or error
      return response.json().then(data => {
        // Add the status to the data so we can check it later
        return { ...data, status: response.status };
      });
    })
    .then((data) => {
      // Re-enable the submit button
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";

      if (data.status === 200 || data.status === 201) {
        // Successful signup - check if userId and name are returned
        if (data.userId) {
          // Store user data in localStorage
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("userName", data.name || requestData.name);
          
          // Create and show success toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          toast.innerHTML = `Welcome, ${data.name || requestData.name}! Your account has been created successfully.`;
          document.body.appendChild(toast);
          
          // Set timeout to automatically redirect after 2 seconds
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
          
          // Add click event to dismiss on click anywhere
          document.addEventListener('click', function dismissToast() {
            document.body.removeChild(toast);
            document.removeEventListener('click', dismissToast);
            window.location.href = "index.html";
          });
        } else {
          // If no userId is returned, show toast and switch to login
          const toast = document.createElement('div');
          toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          toast.innerHTML = `Signup successful! Please login with your credentials.`;
          document.body.appendChild(toast);
          
          // Auto dismiss after 3 seconds and switch to login
          setTimeout(() => {
            document.body.removeChild(toast);
            document.getElementById("switchToLogin").click();
          }, 3000);
          
          // Add click event to dismiss on click
          document.addEventListener('click', function dismissToast() {
            document.body.removeChild(toast);
            document.removeEventListener('click', dismissToast);
            document.getElementById("switchToLogin").click();
          });
        }
      } else {
        // Handle API error with toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = data.errorShortDescription ? 
          `Signup Failed: ${data.errorShortDescription}` : 
          `Signup Failed! Please try again.`;
        document.body.appendChild(toast);
        
        // Auto dismiss after 4 seconds
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 4000);
        
        // Add click event to dismiss on click
        document.addEventListener('click', function dismissToast() {
          document.body.removeChild(toast);
          document.removeEventListener('click', dismissToast);
        });
      }
    })
    .catch((error) => {
      console.error("Signup error:", error);
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.innerHTML = `Signup Failed! Please check your connection and try again.`;
      document.body.appendChild(toast);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 4000);
      
      // Add click event to dismiss on click
      document.addEventListener('click', function dismissToast() {
        document.body.removeChild(toast);
        document.removeEventListener('click', dismissToast);
      });
    });
}

function loginUser(event) {
  event.preventDefault();
  
  // Get form data
  const requestData = {
    phoneNumber: document.getElementById("login-phone").value,
    password: document.getElementById("login-password").value,
  };

  // Disable form submission button
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      // Parse the response as JSON whether it's success or error
      return response.json().then(data => {
        // Add the status to the data so we can check it later
        return { ...data, status: response.status };
      });
    })
    .then((data) => {
      // Re-enable the submit button
      submitButton.disabled = false;
      submitButton.textContent = "Sign in";

      if (data.status === 200) {
        // Successful login
        if (data.userId) {
          // Store user data in localStorage
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("userName", data.name || "User");
          
          // Create and show success toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          toast.innerHTML = `Welcome back, ${data.name || "User"}!`;
          document.body.appendChild(toast);
          
          // Set timeout to automatically redirect after 2 seconds
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
          
          // Add click event to dismiss on click anywhere
          document.addEventListener('click', function dismissToast() {
            document.body.removeChild(toast);
            document.removeEventListener('click', dismissToast);
            window.location.href = "index.html";
          });
        } else {
          // Show error toast for missing user info
          const toast = document.createElement('div');
          toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          toast.innerHTML = `Login successful but user information is missing. Please try again.`;
          document.body.appendChild(toast);
          
          // Auto dismiss after 4 seconds
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 4000);
          
          // Add click event to dismiss on click
          document.addEventListener('click', function dismissToast() {
            document.body.removeChild(toast);
            document.removeEventListener('click', dismissToast);
          });
        }
      } else {
        // Handle API error with toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = data.errorShortDescription ? 
          `Login Failed: ${data.errorShortDescription}` : 
          `Login Failed! Invalid credentials or server error.`;
        document.body.appendChild(toast);
        
        // Auto dismiss after 4 seconds
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 4000);
        
        // Add click event to dismiss on click
        document.addEventListener('click', function dismissToast() {
          document.body.removeChild(toast);
          document.removeEventListener('click', dismissToast);
        });
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      submitButton.disabled = false;
      submitButton.textContent = "Sign in";
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.innerHTML = `Login Failed! Please check your connection and try again.`;
      document.body.appendChild(toast);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 4000);
      
      // Add click event to dismiss on click
      document.addEventListener('click', function dismissToast() {
        document.body.removeChild(toast);
        document.removeEventListener('click', dismissToast);
      });
    });
}

// JavaScript for menu functionality
const menu = document.getElementById("mobile-menu");
const menuBtn = document.getElementById("menu-btn");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("-translate-x-full");
});

function closeMenu() {
  menu.classList.add("-translate-x-full");
}

// Scroll Effect for Navbar
window.addEventListener("scroll", function() {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});