import { createClient } from 'redis';
import dotenv from 'dotenv';
import { format } from 'date-fns';

dotenv.config();

const log = (message: string) => {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}`);
};

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'rediss://localhost:6379',
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    tls: true,
    rejectUnauthorized: true, // Ensure this matches your security needs
    connectTimeout: 10000, // 10 seconds connection timeout
    keepAlive: 10000, // Keep the connection alive for 10 seconds
  },
});

// Redis connection event handlers
redisClient.on('connect', () => {
  log('Connected to Redis successfully');
});

redisClient.on('error', (err) => {
  log(`Redis error: ${err.message}`);
});

redisClient.on('end', () => {
  log('Redis client disconnected');
});

redisClient.on('reconnecting', () => {
  log('Redis client attempting to reconnect...');
});

// Ensure the Redis client is connected before performing any operation
const ensureConnected = async () => {
  if (!redisClient.isOpen) {
    log('Redis client is closed. Attempting to reconnect...');
    await redisClient.connect();
  }
};

// Redis Cache functions
export const cache = {
  get: async (key: string): Promise<string | null> => {
    log(`Getting cache for key: ${key}`);
    try {
      // Ensure the Redis client is connected before the operation
      await ensureConnected();
      const result = await redisClient.get(key);
      log(`Successfully retrieved value for key: ${key}`);
      return result;
    } catch (error) {
      log(`Error getting cache for key: ${key}. Error: ${error}`);
      return null;
    }
  },
  setWithExpiry: async (key: string, value: string, ttl: number): Promise<void> => {
    try {
      log(`Setting cache for key: ${key} with TTL: ${ttl} seconds`);
      // Ensure the Redis client is connected before the operation
      await ensureConnected();
      await redisClient.setEx(key, ttl, value);
      log(`Successfully set cache for key: ${key}`);
    } catch (error) {
      log(`Error setting cache for key: ${key}. Error: ${error}`);
    }
  },
};

// Gracefully handle Redis client shutdown when the application terminates
process.on('SIGINT', async () => {
  log('Shutting down Redis client');
  await redisClient.quit();
  process.exit();
});
