import { Pool } from 'pg';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Utility function to log messages with date and time
const log = (message: string) => {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}`);
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: true,  // Important: Ensure this is `true` for production with a proper cert
    ca: fs.readFileSync(path.resolve(__dirname, '../ca.pem')).toString(),  // Path to the Aiven CA cert
  }
});

pool.on('connect', () => {
  log('Connected to PostgreSQL successfully');
});

pool.on('error', (err) => {
  log(`PostgreSQL error: ${err.message}`);
});

export const query = (text: string, params?: any[]) => {
  log(`Executing query: ${text} with params: ${JSON.stringify(params)}`);
  return pool.query(text, params);
};
