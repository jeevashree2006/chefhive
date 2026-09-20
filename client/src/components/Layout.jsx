/* Shared page chrome: header with navigation, footer, and the loading and error states for the catalogue. */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { config, whatsappLink } from '../config.js';
import { useCatalog } from '../context/CatalogContext.jsx';

const NAV = [
  { to: '/#occasions', label: 'Occasions' },
  { to: '/#traditions', label: 'Traditions' },
  { to: '/#menus', label: 'Occasion menus' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/partner', label: 'Join as a cook' },
];

function Logo() {
  return (
    <>
      <img src="/logo.svg" alt="" width="38" height="38" />
      <span className="wordmark">Chef<span>Hive</span></span>
    </>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container header-inner">
        <Link className="logo" to="/" aria-label="ChefHive home"><Logo /></Link>
        <nav className="site-nav" id="site-nav" aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                {item.to.startsWith('/#')
                  ? <Link to={item.to}>{item.label}</Link>
                  : <NavLink to={item.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>{item.label}</NavLink>}
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          {config.phoneLink && (
            <a className="header-phone" href={`tel:${config.phoneLink}`}><Icon name="phone" />{config.phoneDisplay}</a>
          )}
          <Link className="btn btn-primary btn-sm" to="/book">Book a cook</Link>
          <button className="nav-toggle" type="button" aria-controls="site-nav" aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { catalog } = useCatalog();
  const wa = whatsappLink(`Hi ${config.brand}, I'd like to book a cook.`);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="logo" to="/"><Logo /></Link>
            <p>Traditional cooks for poojas, festivals and family functions, booked in minutes.</p>
          </div>
          <div>
            <h2>Book</h2>
            <ul>
              <li><Link to="/book">Book a cook</Link></li>
              <li><Link to="/#menus">Occasion menus</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h2>ChefHive</h2>
            <ul>
              <li><Link to="/#how">How it works</Link></li>
              <li><Link to="/#why">Why ChefHive</Link></li>
              <li><Link to="/partner">Join as a cook</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h2>Contact</h2>
            <ul>
              {config.phoneLink && <li><a href={`tel:${config.phoneLink}`}><Icon name="phone" />{config.phoneDisplay}</a></li>}
              <li><a href={`mailto:${config.email}`}><Icon name="mail" />{config.email}</a></li>
              {wa && <li><a href={wa} target="_blank" rel="noopener"><Icon name="chat" />WhatsApp</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} ChefHive</span>
          <span>{(catalog?.cities || []).join(' · ')}</span>
        </div>
      </div>
    </footer>
  );
}

/** Shown while the catalogue loads, or if the API is unreachable. */
export function CatalogGate({ children }) {
  const { catalog, error, reload } = useCatalog();
  if (error) {
    return (
      <main id="main" className="booking-page">
        <div className="container">
          <div className="card step-panel" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
            <h1 className="step-title">We can&apos;t load the menus right now</h1>
            <p className="step-sub">{error.message}</p>
            <p className="small muted">
              Start the API with <code>npm run dev</code> in the <code>server</code> folder, and make sure MySQL is running.
            </p>
            <button className="btn btn-primary" type="button" onClick={reload}>Try again</button>
          </div>
        </div>
      </main>
    );
  }
  if (!catalog) {
    return (
      <main id="main" className="booking-page">
        <div className="container">
          <p className="muted" style={{ padding: '60px 0', textAlign: 'center' }}>Loading ChefHive&hellip;</p>
        </div>
      </main>
    );
  }
  return children;
}
