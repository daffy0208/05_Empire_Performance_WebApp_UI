-- Empire Performance Coaching Database Schema
-- Handles multi-role coaching platform with authentication

-- ===== TYPES AND ENUMS =====
CREATE TYPE public.user_role AS ENUM ('parent', 'coach', 'director');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.session_type AS ENUM ('individual', 'group', 'team');
CREATE TYPE public.booking_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('card', 'cash', 'bank_transfer');

-- ===== CORE TABLES =====

-- User profiles (required intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'parent'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Coaches extended profile information
CREATE TABLE public.coaches (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    specialization TEXT,
    experience_years INTEGER DEFAULT 0,
    certifications TEXT[],
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Athletes/Players information
CREATE TABLE public.athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Training sessions
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    type public.session_type DEFAULT 'individual'::public.session_type,
    status public.session_status DEFAULT 'scheduled'::public.session_status,
    is_cash_payment BOOLEAN DEFAULT false,
    notes TEXT,
    special_instructions TEXT,
    weather_alert BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Session participants (many-to-many relationship)
CREATE TABLE public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, athlete_id)
);

-- Booking series (recurring bookings)
CREATE TABLE public.booking_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    series_name TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'weekly', 'biweekly', 'monthly'
    duration_minutes INTEGER NOT NULL,
    price_per_session DECIMAL(10,2) NOT NULL,
    total_sessions INTEGER NOT NULL,
    completed_sessions INTEGER DEFAULT 0,
    status public.booking_status DEFAULT 'active'::public.booking_status,
    next_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status public.invoice_status DEFAULT 'pending'::public.invoice_status,
    payment_method public.payment_method,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    athlete_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_coaches_user_id ON public.coaches(id);
CREATE INDEX idx_athletes_parent_id ON public.athletes(parent_id);
CREATE INDEX idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_athlete_id ON public.session_participants(athlete_id);
CREATE INDEX idx_booking_series_parent_id ON public.booking_series(parent_id);
CREATE INDEX idx_booking_series_coach_id ON public.booking_series(coach_id);
CREATE INDEX idx_booking_series_athlete_id ON public.booking_series(athlete_id);
CREATE INDEX idx_invoices_parent_id ON public.invoices(parent_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ===== FUNCTIONS =====

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ===== ENABLE RLS =====
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- User Profiles - Core user table (Pattern 1)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Coaches - Simple user ownership (Pattern 2)
CREATE POLICY "users_manage_own_coaches"
ON public.coaches
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Athletes - Parent ownership
CREATE POLICY "parents_manage_own_athletes"
ON public.athletes
FOR ALL
TO authenticated
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Sessions - Coach ownership with read access for participants
CREATE POLICY "coaches_manage_own_sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "parents_view_athlete_sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_participants sp
    JOIN public.athletes a ON sp.athlete_id = a.id
    WHERE sp.session_id = sessions.id AND a.parent_id = auth.uid()
  )
);

-- Session Participants - Access through sessions and athletes
CREATE POLICY "coaches_manage_session_participants"
ON public.session_participants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_participants.session_id AND s.coach_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_participants.session_id AND s.coach_id = auth.uid()
  )
);

CREATE POLICY "parents_view_own_athlete_participants"
ON public.session_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.athletes a
    WHERE a.id = session_participants.athlete_id AND a.parent_id = auth.uid()
  )
);

-- Booking Series - Parent and coach access
CREATE POLICY "parents_manage_own_booking_series"
ON public.booking_series
FOR ALL
TO authenticated
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "coaches_view_assigned_booking_series"
ON public.booking_series
FOR SELECT
TO authenticated
USING (coach_id = auth.uid());

-- Invoices - Parent ownership
CREATE POLICY "parents_manage_own_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Invoice Items - Through invoice relationship
CREATE POLICY "parents_manage_own_invoice_items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id AND i.parent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id AND i.parent_id = auth.uid()
  )
);

-- Notifications - User ownership (Pattern 2)
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===== TRIGGERS =====

-- Auto-create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_booking_series_updated_at
  BEFORE UPDATE ON public.booking_series
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===== MOCK DATA =====
DO $$
DECLARE
    parent_uuid UUID := gen_random_uuid();
    coach_uuid UUID := gen_random_uuid();
    director_uuid UUID := gen_random_uuid();
    athlete1_uuid UUID := gen_random_uuid();
    athlete2_uuid UUID := gen_random_uuid();
    session1_uuid UUID := gen_random_uuid();
    session2_uuid UUID := gen_random_uuid();
    session3_uuid UUID := gen_random_uuid();
    booking1_uuid UUID := gen_random_uuid();
    booking2_uuid UUID := gen_random_uuid();
    invoice1_uuid UUID := gen_random_uuid();
    invoice2_uuid UUID := gen_random_uuid();
    invoice3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (parent_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'parent@test.com', crypt('parent123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sarah Johnson", "role": "parent"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (coach_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'coach@test.com', crypt('coach123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Marcus Thompson", "role": "coach"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (director_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'director@test.com', crypt('director123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Director Admin", "role": "director"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create coach profile
    INSERT INTO public.coaches (id, specialization, experience_years, certifications, hourly_rate, bio)
    VALUES (
        coach_uuid,
        'Youth Football Development',
        8,
        ARRAY['NFHS Certified', 'Youth Sports Safety'],
        85.00,
        'Experienced youth coach specializing in technical skills development and team strategy.'
    );

    -- Create athletes
    INSERT INTO public.athletes (id, parent_id, name, birth_date, notes) VALUES
        (athlete1_uuid, parent_uuid, 'Emma Johnson', '2012-05-15', 'Shows great improvement in footwork and ball control.'),
        (athlete2_uuid, parent_uuid, 'Jake Martinez', '2013-03-22', 'Strong defensive player, working on offensive skills.');

    -- Create sessions
    INSERT INTO public.sessions (id, coach_id, title, start_time, end_time, location, type, status, notes, is_recurring) VALUES
        (session1_uuid, coach_uuid, 'Technical Skills Training', '2025-01-02 16:00:00+00', '2025-01-02 17:00:00+00', 'Field A', 'individual', 'confirmed', 'Focus on ball control and passing accuracy', true),
        (session2_uuid, coach_uuid, 'Group Training Session', '2025-01-04 10:00:00+00', '2025-01-04 11:00:00+00', 'Indoor Court', 'group', 'confirmed', '', false),
        (session3_uuid, coach_uuid, 'Individual Coaching', '2025-01-09 16:00:00+00', '2025-01-09 17:00:00+00', 'Field A', 'individual', 'scheduled', '', true);

    -- Add session participants
    INSERT INTO public.session_participants (session_id, athlete_id, attended) VALUES
        (session1_uuid, athlete1_uuid, true),
        (session2_uuid, athlete1_uuid, true),
        (session2_uuid, athlete2_uuid, false),
        (session3_uuid, athlete1_uuid, false);

    -- Create booking series
    INSERT INTO public.booking_series (id, parent_id, coach_id, athlete_id, series_name, frequency, duration_minutes, price_per_session, total_sessions, completed_sessions, status, next_payment_date) VALUES
        (booking1_uuid, parent_uuid, coach_uuid, athlete1_uuid, 'Weekly Technical Training', 'weekly', 60, 75.00, 12, 8, 'active', '2025-01-15'),
        (booking2_uuid, parent_uuid, coach_uuid, athlete1_uuid, 'Bi-weekly Goalkeeper Training', 'biweekly', 90, 100.00, 6, 4, 'paused', null);

    -- Create invoices
    INSERT INTO public.invoices (id, parent_id, invoice_number, description, amount, issue_date, due_date, status, payment_method) VALUES
        (invoice1_uuid, parent_uuid, 'INV-2024-001', 'Weekly Technical Training - December 2024', 300.00, '2024-12-01', '2024-12-15', 'paid', 'card'),
        (invoice2_uuid, parent_uuid, 'INV-2024-002', 'Goalkeeper Training - December 2024', 200.00, '2024-12-01', '2024-12-15', 'paid', 'card'),
        (invoice3_uuid, parent_uuid, 'INV-2025-001', 'Weekly Technical Training - January 2025', 300.00, '2025-01-01', '2025-01-15', 'pending', 'card');

    -- Create invoice items
    INSERT INTO public.invoice_items (invoice_id, session_date, athlete_name, amount) VALUES
        (invoice1_uuid, '2024-12-05', 'Emma Johnson', 75.00),
        (invoice1_uuid, '2024-12-12', 'Emma Johnson', 75.00),
        (invoice1_uuid, '2024-12-19', 'Emma Johnson', 75.00),
        (invoice1_uuid, '2024-12-26', 'Emma Johnson', 75.00),
        (invoice2_uuid, '2024-12-01', 'Emma Johnson', 100.00),
        (invoice2_uuid, '2024-12-15', 'Emma Johnson', 100.00),
        (invoice3_uuid, '2025-01-02', 'Emma Johnson', 75.00),
        (invoice3_uuid, '2025-01-09', 'Emma Johnson', 75.00),
        (invoice3_uuid, '2025-01-16', 'Emma Johnson', 75.00),
        (invoice3_uuid, '2025-01-23', 'Emma Johnson', 75.00);

    -- Create notifications
    INSERT INTO public.notifications (user_id, message, is_read) VALUES
        (parent_uuid, 'Session with Coach Marcus tomorrow at 4:00 PM', false),
        (parent_uuid, 'Payment of $300 processed successfully', false),
        (coach_uuid, 'Jake Martinez parent requested a makeup session for tomorrow', false),
        (coach_uuid, 'Weather alert: Rain expected Monday afternoon', false);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;