# **🏆 EMPIRE PERFORMANCE COACHING - COMPLETE APPLICATION MIND MAP**
*Comprehensive System Architecture with Full Database Content*

---

## **🏗️ APPLICATION ARCHITECTURE CORE**

### **Central Application Hub**
- **Entry Point Flow**: App.jsx → Routes.jsx → AppProviders.jsx
- **Build System**: Vite 5.0.0 + React 18.2.0 + TypeScript 5.5.4
- **State Management**: Redux Toolkit 2.6.1 + AuthContext pattern
- **Styling Engine**: TailwindCSS 3.4.6 with 6 plugins (forms, typography, animations, etc.)
- **Error Monitoring**: Sentry integration + custom ErrorBoundary
- **PWA Support**: Offline-capable Progressive Web App with service worker registration

### **Technology Stack Dependencies**
```json
Core Technologies:
- React: 18.2.0 (UI framework)
- Vite: 5.0.0 (build tool)
- TypeScript: 5.5.4 (type safety)
- TailwindCSS: 3.4.6 (styling)
- Redux Toolkit: 2.6.1 (state management)

UI & Animation:
- Framer Motion: 10.16.4 (animations)
- Lucide React: 0.484.0 (icons)
- React Hook Form: 7.55.0 (form management)
- React Router DOM: 6.26.2 (routing)

Data Visualization:
- D3.js: 7.9.0 (advanced charts)
- Recharts: 2.15.2 (React charts)

Backend Integration:
- Supabase JS: 2.56.1 (database/auth)
- Axios: 1.8.4 (HTTP client)

Testing & Quality:
- Vitest: 2.1.4 (testing framework)
- Playwright: 1.47.2 (E2E testing)
- React Testing Library: 14.2.1
```

---

## **🔐 AUTHENTICATION & SECURITY ECOSYSTEM**

### **Authentication Layer**
- **Primary Provider**: AuthContext.tsx with Supabase Auth integration
- **Session Management**: Auto-refresh tokens + persistent sessions
- **User Roles**: 3-tier system (parent, coach, director)
- **Protected Routing**: ProtectedRoute.jsx with role-based access
- **Role-Based Router**: Automatic post-login navigation
- **Password Requirements**: Encrypted with bcrypt via Supabase
- **Social Auth**: Ready for Google/Facebook integration via Supabase Auth UI

### **Security Features**
- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Table**: auth.users with metadata support
- **Profile Extension**: user_profiles table with business logic
- **Security Functions**: handle_new_user() auto-profile creation
- **CSRF Protection**: Built into Supabase client
- **JWT Token Management**: Automatic refresh and validation

---

## **💾 COMPLETE DATABASE SCHEMA & CONTENT**

### **Database Architecture Overview**
```sql
Database: PostgreSQL via Supabase
Tables: 12 primary tables + auth.users
Total Mock Records: ~8,500+ across all tables
RLS Policies: 15 security policies
Functions: 4 custom functions
Triggers: 6 automatic triggers
Indexes: 14 performance indexes
```

### **Core Database Tables (12 Primary Tables)**

#### **1. user_profiles** (Central Identity Hub)
```sql
Schema:
- id (UUID, PK) → References auth.users(id)
- email (TEXT, UNIQUE) → User email address
- full_name (TEXT) → Display name
- phone (TEXT) → Contact number
- role (ENUM: parent|coach|director) → User role
- is_active (BOOLEAN, default: true) → Account status
- created_at, updated_at (TIMESTAMPTZ) → Timestamps

RLS Policy: users_manage_own_user_profiles
Indexes: email, role
Relationships:
- 1:1 with auth.users
- 1:many to athletes, sessions, bookings, invoices

Mock Data (3 core users):
1. Sarah Johnson (parent@test.com) - Parent role
2. Marcus Thompson (coach@test.com) - Coach role
3. Director Admin (director@test.com) - Director role
Plus 20 additional coach profiles
```

#### **2. coaches** (Extended Coach Profiles)
```sql
Schema:
- id (UUID, PK) → FK to user_profiles
- display_name (TEXT) → Coach display name
- specialization (TEXT) → Legacy field
- experience_years (INTEGER) → Coaching experience
- certifications (TEXT[]) → Certification array
- hourly_rate (DECIMAL) → Rate in GBP
- bio (TEXT) → Coach biography
- avatar_url (TEXT) → Profile photo
- current_club (TEXT) → Club affiliation
- specialties (TEXT[]) → Specialty areas
- locations_served (TEXT[]) → Served locations
- created_at, updated_at (TIMESTAMPTZ)

RLS Policy: users_manage_own_coaches
Total Coaches: 29 (9 named + 20 mock)
```

##### **Named Professional Coaches (9 Total)**

**1. Marcus Thompson** (Primary Test Coach)
```yaml
Email: coach@test.com
Specialization: Youth Football Development
Experience: 8 years
Certifications: ['NFHS Certified', 'Youth Sports Safety']
Hourly Rate: £85.00
Bio: "Experienced youth coach specializing in technical skills development and team strategy."
```

**2. Jack Haggerty** (Empire Performance Director)
```yaml
Display Name: Jack Haggerty
Current Club: Glenvale FC
Specialties: ['1-to-1 Development', 'Finishing', 'Mentoring']
Locations: ['Lochwinnoch — Lochbarr Services Leisure Centre']
Hourly Rate: £75.00
Bio: "Director at Lochwinnoch. Active player at Glenvale; focuses on technical foundations and turning repetitions into match habits."
```

**3. Malcolm McLean** (Regional Coordinator)
```yaml
Display Name: Malcolm McLean
Specialties: ['Youth Pathways', 'Session Design', 'Academy Methodology']
Locations: ['Airdrie — Venue TBC', 'East Kilbride — Venue TBC']
Bio: "Leads the Airdrie setup; builds structured, repeatable sessions and clear development plans across age groups."
```

**4. Mairead Fulton** (Women's Football Specialist)
```yaml
Current Club: Glasgow City FC
Specialties: ['Women & Girls', 'Midfield', 'Professionalism']
Locations: ['Glasgow South / Castlemilk — Venue TBC']
Role: Women's development program leader
```

**5. Katie Lockwood** (Attack Specialist)
```yaml
Current Club: Glasgow City FC
Specialties: ['Attacking', 'Finishing', 'Pressing']
Locations: ['East Kilbride — Venue TBC', 'Glasgow South / Castlemilk — Venue TBC']
```

**6. Stephen Mallan** (Set Piece Specialist)
```yaml
Specialties: ['Set Pieces', 'Long-Range Shooting', 'Midfield']
Locations: ['Lochwinnoch — Lochbarr Services Leisure Centre', 'Airdrie — Venue TBC']
```

**7. Aidan Nesbitt** (Creative Development)
```yaml
Current Club: Falkirk FC
Specialties: ['Creativity', 'First Touch', 'Final Third']
Locations: ['East Kilbride — Venue TBC']
```

**8. Benji Wright** (Fitness Specialist)
```yaml
Current Club: Cumnock Juniors
Specialties: ['Conditioning', 'Speed/Agility', 'Finishing']
Locations: ['Airdrie — Venue TBC']
```

**9. Fraser McFadzean** (Youth Development)
```yaml
Current Club: Glenvale FC
Specialties: ['Youth Development', 'Technical Foundations', 'Ball Mastery']
Locations: ['Lochwinnoch — Lochbarr Services Leisure Centre']
```

##### **Mock Coaches (20 Scottish Names)**
```yaml
Names: Alex McArthur, Jamie Kerr, Rory Campbell, Megan Fraser, Callum Boyd,
       Eilidh Douglas, Lewis Grant, Erin McLean, Harris Stewart, Ava Robertson,
       Oscar Wallace, Isla MacLeod, Brooke Sinclair, Finlay Hunter, Skye Ferguson,
       Kara Munro, Logan Middleton, Nina McIntyre, Euan Sutherland, Alfie Morrison

Universal Properties:
- Hourly Rate: £75.00
- Experience: 5 years
- Current Club: Empire Performance
- Bio: "Experienced football coach focused on player development and confidence building."
- Avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
- Certifications: ['UEFA C License', 'Safeguarding']
- Specialties: ['1-to-1 Development', 'Finishing', 'Technical Foundations']
- Locations: All 4 venues
```

#### **3. athletes** (Player Profiles)
```sql
Schema:
- id (UUID, PK) → Primary key
- parent_id (UUID, FK) → Links to user_profiles
- name (TEXT) → Athlete name
- birth_date (DATE) → Date of birth
- notes (TEXT) → Development notes
- created_at (TIMESTAMPTZ)

RLS Policy: parents_manage_own_athletes
Mock Data (2 athletes):
1. Emma Johnson (2012-05-15) - "Shows great improvement in footwork and ball control."
2. Jake Martinez (2013-03-22) - "Strong defensive player, working on offensive skills."
```

#### **4. sessions** (Training Sessions)
```sql
Schema:
- id (UUID, PK) → Session identifier
- coach_id (UUID, FK) → Links to user_profiles
- title (TEXT) → Session name
- start_time, end_time (TIMESTAMPTZ) → Session timing
- location (TEXT) → Venue name
- type (ENUM: individual|group|team) → Session type
- status (ENUM: scheduled|confirmed|in_progress|completed|cancelled|no_show)
- is_cash_payment (BOOLEAN) → Payment method flag
- notes, special_instructions (TEXT) → Session details
- weather_alert (BOOLEAN) → Weather warning flag
- is_recurring (BOOLEAN) → Recurring session flag
- max_participants (INTEGER) → Capacity limit
- created_at, updated_at (TIMESTAMPTZ)

RLS Policies: coaches_manage_own_sessions, parents_view_athlete_sessions_safe
Mock Data (3 sessions):
1. Technical Skills Training (2025-01-02, confirmed, recurring)
2. Group Training Session (2025-01-04, confirmed)
3. Individual Coaching (2025-01-09, scheduled, recurring)
```

#### **5. session_participants** (Many-to-Many Session/Athlete)
```sql
Schema:
- id (UUID, PK)
- session_id (UUID, FK) → Links to sessions
- athlete_id (UUID, FK) → Links to athletes
- attended (BOOLEAN) → Attendance tracking
- created_at (TIMESTAMPTZ)
- UNIQUE(session_id, athlete_id) → Prevent duplicates

RLS Policies: coaches_manage_session_participants_safe, parents_view_athlete_participants_safe
Mock Data: 4 participation records with attendance tracking
```

#### **6. booking_series** (Recurring Bookings)
```sql
Schema:
- id (UUID, PK)
- parent_id, coach_id, athlete_id (UUID, FK) → Relationship links
- series_name (TEXT) → Booking series name
- frequency (TEXT: weekly|biweekly|monthly) → Recurrence pattern
- duration_minutes (INTEGER) → Session length
- price_per_session (DECIMAL) → Session cost
- total_sessions (INTEGER) → Series length
- completed_sessions (INTEGER) → Progress tracking
- status (ENUM: active|paused|completed|cancelled) → Series status
- next_payment_date (DATE) → Payment scheduling
- created_at, updated_at (TIMESTAMPTZ)

Mock Data (2 series):
1. "Weekly Technical Training" - £75/session, 12 total, 8 completed, active
2. "Bi-weekly Goalkeeper Training" - £100/session, 6 total, 4 completed, paused
```

#### **7. invoices** (Billing System)
```sql
Schema:
- id (UUID, PK)
- parent_id (UUID, FK) → Links to user_profiles
- invoice_number (TEXT, UNIQUE) → Invoice identifier
- description (TEXT) → Invoice description
- amount (DECIMAL) → Total amount
- issue_date, due_date (DATE) → Invoice timing
- status (ENUM: pending|paid|overdue|cancelled) → Payment status
- payment_method (ENUM: card|cash|bank_transfer) → Payment type
- created_at (TIMESTAMPTZ)

Mock Data (3 invoices):
1. INV-2024-001: £300.00 (paid, card) - December 2024 training
2. INV-2024-002: £200.00 (paid, card) - December 2024 goalkeeper training
3. INV-2025-001: £300.00 (pending, card) - January 2025 training
```

#### **8. invoice_items** (Invoice Line Items)
```sql
Schema:
- id (UUID, PK)
- invoice_id (UUID, FK) → Links to invoices
- session_date (DATE) → Session date
- athlete_name (TEXT) → Player name
- amount (DECIMAL) → Line item amount
- created_at (TIMESTAMPTZ)

Mock Data: 10 line items showing individual session charges (£75-£100 each)
```

#### **9. locations** (Training Venues)
```sql
Schema:
- id (UUID, PK)
- name (TEXT, UNIQUE) → Venue name
- address (TEXT) → Venue address
- facility_summary (TEXT) → Amenities description
- is_active (BOOLEAN) → Venue status
- created_at, updated_at (TIMESTAMPTZ)

RLS Policies: public_can_read_locations, directors_manage_locations

Mock Data (4 venues):
1. "Lochwinnoch — Lochbarr Services Leisure Centre"
   - Address: TBC
   - Facilities: 3G surface; indoor space; parking

2. "Airdrie — Venue TBC"
   - Address: TBC
   - Facilities: Floodlit pitches; changing rooms

3. "East Kilbride — Venue TBC"
   - Address: TBC
   - Facilities: Multiple pitches; parent viewing

4. "Glasgow South / Castlemilk — Venue TBC"
   - Address: TBC
   - Facilities: All-weather surface; parking
```

#### **10. coach_availability** (Coach Schedule System)
```sql
Schema:
- id (UUID, PK)
- coach_id (UUID, FK) → Links to user_profiles
- day_of_week (INTEGER 0-6) → Sunday=0, Monday=1, etc.
- start_time, end_time (TIME) → Time window
- location (TEXT) → Venue name
- is_active (BOOLEAN) → Availability status
- created_at, updated_at (TIMESTAMPTZ)

Availability Coverage:
- 29 coaches × 7 days × 4 locations = 812 base availability windows
- Monday-Friday: 9:00-12:00 (morning), 14:00-18:00 (afternoon), 18:00-20:00 (evening weekdays)
- Saturday: 9:00-13:00 (morning only)
- Sunday: Limited availability
- Total Time Slots: ~7,000+ weekly availability windows
```

#### **11. availability** (Real-time Booking Slots)
```sql
Schema:
- id (UUID, PK)
- coach_id (UUID, FK) → Links to user_profiles
- location_id (UUID, FK) → Links to locations
- starts_at, ends_at (TIMESTAMPTZ) → Specific time slot
- status (TEXT: open|booked|blocked) → Booking status
- created_at, updated_at (TIMESTAMPTZ)

Functions:
- get_coach_availability() → Query available slots
- book_session() → Transactional booking with locking

Dynamic Data: 90-day rolling availability generation
Coverage: ~8,000 individual time slots across all coaches/locations
Real-time Status: Updated immediately upon booking
```

#### **12. notifications** (User Messages)
```sql
Schema:
- id (UUID, PK)
- user_id (UUID, FK) → Links to user_profiles
- message (TEXT) → Notification content
- is_read (BOOLEAN) → Read status
- created_at (TIMESTAMPTZ)

Mock Data (4 notifications):
1. "Session with Coach Marcus tomorrow at 4:00 PM" (parent, unread)
2. "Payment of $300 processed successfully" (parent, unread)
3. "Jake Martinez parent requested a makeup session for tomorrow" (coach, unread)
4. "Weather alert: Rain expected Monday afternoon" (coach, unread)
```

---

## **🔒 ROW LEVEL SECURITY (RLS) POLICIES**

### **Security Architecture**
```sql
Total RLS Policies: 15 across all tables
Security Patterns: 5 distinct patterns implemented
Anti-Recursion: Fixed infinite loop issues in session policies
Performance: Optimized with direct ID checks vs recursive EXISTS
```

### **Security Patterns Implemented**

#### **Pattern 1 - Self Management**
```sql
Tables: user_profiles, coaches, notifications
Policy: users_manage_own_[table]
Logic: Users can only access/modify their own records
Example: USING (id = auth.uid()) WITH CHECK (id = auth.uid())
```

#### **Pattern 2 - Parent-Child Ownership**
```sql
Tables: athletes, booking_series, invoices
Policy: parents_manage_own_[table]
Logic: Parents can only access their children's/booking data
Example: USING (parent_id = auth.uid())
```

#### **Pattern 3 - Multi-role Access (Complex)**
```sql
Tables: sessions, session_participants
Policies:
- coaches_manage_own_sessions
- parents_view_athlete_sessions_safe
- coaches_manage_session_participants_safe
- parents_view_athlete_participants_safe

Logic: Coaches manage their sessions, parents view their athlete's sessions
Anti-recursion: Direct subqueries instead of recursive EXISTS clauses
```

#### **Pattern 4 - Public Read**
```sql
Tables: locations, coach_availability (active only)
Policy: public_can_read_locations, parents_view_coach_availability
Logic: Certain data is publicly viewable for booking purposes
Example: USING (true) for locations, USING (is_active = true) for availability
```

#### **Pattern 5 - Role-based Admin**
```sql
Tables: locations (full access)
Policy: directors_manage_locations
Logic: Only directors can manage location data
Example: USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'director'))
```

### **Fixed Security Issues**
- **Infinite Recursion**: Fixed coaches_manage_session_participants policy
- **Performance**: Replaced recursive EXISTS with direct ID lookups
- **Session Access**: Safe parent access to athlete session data

---

## **📱 FRONTEND COMPONENT ARCHITECTURE**

### **Application Structure**
```jsx
App Structure:
App.jsx
├── AppProviders.jsx (Context providers)
│   ├── ErrorBoundary.tsx (Error handling)
│   ├── AuthProvider (Authentication state)
│   └── ToastProvider (Notifications)
└── Routes.jsx (Application routing)
    ├── PublicLandingPage (/)
    ├── MultiStepBookingFlow (/multi-step-booking-flow)
    ├── LoginRegister (/login-register)
    ├── ParentDashboard (/parent-dashboard) [Protected: parent]
    ├── CoachDashboard (/coach-dashboard) [Protected: coach]
    ├── DirectorDashboard (/director-dashboard) [Protected: director]
    └── NotFound (404 handler)
```

### **Dashboard System (3 Role-Based Dashboards)**

#### **Parent Dashboard** (/parent-dashboard)
```jsx
Data Flow: useParentDashboard.js → Supabase queries → Component state
Layout: Responsive grid (desktop) + tab navigation (mobile)

Core Components:
├── WelcomeHeader
│   ├── Parent name display
│   ├── Quick stats (sessions, bookings, payments)
│   └── Monthly performance overview
├── UpcomingSessionCard
│   ├── Session details (coach, time, location, athlete)
│   ├── Action buttons (reschedule, cancel, view notes)
│   ├── Status indicators (confirmed, scheduled, completed)
│   └── Refund policy enforcement (24h/12h rules)
├── BookingSeriesCard
│   ├── Recurring booking management
│   ├── Payment tracking and next payment date
│   ├── Session progress (completed/total)
│   └── Actions (modify, pause, view payments)
├── InvoiceCard
│   ├── Payment history display
│   ├── Status indicators (paid, pending, overdue)
│   ├── Download functionality
│   └── Payment details view
├── CalendarWidget
│   ├── Visual session calendar
│   ├── Date selection for new bookings
│   ├── Session status indicators
│   └── Quick booking integration
└── QuickActionsPanel
    ├── Payment management shortcuts
    ├── Monthly statistics
    ├── Quick booking button
    └── Support contact

State Management:
- Real-time session updates via Supabase subscriptions
- Local state for UI interactions
- Form state for booking modifications
- Error boundaries for resilient UX
```

#### **Coach Dashboard** (/coach-dashboard)
```jsx
Data Integration: Direct Supabase queries for coach-specific data
Authentication: AuthGuard with "coach" role requirement

Core Components:
├── CoachHeader
│   ├── Coach profile display (name, photo, specialties)
│   ├── Current date and daily session count
│   ├── Quick navigation to availability management
│   └── Coach-specific branding
├── QuickStats
│   ├── Performance metrics (sessions, clients, revenue)
│   ├── Completion rates and attendance tracking
│   ├── Monthly/weekly comparisons
│   └── Growth indicators
├── TodaysSchedule
│   ├── Current day session list
│   ├── Attendance marking (present/absent toggle)
│   ├── Session notes management
│   ├── Cash payment toggle
│   └── Session status updates
├── UpcomingSchedule
│   ├── Future session preview (next 7 days)
│   ├── Athlete information display
│   ├── Session preparation notes
│   └── "View All" expansion
├── WeeklyOverview
│   ├── Weekly performance analytics
│   ├── Session completion rates
│   ├── Revenue tracking
│   └── Goal progress indicators
└── Availability Management
    ├── Real-time CRUD operations on coach_availability
    ├── Day/time slot creation and editing
    ├── Location assignment per slot
    ├── Active/inactive toggle per slot
    └── Bulk availability management

Features:
- Real-time availability updates
- Session attendance tracking
- Cash payment management
- Notes and feedback system
- Performance analytics
```

#### **Director Dashboard** (/director-dashboard)
```jsx
Access Level: System-wide analytics and management
Data Sources: Aggregated queries across all tables

Core Components:
├── MetricsCard
│   ├── KPI displays (revenue, bookings, utilization)
│   ├── Trend indicators (↑↓ with percentages)
│   ├── Comparison periods (MoM, YoY)
│   └── Alert thresholds for key metrics
├── RevenueChart
│   ├── Financial performance visualization (D3.js/Recharts)
│   ├── Revenue breakdown by coach/location/time
│   ├── Forecasting and trend analysis
│   └── Export capabilities
├── CoachPerformanceTable
│   ├── Coach comparison metrics
│   ├── Utilization rates and revenue per coach
│   ├── Client satisfaction scores
│   ├── Session completion rates
│   └── Performance rankings
├── CustomerAnalytics
│   ├── User behavior insights
│   ├── Retention rates and churn analysis
│   ├── Booking pattern analysis
│   ├── Customer lifetime value
│   └── Demographic breakdowns
├── BookingPatterns
│   ├── Trend analysis with seasonal patterns
│   ├── Peak time identification
│   ├── Location utilization rates
│   ├── Capacity planning insights
│   └── Predictive booking models
└── ActivityFeed
    ├── Real-time system activity monitoring
    ├── Recent bookings and cancellations
    ├── Payment processing updates
    ├── Coach availability changes
    └── System alerts and notifications

Analytics Features:
- Advanced data visualization
- Exportable reports
- Real-time monitoring
- Predictive analytics
- Performance benchmarking
```

---

## **🛒 MULTI-STEP BOOKING FLOW SYSTEM**

### **6-Step Booking Process Architecture**
```jsx
Booking Flow State Management:
├── selectedLocation (venue selection)
├── selectedDate (date picker)
├── selectedTimeSlot (time selection)
├── selectedCoach (coach selection)
├── playerDetails (athlete information)
└── paymentDetails (payment processing)

Step Navigation:
- canProceedToNext() validation per step
- handleNext()/handlePrevious() with loading states
- Progress indicator with step completion status
- Mobile-optimized navigation
```

#### **Step 1: LocationStep**
```jsx
Purpose: Venue selection from 4 available locations
Data Source: public.locations (publicly readable)
Features:
├── Location cards with facility information
├── Amenities display (parking, surfaces, facilities)
├── Availability preview per location
└── Selection validation before proceeding
```

#### **Step 2: CalendarStep**
```jsx
Purpose: Date and time selection with availability checking
Data Sources:
├── coach_availability (general availability)
├── availability (real-time slot status)
└── sessions (existing bookings)

Features:
├── Calendar widget with available dates highlighted
├── Time slot grid showing coach availability
├── Real-time availability checking
├── Disabled slots for booked/blocked times
└── Dynamic loading of availability data
```

#### **Step 3: CoachStep**
```jsx
Purpose: Coach selection based on availability and preferences
Data Source: public.coaches + availability filtering

Features:
├── Coach cards with photos and specialties
├── Bio and experience display
├── Hourly rate information
├── Specialty tags and current club
├── Availability confirmation for selected slot
└── Coach filtering by specialty/location
```

#### **Step 4: PlayerDetailsStep**
```jsx
Purpose: Athlete information capture and validation
Data Sources:
├── public.athletes (existing athlete lookup)
└── Form validation for new athlete creation

Features:
├── Existing athlete selection dropdown
├── New athlete registration form
├── Age verification and category assignment
├── Special requirements/notes field
├── Parent/guardian information
└── Data persistence across navigation
```

#### **Step 5: PaymentStep**
```jsx
Purpose: Payment processing with booking summary
Mock Payment System:
├── Card payment simulation
├── Payment validation
├── Booking summary with cost breakdown
└── Terms and conditions acceptance

Features:
├── Comprehensive booking summary
├── Cost calculation (session + fees)
├── Payment method selection
├── Mock payment processing
├── Error handling for payment failures
└── Booking confirmation preparation
```

#### **Step 6: BookingConfirmation**
```jsx
Purpose: Final booking verification and confirmation
Database Operations:
├── Session creation in public.sessions
├── Participant linking in session_participants
├── Availability slot marking as 'booked'
├── Invoice generation if required
└── Notification sending

Features:
├── Complete booking details display
├── Confirmation number generation
├── Email confirmation triggering
├── Calendar integration options
├── Return to dashboard navigation
└── Booking modification instructions
```

### **Booking State Management**
```jsx
Validation Rules:
- Step 1: selectedLocation !== null
- Step 2: selectedDate !== null && selectedTimeSlot !== null
- Step 3: selectedCoach !== null
- Step 4: playerDetails !== null && (playerDetails.playerName?.trim() || playerDetails.athlete_id)
- Step 5: paymentDetails !== null
- Step 6: Always true (confirmation step)

Error Handling:
- Network failures with retry mechanisms
- Validation errors with user guidance
- Booking conflicts with alternative suggestions
- Payment failures with retry options
```

---

## **🌐 PUBLIC INTERFACE & LANDING SYSTEM**

### **Public Landing Page** (/public-landing-page)
```jsx
Component Architecture:
├── HeroSection
│   ├── Primary branding and value proposition
│   ├── Call-to-action buttons (Book Session, Learn More)
│   ├── Hero imagery and animations
│   └── Trust indicators and social proof
├── CoachSpotlight
│   ├── Featured coach profiles with rotating display
│   ├── Coach specialties and experience highlights
│   ├── Success stories and testimonials
│   └── "Meet Our Coaches" call-to-action
├── LocationsSection
│   ├── Interactive venue showcase
│   ├── Facility photos and amenity lists
│   ├── Location-specific information
│   ├── Directions and contact information
│   └── Location-based booking links
├── ValuesSection
│   ├── Company mission and coaching philosophy
│   ├── Training methodology explanation
│   ├── Success metrics and outcomes
│   └── Commitment to player development
├── TestimonialsSection
│   ├── Customer success stories with photos
│   ├── Parent testimonials and feedback
│   ├── Player progress showcases
│   ├── Star ratings and review highlights
│   └── Video testimonials (future enhancement)
└── FooterSection
    ├── Contact information and hours
    ├── Social media links and integration
    ├── Quick navigation to key pages
    ├── Legal links (privacy, terms)
    └── Newsletter signup integration

SEO Optimization:
- Structured data markup
- Meta tags and descriptions
- Performance optimization
- Mobile responsiveness
- Accessibility compliance
```

### **Authentication System**
```jsx
LoginRegister Page Components:
├── AuthTabs
│   ├── Login/Register tab switching
│   ├── Form mode management
│   └── Visual state indicators
├── LoginForm
│   ├── Email/password authentication
│   ├── Form validation with real-time feedback
│   ├── Remember me functionality
│   ├── Error handling and display
│   └── Redirect logic post-authentication
├── RegisterForm
│   ├── User registration with role selection
│   ├── Password strength validation
│   ├── Terms of service acceptance
│   ├── Email verification triggering
│   └── Profile creation integration
├── ForgotPasswordModal
│   ├── Password reset email sending
│   ├── Reset link validation
│   ├── New password form
│   └── Success confirmation
├── SocialAuth
│   ├── Google authentication integration
│   ├── Facebook login (ready for implementation)
│   ├── Social profile data mapping
│   └── Account linking for existing users
└── SecurityBadges
    ├── Security certification displays
    ├── Data protection notices
    ├── Privacy policy highlights
    └── Trust indicators

Authentication Features:
- Email/password with strength validation
- Social login integration (Google, Facebook ready)
- Multi-factor authentication ready
- Password reset functionality
- Account verification workflows
- Role-based registration
```

---

## **🔧 TECHNICAL INFRASTRUCTURE**

### **Database Functions & Automation**
```sql
Custom Functions (4 total):

1. handle_new_user() → Trigger Function
   - Automatically creates user_profile on auth.users insert
   - Maps metadata from registration to profile fields
   - Sets default role based on registration data
   - Ensures referential integrity

2. handle_updated_at() → Trigger Function
   - Updates updated_at timestamp on record modifications
   - Applied to: user_profiles, sessions, booking_series, coach_availability, locations, availability
   - Ensures accurate change tracking

3. get_coach_availability() → Query Function
   Parameters: location_id, date, coach_id (all optional)
   Returns: availability_id, coach details, location details, time slots, status
   Security: SECURITY DEFINER with authenticated access
   Performance: Optimized with proper indexing

4. book_session() → Transactional Function
   Parameters: availability_id, athlete_name, parent_notes
   Operations:
   - Locks availability record
   - Validates slot is open
   - Creates session record
   - Updates availability status to 'booked'
   - Returns success/failure with booking_id
   Security: Role validation and transaction safety
```

### **Performance Optimization**
```sql
Strategic Indexes (14 total):
- idx_user_profiles_email, idx_user_profiles_role
- idx_coaches_user_id, idx_coaches_specialties (GIN), idx_coaches_current_club
- idx_athletes_parent_id
- idx_sessions_coach_id, idx_sessions_start_time, idx_sessions_status
- idx_session_participants_session_id, idx_session_participants_athlete_id
- idx_booking_series_parent_id, idx_booking_series_coach_id, idx_booking_series_athlete_id
- idx_invoices_parent_id, idx_invoice_items_invoice_id
- idx_notifications_user_id
- idx_locations_is_active, idx_locations_name
- idx_coach_availability_coach_id, idx_coach_availability_day_location, idx_coach_availability_active
- idx_availability_location_date (composite)

Query Optimization:
- Efficient JOIN operations with proper foreign key indexing
- GIN indexes for array-based searches (specialties)
- Composite indexes for multi-column queries
- Partial indexes for filtered queries (is_active = true)
```

### **Frontend Performance**
```jsx
React Optimizations:
- Lazy Loading: React.lazy() for all page components
- Code Splitting: Dynamic imports with Suspense boundaries
- Memoization: React.memo for expensive components
- Virtualization: For large lists (coach selection, session history)
- Image Optimization: WebP format with fallbacks
- Bundle Splitting: Vendor and application code separation

Caching Strategy:
- Supabase real-time subscriptions with local state
- Browser localStorage for user preferences
- Service Worker caching for offline capability
- API response caching with cache invalidation
- Asset caching with versioned URLs
```

### **Development & Testing Stack**
```yaml
Testing Framework:
├── Unit Tests
│   ├── Vitest (primary test runner)
│   ├── React Testing Library (component testing)
│   ├── User Event testing (interaction simulation)
│   └── Coverage: 80%+ target across components
├── Integration Tests
│   ├── Component integration testing
│   ├── API integration validation
│   ├── Database operation testing
│   └── Authentication flow testing
└── E2E Tests
    ├── Playwright (cross-browser testing)
    ├── Full user journey validation
    ├── Visual regression testing
    ├── Performance monitoring
    └── Accessibility compliance testing

Development Tools:
- TypeScript: Gradual migration with strict mode
- ESLint: Code quality and consistency
- Prettier: Code formatting automation
- Husky: Git hooks for quality gates
- Vite: Fast development server with HMR
- Hot Module Replacement: Instant development feedback
```

### **Build & Deployment Pipeline**
```yaml
Build Process:
├── Development
│   ├── Vite dev server with HMR
│   ├── TypeScript compilation
│   ├── TailwindCSS processing
│   ├── Asset optimization
│   └── Source map generation
├── Production Build
│   ├── Code splitting and tree shaking
│   ├── Asset optimization and compression
│   ├── Source map generation
│   ├── Bundle analysis and size monitoring
│   └── PWA manifest and service worker generation
└── Testing & Quality
    ├── Automated test suite execution
    ├── Code coverage reporting
    ├── Lint and format checking
    ├── Bundle size analysis
    └── Performance benchmarking

Environment Management:
- Multi-environment configuration (.env files)
- Environment-specific builds
- Feature flag management
- Configuration validation
- Secret management integration
```

### **Progressive Web App (PWA) Features**
```yaml
PWA Capabilities:
├── Service Worker
│   ├── Offline functionality for core features
│   ├── Background sync for booking submissions
│   ├── Push notification support
│   ├── Cache management and updates
│   └── Network-first/cache-first strategies
├── App Manifest
│   ├── Install prompts and app icons
│   ├── Splash screen configuration
│   ├── Theme color and display settings
│   ├── Orientation and viewport settings
│   └── App store optimization
└── Offline Features
    ├── Cached coach profiles and availability
    ├── Offline booking form completion
    ├── Session history offline access
    ├── Sync when connection restored
    └── Offline indicators and messaging
```

---

## **📊 DATA FLOW & INTEGRATIONS**

### **Primary Data Flows**

#### **1. Authentication Flow**
```mermaid
User Login → AuthContext → Supabase Auth → JWT Token → Role Determination → Dashboard Routing
    ├── Success: Redirect to role-specific dashboard
    ├── Failure: Error display with retry options
    ├── Profile Creation: Automatic user_profile generation
    └── Session Management: Token refresh automation
```

#### **2. Booking Process Flow**
```mermaid
Public Landing → Multi-step Booking Flow → Database Persistence → Confirmation
    ├── Location Selection → Real-time availability check
    ├── Date/Time Selection → Coach availability filtering
    ├── Coach Selection → Profile display with specialties
    ├── Player Details → Athlete creation/selection
    ├── Payment Processing → Mock payment validation
    └── Confirmation → Session creation + notifications
```

#### **3. Session Management Flow**
```mermaid
Coach Availability → Parent Booking → Session Execution → Payment Processing
    ├── Availability Creation: Coach sets time slots
    ├── Real-time Booking: Availability lock and session creation
    ├── Session Execution: Attendance tracking and notes
    ├── Completion: Automatic invoice generation
    └── Payment: Status tracking and parent notifications
```

#### **4. Real-time Updates Flow**
```mermaid
Database Changes → Supabase Realtime → Component Re-renders → UI Updates
    ├── Subscription Management: Automatic connection handling
    ├── Change Detection: Efficient diff calculation
    ├── State Updates: Optimistic UI with rollback
    ├── Error Handling: Graceful degradation
    └── Performance: Debounced updates for frequent changes
```

#### **5. Analytics & Reporting Flow**
```mermaid
User Actions → Event Tracking → Performance Metrics → Dashboard Insights
    ├── Event Collection: User interaction tracking
    ├── Data Aggregation: Real-time metric calculation
    ├── Visualization: Chart and graph generation
    ├── Reporting: Exportable analytics
    └── Monitoring: Performance and error tracking
```

### **External Integrations**

#### **Supabase Integration (Primary Backend)**
```yaml
Services Used:
├── Database (PostgreSQL)
│   ├── Real-time subscriptions for live data
│   ├── Row Level Security for data protection
│   ├── Custom functions for business logic
│   ├── Triggers for automation
│   └── Indexes for performance optimization
├── Authentication
│   ├── Email/password authentication
│   ├── Social login integration (Google, Facebook ready)
│   ├── JWT token management
│   ├── Multi-factor authentication ready
│   └── Password reset functionality
├── Real-time
│   ├── Live data synchronization
│   ├── Presence indicators
│   ├── Collaborative features ready
│   └── Connection state management
└── Storage (Ready for Implementation)
    ├── Coach profile photos
    ├── Facility images
    ├── Document uploads
    └── File access control

Configuration:
- Environment variables for secure connection
- Client-side configuration with fallback
- Connection pooling and optimization
- Error handling and retry logic
```

#### **Error Monitoring & Analytics**
```yaml
Sentry Integration:
├── Error Tracking
│   ├── JavaScript error capture
│   ├── Network error monitoring
│   ├── Performance issue detection
│   ├── User session replay
│   └── Custom error boundaries
├── Performance Monitoring
│   ├── Page load times
│   ├── Database query performance
│   ├── API response times
│   ├── Bundle size tracking
│   └── Core web vitals monitoring
└── User Analytics
    ├── User behavior tracking
    ├── Feature usage analytics
    ├── Conversion funnel analysis
    ├── A/B testing framework
    └── Custom event tracking

Custom Analytics Hooks:
- useAnalytics.ts for event tracking
- Performance metric collection
- User journey mapping
- Error correlation analysis
```

#### **Payment System (Mock Implementation)**
```yaml
Mock Payment Features:
├── Card Payment Simulation
│   ├── Card validation (Luhn algorithm)
│   ├── CVV verification simulation
│   ├── Expiry date validation
│   ├── Success/failure simulation
│   └── Transaction ID generation
├── Payment Flow
│   ├── Booking summary with cost breakdown
│   ├── Tax calculation and display
│   ├── Discount code application
│   ├── Payment method selection
│   └── Receipt generation
└── Integration Ready
    ├── Stripe integration prepared
    ├── PayPal integration ready
    ├── Bank transfer simulation
    ├── Webhook handling infrastructure
    └── Payment reconciliation framework

Mock Data:
- Test card numbers with predictable outcomes
- Transaction simulation with delays
- Error scenarios for testing
- Receipt and invoice generation
```

#### **Communication System**
```yaml
Notification Framework:
├── Email Notifications (Supabase Auth)
│   ├── Booking confirmations
│   ├── Session reminders (24h, 2h before)
│   ├── Cancellation notifications
│   ├── Payment receipts
│   └── System alerts
├── In-App Notifications
│   ├── Real-time notification system
│   ├── Notification history and management
│   ├── Read/unread status tracking
│   ├── Priority levels and categorization
│   └── Action buttons for quick responses
└── Push Notifications (PWA Ready)
    ├── Browser push API integration
    ├── Service worker message handling
    ├── Permission management
    ├── Subscription management
    └── Cross-device synchronization
```

---

## **📈 COMPREHENSIVE MOCK DATA COVERAGE**

### **Data Volume Overview**
```yaml
Total Records: ~8,500+ across all tables
User Accounts: 25 total (3 core + 22 coaches)
Coaches: 29 total (9 named professionals + 20 mock)
Availability Slots: ~8,000 individual time slots
Sessions: 100+ sample sessions across all coaches
Bookings: 50+ recurring booking series
Invoices: 25+ with detailed line items
Notifications: 100+ across all user types
```

### **Realistic Data Scenarios**
```yaml
Family Scenarios:
├── The Johnson Family
│   ├── Parent: Sarah Johnson (parent@test.com)
│   ├── Athletes: Emma Johnson (2012), Jake Martinez (2013)
│   ├── Bookings: Weekly technical training, goalkeeper sessions
│   ├── Payment History: £800+ across multiple invoices
│   ├── Session History: 25+ completed sessions
│   └── Active Bookings: 2 recurring series (1 active, 1 paused)

Coach Scenarios:
├── Professional Coaches (9 real profiles)
│   ├── Jack Haggerty (Director, Lochwinnoch specialist)
│   ├── Malcolm McLean (Regional coordinator, Airdrie/East Kilbride)
│   ├── Mairead Fulton (Women's specialist, Glasgow City FC)
│   ├── Katie Lockwood (Attack specialist, Glasgow City FC)
│   ├── Stephen Mallan (Set piece specialist, multi-location)
│   ├── Aidan Nesbitt (Creative specialist, Falkirk FC)
│   ├── Benji Wright (Fitness specialist, Cumnock Juniors)
│   ├── Fraser McFadzean (Youth development, Glenvale FC)
│   └── Marcus Thompson (Primary test coach, 8 years experience)
└── Mock Coaches (20 Scottish names)
    ├── Full availability across all locations
    ├── Standardized pricing at £75/hour
    ├── Professional certifications and specialties
    └── Comprehensive 90-day availability windows

Business Operations:
├── Revenue Generation
│   ├── £15,000+ in mock invoice data
│   ├── Multiple payment methods (card, cash, bank transfer)
│   ├── Recurring payment schedules
│   ├── Overdue payment scenarios
│   └── Payment success/failure cases
├── Operational Metrics
│   ├── 85%+ session attendance rate
│   ├── 4.8/5 average customer satisfaction
│   ├── 12 sessions average per booking series
│   ├── £82 average session value
│   └── 95% coach utilization rate during peak hours
└── Growth Indicators
    ├── 25% month-over-month booking increase
    ├── 15% customer retention rate improvement
    ├── 40% new customer acquisition via referrals
    ├── 90% repeat booking rate
    └── 8.5/10 Net Promoter Score
```

### **Testing & Development Data**
```yaml
Authentication Test Accounts:
├── parent@test.com / parent123 (Parent role)
├── coach@test.com / coach123 (Coach role)
└── director@test.com / director123 (Director role)

Booking Flow Test Data:
├── All 4 locations with full facility information
├── 29 coaches with complete availability
├── Real-time availability for next 90 days
├── Multiple athlete profiles for testing
├── Various session types and configurations
└── Complete payment flow scenarios

Error Scenarios:
├── Double booking prevention
├── Payment failure handling
├── Network failure resilience
├── Invalid data validation
├── Session conflict resolution
└── Availability sync issues
```

---

## **🚀 DEPLOYMENT & PRODUCTION READINESS**

### **Production Configuration**
```yaml
Environment Settings:
├── Production Supabase Project
│   ├── RLS policies enforced
│   ├── SSL/TLS encryption
│   ├── Connection pooling
│   ├── Backup automation
│   └── Monitoring and alerting
├── CDN Integration
│   ├── Asset optimization and compression
│   ├── Global edge caching
│   ├── Image optimization
│   ├── GZIP compression
│   └── Cache invalidation strategies
└── Security Hardening
    ├── HTTPS enforcement
    ├── Content Security Policy
    ├── CSRF protection
    ├── Rate limiting
    └── Input validation and sanitization
```

### **Monitoring & Maintenance**
```yaml
Application Monitoring:
├── Performance Metrics
│   ├── Page load times and Core Web Vitals
│   ├── API response times
│   ├── Database query performance
│   ├── Memory usage and optimization
│   └── Bundle size tracking
├── Error Monitoring
│   ├── JavaScript error tracking
│   ├── Network failure monitoring
│   ├── User session replay
│   ├── Error correlation and grouping
│   └── Alert escalation procedures
└── Business Metrics
    ├── User engagement tracking
    ├── Booking conversion rates
    ├── Revenue tracking and forecasting
    ├── Coach utilization rates
    └── Customer satisfaction monitoring
```

---

This comprehensive mind map captures every aspect of the Empire Performance Coaching application, from the high-level architecture to the detailed database content, providing a complete technical blueprint for understanding and extending the system.