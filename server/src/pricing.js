/*
 * Price calculation. The browser shows an estimate as you book, but the server
 * always recalculates before saving, so prices can never be edited from the client.
 */

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
  Math.min(4, Math.floor(Math.max(0, guests - 1) / catalog.settings.guestsPerHelper));

/**
 * @param input { guests, dishes: string[], levelId, addons: { [addonId]: number|boolean }, occasionId }
 * @returns { level, lines, cookFee, addonsTotal, total, advance }
 */
export const estimate = (catalog, input) => {
  const guests = Number(input.guests) || 0;
  const dishCount = (input.dishes || []).length;
  const levelId = input.levelId || recommendLevel(catalog, { guests, dishes: dishCount, occasionId: input.occasionId });
  const level = catalog.levels.find((l) => l.id === levelId) || catalog.levels[0];

  const lines = [{
    key: 'cook',
    label: `${level.name} fee`,
    detail: `Up to ${level.includedGuests} guests & ${level.includedDishes} dishes`,
    amount: level.base,
  }];

  const extraGuests = Math.max(0, guests - level.includedGuests);
  if (extraGuests) {
    lines.push({ key: 'guests', label: `${extraGuests} more guests`, detail: `₹${level.perGuest} each`, amount: extraGuests * level.perGuest });
  }
  const extraDishes = Math.max(0, dishCount - level.includedDishes);
  if (extraDishes) {
    lines.push({ key: 'dishes', label: `${extraDishes} more dishes`, detail: `₹${level.perDish} each`, amount: extraDishes * level.perDish });
  }

  const cookFee = lines.reduce((sum, l) => sum + l.amount, 0);

  const chosenAddons = [];
  catalog.addons.forEach((addon) => {
    const raw = (input.addons || {})[addon.id];
    const qty = typeof raw === 'number' ? raw : raw ? 1 : 0;
    if (!qty) return;
    const amount = addon.perGuest ? addon.perGuest * guests : addon.price * qty;
    const detail = addon.perGuest ? `₹${addon.perGuest} × ${guests} guests` : addon.unit;
    chosenAddons.push({ id: addon.id, name: addon.name, qty, amount });
    lines.push({ key: `addon:${addon.id}`, label: qty > 1 ? `${addon.name} × ${qty}` : addon.name, detail, amount });
  });

  const addonsTotal = chosenAddons.reduce((sum, a) => sum + a.amount, 0);
  const total = cookFee + addonsTotal;
  const advance = Math.ceil((total * catalog.settings.advancePercent) / 100 / 10) * 10;

  return { level, lines, addons: chosenAddons, cookFee, addonsTotal, total, advance };
};

/** Starting price shown on an occasion menu card. */
export const packageFrom = (catalog, pkg) =>
  estimate(catalog, { guests: pkg.minGuests, dishes: pkg.dishes, levelId: pkg.level, occasionId: pkg.occasion }).total;
