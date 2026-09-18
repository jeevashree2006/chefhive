/* Home page: renders the data-driven sections and wires the quick-book form. */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const { $, esc, inr, img, icon, data, menus, find } = window.CH;

    // Quick-book form -> book.html with only the filled-in fields as URL params.
    const form = $('.quick-book');
    const occasionSelect = $('#qb-occasion');
    const traditionSelect = $('#qb-tradition');
    const dateInput = $('#qb-date');
    data.occasions.forEach((o) => occasionSelect.add(new Option(o.name, o.id)));
    menus.traditions.forEach((t) => traditionSelect.add(new Option(t.name, t.id)));
    const range = window.CH.bookableRange();
    dateInput.min = range.min;
    dateInput.max = range.max;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      new FormData(form).forEach((value, key) => { if (String(value).trim()) params.set(key, value); });
      window.location.href = `book.html${params.toString() ? `?${params}` : ''}`;
    });

    // Occasions
    $('#occasion-grid').innerHTML = data.occasions.map((o) => `
      <a class="card occasion-card reveal" href="book.html?occasion=${encodeURIComponent(o.id)}">
        <span class="hex-icon">${icon(o.icon)}</span>
        <h3>${esc(o.name)}</h3>
        <p>${esc(o.desc)}</p>
        <span class="more-link">Plan this ${icon('arrowRight')}</span>
      </a>`).join('');

    // Traditions
    $('#tradition-count').textContent = menus.traditions.length;
    $('#tradition-grid').innerHTML = menus.traditions.map((t) => `
      <a class="card tradition-card reveal" href="book.html?tradition=${encodeURIComponent(t.id)}" style="--accent:${esc(t.accent)}">
        <span class="region">${esc(t.region)}</span>
        <h3>${esc(t.name)}</h3>
        <p class="signature">${esc(t.signature)}</p>
        <span class="more-link">See ${t.dishes.length} dishes ${icon('arrowRight')}</span>
      </a>`).join('');

    // Occasion menus (packages)
    $('#package-grid').innerHTML = data.packages.map((p) => {
      const tradition = find.tradition(p.tradition);
      const tag = p.festival || (find.occasion(p.occasion) || {}).name || '';
      return `
      <article class="card package-card reveal">
        <div class="package-media">
          <img src="${img(p.image, 640, 400)}" width="640" height="400" loading="lazy" alt="${esc(p.name)} spread">
          <span class="badge">${esc(tag)}</span>
        </div>
        <div class="package-body">
          <h3>${esc(p.name)}</h3>
          <div class="package-meta">
            <span>${icon('pin')}${esc(tradition.name)}</span>
            <span>${icon('utensils')}${p.dishes.length} dishes</span>
            <span>${icon('users')}${p.minGuests}+ guests</span>
          </div>
          <p>${esc(p.blurb)}</p>
          <div class="package-foot">
            <div class="price-from">Cook fee from<strong>${inr(window.CH.packageFrom(p))}</strong></div>
            <a class="btn btn-primary btn-sm" href="book.html?package=${encodeURIComponent(p.id)}" aria-label="Book the ${esc(p.name)} menu">Book menu</a>
          </div>
        </div>
      </article>`;
    }).join('');

    // Cook levels
    $('#level-grid').innerHTML = data.levels.map((l) => `
      <article class="card level-card reveal${l.popular ? ' is-popular' : ''}">
        ${l.popular ? '<span class="badge popular-tag">Best for occasions</span>' : ''}
        <h3>${esc(l.name)}</h3>
        <p class="tagline">${esc(l.tagline)}</p>
        <div class="level-price">${inr(l.base)} <small>onwards</small></div>
        <p class="level-rates">Covers ${l.includedGuests} guests and ${l.includedDishes} dishes, then ${inr(l.perGuest)} per guest and ${inr(l.perDish)} per dish.</p>
        <ul class="check-list">${l.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
        <a class="btn ${l.popular ? 'btn-primary' : 'btn-secondary'}" href="book.html?level=${encodeURIComponent(l.id)}">Book a ${esc(l.name)}</a>
      </article>`).join('');

    window.CH.initReveal();
  });
})();
