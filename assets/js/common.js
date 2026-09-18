/*
 * Shared helpers: icons, formatting, pricing engine, storage, form submission and page chrome.
 * Exposed as window.CH. Requires config.js, data.js and menus.js to load first.
 */
(function () {
  const cfg = window.CH_CONFIG;
  const data = window.CH_DATA;
  const menus = window.CH_MENUS;

  // ---------- DOM + formatting ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  const inrFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const inr = (n) => inrFormat.format(Math.round(n || 0));

  const img = (id, w = 800, h = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

  const pad = (n) => String(n).padStart(2, '0');
  const dateISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (days) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + days); return d; };
  const bookableRange = () => ({ min: dateISO(addDays(cfg.minNoticeDays)), max: dateISO(addDays(cfg.maxAdvanceDays)) });
  const formatDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
  };

  // ---------- Icons (24px stroke icons, drawn for ChefHive) ----------
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    sparkles: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    diya: '<path d="M12 2.5c1.6 2 2.2 3.3 2.2 4.5a2.2 2.2 0 0 1-4.4 0c0-1.2.6-2.5 2.2-4.5z"/><path d="M2.5 12.5h19c-.9 4-4.8 6.5-9.5 6.5s-8.6-2.5-9.5-6.5z"/><path d="M9 21.5h6"/>',
    baby: '<circle cx="12" cy="12.5" r="8"/><path d="M9.5 11.5h.01M14.5 11.5h.01"/><path d="M10 15.5c1.2.8 2.8.8 4 0"/><path d="M12 4.5c-1.2 1-1.2 2.2 0 3"/>',
    cake: '<path d="M4 21h16v-8H4z"/><path d="M4 16.5c2.7 1.5 5.3 1.5 8 0s5.3-1.5 8 0"/><path d="M8 13V9.5M12 13V9.5M16 13V9.5"/><path d="M8 6.5v.01M12 6.5v.01M16 6.5v.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    lotus: '<path d="M12 20.5c-5 0-9-3-9-7 3 0 6 1.5 9 4.5 3-3 6-4.5 9-4.5 0 4-4 7-9 7z"/><path d="M12 18c-2.5-2.5-3.5-6-3-10 1.7.8 2.7 2 3 3.5.3-1.5 1.3-2.7 3-3.5.5 4-.5 7.5-3 10z"/>',
    dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    leaf: '<path d="M5 19C5 11 10 5 20 4c-1 10-7 15-15 15z"/><path d="M5 19l9-9"/>',
    chef: '<path d="M7 14a4 4 0 0 1-.9-7.9A5 5 0 0 1 12 3a5 5 0 0 1 5.9 3.1A4 4 0 0 1 17 14"/><path d="M7 14h10v6H7z"/><path d="M7 17h10"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    rupee: '<path d="M6 4h12M6 9h12M13 21L6 13h3a4.5 4.5 0 0 0 0-9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 20l1.4-4.2A8.5 8.5 0 1 1 8.2 19z"/><path d="M9 11h.01M12.5 11h.01M16 11h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
    pot: '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M2 10h20"/><path d="M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 21V3c-2 1.5-3 4-3 7h3"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  };
  const icon = (name, cls = 'icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.dots}</svg>`;
  const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || 'icon');
    el.removeAttribute('data-icon');
  });

  // ---------- Lookups ----------
  const byId = (list, id) => list.find((x) => x.id === id);
  const find = {
    occasion: (id) => byId(data.occasions, id),
    tradition: (id) => byId(menus.traditions, id),
    level: (id) => byId(data.levels, id),
    pkg: (id) => byId(data.packages, id),
    addon: (id) => byId(data.addons, id),
    meal: (id) => byId(data.meals, id),
    kitchen: (id) => byId(data.kitchens, id),
    style: (id) => byId(data.foodStyles, id),
    dish: (id) => menus.dishIndex[id],
  };

  // Which dishes a food style allows.
  const dishAllowed = (dish, style) => {
    if (!dish) return false;
    if (style !== 'nonveg' && dish.nonveg) return false;
    if ((style === 'satvik' || style === 'jain') && dish.onionGarlic) return false;
    if (style === 'jain' && dish.root) return false;
    return true;
  };

  // ---------- Pricing ----------
  const RITUAL_OCCASIONS = ['pooja', 'griha-pravesh', 'festival', 'naming', 'remembrance'];

  const levelFits = (level, guests, dishes) => {
    if (guests > level.maxGuests) return { ok: false, reason: `Up to ${level.maxGuests} guests` };
    if (dishes > level.maxDishes) return { ok: false, reason: `Up to ${level.maxDishes} dishes` };
    return { ok: true, reason: '' };
  };

  const recommendLevel = ({ guests = 0, dishes = 0, occasion = '' }) => {
    const fitting = data.levels.filter((l) => levelFits(l, guests, dishes).ok);
    if (!fitting.length) return data.levels[data.levels.length - 1].id;
    let pick = fitting[0];
    if (pick.id === 'home' && RITUAL_OCCASIONS.includes(occasion) && fitting[1]) pick = fitting[1];
    return pick.id;
  };

  const suggestedHelpers = (guests) => Math.min(4, Math.floor(Math.max(0, guests - 1) / data.guestsPerHelper));

  const estimate = (s) => {
    const guests = Number(s.guests) || 0;
    const dishCount = (s.dishes || []).length;
    const level = find.level(s.level) || find.level(recommendLevel({ guests, dishes: dishCount, occasion: s.occasion }));
    const lines = [{ label: `${level.name} fee`, detail: `Up to ${level.includedGuests} guests & ${level.includedDishes} dishes`, amount: level.base }];

    const extraGuests = Math.max(0, guests - level.includedGuests);
    if (extraGuests) lines.push({ label: `${extraGuests} more guests`, detail: `${inr(level.perGuest)} each`, amount: extraGuests * level.perGuest });
    const extraDishes = Math.max(0, dishCount - level.includedDishes);
    if (extraDishes) lines.push({ label: `${extraDishes} more dishes`, detail: `${inr(level.perDish)} each`, amount: extraDishes * level.perDish });

    const a = s.addons || {};
    data.addons.forEach((addon) => {
      const qty = typeof a[addon.id] === 'number' ? a[addon.id] : a[addon.id] ? 1 : 0;
      if (!qty) return;
      if (addon.perGuest) lines.push({ label: addon.name, detail: `${inr(addon.perGuest)} × ${guests} guests`, amount: addon.perGuest * guests });
      else lines.push({ label: qty > 1 ? `${addon.name} × ${qty}` : addon.name, detail: addon.unit, amount: addon.price * qty });
    });

    const total = lines.reduce((sum, l) => sum + l.amount, 0);
    const advance = Math.ceil((total * cfg.advancePercent) / 100 / 10) * 10;
    return { level, lines, total, advance, guests, dishCount };
  };

  const packageFrom = (pkg) => estimate({ guests: pkg.minGuests, dishes: pkg.dishes, level: pkg.level, occasion: pkg.occasion }).total;

  // ---------- Storage (can be unavailable: private mode, blocked site data) ----------
  const store = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* storage unavailable: nothing to clear */ }
    },
  };

  // ---------- Submitting forms ----------
  const reference = (prefix = 'CH') => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
  };

  // Posts JSON to the configured endpoint. Without one (demo mode) it keeps a copy in this browser only.
  const submit = async (kind, payload) => {
    const endpoint = kind === 'partner' ? cfg.partnerEndpoint : cfg.bookingEndpoint;
    const record = { kind, submittedAt: new Date().toISOString(), ...payload };
    if (!endpoint) {
      const saved = store.get('chefhive.submissions', []);
      saved.push(record);
      store.set('chefhive.submissions', saved.slice(-20));
      return { demo: true, record };
    }
    // text/plain + no-cors avoids a CORS preflight, which Google Apps Script web apps do not answer.
    await fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(record) });
    return { demo: false, record };
  };

  const whatsappLink = (text) => (cfg.whatsappNumber ? `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}` : '');

  // ---------- Page chrome ----------
  const initHeader = () => {
    const header = $('.site-header');
    const toggle = $('.nav-toggle');
    if (!header || !toggle) return;
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = icon(open ? 'close' : 'menu');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    $$('.site-nav a', header).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initContacts = () => {
    $$('[data-contact="phone"]').forEach((el) => {
      if (!cfg.phoneLink) { el.hidden = true; return; }
      el.href = `tel:${cfg.phoneLink}`;
      const label = $('[data-contact-label]', el);
      if (label) label.textContent = cfg.phoneDisplay;
    });
    $$('[data-contact="whatsapp"]').forEach((el) => {
      const link = whatsappLink(`Hi ${cfg.brand}, I'd like to book a cook.`);
      if (!link) { el.hidden = true; return; }
      el.href = link;
    });
    $$('[data-contact="email"]').forEach((el) => {
      el.href = `mailto:${cfg.email}`;
      const label = $('[data-contact-label]', el);
      if (label) label.textContent = cfg.email;
    });
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$('[data-advance]').forEach((el) => { el.textContent = `${cfg.advancePercent}%`; });
    $$('[data-cities]').forEach((el) => {
      const c = cfg.cities;
      el.textContent = el.dataset.cities === 'sentence' && c.length > 1
        ? `${c.slice(0, -1).join(', ')} and ${c[c.length - 1]}`
        : c.join(' · ');
    });
  };

  const initDemoBar = () => {
    if (!cfg.demoMode) return;
    const bar = document.createElement('div');
    bar.className = 'demo-bar';
    bar.setAttribute('role', 'note');
    bar.textContent = 'Preview site: cooks, menus and prices shown are samples.';
    document.body.prepend(bar);
  };

  const initReveal = () => {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    items.forEach((el) => io.observe(el));
  };

  window.CH = {
    cfg, data, menus, $, $$, esc, inr, img, icon, hydrateIcons, find, dishAllowed,
    levelFits, recommendLevel, suggestedHelpers, estimate, packageFrom,
    dateISO, addDays, bookableRange, formatDate, formatTime, store, reference, submit, whatsappLink, initReveal,
  };

  document.addEventListener('DOMContentLoaded', () => {
    initDemoBar();
    initHeader();
    initContacts();
    hydrateIcons();
    initReveal();
  });
})();
