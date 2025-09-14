# Empire Performance - Comprehensive Testing & Training Guide

## Document Information
- **Version**: 2.0
- **Last Updated**: September 2025
- **Purpose**: Testing procedures and training materials for Empire Performance coaching platform
- **Audience**: QA testers, developers, trainers, and system administrators

## What's New in Version 2.0
- ✅ Complete database schema documentation with all 11 tables
- ✅ Accurate RLS policies based on actual table structure  
- ✅ Comprehensive test data seeding script with coaches, athletes, and relationships
- ✅ Updated API endpoints reflecting real database tables
- ✅ Relationship integrity testing procedures
- ✅ Enhanced troubleshooting for database-specific issues
- ✅ Role-based testing for parent, coach, and director users
- ✅ Data validation queries for all table relationships
- ✅ Mock payment system testing procedures

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Environment Setup Guide](#environment-setup-guide)
3. [Testing Procedures](#testing-procedures)
4. [User Training Modules](#user-training-modules)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Test Scenarios & Expected Results](#test-scenarios--expected-results)
7. [Data Validation Scripts](#data-validation-scripts)
8. [Security Checklist](#security-checklist)

---

## System Overview

### What is Empire Performance?
Empire Performance is a comprehensive sports coaching booking and management platform that enables:
- Public users to book coaching sessions
- Parents to manage their children's athletic activities
- Coaches to manage their schedules and sessions
- Directors to oversee operations

### Key Components
- **Frontend**: React-based application (Vite) running on port 4028
- **Backend**: Supabase for database, authentication, and API
- **Payment Processing**: Integrated payment system with mock mode for testing
- **User Roles**: Public, Parent, Coach, Director

### Architecture Overview
```
User Interface (localhost:4028)
       ↓
   Vite React App
       ↓
  Supabase Client
       ↓
Supabase Backend (Database + Auth + RLS)
```

---

## Environment Setup Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Access to Supabase project
- Git for version control

### Initial Setup Steps

#### 1. Environment Configuration
Create `.env` file in `empire_performance_coaching/` directory:

```env
# Required Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional - Enable for testing without real payments
VITE_MOCK_PAYMENTS=true
```

#### 2. Database Setup
Execute the following in Supabase SQL editor:

```sql
-- Create required tables if not exists
-- Locations table with RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active locations" 
ON locations FOR SELECT 
USING (is_active = true);

-- Availability table with RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view open slots" 
ON availability FOR SELECT 
USING (status = 'open');

-- Testing policies for dashboards
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sessions" 
ON sessions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can view participants" 
ON session_participants FOR SELECT 
TO authenticated 
USING (true);
```

#### 3. Seed Data
Run the seeding script to populate test data:

```sql
-- Insert 4 test locations
INSERT INTO locations (name, address, is_active) VALUES
('North Training Center', '123 North St', true),
('South Sports Complex', '456 South Ave', true),
('East Athletic Field', '789 East Blvd', true),
('West Performance Hub', '321 West Rd', true);

-- Generate availability for next 30 days
DO $$
DECLARE
    loc RECORD;
    day_offset INTEGER;
    hour_slot INTEGER;
BEGIN
    FOR loc IN SELECT id FROM locations WHERE is_active = true LOOP
        FOR day_offset IN 0..29 LOOP
            FOREACH hour_slot IN ARRAY ARRAY[10, 12, 14, 16, 18] LOOP
                INSERT INTO availability (
                    location_id, 
                    starts_at, 
                    ends_at, 
                    status,
                    coach_id
                ) VALUES (
                    loc.id,
                    CURRENT_DATE + day_offset + (hour_slot || ' hours')::INTERVAL,
                    CURRENT_DATE + day_offset + (hour_slot || ' hours')::INTERVAL + INTERVAL '1 hour',
                    'open',
                    NULL -- Will be assigned when coach claims slot
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
```

#### 4. Start Development Server
```bash
cd empire_performance_coaching
npm install  # First time only
npm start    # Starts on http://localhost:4028
```

---

## Testing Procedures

### Test Environment Verification

#### Pre-Test Checklist
- [ ] Environment variables properly configured
- [ ] Database connection verified
- [ ] Seed data loaded
- [ ] Development server running
- [ ] Browser console open for error monitoring

### Core Testing Workflows

#### Workflow 1: Public Booking Flow

**Objective**: Verify complete booking process without authentication

**Steps**:
1. **Landing Page**
   - Navigate to http://localhost:4028
   - Verify page loads without errors
   - Check responsive design on mobile/tablet views
   - Click "Book Now" button

2. **Location Selection**
   - Verify all 4 seeded locations display
   - Test card hover effects and highlighting
   - Select a location
   - Confirm navigation to calendar view

3. **Date & Time Selection**
   - Verify calendar displays current month
   - Check that past dates are disabled
   - Select an available date (should show green indicator)
   - Verify time slots appear (10am, 12pm, 2pm, 4pm, 6pm)
   - Toggle diagnostics mode to view slot counts
   - Select a time slot

4. **Coach Selection**
   - Verify coaches display for selected date/location
   - If no coaches available, verify fallback message appears
   - Select a coach and note the price

5. **Player Information**
   - Enter test player name: "Test Player"
   - Enter date of birth (test with various formats)
   - Verify form validation works
   - Click Continue

6. **Payment Processing**
   - Verify total matches coach price in GBP (£)
   - If MOCK_PAYMENTS=true:
     - Enter test card: 4242 4242 4242 4242
     - Expiry: 12/25
     - CVV: 123
   - Submit payment form

7. **Confirmation**
   - Verify confirmation page displays
   - Check booking details are correct
   - Verify no auto-redirect occurs

**Expected Results**:
- Smooth navigation through all steps
- No console errors
- Data persists correctly
- Payment processes (or mocks) successfully

#### Workflow 2: Authentication Flows

**Registration Test**:
1. Navigate to registration page
2. Enter test credentials:
   - Email: testparent@example.com
   - Password: TestPass123!
3. Submit form
4. Verify confirmation message appears
5. Check email for confirmation (if SMTP configured)
6. Click confirmation link
7. Verify auto-login occurs

**Login/Logout Test**:
1. Navigate to login page
2. Enter registered credentials
3. Verify successful login
4. Check user menu appears in header
5. Test logout functionality
6. Verify redirect to public page

**Password Recovery Test**:
1. Click "Forgot Password"
2. Enter registered email
3. Submit form
4. Verify success message (no errors)
5. Check email for reset link (if SMTP configured)

#### Workflow 3: Parent Portal Testing

**Prerequisites**: Logged in as parent role

**Steps**:
1. Navigate to `/parent-dashboard`
2. Verify dashboard loads without recursion errors
3. Check all sections render:
   - Upcoming sessions
   - Player profiles
   - Payment history
   - Account settings
4. Test header dropdown menu:
   - Verify text is visible (not white-on-white)
   - Test all menu items

**Data Operations**:
- Add a new player profile
- Edit existing player information
- View session history
- Download payment receipts (if implemented)

#### Workflow 4: Role-Based Access Testing

**Coach Dashboard** (Requires role change in database):
```sql
UPDATE user_profiles 
SET role = 'coach' 
WHERE email = 'testuser@example.com';
```

1. Login with coach credentials
2. Navigate to `/coach-dashboard`
3. Verify coach-specific features:
   - Schedule view
   - Session management
   - Player roster
   - Availability settings

**Director Dashboard** (Requires role change):
```sql
UPDATE user_profiles 
SET role = 'director' 
WHERE email = 'testuser@example.com';
```

1. Login with director credentials
2. Navigate to `/director-dashboard`
3. Verify director features:
   - All coaches overview
   - Location management
   - Revenue reports
   - System settings

---

## User Training Modules

### Module 1: Public User Training

**Target Audience**: Parents and players booking sessions

**Training Objectives**:
- Navigate the booking process
- Understand pricing and scheduling
- Complete payment safely

**Training Materials**:

#### Quick Start Guide
1. Visit the Empire Performance website
2. Click "Book Now" to start
3. Choose your preferred location
4. Select date and time
5. Pick your coach
6. Enter player details
7. Complete payment
8. Save your confirmation

#### Video Tutorial Topics
- How to book your first session (3 min)
- Understanding coach profiles (2 min)
- Managing multiple players (4 min)
- Payment and refund policies (3 min)

### Module 2: Parent Portal Training

**Target Audience**: Registered parents

**Training Objectives**:
- Manage player profiles
- Track session history
- Handle payments and bookings

**Key Features to Cover**:

#### Account Management
- Creating and updating profiles
- Adding multiple children
- Setting communication preferences
- Managing payment methods

#### Booking Management
- Viewing upcoming sessions
- Cancelling or rescheduling
- Booking recurring sessions
- Group booking options

### Module 3: Coach Training

**Target Audience**: Coaching staff

**Training Objectives**:
- Manage availability
- Track sessions and players
- Communicate with parents

**Core Competencies**:

#### Schedule Management
- Setting availability windows
- Blocking out time
- Managing cancellations
- Handling reschedules

#### Player Management
- Viewing player profiles
- Recording session notes
- Tracking progress
- Communication tools

### Module 4: Director Training

**Target Audience**: Administrative staff

**Training Objectives**:
- System administration
- Report generation
- Staff management

**Administrative Functions**:

#### System Management
- User role assignment
- Location configuration
- Pricing updates
- Schedule optimization

#### Reporting & Analytics
- Revenue reports
- Utilization metrics
- Coach performance
- Customer satisfaction

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Calendar shows no available dates
**Symptoms**: All dates appear disabled
**Possible Causes**:
- No availability data in database
- RLS policies blocking access
- Date filtering issues

**Solutions**:
1. Verify availability data exists:
```sql
SELECT COUNT(*) FROM availability 
WHERE starts_at > NOW() AND status = 'open';
```
2. Check RLS policies are configured correctly
3. Enable diagnostics mode to see actual data
4. Verify timezone settings

#### Issue: White-on-white text in dropdown menus
**Symptoms**: Menu items invisible but clickable
**Possible Causes**:
- CSS styling conflicts
- Theme variables not loaded

**Solutions**:
1. Check browser console for CSS errors
2. Verify theme variables in `.env`
3. Clear browser cache
4. Check for custom CSS overrides

#### Issue: Payment fails in mock mode
**Symptoms**: Payment form submits but errors
**Possible Causes**:
- VITE_MOCK_PAYMENTS not set
- Database permissions issue
- Network timeout

**Solutions**:
1. Verify `.env` contains `VITE_MOCK_PAYMENTS=true`
2. Check mock_payments table exists
3. Verify write permissions on table
4. Check network tab for API errors

#### Issue: Recursion error in dashboards
**Symptoms**: Dashboard fails to load, console shows recursion error
**Possible Causes**:
- Complex RLS policies
- Circular dependencies

**Solutions**:
1. Simplify RLS policies to basic SELECT
2. Remove recursive JOINs
3. Use simple `USING (true)` for testing
4. Review policy dependencies

### Database Troubleshooting

#### Verify Table Structure
```sql
-- Check all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('locations', 'availability', 'sessions', 
                   'session_participants', 'user_profiles', 
                   'athletes', 'mock_payments');
```

#### Check RLS Status
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### Review Active Policies
```sql
-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## Test Scenarios & Expected Results

### Scenario Matrix

| Scenario | Steps | Expected Result | Pass/Fail |
|----------|-------|-----------------|-----------|
| Book with no auth | Complete booking flow | Booking saved locally | [ ] |
| Book while authenticated | Complete booking flow | Booking saved to DB | [ ] |
| Select booked slot | Try to book taken slot | Slot unavailable | [ ] |
| Past date selection | Click past date | Date disabled | [ ] |
| Invalid payment | Use declined card | Error message shown | [ ] |
| Coach unavailable | Select date with no coach | Fallback list shown | [ ] |
| Multiple players | Add 3+ players | All players saved | [ ] |
| Concurrent bookings | 2 users, same slot | First user succeeds | [ ] |

### Edge Case Testing

#### Boundary Conditions
- Minimum age: Test with today's date as DOB
- Maximum age: Test with 100 years ago as DOB
- Name length: Test 1 character and 255 characters
- Price: Test £0.01 and £9999.99
- Sessions: Book 100 sessions in one day

#### Performance Testing
- Load 1000 availability slots
- Render calendar with full year of data
- Submit 50 bookings simultaneously
- Load dashboard with 500 historical sessions

---

## Data Validation Scripts

### Daily Health Check
```bash
#!/bin/bash
# health_check.sh

echo "Empire Performance Health Check"
echo "================================"

# Check API connectivity
curl -s "$VITE_SUPABASE_URL/rest/v1/" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" | jq .

# Check availability count
echo "Available slots today:"
source .env
curl -s "$VITE_SUPABASE_URL/rest/v1/availability?starts_at=gte.$(date -I)&starts_at=lt.$(date -I -d tomorrow)&status=eq.open&select=count" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" | jq .

# Check recent bookings
echo "Bookings in last 24 hours:"
curl -s "$VITE_SUPABASE_URL/rest/v1/sessions?created_at=gte.$(date -I -d yesterday)&select=count" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" | jq .
```

### Data Integrity Validation
```sql
-- Check for orphaned records
SELECT 'Orphaned availability' as issue, COUNT(*) 
FROM availability a 
LEFT JOIN locations l ON a.location_id = l.id 
WHERE l.id IS NULL;

-- Check for double bookings
SELECT 'Double bookings' as issue, COUNT(*) 
FROM availability 
WHERE status = 'booked' 
GROUP BY location_id, starts_at 
HAVING COUNT(*) > 1;

-- Verify payment totals
SELECT 'Payment mismatches' as issue, COUNT(*)
FROM mock_payments mp
JOIN sessions s ON mp.session_id = s.id
WHERE mp.amount != s.total_amount;
```

---

## Security Checklist

### Pre-Production Security Review

#### Data Protection
- [ ] No PAN/CVV stored in database
- [ ] Personal data encrypted at rest
- [ ] HTTPS enforced in production
- [ ] API keys not in source control

#### Authentication Security
- [ ] Password complexity enforced
- [ ] Session timeout configured
- [ ] Rate limiting on login attempts
- [ ] Email verification required

#### Authorization Controls
- [ ] RLS policies properly restrictive
- [ ] Role-based access enforced
- [ ] API endpoints authenticated
- [ ] CORS properly configured

#### Payment Security
- [ ] PCI compliance verified
- [ ] Tokenization implemented
- [ ] SSL certificate valid
- [ ] Payment logs sanitized

### Security Testing Procedures

#### SQL Injection Testing
```javascript
// Test malicious inputs
const maliciousInputs = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "<script>alert('XSS')</script>",
  "../../etc/passwd"
];

// Verify all inputs are properly sanitized
```

#### Authentication Bypass Attempts
1. Try accessing protected routes without login
2. Attempt to modify JWT tokens
3. Test session hijacking scenarios
4. Verify logout clears all sessions

#### Data Access Validation
1. Verify users can only see their own data
2. Test cross-tenant data access
3. Validate API response filtering
4. Check for information disclosure

---

## Appendices

### Appendix A: Test Data Sets

#### Valid Test Credit Cards (Mock Mode)
- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- Amex: 3782 822463 10005

#### Test User Accounts
| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Parent | parent.test@empire.com | Test123! | Parent portal testing |
| Coach | coach.test@empire.com | Test123! | Coach dashboard testing |
| Director | director.test@empire.com | Test123! | Admin testing |

### Appendix B: API Endpoints Reference

| Endpoint | Method | Purpose | Authentication |
|----------|---------|---------|----------------|
| /rest/v1/locations | GET | List locations | Public |
| /rest/v1/availability | GET | Check availability | Public |
| /rest/v1/sessions | POST | Create booking | Optional |
| /rest/v1/user_profiles | GET | User details | Required |

### Appendix C: Support Resources

#### Internal Resources
- Technical Documentation: `/docs/technical`
- API Documentation: `/docs/api`
- Database Schema: `/docs/schema`

#### External Resources
- Supabase Documentation: https://supabase.io/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

#### Contact Information
- Development Team: dev@empire-performance.com
- QA Team: qa@empire-performance.com
- Support: support@empire-performance.com

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Sept 2025 | Initial comprehensive guide | System |
| | | | |

---

## Sign-off Section

### Testing Completion Checklist

- [ ] All core workflows tested
- [ ] Edge cases validated
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed

**Tester Name**: _______________________  
**Date**: _______________________  
**Signature**: _______________________

**QA Lead Approval**: _______________________  
**Date**: _______________________  
**Signature**: _______________________