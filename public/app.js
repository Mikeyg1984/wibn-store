// Edit products here
const PRODUCTS = [
  {
    id: "farmhouse-4",
    name: "Farmhouse Sayings (Set of 4)",
    price: 25,
    category: "farm",
    stripeLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK",
    paypalLink: "https://paypal.me/REPLACE/25"
  },
  {
    id: "ohio-outdoors-4",
    name: "Ohio Outdoors (Set of 4)",
    price: 25,
    category: "outdoors",
    stripeLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK",
    paypalLink: "https://paypal.me/REPLACE/25"
  },
  {
    id: "all-catfish-4",
    name: "All Catfish (Set of 4)",
    price: 25,
    category: "outdoors",
    stripeLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK",
    paypalLink: "https://paypal.me/REPLACE/25"
  },
  {
    id: "custom-name-4",
    name: "Custom Family Name (Set of 4)",
    price: 30,
    category: "custom",
    stripeLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK",
    paypalLink: "https://paypal.me/REPLACE/30"
  },
  {
    id: "realtor-bundle",
    name: "Realtor Closing Gift Bundle",
    price: 50,
    category: "bulk",
    stripeLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK",
    paypalLink: "https://paypal.me/REPLACE/50"
  }
];

const $ = (id) => document.getElementById(id);

// Safe event binder: won't crash if element doesn't exist
const on = (id, event, handler) => {
  const el = document.getElementById(id);
  if (!el) return; // ✅ do nothing if missing
  el.addEventListener(event, handler);
};

const state = {
  cart: JSON.parse(localStorage.getItem("wibn_cart") || "{}"), // {id: qty}
};

function saveCart(){
  localStorage.setItem("wibn_cart", JSON.stringify(state.cart));
  renderCartCount();
}

function cartCount(){
  return Object.values(state.cart).reduce((a,b)=>a+b,0);
}

function subtotal(){
  return Object.entries(state.cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price*qty : 0);
  },0);
}

function money(n){ return `$${n.toFixed(0)}`; }

function renderGrid(){
  const grid = $("grid");
  const q = $("search").value.trim().toLowerCase();
  const cat = $("category").value;

  const list = PRODUCTS.filter(p=>{
    const matchText = !q || p.name.toLowerCase().includes(q);
    const matchCat = cat==="all" || p.category===cat;
    return matchText && matchCat;
  });

  grid.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb" aria-hidden="true"></div>
      <div class="cardBody">
        <div class="cardTitle">${p.name}</div>
        <div class="cardMeta">
          <div class="muted">${money(p.price)}</div>
          <button class="btn primary" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-add");
      state.cart[id] = (state.cart[id] || 0) + 1;
      saveCart();
      openCart();
      renderCart();
    });
  });
}

function renderCartCount(){
  $("cartCount").textContent = cartCount();
}

function renderCart(){
  const wrap = $("cartItems");
  wrap.innerHTML = "";
  const entries = Object.entries(state.cart);

  if(entries.length===0){
    wrap.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    $("subtotal").textContent = "$0";
    return;
  }

  entries.forEach(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div>
        <strong>${p.name}</strong>
        <div class="muted">${money(p.price)} each</div>
        <div class="qtyRow">
          <button class="qtyBtn" data-dec="${id}">−</button>
          <div><strong>${qty}</strong></div>
          <button class="qtyBtn" data-inc="${id}">+</button>
          <button class="qtyBtn" data-rm="${id}">Remove</button>
        </div>
      </div>
      <div><strong>${money(p.price*qty)}</strong></div>
    `;
    wrap.appendChild(el);
  });

  $("subtotal").textContent = money(subtotal());

  wrap.querySelectorAll("[data-inc]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.getAttribute("data-inc");
    state.cart[id]+=1; saveCart(); renderCart();
  }));
  wrap.querySelectorAll("[data-dec]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.getAttribute("data-dec");
    state.cart[id]=Math.max(0,state.cart[id]-1);
    if(state.cart[id]===0) delete state.cart[id];
    saveCart(); renderCart();
  }));
  wrap.querySelectorAll("[data-rm]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.getAttribute("data-rm");
    delete state.cart[id];
    saveCart(); renderCart();
  }));
}

// Checkout (Path A): we open a payment link.
// For real cart totals later, we’ll swap this to Stripe Checkout (backend).
function bestSingleProduct(){
  // If multiple items, pick the highest priced item as the "payment link" target (MVP).
  // Better: create a "Custom Invoice" product link and price it manually.
  const entries = Object.entries(state.cart);
  if(entries.length===0) return null;
  let best=null;
  entries.forEach(([id,qty])=>{
    const p=PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    if(!best || p.price>best.price) best=p;
  });
  return best;
}

function stripeCheckout(){
  const p = bestSingleProduct();
  if(!p || !p.stripeLink.includes("stripe.com")){
    alert("Add your Stripe Payment Link in app.js (stripeLink) for each product.");
    return;
  }
  window.open(p.stripeLink, "_blank");
}

function paypalCheckout(){
  const p = bestSingleProduct();
  if(!p || !p.paypalLink.includes("paypal.me")){
    alert("Add your PayPal.me link in app.js (paypalLink) for each product.");
    return;
  }
  window.open(p.paypalLink, "_blank");
}

// Custom form: just builds a mailto as MVP
function setupCustomForm(){
  const form = document.getElementById("customForm"); // whatever your id is
  if(!form) return; // ✅ STOP if the element doesn't exist
  form.addEventListener("submit", (e) => {
    // existing code
  });
}
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get("name");
    const contact = data.get("contact");
    const details = data.get("details");
    const qty = data.get("qty");
    const deadline = data.get("deadline");

    const subject = encodeURIComponent("Custom Coaster Request — Wooden It Be Nice?");
    const body = encodeURIComponent(
`Name: ${name}
Contact: ${contact}
Qty (sets of 4): ${qty}
Deadline: ${deadline || "n/a"}

Details:
${details}`
    );

    // Replace with your email:
    const to = "threeohninellc@gmail.com";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    $("customResult").textContent = "Your email app should open now. If not, message me on Facebook with these details.";
    form.reset();
  });

// Cart drawer
function openCart(){ $("cart").hidden=false; $("overlay").hidden=false; }
function closeCart(){ $("cart").hidden=true; $("overlay").hidden=true; }

function init(){
  renderCartCount();
  renderGrid();
  renderCart();
  setupCustomForm();

  on("search", "input", renderGrid);
on("category", "change", renderGrid);

on("cartBtn", "click", () => { openCart(); renderCart(); });
on("closeCart", "click", closeCart);
on("overlay", "click", closeCart);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

 
}

init();

document.getElementById("requestInvoice").addEventListener("click", requestInvoiceFromCart);

function requestInvoiceFromCart() {

  const name = prompt("Customer name:");
  if (!name) return;

  const contact = prompt("Customer email or phone:");
  if (!contact) return;

  let order = "NEW ORDER REQUEST\n\n";
  order += "Customer: " + name + "\n";
  order += "Contact: " + contact + "\n\n";
  order += "Items:\n";

  let subtotal = 0;

  Object.entries(state.cart).forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    const lineTotal = p.price * qty;
    subtotal += lineTotal;

    order += "- " + p.name + " x" + qty + " ($" + lineTotal + ")\n";
  });

  const shipping = subtotal >= 49 ? 0 : 12;
  const total = subtotal + shipping;

  order += "\nSubtotal: $" + subtotal;
  order += "\nShipping: $" + shipping;
  order += "\nTotal: $" + total;

  alert(order + "\n\nCopy this and send it to threeohninellc@gmail.com for an invoice.");

}

// ---- Make functions available to HTML onclick handlers ----
window.openCart = openCart;
window.closeCart = closeCart;
window.renderCart = renderCart;
window.requestInvoiceFromCart = requestInvoiceFromCart;

// expose functions for onclick handlers
window.openCart = openCart;
window.renderCart = renderCart;
window.requestInvoiceFromCart = requestInvoiceFromCart;

// ---------------------------
// INVOICE CHECKOUT SYSTEM
// ---------------------------

function buildOrderSummary(shippingMethod){

  const entries = Object.entries(state.cart);
  const lines = [];
  let subtotal = 0;

  for (const [id, qty] of entries){
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) continue;

    const lineTotal = p.price * qty;
    subtotal += lineTotal;

    lines.push(`${p.name} x${qty} = $${lineTotal.toFixed(2)}`);
  }

  let totalSets = Object.values(state.cart).reduce((a,b)=>a+b,0);

let shipping = 0;

if(totalSets === 1){
  shipping = 12;
}
else if(totalSets === 2){
  shipping = 14;
}
else if(totalSets >= 3){
  shipping = 0;
}
  const total = subtotal + shipping;

  return {
    itemsText: lines.join("\n"),
    totalsText: `Subtotal: $${subtotal.toFixed(2)} | Shipping: $${shipping.toFixed(2)} | Total: $${total.toFixed(2)}`
  };
}

function showInvoiceCheckout(){

  const form = document.getElementById("invoiceCheckout");

  if(Object.keys(state.cart).length === 0){
    alert("Your cart is empty.");
    return;
  }

  form.hidden = false;

  const shipSel = form.querySelector('select[name="shipping_method"]');
  const { itemsText, totalsText } = buildOrderSummary(shipSel.value);

  document.getElementById("order_items").value = itemsText;
  document.getElementById("order_totals").value = totalsText;
  document.getElementById("order_url").value = window.location.href;

}

function wireInvoiceCheckout(){

  const btn = document.getElementById("requestInvoice");
  const form = document.getElementById("invoiceCheckout");

  if(!btn){
    console.error("Missing #requestInvoice button in HTML");
    return;
  }
  if(!form){
    console.error("Missing #invoiceCheckout form in HTML");
    return;
  }

  // Optional: confirm wiring
  // alert("wireInvoiceCheckout ran");

  btn.addEventListener("click", () => showInvoiceCheckout());

  form.addEventListener("submit", (e) => {

  });
}

    e.preventDefault();

    const ship = form.querySelector('select[name="shipping_method"]').value;

    const updated = buildOrderSummary(ship);

    document.getElementById("order_items").value = updated.itemsText;
    document.getElementById("order_totals").value = updated.totalsText;
    document.getElementById("order_url").value = window.location.href;

    const action = "https://formsubmit.co/hiremikeg@gmail.com";

    const data = new FormData(form);

    fetch(action, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
    .then(() => {

      alert("Order request sent! I will message you with the invoice.");

      state.cart = {};
      saveCart();
      renderCart();
      closeCart();

      form.reset();
      form.hidden = true;

    })
    

  

// Wire up invoice checkout even if DOMContentLoaded already happened
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireInvoiceCheckout);
} else {
  wireInvoiceCheckout();
}
// --- HERO BUTTONS: smooth scroll + highlight ---
function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });

  // Flash highlight so user sees it worked
  el.classList.remove("flash");
  // force reflow so re-adding works every click
  void el.offsetWidth;
  el.classList.add("flash");
}

function wireHeroButtons(){
  const shopBtn = document.getElementById("heroShopBtn");
  const customBtn = document.getElementById("heroCustomBtn");

  if(shopBtn) shopBtn.addEventListener("click", () => scrollToSection("shop"));
  if(customBtn) customBtn.addEventListener("click", () => scrollToSection("custom"));
}

// run now (script is at bottom of page)
wireHeroButtons();
// Custom Orders form -> send via fetch so it doesn't navigate away
(function wireCustomOrderForm(){
  const form = document.getElementById("invoiceForm");
  const result = document.getElementById("invoiceResult");
  if(!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);

    fetch("https://formsubmit.co/hiremikeg@gmail.com", {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
    .then(() => {
      if(result) result.textContent = "Request sent! I’ll message you to confirm details and send an invoice link.";
      form.reset();
    })
    .catch(() => {
      if(result) result.textContent = "Something blocked the request. Please try again.";
      // ----------------------------
// Featured buttons: guaranteed add-to-cart
// ----------------------------

// Fallback openCart if your file doesn't have it
function forceOpenCart(){
  const cart = document.getElementById("cart");
  const overlay = document.getElementById("overlay");
  if(cart) cart.hidden = false;
  if(overlay) overlay.hidden = false;
}

// Fallback renderCart if your file doesn't have it
function forceRenderCart(){
  // If your app already has renderCart(), use it.
  if(typeof renderCart === "function"){
    renderCart();
    return;
  }
  // Otherwise do nothing (cart may still open).
}

window.quickAdd = function(productId){
  // Make sure state/cart exists
  if(!window.state) window.state = {};
  if(!state.cart) state.cart = {};

  // Add 1 of that product
  state.cart[productId] = (state.cart[productId] || 0) + 1;

  // Save if you have saveCart()
  if(typeof saveCart === "function") saveCart();

  // Update UI
  forceRenderCart();
  forceOpenCart();
};

window.openCustomForm = function(){
  const custom = document.getElementById("custom");
  if(custom) custom.style.display = "block";
};
    });
  });
})();
// --- Featured tiles helpers ---
window.quickAdd = function(productId){
  addToCart(productId);
  openCart();
  renderCart();
};

window.openCustomForm = function(){
  const custom = document.getElementById("custom");
  if(custom) custom.style.display = "block";
  custom?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};
// --- Featured buttons wiring (no inline onclick needed) ---
(function wireFeaturedButtons(){
  const addButtons = document.querySelectorAll(".addBtn");

  addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");

      // Try your existing addToCart() if present
      if (typeof addToCart === "function") {
        addToCart(id);
      } else {
        // Fallback: add directly to state.cart if your app uses it
        if (!window.state) window.state = {};
        if (!state.cart) state.cart = {};
        state.cart[id] = (state.cart[id] || 0) + 1;
        if (typeof saveCart === "function") saveCart();
      }

      if (typeof renderCart === "function") renderCart();

      // Open cart drawer
      const cart = document.getElementById("cart");
      const overlay = document.getElementById("overlay");
      if (cart) cart.hidden = false;
      if (overlay) overlay.hidden = false;
    });
  });

  const startCustom = document.getElementById("startCustomBtn");
  if(startCustom){
    startCustom.addEventListener("click", () => {
      const custom = document.getElementById("custom");
      if(custom) custom.style.display = "block";
      custom?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  }
})();
(function(){
  const thanks = document.getElementById("thanks");
  if(!thanks) return;

  if (location.hash === "#thanks") {
    thanks.classList.add("show");
  } else {
    thanks.classList.remove("show");
  }
})();
// ----------------------------
// Invoice request (simple + safe)
// ----------------------------
function showInvoiceForm() {
  const form = document.getElementById("invoiceCheckout");
  if (form) form.hidden = false;
}

window.requestInvoiceFromCart = function () {
  // Opens the invoice form in the cart
  showInvoiceForm();
};

// Also wire the cart "Request Invoice" button if it exists
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("requestInvoice");
  if (btn) btn.addEventListener("click", showInvoiceForm);
});
