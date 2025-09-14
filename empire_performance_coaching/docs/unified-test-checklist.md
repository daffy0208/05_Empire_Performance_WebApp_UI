# Unified Testing Checklist

## 0) Preflight
- [ ] `.env` has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Optional: `VITE_MOCK_PAYMENTS=true`
- [ ] Dev server on http://localhost:4028
- [ ] Correct Supabase project ref selected

## 1) Schema & Migration
- [ ] `public.availability` exists (NOT `coach_availability`)
- [ ] Columns: `coach_id`, `location_id`, `starts_at`, `ends_at`, `status`
- [ ] Locations: `id`, `name`, `is_active`
- [ ] No code/DB refs to `coach_availability`

## 2) Seed & Parity (cloud/local)
- [ ] 4 locations active
- [ ] Availability for next 30 days (10/12/14/16/18)
- [ ] API smoke: `/locations`, `/availability?status=eq.open`
- [ ] Schema + RLS identical across envs

## 3) RLS (testing config)
- [ ] `availability`: public SELECT where `status='open'`
- [ ] `locations`: public SELECT where `is_active=true`
- [ ] Dashboards: authenticated SELECT on `sessions`, `session_participants`
- [ ] Recursion detector returns none

## 4) Booking – Happy Path
- [ ] Location selection highlights card
- [ ] Calendar shows enabled dates this month
- [ ] Time slots list after date select
- [ ] Coach list filtered by date/location
- [ ] Player: name + DOB → Continue advances
- [ ] Payment: £ total equals coach price → Confirmation

## 5) Booking – Fallback / Edge
- [ ] No availability → non‑past days + generic slots
- [ ] No coaches → fallback list with “See other times”
- [ ] Supabase error → diagnostics visible, still selectable
- [ ] Network loss mid‑flow → graceful degradation

## 6) Timezone
- [ ] 23:00 local (next day UTC) → stored UTC; UI local correct
- [ ] DST transition → no duplicate/missing slots
- [ ] Different browser timezone → correct local render

## 7) Concurrency
- [ ] Two parents attempt same slot → one success; friendly error for other
- [ ] Coach cannot be double‑booked (overlap prevented)

## 8) Payments (mock)
- [ ] With `VITE_MOCK_PAYMENTS=true` → mock row inserted
- [ ] Only `card_brand` + `card_last4` stored (no PAN/CVV)
- [ ] Simulated failure → user recovers; booking not confirmed

## 9) Authentication
- [ ] Register (parent) → notice → email confirm → sign‑in
- [ ] Redirect after confirmation matches desired URL
- [ ] Login/logout cycle works
- [ ] Forgot password OK

## 10) Parent Dashboard
- [ ] Loads without recursion error (simple SELECT policies)
- [ ] Empty states render helpful copy
- [ ] User dropdown visible/contrast

## 11) Booking Series
- [ ] Create weekly series → completed_sessions updates
- [ ] next_payment_date calculation
- [ ] Pause/cancel flow

## 12) Invoices
- [ ] Generate invoice + items
- [ ] Status transitions pending ↔ paid ↔ overdue ↔ cancelled
- [ ] payment_method recorded

## 13) Notifications
- [ ] Insert notification → visible; mark read

## 14) Sessions Workflow
- [ ] scheduled → confirmed → in_progress → completed
- [ ] no_show and cancellation flows
- [ ] individual vs group capacity

## 15) Performance
- [ ] Dashboard with 1K sessions (RLS performance)
- [ ] Calendar with a year of availability
- [ ] Search/filter latency acceptable

## 16) Security
- [ ] SQLi/XSS inputs sanitized
- [ ] CSRF (if applicable)
- [ ] Auth rate limiting (GoTrue defaults)
- [ ] Session timeout/refresh handling

## 17) Version Control / CI
- [ ] `git status` clean; `.gitignore` matches no‑entry icons
- [ ] `git fetch --all && git branch -vv` synced
- [ ] CI: `npm ci`, `npm run test`, `npm run build`
- [ ] Migration + rollback plan

## 18) Exit Criteria
- [ ] Criticals resolved (RLS recursion, availability seeding, payment totals)
- [ ] Happy paths pass; fallbacks verified
- [ ] Perf/Security baselines pass
- [ ] Docs updated (README env/seed/RLS, test‑plan)

---

### Verification Scripts
See `docs/verification/` for SQL utilities:
- `legacy-coach-availability.sql`: detect legacy table/refs
- `rls-recursion-detector.sql`: find mutually‑referential policies
