
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", () => {
  fetchFeaturedProducts();
  updateCartCount();
  checkLoginStatus();
  setupMobileMenu();
});


function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  const loginLink = document.getElementById("login-link");
  const welcomeMessage = document.getElementById("welcome-message");

  if (user) {
  
    if (loginLink) {
      loginLink.textContent = user.name ? user.name.split(" ")[0] : "Account";
    }

 
    if (welcomeMessage && user.name) {
      welcomeMessage.textContent = `Welcome, ${user.name.split(" ")[0]}!`;
    }
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


function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? "inline-flex" : "none";
  }
}


async function fetchFeaturedProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    
    const featuredProducts = data.sort(() => 0.5 - Math.random()).slice(0, 4);

    const container = document.getElementById("featured-container");

    featuredProducts.forEach((product) => {
      const productCard = `
                <div class="product-card" data-id="${product.id}">
                    <a href="product.html?id=${
                      product.id
                    }" class="product-link">
                        <img src="${product.image}" alt="${
        product.title
      }" class="product-image">
                    </a>
                    <div class="product-info">
                        <span class="product-category">${
                          product.category
                        }</span>
                        <a href="product.html?id=${
                          product.id
                        }" class="product-link">
                            <h3 class="product-title">${
                              product.title.length > 40
                                ? product.title.substring(0, 40) + "..."
                                : product.title
                            }</h3>
                        </a>
                        <div class="product-rating">
                            ${generateStars(product.rating.rate)}
                            <span class="rating-count">(${
                              product.rating.count
                            })</span>
                        </div>
                        <p class="product-price">$${product.price.toFixed(
                          2
                        )}</p>
                        <button class="add-to-cart-btn" onclick="addToCart(${
                          product.id
                        }, '${product.title.replace(/'/g, "\\'")}', ${
        product.price
      }, '${product.image}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
      container.innerHTML += productCard;
    });
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("featured-container").innerHTML =
      '<p class="error-message-display">Failed to load products. Please try again later.</p>';
  }
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


function addToCart(productId, title, price, image) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      title: title,
      price: price,
      image: image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product added to cart!");
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

