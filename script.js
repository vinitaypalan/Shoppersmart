/**
 * ShoppersMart – All-in-one script
 * Covers: product data, search/filter, cart logic, UI helpers
 */

// =============================================================
// PRODUCT DATA
// =============================================================

const PRODUCTS = [
  // Electronics
  {
    id: 1,
    name: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    brand: "Apple",
    category: "Electronics",
    price: 189.99,
    originalPrice: 249.00,
    rating: 4.8,
    reviews: 94832,
    emoji: "🎧",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "Active Noise Cancellation up to 2x more effective",
      "Adaptive Audio dynamically tunes to your environment",
      "Personalised Spatial Audio with dynamic head tracking",
      "MagSafe Charging Case with USB-C",
      "Up to 30 hours total listening time"
    ]
  },
  {
    id: 2,
    name: 'Samsung 65" Class OLED 4K Smart TV S95C',
    brand: "Samsung",
    category: "Electronics",
    price: 1497.99,
    originalPrice: 2299.99,
    rating: 4.7,
    reviews: 12450,
    emoji: "📺",
    badge: "deal",
    badgeText: "35% Off",
    prime: true,
    features: [
      "Self-lit OLED pixels for perfect black and infinite contrast",
      "4K Neural Quantum Processor",
      "Object Tracking Sound Pro+",
      "Gaming Hub – stream your favorite games",
      "Slim One Connect Box for clean cable management"
    ]
  },
  {
    id: 3,
    name: "Apple MacBook Air 15-inch M3 Chip, 8GB RAM, 256GB SSD",
    brand: "Apple",
    category: "Electronics",
    price: 1099.00,
    originalPrice: 1299.00,
    rating: 4.9,
    reviews: 23100,
    emoji: "💻",
    badge: "new",
    badgeText: "New",
    prime: true,
    features: [
      "Apple M3 chip with 8-core CPU and 10-core GPU",
      "18 hours of battery life",
      "15.3-inch Liquid Retina display",
      "1080p FaceTime HD camera",
      "MagSafe 3 charging"
    ]
  },
  {
    id: 4,
    name: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
    brand: "Sony",
    category: "Electronics",
    price: 279.99,
    originalPrice: 399.99,
    rating: 4.7,
    reviews: 48720,
    emoji: "🎵",
    badge: "deal",
    badgeText: "30% Off",
    prime: true,
    features: [
      "Industry-leading noise cancellation",
      "30 hours battery life with quick charging",
      "Crystal clear hands-free calling",
      "Multipoint connection – two devices simultaneously",
      "Foldable design for easy portability"
    ]
  },
  {
    id: 5,
    name: "iPhone 15 Pro Max, 256GB, Natural Titanium",
    brand: "Apple",
    category: "Electronics",
    price: 1099.00,
    originalPrice: 1199.00,
    rating: 4.8,
    reviews: 67300,
    emoji: "📱",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "Titanium design with textured matte glass back",
      "A17 Pro chip – game-changing chip",
      "Pro camera system with 5x Telephoto",
      "Action button for quick functions",
      "USB 3 speeds with USB-C"
    ]
  },
  {
    id: 6,
    name: 'Kindle Paperwhite (16 GB) – Now with a 7" display',
    brand: "Amazon",
    category: "Electronics",
    price: 139.99,
    originalPrice: 159.99,
    rating: 4.8,
    reviews: 156000,
    emoji: "📖",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      '7" glare-free Paperwhite display',
      "300 ppi high-resolution display",
      "Up to 12 weeks of battery life",
      "Adjustable warm light",
      "IPX8 waterproof rating"
    ]
  },
  // Home & Kitchen
  {
    id: 7,
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart",
    brand: "Instant Pot",
    category: "Home & Kitchen",
    price: 59.95,
    originalPrice: 99.95,
    rating: 4.7,
    reviews: 287000,
    emoji: "🍲",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer",
      "Cook up to 70% faster",
      "10+ built-in smart programs",
      "Dishwasher-safe lid and inner pot",
      "UL certified with 10 safety mechanisms"
    ]
  },
  {
    id: 8,
    name: "Ninja BN801 Professional Plus Kitchen System, 1400W",
    brand: "Ninja",
    category: "Home & Kitchen",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 32400,
    emoji: "🥤",
    badge: "deal",
    badgeText: "25% Off",
    prime: true,
    features: [
      "1400-watt motor base",
      "Auto-iQ Technology",
      "72 oz. Total Crushing Pitcher",
      "8-cup food processor bowl",
      "Dishwasher-safe parts"
    ]
  },
  {
    id: 9,
    name: "Nespresso Vertuo Next Coffee and Espresso Machine by De'Longhi",
    brand: "Nespresso",
    category: "Home & Kitchen",
    price: 119.95,
    originalPrice: 179.95,
    rating: 4.5,
    reviews: 18750,
    emoji: "☕",
    badge: null,
    badgeText: null,
    prime: true,
    features: [
      "5 cup sizes: Espresso, Double Espresso, Gran Lungo, Coffee, Alto",
      "Centrifusion™ extraction technology",
      "Rapid brewing – 30 seconds heat-up",
      "WiFi & Bluetooth connectivity",
      "23 oz. water tank"
    ]
  },
  {
    id: 10,
    name: "LEVOIT Air Purifier for Home Large Room, HEPA Filter",
    brand: "LEVOIT",
    category: "Home & Kitchen",
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviews: 45200,
    emoji: "🌬️",
    badge: "deal",
    badgeText: "40% Off",
    prime: true,
    features: [
      "Covers up to 1095 ft² / 101 m²",
      "True HEPA filter captures 99.97% of particles",
      "3-stage filtration system",
      "Sleep mode with quiet fan",
      "Smart WiFi – control via VeSync app"
    ]
  },
  // Clothing
  {
    id: 11,
    name: "Amazon Essentials Men's Regular-Fit Short-Sleeve T-Shirt",
    brand: "Amazon Essentials",
    category: "Clothing",
    price: 14.90,
    originalPrice: 19.99,
    rating: 4.4,
    reviews: 112000,
    emoji: "👕",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "100% cotton for everyday comfort",
      "Regular fit with crew neckline",
      "Machine washable",
      "Available in 30+ colors",
      "Sizes S-3XL"
    ]
  },
  {
    id: 12,
    name: "Levi's Men's 511 Slim Fit Jeans",
    brand: "Levi's",
    category: "Clothing",
    price: 39.99,
    originalPrice: 69.50,
    rating: 4.5,
    reviews: 78300,
    emoji: "👖",
    badge: "deal",
    badgeText: "42% Off",
    prime: true,
    features: [
      "Slim fit through seat and thigh",
      "Made with Flex Jeans fabric that moves with you",
      "97% Cotton, 3% Elastane",
      "Zip fly with button closure",
      "Available in multiple washes"
    ]
  },
  {
    id: 13,
    name: "Columbia Women's Benton Springs Full Zip Fleece Jacket",
    brand: "Columbia",
    category: "Clothing",
    price: 44.99,
    originalPrice: 65.00,
    rating: 4.6,
    reviews: 34500,
    emoji: "🧥",
    badge: null,
    badgeText: null,
    prime: true,
    features: [
      "100% Polyester fleece",
      "Classic fit",
      "Front zippered pockets",
      "Chin guard for comfort",
      "Available in 40+ colors"
    ]
  },
  // Sports & Outdoors
  {
    id: 14,
    name: "Manduka PRO Yoga Mat – 6mm Thick, Non Slip, Extra Long",
    brand: "Manduka",
    category: "Sports & Outdoors",
    price: 88.00,
    originalPrice: 120.00,
    rating: 4.7,
    reviews: 23100,
    emoji: "🧘",
    badge: null,
    badgeText: null,
    prime: true,
    features: [
      "6mm cushioning for joint protection",
      "Dense, closed-cell surface prevents bacteria buildup",
      "Moisture-wicking top layer",
      'Dimensions: 71" x 24"',
      "Lifetime guarantee"
    ]
  },
  {
    id: 15,
    name: "Bowflex SelectTech 552 Adjustable Dumbbell (Single)",
    brand: "Bowflex",
    category: "Sports & Outdoors",
    price: 229.00,
    originalPrice: 349.00,
    rating: 4.8,
    reviews: 18400,
    emoji: "🏋️",
    badge: "deal",
    badgeText: "34% Off",
    prime: true,
    features: [
      "Adjusts from 5 to 52.5 pounds",
      "Replaces 15 sets of weights",
      "Unique dial system",
      "Durable molding around metal plates",
      "2-year warranty on parts"
    ]
  },
  {
    id: 16,
    name: "YETI Rambler 20 oz Tumbler, Stainless Steel, Vacuum Insulated",
    brand: "YETI",
    category: "Sports & Outdoors",
    price: 29.98,
    originalPrice: 35.00,
    rating: 4.8,
    reviews: 67800,
    emoji: "🥤",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "Double-wall vacuum insulation",
      "18/8 stainless steel",
      "No sweat design",
      "Dishwasher safe",
      "MagSlider lid"
    ]
  },
  // Books
  {
    id: 17,
    name: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    brand: "James Clear",
    category: "Books",
    price: 13.48,
    originalPrice: 28.00,
    rating: 4.8,
    reviews: 302000,
    emoji: "📚",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "New York Times bestseller",
      "Over 10 million copies sold",
      "Practical framework for improving 1% every day",
      "Paperback, 320 pages",
      "ISBN-13: 978-0735211292"
    ]
  },
  {
    id: 18,
    name: "The Psychology of Money: Timeless lessons on wealth, greed, and happiness",
    brand: "Morgan Housel",
    category: "Books",
    price: 14.29,
    originalPrice: 22.00,
    rating: 4.7,
    reviews: 98400,
    emoji: "💰",
    badge: null,
    badgeText: null,
    prime: true,
    features: [
      "Wall Street Journal Bestseller",
      "Doing well with money isn't about intelligence",
      "19 short stories on money behaviour",
      "Paperback, 256 pages",
      "Translated into 30+ languages"
    ]
  },
  // Toys & Games
  {
    id: 19,
    name: "LEGO Star Wars Millennium Falcon 75257 Building Kit (1351 Pieces)",
    brand: "LEGO",
    category: "Toys & Games",
    price: 119.99,
    originalPrice: 169.99,
    rating: 4.9,
    reviews: 54200,
    emoji: "🚀",
    badge: "best-seller",
    badgeText: "Best Seller",
    prime: true,
    features: [
      "1,351 pieces",
      "Minifigures: Finn, Chewbacca, Lando Calrissian, Boolio, C-3PO, R2-D2 and D-O",
      "Detachable cockpit cover",
      "Rotating turrets",
      "Ages 9+"
    ]
  },
  {
    id: 20,
    name: "Hasbro Monopoly Classic Board Game",
    brand: "Hasbro",
    category: "Toys & Games",
    price: 22.99,
    originalPrice: 29.99,
    rating: 4.7,
    reviews: 125000,
    emoji: "🎲",
    badge: null,
    badgeText: null,
    prime: true,
    features: [
      "The classic fast-dealing property trading board game",
      "2-8 players",
      "Includes board, 8 tokens, 28 title deed cards, play money, dice, houses and hotels",
      "Ages 8+",
      "Approx. 60 min play time"
    ]
  }
];

// =============================================================
// PRODUCT HELPERS
// =============================================================

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function searchProducts(query = "", category = "", sortBy = "featured") {
  const q = query.trim().toLowerCase();
  let results = PRODUCTS.filter(p => {
    const matchesCat = !category || p.category === category;
    const matchesQ   = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  switch (sortBy) {
    case "price-asc":  results.sort((a, b) => a.price - b.price); break;
    case "price-desc": results.sort((a, b) => b.price - a.price); break;
    case "rating":     results.sort((a, b) => b.rating - a.rating); break;
    case "reviews":    results.sort((a, b) => b.reviews - a.reviews); break;
    default:
      results.sort((a, b) => (b.badge === "best-seller" ? 1 : 0) - (a.badge === "best-seller" ? 1 : 0));
  }
  return results;
}

/** Format a number as a dollar price string, e.g. 12.3 → "12.30" */
function formatPrice(price) {
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Return integer discount percentage */
function discountPercent(price, originalPrice) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** Build a star-rating string like "★★★★½☆" */
function getStarHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// =============================================================
// CART  (localStorage)
// =============================================================

const CART_KEY = "shoppersmart_cart";

function loadCart()       { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart)   { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function getCart()        { return loadCart(); }

function addToCart(productId, qty = 1) {
  const product = getProductById(productId);
  if (!product) return;
  const cart     = loadCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, brand: product.brand,
                price: product.price, emoji: product.emoji, qty });
  }
  saveCart(cart);
  updateCartBadge();
}

function updateCartQty(productId, qty) {
  let cart = loadCart();
  if (qty <= 0) { cart = cart.filter(i => i.id !== productId); }
  else { const item = cart.find(i => i.id === productId); if (item) item.qty = qty; }
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  saveCart(loadCart().filter(i => i.id !== productId));
  updateCartBadge();
}

function clearCart() { saveCart([]); updateCartBadge(); }

function getCartItemCount()  { return loadCart().reduce((s, i) => s + i.qty, 0); }
function getCartSubtotal()   { return loadCart().reduce((s, i) => s + i.price * i.qty, 0); }

// =============================================================
// UI HELPERS
// =============================================================

function updateCartBadge() {
  const badge = document.querySelector(".cart-count");
  if (!badge) return;
  const count = getCartItemCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function showToast(message, icon = "🛒") {
  let toast = document.getElementById("sm-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "sm-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3000);
}

function generateOrderNumber() {
  return `SM-${Date.now().toString().slice(-8)}-${Math.floor(Math.random()*1000).toString().padStart(3,"0")}`;
}

function placeOrder() {
  const num = generateOrderNumber();
  clearCart();
  return num;
}

// =============================================================
// CART PAGE RENDERING
// =============================================================

function renderCartPage() {
  const itemsEl    = document.getElementById("cart-items");
  const emptyEl    = document.getElementById("cart-empty");
  const sidebarEl  = document.getElementById("cart-sidebar");

  if (!itemsEl) return;

  const cart       = getCart();
  const totalItems = getCartItemCount();
  const subtotal   = getCartSubtotal();
  const label      = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;

  // sync all count / amount elements
  document.querySelectorAll(".js-cart-count").forEach(el => el.textContent = label);
  document.querySelectorAll(".js-cart-subtotal").forEach(el => el.textContent = `$${formatPrice(subtotal)}`);

  if (cart.length === 0) {
    itemsEl.classList.add("hidden");
    if (emptyEl)   emptyEl.classList.remove("hidden");
    if (sidebarEl) sidebarEl.classList.add("hidden");
    return;
  }

  if (emptyEl)   emptyEl.classList.add("hidden");
  if (sidebarEl) sidebarEl.classList.remove("hidden");
  itemsEl.classList.remove("hidden");

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p class="in-stock">✓ In Stock</p>
        <p class="prime-badge">⚡ Prime FREE delivery</p>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="Decrease quantity">−</button>
            <input class="qty-display" type="number" value="${item.qty}" min="1" max="99"
              onchange="setQty(${item.id}, parseInt(this.value))" aria-label="Quantity" />
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-action-link" onclick="deleteCartItem(${item.id})">Delete</span>
          <span class="cart-action-link" onclick="saveForLater(${item.id})">Save for later</span>
        </div>
      </div>
      <div class="cart-item-price">$${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join("");
}

function changeQty(productId, delta) {
  const item = loadCart().find(i => i.id === productId);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty < 1) { deleteCartItem(productId); return; }
  updateCartQty(productId, newQty);
  renderCartPage();
}

function setQty(productId, qty) {
  if (isNaN(qty) || qty < 1) qty = 1;
  updateCartQty(productId, qty);
  renderCartPage();
}

function deleteCartItem(productId) {
  removeFromCart(productId);
  showToast("Item removed from cart", "🗑️");
  renderCartPage();
}

function saveForLater(productId) {
  const item = loadCart().find(i => i.id === productId);
  if (item) {
    showToast(`"${item.name.substring(0, 40)}..." saved for later`, "🔖");
    removeFromCart(productId);
    renderCartPage();
  }
}
