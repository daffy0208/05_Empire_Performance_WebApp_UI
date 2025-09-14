-- Empire Performance — DB Hotfix + Seed (fixes coaches.specialties and locations table)
-- Schema Analysis: Existing coaches table has specialization (text), missing specialties (text[])
-- Integration Type: additive - adding locations table, modifying coaches table, adding availability table
-- Dependencies: user_profiles (existing), coaches (existing)

-- 1) LOCATIONS TABLE (missing - create new) -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  facility_summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) COACHES TABLE MODIFICATIONS (add missing columns) -------------------------------------------
-- Add missing columns to existing coaches table (safe to re-run)
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS current_club TEXT;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS specialties TEXT[]; -- This was missing!
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS headshot_url TEXT;

-- Update display_name to use full_name from user_profiles where missing
UPDATE public.coaches 
SET display_name = COALESCE(display_name, up.full_name)
FROM public.user_profiles up 
WHERE public.coaches.id = up.id AND public.coaches.display_name IS NULL;

-- Update name column to use full_name from user_profiles where missing
UPDATE public.coaches 
SET name = COALESCE(name, up.full_name)
FROM public.user_profiles up 
WHERE public.coaches.id = up.id AND public.coaches.name IS NULL;

-- 3) AVAILABILITY TABLE (new) ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','held','booked','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4) INDEXES ------------------------------------------------------------------------------------
-- Locations
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations(name);

-- Coaches (additional indexes for new columns)
CREATE INDEX IF NOT EXISTS idx_coaches_specialties ON public.coaches USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_coaches_current_club ON public.coaches(current_club);

-- Availability
CREATE INDEX IF NOT EXISTS idx_availability_coach_location_date 
  ON public.availability(coach_id, location_id, starts_at, status);
CREATE INDEX IF NOT EXISTS idx_availability_location_date 
  ON public.availability(location_id, starts_at, status);
CREATE INDEX IF NOT EXISTS idx_availability_coach_date 
  ON public.availability(coach_id, starts_at, status);

-- 5) TRIGGERS (for updated_at) -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Apply triggers to new tables (Fixed: Removed IF NOT EXISTS)
DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_availability_updated_at ON public.availability;
CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6) RLS SETUP ---------------------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Pattern 4: Public Read, Private Write
CREATE POLICY IF NOT EXISTS "public_can_read_locations"
  ON public.locations
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_locations"
  ON public.locations
  FOR SELECT
  TO authenticated
  USING (true);

-- Pattern 2: Simple User Ownership for availability
CREATE POLICY IF NOT EXISTS "coaches_manage_own_availability"
  ON public.availability
  FOR ALL
  TO authenticated
  USING (
    coach_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() AND up.role IN ('director', 'coach')
    )
  )
  WITH CHECK (
    coach_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() AND up.role IN ('director', 'coach')
    )
  );

-- Public read for availability (parents need to see available slots)
CREATE POLICY IF NOT EXISTS "public_can_read_available_slots"
  ON public.availability
  FOR SELECT
  TO public
  USING (status = 'open');

-- 7) SEED DATA ---------------------------------------------------------------------------------
-- Insert locations (idempotent)
INSERT INTO public.locations (name, address, facility_summary, is_active)
VALUES
  ('Lochwinnoch — Lochbarr Services Leisure Centre','TBC','3G surface; indoor space; parking', true),
  ('Airdrie — Venue TBC','TBC','Floodlit pitches; changing rooms', true),
  ('East Kilbride — Venue TBC','TBC','Multiple pitches; parent viewing', true),
  ('Glasgow South / Castlemilk — Venue TBC','TBC','All-weather surface; parking', true)
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  facility_summary = EXCLUDED.facility_summary,
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Update existing coaches with specialties and current_club data
DO $$
DECLARE
  coach_record RECORD;
  jack_id UUID;
  malcolm_id UUID;
  mairead_id UUID;
  katie_id UUID;
  stephen_id UUID;
  aidan_id UUID;
  benji_id UUID;
  fraser_id UUID;
BEGIN
  -- Get coach IDs by matching with user_profiles
  SELECT c.id INTO jack_id 
  FROM public.coaches c 
  JOIN public.user_profiles up ON c.id = up.id 
  WHERE up.full_name ILIKE '%jack%' OR c.name ILIKE '%jack%'
  LIMIT 1;
  
  SELECT c.id INTO malcolm_id 
  FROM public.coaches c 
  JOIN public.user_profiles up ON c.id = up.id 
  WHERE up.full_name ILIKE '%malcolm%' OR c.name ILIKE '%malcolm%'
  LIMIT 1;

  -- Update existing coaches with Empire Performance data
  IF jack_id IS NOT NULL THEN
    UPDATE public.coaches SET
      current_club = 'Glenvale FC',
      specialties = ARRAY['1-to-1 Development','Finishing','Mentoring'],
      bio = COALESCE(bio, 'Director at Lochwinnoch. Active player at Glenvale; focuses on technical foundations and turning repetitions into match habits.'),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = jack_id;
  END IF;

  IF malcolm_id IS NOT NULL THEN
    UPDATE public.coaches SET
      specialties = ARRAY['Youth Pathways','Session Design','Academy Methodology'],
      bio = COALESCE(bio, 'Leads the Airdrie setup; builds structured, repeatable sessions and clear development plans across age groups.'),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = malcolm_id;
  END IF;

  -- Add mock coaches if none exist (create names that match Empire Performance requirements)
  IF NOT EXISTS (SELECT 1 FROM public.coaches LIMIT 1) THEN
    -- This block would only run if no coaches exist at all
    RAISE NOTICE 'No existing coaches found. Consider adding coaches through the admin interface.';
  ELSE
    -- Update all existing coaches to have specialties if they don't
    UPDATE public.coaches SET
      specialties = CASE 
        WHEN specialties IS NULL OR array_length(specialties, 1) IS NULL THEN
          ARRAY[COALESCE(specialization, 'General Training')]
        ELSE specialties
      END,
      current_club = COALESCE(current_club, 'Empire Performance'),
      updated_at = CURRENT_TIMESTAMP
    WHERE specialties IS NULL OR array_length(specialties, 1) IS NULL;
  END IF;

  -- Create sample availability for existing coaches (next 2 weeks)
  INSERT INTO public.availability (coach_id, location_id, starts_at, ends_at, status)
  SELECT 
    c.id as coach_id,
    l.id as location_id,
    (CURRENT_DATE + INTERVAL '1 day' * day_offset + INTERVAL '1 hour' * hour_offset) as starts_at,
    (CURRENT_DATE + INTERVAL '1 day' * day_offset + INTERVAL '1 hour' * (hour_offset + 1)) as ends_at,
    'open' as status
  FROM public.coaches c
  CROSS JOIN public.locations l
  CROSS JOIN generate_series(1, 14) as day_offset  -- Next 14 days
  CROSS JOIN generate_series(9, 17) as hour_offset -- 9 AM to 5 PM slots
  WHERE c.id IN (SELECT id FROM public.coaches LIMIT 3) -- Limit to first 3 coaches to avoid too much data
    AND day_offset % 2 = 1 -- Only odd days to create realistic availability pattern
    AND hour_offset IN (10, 14, 16) -- Only specific hours: 10 AM, 2 PM, 4 PM
  ON CONFLICT DO NOTHING; -- Avoid duplicate entries if run multiple times

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating coach data: %', SQLERRM;
END $$;

-- 8) REFRESH POSTGREST SCHEMA CACHE -----------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- 9) VALIDATION QUERIES (for manual testing) --------------------------------------------------
-- Verify locations exist
-- SELECT name, facility_summary, is_active FROM public.locations ORDER BY name;

-- Verify coaches have specialties
-- SELECT name, specialties, current_club FROM public.coaches WHERE name IS NOT NULL ORDER BY name;

-- Verify availability exists  
-- SELECT COUNT(*) as availability_count FROM public.availability WHERE status = 'open';

-- Final verification - check table structures
-- \d public.locations
-- \d public.coaches  
-- \d public.availability