/* The booking wizard: state, validation, navigation and submission to the API. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Progress } from '../components/booking/Bits.jsx';
import { Confirmation, MobileBar, Summary } from '../components/booking/Panels.jsx';
import { StepCook, StepDetails, StepMenu, StepOccasion, StepReview, StepTradition } from '../components/booking/Steps.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { ApiError, createBooking } from '../api.js';
import { bookableRange, formatDate, timeOptions } from '../lib/format.js';
import { dishAllowed, estimate as calcEstimate, levelFits, recommendLevel } from '../lib/pricing.js';

const STEPS = [
  { id: 'occasion', label: 'Occasion' },
  { id: 'tradition', label: 'Tradition' },
  { id: 'menu', label: 'Menu' },
  { id: 'details', label: 'Details' },
  { id: 'cook', label: 'Cook' },
  { id: 'review', label: 'Review' },
];
const LAST = STEPS.length - 1;
const DRAFT_KEY = 'chefhive.booking.v2';

const PHONE = /^[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Which step a server-side field error belongs to.
const FIELD_STEP = {
  occasionId: 0, festival: 0, traditionId: 1, foodStyle: 1, spice: 1, dishes: 2, packageId: 2,
  city: 3, eventDate: 3, meal: 3, readyBy: 3, guests: 3, kitchen: 3, levelId: 4, addons: 4,
};
const CONTACT_FIELDS = ['name', 'phone', 'email', 'pincode', 'address', 'consent'];

const readDraft = () => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
};
const saveDraft = (value) => {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch { /* storage unavailable */ }
};
const clearDraft = () => {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
};

const normalisePhone = (value) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

export default function Book() {
  const { catalog } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const range = useMemo(() => bookableRange(catalog.settings), [catalog.settings]);
  const maxDishes = useMemo(() => Math.max(...catalog.levels.map((l) => l.maxDishes)), [catalog.levels]);

  const defaults = useCallback(() => {
    const meal = catalog.meals[1] || catalog.meals[0];
    const times = timeOptions(meal);
    return {
      occasion: '', festival: '', tradition: '',
      style: catalog.foodStyles[0].id,
      spice: catalog.spiceLevels[1]?.id || catalog.spiceLevels[0].id,
      menuTab: 'custom', packageId: '', dishes: [],
      city: '', date: '', meal: meal.id, time: times[2] || times[0],
      guests: 10, kitchen: catalog.kitchens[1]?.id || catalog.kitchens[0].id,
      level: '', levelAuto: true, addons: {},
      contact: { name: '', phone: '', email: '', address: '', pincode: '', notes: '', consent: false },
    };
  }, [catalog]);

  // Restore a draft, then let any link parameters (?package=, ?occasion=, …) win.
  const [{ state: initialState, step: initialStep, resumed, hasParams }] = useState(() => {
    const base = defaults();
    const saved = readDraft();
    const params = Object.fromEntries(searchParams.entries());
    const hasParams = Object.keys(params).length > 0;
    let state = { ...base };
    let resumedDraft = false;

    if (saved && typeof saved === 'object') {
      const contact = { ...base.contact, ...(saved.contact || {}) };
      if (hasParams) state = { ...base, contact };
      else {
        state = { ...base, ...saved, addons: { ...(saved.addons || {}) }, contact };
        resumedDraft = Number(saved.step) > 0;
      }
    }

    const has = (list, id) => list.some((x) => x.id === id);
    if (!has(catalog.occasions, state.occasion)) state.occasion = '';
    if (!catalog.festivals.includes(state.festival)) state.festival = '';
    if (!has(catalog.traditions, state.tradition)) state.tradition = '';
    if (!has(catalog.foodStyles, state.style)) state.style = base.style;
    if (!catalog.cities.includes(state.city)) state.city = '';
    if (state.date && (state.date < range.min || state.date > range.max)) state.date = '';

    const applyPackage = (pkg) => {
      state.packageId = pkg.id;
      state.tradition = pkg.tradition;
      state.dishes = pkg.dishes.filter((id) => dishAllowed(catalog.traditions.flatMap((t) => t.dishes).find((d) => d.id === id), state.style));
      state.guests = Math.max(state.guests, pkg.minGuests);
    };

    if (hasParams) {
      const pkg = catalog.packages.find((p) => p.id === params.package);
      if (pkg) {
        state.occasion = pkg.occasion;
        state.festival = pkg.festival || '';
        state.style = pkg.style;
        state.menuTab = 'packages';
        applyPackage(pkg);
      }
      if (has(catalog.occasions, params.occasion)) state.occasion = params.occasion;
      if (catalog.festivals.includes(params.festival)) state.festival = params.festival;
      if (has(catalog.traditions, params.tradition) && params.tradition !== state.tradition) {
        state.tradition = params.tradition;
        state.dishes = [];
        state.packageId = '';
      }
      if (params.date && params.date >= range.min && params.date <= range.max) state.date = params.date;
      if (params.guests) state.guests = Math.min(catalog.settings.maxGuests, Math.max(catalog.settings.minGuests, Math.round(Number(params.guests)) || 10));
      if (has(catalog.levels, params.level)) { state.level = params.level; state.levelAuto = false; }
      if (catalog.cities.includes(params.city)) state.city = params.city;
    }

    // Keep only dishes that still belong to the chosen tradition.
    const traditionDishes = new Set((catalog.traditions.find((t) => t.id === state.tradition)?.dishes || []).map((d) => d.id));
    state.dishes = (Array.isArray(state.dishes) ? state.dishes : []).filter((id) => traditionDishes.has(id));

    return { state, step: Math.min(Number(saved?.step) || 0, LAST), resumed: resumedDraft && !hasParams, hasParams };
  });

  const [state, setState] = useState(initialState);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [menuHint, setMenuHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [showResumed, setShowResumed] = useState(resumed);
  const headRef = useRef(null);
  const firstRender = useRef(true);

  const set = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);
  const estimate = useMemo(() => calcEstimate(catalog, state), [catalog, state]);

  const stepError = useCallback((index) => {
    switch (STEPS[index].id) {
      case 'occasion':
        if (!state.occasion) return 'Choose the occasion to continue.';
        if (state.occasion === 'festival' && !state.festival) return 'Choose which festival it is.';
        return '';
      case 'tradition':
        return state.tradition ? '' : 'Choose a food tradition to continue.';
      case 'menu':
        if (state.dishes.length < catalog.settings.minDishes) return `Pick at least ${catalog.settings.minDishes} dishes, or choose an occasion menu.`;
        if (state.dishes.length > maxDishes) return `One cook team can make up to ${maxDishes} dishes. Remove ${state.dishes.length - maxDishes} to continue.`;
        return '';
      case 'details':
        if (!state.city) return 'Choose your city.';
        if (!state.date) return 'Choose the date of your occasion.';
        if (state.date < range.min || state.date > range.max) return `Choose a date between ${formatDate(range.min)} and ${formatDate(range.max)}.`;
        return '';
      case 'cook': {
        const level = catalog.levels.find((l) => l.id === state.level);
        return level && levelFits(level, state.guests, state.dishes.length).ok ? '' : 'Choose a cook level that fits your guests and menu.';
      }
      default:
        return '';
    }
  }, [state, catalog, maxDishes, range]);

  const contactErrors = useCallback(() => {
    const c = state.contact;
    const errors = {};
    if (c.name.trim().length < 2) errors.name = 'Enter your name.';
    if (!PHONE.test(normalisePhone(c.phone))) errors.phone = 'Enter a 10-digit Indian mobile number.';
    if (c.email.trim() && !EMAIL.test(c.email.trim())) errors.email = 'Check the email address.';
    if (!PINCODE.test(c.pincode.trim())) errors.pincode = 'Enter a 6-digit pincode.';
    if (c.address.trim().length < 5) errors.address = 'Enter your address or area.';
    if (!c.consent) errors.consent = 'Please allow us to contact you about this booking.';
    return errors;
  }, [state.contact]);

  // Open on the first step that still needs something. A link like /book?package=… therefore
  // lands on "When and where", because the occasion, tradition and menu are already filled in.
  useEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
    let firstIncomplete = LAST;
    for (let i = 0; i < LAST; i += 1) {
      if (stepError(i)) { firstIncomplete = i; break; }
    }
    const target = hasParams ? firstIncomplete : Math.min(initialStep, firstIncomplete);
    setStep(target);
    setMaxStep(target);
    // Drop the query string so a refresh restores the draft instead of re-applying the link.
    if (hasParams) setSearchParams({}, { replace: true });
  }, [initialStep, hasParams, stepError, setSearchParams]);

  // Keep the cook level in step with guests and dishes until the visitor picks one.
  useEffect(() => {
    const level = catalog.levels.find((l) => l.id === state.level);
    const fits = level && levelFits(level, state.guests, state.dishes.length).ok;
    if (state.levelAuto || !fits) {
      const next = recommendLevel(catalog, { guests: state.guests, dishes: state.dishes.length, occasionId: state.occasion });
      if (next !== state.level) setState((s) => ({ ...s, level: next, levelAuto: true }));
    }
  }, [catalog, state.level, state.levelAuto, state.guests, state.dishes.length, state.occasion]);

  useEffect(() => { saveDraft({ ...state, step, maxStep }); }, [state, step, maxStep]);

  // Move focus to the new step's heading, the way a page change would.
  useEffect(() => {
    if (result) return;
    const title = document.querySelector('.step:not([hidden]) .step-title');
    title?.focus({ preventScroll: true });
    const top = (headRef.current?.getBoundingClientRect().top || 0) + window.scrollY - 80;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
  }, [step, result]);

  const goTo = (index) => {
    const next = Math.max(0, Math.min(LAST, index));
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    setError('');
  };

  const tryGoTo = (target) => {
    if (target <= step) { goTo(target); return; }
    for (let i = step; i < target; i += 1) {
      const message = stepError(i);
      if (message) { goTo(i); setError(message); return; }
    }
    goTo(target);
  };

  const submit = async () => {
    for (let i = 0; i < LAST; i += 1) {
      const message = stepError(i);
      if (message) { goTo(i); setError(message); return; }
    }
    const errors = contactErrors();
    setFieldErrors(errors);
    const firstBad = CONTACT_FIELDS.find((f) => errors[f]);
    if (firstBad) {
      setError('Please fix the highlighted details.');
      document.getElementById(firstBad)?.focus();
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = {
        occasionId: state.occasion,
        festival: state.festival,
        traditionId: state.tradition,
        foodStyle: state.style,
        spice: state.spice,
        packageId: state.packageId || null,
        dishes: state.dishes,
        city: state.city,
        eventDate: state.date,
        meal: state.meal,
        readyBy: state.time,
        guests: state.guests,
        kitchen: state.kitchen,
        levelId: state.level,
        addons: state.addons,
        name: state.contact.name.trim(),
        phone: normalisePhone(state.contact.phone),
        email: state.contact.email.trim(),
        address: state.contact.address.trim(),
        pincode: state.contact.pincode.trim(),
        notes: state.contact.notes.trim(),
        consent: state.contact.consent === true,
      };
      const response = await createBooking(payload);
      clearDraft();
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const serverFields = Object.keys(err.errors);
        const contactField = serverFields.find((f) => CONTACT_FIELDS.includes(f));
        if (contactField) {
          setFieldErrors(err.errors);
          setError('Please fix the highlighted details.');
          document.getElementById(contactField)?.focus();
        } else {
          const field = serverFields[0];
          goTo(FIELD_STEP[field] ?? 0);
          setError(err.errors[field]);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step === LAST) { submit(); return; }
    const message = stepError(step);
    if (message) { setError(message); return; }
    goTo(step + 1);
  };

  // --- handlers passed down to the steps -------------------------------------------------
  const orderedDishes = (traditionId, ids) => {
    const order = catalog.traditions.find((t) => t.id === traditionId)?.dishes.map((d) => d.id) || [];
    const chosen = new Set(ids);
    return order.filter((id) => chosen.has(id));
  };

  const onTraditionChange = (id) => {
    if (id === state.tradition) return;
    setMenuHint('');
    set({ tradition: id, dishes: [], packageId: '', menuTab: 'custom' });
  };

  const onStyleChange = (id) => {
    const allDishes = catalog.traditions.flatMap((t) => t.dishes);
    set({ style: id, dishes: state.dishes.filter((dishId) => dishAllowed(allDishes.find((d) => d.id === dishId), id)) });
  };

  const onDishToggle = (id, on) => {
    const ids = on ? [...state.dishes, id] : state.dishes.filter((d) => d !== id);
    setMenuHint('');
    set({ dishes: orderedDishes(state.tradition, ids) });
  };

  const onPackage = (pkg) => {
    const allDishes = catalog.traditions.flatMap((t) => t.dishes);
    const dishes = pkg.dishes.filter((id) => dishAllowed(allDishes.find((d) => d.id === id), state.style));
    const left = pkg.dishes.length - dishes.length;
    setMenuHint(left ? `${left} dishes left out because of your food rules` : `${dishes.length} dishes added from ${pkg.name}`);
    set({ packageId: pkg.id, dishes, guests: Math.max(state.guests, pkg.minGuests) });
  };

  const onClearDishes = () => { setMenuHint(''); set({ dishes: [], packageId: '' }); };

  const setGuests = (value) => {
    const n = Math.min(catalog.settings.maxGuests, Math.max(catalog.settings.minGuests, Math.round(Number(value) || 0)));
    set({ guests: n });
  };

  const setAddon = (id, qty) => {
    const addon = catalog.addons.find((a) => a.id === id);
    const n = Math.max(0, Math.min(addon?.max ?? 1, Math.round(Number(qty) || 0)));
    const addons = { ...state.addons };
    if (n) addons[id] = n; else delete addons[id];
    set({ addons });
  };

  const setContact = (field, value) => {
    setState((s) => ({ ...s, contact: { ...s.contact, [field]: value } }));
    setFieldErrors((errors) => (errors[field] ? { ...errors, [field]: '' } : errors));
  };

  const startOver = () => {
    clearDraft();
    setState(defaults());
    setStep(0);
    setMaxStep(0);
    setShowResumed(false);
    setSearchParams({}, { replace: true });
  };

  const estimateFor = (levelId) => calcEstimate(catalog, { ...state, level: levelId, addons: {} }).total;

  if (result) {
    return (
      <main id="main" className="booking-page">
        <div className="container">
          <Confirmation result={result} state={state} catalog={catalog} onAnother={startOver} />
        </div>
      </main>
    );
  }

  const stepProps = { state, catalog, set };
  const panels = [
    <StepOccasion key="occasion" {...stepProps} />,
    <StepTradition key="tradition" {...stepProps} onTraditionChange={onTraditionChange} onStyleChange={onStyleChange} />,
    <StepMenu key="menu" {...stepProps} onDishToggle={onDishToggle} onPackage={onPackage} onClearDishes={onClearDishes} hint={menuHint} />,
    <StepDetails key="details" {...stepProps} setGuests={setGuests} range={range} />,
    <StepCook key="cook" {...stepProps} setAddon={setAddon} estimateFor={estimateFor} />,
    <StepReview key="review" {...stepProps} estimate={estimate} setContact={setContact} errors={fieldErrors} goTo={goTo} />,
  ];

  return (
    <main id="main" className="booking-page">
      <div className="container">
        <div className="booking-layout">
          <section aria-labelledby="wizard-title">
            <div className="wizard-head" ref={headRef}>
              <p className="eyebrow">Book a cook</p>
              <h1 id="wizard-title">Plan your occasion</h1>
              {showResumed && (
                <p className="notice">
                  <Icon name="info" />
                  <span>
                    We kept your unfinished booking.{' '}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>Start over</button>
                  </span>
                </p>
              )}
            </div>

            <Progress steps={STEPS} current={step} maxStep={maxStep} onGoto={tryGoTo} />

            <form className="card step-panel" noValidate onSubmit={(event) => { event.preventDefault(); next(); }}>
              {panels[step]}
              {error && <div className="step-error" role="alert">{error}</div>}
              <div className="wizard-nav">
                {step > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => goTo(step - 1)}>
                    <Icon name="arrowLeft" />Back
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {step === LAST
                    ? (busy ? 'Sending…' : <>Request booking <Icon name="check" /></>)
                    : <>Continue <Icon name="arrowRight" /></>}
                </button>
              </div>
            </form>
          </section>

          <Summary state={state} catalog={catalog} estimate={estimate} />
        </div>
      </div>

      <MobileBar estimate={estimate} hasDishes={state.dishes.length > 0} showBack={step > 0}
        onBack={() => goTo(step - 1)} onNext={next} busy={busy}
        nextLabel={step === LAST ? 'Request booking' : 'Continue'} />
    </main>
  );
}
