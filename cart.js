
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08;
const SHIPPING_COST = 9.99;

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  setupEventListeners();
  updateCartCount();
  checkLoginStatus();
  setupMobileMenu();
});


function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  const loginLink = document.getElementById("login-link");
  if (user && loginLink) {
    loginLink.textContent = user.name ? user.name.split(" ")[0] : "Account";
  }
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


function setupEventListeners() {
  document
    .getElementById("clear-cart-btn")
    .addEventListener("click", clearCart);
  document
    .getElementById("checkout-btn")
    .addEventListener("click", handleCheckout);
}


function renderCart() {
  const container = document.getElementById("cart-items-container");
  const clearBtn = document.getElementById("clear-cart-btn");

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet!</p>
                <a href="shop.html" class="shopNowButton">Start Shopping</a>
            </div>
        `;
    clearBtn.style.display = "none";
    updateSummary();
    return;
  }

  clearBtn.style.display = "block";

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <a href="product.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.title}">
                </a>
            </div>
            <div class="cart-item-details">
                <a href="product.html?id=${item.id}">
                    <h4 class="cart-item-title">${item.title}</h4>
                </a>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus" onclick="updateQuantity(${
                  item.id
                }, -1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn plus" onclick="updateQuantity(${
                  item.id
                }, 1)">+</button>
            </div>
            <div class="cart-item-total">
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="remove-item-btn" onclick="removeItem(${item.id})">
                ✕
            </button>
        </div>
    `
    )
    .join("");

  updateSummary();
}


function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  const newQuantity = item.quantity + change;

  if (newQuantity <= 0) {
    removeItem(productId);
    return;
  }

  item.quantity = newQuantity;
  saveCart();
  renderCart();
}


function removeItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  showNotification("Item removed from cart");
}


function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCart();
    renderCart();
    showNotification("Cart cleared");
  }
}


function updateSummary() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping =
    subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("shipping").textContent =
    shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;


  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = cart.length === 0;
}


function handleCheckout() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showNotification("Please login to checkout");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }


  alert(
    `Thank you for your order, ${
      user.name || user.email
    }!\n\nYour order has been placed successfully.\n\nTotal: ${
      document.getElementById("total").textContent
    }`
  );

  
  cart = [];
  saveCart();
  renderCart();
}


function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}


function updateCartCount() {
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
