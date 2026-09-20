import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CatalogGate, Footer, Header } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Partner from './pages/Partner.jsx';

/** Scrolls to the top on navigation, or to the section named in the hash. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <ScrollManager />
      <CatalogGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CatalogGate>
      <Footer />
    </>
  );
}
