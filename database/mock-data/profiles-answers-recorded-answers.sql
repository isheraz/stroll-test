-- Insert new mock women profiles (15 of type C, 15 of type F)
INSERT INTO profiles (user_id, name, age, gender, profile_type, video_url) VALUES
('w101', 'Emma', 25, 'female', 'C', NULL),
('w102', 'Olivia', 28, 'female', 'C', NULL),
('w103', 'Sophia', 22, 'female', 'C', NULL),
('w104', 'Isabella', 24, 'female', 'C', NULL),
('w105', 'Mia', 29, 'female', 'C', NULL),
('w106', 'Amelia', 26, 'female', 'C', NULL),
('w107', 'Charlotte', 30, 'female', 'C', NULL),
('w108', 'Harper', 28, 'female', 'C', NULL),
('w109', 'Ella', 25, 'female', 'C', NULL),
('w110', 'Scarlett', 27, 'female', 'C', NULL),
('w111', 'Grace', 24, 'female', 'C', NULL),
('w112', 'Zoe', 26, 'female', 'C', NULL),
('w113', 'Hannah', 29, 'female', 'C', NULL),
('w114', 'Lily', 23, 'female', 'C', NULL),
('w115', 'Evelyn', 30, 'female', 'C', NULL),
('w116', 'Aria', 27, 'female', 'F', NULL),
('w117', 'Chloe', 26, 'female', 'F', NULL),
('w118', 'Avery', 28, 'female', 'F', NULL),
('w119', 'Sofia', 29, 'female', 'F', NULL),
('w120', 'Bella', 25, 'female', 'F', NULL),
('w121', 'Mila', 27, 'female', 'F', NULL),
('w122', 'Aurora', 28, 'female', 'F', NULL),
('w123', 'Savannah', 24, 'female', 'F', NULL),
('w124', 'Penelope', 26, 'female', 'F', NULL),
('w125', 'Ariana', 28, 'female', 'F', NULL),
('w126', 'Stella', 25, 'female', 'F', NULL),
('w127', 'Violet', 27, 'female', 'F', NULL),
('w128', 'Camila', 24, 'female', 'F', NULL),
('w129', 'Hazel', 30, 'female', 'F', NULL),
('w130', 'Eleanor', 29, 'female', 'F', NULL);

-- Insert new mock men profiles using the sample video URLs for video answers
INSERT INTO profiles (user_id, name, age, gender, profile_type, video_url) VALUES
('m101', 'Daniel', 28, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('m102', 'James', 32, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('m103', 'Michael', 30, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('m104', 'William', 29, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('m105', 'Henry', 33, 'male', NULL, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');

-- Insert new mock answers for women
INSERT INTO answers (user_id, question_id, answer) VALUES
('w101', 1, 'Yes'),
('w102', 1, 'No'),
('w103', 1, 'Yes'),
('w104', 1, 'Maybe'),
('w105', 1, 'Yes');

-- Insert new mock answers for men
INSERT INTO answers (user_id, question_id, answer) VALUES
('m101', 1, 'I prefer remote work'),
('m102', 1, 'Stress management is key'),
('m103', 1, 'Hiking and outdoor activities'),
('m104', 1, 'I loved my recent project on AI'),
('m105', 1, 'Balancing personal and work life is essential');

-- Insert new mock recorded answers for men linking to video sources
INSERT INTO recorded_answers (user_id, question_id, video_url) VALUES
('m101', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('m102', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('m103', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('m104', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('m105', 1, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');
