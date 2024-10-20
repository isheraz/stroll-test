-- Table for storing questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    region VARCHAR(255) NOT NULL
);

-- Table for storing regions
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    timezone VARCHAR(50) NOT NULL
);

-- Table for storing cycle information
CREATE TABLE cycles (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id),
    question_id INT REFERENCES questions(id),
    cycle_number INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);


-- Insert mock regions
INSERT INTO regions (name, timezone) VALUES ('Singapore', 'Asia/Singapore');
INSERT INTO regions (name, timezone) VALUES ('New York', 'America/New_York');

-- Insert mock questions
INSERT INTO questions (text, region) VALUES ('What is your opinion on remote learning?', 'Singapore');
INSERT INTO questions (text, region) VALUES ('How do you manage your time effectively?', 'New York');

-- Insert mock cycle assignments
INSERT INTO cycles (region_id, question_id, cycle_number, start_time, end_time)
VALUES (1, 1, 1, '2024-01-01 19:00:00', '2024-01-08 19:00:00'),
       (2, 2, 1, '2024-01-01 19:00:00', '2024-01-08 19:00:00');

-- Insert a new question
INSERT INTO questions (text, region) VALUES ('What is your opinion on remote Jobs?', 'Singapore');

-- Get the ID of the newly inserted question
SELECT id FROM questions WHERE text = 'What is your opinion on remote Jobs?';

-- Insert a cycle for this question
INSERT INTO cycles (region_id, question_id, cycle_number, start_time, end_time)
VALUES ((SELECT id FROM regions WHERE name = 'Singapore'), 1, 42, '2024-01-01', '2024-01-08');

-- One Region has Many Question
-- One Region has Many Cycles
-- Many Regions have Many Questions