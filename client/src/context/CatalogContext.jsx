/* Loads the catalogue (occasions, traditions, dishes, menus, prices) from the API once and shares it. */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCatalog } from '../api.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getCatalog()
      .then((data) => { if (!cancelled) setCatalog(data); })
      .catch((err) => { if (!cancelled) setError(err); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const value = useMemo(() => {
    if (!catalog) return { catalog: null, error, loading: !error, reload: () => setReloadKey((k) => k + 1) };
    const dishById = new Map();
    catalog.traditions.forEach((t) => t.dishes.forEach((d) => dishById.set(d.id, d)));
    const find = {
      occasion: (id) => catalog.occasions.find((o) => o.id === id),
      tradition: (id) => catalog.traditions.find((t) => t.id === id),
      level: (id) => catalog.levels.find((l) => l.id === id),
      pkg: (id) => catalog.packages.find((p) => p.id === id),
      addon: (id) => catalog.addons.find((a) => a.id === id),
      meal: (id) => catalog.meals.find((m) => m.id === id),
      kitchen: (id) => catalog.kitchens.find((k) => k.id === id),
      style: (id) => catalog.foodStyles.find((s) => s.id === id),
      spice: (id) => catalog.spiceLevels.find((s) => s.id === id),
      dish: (id) => dishById.get(id),
    };
    return { catalog, error: null, loading: false, find, reload: () => setReloadKey((k) => k + 1) };
  }, [catalog, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return value;
};
