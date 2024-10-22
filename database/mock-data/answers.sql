-- Inserting mock answers for women
INSERT INTO answers (user_id, question_id, answer) VALUES
('w1', 1, 'Yes'),
('w2', 1, 'No'),
('w3', 1, 'Yes'),
('w4', 1, 'Maybe'),
('w5', 1, 'Yes');

-- Inserting mock answers for men
INSERT INTO answers (user_id, question_id, answer) VALUES
('m1', 1, 'I prefer remote work'),
('m2', 1, 'Stress management is key'),
('m3', 1, 'Hiking and outdoor activities'),
('m4', 1, 'I loved my recent project on AI'),
('m5', 1, 'Balancing personal and work life is essential');

-- Insert mock women profiles (15 of type A, 15 of type B)
INSERT INTO profiles (user_id, name, age, gender, profile_type, video_url) VALUES
('w1', 'Alice', 25, 'female', 'A', NULL),
('w2', 'Jane', 27, 'female', 'A', NULL),
('w3', 'Megan', 22, 'female', 'A', NULL),
('w4', 'Lisa', 24, 'female', 'A', NULL),
('w5', 'Sophie', 29, 'female', 'A', NULL),
('w6', 'Nina', 26, 'female', 'A', NULL),
('w7', 'Zara', 30, 'female', 'A', NULL),
('w8', 'Rachel', 28, 'female', 'A', NULL),
('w9', 'Clara', 25, 'female', 'A', NULL),
('w10', 'Eva', 27, 'female', 'A', NULL),
('w11', 'Anna', 24, 'female', 'A', NULL),
('w12', 'Ella', 26, 'female', 'A', NULL),
('w13', 'Mia', 29, 'female', 'A', NULL),
('w14', 'Olivia', 23, 'female', 'A', NULL),
('w15', 'Sienna', 30, 'female', 'A', NULL),
('w16', 'Emily', 30, 'female', 'B', NULL),
('w17', 'Hannah', 26, 'female', 'B', NULL),
('w18', 'Grace', 28, 'female', 'B', NULL),
('w19', 'Ava', 27, 'female', 'B', NULL),
('w20', 'Lily', 25, 'female', 'B', NULL),
('w21', 'Ruby', 29, 'female', 'B', NULL),
('w22', 'Sophia', 26, 'female', 'B', NULL),
('w23', 'Leah', 24, 'female', 'B', NULL),
('w24', 'Isabella', 28, 'female', 'B', NULL),
('w25', 'Madison', 25, 'female', 'B', NULL),
('w26', 'Charlotte', 27, 'female', 'B', NULL),
('w27', 'Scarlett', 24, 'female', 'B', NULL),
('w28', 'Bella', 26, 'female', 'B', NULL),
('w29', 'Maya', 30, 'female', 'B', NULL),
('w30', 'Piper', 29, 'female', 'B', NULL);

-- Insert mock men profiles using the sample video URLs for video answers
INSERT INTO profiles (user_id, name, age, gender, profile_type, video_url) VALUES
('m1', 'John', 28, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('m2', 'Alex', 32, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('m3', 'Mark', 30, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('m4', 'Luke', 29, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('m5', 'Tom', 33, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');

-- Insert mock recorded answers for men linking to video sources
INSERT INTO recorded_answers (user_id, question_id, video_url) VALUES
('m1', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('m2', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('m3', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('m4', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('m5', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');
