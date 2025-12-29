// Shop Page JavaScript
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  fetchAllProducts();
  checkLoginStatus();
  setupMobileMenu();
});

// Check login status and update UI
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  const loginLink = document.getElementById("login-link");
  if (user && loginLink) {
    loginLink.textContent = user.name ? user.name.split(" ")[0] : "Account";
    loginLink.href = "login.html";
  }
}

// Setup mobile menu toggle
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

// Fetch all products from API
async function fetchAllProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    allProducts = await response.json();
    filteredProducts = [...allProducts];
    displayProducts(filteredProducts);
    setupFilters();
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("products-container").innerHTML =
      '<p class="error-message">Failed to load products. Please try again later.</p>';
  }
}

// Display products in grid
function displayProducts(products) {
  const container = document.getElementById("products-container");
  const resultsCount = document.getElementById("results-count");

  resultsCount.textContent = `Showing ${products.length} product${
    products.length !== 1 ? "s" : ""
  }`;

  if (products.length === 0) {
    container.innerHTML =
      '<p class="no-results">No products found matching your criteria.</p>';
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" data-id="${product.id}">
            <a href="product.html?id=${product.id}" class="product-link">
                <img src="${product.image}" alt="${
        product.title
      }" class="product-image">
            </a>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <a href="product.html?id=${product.id}" class="product-link">
                    <h3 class="product-title">${
                      product.title.length > 40
                        ? product.title.substring(0, 40) + "..."
                        : product.title
                    }</h3>
                </a>
                <div class="product-rating">
                    ${generateStars(product.rating.rate)}
                    <span class="rating-count">(${product.rating.count})</span>
                </div>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${
                  product.id
                })">
                    Add to Cart
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star full">★</span>';
  }
  if (halfStar) {
    stars += '<span class="star half">★</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star empty">☆</span>';
  }
  return stars;
}

// Setup filter event listeners
function setupFilters() {
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const priceFilter = document.getElementById("price-filter");
  const sortFilter = document.getElementById("sort-filter");
  const clearBtn = document.getElementById("clear-filters");

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  priceFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);
  clearBtn.addEventListener("click", clearFilters);
}

// Apply all filters
function applyFilters() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const priceRange = document.getElementById("price-filter").value;
  const sortBy = document.getElementById("sort-filter").value;

  // Filter products
  filteredProducts = allProducts.filter((product) => {
    // Search filter
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    // Category filter
    const matchesCategory = category === "all" || product.category === category;

    // Price filter
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = product.price;
      switch (priceRange) {
        case "0-25":
          matchesPrice = price >= 0 && price < 25;
          break;
        case "25-50":
          matchesPrice = price >= 25 && price < 50;
          break;
        case "50-100":
          matchesPrice = price >= 50 && price < 100;
          break;
        case "100-500":
          matchesPrice = price >= 100 && price < 500;
          break;
        case "500+":
          matchesPrice = price >= 500;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-az":
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-za":
      filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  displayProducts(filteredProducts);
}

// Clear all filters
function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("category-filter").value = "all";
  document.getElementById("price-filter").value = "all";
  document.getElementById("sort-filter").value = "default";
  filteredProducts = [...allProducts];
  displayProducts(filteredProducts);
}

// Add product to cart
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product added to cart!");
}

// Update cart count in header
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? "inline-flex" : "none";
  }
}

// Show notification
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
