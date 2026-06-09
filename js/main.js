/**
 * LUXE BRAND — Main JavaScript
 * Navigation, animations, product cards, hero slider, etc.
 */

// ── Toast Notifications ──────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i>
    <span>${message}</span>
    <button class="toast-dismiss" aria-label="Fermer la notification">×</button>
  `;
  toast.querySelector('.toast-dismiss').addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(120%)';
  toast.style.transition = 'all 0.3s ease';
  setTimeout(() => toast.remove(), 300);
}

// ── Product Card Builder ──────────────────────────────────
function createProductCard(product) {
  const inWishlist = Store.isInWishlist(product.id);
  const badgesHTML = [
    product.isNew ? '<span class="badge badge-new">Nouveau</span>' : '',
    product.isSale ? `<span class="badge badge-sale">-${product.discount}%</span>` : '',
    product.isHot ? '<span class="badge badge-hot">🔥 Tendance</span>' : '',
    product.stock <= 5 && product.stock > 0 ? `<span class="badge badge-limited">Reste ${product.stock}</span>` : '',
  ].filter(Boolean).join('');

  const priceHTML = product.originalPrice
    ? `<span class="price-current">${formatPrice(product.price)}</span>
       <span class="price-original">${formatPrice(product.originalPrice)}</span>
       <span class="price-discount">-${product.discount}%</span>`
    : `<span class="price-current">${formatPrice(product.price)}</span>`;

  const starsArr = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(product.rating) ? '★' : '☆'
  ).join('');

  const card = document.createElement('article');
  card.className = 'product-card reveal';
  card.setAttribute('data-product-id', product.id);
  card.innerHTML = `
    <div class="product-card-image">
      <img src="${product.images[0]}" alt="${product.brand} ${product.name}" loading="lazy">
      <div class="product-card-badges" aria-label="Badges produit">${badgesHTML}</div>
      <div class="product-card-actions">
        <button class="product-action-btn wishlist-btn ${inWishlist ? 'active' : ''}"
          data-product-id="${product.id}"
          aria-label="${inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
          title="Favoris">
          <i class="${inWishlist ? 'fas' : 'far'} fa-heart" aria-hidden="true"></i>
        </button>
        <button class="product-action-btn"
          aria-label="Voir le produit"
          title="Voir le produit">
          <i class="far fa-eye" aria-hidden="true"></i>
        </button>
      </div>
      <button class="product-card-add" aria-label="Ajouter au panier">
        <i class="fas fa-shopping-bag" aria-hidden="true"></i> Ajouter au panier
      </button>
    </div>
    <div class="product-card-info" style="cursor:pointer" aria-label="Voir ${product.name}">
      <div class="product-card-brand">${product.brand}</div>
      <div class="product-card-name">${product.name}</div>
      <div class="product-card-rating">
        <span class="stars" aria-label="Note: ${product.rating}/5">${starsArr}</span>
        <span class="rating-count">(${product.reviews.toLocaleString('fr-FR')})</span>
      </div>
      <div class="product-card-price">${priceHTML}</div>
    </div>
  `;

  // Wishlist
  card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const id = btn.dataset.productId;
    const added = Store.toggleWishlist(id);
    btn.classList.toggle('active', added);
    btn.querySelector('i').className = (added ? 'fas' : 'far') + ' fa-heart';
    btn.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
  });

  // Eye button → product page
  card.querySelectorAll('.product-action-btn:not(.wishlist-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `produit.html?id=${product.id}`;
    });
  });

  // Add to cart button
  card.querySelector('.product-card-add').addEventListener('click', (e) => {
    e.stopPropagation();
    const size = product.sizes[Math.floor(product.sizes.length / 2)] || product.sizes[0];
    const color = product.colors[0];
    Store.addToCart(product.id, size, color);
    openCart();
  });

  // Card click → product page
  card.querySelector('.product-card-info').addEventListener('click', () => {
    window.location.href = `produit.html?id=${product.id}`;
  });

  return card;
}

// ── Render Grids ──────────────────────────────────────────
function renderGrid(containerId, products) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  products.forEach((p, i) => {
    const card = createProductCard(p);
    if (i > 0 && i <= 4) card.classList.add(`reveal-delay-${i}`);
    grid.appendChild(card);
  });
  observeReveal();
}

// ── Navigation ────────────────────────────────────────────
function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('open');
    hamburger.classList.toggle('active', !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu?.classList.toggle('open', !isOpen);
    mobileMenu?.setAttribute('aria-hidden', String(isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('?')[0];
    link.classList.toggle('active', href === currentPage);
  });
}

// ── Cart Drawer ───────────────────────────────────────────
function initCart() {
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-close-link')?.addEventListener('click', closeCart);

  document.getElementById('apply-promo')?.addEventListener('click', () => {
    const code = document.getElementById('promo-input')?.value.trim().toUpperCase();
    const codes = { 'LUXE10': 10, 'BIENVENUE': 15, 'SUMMER25': 25, 'NEW20': 20 };
    if (codes[code]) {
      showToast(`🎉 Code "${code}" appliqué — -${codes[code]}% de réduction !`, 'success', 6000);
    } else {
      showToast('Code invalide ou expiré', 'error');
    }
  });
}

function openCart() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Search Overlay ────────────────────────────────────────
function initSearch() {
  const overlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  document.getElementById('search-btn')?.addEventListener('click', () => {
    overlay?.classList.add('open');
    searchInput?.focus();
    document.body.style.overflow = 'hidden';
  });

  const closeSearch = () => {
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('search-close')?.addEventListener('click', closeSearch);

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) doSearch(q);
    }
  });
}

function doSearch(query) {
  window.location.href = `boutique.html?search=${encodeURIComponent(query)}`;
}

// ── Hero Slider ───────────────────────────────────────────
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const goTo = (i) => {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  };

  const start = () => { timer = setInterval(() => goTo(current + 1), 5500); };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { clearInterval(timer); goTo(i); start(); });
  });

  start();
}

// ── Testimonials Slider ───────────────────────────────────
function initTestimonialSlider() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!track) return;

  let idx = 0;
  const cards = Array.from(track.querySelectorAll('.testimonial-card'));

  const getVisible = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;

  const update = () => {
    if (!cards.length) return;
    const visible = getVisible();
    const maxIdx = Math.max(0, cards.length - visible);
    idx = Math.min(idx, maxIdx);
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${idx * cardW}px)`;
  };

  prevBtn?.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
  nextBtn?.addEventListener('click', () => {
    idx = Math.min(cards.length - getVisible(), idx + 1);
    update();
  });

  window.addEventListener('resize', update, { passive: true });
}

// ── Countdown ─────────────────────────────────────────────
function initCountdown() {
  const hEl = document.getElementById('countdown-h');
  const mEl = document.getElementById('countdown-m');
  const sEl = document.getElementById('countdown-s');
  if (!hEl) return;

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const update = () => {
    const diff = Math.max(0, end - Date.now());
    hEl.textContent = String(Math.floor(diff / 3600000)).padStart(2, '0');
    mEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    sEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  };

  update();
  setInterval(update, 1000);
}

// ── Scroll Reveal ─────────────────────────────────────────
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// ── Newsletter ────────────────────────────────────────────
function initNewsletter() {
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email')?.value;
    if (email) {
      showToast('🎁 Inscription confirmée ! Code -10% envoyé par email.', 'success', 6000);
      e.target.reset();
    }
  });
}

// ── Chat Widget ───────────────────────────────────────────
function initChat() {
  document.getElementById('chat-btn')?.addEventListener('click', () => {
    showToast('💬 Chat disponible Lun-Sam, 9h-19h. Email: contact@luxebrand.fr', 'info', 6000);
  });
}

// ── Keyboard ──────────────────────────────────────────────
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      document.getElementById('search-overlay')?.classList.remove('open');
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu?.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        document.getElementById('hamburger-btn')?.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  });
}

// ── DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  initNav();
  initCart();
  initSearch();
  initHeroSlider();
  initTestimonialSlider();
  initCountdown();
  initNewsletter();
  initChat();
  initKeyboard();
  observeReveal();

  // Home page grids
  renderGrid('new-arrivals-grid', getNewArrivals(4));
  renderGrid('best-sellers-grid', getBestSellers(4));
  renderGrid('trending-grid', getTrending(4));
});
