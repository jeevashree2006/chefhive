/*
 * Creates the database and tables from schema.sql, using the credentials in server/.env.
 * Run once:  cd server && npm run db:setup
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  await connection.query(sql);
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema = ?',
    [process.env.DB_NAME || 'chefhive'],
  );
  await connection.end();
  console.log(`Database "${process.env.DB_NAME || 'chefhive'}" is ready with ${rows[0].tables} tables.`);
  console.log('Next: npm run seed');
};

run().catch((error) => {
  console.error('Setup failed:', error.code || '', error.message);
  if (error.code === 'ECONNREFUSED') console.error('MySQL is not running. Start it first (as administrator): net start MYSQL80');
  if (error.code === 'ER_ACCESS_DENIED_ERROR') console.error('Wrong MySQL user or password. Check DB_USER and DB_PASSWORD in server/.env');
  process.exit(1);
});
