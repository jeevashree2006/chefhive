/*
 * Loads everything the booking form needs (occasions, traditions, dishes, packages, prices)
 * from MySQL and keeps it in memory for a short while, since it changes rarely.
 */
import { query } from './db.js';

const TTL_MS = 60_000;
let cache = null;
let cachedAt = 0;

const hhmm = (time) => String(time).slice(0, 5);

export const loadCatalog = async ({ force = false } = {}) => {
  if (!force && cache && Date.now() - cachedAt < TTL_MS) return cache;

  const [settingRows, cityRows, occasionRows, festivalRows, styleRows, spiceRows, mealRows, kitchenRows,
    levelRows, addonRows, courseRows, traditionRows, dishRows, packageRows, packageDishRows] = await Promise.all([
    query('SELECT name, value FROM settings'),
    query('SELECT name FROM cities WHERE is_active = 1 ORDER BY sort_order, name'),
    query('SELECT id, name, icon, description, is_ritual FROM occasions ORDER BY sort_order'),
    query('SELECT name FROM festivals ORDER BY sort_order'),
    query('SELECT id, name FROM food_styles ORDER BY sort_order'),
    query('SELECT id, name FROM spice_levels ORDER BY sort_order'),
    query('SELECT id, name, from_time, to_time FROM meals ORDER BY sort_order'),
    query('SELECT id, name, description, comfortable_dishes FROM kitchens ORDER BY sort_order'),
    query('SELECT * FROM cook_levels ORDER BY sort_order'),
    query('SELECT * FROM addons ORDER BY sort_order'),
    query('SELECT id, name FROM courses ORDER BY sort_order'),
    query('SELECT * FROM traditions ORDER BY sort_order'),
    query('SELECT id, tradition_id, name, course, is_nonveg, needs_onion_garlic, has_root_veg FROM dishes ORDER BY tradition_id, sort_order'),
    query('SELECT * FROM packages ORDER BY sort_order'),
    query('SELECT package_id, dish_id FROM package_dishes ORDER BY package_id, sort_order'),
  ]);

  const settings = {};
  settingRows.forEach(({ name, value }) => {
    settings[name] = /^-?\d+$/.test(value) ? Number(value) : value;
  });

  const traditions = traditionRows.map((t) => ({
    id: t.id, name: t.name, region: t.region, signature: t.signature, blurb: t.blurb, accent: t.accent, dishes: [],
  }));
  const traditionById = new Map(traditions.map((t) => [t.id, t]));
  const dishById = new Map();
  dishRows.forEach((d) => {
    const dish = {
      id: d.id,
      traditionId: d.tradition_id,
      name: d.name,
      course: d.course,
      nonveg: Boolean(d.is_nonveg),
      onionGarlic: Boolean(d.needs_onion_garlic),
      root: Boolean(d.has_root_veg),
    };
    dishById.set(dish.id, dish);
    traditionById.get(d.tradition_id)?.dishes.push(dish);
  });

  const dishesByPackage = new Map();
  packageDishRows.forEach(({ package_id: id, dish_id: dishId }) => {
    if (!dishesByPackage.has(id)) dishesByPackage.set(id, []);
    dishesByPackage.get(id).push(dishId);
  });

  cache = {
    settings: {
      advancePercent: settings.advance_percent ?? 10,
      minNoticeDays: settings.min_notice_days ?? 2,
      maxAdvanceDays: settings.max_advance_days ?? 120,
      guestsPerHelper: settings.guests_per_helper ?? 20,
      minDishes: settings.min_dishes ?? 3,
      minGuests: settings.min_guests ?? 2,
      maxGuests: settings.max_guests ?? 150,
    },
    images: {
      hero: settings.image_hero,
      heroSide1: settings.image_hero_side1,
      heroSide2: settings.image_hero_side2,
      usp: settings.image_usp,
      partner: settings.image_partner,
    },
    cities: cityRows.map((c) => c.name),
    occasions: occasionRows.map((o) => ({ id: o.id, name: o.name, icon: o.icon, desc: o.description, isRitual: Boolean(o.is_ritual) })),
    festivals: festivalRows.map((f) => f.name),
    foodStyles: styleRows,
    spiceLevels: spiceRows,
    meals: mealRows.map((m) => ({ id: m.id, name: m.name, from: hhmm(m.from_time), to: hhmm(m.to_time) })),
    kitchens: kitchenRows.map((k) => ({ id: k.id, name: k.name, desc: k.description, comfortableDishes: k.comfortable_dishes })),
    levels: levelRows.map((l) => ({
      id: l.id, name: l.name, tagline: l.tagline, base: l.base_fee,
      includedGuests: l.included_guests, includedDishes: l.included_dishes,
      perGuest: l.per_guest, perDish: l.per_dish, maxGuests: l.max_guests, maxDishes: l.max_dishes,
      popular: Boolean(l.is_popular), points: typeof l.points === 'string' ? JSON.parse(l.points) : l.points,
    })),
    addons: addonRows.map((a) => ({
      id: a.id, name: a.name, desc: a.description, price: a.price, perGuest: a.per_guest_price, unit: a.unit, max: a.max_qty,
    })),
    courses: courseRows,
    traditions,
    packages: packageRows.map((p) => ({
      id: p.id, name: p.name, tradition: p.tradition_id, occasion: p.occasion_id, festival: p.festival,
      style: p.food_style, level: p.level_id, minGuests: p.min_guests, image: p.image, blurb: p.blurb,
      dishes: dishesByPackage.get(p.id) || [],
    })),
  };
  cache.dishById = dishById;
  cachedAt = Date.now();
  return cache;
};

/** The catalogue as sent to the browser (the lookup Map is dropped). */
export const publicCatalog = (catalog) => {
  const { dishById, ...rest } = catalog;
  return rest;
};

export const clearCatalogCache = () => { cache = null; };

/** Which dishes a food style allows. Mirrors the same rule in the browser. */
export const dishAllowed = (dish, style) => {
  if (!dish) return false;
  if (style !== 'nonveg' && dish.nonveg) return false;
  if ((style === 'satvik' || style === 'jain') && dish.onionGarlic) return false;
  if (style === 'jain' && dish.root) return false;
  return true;
};
