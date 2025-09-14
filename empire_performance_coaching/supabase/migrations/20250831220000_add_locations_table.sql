-- Location: supabase/migrations/20250831220000_add_locations_table.sql
-- Schema Analysis: Existing Empire Performance Coaching schema with user_profiles, coaches, sessions, etc.
-- Integration Type: Addition - Adding missing locations table
-- Dependencies: References existing user_profiles table

-- Create locations table to match the expected structure from the frontend code
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    facility_summary TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common queries
CREATE INDEX idx_locations_is_active ON public.locations(is_active);
CREATE INDEX idx_locations_name ON public.locations(name);

-- Enable RLS for locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Pattern 4: Public Read (locations should be publicly viewable)
CREATE POLICY "public_can_read_locations"
ON public.locations
FOR SELECT
TO public
USING (true);

-- RLS Policy - Directors can manage locations (using role-based access)
CREATE POLICY "directors_manage_locations"
ON public.locations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'director'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'director'
    )
);

-- Insert the locations data that matches the hardcoded fallback data in the frontend
DO $$
BEGIN
    INSERT INTO public.locations (name, address, facility_summary, is_active) VALUES
        ('Lochwinnoch — Lochbarr Services Leisure Centre', 'TBC', '3G surface; indoor space; parking', true),
        ('Airdrie — Venue TBC', 'TBC', 'Floodlit pitches; changing rooms', true),
        ('East Kilbride — Venue TBC', 'TBC', 'Multiple pitches; parent viewing', true),
        ('Glasgow South / Castlemilk — Venue TBC', 'TBC', 'All-weather surface; parking', true);
        
    RAISE NOTICE 'Successfully inserted Empire Performance locations data';
END $$;

-- Add updated_at trigger for locations
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();