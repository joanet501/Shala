# Shala — Claude Code Project Context

## What is Shala?

A multi-tenant SaaS platform for **Isha Classical Hatha Yoga Teachers**. Teachers finish their Teacher Training at Isha Foundation and have no unified tool for managing their yoga business. Shala lets a teacher sign up and be ready to offer programs in minutes — handling scheduling, bookings, student management, payments, and communications.

The founder (Joan) is both an Isha Hatha Yoga Teacher and the developer building this.

## Key Domain Context

- **Programs** are mostly weekend intensives (Fri-Sun, 2-3 days), plus free offerings, single-day workshops, online sessions, and correction sessions
- **Isha Foundation compliance** — strict branding guidelines that change yearly. Stored as admin-managed versioned data, not hard-coded
- **Program schedules/formats are confidential** — we provide editable templates, teachers manually create programs
- **Students don't have accounts** — teacher-isolated student lists, no student login portal
- **WhatsApp is the primary communication channel** (teacher's own number)
- **Payments are flexible** — online (Stripe/Razorpay), bank transfer, cash, free. Full teacher discretion on cancellations
- **Mandala (40-day tracking) was removed** — teachers use WhatsApp groups instead
- **Venues** — simple checkbox to share with other teachers (community directory grows organically)

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Database**: PostgreSQL via Supabase (project: `gldhnipllinytsfemwbc`, region: `aws-1-ap-south-1`)
- **ORM**: Prisma 7 (custom output to `src/generated/prisma`)
- **Auth**: Supabase Auth (not yet implemented)
- **UI**: shadcn/ui (14 base components installed, uses `sonner` not deprecated `toast`)
- **Payments**: Stripe + Razorpay (not yet implemented)
- **Deployment target**: Vercel + Supabase

## Development Environment

- **Node 22** via custom PowerShell alias: use `n22` prefix before npm/npx commands (e.g., `n22 npm install`)
- **Prisma CLI**: Use `& 'C:\desarrollo\nvm-noinstall\v22.22.0\node.exe' ./node_modules/prisma/build/index.js <command>` — `npx prisma` downloads a fresh copy that can't find the schema
- **Seed script**: Uses Supabase JS client directly (not Prisma client) due to Prisma 7 standalone script issues
- **Database migrations**: Use `prisma db push` (NOT `prisma migrate dev` — Supabase free tier has no shadow database)
- **Git email**: `joanvidalmezquita@gmail.com`
- **Repo**: https://github.com/joanet501/Shala.git (private)

## Prisma 7 Gotchas

- No `url`/`directUrl` in `schema.prisma` datasource block — connection config lives in `prisma.config.ts`
- Generated client is ESM-based, output to `src/generated/prisma`
- `PrismaClient` constructor doesn't accept `datasourceUrl` property
- `@updatedAt` has no DB-level default — seed scripts must provide `updatedAt` explicitly
- Import in app code: `import { PrismaClient } from "@/generated/prisma"`

## Folder Structure

```
shala/
├── prisma/
│   ├── schema.prisma          # 14 models, 19 enums
│   ├── seed.ts                # Seeds 8 platform schedule templates
│   └── migrations/
├── prisma.config.ts           # Prisma 7 datasource config (uses DIRECT_URL)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Login, register, forgot-password
│   │   ├── (dashboard)/       # Teacher dashboard (protected)
│   │   └── (public)/          # Public-facing teacher pages
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── generated/prisma/      # Prisma generated client
│   ├── lib/
│   │   ├── db/prisma.ts       # Prisma singleton
│   │   └── supabase/          # server.ts + client.ts helpers
│   ├── hooks/
│   ├── types/
│   └── utils/
├── tests/
└── public/
```

## Database Models (14)

Teacher, ScheduleTemplate, Program, Venue, Student, Booking, HealthForm, StudentPractice, Payment, Notification, TeacherSubscription, ComplianceRuleset, ComplianceAsset

Key design: all tables use `@@map("snake_case_table_names")`, fields are camelCase in code.

## Project Progress

```
Overall         █████████████░░░░░░░░░░░░░░░░  43%  (12/28)

Foundation      ████████████████████████████░░ 100%  (11/11) ✓
Phase 1 — MVP   ███░░░░░░░░░░░░░░░░░░░░░░░░░  11%  ( 1/ 9)
Future Phases   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%  ( 0/ 8)
```

## Current Status

### Completed (Foundation)
- [x] Product spec (`C:\desarrollo\yoga-studio-saas\PRODUCT_SPEC.md`)
- [x] Feature review docs for teacher feedback (SHALA_FEATURES_REVIEW.md, SHALA_SHORT_OVERVIEW.md)
- [x] Project scaffolding (Next.js + all dependencies)
- [x] Prisma schema (14 models, 19 enums)
- [x] Schema pushed to Supabase
- [x] 8 platform schedule templates seeded
- [x] Supabase client helpers (server + browser)
- [x] Prisma client singleton
- [x] shadcn/ui initialized (14 components)
- [x] Git repo initialized and pushed
- [x] Mandala support removed from schema

### Next Up (Phase 1 — MVP)
- [x] Supabase Auth setup (email/password + Google OAuth)
- [ ] Teacher onboarding wizard (name, slug, city, languages, photo)
- [ ] Dashboard home page (next upcoming program focused)
- [ ] Program creation flow (using seeded templates)
- [ ] Student registration & booking flow
- [ ] Health form collection
- [ ] Student CRM (list, search, tags, notes)
- [ ] Basic notification system (email reminders)
- [ ] Teacher public page (program listing + registration)

### Future Phases
- Payment integration (Stripe + Razorpay)
- WhatsApp Business API integration
- Venue directory (shared venues)
- Compliance framework (admin panel)
- Multi-language support for public pages
- Offline PWA mode for program days
- Invoice PDF generation
- Teacher subscription/billing

## Important Files

| File | Purpose |
|------|---------|
| `PRODUCT_SPEC.md` (parent dir) | Full product specification |
| `prisma/schema.prisma` | Database schema |
| `prisma.config.ts` | Prisma 7 connection config |
| `prisma/seed.ts` | Platform template seeder |
| `src/lib/db/prisma.ts` | Prisma client singleton |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `.env` | Environment variables (has secrets — never commit) |
| `.env.example` | Template without secrets |
