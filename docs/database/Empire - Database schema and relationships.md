### Database schema and relationships (Markdown)

## Enums
- `user_role`: parent, coach, director
- `session_status`: scheduled, confirmed, in_progress, completed, cancelled, no_show
- `session_type`: individual, group, team
- `booking_status`: active, paused, completed, cancelled
- `invoice_status`: pending, paid, overdue, cancelled
- `payment_method`: card, cash, bank_transfer

## Tables

### public.user_profiles
- id uuid PK references auth.users(id) ON DELETE CASCADE
- email text UNIQUE
- full_name text
- phone text
- role user_role DEFAULT 'parent'
- is_active boolean DEFAULT true
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Indexes: email, role

Relationships:
- 1-to-1 with `auth.users` (same id)
- 1-to-many: `athletes.parent_id`, `sessions.coach_id`, `booking_series.parent_id/coach_id`, `invoices.parent_id`, `notifications.user_id`
- 1-to-1 (logical): `coaches.id` extends a profile that is a coach

---

### public.coaches
- id uuid PK references public.user_profiles(id) ON DELETE CASCADE
- specialization text
- experience_years int DEFAULT 0
- certifications text[]
- hourly_rate numeric(10,2) DEFAULT 0
- bio text
- avatar_url text
- created_at timestamptz DEFAULT now()
- display_name text
- current_club text
- specialties text[]
- locations_served text[]
- name text
- headshot_url text

Indexes: id (PK), specialties GIN, current_club

Relationships:
- 1-to-1 with `user_profiles` (coach profile)
- 1-to-many from `availability.coach_id`

---

### public.athletes
- id uuid PK DEFAULT gen_random_uuid()
- parent_id uuid references public.user_profiles(id) ON DELETE CASCADE
- name text NOT NULL
- birth_date date
- notes text
- created_at timestamptz DEFAULT now()

Indexes: parent_id

Relationships:
- many-to-many to sessions via `session_participants.athlete_id`
- many `booking_series.athlete_id`

---

### public.sessions
- id uuid PK DEFAULT gen_random_uuid()
- coach_id uuid references public.user_profiles(id) ON DELETE CASCADE
- title text NOT NULL
- start_time timestamptz NOT NULL
- end_time timestamptz NOT NULL
- location text
- type session_type DEFAULT 'individual'
- status session_status DEFAULT 'scheduled'
- is_cash_payment boolean DEFAULT false
- notes text
- special_instructions text
- weather_alert boolean DEFAULT false
- is_recurring boolean DEFAULT false
- max_participants int
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Indexes: coach_id, start_time, status

Relationships:
- 1-to-many: `session_participants.session_id`
- many-to-1: `user_profiles` (coach)

---

### public.session_participants
- id uuid PK DEFAULT gen_random_uuid()
- session_id uuid references public.sessions(id) ON DELETE CASCADE
- athlete_id uuid references public.athletes(id) ON DELETE CASCADE
- attended boolean DEFAULT false
- created_at timestamptz DEFAULT now()
- UNIQUE(session_id, athlete_id)

Indexes: session_id, athlete_id

Relationships:
- many-to-1: `sessions`
- many-to-1: `athletes`

---

### public.booking_series
- id uuid PK DEFAULT gen_random_uuid()
- parent_id uuid references public.user_profiles(id) ON DELETE CASCADE
- coach_id uuid references public.user_profiles(id) ON DELETE CASCADE
- athlete_id uuid references public.athletes(id) ON DELETE CASCADE
- series_name text NOT NULL
- frequency text NOT NULL ('weekly','biweekly','monthly')
- duration_minutes int NOT NULL
- price_per_session numeric(10,2) NOT NULL
- total_sessions int NOT NULL
- completed_sessions int DEFAULT 0
- status booking_status DEFAULT 'active'
- next_payment_date date
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Indexes: parent_id, coach_id, athlete_id

Relationships:
- many-to-1: parent, coach (profiles), athlete

---

### public.invoices
- id uuid PK DEFAULT gen_random_uuid()
- parent_id uuid references public.user_profiles(id) ON DELETE CASCADE
- invoice_number text UNIQUE
- description text NOT NULL
- amount numeric(10,2) NOT NULL
- issue_date date NOT NULL DEFAULT current_date
- due_date date NOT NULL
- status invoice_status DEFAULT 'pending'
- payment_method payment_method
- created_at timestamptz DEFAULT now()

Indexes: parent_id

Relationships:
- 1-to-many: `invoice_items.invoice_id`

---

### public.invoice_items
- id uuid PK DEFAULT gen_random_uuid()
- invoice_id uuid references public.invoices(id) ON DELETE CASCADE
- session_date date NOT NULL
- athlete_name text NOT NULL
- amount numeric(10,2) NOT NULL
- created_at timestamptz DEFAULT now()

Indexes: invoice_id

---

### public.notifications
- id uuid PK DEFAULT gen_random_uuid()
- user_id uuid references public.user_profiles(id) ON DELETE CASCADE
- message text NOT NULL
- is_read boolean DEFAULT false
- created_at timestamptz DEFAULT now()

Indexes: user_id

---

### public.locations
- id uuid PK DEFAULT gen_random_uuid()
- name text NOT NULL UNIQUE
- address text
- notes text
- facility_summary text
- is_active boolean DEFAULT true
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Indexes: is_active, name (unique)

Relationships:
- 1-to-many: `availability.location_id`

---

### public.availability
- id uuid PK DEFAULT gen_random_uuid()
- coach_id uuid NOT NULL references public.coaches(id) ON DELETE CASCADE
- location_id uuid NOT NULL references public.locations(id) ON DELETE CASCADE
- starts_at timestamptz NOT NULL
- ends_at timestamptz NOT NULL
- status text NOT NULL DEFAULT 'open' CHECK (status in ('open','held','booked','cancelled'))
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Indexes: (coach_id, location_id, starts_at, status), (location_id, starts_at, status), (coach_id, starts_at, status)

Relationships:
- many-to-1: `coaches`, `locations`

---

### public.mock_payments (optional; created for mock testing)
- id uuid PK DEFAULT gen_random_uuid()
- created_at timestamptz DEFAULT now()
- amount numeric(10,2) NOT NULL
- currency text NOT NULL DEFAULT 'GBP'
- coach_id uuid NULL
- coach_name text
- player_name text
- location_id uuid NULL
- location_name text
- starts_at timestamptz
- time_label text
- card_brand text
- card_last4 text
- transaction_id text
- booking_snapshot jsonb

Notes: contains no PAN/CVV; insert only when `VITE_MOCK_PAYMENTS=true`.

## Key relationships (at a glance)
- Profiles: `auth.users` → `user_profiles` (1:1)
- Coaches: `user_profiles` → `coaches` (1:1)
- Parents & athletes: `user_profiles (parent)` → `athletes` (1:N)
- Sessions: `user_profiles (coach)` → `sessions` (1:N)
- Session participants: `sessions` ↔ `athletes` via `session_participants` (N:M)
- Booking series: `user_profiles (parent/coach)` + `athletes` → `booking_series`
- Billing: `user_profiles (parent)` → `invoices` → `invoice_items`
- Locations & availability: `locations` ↔ `coaches` via `availability` (N:M with time windows)

If you’d like, I can also generate a live markdown dump of current data (row counts and top rows per table) from your Supabase project; just confirm and I’ll provide a copy-paste SQL that emits the markdown tables for every public table.