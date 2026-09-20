/* "Join as a cook" application form. */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Chip, FieldError } from '../components/booking/Bits.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { ApiError, applyAsCook } from '../api.js';
import { img } from '../lib/format.js';

const EXPERIENCE = ['Less than 5 years', '5–10 years', '10–20 years', 'More than 20 years'];
const GROUPS = ['Up to 15 guests', '16–40 guests', '41–100 guests', 'More than 100 guests'];
const TEAMS = ['I cook alone', 'I have 1–2 helpers', 'I have a full team'];
const RULES = ['Satvik (no onion, no garlic)', 'Jain', 'Non-vegetarian'];

const PHONE = /^[6-9]\d{9}$/;
const URL_LIKE = /^https?:\/\/\S+\.\S+/;

const normalisePhone = (value) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const EMPTY = {
  name: '', phone: '', city: '', area: '', experience: '',
  traditions: [], signatureDishes: '', occasions: [], foodRules: [],
  largestGroup: GROUPS[0], team: TEAMS[0], languages: '', link: '', consent: false,
};

export default function Partner() {
  const { catalog } = useCatalog();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const doneHeading = useRef(null);

  useEffect(() => { if (done) doneHeading.current?.focus(); }, [done]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: '' } : e));
  };
  const toggle = (field, value) => setForm((f) => ({
    ...f,
    [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
  }));

  const validate = () => {
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your name.';
    if (!PHONE.test(normalisePhone(form.phone))) found.phone = 'Enter a 10-digit Indian mobile number.';
    if (!form.city) found.city = 'Choose your city.';
    if (!form.experience) found.experience = 'Choose your experience.';
    if (!form.traditions.length) found.traditions = 'Pick at least one tradition.';
    if (form.signatureDishes.trim().length < 3) found.signatureDishes = 'Tell us a few dishes you are known for.';
    if (form.link.trim() && !URL_LIKE.test(form.link.trim())) found.link = 'Enter a full link starting with https://';
    if (!form.consent) found.consent = 'Please allow us to contact you.';
    return found;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    const found = validate();
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      setMessage('Please fix the highlighted details.');
      document.getElementById(`p-${firstBad}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const response = await applyAsCook({ ...form, phone: normalisePhone(form.phone) });
      setDone(response);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
        setMessage('Please fix the highlighted details.');
      } else {
        setMessage(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const field = (id, label, extra = {}) => (
    <div className="field">
      <label htmlFor={`p-${id}`}>{label}</label>
      <input className="input" id={`p-${id}`} value={form[id]} onChange={(e) => set(id, e.target.value)}
        aria-invalid={errors[id] ? 'true' : undefined} aria-describedby={errors[id] ? `err-${id}` : undefined} {...extra} />
      <FieldError id={`err-${id}`} message={errors[id]} />
    </div>
  );

  return (
    <main id="main" className="booking-page">
      <div className="container partner-layout">
        <div className="partner-aside">
          <p className="eyebrow">For cooks</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Cook the food you grew up with, for families who want it.</h1>
          <p className="lead">
            ChefHive books cooks by tradition. If you know your cuisine&apos;s festival and pooja food by heart, families are looking for you.
          </p>
          <ul className="check-list">
            <li>Get booked for festivals, poojas and functions in your own cuisine</li>
            <li>Choose the days and areas you work in</li>
            <li>A clear fee for every booking, paid on time</li>
            <li>We handle the customer calls, menus and payments</li>
          </ul>
          <figure>
            <img src={img(catalog.images.partner, 800, 600)} width="800" height="600" loading="lazy"
              alt="Several traditional thalis with rice, curries and sweets" />
          </figure>
          <h2 style={{ fontSize: '1.25rem', marginTop: 28 }}>How joining works</h2>
          <ol className="small" style={{ paddingLeft: 20, display: 'grid', gap: 6, margin: 0 }}>
            <li>Fill in this form (about 3 minutes)</li>
            <li>We call you within 2 working days</li>
            <li>Cook a few of your dishes for our taste test</li>
            <li>Start getting bookings in your area</li>
          </ol>
        </div>

        <div>
          {done ? (
            <section className="card confirmation" aria-labelledby="p-done-title">
              <span className="hex-icon"><Icon name="check" /></span>
              <h2 id="p-done-title" ref={doneHeading} tabIndex={-1}>Thank you, application received</h2>
              <p className="lead">Your reference number</p>
              <div className="ref-code">{done.ref}</div>
              <p>We&apos;ll call you within 2 working days to talk about your cooking and set up a taste test.</p>
              <div className="confirm-actions"><Link className="btn btn-secondary" to="/">Back to home</Link></div>
            </section>
          ) : (
            <form className="card partner-form" noValidate onSubmit={submit}>
              <h2 style={{ marginTop: 0 }}>About you</h2>
              <div className="form-grid group">
                {field('name', 'Full name', { autoComplete: 'name', required: true })}
                {field('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel-national', placeholder: '10-digit mobile', required: true })}
                <div className="field">
                  <label htmlFor="p-city">City</label>
                  <select className="select" id="p-city" value={form.city} onChange={(e) => set('city', e.target.value)}
                    aria-invalid={errors.city ? 'true' : undefined} required>
                    <option value="">Choose your city</option>
                    {catalog.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FieldError id="err-city" message={errors.city} />
                </div>
                {field('area', 'Area / locality', { autoComplete: 'address-level3' })}
                <div className="field span-2">
                  <label htmlFor="p-experience">Years of cooking for occasions</label>
                  <select className="select" id="p-experience" value={form.experience} onChange={(e) => set('experience', e.target.value)}
                    aria-invalid={errors.experience ? 'true' : undefined} required>
                    <option value="">Choose</option>
                    {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <FieldError id="err-experience" message={errors.experience} />
                </div>
              </div>

              <h2>Your cooking</h2>
              <fieldset className="group">
                <legend>Traditions you cook</legend>
                <p className="group-hint">Pick the cuisines you grew up with or have cooked for functions.</p>
                <div className="chips">
                  {catalog.traditions.map((t) => (
                    <Chip key={t.id} type="checkbox" name="traditions" value={t.name} label={t.name}
                      checked={form.traditions.includes(t.name)} onChange={() => toggle('traditions', t.name)} />
                  ))}
                </div>
                <FieldError id="err-traditions" message={errors.traditions} />
              </fieldset>

              <div className="field group">
                <label htmlFor="p-signatureDishes">Your signature dishes</label>
                <textarea className="textarea" id="p-signatureDishes" value={form.signatureDishes}
                  placeholder="e.g. Sadhya with 24 items, ada pradhaman, Kerala fish curry"
                  aria-invalid={errors.signatureDishes ? 'true' : undefined}
                  onChange={(e) => set('signatureDishes', e.target.value)} required />
                <FieldError id="err-signatureDishes" message={errors.signatureDishes} />
              </div>

              <fieldset className="group">
                <legend>Occasions you&apos;ve cooked for</legend>
                <div className="chips">
                  {catalog.occasions.filter((o) => o.id !== 'other').map((o) => (
                    <Chip key={o.id} type="checkbox" name="occasions" value={o.name} label={o.name}
                      checked={form.occasions.includes(o.name)} onChange={() => toggle('occasions', o.name)} />
                  ))}
                </div>
              </fieldset>

              <fieldset className="group">
                <legend>Food rules you can follow</legend>
                <div className="chips">
                  {RULES.map((rule) => (
                    <Chip key={rule} type="checkbox" name="foodRules" value={rule} label={rule}
                      checked={form.foodRules.includes(rule)} onChange={() => toggle('foodRules', rule)} />
                  ))}
                </div>
              </fieldset>

              <div className="form-grid group">
                <div className="field">
                  <label htmlFor="p-largestGroup">Largest group you&apos;ve cooked for</label>
                  <select className="select" id="p-largestGroup" value={form.largestGroup} onChange={(e) => set('largestGroup', e.target.value)}>
                    {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="p-team">Do you work with helpers?</label>
                  <select className="select" id="p-team" value={form.team} onChange={(e) => set('team', e.target.value)}>
                    {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {field('languages', 'Languages you speak', { placeholder: 'e.g. Malayalam, Tamil, English' })}
                {field('link', 'Photos or videos of your food (optional)', { type: 'url', inputMode: 'url', placeholder: 'Instagram, YouTube or Drive link' })}
                <label className="check span-2">
                  <input type="checkbox" id="p-consent" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} required />
                  <span>ChefHive can call or WhatsApp me about joining.</span>
                </label>
                <FieldError id="err-consent" message={errors.consent} />
              </div>

              {message && <div className="step-error" role="alert">{message}</div>}
              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy} style={{ marginTop: 20 }}>
                {busy ? 'Sending…' : <>Send application <Icon name="arrowRight" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
