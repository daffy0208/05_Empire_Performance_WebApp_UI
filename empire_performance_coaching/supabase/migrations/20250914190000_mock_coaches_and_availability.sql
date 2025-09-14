-- Mock data seed: coaches, locations, and full-week availability
-- Safe to run multiple times; guarded inserts avoid duplicates by key fields

-- 1) Ensure core locations exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Lochwinnoch — Lochbarr Services Leisure Centre') THEN
    INSERT INTO locations (name, address, facility_summary, is_active)
    VALUES ('Lochwinnoch — Lochbarr Services Leisure Centre', 'TBC', '3G surface; indoor space; parking', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Airdrie — Venue TBC') THEN
    INSERT INTO locations (name, address, facility_summary, is_active)
    VALUES ('Airdrie — Venue TBC', 'TBC', 'Floodlit pitches; changing rooms', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM locations WHERE name = 'East Kilbride — Venue TBC') THEN
    INSERT INTO locations (name, address, facility_summary, is_active)
    VALUES ('East Kilbride — Venue TBC', 'TBC', 'Multiple pitches; parent viewing', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Glasgow South / Castlemilk — Venue TBC') THEN
    INSERT INTO locations (name, address, facility_summary, is_active)
    VALUES ('Glasgow South / Castlemilk — Venue TBC', 'TBC', 'All-weather surface; parking', true);
  END IF;
END$$;

-- 2) Create 20 fictitious coaches (user_profiles + coaches)
-- We generate deterministic UUIDs via gen_random_uuid(); acceptable for seed.
WITH new_profiles AS (
  SELECT
    gen_random_uuid() AS id,
    full_name,
    true       AS is_active
  FROM (
    VALUES
      ('Alex McArthur'),
      ('Jamie Kerr'),
      ('Rory Campbell'),
      ('Megan Fraser'),
      ('Callum Boyd'),
      ('Eilidh Douglas'),
      ('Lewis Grant'),
      ('Erin McLean'),
      ('Harris Stewart'),
      ('Ava Robertson'),
      ('Oscar Wallace'),
      ('Isla MacLeod'),
      ('Brooke Sinclair'),
      ('Finlay Hunter'),
      ('Skye Ferguson'),
      ('Kara Munro'),
      ('Logan Middleton'),
      ('Nina McIntyre'),
      ('Euan Sutherland'),
      ('Alfie Morrison')
  ) s(full_name)
), inserted_profiles AS (
  -- Insert only profiles that do not exist (by name) to avoid duplicates
  INSERT INTO user_profiles (id, full_name, is_active)
  SELECT p.id, p.full_name, p.is_active
  FROM new_profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.full_name = p.full_name
  )
  RETURNING id, full_name
), all_profiles AS (
  SELECT id, full_name FROM inserted_profiles
  UNION ALL
  SELECT up.id, up.full_name
  FROM user_profiles up
  WHERE up.full_name IN (
    'Alex McArthur','Jamie Kerr','Rory Campbell','Megan Fraser','Callum Boyd',
    'Eilidh Douglas','Lewis Grant','Erin McLean','Harris Stewart','Ava Robertson',
    'Oscar Wallace','Isla MacLeod','Brooke Sinclair','Finlay Hunter','Skye Ferguson',
    'Kara Munro','Logan Middleton','Nina McIntyre','Euan Sutherland','Alfie Morrison'
  )
)
-- Insert matching rows into coaches
INSERT INTO coaches (
  id,
  bio,
  avatar_url,
  hourly_rate,
  certifications,
  specialization,
  specialties,
  current_club,
  locations_served,
  experience_years
)
SELECT
  ap.id,
  'Experienced football coach focused on player development and confidence building.' AS bio,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' AS avatar_url,
  75 AS hourly_rate,
  ARRAY['UEFA C License','Safeguarding']::text[] AS certifications,
  'Youth Development' AS specialization,
  ARRAY['1-to-1 Development','Finishing','Technical Foundations']::text[] AS specialties,
  'Empire Performance' AS current_club,
  ARRAY['Lochwinnoch — Lochbarr Services Leisure Centre','Airdrie — Venue TBC','East Kilbride — Venue TBC','Glasgow South / Castlemilk — Venue TBC']::text[] AS locations_served,
  5 AS experience_years
FROM all_profiles ap
WHERE NOT EXISTS (SELECT 1 FROM coaches c WHERE c.id = ap.id);

-- 3) Full-week availability for every coach (8:00–20:00 hourly capacity)
-- Insert rows for each day_of_week 0..6, across 4 locations (city/full names accepted in app logic)
WITH coach_ids AS (
  SELECT id FROM coaches
  WHERE id IN (SELECT id FROM user_profiles WHERE full_name IN (
    'Alex McArthur','Jamie Kerr','Rory Campbell','Megan Fraser','Callum Boyd',
    'Eilidh Douglas','Lewis Grant','Erin McLean','Harris Stewart','Ava Robertson',
    'Oscar Wallace','Isla MacLeod','Brooke Sinclair','Finlay Hunter','Skye Ferguson',
    'Kara Munro','Logan Middleton','Nina McIntyre','Euan Sutherland','Alfie Morrison'))
), days AS (
  SELECT 0 AS day_of_week UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
), locs AS (
  SELECT 'Lochwinnoch — Lochbarr Services Leisure Centre' AS loc UNION ALL
  SELECT 'Airdrie — Venue TBC' UNION ALL
  SELECT 'East Kilbride — Venue TBC' UNION ALL
  SELECT 'Glasgow South / Castlemilk — Venue TBC'
)
INSERT INTO coach_availability (
  coach_id,
  day_of_week,
  start_time,
  end_time,
  location,
  is_active
)
SELECT
  c.id,
  d.day_of_week,
  '08:00'::time,
  '20:00'::time,
  l.loc,
  true
FROM coach_ids c
CROSS JOIN days d
CROSS JOIN locs l
WHERE NOT EXISTS (
  SELECT 1 FROM coach_availability ca
  WHERE ca.coach_id = c.id
    AND ca.day_of_week = d.day_of_week
    AND ca.location = l.loc
);

-- End of seed
