# Shala — Project Status

> **Last updated**: 2026-01-31
> **Uncommitted work**: onboarding wizard, dashboard page, middleware onboarding redirect

## Progress

```
Foundation      ██████████████████████████████ 100%  (11/11)
Phase 1 — MVP   ██████████░░░░░░░░░░░░░░░░░░░  33%  ( 3/ 9)
Future Phases   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%  ( 0/ 8)
```

## Phase 1 — MVP

### Done
- [x] **Supabase Auth** — email/password + Google OAuth, middleware route protection, auth callbacks, teacher-sync on login
- [x] **Teacher onboarding wizard** — name, slug (with availability check), city, country, languages, photo upload to Supabase Storage, bio. Server action saves to DB and marks `onboardingCompleted`
- [x] **Dashboard home page** — welcome greeting, stats cards (programs/students/upcoming counts), upcoming programs empty state
- [x] **Onboarding redirect** — middleware queries teacher table, redirects non-onboarded users from `/dashboard` to `/onboarding`, auth pages redirect based on onboarding status

### Uncommitted files (ready to commit)
```
Modified:  middleware.ts, package.json, src/app/(dashboard)/dashboard/page.tsx,
           src/app/(dashboard)/onboarding/page.tsx, src/lib/auth/actions.ts,
           src/lib/auth/helpers.ts, src/lib/auth/teacher-sync.ts, src/lib/db/prisma.ts
New:       src/app/(dashboard)/onboarding/layout.tsx, onboarding-form.tsx,
           src/app/api/teachers/check-slug/route.ts,
           src/lib/actions/onboarding.ts, src/lib/validations/onboarding.ts
Added deps: @prisma/adapter-pg, pg, @types/pg
```

### Next up (in priority order)
1. [ ] **Program creation flow** — use seeded ScheduleTemplate records, let teacher pick template, fill in details (venue, capacity, pricing, sessions), save as DRAFT, publish
2. [ ] **Teacher public page** — `/t/[slug]` showing teacher profile + published programs with registration links
3. [ ] **Student registration & booking flow** — public registration form per program, creates Student + Booking records
4. [ ] **Health form collection** — required health questionnaire before booking confirmation
5. [ ] **Student CRM** — teacher-side list of students with search, tags, notes
6. [ ] **Basic notification system** — email reminders for upcoming programs
7. [ ] **Venue management** — CRUD for venues, share checkbox for community directory

## Future Phases (not started)

- Payment integration (Stripe + Razorpay)
- WhatsApp Business API integration
- Venue directory (shared venues)
- Compliance framework (admin panel)
- Multi-language support for public pages
- Offline PWA mode for program days
- Invoice PDF generation
- Teacher subscription/billing
