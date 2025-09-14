# Empire Performance – End-to-End Test Plan

## 1) Environment
- Ensure `.env` in `empire_performance_coaching/` contains:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - Optional: `VITE_MOCK_PAYMENTS=true` (saves mock payment records without PAN/CVV)
- Start dev: `npm start` → http://localhost:4028

## 2) Supabase baseline (run once)
- Create/verify schema and RLS for booking:
  - `locations`: public SELECT where `is_active = true`
  - `availability`: public SELECT where `status = 'open'`
- Seed: 4 locations; availability across next 30 days at hours 10/12/14/16/18
- Dashboards (testing): simple non‑recursive read policies
  - `sessions`, `session_participants`: enable RLS; add `SELECT ... USING (true)` for `authenticated`

## 3) Public booking flow
1. Landing → Book Now
2. Location: pick one (card highlights)
3. Calendar:
   - Dates enabled (fallback enables non‑past days when DB empty)
   - Pick a time slot (diagnostics toggle can show counts/errors)
4. Coaches:
   - Coaches shown; if none match date/location, fallback list with “See other times” states
5. Player details:
   - Enter name + DOB; Continue advances (local if unauthenticated; DB insert if authenticated)
6. Payment (mock):
   - Total = coach price in £; submit form
   - If `VITE_MOCK_PAYMENTS=true`, a `mock_payments` row is inserted (brand + last4 only)
7. Confirmation: remains on screen (no auto‑redirect)

## 4) Auth flows
- Register (parent role by default): after submit, notice appears; email confirmation may be required
- Confirm → user is signed in
- Login/logout: verify redirect behavior; logout returns to public
- Forgot password: verify no errors (email if SMTP configured)

## 5) Parent portal
- Visit `/parent-dashboard` after login
- Expected: loads lists/cards (with simple read policies). No recursion error
- Header user dropdown: items visible (not white-on-white)

## 6) Coach/Director (optional)
- Change `user_profiles.role` to `coach` or `director` to view `/coach-dashboard` or `/director-dashboard`

## 7) Error/edge cases
- No availability this month → fallback dates and generic slots
- Network/API error → diagnostics shows last error; selection still works
- Change coach mid‑flow → payment total updates
- Player flow without auth → local proceed; with auth → `athletes` insert

## 8) Data verification
- Availability by day (current month):
```sql
select date_trunc('day', starts_at) d, count(*)
from public.availability
where status='open'
  and starts_at >= date_trunc('month', now())
  and starts_at < date_trunc('month', now()) + interval '1 month'
group by 1 order by 1;
```
- Latest mock payment (if enabled):
```bash
source .env
curl -s -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
"$VITE_SUPABASE_URL/rest/v1/mock_payments?select=created_at,amount,currency,coach_name,player_name,card_brand,card_last4,transaction_id&order=created_at.desc&limit=1" | jq .
```

## 9) Security checks
- `mock_payments` stores only `card_brand` and `card_last4` (never PAN/CVV)
- Keep simple SELECT policies on `sessions`/`session_participants` during testing; tighten later with non‑recursive rules

## 10) Regression quick pass
- Booking flow end‑to‑end
- Register → confirm → login
- Parent dashboard loads
- Payment total matches coach price in £
- Player DOB input accepts and Continue advances
