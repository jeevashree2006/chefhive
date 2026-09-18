/*
 * Booking wizard rendering: builds HTML for each step from the current state.
 * Pure functions (state in, markup out); booking.js owns state and events.
 */
(function () {
  const CH = window.CH;
  const { esc, inr, icon, data, menus, find, cfg } = CH;

  const STEPS = [
    { id: 'occasion', label: 'Occasion' },
    { id: 'tradition', label: 'Tradition' },
    { id: 'menu', label: 'Menu' },
    { id: 'details', label: 'Details' },
    { id: 'cook', label: 'Cook' },
    { id: 'review', label: 'Review' },
  ];

  // A radio/checkbox card. `extra` must already be escaped HTML.
  const choice = ({ type = 'radio', name, value, checked, disabled, title, desc = '', meta = '', iconName = '', accent = '', cls = '', extra = '', image = '' }) => `
    <label class="choice ${cls}"${accent ? ` style="--accent:${esc(accent)}"` : ''}>
      <input type="${type}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>
      <span class="choice-body">
        ${image}
        <span>
          ${meta ? `<span class="choice-meta">${esc(meta)}</span>` : ''}
          <span class="choice-title">${iconName ? `<span class="hex-icon">${icon(iconName)}</span>` : ''}${esc(title)}</span>
          ${desc ? `<span class="choice-desc">${esc(desc)}</span>` : ''}
          ${extra}
        </span>
      </span>
    </label>`;

  const chip = (name, value, label, checked, type = 'radio') => `
    <label class="chip"><input type="${type}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`;

  const view = {
    STEPS,

    progress(current, maxStep) {
      return STEPS.map((s, i) => `
        <li class="${i < current ? 'is-done' : ''}${i === current ? ' is-current' : ''}">
          <button type="button" data-goto="${i}"${i > maxStep ? ' disabled' : ''}${i === current ? ' aria-current="step"' : ''}>
            <span class="label">${i + 1}. ${s.label}</span>
          </button>
        </li>`).join('');
    },

    occasions: (s) => data.occasions.map((o) =>
      choice({ name: 'occasion', value: o.id, checked: s.occasion === o.id, title: o.name, desc: o.desc, iconName: o.icon })).join(''),

    festivals: (s) => data.festivals.map((f) => chip('festival', f, f, s.festival === f)).join(''),

    traditions: (s) => menus.traditions.map((t) =>
      choice({ name: 'tradition', value: t.id, checked: s.tradition === t.id, title: t.name, meta: t.region, desc: t.signature, accent: t.accent, cls: 'choice-accent' })).join(''),

    styles: (s) => data.foodStyles.map((f) => chip('style', f.id, f.name, s.style === f.id)).join(''),

    spices: (s) => data.spiceLevels.map((f) => chip('spice', f.id, f.name, s.spice === f.id)).join(''),

    dishes(s) {
      const tradition = find.tradition(s.tradition);
      if (!tradition) return '<p class="muted">Choose a food tradition first.</p>';
      const selected = new Set(s.dishes);
      const allowed = tradition.dishes.filter((d) => CH.dishAllowed(d, s.style));
      return menus.courses.map((course) => {
        const list = allowed.filter((d) => d.course === course.id);
        if (!list.length) return '';
        return `
          <div class="course" role="group" aria-labelledby="course-${course.id}">
            <h3 id="course-${course.id}">${esc(course.name)}</h3>
            <div class="dish-list">
              ${list.map((d) => `
                <label class="dish">
                  <input type="checkbox" name="dish" value="${esc(d.id)}"${selected.has(d.id) ? ' checked' : ''}>
                  <span>${esc(d.name)}<i class="diet ${d.nonveg ? 'nonveg' : 'veg'}" role="img" aria-label="${d.nonveg ? 'non-veg' : 'veg'}"></i></span>
                </label>`).join('')}
            </div>
          </div>`;
      }).join('');
    },

    packages(s) {
      const list = data.packages.filter((p) => p.tradition === s.tradition);
      if (!list.length) {
        const t = find.tradition(s.tradition);
        return `<p class="muted">No ready-made menu for ${esc(t ? t.name : 'this tradition')} yet. Choose dishes instead, and your cook will help you finalise it.</p>`;
      }
      return list.map((p) => {
        const occasion = find.occasion(p.occasion);
        return choice({
          name: 'package', value: p.id, checked: s.packageId === p.id, cls: 'pkg-option',
          title: p.name, meta: p.festival || (occasion ? occasion.name : ''),
          desc: `${p.dishes.length} dishes · from ${inr(CH.packageFrom(p))} for ${p.minGuests} guests`,
          image: `<img src="${CH.img(p.image, 160, 160)}" alt="" width="76" height="76" loading="lazy">`,
        });
      }).join('');
    },

    cities: () => cfg.cities.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join(''),

    meals: (s) => data.meals.map((m) => chip('meal', m.id, m.name, s.meal === m.id)).join(''),

    times(s) {
      const meal = find.meal(s.meal) || data.meals[1];
      const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const out = [];
      for (let t = toMin(meal.from); t <= toMin(meal.to); t += 30) {
        const value = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
        out.push(`<option value="${value}"${s.time === value ? ' selected' : ''}>${CH.formatTime(value)}</option>`);
      }
      return out.join('');
    },

    kitchens: (s) => data.kitchens.map((k) =>
      choice({ name: 'kitchen', value: k.id, checked: s.kitchen === k.id, title: k.name, desc: k.desc })).join(''),

    levels(s) {
      const guests = Number(s.guests) || 0;
      const dishes = s.dishes.length;
      const recommended = CH.recommendLevel({ guests, dishes, occasion: s.occasion });
      return data.levels.map((l) => {
        const fit = CH.levelFits(l, guests, dishes);
        const fee = CH.estimate({ ...s, level: l.id, addons: {} }).total;
        const extra = `
          <span class="price">${inr(fee)}</span>
          ${l.id === recommended ? '<span class="badge badge-leaf">Recommended</span>' : ''}
          ${fit.ok ? '' : `<span class="reason">${esc(fit.reason)}</span>`}`;
        return choice({ name: 'level', value: l.id, checked: s.level === l.id, disabled: !fit.ok, title: l.name, desc: l.tagline, cls: 'level-choice', extra });
      }).join('');
    },

    addons(s) {
      return data.addons.map((a) => {
        const value = s.addons[a.id];
        const on = Boolean(value);
        const price = a.perGuest ? `${inr(a.perGuest)} <small>/ guest</small>` : `${inr(a.price)} <small>${a.unit === 'flat fee' ? '' : `/ ${esc(a.unit.replace('per ', ''))}`}</small>`;
        const control = a.max
          ? `<div class="stepper" role="group" aria-label="${esc(a.name)}">
               <button type="button" data-addon-step="${a.id}" data-delta="-1" aria-label="Remove one"${value ? '' : ' disabled'}>${icon('minus')}</button>
               <input type="number" data-addon-qty="${a.id}" min="0" max="${a.max}" value="${Number(value) || 0}" aria-label="Number of ${esc(a.name.toLowerCase())}">
               <button type="button" data-addon-step="${a.id}" data-delta="1" aria-label="Add one"${value >= a.max ? ' disabled' : ''}>${icon('plus')}</button>
             </div>`
          : `<label class="switch"><input type="checkbox" data-addon-toggle="${a.id}"${on ? ' checked' : ''} aria-label="${esc(a.name)}"><span></span></label>`;
        return `
          <div class="addon${on ? ' is-on' : ''}" data-addon="${a.id}">
            <div class="addon-info"><strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span></div>
            <div class="addon-control"><span class="addon-price">${price}</span>${control}</div>
          </div>`;
      }).join('');
    },

    priceBlock(est, s) {
      return `
        <div class="price-lines">
          ${est.lines.map((l) => `<div class="price-line"><span>${esc(l.label)}<small>${esc(l.detail)}</small></span><span>${inr(l.amount)}</span></div>`).join('')}
        </div>
        <div class="price-total"><span>Estimated total</span><strong>${inr(est.total)}</strong></div>
        <p class="advance-line">Pay ${inr(est.advance)} (${cfg.advancePercent}%) only after we confirm your cook</p>
        <p class="summary-note">Cook's fee only. Ingredients are extra${s.addons.shopping ? ' and billed at actual cost' : ''}.</p>`;
    },

    summary(s, est) {
      const occasion = find.occasion(s.occasion);
      const tradition = find.tradition(s.tradition);
      const pkg = find.pkg(s.packageId);
      const style = find.style(s.style);
      const row = (k, v) => `<div><dt>${k}</dt><dd>${v ? esc(v) : '<span class="muted">–</span>'}</dd></div>`;
      return `
        <dl class="summary-list">
          ${row('Occasion', occasion ? occasion.name + (s.festival ? ` · ${s.festival}` : '') : '')}
          ${row('Tradition', tradition ? `${tradition.name} · ${style.name.split(' (')[0]}` : '')}
          ${row('Menu', s.dishes.length ? `${s.dishes.length} dishes${pkg ? ` · ${pkg.name}` : ''}` : '')}
          ${row('Guests', String(s.guests))}
          ${row('When', s.date ? `${CH.formatDate(s.date)}, ${CH.formatTime(s.time)}` : '')}
          ${row('Cook', est.level.name)}
        </dl>
        ${view.priceBlock(est, s)}
        ${cfg.demoMode ? `<div class="notice"><span>${icon('info')}</span><span>Sample prices for this preview.</span></div>` : ''}`;
    },

    review(s, est) {
      const occasion = find.occasion(s.occasion);
      const tradition = find.tradition(s.tradition);
      const style = find.style(s.style);
      const spice = data.spiceLevels.find((x) => x.id === s.spice);
      const meal = find.meal(s.meal);
      const kitchen = find.kitchen(s.kitchen);
      const pkg = find.pkg(s.packageId);
      const dishNames = s.dishes.map((id) => (find.dish(id) || {}).name).filter(Boolean);
      const extras = est.lines.slice(1).filter((l) => !/more (guests|dishes)/.test(l.label)).map((l) => l.label);
      const row = (label, value, step) => `
        <div class="review-row">
          <dt>${label}</dt>
          <dd class="review-value">${value}</dd>
          <dd><button type="button" class="btn btn-ghost" data-goto="${step}" aria-label="Edit ${label.toLowerCase()}">${icon('edit')}Edit</button></dd>
        </div>`;
      return [
        row('Occasion', esc(occasion ? occasion.name + (s.festival ? ` · ${s.festival}` : '') : ''), 0),
        row('Food', esc(`${tradition ? tradition.name : ''} · ${style ? style.name : ''} · ${spice ? spice.name : ''} spice`), 1),
        row(`Menu (${dishNames.length})`, `${pkg ? `<strong>${esc(pkg.name)}</strong><br>` : ''}${esc(dishNames.join(', '))}`, 2),
        row('When & where', esc(`${CH.formatDate(s.date)} · ${meal ? meal.name : ''}, ready by ${CH.formatTime(s.time)} · ${s.city} · ${s.guests} guests · ${kitchen ? kitchen.name : ''} kitchen`), 3),
        row('Cook & extras', esc([est.level.name, ...extras].join(' · ')), 4),
      ].join('');
    },
  };

  window.CHB = { view };
})();
