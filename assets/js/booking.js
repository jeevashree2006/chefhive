/*
 * Booking wizard: state, URL prefill, validation, navigation and submission.
 * Markup comes from booking-view.js. The draft is kept in localStorage so a refresh doesn't lose it.
 */
(function () {
  const CH = window.CH;
  const { $, $$, data, find, inr, icon, cfg } = CH;
  const V = window.CHB.view;
  const STEPS = V.STEPS;
  const LAST = STEPS.length - 1;
  const KEY = 'chefhive.booking.v1';
  const MIN_DISHES = 3;
  const MAX_DISHES = Math.max(...data.levels.map((l) => l.maxDishes));
  const GUESTS_MIN = 2;
  const GUESTS_MAX = 150;
  const range = CH.bookableRange();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defaults = () => ({
    step: 0, maxStep: 0,
    occasion: '', festival: '', tradition: '', style: 'veg', spice: 'medium',
    menuTab: 'custom', packageId: '', dishes: [],
    city: '', date: '', meal: 'lunch', time: '12:30', guests: 10, kitchen: 'standard',
    level: '', levelAuto: true,
    addons: { helper: 0, server: 0, shopping: false, leaves: false, cleaning: false },
    contact: { name: '', phone: '', email: '', address: '', pincode: '', notes: '', consent: false },
  });

  const clampGuests = (n) => {
    const v = Math.round(Number(n));
    return Number.isFinite(v) ? Math.min(GUESTS_MAX, Math.max(GUESTS_MIN, v)) : 10;
  };
  const allowed = (id, style) => CH.dishAllowed(find.dish(id), style);

  // ---------- Initial state: saved draft, then URL params ----------
  const params = new URLSearchParams(window.location.search);
  const hasParams = [...params.keys()].length > 0;
  const saved = CH.store.get(KEY, null);
  let s = defaults();
  if (saved && typeof saved === 'object') {
    const contact = { ...s.contact, ...(saved.contact || {}) };
    s = hasParams ? { ...s, contact } : { ...s, ...saved, addons: { ...s.addons, ...(saved.addons || {}) }, contact };
  }

  // Drop anything that no longer matches the data (menus or cities may have changed since the draft was saved).
  if (!find.occasion(s.occasion)) s.occasion = '';
  if (!data.festivals.includes(s.festival)) s.festival = '';
  if (!find.tradition(s.tradition)) s.tradition = '';
  if (!find.style(s.style)) s.style = 'veg';
  s.dishes = (Array.isArray(s.dishes) ? s.dishes : []).filter((id) => find.dish(id) && find.dish(id).tradition === s.tradition);
  if (!find.pkg(s.packageId)) s.packageId = '';
  if (s.date && (s.date < range.min || s.date > range.max)) s.date = '';
  if (!cfg.cities.includes(s.city)) s.city = '';
  if (!find.meal(s.meal)) s.meal = 'lunch';
  if (!find.kitchen(s.kitchen)) s.kitchen = 'standard';
  s.guests = clampGuests(s.guests);

  const applyPackage = (pkg) => {
    s.packageId = pkg.id;
    s.tradition = pkg.tradition;
    s.dishes = pkg.dishes.filter((id) => allowed(id, s.style));
    s.guests = Math.max(s.guests, pkg.minGuests);
  };

  if (hasParams) {
    const pkg = find.pkg(params.get('package'));
    if (pkg) {
      s.occasion = pkg.occasion;
      s.festival = pkg.festival || '';
      s.style = pkg.style;
      s.menuTab = 'packages';
      applyPackage(pkg);
    }
    if (find.occasion(params.get('occasion'))) s.occasion = params.get('occasion');
    if (data.festivals.includes(params.get('festival'))) s.festival = params.get('festival');
    const tradition = params.get('tradition');
    if (find.tradition(tradition) && tradition !== s.tradition) { s.tradition = tradition; s.dishes = []; s.packageId = ''; }
    const date = params.get('date');
    if (date && date >= range.min && date <= range.max) s.date = date;
    if (params.has('guests')) s.guests = clampGuests(params.get('guests'));
    if (find.level(params.get('level'))) { s.level = params.get('level'); s.levelAuto = false; }
    if (cfg.cities.includes(params.get('city'))) s.city = params.get('city');
    // Keep the address bar clean so a refresh restores the draft instead of re-applying the link.
    history.replaceState(null, '', window.location.pathname);
  }

  // ---------- Validation ----------
  const stepError = (i) => {
    switch (STEPS[i].id) {
      case 'occasion':
        if (!s.occasion) return 'Choose the occasion to continue.';
        if (s.occasion === 'festival' && !s.festival) return 'Choose which festival it is.';
        return '';
      case 'tradition':
        return s.tradition ? '' : 'Choose a food tradition to continue.';
      case 'menu':
        if (s.dishes.length < MIN_DISHES) return `Pick at least ${MIN_DISHES} dishes, or choose an occasion menu.`;
        if (s.dishes.length > MAX_DISHES) return `One cook team can make up to ${MAX_DISHES} dishes. Remove ${s.dishes.length - MAX_DISHES} to continue.`;
        return '';
      case 'details':
        if (!s.city) return 'Choose your city.';
        if (!s.date) return 'Choose the date of your occasion.';
        if (s.date < range.min || s.date > range.max) return `Choose a date between ${CH.formatDate(range.min)} and ${CH.formatDate(range.max)}.`;
        return '';
      case 'cook': {
        const level = find.level(s.level);
        return level && CH.levelFits(level, s.guests, s.dishes.length).ok ? '' : 'Choose a cook level that fits your guests and menu.';
      }
      default:
        return '';
    }
  };
  const firstIncomplete = () => {
    for (let i = 0; i < LAST; i += 1) if (stepError(i)) return i;
    return LAST;
  };

  const normalisePhone = (value) => {
    let digits = String(value).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

  const CONTACT_FIELDS = ['name', 'phone', 'email', 'pincode', 'address', 'consent'];
  const contactErrors = () => {
    const c = s.contact;
    const errors = {};
    if (c.name.trim().length < 2) errors.name = 'Enter your name.';
    if (!/^[6-9]\d{9}$/.test(normalisePhone(c.phone))) errors.phone = 'Enter a 10-digit Indian mobile number.';
    if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errors.email = 'Check the email address.';
    if (!/^[1-9]\d{5}$/.test(c.pincode.trim())) errors.pincode = 'Enter a 6-digit pincode.';
    if (c.address.trim().length < 5) errors.address = 'Enter your address or area.';
    if (!c.consent) errors.consent = 'Please allow us to contact you about this booking.';
    return errors;
  };

  const setFieldError = (field, message) => {
    const input = document.getElementById(field);
    const id = `err-${field}`;
    let el = document.getElementById(id);
    if (!message) {
      if (el) el.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      return;
    }
    if (!el) {
      el = document.createElement('span');
      el.id = id;
      el.className = field === 'consent' ? 'field-error span-2' : 'field-error';
      (field === 'consent' ? input.closest('.check') : input).insertAdjacentElement('afterend', el);
    }
    el.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', id);
  };

  // ---------- DOM ----------
  const form = $('#booking-form');
  const sections = $$('.step', form);
  const errorBox = $('#step-error');
  const btnBack = $('#btn-back');
  const btnNext = $('#btn-next');
  const mbBack = $('#mb-back');
  const mbNext = $('#mb-next');

  const save = () => CH.store.set(KEY, s);

  const showError = (message) => {
    errorBox.textContent = message;
    if (message) errorBox.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  // Recommended level follows guests and dishes until the user picks one; a pick that stops fitting is replaced.
  const syncLevel = () => {
    const level = find.level(s.level);
    const fits = level && CH.levelFits(level, s.guests, s.dishes.length).ok;
    if (s.levelAuto || !fits) {
      s.level = CH.recommendLevel({ guests: s.guests, dishes: s.dishes.length, occasion: s.occasion });
      s.levelAuto = true;
    }
  };

  const refresh = () => {
    syncLevel();
    const est = CH.estimate(s);
    $('#summary-body').innerHTML = V.summary(s, est);
    $('#mb-total').textContent = s.dishes.length ? inr(est.total) : `from ${inr(est.total)}`;
    save();
  };

  const updateDishCount = () => {
    const n = s.dishes.length;
    const count = $('#dish-count');
    count.textContent = `${n} ${n === 1 ? 'dish' : 'dishes'} selected`;
    count.classList.toggle('is-over', n > MAX_DISHES);
    const kitchen = find.kitchen(s.kitchen);
    let hint = 'Most families pick 6–12 dishes for an occasion';
    if (n < MIN_DISHES) hint = `Pick at least ${MIN_DISHES}`;
    else if (kitchen && n > kitchen.comfortableDishes) hint = `That's a lot for a ${kitchen.name.toLowerCase()} kitchen, so your cook may bring help`;
    $('#dish-hint').textContent = hint;
  };

  const setTab = (tab) => {
    s.menuTab = tab;
    const custom = tab === 'custom';
    const tabCustom = $('#tab-custom');
    const tabPackages = $('#tab-packages');
    tabCustom.setAttribute('aria-selected', String(custom));
    tabPackages.setAttribute('aria-selected', String(!custom));
    tabCustom.tabIndex = custom ? 0 : -1;
    tabPackages.tabIndex = custom ? -1 : 0;
    $('#panel-custom').hidden = !custom;
    $('#panel-packages').hidden = custom;
    if (custom) $('#dish-courses').innerHTML = V.dishes(s);
  };

  const renderTimes = () => {
    const select = $('#time');
    select.innerHTML = V.times(s);
    s.time = select.value;
  };

  const updateGuestButtons = () => {
    $('#guests-minus').disabled = s.guests <= GUESTS_MIN;
    $('#guests-plus').disabled = s.guests >= GUESTS_MAX;
  };

  const renderHelperHint = () => {
    const box = $('#helper-hint');
    const suggested = CH.suggestedHelpers(s.guests);
    if (!suggested || (Number(s.addons.helper) || 0) >= suggested) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `${icon('info')}<span>For ${s.guests} guests we suggest ${suggested} kitchen helper${suggested > 1 ? 's' : ''}.
      <button type="button" class="btn btn-ghost btn-sm" data-add-helpers="${suggested}">Add ${suggested}</button></span>`;
  };

  const renderStep = () => {
    switch (STEPS[s.step].id) {
      case 'occasion':
        $('#occasion-options').innerHTML = V.occasions(s);
        $('#festival-options').innerHTML = V.festivals(s);
        $('#festival-group').hidden = s.occasion !== 'festival';
        break;
      case 'tradition':
        $('#tradition-options').innerHTML = V.traditions(s);
        $('#style-options').innerHTML = V.styles(s);
        $('#spice-options').innerHTML = V.spices(s);
        break;
      case 'menu': {
        const tradition = find.tradition(s.tradition);
        const style = find.style(s.style);
        $('#menu-sub').textContent = `${tradition.name} dishes, showing only ${style.name.split(' (')[0].toLowerCase()} options. Choose one by one, or start from an occasion menu.`;
        $('#package-options').innerHTML = V.packages(s);
        setTab(s.menuTab);
        updateDishCount();
        break;
      }
      case 'details': {
        const city = $('#city');
        if (city.options.length <= 1) city.insertAdjacentHTML('beforeend', V.cities());
        city.value = s.city;
        const date = $('#date');
        date.min = range.min;
        date.max = range.max;
        date.value = s.date;
        $('#date-hint').textContent = `Earliest ${CH.formatDate(range.min)}. For big festivals, book 2–3 weeks ahead.`;
        $('#meal-options').innerHTML = V.meals(s);
        renderTimes();
        $('#guests').value = s.guests;
        updateGuestButtons();
        $('#kitchen-options').innerHTML = V.kitchens(s);
        break;
      }
      case 'cook':
        syncLevel();
        $('#level-options').innerHTML = V.levels(s);
        $('#addon-list').innerHTML = V.addons(s);
        renderHelperHint();
        break;
      case 'review': {
        const est = CH.estimate(s);
        $('#review-list').innerHTML = V.review(s, est);
        $('#review-price').innerHTML = V.priceBlock(est, s);
        ['name', 'phone', 'email', 'pincode', 'address', 'notes'].forEach((f) => { $(`#${f}`).value = s.contact[f] || ''; });
        $('#consent').checked = Boolean(s.contact.consent);
        break;
      }
      default:
        break;
    }
  };

  const goTo = (index, { focus = true } = {}) => {
    s.step = Math.max(0, Math.min(LAST, index));
    s.maxStep = Math.max(s.maxStep, s.step);
    const id = STEPS[s.step].id;
    sections.forEach((section) => { section.hidden = section.dataset.step !== id; });
    showError('');
    renderStep();
    $('#progress').innerHTML = V.progress(s.step, s.maxStep);
    const last = s.step === LAST;
    btnNext.innerHTML = last ? `Request booking ${icon('check')}` : `Continue ${icon('arrowRight')}`;
    mbNext.textContent = last ? 'Request booking' : 'Continue';
    btnBack.hidden = s.step === 0;
    mbBack.hidden = s.step === 0;
    refresh();
    if (focus) {
      $(`[data-step="${id}"] .step-title`).focus({ preventScroll: true });
      const top = $('.wizard-head').getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  // Jumping ahead (progress bar) still has to pass every step in between.
  const tryGoTo = (target) => {
    if (target <= s.step) { goTo(target); return; }
    for (let i = s.step; i < target; i += 1) {
      const message = stepError(i);
      if (message) { if (i !== s.step) goTo(i); showError(message); return; }
    }
    goTo(target);
  };

  // ---------- Submitting ----------
  const buildPayload = (ref, est) => {
    const occasion = find.occasion(s.occasion);
    const pkg = find.pkg(s.packageId);
    return {
      ref,
      occasion: occasion.name,
      festival: s.festival,
      tradition: find.tradition(s.tradition).name,
      foodRules: find.style(s.style).name,
      spice: s.spice,
      menuPackage: pkg ? pkg.name : '',
      dishes: s.dishes.map((id) => find.dish(id).name),
      city: s.city,
      date: s.date,
      meal: find.meal(s.meal).name,
      readyBy: s.time,
      guests: s.guests,
      kitchen: find.kitchen(s.kitchen).name,
      cookLevel: est.level.name,
      extras: { ...s.addons },
      estimate: { lines: est.lines.map((l) => ({ label: l.label, amount: l.amount })), total: est.total, advance: est.advance },
      name: s.contact.name.trim(),
      phone: normalisePhone(s.contact.phone),
      email: s.contact.email.trim(),
      address: s.contact.address.trim(),
      pincode: s.contact.pincode.trim(),
      notes: s.contact.notes.trim(),
    };
  };

  const whatsappText = (p) => [
    `New booking request ${p.ref}`,
    `Occasion: ${p.occasion}${p.festival ? ` (${p.festival})` : ''}`,
    `Food: ${p.tradition}, ${p.foodRules}, ${p.spice} spice`,
    `Menu (${p.dishes.length}): ${p.dishes.join(', ')}`,
    `When: ${CH.formatDate(p.date)}, ${p.meal}, ready by ${CH.formatTime(p.readyBy)}`,
    `Where: ${p.city} ${p.pincode}`,
    `Guests: ${p.guests} · Cook: ${p.cookLevel}`,
    `Estimate: ${inr(p.estimate.total)} (advance ${inr(p.estimate.advance)})`,
    `Name: ${p.name} · ${p.phone}`,
    p.notes ? `Notes: ${p.notes}` : '',
  ].filter(Boolean).join('\n');

  const setBusy = (busy) => {
    [btnNext, mbNext].forEach((b) => { b.disabled = busy; b.setAttribute('aria-busy', String(busy)); });
    if (busy) { btnNext.textContent = 'Sending…'; mbNext.textContent = 'Sending…'; }
    else { btnNext.innerHTML = `Request booking ${icon('check')}`; mbNext.textContent = 'Request booking'; }
  };

  const showConfirmation = (payload, demo) => {
    $('#wizard-view').hidden = true;
    $('#mobile-bar').hidden = true;
    const box = $('#confirmation');
    box.hidden = false;
    $('#confirm-ref').textContent = payload.ref;
    $('#confirm-summary').textContent = `${payload.occasion} on ${CH.formatDate(payload.date)} for ${payload.guests} guests · ${payload.tradition} · estimated cook fee ${inr(payload.estimate.total)}.`;
    $('#confirm-demo').hidden = !demo;
    const wa = CH.whatsappLink(whatsappText(payload));
    if (wa) { const btn = $('#confirm-whatsapp'); btn.href = wa; btn.hidden = false; }
    window.scrollTo(0, 0);
    $('#confirm-title').focus();
  };

  const submitBooking = async () => {
    for (let i = 0; i < LAST; i += 1) {
      const message = stepError(i);
      if (message) { goTo(i); showError(message); return; }
    }
    const errors = contactErrors();
    CONTACT_FIELDS.forEach((f) => setFieldError(f, errors[f]));
    const firstBad = CONTACT_FIELDS.find((f) => errors[f]);
    if (firstBad) {
      errorBox.textContent = 'Please fix the highlighted details.';
      document.getElementById(firstBad).focus();
      return;
    }
    showError('');
    const est = CH.estimate(s);
    const payload = buildPayload(CH.reference(), est);
    setBusy(true);
    try {
      const result = await CH.submit('booking', payload);
      CH.store.remove(KEY);
      showConfirmation(payload, result.demo);
    } catch (err) {
      showError('We couldn\'t send your request. Check your internet connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (s.step === LAST) { submitBooking(); return; }
    const message = stepError(s.step);
    if (message) { showError(message); return; }
    goTo(s.step + 1);
  };

  // ---------- Events ----------
  const setGuests = (n) => {
    s.guests = clampGuests(n);
    $('#guests').value = s.guests;
    updateGuestButtons();
    refresh();
  };

  const setAddonQty = (id, qty) => {
    const addon = find.addon(id);
    const n = Math.max(0, Math.min(addon.max, Math.round(Number(qty)) || 0));
    s.addons[id] = n;
    const row = $(`[data-addon="${id}"]`);
    if (row) {
      row.classList.toggle('is-on', n > 0);
      $(`[data-addon-qty="${id}"]`, row).value = n;
      $('[data-delta="-1"]', row).disabled = n <= 0;
      $('[data-delta="1"]', row).disabled = n >= addon.max;
    }
    if (id === 'helper') renderHelperHint();
  };

  const toggleDish = (id, on) => {
    const chosen = new Set(s.dishes);
    if (on) chosen.add(id); else chosen.delete(id);
    s.dishes = find.tradition(s.tradition).dishes.map((d) => d.id).filter((d) => chosen.has(d));
    updateDishCount();
  };

  form.addEventListener('change', (e) => {
    const t = e.target;
    switch (t.name) {
      case 'occasion':
        s.occasion = t.value;
        if (s.occasion !== 'festival') s.festival = '';
        $('#festival-group').hidden = s.occasion !== 'festival';
        break;
      case 'festival': s.festival = t.value; break;
      case 'tradition':
        if (t.value !== s.tradition) { s.tradition = t.value; s.dishes = []; s.packageId = ''; s.menuTab = 'custom'; }
        break;
      case 'style':
        s.style = t.value;
        s.dishes = s.dishes.filter((id) => allowed(id, s.style));
        break;
      case 'spice': s.spice = t.value; break;
      case 'dish': toggleDish(t.value, t.checked); break;
      case 'package': {
        const pkg = find.pkg(t.value);
        if (!pkg) break;
        applyPackage(pkg);
        const left = pkg.dishes.length - s.dishes.length;
        updateDishCount();
        $('#dish-hint').textContent = left ? `${left} dishes left out because of your food rules` : `${s.dishes.length} dishes added from ${pkg.name}`;
        break;
      }
      case 'city': s.city = t.value; break;
      case 'date': s.date = t.value; break;
      case 'meal': s.meal = t.value; renderTimes(); break;
      case 'time': s.time = t.value; break;
      case 'guests': setGuests(t.value); break;
      case 'kitchen': s.kitchen = t.value; break;
      case 'level': s.level = t.value; s.levelAuto = false; break;
      case 'consent': s.contact.consent = t.checked; setFieldError('consent', ''); break;
      default:
        if (t.dataset.addonToggle) {
          s.addons[t.dataset.addonToggle] = t.checked;
          t.closest('.addon').classList.toggle('is-on', t.checked);
        } else if (t.dataset.addonQty) {
          setAddonQty(t.dataset.addonQty, t.value);
        }
    }
    if (errorBox.textContent && !stepError(s.step)) showError('');
    refresh();
  });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'guests') {
      const n = Number(t.value);
      if (Number.isInteger(n) && n >= GUESTS_MIN && n <= GUESTS_MAX) { s.guests = n; updateGuestButtons(); refresh(); }
      return;
    }
    if (t.name in s.contact && t.type !== 'checkbox') {
      s.contact[t.name] = t.value;
      if (t.getAttribute('aria-invalid') === 'true' && !contactErrors()[t.name]) setFieldError(t.name, '');
      save();
    }
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); next(); });
  mbNext.addEventListener('click', next);
  btnBack.addEventListener('click', () => goTo(s.step - 1));
  mbBack.addEventListener('click', () => goTo(s.step - 1));

  document.addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto]');
    if (goto && !goto.disabled) { tryGoTo(Number(goto.dataset.goto)); return; }
    const stepBtn = e.target.closest('[data-addon-step]');
    if (stepBtn) { setAddonQty(stepBtn.dataset.addonStep, (Number(s.addons[stepBtn.dataset.addonStep]) || 0) + Number(stepBtn.dataset.delta)); refresh(); return; }
    const addHelpers = e.target.closest('[data-add-helpers]');
    if (addHelpers) { setAddonQty('helper', Number(addHelpers.dataset.addHelpers)); refresh(); return; }
    if (e.target.closest('#guests-minus')) { setGuests(s.guests - 1); return; }
    if (e.target.closest('#guests-plus')) { setGuests(s.guests + 1); return; }
    if (e.target.closest('#clear-dishes')) {
      s.dishes = [];
      s.packageId = '';
      $$('input[name="dish"], input[name="package"]').forEach((input) => { input.checked = false; });
      updateDishCount();
      refresh();
      return;
    }
    const tab = e.target.closest('[role="tab"]');
    if (tab) { setTab(tab.id === 'tab-custom' ? 'custom' : 'packages'); save(); }
  });

  // Arrow keys move between the two menu tabs (WAI-ARIA tabs pattern).
  $('[role="tablist"]').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const target = s.menuTab === 'custom' ? 'packages' : 'custom';
    setTab(target);
    $(target === 'custom' ? '#tab-custom' : '#tab-packages').focus();
    save();
  });

  // ---------- Start ----------
  document.addEventListener('DOMContentLoaded', () => {
    syncLevel();
    const resumable = firstIncomplete();
    if (hasParams) s.maxStep = 0;
    if (hasParams || s.step > resumable) s.step = Math.min(hasParams ? resumable : s.step, resumable);
    if (!hasParams && saved && saved.step > 0) {
      const note = document.createElement('p');
      note.className = 'notice';
      note.innerHTML = `${icon('info')}<span>We kept your unfinished booking. <button type="button" class="btn btn-ghost btn-sm" id="start-over">Start over</button></span>`;
      $('.wizard-head').append(note);
      $('#start-over').addEventListener('click', () => { CH.store.remove(KEY); window.location.href = 'book.html'; });
    }
    goTo(s.step, { focus: false });
  });
})();
