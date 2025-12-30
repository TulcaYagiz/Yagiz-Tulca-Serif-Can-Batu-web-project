
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentProduct = null;
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProduct();
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


function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}


async function loadProduct() {
  const productId = getProductId();

  if (!productId) {
    showError("No product specified");
    return;
  }

  try {
  
    const allResponse = await fetch("https://fakestoreapi.com/products");
    allProducts = await allResponse.json();

  
    currentProduct = allProducts.find((p) => p.id === parseInt(productId));

    if (!currentProduct) {
      showError("Product not found");
      return;
    }

    displayProduct(currentProduct);
    loadRelatedProducts(currentProduct);

 
    document.title = `${currentProduct.title} - E-Commerce Website`;
  } catch (error) {
    console.error("Error loading product:", error);
    showError("Failed to load product");
  }
}


function displayProduct(product) {
  const container = document.getElementById("product-container");
  const breadcrumb = document.getElementById("breadcrumb-product");

  breadcrumb.textContent =
    product.title.length > 30
      ? product.title.substring(0, 30) + "..."
      : product.title;

  container.innerHTML = `
        <div class="product-detail-image">
            <img src="${product.image}" alt="${
    product.title
  }" id="main-product-image">
        </div>
        <div class="product-detail-info">
            <span class="product-category-badge">${product.category}</span>
            <h1 class="product-detail-title">${product.title}</h1>
            
            <div class="product-rating-detail">
                ${generateStars(product.rating.rate)}
                <span class="rating-text">${product.rating.rate.toFixed(
                  1
                )} out of 5</span>
                <span class="rating-count">(${
                  product.rating.count
                } reviews)</span>
            </div>
            
            <p class="product-detail-price">$${product.price.toFixed(2)}</p>
            
            <div class="product-description">
                <h3>Description</h3>
                <p>${product.description}</p>
            </div>
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="qty-btn minus" onclick="decreaseQty()">−</button>
                    <input type="number" id="quantity-input" value="1" min="1" max="99">
                    <button class="qty-btn plus" onclick="increaseQty()">+</button>
                </div>
                <button class="add-to-cart-btn large" onclick="addToCartFromDetail()">
                    Add to Cart
                </button>
            </div>
            
            <div class="product-meta">
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Availability:</strong> <span class="in-stock">In Stock</span></p>
                <p><strong>SKU:</strong> PROD-${product.id
                  .toString()
                  .padStart(5, "0")}</p>
            </div>
        </div>
    `;
}


function loadRelatedProducts(product) {
  const container = document.getElementById("related-products-container");

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
   
    const randomProducts = allProducts
      .filter((p) => p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    displayRelatedProducts(container, randomProducts);
  } else {
    displayRelatedProducts(container, relatedProducts);
  }
}

function displayRelatedProducts(container, products) {
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


function increaseQty() {
  const input = document.getElementById("quantity-input");
  if (input.value < 99) {
    input.value = parseInt(input.value) + 1;
  }
}

function decreaseQty() {
  const input = document.getElementById("quantity-input");
  if (input.value > 1) {
    input.value = parseInt(input.value) - 1;
  }
}


function addToCartFromDetail() {
  if (!currentProduct) return;

  const quantity =
    parseInt(document.getElementById("quantity-input").value) || 1;

  const existingItem = cart.find((item) => item.id === currentProduct.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: currentProduct.id,
      title: currentProduct.title,
      price: currentProduct.price,
      image: currentProduct.image,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification(`Added ${quantity} item(s) to cart!`);
}


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


function showError(message) {
  const container = document.getElementById("product-container");
  container.innerHTML = `
        <div class="error-container">
            <h2>Oops!</h2>
            <p>${message}</p>
            <a href="shop.html" class="shopNowButton">Back to Shop</a>
        </div>
    `;
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
