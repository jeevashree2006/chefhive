/*
 * The live estimate shown while booking. The server runs the same calculation again
 * before saving, so this is only for display.
 */

export const dishAllowed = (dish, style) => {
  if (!dish) return false;
  if (style !== 'nonveg' && dish.nonveg) return false;
  if ((style === 'satvik' || style === 'jain') && dish.onionGarlic) return false;
  if (style === 'jain' && dish.root) return false;
  return true;
};

export const levelFits = (level, guests, dishCount) => {
  if (guests > level.maxGuests) return { ok: false, reason: `Up to ${level.maxGuests} guests` };
  if (dishCount > level.maxDishes) return { ok: false, reason: `Up to ${level.maxDishes} dishes` };
  return { ok: true, reason: '' };
};

export const recommendLevel = (catalog, { guests = 0, dishes = 0, occasionId = '' }) => {
  const fitting = catalog.levels.filter((l) => levelFits(l, guests, dishes).ok);
  if (!fitting.length) return catalog.levels[catalog.levels.length - 1].id;
  const occasion = catalog.occasions.find((o) => o.id === occasionId);
  let pick = fitting[0];
  if (occasion?.isRitual && pick.id === catalog.levels[0].id && fitting[1]) pick = fitting[1];
  return pick.id;
};

export const suggestedHelpers = (catalog, guests) =>
  Math.min(4, Math.floor(Math.max(0, guests - 1) / (catalog.settings.guestsPerHelper || 20)));

export const estimate = (catalog, state) => {
  const guests = Number(state.guests) || 0;
  const dishCount = (state.dishes || []).length;
  const levelId = state.level || recommendLevel(catalog, { guests, dishes: dishCount, occasionId: state.occasion });
  const level = catalog.levels.find((l) => l.id === levelId) || catalog.levels[0];

  const lines = [{
    key: 'cook',
    label: `${level.name} fee`,
    detail: `Up to ${level.includedGuests} guests & ${level.includedDishes} dishes`,
    amount: level.base,
  }];

  const extraGuests = Math.max(0, guests - level.includedGuests);
  if (extraGuests) lines.push({ key: 'guests', label: `${extraGuests} more guests`, detail: `₹${level.perGuest} each`, amount: extraGuests * level.perGuest });
  const extraDishes = Math.max(0, dishCount - level.includedDishes);
  if (extraDishes) lines.push({ key: 'dishes', label: `${extraDishes} more dishes`, detail: `₹${level.perDish} each`, amount: extraDishes * level.perDish });

  catalog.addons.forEach((addon) => {
    const raw = (state.addons || {})[addon.id];
    const qty = typeof raw === 'number' ? raw : raw ? 1 : 0;
    if (!qty) return;
    const amount = addon.perGuest ? addon.perGuest * guests : addon.price * qty;
    const detail = addon.perGuest ? `₹${addon.perGuest} × ${guests} guests` : addon.unit;
    lines.push({ key: `addon:${addon.id}`, label: qty > 1 ? `${addon.name} × ${qty}` : addon.name, detail, amount });
  });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const advance = Math.ceil((total * (catalog.settings.advancePercent || 10)) / 100 / 10) * 10;
  return { level, lines, total, advance, guests, dishCount };
};

export const packageFrom = (catalog, pkg) =>
  pkg.fromPrice ?? estimate(catalog, { guests: pkg.minGuests, dishes: pkg.dishes, level: pkg.level, occasion: pkg.occasion }).total;
