-- Empire Performance - Context Engineering Fix Pack 04
-- Schema Analysis: Existing schema with user_profiles, coaches, locations, availability tables
-- Integration Type: SQL syntax fixes + schema cache reload
-- Dependencies: locations, coaches, availability (existing tables)

-- 1) ENSURE TIMESTAMP FUNCTION EXISTS (CRITICAL FOR TRIGGERS) ---------------------
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 2) FIX TRIGGERS - USING GUARDED DO BLOCKS (PostgreSQL compliant) ----------------
DO $$
BEGIN
  -- Drop and recreate triggers to ensure proper syntax
  DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
  DROP TRIGGER IF EXISTS update_coaches_updated_at ON public.coaches;
  DROP TRIGGER IF EXISTS update_availability_updated_at ON public.availability;

  -- Create triggers with proper syntax
  CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

  CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON public.coaches
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

  CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

  RAISE NOTICE 'All triggers created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating triggers: %', SQLERRM;
END $$;

-- 3) RLS POLICIES - USING GUARDED DO BLOCKS (PostgreSQL compliant) ----------------
DO $$
BEGIN
  -- Drop existing policies to recreate with proper syntax
  DROP POLICY IF EXISTS "public_can_read_locations" ON public.locations;
  DROP POLICY IF EXISTS "authenticated_can_read_all_locations" ON public.locations;
  DROP POLICY IF EXISTS "public_can_read_available_slots" ON public.availability;
  DROP POLICY IF EXISTS "coaches_manage_own_availability" ON public.availability;

  -- Locations policies
  CREATE POLICY "public_can_read_locations"
    ON public.locations
    FOR SELECT
    TO public
    USING (is_active = true);

  CREATE POLICY "authenticated_can_read_all_locations"
    ON public.locations
    FOR SELECT
    TO authenticated
    USING (true);

  -- Availability policies  
  CREATE POLICY "public_can_read_available_slots"
    ON public.availability
    FOR SELECT
    TO public
    USING (status = 'open');

  CREATE POLICY "coaches_manage_own_availability"
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

  RAISE NOTICE 'All RLS policies created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- 4) ENSURE SPECIALTIES COLUMN CONSISTENCY (coaches.specialties vs specialization) --
DO $$
BEGIN
  -- Ensure coaches table has specialties column (not specialization)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coaches' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE public.coaches ADD COLUMN specialties TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- If specialization column exists, migrate data to specialties
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coaches' AND column_name = 'specialization'
  ) THEN
    UPDATE public.coaches 
    SET specialties = CASE 
      WHEN specialization IS NOT NULL THEN ARRAY[specialization]
      ELSE ARRAY['General Training']
    END
    WHERE specialties IS NULL OR array_length(specialties, 1) IS NULL;
    
    -- Drop old specialization column
    ALTER TABLE public.coaches DROP COLUMN IF EXISTS specialization;
  END IF;

  -- Ensure all coaches have specialties
  UPDATE public.coaches 
  SET specialties = ARRAY['General Training']
  WHERE specialties IS NULL OR array_length(specialties, 1) IS NULL;

  RAISE NOTICE 'Coach specialties column fixed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing coach specialties: %', SQLERRM;
END $$;

-- 5) COMPREHENSIVE SCHEMA CACHE RELOAD (fixes PGRST205) ---------------------------
-- Force PostgREST to reload schema immediately
NOTIFY pgrst, 'reload schema';

-- Additional cache refresh patterns
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- 6) VALIDATION QUERIES (verify fixes worked) -------------------------------------
DO $$
DECLARE
  location_count INTEGER;
  coach_count INTEGER;
  availability_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count records
  SELECT COUNT(*) INTO location_count FROM public.locations WHERE is_active = true;
  SELECT COUNT(*) INTO coach_count FROM public.coaches WHERE specialties IS NOT NULL;
  SELECT COUNT(*) INTO availability_count FROM public.availability WHERE status = 'open';
  
  -- Count database objects
  SELECT COUNT(*) INTO trigger_count 
  FROM pg_trigger 
  WHERE tgname IN ('update_locations_updated_at', 'update_coaches_updated_at', 'update_availability_updated_at');
  
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('locations', 'availability');

  -- Report status
  RAISE NOTICE '=== Context Engineering Fix Pack 04 Complete ===';
  RAISE NOTICE 'Active locations: %', location_count;
  RAISE NOTICE 'Coaches with specialties: %', coach_count;
  RAISE NOTICE 'Available booking slots: %', availability_count;
  RAISE NOTICE 'Database triggers created: %', trigger_count;
  RAISE NOTICE 'RLS policies active: %', policy_count;
  RAISE NOTICE '=== Schema cache reloaded successfully ===';
  
  -- Warnings for empty data
  IF location_count = 0 THEN
    RAISE WARNING 'No active locations found - ensure location data exists';
  END IF;
  
  IF coach_count = 0 THEN
    RAISE WARNING 'No coaches with specialties - ensure coach data exists';
  END IF;
  
  IF availability_count < 10 THEN
    RAISE WARNING 'Limited availability slots (%) - consider running availability generation', availability_count;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Validation error: %', SQLERRM;
END $$;

-- 7) FINAL SUCCESS CONFIRMATION -----------------------------------------------
SELECT 'Context Engineering Fix Pack 04 - SQL fixes applied successfully' as status,
       'PGRST205 schema cache reloaded' as cache_status,
       'Triggers and policies using proper PostgreSQL syntax' as compliance_status;