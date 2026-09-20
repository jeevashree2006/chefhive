/* ChefHive API server (Express + MySQL). */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkConnection } from './db.js';
import catalogRoutes from './routes/catalog.js';
import bookingRoutes from './routes/bookings.js';
import cookRoutes from './routes/cooks.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await checkConnection();
    res.json({ ok: true, database: 'up' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'down', message: error.message });
  }
});

app.use('/api/catalog', catalogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cooks', cookRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

const DB_ERRORS = ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT'];
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  const dbDown = DB_ERRORS.includes(error.code);
  console.error('[api]', error.code || '', error.message);
  res.status(dbDown ? 503 : 500).json({
    error: dbDown ? 'database_unavailable' : 'server_error',
    message: dbDown
      ? 'Cannot reach the database. Check that MySQL is running and that server/.env is correct, then run: npm run seed'
      : 'Something went wrong on the server.',
  });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`ChefHive API listening on http://localhost:${port}`);
  checkConnection()
    .then(() => console.log('MySQL connection OK'))
    .catch((error) => console.warn('MySQL not reachable yet:', error.code || error.message));
});
