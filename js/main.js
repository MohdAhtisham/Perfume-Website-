const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= product data ================= */
const PRODUCTS = [
  { id: 'velvet-oud', name: 'Velvet Oud', notes: 'Oud · Amber · Vanilla', desc: 'A smoky, resinous oud softened by vanilla bean and warm amber.', price: 185, top: '#e7c99a', bottom: '#3d240c' },
  { id: 'silk-bergamot', name: 'Silk Bergamot', notes: 'Bergamot · Neroli · Musk', desc: 'Sunlit citrus over clean musk — light enough to wear at dawn.', price: 145, top: '#f3ecc9', bottom: '#8a7a3c' },
  { id: 'midnight-iris', name: 'Midnight Iris', notes: 'Iris · Leather · Sandalwood', desc: 'Powdery iris wrapped in soft leather and pale sandalwood.', price: 210, top: '#c9bce6', bottom: '#2a2140' },
  { id: 'rose-noire', name: 'Rose Noire', notes: 'Rose · Blackcurrant · Patchouli', desc: 'A dark, brooding rose deepened by patchouli and dry fruit.', price: 165, top: '#f0b7c9', bottom: '#3f1420' },
  { id: 'santal-mirage', name: 'Santal Mirage', notes: 'Sandalwood · Cardamom · Amber', desc: 'Creamy sandalwood spiced with cardamom, dusted in amber.', price: 195, top: '#f0c79a', bottom: '#5a2c0c' },
  { id: 'citrus-vetiver', name: 'Citrus Vetiver', notes: 'Bergamot · Vetiver · Cedar', desc: 'Green and grounded — fresh citrus resting on smoked cedar.', price: 130, top: '#e6e8b0', bottom: '#33421f' },
];

function bottleSVG(top, bottom) {
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return `
  <svg viewBox="0 0 100 170" role="img" aria-label="Perfume bottle">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${top}" stop-opacity="0.85"/>
        <stop offset="1" stop-color="${bottom}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <path d="M38 10h24l2 16-7 9v14l11 10v88a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V59l11-10V35l-7-9Z"
      fill="url(#${gid})" stroke="#d4af6a" stroke-width="1.2"/>
    <rect x="41" y="3" width="18" height="11" rx="2.5" fill="#d4af6a"/>
  </svg>`;
}

/* ================= render product grid ================= */
const grid = document.getElementById('productGrid');
if (grid) {
  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="product-card reveal" data-tilt>
      <div class="card-shine"></div>
      <div class="card-glass">${bottleSVG(p.top, p.bottom)}</div>
      <h3>${p.name}</h3>
      <p class="card-notes">${p.notes}</p>
      <p class="card-desc">${p.desc}</p>
      <div class="card-footer">
        <span class="card-price">$${p.price}</span>
        <button class="add-btn" data-add="${p.name}">Add to Bag</button>
      </div>
    </article>
  `).join('');
}

/* ================= header scroll state + mobile nav ================= */
const header = document.getElementById('siteHeader');
const nav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
nav?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ================= reveal on scroll ================= */
const revealTargets = document.querySelectorAll('.reveal');
if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add('in-view'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));
}

/* ================= animated stat counters ================= */
const statEls = document.querySelectorAll('.stat-num');
const countUp = (el) => {
  const target = Number(el.dataset.count);
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (statEls.length) {
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        statIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach((el) => statIO.observe(el));
}

/* ================= product card 3D tilt ================= */
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest?.('[data-tilt]');
  document.querySelectorAll('.product-card').forEach((el) => {
    if (el !== card) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 14;
    const ry = (px - 0.5) * 16;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  });
}, { passive: true });

document.addEventListener('pointerleave', (e) => {
  const card = e.target.closest?.('[data-tilt]');
  if (card) card.style.transform = '';
}, true);

/* ================= add to bag ================= */
const cartCountEl = document.getElementById('cartCount');
const cartToast = document.getElementById('cartToast');
let cartCount = 0;
let toastTimer;
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  cartCount += 1;
  cartCountEl.textContent = String(cartCount);
  cartToast.textContent = `${btn.dataset.add} added to your bag`;
  cartToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => cartToast.classList.remove('show'), 2400);
});

/* ================= flip cards (notes) ================= */
document.querySelectorAll('[data-flip]').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('is-flipped'));
});

/* ================= review carousel ================= */
const reviewTrack = document.getElementById('reviewTrack');
const reviewDotsWrap = document.getElementById('reviewDots');
if (reviewTrack && reviewDotsWrap) {
  const slides = reviewTrack.children.length;
  let current = 0;
  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show review ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    reviewDotsWrap.appendChild(dot);
  }
  const dots = reviewDotsWrap.children;
  function goTo(i) {
    current = i;
    reviewTrack.style.transform = `translateX(-${i * 100}%)`;
    Array.from(dots).forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  let autoplay;
  const start = () => {
    if (prefersReducedMotion) return;
    autoplay = setInterval(() => goTo((current + 1) % slides), 5000);
  };
  const stop = () => clearInterval(autoplay);
  reviewTrack.parentElement.addEventListener('mouseenter', stop);
  reviewTrack.parentElement.addEventListener('mouseleave', start);
  start();
}

/* ================= newsletter form ================= */
const form = document.getElementById('newsletterForm');
const formMessage = document.getElementById('formMessage');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value.trim();
  if (!email) return;
  formMessage.textContent = `You're on the list, ${email.split('@')[0]}. Watch your inbox.`;
  form.reset();
});

/* ================= footer year ================= */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ================= craft section parallax ================= */
const craftVisual = document.getElementById('craftVisual');
if (craftVisual && !prefersReducedMotion) {
  let ticking = false;
  const layers = craftVisual.querySelectorAll('.craft-layer');
  const update = () => {
    const r = craftVisual.getBoundingClientRect();
    const progress = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
    layers.forEach((layer, i) => {
      const depth = [18, 34, 50][i] ?? 24;
      layer.style.transform = `${getComputedStyle(layer).transform === 'none' ? '' : ''} translateY(${progress * depth}px)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

