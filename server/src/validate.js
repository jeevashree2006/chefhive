/* Server-side validation. The browser checks the same rules for quick feedback, but this is the one that counts. */
import { dishAllowed } from './catalog.js';
import { levelFits } from './pricing.js';

const PHONE = /^[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_LIKE = /^https?:\/\/\S+\.\S+/;

export const normalisePhone = (value) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const text = (value) => String(value ?? '').trim();

const dateOffset = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const validateBooking = (catalog, body = {}) => {
  const errors = {};
  const { settings } = catalog;

  const occasion = catalog.occasions.find((o) => o.id === body.occasionId);
  if (!occasion) errors.occasionId = 'Choose an occasion.';

  let festival = text(body.festival);
  if (occasion?.id === 'festival') {
    if (!catalog.festivals.includes(festival)) errors.festival = 'Choose which festival it is.';
  } else {
    festival = '';
  }

  const tradition = catalog.traditions.find((t) => t.id === body.traditionId);
  if (!tradition) errors.traditionId = 'Choose a food tradition.';

  const style = catalog.foodStyles.find((s) => s.id === body.foodStyle);
  if (!style) errors.foodStyle = 'Choose the food rules.';
  const spice = catalog.spiceLevels.find((s) => s.id === body.spice);
  if (!spice) errors.spice = 'Choose a spice level.';

  const maxDishes = Math.max(...catalog.levels.map((l) => l.maxDishes));
  const dishIds = Array.isArray(body.dishes) ? [...new Set(body.dishes.map(String))] : [];
  const dishes = [];
  if (dishIds.length < settings.minDishes) {
    errors.dishes = `Pick at least ${settings.minDishes} dishes.`;
  } else if (dishIds.length > maxDishes) {
    errors.dishes = `A cook's team can make up to ${maxDishes} dishes.`;
  } else if (tradition && style) {
    for (const id of dishIds) {
      const dish = catalog.dishById.get(id);
      if (!dish || dish.traditionId !== tradition.id) { errors.dishes = 'That menu has a dish we do not recognise.'; break; }
      if (!dishAllowed(dish, style.id)) { errors.dishes = `"${dish.name}" does not fit the chosen food rules.`; break; }
      dishes.push(dish);
    }
  }

  const pkg = body.packageId ? catalog.packages.find((p) => p.id === body.packageId) : null;
  if (body.packageId && !pkg) errors.packageId = 'Unknown occasion menu.';

  const city = text(body.city);
  if (!catalog.cities.includes(city)) errors.city = 'Choose a city we serve.';

  const eventDate = text(body.eventDate);
  if (!DATE.test(eventDate)) errors.eventDate = 'Choose the date of your occasion.';
  else if (eventDate < dateOffset(settings.minNoticeDays) || eventDate > dateOffset(settings.maxAdvanceDays)) {
    errors.eventDate = `Pick a date between ${settings.minNoticeDays} and ${settings.maxAdvanceDays} days from today.`;
  }

  const meal = catalog.meals.find((m) => m.id === body.meal);
  if (!meal) errors.meal = 'Choose a meal.';
  const readyBy = text(body.readyBy);
  if (!TIME.test(readyBy)) errors.readyBy = 'Choose a serving time.';
  else if (meal && (readyBy < meal.from || readyBy > meal.to)) errors.readyBy = `${meal.name} is served between ${meal.from} and ${meal.to}.`;

  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < settings.minGuests || guests > settings.maxGuests) {
    errors.guests = `Guests must be between ${settings.minGuests} and ${settings.maxGuests}.`;
  }

  const kitchen = catalog.kitchens.find((k) => k.id === body.kitchen);
  if (!kitchen) errors.kitchen = 'Choose your kitchen size.';

  const level = catalog.levels.find((l) => l.id === body.levelId);
  if (!level) errors.levelId = 'Choose a cook level.';
  else if (!errors.guests && !errors.dishes) {
    const fit = levelFits(level, guests, dishes.length);
    if (!fit.ok) errors.levelId = `That cook level handles ${fit.reason.toLowerCase()}.`;
  }

  const addons = {};
  const requested = body.addons && typeof body.addons === 'object' ? body.addons : {};
  for (const [id, value] of Object.entries(requested)) {
    const addon = catalog.addons.find((a) => a.id === id);
    if (!addon) { errors.addons = 'Unknown extra.'; break; }
    const qty = typeof value === 'boolean' ? (value ? 1 : 0) : Math.round(Number(value) || 0);
    if (qty < 0 || qty > addon.max) { errors.addons = `${addon.name}: choose between 0 and ${addon.max}.`; break; }
    if (qty) addons[id] = qty;
  }

  const name = text(body.name);
  if (name.length < 2) errors.name = 'Enter your name.';
  const phone = normalisePhone(body.phone);
  if (!PHONE.test(phone)) errors.phone = 'Enter a 10-digit Indian mobile number.';
  const email = text(body.email);
  if (email && !EMAIL.test(email)) errors.email = 'Check the email address.';
  const address = text(body.address);
  if (address.length < 5) errors.address = 'Enter your address or area.';
  const pincode = text(body.pincode);
  if (!PINCODE.test(pincode)) errors.pincode = 'Enter a 6-digit pincode.';
  if (body.consent !== true) errors.consent = 'We need your permission to contact you about this booking.';

  return {
    errors,
    clean: {
      occasionId: occasion?.id,
      festival: festival || null,
      traditionId: tradition?.id,
      foodStyle: style?.id,
      spice: spice?.id,
      packageId: pkg?.id || null,
      city,
      eventDate,
      meal: meal?.id,
      readyBy,
      guests,
      kitchen: kitchen?.id,
      levelId: level?.id,
      dishes,
      addons,
      name,
      phone,
      email: email || null,
      address,
      pincode,
      notes: text(body.notes).slice(0, 2000) || null,
    },
  };
};

export const validateCookApplication = (catalog, body = {}) => {
  const errors = {};
  const traditionNames = new Set(catalog.traditions.map((t) => t.name));
  const occasionNames = new Set(catalog.occasions.map((o) => o.name));

  const name = text(body.name);
  if (name.length < 2) errors.name = 'Enter your name.';
  const phone = normalisePhone(body.phone);
  if (!PHONE.test(phone)) errors.phone = 'Enter a 10-digit Indian mobile number.';
  const city = text(body.city);
  if (!catalog.cities.includes(city)) errors.city = 'Choose your city.';
  const experience = text(body.experience);
  if (!experience) errors.experience = 'Choose your experience.';

  const traditions = Array.isArray(body.traditions) ? body.traditions.map(text).filter((t) => traditionNames.has(t)) : [];
  if (!traditions.length) errors.traditions = 'Pick at least one tradition you cook.';

  const signatureDishes = text(body.signatureDishes);
  if (signatureDishes.length < 3) errors.signatureDishes = 'Tell us a few dishes you are known for.';

  const link = text(body.link);
  if (link && !URL_LIKE.test(link)) errors.link = 'Enter a full link starting with https://';
  if (body.consent !== true) errors.consent = 'We need your permission to contact you.';

  return {
    errors,
    clean: {
      name,
      phone,
      city,
      area: text(body.area) || null,
      experience,
      traditions,
      signatureDishes: signatureDishes.slice(0, 2000),
      occasions: Array.isArray(body.occasions) ? body.occasions.map(text).filter((o) => occasionNames.has(o)) : [],
      foodRules: Array.isArray(body.foodRules) ? body.foodRules.map(text).slice(0, 10) : [],
      largestGroup: text(body.largestGroup) || null,
      team: text(body.team) || null,
      languages: text(body.languages).slice(0, 160) || null,
      link: link || null,
    },
  };
};
