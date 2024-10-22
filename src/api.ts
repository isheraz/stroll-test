import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { format, differenceInCalendarDays, differenceInCalendarWeeks } from 'date-fns';

import { cache } from './cache';
import {
  storeUserAnswer,
  fetchProfilesByGender,
  fetchAnswersByUserId,
  logVideoWatch,
  checkIfUserExists,
  getLastNLogEntries,
  getRandomQuestionForGenderAndRegion,
  hasWatchedVideo,
  logToFile
} from './business_logic'; // Importing from business logic
import Joi from 'joi';


// Joi schema to validate incoming request parameters
const questionSchema = Joi.object({
  region: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
  cycle: Joi.date().optional(), // Optional cycle based on specific date (default is today)
  cycleType: Joi.string().valid('day', 'week').default('day') // Optional, defaults to 'day' but can be 'week'
});

const submitAnswerSchema = Joi.object({
  userId: Joi.string().required(),
  questionId: Joi.number().integer().required(),
  answer: Joi.string().required()
});

const fetchAnswersSchema = Joi.object({
  userId: Joi.string().required()
});

const fetchProfilesSchema = Joi.object({
  gender: Joi.string().valid('male', 'female').required(),
  userId: Joi.string().required(),
  profileTypes: Joi.string().optional() // Can be a comma-separated list of profile types (e.g., 'A,B,C')
});

const videoWatchSchema = Joi.object({
  userId: Joi.string().required(),
  profileId: Joi.string().required()
});

const checkVideoWatchSchema = Joi.object({
  userId: Joi.string().required(),
  profileId: Joi.string().required()
});

// Joi schema for validating the number of log entries to fetch
const logsSchema = Joi.object({
  n: Joi.number().integer().min(1).default(50) // Default to 50 log entries
});

const router = Router();

// Utility function to log messages with date and time
const log = (message: string) => {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}`);
};

const LOG_FILE_PATH = path.resolve(__dirname, '../logs/server.log');

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

// Route to fetch questions based on cycle (day or week)
// Route to fetch questions based on cycle (day or week)
router.get('/questions/cycle', async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate query parameters
    const { error } = questionSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { region, gender, cycle, cycleType } = req.query;
    const startDate = new Date('2024-01-01T00:00:00Z');
    const selectedDate = cycle ? new Date(cycle as string) : new Date();
    const cycleNumber = cycleType === 'day' 
      ? differenceInCalendarDays(selectedDate, startDate) + 1 
      : differenceInCalendarWeeks(selectedDate, startDate) + 1;

    // Cache key for Redis
    const cacheKey = `question:${region}:${cycleNumber}:${cycleType}`;
    const cachedQuestion = await cache.get(cacheKey);

    if (cachedQuestion) {
      // Return cached question if present
      return res.json({
        region,
        gender,
        cycle: { number: cycleNumber, type: cycleType, date: selectedDate.toISOString() },
        question: JSON.parse(cachedQuestion)
      });
    }

    // Fetch the question from the database (business logic)
    const question = await getRandomQuestionForGenderAndRegion(region as string, cycleNumber, cycleType as string);
    if (!question) {
      return res.status(404).json({ error: 'No question found for this region and cycle' });
    }

    // Cache the fetched question in Redis for future requests
    await cache.setWithExpiry(cacheKey, JSON.stringify(question), cycleType === 'day' ? 86400 : 604800); // Cache for 1 day or 1 week
    return res.json({
      region,
      gender,
      cycle: { number: cycleNumber, type: cycleType, date: selectedDate.toISOString() },
      question
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch the last N log entries
router.get('/logs', async (req: Request, res: Response): Promise<any> => {
  try {
    const { error, value } = logsSchema.validate(req.query);
    if (error) {
      log(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { n } = req.query || value;
    const logEntries = await getLastNLogEntries(LOG_FILE_PATH, parseInt(n as string));

    if (logEntries.length <= 0) {
      return res.status(404).json({ error: 'No logs found' });
    }

    return res.json({ logs: logEntries });
  } catch (error) {
    log(`Error: ${error}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to submit an answer
router.post('/answers', async (req: Request, res: Response): Promise<any> => {
  try {
    const { error } = submitAnswerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, questionId, answer } = req.body;
    const userExists = await checkIfUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ error: `User with userId: ${userId} does not exist` });
    }

    const answerId = await storeUserAnswer(userId, questionId, answer);
    return res.status(201).json({ message: 'Answer submitted successfully', answerId });

  } catch (error) {
    log(`Error: ${error}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch profiles based on gender and profile type, excluding the requesting user
router.get('/profiles', async (req: Request, res: Response): Promise<any> => {
  try {
    const { error } = fetchProfilesSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { gender, userId, profileTypes } = req.query;

    // Cache key for profiles
    const cacheKey = `profiles:${gender}:${userId}:${profileTypes as string[] || 'all'}`;
    const cachedProfiles = await cache.get(cacheKey);

    if (cachedProfiles) {
      return res.json({ profiles: JSON.parse(cachedProfiles) });
    }

    // Fetch profiles from the database (business logic)
    const profiles = await fetchProfilesByGender(gender as string, userId as string, profileTypes ? (profileTypes as string).split(',') : []);
    console.log("🚀 ~ router.get ~ profiles:", profiles)
    
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ error: 'No profiles found for the specified criteria' });
    }

    // Cache profiles for a short time (e.g., 5 minutes)
    await cache.setWithExpiry(cacheKey, JSON.stringify(profiles), 300); // Cache for 5 minutes
    return res.json({ profiles });

  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch all answers for a specific user
router.get('/answers', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query;

    // Cache key for user's answers
    const cacheKey = `answers:${userId}`;
    const cachedAnswers = await cache.get(cacheKey);

    if (cachedAnswers) {
      return res.json({ userId, answers: JSON.parse(cachedAnswers) });
    }

    // Fetch answers from the database (business logic)
    const answers = await fetchAnswersByUserId(userId as string);

    if (!answers || answers.length === 0) {
      return res.status(404).json({ error: 'No answers found for this user' });
    }

    // Cache user's answers for 10 minutes
    await cache.setWithExpiry(cacheKey, JSON.stringify(answers), 600); // Cache for 10 minutes
    return res.json({ userId, answers });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to log video watches
router.post('/videos/watched', async (req: Request, res: Response): Promise<any> => {
  try {
    const { error } = videoWatchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, profileId } = req.body;
    const userExists = await checkIfUserExists(userId);
    const profileExists = await checkIfUserExists(profileId);

    if (!userExists || !profileExists) {
      return res.status(404).json({ error: 'Either user or profile does not exist' });
    }

    const watchId = await logVideoWatch(userId, profileId);
    return res.status(201).json({ message: 'Video watch tracked successfully', watchId });

  } catch (error) {
    log(`Error: ${error}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API Endpoint to check if the user has watched the video
router.get('/videos/check', async (req: Request, res: Response): Promise<any> => {
  try {
    const { error } = checkVideoWatchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, profileId } = req.query;
    const watched = await hasWatchedVideo(userId as string, profileId as string);

    return res.json({ watched });
  } catch (error) {
    log(`Error: ${error}`);
    return res.status(500).json({ error: 'Failed to check video watch' });
  }
});

export default router;
