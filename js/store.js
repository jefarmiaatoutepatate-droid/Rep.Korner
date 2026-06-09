/**
 * LUXE BRAND — State Management (Cart, Wishlist, etc.)
 */

const Store = (() => {
  // ── Cart ──
  function getCart() {
    try { return JSON.parse(localStorage.getItem('lb_cart') || '[]'); }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem('lb_cart', JSON.stringify(cart));
    updateCartUI();
    dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  }

  function addToCart(productId, size, color, qty = 1) {
    const product = getProductById(productId);
    if (!product) return false;

    const cart = getCart();
    const key = `${productId}__${size}__${color}`;
    const existing = cart.find(i => i.key === key);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 10);
    } else {
      cart.push({
        key,
        productId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        size,
        color,
        qty,
        image: product.images[0],
      });
    }

    saveCart(cart);
    showToast(`${product.name} ajouté au panier`, 'success');
    return true;
  }

  function removeFromCart(key) {
    const cart = getCart().filter(i => i.key !== key);
    saveCart(cart);
  }

  function updateQty(key, delta) {
    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(item.qty + delta, 10));
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  // ── Wishlist ──
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('lb_wishlist') || '[]'); }
    catch { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem('lb_wishlist', JSON.stringify(list));
    updateWishlistUI();
    dispatchEvent(new CustomEvent('wishlist:updated', { detail: list }));
  }

  function toggleWishlist(productId) {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    const product = getProductById(productId);
    if (idx === -1) {
      list.push(productId);
      saveWishlist(list);
      showToast(`${product?.name || 'Produit'} ajouté aux favoris`, 'info');
      return true;
    } else {
      list.splice(idx, 1);
      saveWishlist(list);
      return false;
    }
  }

  function isInWishlist(productId) {
    return getWishlist().includes(productId);
  }

  function getWishlistCount() {
    return getWishlist().length;
  }

  // ── UI Updates ──
  function updateCartUI() {
    const count = getCartCount();
    document.querySelectorAll('#cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    renderCartItems();
  }

  function updateWishlistUI() {
    const count = getWishlistCount();
    const el = document.getElementById('wishlist-count');
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-footer');
    const promoSection = document.getElementById('cart-promo-section');
    const label = document.getElementById('cart-item-label');
    if (!container) return;

    const cart = getCart();

    if (label) {
      const n = cart.length;
      label.textContent = n === 0 ? 'Panier vide' : `${n} article${n > 1 ? 's' : ''}`;
    }

    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      if (footer) footer.style.display = 'none';
      if (promoSection) promoSection.style.display = 'none';
      // Clear only product items
      container.querySelectorAll('.cart-item').forEach(el => el.remove());
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';
    if (promoSection) promoSection.style.display = 'block';

    // Remove existing items
    container.querySelectorAll('.cart-item').forEach(el => el.remove());

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.dataset.key = item.key;
      div.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-brand">${item.brand}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Taille: ${item.size} · Couleur: ${item.color}</div>
          <div class="cart-item-bottom">
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Store.updateQty('${item.key}', -1)" aria-label="Diminuer la quantité">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="Store.updateQty('${item.key}', 1)" aria-label="Augmenter la quantité">+</button>
            </div>
            <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
          </div>
        </div>
        <button class="cart-item-remove" onclick="Store.removeFromCart('${item.key}')" aria-label="Supprimer du panier">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(div);
    });

    // Totals
    const total = getCartTotal();
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingMsg = document.getElementById('cart-shipping-text');
    const shippingEl = document.getElementById('cart-shipping');

    if (subtotalEl) subtotalEl.textContent = formatPrice(total);
    if (totalEl) {
      const shipping = total >= 150 ? 0 : 5.99;
      totalEl.textContent = formatPrice(total + shipping);
      if (shippingEl) shippingEl.textContent = shipping === 0 ? 'OFFERTE ✓' : formatPrice(shipping);
      if (shippingMsg) {
        if (total >= 150) {
          shippingMsg.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success)"></i> <span>Livraison offerte — Vous êtes éligible !</span>';
        } else {
          const remaining = 150 - total;
          shippingMsg.innerHTML = `<i class="fas fa-truck"></i> <span>Plus que ${formatPrice(remaining)} pour la livraison offerte</span>`;
        }
      }
    }
  }

  function init() {
    updateCartUI();
    updateWishlistUI();
  }

  return {
    // Cart
    getCart, addToCart, removeFromCart, updateQty, clearCart,
    getCartTotal, getCartCount,
    // Wishlist
    getWishlist, toggleWishlist, isInWishlist, getWishlistCount,
    // Init
    init,
    // UI
    renderCartItems, updateCartUI, updateWishlistUI,
  };
})();
