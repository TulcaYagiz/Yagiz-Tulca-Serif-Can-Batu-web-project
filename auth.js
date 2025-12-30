
const firebaseConfig = {
  apiKey: "AIzaSyD5sJpkJx53gkvln_B-EceaJFkQnzSOoS8",
  authDomain: "login-8e965.firebaseapp.com",
  projectId: "login-8e965",
  storageBucket: "login-8e965.firebasestorage.app",
  messagingSenderId: "786360219440",
  appId: "1:786360219440:web:2b83edfb7e34f59c5efaf5",
  measurementId: "G-LYC0SWLE96",
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();


let loginFormContainer, registerFormContainer, userProfile;
let loginForm, registerForm;
let googleSigninBtn, googleSignupBtn, logoutBtn;
let showRegisterLink, showLoginLink;

document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();
  checkAuthState();
  updateCartCount();
  setupMobileMenu();
});

function initializeElements() {
  loginFormContainer = document.getElementById("login-form-container");
  registerFormContainer = document.getElementById("register-form-container");
  userProfile = document.getElementById("user-profile");

  loginForm = document.getElementById("login-form");
  registerForm = document.getElementById("register-form");

  googleSigninBtn = document.getElementById("google-signin-btn");
  googleSignupBtn = document.getElementById("google-signup-btn");
  logoutBtn = document.getElementById("logout-btn");

  showRegisterLink = document.getElementById("show-register");
  showLoginLink = document.getElementById("show-login");
}

function setupEventListeners() {

  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);


  googleSigninBtn.addEventListener("click", handleGoogleSignIn);
  googleSignupBtn.addEventListener("click", handleGoogleSignIn);


  logoutBtn.addEventListener("click", handleLogout);


  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    showRegister();
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  });
}


function setupMobileMenu() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".bar");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("active");
      menuBtn.classList.toggle("active");
    });
  }
}


function checkAuthState() {

  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    showUserProfile(storedUser);
  }


  auth.onAuthStateChanged((user) => {
    if (user) {
      const userData = {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
        photo: user.photoURL || "https://via.placeholder.com/100",
        provider: user.providerData[0]?.providerId || "email",
      };
      localStorage.setItem("user", JSON.stringify(userData));
      showUserProfile(userData);
    }
  });
}


function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  let isValid = true;

  if (!validateEmail(email)) {
    showError("login-email-error", "Please enter a valid email");
    isValid = false;
  }

  if (password.length < 6) {
    showError("login-password-error", "Password must be at least 6 characters");
    isValid = false;
  }

  if (!isValid) return;


  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const user = registeredUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      photo: "https://via.placeholder.com/100",
      provider: "email",
    };
    localStorage.setItem("user", JSON.stringify(userData));
    showNotification("Login successful!");
    showUserProfile(userData);
  } else {
    showError("login-password-error", "Invalid email or password");
  }
}


function handleRegister(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm").value;


  let isValid = true;

  if (name.length < 2) {
    showError("register-name-error", "Name must be at least 2 characters");
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError("register-email-error", "Please enter a valid email");
    isValid = false;
  }

  if (password.length < 6) {
    showError(
      "register-password-error",
      "Password must be at least 6 characters"
    );
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError("register-confirm-error", "Passwords do not match");
    isValid = false;
  }

  if (!isValid) return;


  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  if (registeredUsers.find((u) => u.email === email)) {
    showError("register-email-error", "Email already registered");
    return;
  }

  const newUser = {
    uid: "local_" + Date.now(),
    name: name,
    email: email,
    password: password, 
  };

  registeredUsers.push(newUser);
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

  
  const userData = {
    uid: newUser.uid,
    name: newUser.name,
    email: newUser.email,
    photo: "https://via.placeholder.com/100",
    provider: "email",
  };
  localStorage.setItem("user", JSON.stringify(userData));
  showNotification("Account created successfully!");
  showUserProfile(userData);
}


async function handleGoogleSignIn() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;

    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      provider: "google",
    };

    localStorage.setItem("user", JSON.stringify(userData));
    showNotification("Signed in with Google successfully!");
    showUserProfile(userData);
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      showNotification("Sign-in cancelled");
    } else if (error.code === "auth/network-request-failed") {
      showNotification("Network error. Please check your connection.");
    } else {
      showNotification("Sign-in failed: " + error.message);
    }
  }
}


async function handleLogout() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }

  localStorage.removeItem("user");
  showNotification("Signed out successfully");
  showLogin();
}


function showUserProfile(user) {
  loginFormContainer.style.display = "none";
  registerFormContainer.style.display = "none";
  userProfile.style.display = "block";

  document.getElementById("profile-avatar").src =
    user.photo || "https://via.placeholder.com/100";
  document.getElementById("profile-name").textContent =
    "Welcome, " + (user.name || "User") + "!";
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-type").textContent =
    user.provider === "google" ? "Google Account" : "Standard";

 
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("profile-cart-count").textContent = cartCount;

 
  const loginLink = document.getElementById("login-link");
  if (loginLink) {
    loginLink.textContent = user.name ? user.name.split(" ")[0] : "Account";
  }
}


function showLogin() {
  loginFormContainer.style.display = "block";
  registerFormContainer.style.display = "none";
  userProfile.style.display = "none";
  loginForm.reset();
  clearErrors();
}


function showRegister() {
  loginFormContainer.style.display = "none";
  registerFormContainer.style.display = "block";
  userProfile.style.display = "none";
  registerForm.reset();
  clearErrors();
}


function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}


function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? "inline-flex" : "none";
  }
}


function showNotification(message) {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
