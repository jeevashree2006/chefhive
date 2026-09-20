/*
 * Admin endpoints for the ChefHive team. Protected by the ADMIN_TOKEN in server/.env,
 * sent as the "x-admin-token" header. Replace with proper staff logins in the next phase.
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.use((req, res, next) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected === 'change-me') {
    return res.status(503).json({ error: 'admin_disabled', message: 'Set ADMIN_TOKEN in server/.env to use admin endpoints.' });
  }
  if (req.get('x-admin-token') !== expected) return res.status(401).json({ error: 'unauthorised' });
  return next();
});

const LIMIT = (value) => Math.min(200, Math.max(1, Number(value) || 50));

router.get('/bookings', async (req, res, next) => {
  try {
    const status = req.query.status;
    const rows = await query(
      `SELECT b.id, b.ref, b.status, b.created_at, b.event_date, b.meal, b.ready_by, b.guests, b.city,
              b.customer_name, b.phone, b.email, b.address, b.pincode, b.notes,
              b.cook_fee, b.addons_total, b.total, b.advance,
              o.name AS occasion, b.festival, t.name AS tradition, b.food_style, b.spice, l.name AS cook_level,
              (SELECT GROUP_CONCAT(d.dish_name ORDER BY d.sort_order SEPARATOR ', ') FROM booking_dishes d WHERE d.booking_id = b.id) AS dishes,
              (SELECT GROUP_CONCAT(CONCAT(a.addon_name, ' x', a.qty) SEPARATOR ', ') FROM booking_addons a WHERE a.booking_id = b.id) AS extras
         FROM bookings b
         JOIN occasions o   ON o.id = b.occasion_id
         JOIN traditions t  ON t.id = b.tradition_id
         JOIN cook_levels l ON l.id = b.level_id
        ${status ? 'WHERE b.status = ?' : ''}
        ORDER BY b.created_at DESC
        LIMIT ${LIMIT(req.query.limit)}`,
      status ? [status] : [],
    );
    res.json({ count: rows.length, bookings: rows });
  } catch (error) {
    next(error);
  }
});

router.patch('/bookings/:ref', async (req, res, next) => {
  try {
    const allowed = ['new', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(req.body?.status)) return res.status(400).json({ error: 'bad_status', allowed });
    const result = await query('UPDATE bookings SET status = ? WHERE ref = ?', [req.body.status, String(req.params.ref).toUpperCase()]);
    if (!result.affectedRows) return res.status(404).json({ error: 'not_found' });
    res.json({ ref: req.params.ref, status: req.body.status });
  } catch (error) {
    next(error);
  }
});

router.get('/cooks', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, ref, status, created_at, name, phone, city, area, experience, traditions, signature_dishes,
              occasions, food_rules, largest_group, team, languages, link
         FROM cook_applications
        ORDER BY created_at DESC
        LIMIT ${LIMIT(req.query.limit)}`,
    );
    res.json({ count: rows.length, cooks: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [byStatus, upcoming, cooks] = await Promise.all([
      query('SELECT status, COUNT(*) AS count, SUM(total) AS value FROM bookings GROUP BY status'),
      query('SELECT COUNT(*) AS count FROM bookings WHERE event_date >= CURDATE() AND status IN ("new","confirmed")'),
      query('SELECT COUNT(*) AS count FROM cook_applications WHERE status = "new"'),
    ]);
    res.json({ byStatus, upcomingBookings: upcoming[0].count, newCookApplications: cooks[0].count });
  } catch (error) {
    next(error);
  }
});

export default router;
