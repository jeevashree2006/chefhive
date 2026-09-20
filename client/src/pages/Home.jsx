import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { bookableRange, formatDate, img, inr } from '../lib/format.js';
import { packageFrom } from '../lib/pricing.js';
import { config, whatsappLink } from '../config.js';

const FESTIVAL_STRIP = ['Onam Sadhya', 'Pongal', 'Ugadi', 'Ganesh Chaturthi', 'Durga Puja Bhog', 'Diwali',
  'Eid Dawat', 'Griha Pravesh', 'Naming Ceremony', 'Shraddh', 'Christmas Lunch', 'Vishu Sadya'];

/** Adds the "is-visible" class to .reveal elements as they scroll into view. */
function useReveal(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return undefined;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);
}

function QuickBook({ catalog }) {
  const navigate = useNavigate();
  const range = bookableRange(catalog.settings);
  const [form, setForm] = useState({ occasion: '', tradition: '', date: '', guests: 10 });
  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => { if (String(value).trim()) params.set(key, value); });
    navigate(`/book${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form className="card quick-book" onSubmit={submit} aria-label="Start a booking">
      <div className="field">
        <label htmlFor="qb-occasion">Occasion</label>
        <select className="select" id="qb-occasion" value={form.occasion} onChange={update('occasion')}>
          <option value="">Choose occasion</option>
          {catalog.occasions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="qb-tradition">Food tradition</label>
        <select className="select" id="qb-tradition" value={form.tradition} onChange={update('tradition')}>
          <option value="">Any tradition</option>
          {catalog.traditions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="qb-date">Date</label>
        <input className="input" id="qb-date" type="date" min={range.min} max={range.max} value={form.date} onChange={update('date')} />
      </div>
      <div className="field">
        <label htmlFor="qb-guests">Guests</label>
        <input className="input" id="qb-guests" type="number" inputMode="numeric"
          min={catalog.settings.minGuests} max={catalog.settings.maxGuests} value={form.guests} onChange={update('guests')} />
      </div>
      <button className="btn btn-primary btn-lg" type="submit">See menu &amp; price <Icon name="arrowRight" /></button>
      <p className="quick-book-note">
        Takes about 2 minutes &middot; Pay {catalog.settings.advancePercent}% only when your cook is confirmed
      </p>
    </form>
  );
}

export default function Home() {
  const { catalog } = useCatalog();
  useReveal(Boolean(catalog));
  const { images, settings } = catalog;
  const wa = whatsappLink(`Hi ${config.brand}, I'd like to book a cook.`);

  return (
    <main id="main">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Traditional cooks for every occasion</p>
            <h1 id="hero-title">The taste of <em>tradition</em>, cooked in your kitchen.</h1>
            <p className="lead">
              Book cooks who specialise in regional Indian food, from Kerala sadhya to Rajasthani dal baati,
              for poojas, festivals and family functions.
            </p>
            <QuickBook catalog={catalog} />
            <ul className="trust-row">
              <li><Icon name="shield" />Background-checked cooks</li>
              <li><Icon name="leaf" />Satvik &amp; Jain menus</li>
              <li><Icon name="rupee" />Price shown upfront</li>
            </ul>
          </div>
          <div className="hero-media">
            <div className="hero-main">
              <img src={img(images.hero, 900, 1125)} width="900" height="1125" fetchpriority="high"
                alt="A traditional South Indian meal served on a banana leaf" />
            </div>
            <div className="hero-side one">
              <img src={img(images.heroSide1, 400, 400)} width="400" height="400" loading="lazy" alt="A festive thali decorated with flowers" />
            </div>
            <div className="hero-side two">
              <img src={img(images.heroSide2, 400, 400)} width="400" height="400" loading="lazy" alt="A lit diya beside festival food" />
            </div>
            <div className="hero-tag">
              <span className="hex-icon"><Icon name="leaf" /></span>
              <div><strong>Onam Sadhya</strong><span>20 dishes on banana leaf, served in order</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Festival strip */}
      <div className="marquee" aria-label="Festivals and occasions we cook for">
        <div className="marquee-track">
          <ul>{FESTIVAL_STRIP.map((f) => <li key={f}>{f}</li>)}</ul>
          <ul aria-hidden="true">{FESTIVAL_STRIP.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      </div>

      {/* Occasions */}
      <section className="section" id="occasions" aria-labelledby="occasions-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Occasions</p>
            <h2 id="occasions-title">Cooks for the days that matter</h2>
            <p className="lead">Every occasion has its own food rules. Tell us which one it is and we send a cook who already knows them.</p>
          </div>
          <div className="occasion-grid">
            {catalog.occasions.map((o) => (
              <Link className="card occasion-card reveal" key={o.id} to={`/book?occasion=${encodeURIComponent(o.id)}`}>
                <span className="hex-icon"><Icon name={o.icon} /></span>
                <h3>{o.name}</h3>
                <p>{o.desc}</p>
                <span className="more-link">Plan this <Icon name="arrowRight" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why ChefHive */}
      <section className="section section-alt" id="why" aria-labelledby="why-title">
        <div className="container split">
          <figure className="split-media reveal">
            <img src={img(images.usp, 800, 1000)} width="800" height="1000" loading="lazy"
              alt="A hand serving from a table full of home-cooked Indian dishes" />
            <figcaption>
              &ldquo;Make the kalan the way my mother did, with a little extra pepper.&rdquo; That&apos;s the kind of request our cooks expect.
            </figcaption>
          </figure>
          <div>
            <p className="eyebrow">Why ChefHive</p>
            <h2 id="why-title">Any cook can make dinner. A tradition needs a specialist.</h2>
            <p className="lead">
              A proper sadhya has 20 dishes served in a set order. A pooja lunch can&apos;t touch onion or garlic.
              Your family&apos;s kadhi has a secret. That&apos;s why we send someone who grew up with your food.
            </p>
            <div className="feature-grid">
              <div className="feature">
                <span className="hex-icon"><Icon name="pin" /></span>
                <div><h3>Regional specialists</h3><p>Cooks are listed by the traditions they grew up cooking, not just &ldquo;North&rdquo; or &ldquo;South Indian&rdquo;.</p></div>
              </div>
              <div className="feature">
                <span className="hex-icon"><Icon name="diya" /></span>
                <div><h3>Ritual-ready</h3><p>Satvik, Jain, fasting food and naivedyam, cooked the way the occasion requires.</p></div>
              </div>
              <div className="feature">
                <span className="hex-icon"><Icon name="book" /></span>
                <div><h3>Your family&apos;s recipe</h3><p>Tell us how your family makes it. Your cook follows your way, not a restaurant&apos;s.</p></div>
              </div>
              <div className="feature">
                <span className="hex-icon"><Icon name="users" /></span>
                <div><h3>Right-sized teams</h3><p>From 6 guests at home to {settings.maxGuests} at a function, with helpers and serving staff.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traditions */}
      <section className="section" id="traditions" aria-labelledby="traditions-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Food traditions</p>
            <h2 id="traditions-title">{catalog.traditions.length} regional kitchens, one booking</h2>
            <p className="lead">Pick the cuisine you grew up with. Each one has its own specialist cooks and full menu.</p>
          </div>
          <div className="tradition-grid">
            {catalog.traditions.map((t) => (
              <Link className="card tradition-card reveal" key={t.id} to={`/book?tradition=${encodeURIComponent(t.id)}`}
                style={{ '--accent': t.accent }}>
                <span className="region">{t.region}</span>
                <h3>{t.name}</h3>
                <p className="signature">{t.signature}</p>
                <span className="more-link">See {t.dishes.length} dishes <Icon name="arrowRight" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Occasion menus */}
      <section className="section section-alt" id="menus" aria-labelledby="menus-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Occasion menus</p>
            <h2 id="menus-title">Festival menus, ready to book</h2>
            <p className="lead">Start from a menu that specialist cooks already make for these days. You can add or remove dishes before booking.</p>
          </div>
          <div className="package-grid">
            {catalog.packages.map((p) => {
              const tradition = catalog.traditions.find((t) => t.id === p.tradition);
              const occasion = catalog.occasions.find((o) => o.id === p.occasion);
              return (
                <article className="card package-card reveal" key={p.id}>
                  <div className="package-media">
                    <img src={img(p.image, 640, 400)} width="640" height="400" loading="lazy" alt={`${p.name} spread`} />
                    <span className="badge">{p.festival || occasion?.name}</span>
                  </div>
                  <div className="package-body">
                    <h3>{p.name}</h3>
                    <div className="package-meta">
                      <span><Icon name="pin" />{tradition?.name}</span>
                      <span><Icon name="utensils" />{p.dishes.length} dishes</span>
                      <span><Icon name="users" />{p.minGuests}+ guests</span>
                    </div>
                    <p>{p.blurb}</p>
                    <div className="package-foot">
                      <div className="price-from">Cook fee from<strong>{inr(packageFrom(catalog, p))}</strong></div>
                      <Link className="btn btn-primary btn-sm" to={`/book?package=${encodeURIComponent(p.id)}`}
                        aria-label={`Book the ${p.name} menu`}>Book menu</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">How it works</p>
            <h2 id="how-title">From &ldquo;we&apos;re hosting&rdquo; to a full leaf in 4 steps</h2>
          </div>
          <ol className="steps">
            <li className="card step-card reveal"><span className="step-num">1</span><h3>Tell us the occasion</h3>
              <p>Pick the occasion, your food tradition, the date and how many guests.</p></li>
            <li className="card step-card reveal"><span className="step-num">2</span><h3>Choose the menu</h3>
              <p>Pick dishes one by one, or start from an occasion menu and adjust it.</p></li>
            <li className="card step-card reveal"><span className="step-num">3</span><h3>Get your cook</h3>
              <p>We match a specialist and confirm by phone. Pay {settings.advancePercent}% to lock the date.</p></li>
            <li className="card step-card reveal"><span className="step-num">4</span><h3>Enjoy the feast</h3>
              <p>Your cook arrives 2&ndash;3 hours early, cooks in your kitchen and leaves the cooking area clean.</p></li>
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="section section-alt" id="pricing" aria-labelledby="pricing-title">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Pricing</p>
            <h2 id="pricing-title">Know the price before you book</h2>
            <p className="lead">You pay for the cook&apos;s time and skill. The exact price is worked out from your guests and dishes as you book.</p>
          </div>
          <div className="level-grid">
            {catalog.levels.map((l) => (
              <article className={`card level-card reveal${l.popular ? ' is-popular' : ''}`} key={l.id}>
                {l.popular && <span className="badge popular-tag">Best for occasions</span>}
                <h3>{l.name}</h3>
                <p className="tagline">{l.tagline}</p>
                <div className="level-price">{inr(l.base)} <small>onwards</small></div>
                <p className="level-rates">
                  Covers {l.includedGuests} guests and {l.includedDishes} dishes, then {inr(l.perGuest)} per guest and {inr(l.perDish)} per dish.
                </p>
                <ul className="check-list">{l.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <Link className={`btn ${l.popular ? 'btn-primary' : 'btn-secondary'}`} to={`/book?level=${encodeURIComponent(l.id)}`}>
                  Book a {l.name}
                </Link>
              </article>
            ))}
          </div>
          <div className="notice pricing-note">
            <Icon name="info" />
            <p style={{ margin: 0 }}>
              Prices are the cook&apos;s fee. Ingredients are extra: buy them yourself or let us shop at actual cost. Peak festival dates can cost more.
            </p>
          </div>

          <div className="section-head" style={{ marginTop: 'clamp(48px, 7vw, 88px)' }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>The right team for your guest count</h3>
          </div>
          <div className="size-grid">
            <div className="card size-card reveal"><div className="range">2&ndash;12 <small>guests</small></div>
              <h3>One cook</h3><p>Family meals, small poojas, birthdays at home.</p></div>
            <div className="card size-card reveal"><div className="range">13&ndash;40 <small>guests</small></div>
              <h3>Specialist + helper</h3><p>Griha pravesh, naming ceremonies, festival lunches.</p></div>
            <div className="card size-card reveal"><div className="range">41&ndash;{settings.maxGuests} <small>guests</small></div>
              <h3>Master cook + team</h3><p>Full sadhya, wedding functions, community pujas.</p></div>
            <div className="card size-card reveal"><div className="range">{settings.maxGuests}+ <small>guests</small></div>
              <h3>Custom team</h3><p>Talk to us and we&apos;ll plan cooks, helpers and serving staff.</p></div>
          </div>

          <div className="included">
            <div className="card">
              <h3><span className="hex-icon" style={{ width: 40, height: 44 }}><Icon name="chef" /></span>Your cook will</h3>
              <ul className="check-list">
                <li>Plan quantities and send a shopping list 2 days before</li>
                <li>Arrive 2&ndash;3 hours before serving time</li>
                <li>Cook everything fresh in your kitchen</li>
                <li>Serve the first round in the traditional order, if you&apos;d like</li>
                <li>Leave the cooking area clean</li>
              </ul>
            </div>
            <div className="card">
              <h3><span className="hex-icon" style={{ width: 40, height: 44 }}><Icon name="home" /></span>You arrange</h3>
              <ul className="check-list">
                <li>Ingredients, or add our shopping service</li>
                <li>Gas and basic vessels (tell us if you need large ones)</li>
                <li>Plates or banana leaves, or add leaves when booking</li>
                <li>Helpers or serving staff for big groups, if you want them</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Join as a cook */}
      <section className="section" aria-labelledby="partner-title">
        <div className="container">
          <div className="partner-band">
            <div>
              <p className="eyebrow">For cooks</p>
              <h2 id="partner-title">Are you a traditional cook?</h2>
              <p>
                Whether you&apos;ve cooked temple-style sadhya for 30 years or your family&apos;s Chettinad recipes at every wedding,
                get booked for the occasions you know best.
              </p>
              <ul className="check-list">
                <li>Choose the days and areas you work in</li>
                <li>Get paid on time, every time</li>
                <li>Build your name with reviews from real families</li>
              </ul>
            </div>
            <div className="partner-actions">
              <Link className="btn btn-light btn-lg" to="/partner">Join as a cook <Icon name="arrowRight" /></Link>
              <p className="small" style={{ margin: 0 }}>It takes 3 minutes. We call you within 2 working days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title">Before you book</h2>
          </div>
          <div className="faq">
            <details>
              <summary>What makes a ChefHive cook a &ldquo;tradition specialist&rdquo;?</summary>
              <p>They grew up cooking the cuisine and have cooked it for real occasions such as weddings, festivals and poojas,
                not just in restaurant kitchens. Every cook is interviewed, reference-checked and taste-tested before they are listed.</p>
            </details>
            <details>
              <summary>Can the cook follow satvik, Jain or no-onion-garlic rules?</summary>
              <p>Yes. Choose Satvik or Jain when you book and the cook plans the whole menu around it.
                Tell us about any fasting or pooja timing rules in the notes.</p>
            </details>
            <details>
              <summary>Who buys the ingredients?</summary>
              <p>Your cook shares a shopping list two days before the event. Buy everything yourself, or add our shopping service
                and we buy fresh on the morning of the event and bill you the actual cost.</p>
            </details>
            <details>
              <summary>How early should I book?</summary>
              <p>At least {settings.minNoticeDays} days ahead. For big festival dates like Onam, Ganesh Chaturthi, Durga Puja and Diwali,
                book 2 to 3 weeks early because specialist cooks get booked out.</p>
            </details>
            <details>
              <summary>How does payment work?</summary>
              <p>You pay a {settings.advancePercent}% advance to confirm the cook and the balance after the meal is served.
                The price shown before booking is the cook&apos;s fee; ingredients are extra.</p>
            </details>
            <details>
              <summary>Do cooks bring helpers or serving staff?</summary>
              <p>For more than {settings.guestsPerHelper} guests we suggest a kitchen helper, and you can add serving staff who serve
                leaf or thali style in the traditional order. Master Cooks bring their own team for large functions.</p>
            </details>
            <details>
              <summary>Which cities do you serve?</summary>
              <p>We&apos;re starting in {catalog.cities.slice(0, -1).join(', ')} and {catalog.cities[catalog.cities.length - 1]}.
                More cities are coming soon.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band">
            <h2 id="cta-title">Your next occasion deserves the real taste.</h2>
            <p>Tell us the occasion and the tradition. We&apos;ll bring the cook who knows it by heart.</p>
            <div className="cta-actions">
              <Link className="btn btn-light btn-lg" to="/book">Book a cook <Icon name="arrowRight" /></Link>
              {wa && (
                <a className="btn btn-secondary btn-lg" href={wa} target="_blank" rel="noopener">
                  <Icon name="chat" />Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
