/* GET /api/catalog — everything the site needs to render: occasions, traditions, dishes, menus, prices. */
import { Router } from 'express';
import { loadCatalog, publicCatalog } from '../catalog.js';
import { packageFrom } from '../pricing.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const catalog = await loadCatalog({ force: req.query.fresh === '1' });
    const data = publicCatalog(catalog);
    res.json({
      ...data,
      packages: data.packages.map((p) => ({ ...p, fromPrice: packageFrom(catalog, p) })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
