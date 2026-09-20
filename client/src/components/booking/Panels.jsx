/* Summary sidebar, the sticky price bar on phones, and the confirmation screen. */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import { PriceLines } from './Bits.jsx';
import { formatDate, formatTime, inr } from '../../lib/format.js';
import { config, whatsappLink } from '../../config.js';

export function Summary({ state, catalog, estimate }) {
  const find = (list, id) => list.find((x) => x.id === id);
  const occasion = find(catalog.occasions, state.occasion);
  const tradition = find(catalog.traditions, state.tradition);
  const style = find(catalog.foodStyles, state.style);
  const pkg = find(catalog.packages, state.packageId);
  const dash = <span className="muted">&ndash;</span>;

  const row = (label, value) => (
    <div key={label}><dt>{label}</dt><dd>{value || dash}</dd></div>
  );

  return (
    <aside className="card summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Your booking</h2>
      <dl className="summary-list">
        {row('Occasion', occasion ? `${occasion.name}${state.festival ? ` · ${state.festival}` : ''}` : '')}
        {row('Tradition', tradition ? `${tradition.name} · ${style?.name.split(' (')[0]}` : '')}
        {row('Menu', state.dishes.length ? `${state.dishes.length} dishes${pkg ? ` · ${pkg.name}` : ''}` : '')}
        {row('Guests', String(state.guests))}
        {row('When', state.date ? `${formatDate(state.date)}, ${formatTime(state.time)}` : '')}
        {row('Cook', estimate.level.name)}
      </dl>
      <PriceLines estimate={estimate} advancePercent={catalog.settings.advancePercent}
        note={`Cook's fee only. Ingredients are extra${state.addons.shopping ? ' and billed at actual cost' : ''}.`} />
    </aside>
  );
}

export function MobileBar({ estimate, hasDishes, showBack, onBack, onNext, nextLabel, busy }) {
  return (
    <div className="mobile-bar">
      {showBack && (
        <button type="button" className="btn btn-secondary btn-back" aria-label="Back" onClick={onBack}>
          <Icon name="arrowLeft" />
        </button>
      )}
      <div className="total">
        <small>Estimated cook fee</small>
        <strong>{hasDishes ? inr(estimate.total) : `from ${inr(estimate.total)}`}</strong>
      </div>
      <button type="button" className="btn btn-primary" onClick={onNext} disabled={busy}>
        {busy ? 'Sending…' : nextLabel}
      </button>
    </div>
  );
}

export function Confirmation({ result, state, catalog, onAnother }) {
  const heading = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, []);

  const occasion = catalog.occasions.find((o) => o.id === state.occasion);
  const tradition = catalog.traditions.find((t) => t.id === state.tradition);
  const dishNames = state.dishes
    .map((id) => catalog.traditions.flatMap((t) => t.dishes).find((d) => d.id === id)?.name)
    .filter(Boolean);

  const message = [
    `Booking request ${result.ref}`,
    `Occasion: ${occasion?.name}${state.festival ? ` (${state.festival})` : ''}`,
    `Food: ${tradition?.name}, ${catalog.foodStyles.find((s) => s.id === state.style)?.name}`,
    `Menu (${dishNames.length}): ${dishNames.join(', ')}`,
    `When: ${formatDate(state.date)}, ready by ${formatTime(state.time)}`,
    `Where: ${state.city} ${state.contact.pincode}`,
    `Guests: ${state.guests} · Cook: ${result.level?.name || ''}`,
    `Estimate: ${inr(result.estimate.total)} (advance ${inr(result.estimate.advance)})`,
    `Name: ${state.contact.name} · ${state.contact.phone}`,
    state.contact.notes ? `Notes: ${state.contact.notes}` : '',
  ].filter(Boolean).join('\n');
  const wa = whatsappLink(message);

  return (
    <section className="card confirmation" aria-labelledby="confirm-title">
      <span className="hex-icon"><Icon name="check" /></span>
      <h1 id="confirm-title" ref={heading} tabIndex={-1}>Booking request received</h1>
      <p className="lead">Your reference number</p>
      <div className="ref-code">{result.ref}</div>
      <p>
        {occasion?.name} on {formatDate(state.date)} for {state.guests} guests &middot; {tradition?.name} &middot;
        {' '}estimated cook fee {inr(result.estimate.total)}.
      </p>
      <div className="next-steps">
        <h2 style={{ fontSize: '1.15rem' }}>What happens next</h2>
        <ul className="check-list">
          <li>We call you to confirm the menu and match your specialist cook.</li>
          <li>You pay the {catalog.settings.advancePercent}% advance ({inr(result.estimate.advance)}) to lock the date.</li>
          <li>Your cook sends the shopping list 2 days before the event.</li>
        </ul>
      </div>
      <div className="confirm-actions">
        {wa && (
          <a className="btn btn-primary" href={wa} target="_blank" rel="noopener">
            <Icon name="chat" />Send details on WhatsApp
          </a>
        )}
        <button type="button" className="btn btn-secondary" onClick={onAnother}>Plan another occasion</button>
        <Link className="btn btn-ghost" to="/">Back to home</Link>
      </div>
    </section>
  );
}
