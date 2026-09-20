import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';
import './styles/base.css';
import './styles/home.css';
import './styles/booking.css';

// The stylesheet only hides scroll-reveal content when JavaScript is running.
document.documentElement.classList.add('js');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
