-- Empire Performance Coaching - Final Build Fixes Migration
-- Schema Analysis: Existing schema has user_profiles, coaches, athletes, booking_series, coach_availability, sessions, locations
-- Integration Type: Enhancement - Final fixes for production-ready booking system
-- Dependencies: user_profiles, coaches, coach_availability, locations tables

-- Add availability table if missing with correct structure
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'booked', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create performance index for availability queries
CREATE INDEX IF NOT EXISTS idx_availability_location_date 
ON public.availability (location_id, starts_at, status);

-- Enable RLS on availability table
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- RLS policy for coaches to manage their own availability
CREATE POLICY "coaches_manage_own_availability"
ON public.availability
FOR ALL
TO authenticated
USING (
  coach_id = auth.uid()
)
WITH CHECK (
  coach_id = auth.uid()
);

-- RLS policy for parents to view available slots
CREATE POLICY "parents_view_available_slots"
ON public.availability
FOR SELECT
TO authenticated
USING (status = 'open');

-- Update coaches table to ensure all required fields exist
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='display_name') THEN
        ALTER TABLE public.coaches ADD COLUMN display_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='current_club') THEN
        ALTER TABLE public.coaches ADD COLUMN current_club TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='specialties') THEN
        ALTER TABLE public.coaches ADD COLUMN specialties TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='locations_served') THEN
        ALTER TABLE public.coaches ADD COLUMN locations_served TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Backfill display_name from user_profiles.full_name where missing
UPDATE public.coaches 
SET display_name = up.full_name
FROM public.user_profiles up
WHERE coaches.id = up.id 
AND coaches.display_name IS NULL;

-- Update existing coach data with proper information
UPDATE public.coaches SET 
    display_name = COALESCE(display_name, 'Coach'),
    current_club = COALESCE(current_club, 'Empire Performance'),
    specialties = COALESCE(specialties, ARRAY['General Training']),
    locations_served = COALESCE(locations_served, ARRAY['Multiple Locations'])
WHERE display_name IS NULL 
   OR current_club IS NULL 
   OR specialties IS NULL 
   OR locations_served IS NULL;

-- Insert comprehensive coach availability data for all locations and days
DO $$
DECLARE
    coach_record RECORD;
    location_record RECORD;
    day_counter INTEGER;
    hour_counter INTEGER;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '90 days';
    current_date DATE;
BEGIN
    -- Loop through each coach
    FOR coach_record IN SELECT id FROM public.coaches LOOP
        -- Loop through each location
        FOR location_record IN SELECT id, name FROM public.locations WHERE is_active = true LOOP
            -- Generate availability for next 90 days
            current_date := start_date;
            WHILE current_date <= end_date LOOP
                -- Skip Sundays (0) for most availability
                IF EXTRACT(DOW FROM current_date) != 0 THEN
                    -- Create morning slots (9 AM - 12 PM)
                    FOR hour_counter IN 9..11 LOOP
                        INSERT INTO public.availability (
                            coach_id,
                            location_id,
                            starts_at,
                            ends_at,
                            status
                        ) VALUES (
                            coach_record.id,
                            location_record.id,
                            current_date + (hour_counter || ' hours')::INTERVAL,
                            current_date + ((hour_counter + 1) || ' hours')::INTERVAL,
                            'open'
                        ) ON CONFLICT DO NOTHING;
                    END LOOP;
                    
                    -- Create afternoon slots (2 PM - 6 PM)
                    FOR hour_counter IN 14..17 LOOP
                        INSERT INTO public.availability (
                            coach_id,
                            location_id,
                            starts_at,
                            ends_at,
                            status
                        ) VALUES (
                            coach_record.id,
                            location_record.id,
                            current_date + (hour_counter || ' hours')::INTERVAL,
                            current_date + ((hour_counter + 1) || ' hours')::INTERVAL,
                            'open'
                        ) ON CONFLICT DO NOTHING;
                    END LOOP;
                    
                    -- Create evening slots (6 PM - 8 PM) for weekdays only
                    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
                        FOR hour_counter IN 18..19 LOOP
                            INSERT INTO public.availability (
                                coach_id,
                                location_id,
                                starts_at,
                                ends_at,
                                status
                            ) VALUES (
                                coach_record.id,
                                location_record.id,
                                current_date + (hour_counter || ' hours')::INTERVAL,
                                current_date + ((hour_counter + 1) || ' hours')::INTERVAL,
                                'open'
                            ) ON CONFLICT DO NOTHING;
                        END LOOP;
                    END IF;
                END IF;
                
                current_date := current_date + INTERVAL '1 day';
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Fix PostgreSQL trigger syntax (PostgreSQL doesn't support CREATE TRIGGER IF NOT EXISTS)
DROP TRIGGER IF EXISTS update_availability_updated_at ON public.availability;
CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create function to get coach availability for booking system
CREATE OR REPLACE FUNCTION public.get_coach_availability(
    p_location_id UUID DEFAULT NULL,
    p_date DATE DEFAULT NULL,
    p_coach_id UUID DEFAULT NULL
)
RETURNS TABLE(
    availability_id UUID,
    coach_id UUID,
    coach_name TEXT,
    location_id UUID,
    location_name TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    status TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        a.id as availability_id,
        a.coach_id,
        up.full_name as coach_name,
        a.location_id,
        l.name as location_name,
        a.starts_at,
        a.ends_at,
        a.status
    FROM public.availability a
    JOIN public.user_profiles up ON a.coach_id = up.id
    JOIN public.locations l ON a.location_id = l.id
    WHERE 
        (p_location_id IS NULL OR a.location_id = p_location_id)
        AND (p_date IS NULL OR DATE(a.starts_at) = p_date)
        AND (p_coach_id IS NULL OR a.coach_id = p_coach_id)
        AND a.status = 'open'
        AND a.starts_at > NOW()
    ORDER BY a.starts_at;
$$;

-- Update locations table to ensure complete data
UPDATE public.locations SET
    facility_summary = CASE 
        WHEN name LIKE '%Lochwinnoch%' THEN '3G surface; indoor space; parking'
        WHEN name LIKE '%Airdrie%' THEN 'Floodlit pitches; changing rooms'
        WHEN name LIKE '%East Kilbride%' THEN 'Multiple pitches; parent viewing'
        WHEN name LIKE '%Glasgow South%' THEN 'All-weather surface; parking'
        ELSE COALESCE(facility_summary, 'Professional facilities with excellent amenities')
    END
WHERE facility_summary IS NULL OR facility_summary = '';

-- Add comprehensive mock availability data
DO $$
DECLARE
    existing_coach_id UUID;
    existing_location_id UUID;
    sample_date DATE := CURRENT_DATE + 1; -- Tomorrow
BEGIN
    -- Get first active coach and location
    SELECT id INTO existing_coach_id FROM public.coaches LIMIT 1;
    SELECT id INTO existing_location_id FROM public.locations WHERE is_active = true LIMIT 1;
    
    -- Add some sample availability for immediate testing
    IF existing_coach_id IS NOT NULL AND existing_location_id IS NOT NULL THEN
        INSERT INTO public.availability (coach_id, location_id, starts_at, ends_at, status) VALUES
            (existing_coach_id, existing_location_id, sample_date + INTERVAL '10 hours', sample_date + INTERVAL '11 hours', 'open'),
            (existing_coach_id, existing_location_id, sample_date + INTERVAL '14 hours', sample_date + INTERVAL '15 hours', 'open'),
            (existing_coach_id, existing_location_id, sample_date + INTERVAL '16 hours', sample_date + INTERVAL '17 hours', 'open')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create function to book a session
CREATE OR REPLACE FUNCTION public.book_session(
    p_availability_id UUID,
    p_athlete_name TEXT,
    p_parent_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    booking_id UUID,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_availability_record RECORD;
    v_booking_id UUID;
    v_parent_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO v_parent_id;
    
    -- Check if user is authenticated
    IF v_parent_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 'User not authenticated';
        RETURN;
    END IF;
    
    -- Get availability record and lock it
    SELECT a.*, l.name as location_name
    INTO v_availability_record
    FROM public.availability a
    JOIN public.locations l ON a.location_id = l.id
    WHERE a.id = p_availability_id
    AND a.status = 'open'
    FOR UPDATE;
    
    -- Check if availability exists and is open
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Availability slot not found or already booked';
        RETURN;
    END IF;
    
    -- Mark availability as booked
    UPDATE public.availability 
    SET status = 'booked'
    WHERE id = p_availability_id;
    
    -- Create session record
    INSERT INTO public.sessions (
        coach_id,
        title,
        start_time,
        end_time,
        location,
        type,
        status,
        notes
    ) VALUES (
        v_availability_record.coach_id,
        'Football Training Session',
        v_availability_record.starts_at,
        v_availability_record.ends_at,
        v_availability_record.location_name,
        'individual',
        'scheduled',
        COALESCE(p_parent_notes, 'Booked via online booking system')
    )
    RETURNING id INTO v_booking_id;
    
    RETURN QUERY SELECT true, v_booking_id, 'Session booked successfully';
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_coach_availability TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_session TO authenticated;

-- Final validation: Ensure all required data exists
DO $$
DECLARE
    coach_count INTEGER;
    location_count INTEGER;
    availability_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO coach_count FROM public.coaches;
    SELECT COUNT(*) INTO location_count FROM public.locations WHERE is_active = true;
    SELECT COUNT(*) INTO availability_count FROM public.availability WHERE status = 'open';
    
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Coaches: %', coach_count;
    RAISE NOTICE '- Active locations: %', location_count;
    RAISE NOTICE '- Available slots: %', availability_count;
    
    IF coach_count = 0 THEN
        RAISE WARNING 'No coaches found - please ensure coach data exists';
    END IF;
    
    IF location_count = 0 THEN
        RAISE WARNING 'No active locations found - please ensure location data exists';
    END IF;
    
    IF availability_count = 0 THEN
        RAISE WARNING 'No availability slots generated - please check coach_availability generation';
    END IF;
END $$;

-- Refresh schema cache (fix PGRST205 warning)
NOTIFY pgrst, 'reload schema';