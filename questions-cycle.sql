DO $$
DECLARE
  cycle_start_date DATE := '2024-10-16';  -- Start of week 42
  cycle_duration INTERVAL := '7 days';
BEGIN
  -- Loop through question IDs for Singapore (IDs 1 to 50)
  FOR question_id IN 1..50 LOOP
    INSERT INTO cycles (region_id, question_id, cycle_number, start_time, end_time)
    VALUES 
    (
      (SELECT id FROM regions WHERE name = 'Singapore'), 
      question_id, 
      42 + (question_id - 1), 
      cycle_start_date + (question_id - 1) * cycle_duration, 
      cycle_start_date + (question_id * cycle_duration)
    );
  END LOOP;
END $$;

-- NewYork

DO $$
DECLARE
  cycle_start_date DATE := '2024-10-16';  -- Start of week 42
  cycle_duration INTERVAL := '7 days';
BEGIN
  -- Loop through question IDs for New York (IDs 51 to 100)
  FOR question_id IN 51..100 LOOP
    INSERT INTO cycles (region_id, question_id, cycle_number, start_time, end_time)
    VALUES 
    (
      (SELECT id FROM regions WHERE name = 'New York'), 
      question_id, 
      42 + (question_id - 51), 
      cycle_start_date + (question_id - 51) * cycle_duration, 
      cycle_start_date + (question_id - 50) * cycle_duration
    );
  END LOOP;
END $$;
