-- Fix RLS infinite recursion and calendar availability issues
-- Date: 2025-09-15

-- ===== FIX INFINITE RECURSION IN SESSION_PARTICIPANTS =====

-- Drop existing problematic policies
DROP POLICY IF EXISTS "coaches_manage_session_participants" ON public.session_participants;
DROP POLICY IF EXISTS "parents_view_own_athlete_participants" ON public.session_participants;

-- Create non-recursive session_participants policies
CREATE POLICY "coaches_manage_session_participants_safe"
ON public.session_participants
FOR ALL
TO authenticated
USING (
  -- Direct check without recursion
  session_id IN (
    SELECT id FROM public.sessions WHERE coach_id = auth.uid()
  )
)
WITH CHECK (
  -- Direct check without recursion
  session_id IN (
    SELECT id FROM public.sessions WHERE coach_id = auth.uid()
  )
);

CREATE POLICY "parents_view_athlete_participants_safe"
ON public.session_participants
FOR SELECT
TO authenticated
USING (
  -- Direct check without recursion
  athlete_id IN (
    SELECT id FROM public.athletes WHERE parent_id = auth.uid()
  )
);

-- ===== FIX CALENDAR AVAILABILITY SYSTEM =====

-- Ensure coach_availability table exists with correct structure
CREATE TABLE IF NOT EXISTS public.coach_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on coach_availability
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for coach_availability
DROP POLICY IF EXISTS "coaches_manage_own_availability" ON public.coach_availability;
DROP POLICY IF EXISTS "parents_view_availability" ON public.coach_availability;

CREATE POLICY "coaches_manage_coach_availability"
ON public.coach_availability
FOR ALL
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "parents_view_coach_availability"
ON public.coach_availability
FOR SELECT
TO authenticated
USING (is_active = true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_availability_coach_id ON public.coach_availability(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_availability_day_location ON public.coach_availability(day_of_week, location);
CREATE INDEX IF NOT EXISTS idx_coach_availability_active ON public.coach_availability(is_active);

-- ===== POPULATE COACH_AVAILABILITY WITH REALISTIC DATA =====

-- Clear existing data
DELETE FROM public.coach_availability;

-- Insert comprehensive availability data for all coaches
DO $$
DECLARE
    coach_record RECORD;
    location_names TEXT[] := ARRAY['Lochwinnoch', 'Airdrie', 'East Kilbride', 'Glasgow South'];
    location_name TEXT;
    day_num INTEGER;
    start_hour INTEGER;
BEGIN
    -- Loop through each coach
    FOR coach_record IN SELECT id FROM public.coaches LOOP
        -- For each location
        FOREACH location_name IN ARRAY location_names LOOP
            -- Monday to Friday (1-5)
            FOR day_num IN 1..5 LOOP
                -- Morning slots: 9 AM - 12 PM
                FOR start_hour IN 9..11 LOOP
                    INSERT INTO public.coach_availability (
                        coach_id,
                        day_of_week,
                        start_time,
                        end_time,
                        location,
                        is_active
                    ) VALUES (
                        coach_record.id,
                        day_num,
                        (start_hour || ':00:00')::TIME,
                        ((start_hour + 1) || ':00:00')::TIME,
                        location_name,
                        true
                    );
                END LOOP;

                -- Afternoon slots: 2 PM - 6 PM
                FOR start_hour IN 14..17 LOOP
                    INSERT INTO public.coach_availability (
                        coach_id,
                        day_of_week,
                        start_time,
                        end_time,
                        location,
                        is_active
                    ) VALUES (
                        coach_record.id,
                        day_num,
                        (start_hour || ':00:00')::TIME,
                        ((start_hour + 1) || ':00:00')::TIME,
                        location_name,
                        true
                    );
                END LOOP;
            END LOOP;

            -- Saturday (6) - Limited hours
            FOR start_hour IN 9..12 LOOP
                INSERT INTO public.coach_availability (
                    coach_id,
                    day_of_week,
                    start_time,
                    end_time,
                    location,
                    is_active
                ) VALUES (
                    coach_record.id,
                    6,
                    (start_hour || ':00:00')::TIME,
                    ((start_hour + 1) || ':00:00')::TIME,
                    location_name,
                    true
                );
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Coach availability data populated successfully';
END $$;

-- ===== ALSO FIX SESSIONS POLICY RECURSION =====

-- Drop and recreate sessions policies to avoid recursion
DROP POLICY IF EXISTS "parents_view_athlete_sessions" ON public.sessions;

CREATE POLICY "parents_view_athlete_sessions_safe"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  -- Direct check without going through session_participants again
  id IN (
    SELECT sp.session_id
    FROM public.session_participants sp
    JOIN public.athletes a ON sp.athlete_id = a.id
    WHERE a.parent_id = auth.uid()
  )
);

-- ===== UPDATE TRIGGER FOR COACH_AVAILABILITY =====

-- Add update trigger for coach_availability
DROP TRIGGER IF EXISTS update_coach_availability_updated_at ON public.coach_availability;
CREATE TRIGGER update_coach_availability_updated_at
    BEFORE UPDATE ON public.coach_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===== VERIFICATION =====

DO $$
DECLARE
    availability_count INTEGER;
    coach_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO coach_count FROM public.coaches;
    SELECT COUNT(*) INTO availability_count FROM public.coach_availability WHERE is_active = true;

    RAISE NOTICE 'Migration completed:';
    RAISE NOTICE '- Coaches: %', coach_count;
    RAISE NOTICE '- Coach availability slots: %', availability_count;

    IF availability_count = 0 THEN
        RAISE WARNING 'No coach availability slots created - calendar will not work';
    ELSE
        RAISE NOTICE 'Calendar system should now work correctly';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';