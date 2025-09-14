-- Empire Performance Coaching - Navigation + Booking Fixes Migration
-- Schema Analysis: Existing schema has user_profiles, coaches, athletes, booking_series, coach_availability, sessions
-- Integration Type: Enhancement - Adding missing columns and updating coach data
-- Dependencies: user_profiles, coaches, coach_availability tables

-- Add missing columns to coaches table for enhanced coach profiles
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS current_club TEXT;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS locations_served TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add locations table if not exists (from user requirements)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    notes TEXT,
    facility_summary TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for locations updated_at
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable RLS on locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policy for locations (public read access)
CREATE POLICY "public_can_read_locations" 
ON public.locations
FOR SELECT 
TO public 
USING (is_active = true);

-- Create policy for authenticated users to manage locations
CREATE POLICY "authenticated_users_manage_locations" 
ON public.locations
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Insert the 4 new locations with facility summaries as specified
INSERT INTO public.locations (name, address, notes, facility_summary, is_active) VALUES
('Lochwinnoch — Lochbarr Services Leisure Centre', 'TBC', '', '3G surface; indoor space; parking', true),
('Airdrie — Venue TBC', 'TBC', '', 'Floodlit pitches; changing rooms', true),
('East Kilbride — Venue TBC', 'TBC', '', 'Multiple pitches; parent viewing', true),
('Glasgow South / Castlemilk — Venue TBC', 'TBC', '', 'All-weather surface; parking', true)
ON CONFLICT (name) DO UPDATE SET
    address = EXCLUDED.address,
    facility_summary = EXCLUDED.facility_summary,
    is_active = true;

-- Update coaches with specialties, clubs, and display names as specified in requirements
UPDATE public.coaches SET 
    display_name = 'Jack Haggerty',
    specialties = ARRAY['1-to-1 Development','Finishing','Mentoring'],
    current_club = 'Glenvale FC',
    locations_served = ARRAY['Lochwinnoch — Lochbarr Services Leisure Centre']
WHERE bio LIKE '%Jack%' OR bio LIKE '%Haggerty%';

UPDATE public.coaches SET 
    display_name = 'Malcolm McLean',
    specialties = ARRAY['Youth Pathways','Session Design','Academy Methodology'],
    locations_served = ARRAY['Airdrie — Venue TBC', 'East Kilbride — Venue TBC']
WHERE bio LIKE '%Malcolm%' OR bio LIKE '%McLean%';

UPDATE public.coaches SET 
    display_name = 'Mairead Fulton',
    specialties = ARRAY['Women & Girls','Midfield','Professionalism'],
    current_club = 'Glasgow City FC',
    locations_served = ARRAY['Glasgow South / Castlemilk — Venue TBC']
WHERE bio LIKE '%Mairead%' OR bio LIKE '%Fulton%';

UPDATE public.coaches SET 
    display_name = 'Katie Lockwood',
    specialties = ARRAY['Attacking','Finishing','Pressing'],
    current_club = 'Glasgow City FC',
    locations_served = ARRAY['East Kilbride — Venue TBC', 'Glasgow South / Castlemilk — Venue TBC']
WHERE bio LIKE '%Katie%' OR bio LIKE '%Lockwood%';

UPDATE public.coaches SET 
    display_name = 'Stephen Mallan',
    specialties = ARRAY['Set Pieces','Long-Range Shooting','Midfield'],
    locations_served = ARRAY['Lochwinnoch — Lochbarr Services Leisure Centre', 'Airdrie — Venue TBC']
WHERE bio LIKE '%Stephen%' OR bio LIKE '%Mallan%';

UPDATE public.coaches SET 
    display_name = 'Aidan Nesbitt',
    specialties = ARRAY['Creativity','First Touch','Final Third'],
    current_club = 'Falkirk FC',
    locations_served = ARRAY['East Kilbride — Venue TBC']
WHERE bio LIKE '%Aidan%' OR bio LIKE '%Nesbitt%';

UPDATE public.coaches SET 
    display_name = 'Benji Wright',
    specialties = ARRAY['Conditioning','Speed/Agility','Finishing'],
    current_club = 'Cumnock Juniors',
    locations_served = ARRAY['Airdrie — Venue TBC']
WHERE bio LIKE '%Benji%' OR bio LIKE '%Wright%';

UPDATE public.coaches SET 
    display_name = 'Fraser McFadzean',
    specialties = ARRAY['Youth Development','Technical Foundations','Ball Mastery'],
    current_club = 'Glenvale FC',
    locations_served = ARRAY['Lochwinnoch — Lochbarr Services Leisure Centre']
WHERE bio LIKE '%Fraser%' OR bio LIKE '%McFadzean%';

-- If no coaches match the name patterns above, insert sample coaches
DO $$
DECLARE
    coach_count INT;
    sample_user_id UUID;
BEGIN
    SELECT COUNT(*) INTO coach_count FROM public.coaches WHERE display_name IS NOT NULL;
    
    IF coach_count = 0 THEN
        -- Get a sample user_id from user_profiles for coach creation
        SELECT id INTO sample_user_id FROM public.user_profiles WHERE role = 'coach' LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            -- Insert sample coach data
            INSERT INTO public.coaches (id, display_name, specialties, current_club, locations_served, bio, hourly_rate) VALUES
            (sample_user_id, 'Jack Haggerty', ARRAY['1-to-1 Development','Finishing','Mentoring'], 'Glenvale FC', ARRAY['Lochwinnoch — Lochbarr Services Leisure Centre'], 'Experienced coach specializing in individual player development and finishing techniques.', 75);
        END IF;
    END IF;
END $$;

-- Add RLS policy for coach availability management (coaches can only manage their own)
DROP POLICY IF EXISTS "coach_manage_own_availability" ON public.coach_availability;
CREATE POLICY "coach_manage_own_availability"
ON public.coach_availability 
FOR ALL 
TO authenticated
USING (
  auth.uid() = (
    SELECT profile_id FROM public.coaches
    WHERE coaches.id = coach_availability.coach_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT profile_id FROM public.coaches  
    WHERE coaches.id = coach_availability.coach_id
  )
);