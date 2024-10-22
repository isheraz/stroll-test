import { query } from './db'; // Database connection
import fs from 'fs';
import readline from 'readline';
import { format } from 'date-fns';
import path from 'path';
import { debuglog } from 'util';

// Utility function to log messages to both the console and the log file
export const logToFile = (message: string, logFilePath: string = path.resolve(__dirname, '../logs/server.log')) => {
    const formattedMessage = `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}\n`;

    // Log to the console
    console.log(formattedMessage);

    // Append the log message to the log file
    fs.appendFile(logFilePath, formattedMessage, (err) => {
        if (err) {
            console.error(`Failed to write to log file: ${err.message}`);
        }
    });
};

// Utility function to check if a user exists in the profiles table
export const checkIfUserExists = async (userId: string): Promise<boolean> => {
    const selectQuery = `
    SELECT COUNT(*) 
    FROM profiles 
    WHERE user_id = $1;
  `;
    const result = await query(selectQuery, [userId]);
    return parseInt(result.rows[0].count) > 0;
};

// Function to store user's answer in the answers table
export const storeUserAnswer = async (userId: string, questionId: number, answer: string): Promise<number> => {
    const insertQuery = `
    INSERT INTO answers (user_id, question_id, answer) 
    VALUES ($1, $2, $3) 
    RETURNING id;
  `;
    const result = await query(insertQuery, [userId, questionId, answer]);
    return result.rows[0].id; // Return the inserted answer's id
};

// Function to fetch profiles based on gender and profile type, excluding the requesting user's profile
export const fetchProfilesByGender = async (gender: string, userId: string, profileTypes: string[]): Promise<any[]> => {
    let selectQuery = `
      SELECT id, user_id, name, age, gender, profile_type, video_url
      FROM profiles
      WHERE gender = $1 AND user_id != $2`;
    const queryParams: (string | string[])[] = [gender, userId];

    if (profileTypes.length > 0) {
        selectQuery += ` AND profile_type = ANY($3::text[])`;
        queryParams.push((profileTypes));
    }

    const result = await query(selectQuery, queryParams);
    return result.rows;
};

// Function to fetch all answers submitted by a specific user
export const fetchAnswersByUserId = async (userId: string): Promise<any[]> => {
    const selectQuery = `
      SELECT a.question_id, q.text AS question, a.answer, a.created_at
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC;
    `;
    const result = await query(selectQuery, [userId]);
    return result.rows;
};



// Function to log video watches
export const logVideoWatch = async (userId: string, profileId: string): Promise<number> => {
    const insertQuery = `
    INSERT INTO video_watches (user_id, profile_id)
    VALUES ($1, $2)
    RETURNING id;
  `;
    const result = await query(insertQuery, [userId, profileId]);
    return result.rows[0].id; // Return the inserted video watch ID
};

// Function to check if the user has watched the profile's video
export const hasWatchedVideo = async (userId: string, profileId: string): Promise<boolean> => {
    const selectQuery = `
    SELECT COUNT(*) 
    FROM video_watches 
    WHERE user_id = $1 AND profile_id = $2;
  `;
    const result = await query(selectQuery, [userId, profileId]);
    return parseInt(result.rows[0].count) > 0;
};

// Function to fetch the last N log entries from the log file
export const getLastNLogEntries = (filePath: string, n: number): Promise<string[]> => {
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

// Function to fetch a random question for a region and cycle
export const getRandomQuestionForGenderAndRegion = async (
    region: string,
    cycleNumber: number,
    cycleType: string
): Promise<any> => {
    const queryText = `
      SELECT q.text 
      FROM questions q 
      JOIN cycles c ON q.id = c.question_id 
      JOIN regions r ON r.id = c.region_id 
      WHERE r.name = $1 AND c.cycle_number = $2
    `;
    const result = await query(queryText, [region, cycleNumber]);

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
};