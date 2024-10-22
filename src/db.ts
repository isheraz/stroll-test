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

// Pool configuration based on environment
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.resolve(__dirname, '../ca.pem')).toString(),
  }

});

// Pool event listeners
pool.on('connect', () => log('Connected to PostgreSQL successfully'));
pool.on('error', (err) => log(`PostgreSQL error: ${err.message}`));

// Centralized query function for executing all database queries
export const query = (text: string, params?: any[]) => {
  log(`Executing query: ${text} with params: ${JSON.stringify(params)}`);
  return pool.query(text, params);
};
