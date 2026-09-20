/*
 * Fills the catalogue tables from db/seed-data.json (occasions, traditions, 304 dishes, menus, prices).
 * Safe to re-run: catalogue tables are emptied first. Bookings and cook applications are never touched.
 *
 *   cd server && npm run seed
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, withTransaction } from '../src/db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(here, 'seed-data.json'), 'utf8'));

const RITUAL_OCCASIONS = new Set(['pooja', 'griha-pravesh', 'festival', 'naming', 'remembrance']);

const rows = (list, mapper) => list.map(mapper);

const insertMany = async (cx, table, columns, values) => {
  if (!values.length) return;
  await cx.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ?`, [values]);
};

const run = async () => {
  await withTransaction(async (cx) => {
    await cx.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of ['package_dishes', 'packages', 'dishes', 'traditions', 'courses', 'addons', 'cook_levels',
      'kitchens', 'meals', 'spice_levels', 'food_styles', 'festivals', 'occasions', 'cities', 'settings']) {
      await cx.query(`TRUNCATE TABLE ${table}`);
    }
    await cx.query('SET FOREIGN_KEY_CHECKS = 1');

    const settings = [
      ['advance_percent', seed.settings.advancePercent],
      ['min_notice_days', seed.settings.minNoticeDays],
      ['max_advance_days', seed.settings.maxAdvanceDays],
      ['guests_per_helper', seed.guestsPerHelper],
      ['min_dishes', 3],
      ['min_guests', 2],
      ['max_guests', 150],
      ['image_hero', seed.images.hero],
      ['image_hero_side1', seed.images.heroSide1],
      ['image_hero_side2', seed.images.heroSide2],
      ['image_usp', seed.images.usp],
      ['image_partner', seed.images.partner],
    ].map(([name, value]) => [name, String(value)]);
    await insertMany(cx, 'settings', ['name', 'value'], settings);

    await insertMany(cx, 'cities', ['name', 'sort_order'], rows(seed.settings.cities, (name, i) => [name, i]));
    await insertMany(cx, 'occasions', ['id', 'name', 'icon', 'description', 'is_ritual', 'sort_order'],
      rows(seed.occasions, (o, i) => [o.id, o.name, o.icon, o.desc, RITUAL_OCCASIONS.has(o.id) ? 1 : 0, i]));
    await insertMany(cx, 'festivals', ['name', 'sort_order'], rows(seed.festivals, (name, i) => [name, i]));
    await insertMany(cx, 'food_styles', ['id', 'name', 'sort_order'], rows(seed.foodStyles, (s, i) => [s.id, s.name, i]));
    await insertMany(cx, 'spice_levels', ['id', 'name', 'sort_order'], rows(seed.spiceLevels, (s, i) => [s.id, s.name, i]));
    await insertMany(cx, 'meals', ['id', 'name', 'from_time', 'to_time', 'sort_order'],
      rows(seed.meals, (m, i) => [m.id, m.name, `${m.from}:00`, `${m.to}:00`, i]));
    await insertMany(cx, 'kitchens', ['id', 'name', 'description', 'comfortable_dishes', 'sort_order'],
      rows(seed.kitchens, (k, i) => [k.id, k.name, k.desc, k.comfortableDishes, i]));
    await insertMany(cx, 'cook_levels',
      ['id', 'name', 'tagline', 'base_fee', 'included_guests', 'included_dishes', 'per_guest', 'per_dish', 'max_guests', 'max_dishes', 'is_popular', 'points', 'sort_order'],
      rows(seed.levels, (l, i) => [l.id, l.name, l.tagline, l.base, l.includedGuests, l.includedDishes, l.perGuest, l.perDish,
        l.maxGuests, l.maxDishes, l.popular ? 1 : 0, JSON.stringify(l.points), i]));
    await insertMany(cx, 'addons', ['id', 'name', 'description', 'price', 'per_guest_price', 'unit', 'max_qty', 'sort_order'],
      rows(seed.addons, (a, i) => [a.id, a.name, a.desc, a.price || 0, a.perGuest || 0, a.unit, a.max || 1, i]));
    await insertMany(cx, 'courses', ['id', 'name', 'sort_order'], rows(seed.courses, (c, i) => [c.id, c.name, i]));

    await insertMany(cx, 'traditions', ['id', 'name', 'region', 'signature', 'blurb', 'accent', 'sort_order'],
      rows(seed.traditions, (t, i) => [t.id, t.name, t.region, t.signature, t.blurb, t.accent, i]));

    const dishes = [];
    seed.traditions.forEach((t) => {
      t.dishes.forEach((d, i) => {
        dishes.push([d.id, t.id, d.name, d.course, d.nonveg ? 1 : 0, d.onionGarlic ? 1 : 0, d.root ? 1 : 0, i]);
      });
    });
    await insertMany(cx, 'dishes',
      ['id', 'tradition_id', 'name', 'course', 'is_nonveg', 'needs_onion_garlic', 'has_root_veg', 'sort_order'], dishes);

    await insertMany(cx, 'packages',
      ['id', 'name', 'tradition_id', 'occasion_id', 'festival', 'food_style', 'level_id', 'min_guests', 'image', 'blurb', 'sort_order'],
      rows(seed.packages, (p, i) => [p.id, p.name, p.tradition, p.occasion, p.festival || null, p.style, p.level, p.minGuests, p.image, p.blurb, i]));

    const packageDishes = [];
    seed.packages.forEach((p) => p.dishes.forEach((dishId, i) => packageDishes.push([p.id, dishId, i])));
    await insertMany(cx, 'package_dishes', ['package_id', 'dish_id', 'sort_order'], packageDishes);

    console.log(`Seeded: ${seed.traditions.length} traditions, ${dishes.length} dishes, ${seed.packages.length} occasion menus, ` +
      `${seed.occasions.length} occasions, ${seed.levels.length} cook levels, ${seed.addons.length} add-ons, ${seed.settings.cities.length} cities.`);
  });
  await pool.end();
};

run().catch((error) => {
  console.error('Seeding failed:', error.code || '', error.message);
  if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
    console.error('Create the database first:  mysql -u root -p < db/schema.sql');
  }
  process.exit(1);
});
