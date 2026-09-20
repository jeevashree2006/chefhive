/* Small building blocks shared by the booking steps. */
import Icon from '../Icon.jsx';
import { inr } from '../../lib/format.js';

/** A radio or checkbox styled as a card. The input stays a real input, so keyboard and screen readers work. */
export function ChoiceCard({
  type = 'radio', name, value, checked, disabled, onChange,
  title, desc, meta, icon, accent, className = '', extra, image,
}) {
  return (
    <label className={`choice ${className}`} style={accent ? { '--accent': accent } : undefined}>
      <input type={type} name={name} value={value} checked={checked} disabled={disabled} onChange={onChange} />
      <span className="choice-body">
        {image}
        <span>
          {meta && <span className="choice-meta">{meta}</span>}
          <span className="choice-title">{icon && <span className="hex-icon"><Icon name={icon} /></span>}{title}</span>
          {desc && <span className="choice-desc">{desc}</span>}
          {extra}
        </span>
      </span>
    </label>
  );
}

export function Chip({ type = 'radio', name, value, checked, onChange, label, disabled }) {
  return (
    <label className="chip">
      <input type={type} name={name} value={value} checked={checked} disabled={disabled} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

export function Progress({ steps, current, maxStep, onGoto }) {
  return (
    <ol className="progress" id="progress" aria-label="Booking steps">
      {steps.map((step, index) => (
        <li key={step.id} className={`${index < current ? 'is-done' : ''}${index === current ? ' is-current' : ''}`}>
          <button type="button" disabled={index > maxStep} aria-current={index === current ? 'step' : undefined}
            onClick={() => onGoto(index)}>
            <span className="label">{index + 1}. {step.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function PriceLines({ estimate, advancePercent, note }) {
  return (
    <>
      <div className="price-lines">
        {estimate.lines.map((line) => (
          <div className="price-line" key={line.key}>
            <span>{line.label}<small>{line.detail}</small></span>
            <span>{inr(line.amount)}</span>
          </div>
        ))}
      </div>
      <div className="price-total"><span>Estimated total</span><strong>{inr(estimate.total)}</strong></div>
      <p className="advance-line">Pay {inr(estimate.advance)} ({advancePercent}%) only after we confirm your cook</p>
      {note && <p className="summary-note">{note}</p>}
    </>
  );
}

export function NumberStepper({ id, value, min, max, onChange, labelledBy, decLabel = 'Decrease', incLabel = 'Increase' }) {
  return (
    <div className="stepper" role="group" aria-labelledby={labelledBy}>
      <button type="button" aria-label={decLabel} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Icon name="minus" />
      </button>
      <input id={id} type="number" inputMode="numeric" min={min} max={max} value={value}
        aria-labelledby={labelledBy}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        onBlur={(event) => onChange(Math.min(max, Math.max(min, Math.round(Number(event.target.value) || min))))} />
      <button type="button" aria-label={incLabel} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Icon name="plus" />
      </button>
    </div>
  );
}

export function DietMark({ nonveg }) {
  return <i className={`diet ${nonveg ? 'nonveg' : 'veg'}`} role="img" aria-label={nonveg ? 'non-veg' : 'veg'} />;
}

export function FieldError({ id, message }) {
  if (!message) return null;
  return <span className="field-error" id={id}>{message}</span>;
}
