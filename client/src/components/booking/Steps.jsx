/* The six booking steps. State lives in pages/Book.jsx; these components only render and report changes. */
import Icon from '../Icon.jsx';
import { ChoiceCard, Chip, DietMark, FieldError, NumberStepper, PriceLines } from './Bits.jsx';
import { formatDate, formatTime, img, inr, timeOptions } from '../../lib/format.js';
import { dishAllowed, levelFits, recommendLevel, suggestedHelpers } from '../../lib/pricing.js';

export function StepOccasion({ state, catalog, set }) {
  return (
    <section className="step" aria-labelledby="t-occasion">
      <h2 className="step-title" id="t-occasion" tabIndex={-1}>What&apos;s the occasion?</h2>
      <p className="step-sub">Each occasion has its own food rules. We match a cook who already knows them.</p>
      <fieldset className="group">
        <legend className="sr-only">Occasion</legend>
        <div className="choice-grid">
          {catalog.occasions.map((o) => (
            <ChoiceCard key={o.id} name="occasion" value={o.id} checked={state.occasion === o.id}
              onChange={() => set({ occasion: o.id, festival: o.id === 'festival' ? state.festival : '' })}
              title={o.name} desc={o.desc} icon={o.icon} />
          ))}
        </div>
      </fieldset>
      {state.occasion === 'festival' && (
        <fieldset className="group">
          <legend>Which festival?</legend>
          <div className="chips">
            {catalog.festivals.map((f) => (
              <Chip key={f} name="festival" value={f} label={f} checked={state.festival === f}
                onChange={() => set({ festival: f })} />
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}

export function StepTradition({ state, catalog, set, onTraditionChange, onStyleChange }) {
  return (
    <section className="step" aria-labelledby="t-tradition">
      <h2 className="step-title" id="t-tradition" tabIndex={-1}>Which food tradition?</h2>
      <p className="step-sub">Choose the cuisine your family grew up with. Your cook will be a specialist in it.</p>
      <fieldset className="group">
        <legend className="sr-only">Food tradition</legend>
        <div className="choice-grid">
          {catalog.traditions.map((t) => (
            <ChoiceCard key={t.id} name="tradition" value={t.id} checked={state.tradition === t.id}
              onChange={() => onTraditionChange(t.id)} title={t.name} meta={t.region} desc={t.signature}
              accent={t.accent} className="choice-accent" />
          ))}
        </div>
      </fieldset>
      <fieldset className="group">
        <legend>Food rules</legend>
        <div className="chips">
          {catalog.foodStyles.map((s) => (
            <Chip key={s.id} name="style" value={s.id} label={s.name} checked={state.style === s.id}
              onChange={() => onStyleChange(s.id)} />
          ))}
        </div>
      </fieldset>
      <fieldset className="group">
        <legend>Spice level</legend>
        <div className="chips">
          {catalog.spiceLevels.map((s) => (
            <Chip key={s.id} name="spice" value={s.id} label={s.name} checked={state.spice === s.id}
              onChange={() => set({ spice: s.id })} />
          ))}
        </div>
      </fieldset>
    </section>
  );
}

export function StepMenu({ state, catalog, set, onDishToggle, onPackage, onClearDishes, hint }) {
  const tradition = catalog.traditions.find((t) => t.id === state.tradition);
  const style = catalog.foodStyles.find((s) => s.id === state.style);
  const kitchen = catalog.kitchens.find((k) => k.id === state.kitchen);
  const packages = catalog.packages.filter((p) => p.tradition === state.tradition);
  const chosen = new Set(state.dishes);
  const allowed = (tradition?.dishes || []).filter((d) => dishAllowed(d, state.style));
  const maxDishes = Math.max(...catalog.levels.map((l) => l.maxDishes));
  const count = state.dishes.length;

  let countHint = 'Most families pick 6–12 dishes for an occasion';
  if (count < catalog.settings.minDishes) countHint = `Pick at least ${catalog.settings.minDishes}`;
  else if (kitchen && count > kitchen.comfortableDishes) countHint = `That's a lot for a ${kitchen.name.toLowerCase()} kitchen, so your cook may bring help`;

  const isCustom = state.menuTab === 'custom';

  return (
    <section className="step" aria-labelledby="t-menu">
      <h2 className="step-title" id="t-menu" tabIndex={-1}>Pick your menu</h2>
      <p className="step-sub">
        {tradition?.name} dishes, showing only {style?.name.split(' (')[0].toLowerCase()} options.
        Choose one by one, or start from an occasion menu.
      </p>
      <div className="tabs" role="tablist" aria-label="How to choose your menu">
        <button type="button" role="tab" id="tab-custom" aria-controls="panel-custom" aria-selected={isCustom}
          tabIndex={isCustom ? 0 : -1} onClick={() => set({ menuTab: 'custom' })}>Choose dishes</button>
        <button type="button" role="tab" id="tab-packages" aria-controls="panel-packages" aria-selected={!isCustom}
          tabIndex={isCustom ? -1 : 0} onClick={() => set({ menuTab: 'packages' })}>Occasion menus</button>
      </div>

      {isCustom ? (
        <div id="panel-custom" role="tabpanel" aria-labelledby="tab-custom">
          <div className="dish-toolbar">
            <span className={`dish-count${count > maxDishes ? ' is-over' : ''}`} aria-live="polite">
              {count} {count === 1 ? 'dish' : 'dishes'} selected
            </span>
            <span className="small muted" id="dish-hint">{hint || countHint}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClearDishes}>Clear all</button>
          </div>
          {catalog.courses.map((course) => {
            const list = allowed.filter((d) => d.course === course.id);
            if (!list.length) return null;
            return (
              <div className="course" key={course.id} role="group" aria-labelledby={`course-${course.id}`}>
                <h3 id={`course-${course.id}`}>{course.name}</h3>
                <div className="dish-list">
                  {list.map((dish) => (
                    <label className="dish" key={dish.id}>
                      <input type="checkbox" name="dish" value={dish.id} checked={chosen.has(dish.id)}
                        onChange={(event) => onDishToggle(dish.id, event.target.checked)} />
                      <span>{dish.name}<DietMark nonveg={dish.nonveg} /></span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div id="panel-packages" role="tabpanel" aria-labelledby="tab-packages">
          {packages.length ? (
            <>
              <fieldset className="group">
                <legend className="sr-only">Occasion menus</legend>
                <div className="pkg-list">
                  {packages.map((p) => (
                    <ChoiceCard key={p.id} name="package" value={p.id} checked={state.packageId === p.id}
                      onChange={() => onPackage(p)} className="pkg-option" title={p.name}
                      meta={p.festival || catalog.occasions.find((o) => o.id === p.occasion)?.name}
                      desc={`${p.dishes.length} dishes · from ${inr(p.fromPrice)} for ${p.minGuests} guests`}
                      image={<img src={img(p.image, 160, 160)} alt="" width="76" height="76" loading="lazy" />} />
                  ))}
                </div>
              </fieldset>
              <p className="small muted">Picking a menu fills in its dishes. You can still add or remove dishes under &ldquo;Choose dishes&rdquo;.</p>
            </>
          ) : (
            <p className="muted">
              No ready-made menu for {tradition?.name} yet. Choose dishes instead, and your cook will help you finalise it.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function StepDetails({ state, catalog, set, setGuests, range }) {
  const meal = catalog.meals.find((m) => m.id === state.meal);
  const times = timeOptions(meal);
  return (
    <section className="step" aria-labelledby="t-details">
      <h2 className="step-title" id="t-details" tabIndex={-1}>When and where?</h2>
      <p className="step-sub">Your cook arrives 2&ndash;3 hours before the serving time.</p>
      <div className="form-grid group">
        <div className="field">
          <label htmlFor="city">City</label>
          <select className="select" id="city" value={state.city} onChange={(e) => set({ city: e.target.value })} required>
            <option value="">Choose your city</option>
            {catalog.cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input className="input" id="date" type="date" min={range.min} max={range.max} value={state.date}
            onChange={(e) => set({ date: e.target.value })} aria-describedby="date-hint" required />
          <span className="field-hint" id="date-hint">
            Earliest {formatDate(range.min)}. For big festivals, book 2&ndash;3 weeks ahead.
          </span>
        </div>
      </div>
      <fieldset className="group">
        <legend>Meal</legend>
        <div className="chips">
          {catalog.meals.map((m) => (
            <Chip key={m.id} name="meal" value={m.id} label={m.name} checked={state.meal === m.id}
              onChange={() => {
                const options = timeOptions(m);
                set({ meal: m.id, time: options.includes(state.time) ? state.time : options[0] });
              }} />
          ))}
        </div>
      </fieldset>
      <div className="form-grid group">
        <div className="field">
          <label htmlFor="time">Food ready by</label>
          <select className="select" id="time" value={state.time} onChange={(e) => set({ time: e.target.value })}>
            {times.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="field-label" id="guests-label">Guests</span>
          <NumberStepper id="guests" value={state.guests} min={catalog.settings.minGuests} max={catalog.settings.maxGuests}
            onChange={setGuests} labelledBy="guests-label" decLabel="Fewer guests" incLabel="More guests" />
          <span className="field-hint">
            {catalog.settings.minGuests} to {catalog.settings.maxGuests} guests. For more, <a href="/#faq">talk to us</a>.
          </span>
        </div>
      </div>
      <fieldset className="group">
        <legend>Your kitchen</legend>
        <p className="group-hint">Helps your cook plan how many dishes can be made at once.</p>
        <div className="choice-grid cols-3">
          {catalog.kitchens.map((k) => (
            <ChoiceCard key={k.id} name="kitchen" value={k.id} checked={state.kitchen === k.id}
              onChange={() => set({ kitchen: k.id })} title={k.name} desc={k.desc} />
          ))}
        </div>
      </fieldset>
    </section>
  );
}

export function StepCook({ state, catalog, set, setAddon, estimateFor }) {
  const guests = state.guests;
  const dishCount = state.dishes.length;
  const recommended = recommendLevel(catalog, { guests, dishes: dishCount, occasionId: state.occasion });
  const suggested = suggestedHelpers(catalog, guests);
  const helpers = Number(state.addons.helper) || 0;

  return (
    <section className="step" aria-labelledby="t-cook">
      <h2 className="step-title" id="t-cook" tabIndex={-1}>Choose your cook &amp; extras</h2>
      <p className="step-sub">We&apos;ve picked the level that fits your guests and menu. You can change it.</p>
      <fieldset className="group">
        <legend>Cook level</legend>
        <div className="choice-grid cols-3">
          {catalog.levels.map((level) => {
            const fit = levelFits(level, guests, dishCount);
            const fee = estimateFor(level.id);
            return (
              <ChoiceCard key={level.id} name="level" value={level.id} checked={state.level === level.id}
                disabled={!fit.ok} onChange={() => set({ level: level.id, levelAuto: false })}
                title={level.name} desc={level.tagline} className="level-choice"
                extra={(
                  <>
                    <span className="price">{inr(fee)}</span>
                    {level.id === recommended && <span className="badge badge-leaf">Recommended</span>}
                    {!fit.ok && <span className="reason">{fit.reason}</span>}
                  </>
                )} />
            );
          })}
        </div>
      </fieldset>
      <fieldset className="group">
        <legend>Extras</legend>
        {suggested > helpers && (
          <div className="notice notice-leaf">
            <Icon name="info" />
            <span>
              For {guests} guests we suggest {suggested} kitchen helper{suggested > 1 ? 's' : ''}.{' '}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddon('helper', suggested)}>
                Add {suggested}
              </button>
            </span>
          </div>
        )}
        <div className="addon-list" style={{ marginTop: 12 }}>
          {catalog.addons.map((addon) => {
            const value = state.addons[addon.id];
            const on = Boolean(value);
            const price = addon.perGuest
              ? <>{inr(addon.perGuest)} <small>/ guest</small></>
              : <>{inr(addon.price)} {addon.unit !== 'flat fee' && <small>/ {addon.unit.replace('per ', '')}</small>}</>;
            return (
              <div className={`addon${on ? ' is-on' : ''}`} key={addon.id}>
                <div className="addon-info"><strong>{addon.name}</strong><span>{addon.desc}</span></div>
                <div className="addon-control">
                  <span className="addon-price">{price}</span>
                  {addon.max > 1 ? (
                    <NumberStepper value={Number(value) || 0} min={0} max={addon.max}
                      onChange={(next) => setAddon(addon.id, next)}
                      decLabel={`Fewer ${addon.name.toLowerCase()}`} incLabel={`More ${addon.name.toLowerCase()}`} />
                  ) : (
                    <label className="switch">
                      <input type="checkbox" checked={on} aria-label={addon.name}
                        onChange={(event) => setAddon(addon.id, event.target.checked ? 1 : 0)} />
                      <span />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

export function StepReview({ state, catalog, estimate, setContact, errors, goTo }) {
  const find = (list, id) => list.find((x) => x.id === id);
  const occasion = find(catalog.occasions, state.occasion);
  const tradition = find(catalog.traditions, state.tradition);
  const style = find(catalog.foodStyles, state.style);
  const spice = find(catalog.spiceLevels, state.spice);
  const meal = find(catalog.meals, state.meal);
  const kitchen = find(catalog.kitchens, state.kitchen);
  const pkg = find(catalog.packages, state.packageId);
  const dishNames = state.dishes
    .map((id) => catalog.traditions.flatMap((t) => t.dishes).find((d) => d.id === id)?.name)
    .filter(Boolean);
  const extras = estimate.lines.filter((l) => l.key.startsWith('addon:')).map((l) => l.label);

  const row = (label, value, step) => (
    <div className="review-row" key={label}>
      <dt>{label}</dt>
      <dd className="review-value">{value}</dd>
      <dd>
        <button type="button" className="btn btn-ghost" aria-label={`Edit ${label.toLowerCase()}`} onClick={() => goTo(step)}>
          <Icon name="edit" />Edit
        </button>
      </dd>
    </div>
  );

  const field = (id, label, extra = {}) => (
    <div className="field" key={id}>
      <label htmlFor={id}>{label}</label>
      <input className="input" id={id} value={state.contact[id] || ''} aria-invalid={errors[id] ? 'true' : undefined}
        aria-describedby={errors[id] ? `err-${id}` : undefined}
        onChange={(event) => setContact(id, event.target.value)} {...extra} />
      <FieldError id={`err-${id}`} message={errors[id]} />
    </div>
  );

  return (
    <section className="step" aria-labelledby="t-review">
      <h2 className="step-title" id="t-review" tabIndex={-1}>Review and confirm</h2>
      <p className="step-sub">Check the details, then tell us where to reach you. Nothing is charged now.</p>
      <dl className="review-list">
        {row('Occasion', `${occasion?.name || ''}${state.festival ? ` · ${state.festival}` : ''}`, 0)}
        {row('Food', `${tradition?.name} · ${style?.name} · ${spice?.name} spice`, 1)}
        {row(`Menu (${dishNames.length})`, (
          <>
            {pkg && <><strong>{pkg.name}</strong><br /></>}
            {dishNames.join(', ')}
          </>
        ), 2)}
        {row('When & where',
          `${formatDate(state.date)} · ${meal?.name}, ready by ${formatTime(state.time)} · ${state.city} · ${state.guests} guests · ${kitchen?.name} kitchen`, 3)}
        {row('Cook & extras', [estimate.level.name, ...extras].join(' · '), 4)}
      </dl>

      <div className="review-price">
        <PriceLines estimate={estimate} advancePercent={catalog.settings.advancePercent}
          note={`Cook's fee only. Ingredients are extra${state.addons.shopping ? ' and billed at actual cost' : ''}.`} />
      </div>

      <div className="form-grid group">
        {field('name', 'Your name', { autoComplete: 'name', required: true })}
        {field('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel-national', placeholder: '10-digit mobile', required: true })}
        {field('email', 'Email (optional)', { type: 'email', autoComplete: 'email' })}
        {field('pincode', 'Pincode', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6, required: true })}
        <div className="field span-2">
          <label htmlFor="address">Address or area</label>
          <input className="input" id="address" autoComplete="street-address" value={state.contact.address}
            aria-invalid={errors.address ? 'true' : undefined} aria-describedby={errors.address ? 'err-address' : undefined}
            onChange={(event) => setContact('address', event.target.value)} required />
          <FieldError id="err-address" message={errors.address} />
        </div>
        <div className="field span-2">
          <label htmlFor="notes">Family recipes, rituals or allergies <span className="muted">(optional)</span></label>
          <textarea className="textarea" id="notes" value={state.contact.notes}
            placeholder="e.g. No onion or garlic until after the pooja. Serve on banana leaf. My mother adds jaggery to the sambar."
            onChange={(event) => setContact('notes', event.target.value)} />
        </div>
        <label className="check span-2">
          <input type="checkbox" checked={state.contact.consent}
            onChange={(event) => setContact('consent', event.target.checked)} required />
          <span>ChefHive can call or WhatsApp me about this booking.</span>
        </label>
        <FieldError id="err-consent" message={errors.consent} />
      </div>
    </section>
  );
}
