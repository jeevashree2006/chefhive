/* POST /api/bookings — create a booking request. GET /api/bookings/:ref — check its status. */
import { Router } from 'express';
import crypto from 'node:crypto';
import { loadCatalog } from '../catalog.js';
import { estimate } from '../pricing.js';
import { validateBooking } from '../validate.js';
import { query, withTransaction } from '../db.js';

const router = Router();

// No 0/O/1/I, so a reference is easy to read out over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const makeRef = (prefix) =>
  `${prefix}-${Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('')}`;

router.post('/', async (req, res, next) => {
  try {
    const catalog = await loadCatalog();
    const { errors, clean } = validateBooking(catalog, req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    // Prices always come from the server, never from the request body.
    const price = estimate(catalog, {
      guests: clean.guests,
      dishes: clean.dishes.map((d) => d.id),
      levelId: clean.levelId,
      addons: clean.addons,
      occasionId: clean.occasionId,
    });

    const ref = await withTransaction(async (cx) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = makeRef('CH');
        try {
          const [result] = await cx.execute(
            `INSERT INTO bookings
               (ref, occasion_id, festival, tradition_id, food_style, spice, package_id, city, event_date, meal, ready_by,
                guests, kitchen, level_id, customer_name, phone, email, address, pincode, notes,
                cook_fee, addons_total, total, advance)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [candidate, clean.occasionId, clean.festival, clean.traditionId, clean.foodStyle, clean.spice, clean.packageId,
              clean.city, clean.eventDate, clean.meal, clean.readyBy, clean.guests, clean.kitchen, clean.levelId,
              clean.name, clean.phone, clean.email, clean.address, clean.pincode, clean.notes,
              price.cookFee, price.addonsTotal, price.total, price.advance],
          );
          const bookingId = result.insertId;

          if (clean.dishes.length) {
            await cx.query(
              'INSERT INTO booking_dishes (booking_id, dish_id, dish_name, course, sort_order) VALUES ?',
              [clean.dishes.map((d, i) => [bookingId, d.id, d.name, d.course, i])],
            );
          }
          if (price.addons.length) {
            await cx.query(
              'INSERT INTO booking_addons (booking_id, addon_id, addon_name, qty, amount) VALUES ?',
              [price.addons.map((a) => [bookingId, a.id, a.name, a.qty, a.amount])],
            );
          }
          return candidate;
        } catch (error) {
          if (error.code !== 'ER_DUP_ENTRY') throw error; // reference clash: try another one
        }
      }
      throw new Error('Could not generate a unique booking reference');
    });

    res.status(201).json({
      ref,
      estimate: { lines: price.lines, cookFee: price.cookFee, addonsTotal: price.addonsTotal, total: price.total, advance: price.advance },
      level: { id: price.level.id, name: price.level.name },
    });
  } catch (error) {
    next(error);
  }
});

// Status lookup for a customer. Deliberately returns no personal details.
router.get('/:ref', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT b.ref, b.status, b.event_date, b.meal, b.ready_by, b.guests, b.total, b.advance,
              o.name AS occasion, t.name AS tradition, l.name AS cook_level
         FROM bookings b
         JOIN occasions o  ON o.id = b.occasion_id
         JOIN traditions t ON t.id = b.tradition_id
         JOIN cook_levels l ON l.id = b.level_id
        WHERE b.ref = ?`,
      [String(req.params.ref).toUpperCase()],
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    const b = rows[0];
    res.json({
      ref: b.ref, status: b.status, eventDate: b.event_date, meal: b.meal, readyBy: String(b.ready_by).slice(0, 5),
      guests: b.guests, total: b.total, advance: b.advance, occasion: b.occasion, tradition: b.tradition, cookLevel: b.cook_level,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
