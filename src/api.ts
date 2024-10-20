import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { query } from './db';
import { cache } from './cache';
import { getCurrentCycle } from './utils';
import { format, addDays } from 'date-fns';

const router = Router();

// Utility function to log messages with date and time
const log = (message: string) => {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}`);
};

const LOG_FILE_PATH = path.resolve(__dirname, '../logs/server.log');

// Function to calculate the start and end dates of a cycle based on the start date and cycle number
const getCycleDates = (startDate: Date, cycleNumber: number, cycleDuration: number) => {
  const from = addDays(startDate, cycleDuration * (cycleNumber - 1));
  const to = addDays(from, cycleDuration);
  return { from, to };
};

/**
 * Function to get the last N entries from the log file
 */
const getLastNLogEntries = (filePath: string, n: number): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const logEntries: string[] = [];
    
    // Create a readable stream
    const fileStream = fs.createReadStream(filePath);

    // Use readline to read the file line by line
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Read each line and add it to an array
    rl.on('line', (line: string) => {
      logEntries.push(line);
    });

    // When the file has been fully read
    rl.on('close', () => {
      // Return the last N log entries (if N is greater than the number of log entries, return all)
      const lastNEntries = logEntries.slice(-n);
      resolve(lastNEntries);
    });

    // Handle any errors that occur during reading
    rl.on('error', (err: Error) => {
      reject(err);
    });
  });
};

// Utility function to log messages to both the console and the log file
const logToFile = (message: string) => {
  const formattedMessage = `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}\n`;

  // Log to the console
  console.log(formattedMessage);

  // Append the log message to the log file
  fs.appendFile(LOG_FILE_PATH, formattedMessage, (err) => {
    if (err) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
  });
};

// Middleware to log each request and response
router.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log the request details
  logToFile(`Incoming request: ${req.method} ${req.originalUrl} from ${req.ip}`);

  // Capture response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logToFile(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });

  next();
});

// Endpoint to get the assigned question
router.get('/assign_question', async (req: Request, res: Response): Promise<any> => {
  try {
    const regionName = req.query.region_name as string;
    const userId = req.query.user_id as string;

    // Get the optional cycle parameter from the request, if present
    let cycle = req.query.cycle ? parseInt(req.query.cycle as string, 10) : undefined;

    // Validate input parameters
    if (!regionName || !userId) {
      log(`Bad request: Missing region_name or user_id`);
      return res.status(400).json({ error: 'Missing region_name or user_id' });
    }

    // Calculate the current cycle if no cycle is provided
    const startDate = new Date('2024-01-01T19:00:00Z'); // Example start date
    const cycleDuration = 7; // Cycle duration in days
    const currentCycle = getCurrentCycle(startDate, cycleDuration);

    // Use the current cycle if no cycle is provided
    cycle = cycle || currentCycle;

    // Get the date range for both the requested cycle and current cycle
    const currentCycleDates = getCycleDates(startDate, currentCycle, cycleDuration);
    const requestedCycleDates = getCycleDates(startDate, cycle, cycleDuration);

    log(`Received request from user ${userId} for region ${regionName}, cycle: ${cycle}`);

    const cacheKey = `question:${regionName}:${cycle}`;
    const cachedQuestion = await cache.get(cacheKey);

    if (cachedQuestion) {
      log(`Cache hit for key: ${cacheKey}`);
      return res.json({
        user_id: userId,
        region: regionName,
        cycle: { number: cycle, from: requestedCycleDates.from, to: requestedCycleDates.to },
        currentCycle: { number: currentCycle, from: currentCycleDates.from, to: currentCycleDates.to },
        question: JSON.parse(cachedQuestion)
      });
    }

    log(`Cache miss for key: ${cacheKey}, querying database...`);

    // Fetch question from the database if not cached
    const queryText = `
      SELECT q.text 
      FROM questions q 
      JOIN cycles c ON q.id = c.question_id 
      JOIN regions r ON r.id = c.region_id 
      WHERE r.name = $1 AND c.cycle_number = $2
    `;

    const result = await query(queryText, [regionName, cycle]);

    if (result.rows.length > 0) {
      const question = result.rows[0];
      // Cache the result with an expiry (e.g., expire after 7 days)
      await cache.setWithExpiry(cacheKey, JSON.stringify(question), 7 * 24 * 60 * 60); // 7 days in seconds
      log(`Database query success. Question: ${question.text} cached for key: ${cacheKey}`);
      return res.json({
        user_id: userId,
        region: regionName,
        cycle: { number: cycle, from: requestedCycleDates.from, to: requestedCycleDates.to },
        currentCycle: { number: currentCycle, from: currentCycleDates.from, to: currentCycleDates.to },
        question
      });
    } else {
      log(`No question found in database for region ${regionName} and cycle ${cycle}`);
      return res.status(404).json({
        error: 'No question found for this region and cycle',
        cycle: { number: cycle, from: requestedCycleDates.from, to: requestedCycleDates.to },
        currentCycle: { number: currentCycle, from: currentCycleDates.from, to: currentCycleDates.to }
      });
    }
  } catch (error) {
    log(`Error handling request: ${error}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to fetch the last 50 log entries
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const logEntries = await getLastNLogEntries(LOG_FILE_PATH, 50);

    if (logEntries.length > 0) {
      log(`Returning the last ${logEntries.length} log entries.`);
      res.json({ logs: logEntries });
    } else {
      log(`No logs found in the file.`);
      res.status(404).json({ error: 'No logs found' });
    }
  } catch (error) {
    log(`Error reading log file: ${error}`);
    res.status(500).json({ error: 'Error reading log file' });
  }
});

export default router;
