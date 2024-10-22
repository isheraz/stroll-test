-- Table for storing questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    region VARCHAR(255) NOT NULL,
    gender VARCHAR(10)
);
-- Index for faster lookups by region and gender
CREATE INDEX idx_questions_region ON questions(region);
CREATE INDEX idx_questions_gender ON questions(gender);

-- Table for storing regions
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    timezone VARCHAR(50) NOT NULL
);
-- Index is not necessary on name since it is already unique

-- Table for storing cycle information
CREATE TABLE cycles (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id),
    question_id INT REFERENCES questions(id),
    cycle_number INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);
-- Indexes for foreign keys and commonly queried columns
CREATE INDEX idx_cycles_region_id ON cycles(region_id);
CREATE INDEX idx_cycles_question_id ON cycles(question_id);
CREATE INDEX idx_cycles_start_end_time ON cycles(start_time, end_time);

-- Table for storing user profiles (men and women)
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    age INT,
    gender VARCHAR(10),  -- 'male' or 'female'
    profile_type CHAR(1),  -- 'A' or 'B' for women, NULL for men
    video_url TEXT
);
-- Index for gender and profile type for faster lookups
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_profile_type ON profiles(profile_type);

-- Table for storing recorded answers (videos) from men
CREATE TABLE recorded_answers (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES profiles(user_id),
    question_id INT REFERENCES questions(id),
    video_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index for user_id and question_id to optimize foreign key lookups
CREATE INDEX idx_recorded_answers_user_id ON recorded_answers(user_id);
CREATE INDEX idx_recorded_answers_question_id ON recorded_answers(question_id);

-- Table for tracking video watches (whether a woman has watched a video before interacting)
CREATE TABLE video_watches (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES profiles(user_id),
    profile_id VARCHAR(255) REFERENCES profiles(user_id),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index for tracking video watches based on user and profile being watched
CREATE INDEX idx_video_watches_user_id ON video_watches(user_id);
CREATE INDEX idx_video_watches_profile_id ON video_watches(profile_id);

-- Create the answers table to store users' responses to questions
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES profiles(user_id),
    question_id INT REFERENCES questions(id),
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Indexes for foreign keys for faster lookups
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Insert mock regions
INSERT INTO regions (name, timezone) VALUES ('Singapore', 'Asia/Singapore');
INSERT INTO regions (name, timezone) VALUES ('New York', 'America/New_York');
