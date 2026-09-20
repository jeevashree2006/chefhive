/* POST /api/cooks/apply — a cook applies to join ChefHive. */
import { Router } from 'express';
import { loadCatalog } from '../catalog.js';
import { validateCookApplication } from '../validate.js';
import { query } from '../db.js';
import { makeRef } from './bookings.js';

const router = Router();

router.post('/apply', async (req, res, next) => {
  try {
    const catalog = await loadCatalog();
    const { errors, clean } = validateCookApplication(catalog, req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const ref = makeRef('CK');
      try {
        await query(
          `INSERT INTO cook_applications
             (ref, name, phone, city, area, experience, traditions, signature_dishes, occasions, food_rules,
              largest_group, team, languages, link)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [ref, clean.name, clean.phone, clean.city, clean.area, clean.experience,
            JSON.stringify(clean.traditions), clean.signatureDishes, JSON.stringify(clean.occasions),
            JSON.stringify(clean.foodRules), clean.largestGroup, clean.team, clean.languages, clean.link],
        );
        return res.status(201).json({ ref });
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
      }
    }
    throw new Error('Could not generate a unique application reference');
  } catch (error) {
    next(error);
  }
});

export default router;
