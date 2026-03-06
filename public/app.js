// ============================
// Wooden It Be Nice? - CLEAN app.js
// Replace EVERYTHING in public/app.js with this
// // update ============================
// rebuild trigger

// Products
const PRODUCTS = [
  { id: "farmhouse-4", name: "Farmhouse Sayings (Set of 4)", price: 25, category: "farm" },
  { id: "ohio-outdoors-4", name: "Ohio Outdoors (Set of 4)", price: 25, category: "outdoors" },
  { id: "all-catfish-4", name: "All Catfish (Set of 4)", price: 25, category: "outdoors" },
  { id: "custom-name-4", name: "Custom Name / Design (Set of 4)", price: 30, category: "custom" },
  { id: "realtor-bundle", name: "Realtor Closing Gift Bundle", price: 50, category: "bulk" }
];

const $ = (id) => document.getElementById(id);

const state = {
  cart: JSON.parse(localStorage.getItem("wibn_cart") || "{}")
};

// ---------- Helpers ----------
function saveCart() {
  localStorage.setItem("wibn_cart", JSON.stringify(state.cart));
  renderCartCount();
}

function money(n) {
  return `$${Number(n).toFixed(0)}`;
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + b, 0);
}

function totalSets() {
  return Object.values(state.cart).reduce((a, b) => a + b, 0);
}

function subtotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

// USA shipping only:
// 1 set = $12
// 2 sets = $14
// 3+ sets = free
function calcShipping(setCount, method = "ship") {
  if (method === "pickup") return 0;
  if (setCount <= 0) return 0;
  if (setCount === 1) return 12;
  if (setCount === 2) return 14;
  return 0;
}

function openCart() {
  const cart = $("cart");
  const overlay = $("overlay");
  if (cart) cart.hidden = false;
  if (overlay) overlay.hidden = false;
}

function closeCart() {
  const cart = $("cart");
  const overlay = $("overlay");
  if (cart) cart.hidden = true;
  if (overlay) overlay.hidden = true;
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
  openCart();
}

// ---------- Shop grid ----------
function renderGrid() {
  const grid = $("grid");
  if (!grid) return;

  const searchEl = $("search");
  const categoryEl = $("category");

  const q = searchEl ? searchEl.value.trim().toLowerCase() : "";
  const cat = categoryEl ? categoryEl.value : "all";

  const list = PRODUCTS.filter(p => {
    const matchText = !q || p.name.toLowerCase().includes(q);
    const matchCat = cat === "all" || p.category === cat;
    return matchText && matchCat;
  });

  grid.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb" aria-hidden="true"></div>
      <div class="cardBody">
        <div class="cardTitle">${p.name}</div>
        <div class="cardMeta">
          <div class="muted">${money(p.price)}</div>
          <button class="btn primary shopAddBtn" type="button" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".shopAddBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.getAttribute("data-id"));
    });
  });
}

// ---------- Cart ----------
function renderCartCount() {
  const el = $("cartCount");
  if (el) el.textContent = cartCount();
}

function renderCart() {
  const wrap = $("cartItems");
  if (!wrap) return;

  wrap.innerHTML = "";
  const entries = Object.entries(state.cart);

  if (entries.length === 0) {
    wrap.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    if ($("subtotal")) $("subtotal").textContent = "$0";
    if ($("shipCost")) $("shipCost").textContent = "$0";
    if ($("total")) $("total").textContent = "$0";
    return;
  }

  entries.forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div>
        <strong>${p.name}</strong>
        <div class="muted">${money(p.price)} each</div>
        <div class="qtyRow">
          <button class="qtyBtn" type="button" data-dec="${id}">−</button>
          <div><strong>${qty}</strong></div>
          <button class="qtyBtn" type="button" data-inc="${id}">+</button>
          <button class="qtyBtn" type="button" data-rm="${id}">Remove</button>
        </div>
      </div>
      <div><strong>${money(p.price * qty)}</strong></div>
    `;
    wrap.appendChild(el);
  });

  const shipMethodEl = document.querySelector('#invoiceCheckout select[name="shipping_method"]');
  const shipMethod = shipMethodEl ? shipMethodEl.value : "ship";
  const ship = calcShipping(totalSets(), shipMethod);
  const sub = subtotal();
  const total = sub + ship;

  if ($("subtotal")) $("subtotal").textContent = money(sub);
  if ($("shipCost")) $("shipCost").textContent = money(ship);
  if ($("total")) $("total").textContent = money(total);

  wrap.querySelectorAll("[data-inc]").forEach(b =>
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-inc");
      state.cart[id] += 1;
      saveCart();
      renderCart();
    })
  );

  wrap.querySelectorAll("[data-dec]").forEach(b =>
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-dec");
      state.cart[id] = Math.max(0, state.cart[id] - 1);
      if (state.cart[id] === 0) delete state.cart[id];
      saveCart();
      renderCart();
    })
  );

  wrap.querySelectorAll("[data-rm]").forEach(b =>
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-rm");
      delete state.cart[id];
      saveCart();
      renderCart();
    })
  );
}

// ---------- Featured section ----------
function wireFeaturedButtons() {
  document.querySelectorAll(".addBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToCart(id);
    });
  });

  const startCustomBtn = $("startCustomBtn");
  if (startCustomBtn) {
    startCustomBtn.addEventListener("click", () => {
      const custom = $("custom");
      if (custom) custom.style.display = "block";
      custom?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// ---------- Hero buttons ----------
function wireHeroButtons() {
  const heroShopBtn = $("heroShopBtn");
  const heroCustomBtn = $("heroCustomBtn");

  if (heroShopBtn) {
    heroShopBtn.addEventListener("click", () => {
      $("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (heroCustomBtn) {
    heroCustomBtn.addEventListener("click", () => {
      const custom = $("custom");
      if (custom) custom.style.display = "block";
      custom?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// ---------- Cart invoice form ----------
function showInvoiceForm() {
  const form = $("invoiceCheckout");
  if (!form) return;

  if (Object.keys(state.cart).length === 0) {
    alert("Your cart is empty.");
    return;
  }

  form.hidden = false;
  updateInvoiceHiddenFields();
}

function updateInvoiceHiddenFields() {
  const form = $("invoiceCheckout");
  if (!form) return;

  const shipMethodEl = form.querySelector('select[name="shipping_method"]');
  const shipMethod = shipMethodEl ? shipMethodEl.value : "ship";

  const lines = [];
  Object.entries(state.cart).forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    lines.push(`${p.name} x${qty} = $${(p.price * qty).toFixed(2)}`);
  });

  const sub = subtotal();
  const ship = calcShipping(totalSets(), shipMethod);
  const total = sub + ship;

  if ($("order_items")) $("order_items").value = lines.join("\n");
  if ($("order_totals")) {
    $("order_totals").value =
      `Subtotal: $${sub.toFixed(2)} | Shipping: $${ship.toFixed(2)} | Total: $${total.toFixed(2)}`;
  }
  if ($("order_url")) $("order_url").value = window.location.href;

  renderCart();
}

function wireInvoiceCheckout() {
  const btn = $("requestInvoice");
  const form = $("invoiceCheckout");

  if (btn) {
    btn.addEventListener("click", showInvoiceForm);
  }

  if (form) {
    const shipMethodEl = form.querySelector('select[name="shipping_method"]');
    if (shipMethodEl) {
      shipMethodEl.addEventListener("change", updateInvoiceHiddenFields);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateInvoiceHiddenFields();

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
      .then(() => {
        alert("Order request sent! I’ll message you with the invoice.");
        state.cart = {};
        saveCart();
        renderCart();
        form.reset();
        form.hidden = true;
        closeCart();
        if ($("thanks")) $("thanks").classList.add("show");
      })
      .catch(() => {
        alert("Something blocked the order request.");
      });
    });
  }
}

// ---------- Custom order form on page ----------
function wireCustomOrderForm() {
  const form = $("invoiceForm");
  const result = $("invoiceResult");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    })
    .then(() => {
      if (result) result.textContent = "Request sent! I’ll message you shortly.";
      form.reset();
      if ($("thanks")) $("thanks").classList.add("show");
    })
    .catch(() => {
      if (result) result.textContent = "Something blocked the request. Please try again.";
    });
  });
}

// ---------- Thanks section ----------
function wireThanksSection() {
  const thanks = $("thanks");
  if (!thanks) return;

  if (location.hash === "#thanks") {
    thanks.classList.add("show");
  } else {
    thanks.classList.remove("show");
  }
}

// ---------- Init ----------
function init() {
  renderCartCount();
  renderGrid();
  renderCart();

  wireFeaturedButtons();
  wireHeroButtons();
  wireInvoiceCheckout();
  wireCustomOrderForm();
  wireThanksSection();

  if ($("search")) $("search").addEventListener("input", renderGrid);
  if ($("category")) $("category").addEventListener("change", renderGrid);
  if ($("cartBtn")) $("cartBtn").addEventListener("click", () => { openCart(); renderCart(); });
  if ($("closeCart")) $("closeCart").addEventListener("click", closeCart);
  if ($("overlay")) $("overlay").addEventListener("click", closeCart);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
}

// Make these available for any existing inline onclicks
window.openCart = openCart;
window.closeCart = closeCart;
window.renderCart = renderCart;
window.requestInvoiceFromCart = showInvoiceForm;
window.quickAdd = addToCart;
window.openCustomForm = function () {
  const custom = $("custom");
  if (custom) custom.style.display = "block";
  custom?.scrollIntoView({ behavior: "smooth", block: "start" });
};

document.addEventListener("DOMContentLoaded", init);
// ============================
// COASTER DESIGNER
// ============================

const DESIGNER = {
  shape: "square",
  border: "border1.png",
  scene: "scene1.jpg",
  text: ""
};

const BORDER_FILES = [
  "border1.png", "border2.png", "border3.png",
  "border4.png", "border5.png", "border6.png"
];

const SCENE_FILES = [
  "scene1.jpg", "scene2.jpg", "scene3.jpg", "scene4.jpg", "scene5.jpg", "scene6.jpg",
  "scene7.png", "scene8.png", "scene9.png", "scene10.png", "scene11.png", "scene12.png",
  "scene13.png", "scene14.png", "scene15.png", "scene16.png", "scene17.png", "scene18.png",
  "scene19.png", "scene20.png", "scene21.png", "scene22.png", "scene23.png", "scene24.png"
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderDesignerPreview() {
  const canvas = document.getElementById("coasterCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;

  ctx.clearRect(0, 0, size, size);

  if (DESIGNER.shape === "round") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  try {
    const scene = await loadImage(`assets/scenes/${DESIGNER.scene}`);
    ctx.drawImage(scene, 0, 0, size, size);
  } catch (e) {
    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, size, size);
  }

  try {
    const border = await loadImage(`assets/borders/${DESIGNER.border}`);
    ctx.drawImage(border, 0, 0, size, size);
  } catch (e) {}

  if (DESIGNER.shape === "round") {
    ctx.restore();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#8b6b45";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  if (DESIGNER.text.trim()) {
    ctx.fillStyle = "#2a2a2a";
    ctx.font = "bold 28px serif";
    ctx.textAlign = "center";
    ctx.fillText(DESIGNER.text, size / 2, size - 28);
  }
}

function buildThumbOptions(containerId, files, folder, type) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = "";

  files.forEach((file) => {
    const div = document.createElement("div");
    div.className = "thumbOption" + ((type === "border" && DESIGNER.border === file) || (type === "scene" && DESIGNER.scene === file) ? " active" : "");
    div.innerHTML = `<img src="assets/${folder}/${file}" alt="${file}">`;

    div.addEventListener("click", () => {
      if (type === "border") DESIGNER.border = file;
      if (type === "scene") DESIGNER.scene = file;

      buildThumbOptions("borderOptions", BORDER_FILES, "borders", "border");
      buildThumbOptions("sceneOptions", SCENE_FILES, "scenes", "scene");
      renderDesignerPreview();
    });

    wrap.appendChild(div);
  });
}

function wireDesigner() {
  const canvas = document.getElementById("coasterCanvas");
  if (!canvas) return;

  document.querySelectorAll(".shapeBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".shapeBtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      DESIGNER.shape = btn.getAttribute("data-shape");
      renderDesignerPreview();
    });
  });

  const textInput = document.getElementById("customText");
  if (textInput) {
    textInput.addEventListener("input", () => {
      DESIGNER.text = textInput.value;
      renderDesignerPreview();
    });
  }

  buildThumbOptions("borderOptions", BORDER_FILES, "borders", "border");
  buildThumbOptions("sceneOptions", SCENE_FILES, "scenes", "scene");
  renderDesignerPreview();

  const addBtn = document.getElementById("addCustomDesignBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const customId = "custom-name-4";
      state.cart[customId] = (state.cart[customId] || 0) + 1;

      // store design separately
      localStorage.setItem("wibn_last_custom_design", JSON.stringify(DESIGNER));

      saveCart();
      renderCart();
      openCart();

      alert("Custom design added to cart.");
    });
  }
}

document.addEventListener("DOMContentLoaded", wireDesigner);
