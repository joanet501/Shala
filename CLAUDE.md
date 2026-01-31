# Shala — Claude Code Context

## What is Shala?

Multi-tenant SaaS platform for **Isha Classical Hatha Yoga Teachers** to manage their teaching practice. Teachers can schedule programs, manage student registrations, collect health forms, process payments, and communicate with students — all in one place.

**Vision**: Enable teachers to focus on teaching while Shala handles the administrative overhead. Teachers sign up, complete onboarding, and are ready to offer programs in minutes.

## Project Status (as of 2026-01-31)

**Phase 1 MVP**: ~85% complete
- ✅ Authentication & Authorization (Supabase Auth)
- ✅ Teacher Onboarding Wizard
- ✅ Dashboard Home Page
- ✅ Program Creation & Management
- ✅ Teacher Public Pages (`/t/[slug]`)
- ✅ Student Registration & Booking Flow
- ✅ Health Form Collection (27+ health conditions)
- ✅ Internationalization (English/Spanish)
- 🚧 Booking Confirmation & Email Notifications
- 🚧 Student CRM (list/search/notes)
- 🚧 Venue Management

See `STATUS.md` for detailed progress tracking.

## Domain Rules & Business Logic

### Programs
- **Primary use case**: Weekend intensives (Fri–Sun, 3 sessions)
- **Other types**: Free intro sessions, workshops, online programs, correction sessions
- **Templates**: 8 pre-seeded schedule templates for common program formats
- **Lifecycle**: DRAFT → PUBLISHED → COMPLETED → CANCELLED
- **Capacity**: Optional capacity limits with "spots left" display
- **Health forms**: Can be required or optional per program

### Students
- **No student accounts** — teacher-isolated contact lists
- **No student portal** — students interact via public pages only
- **Privacy**: Each teacher's student list is completely isolated
- **Registration**: Students register for programs via public links (`/t/[slug]/register/[programSlug]`)

### Communication
- **Primary**: WhatsApp (teacher's own number, one-on-one)
- **Secondary**: Email for booking confirmations and reminders
- **No bulk messaging in MVP** — WhatsApp Business API integration planned for Phase 2

### Payments
- **Teacher discretion**: Choose what payment methods to accept per program
- **Methods**: Online (Stripe/Razorpay), bank transfer, cash at venue, or free
- **Currencies**: Multi-currency support (USD, EUR, INR, etc.)
- **Status tracking**: PENDING → COMPLETED → REFUNDED → FAILED

### Isha Compliance
- **Branding guidelines**: Logo usage, color schemes, terminology requirements
- **Storage**: Admin-managed versioned data in ComplianceRuleset table
- **Future**: Admin panel to update compliance rules without code changes

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Next.js 16.1 (App Router, TypeScript 5.9, Tailwind v4) | |
| Database | PostgreSQL via Supabase | project: `gldhnipllinytsfemwbc`, region: `ap-south-1` |
| ORM | Prisma 7.3 | output: `src/generated/prisma`, config: `prisma.config.ts` |
| Auth | Supabase Auth | email/password + Google OAuth |
| UI | shadcn/ui + Radix + Lucide icons | uses `sonner` for toasts |
| i18n | next-intl | cookie-based locale detection, English + Spanish |
| Deployment | Vercel + Supabase | |

## Internationalization (i18n)

**Architecture**: Cookie-based locale detection using `next-intl` (no URL routing changes)

**Supported Languages**: English (en), Spanish (es) — default: English

**Key Files**:
- `messages/en.json`, `messages/es.json` — translation files organized by feature domain
- `src/i18n/config.ts` — locale configuration and type definitions
- `src/i18n/request.ts` — server-side locale detection (cookie → browser → default)
- `src/components/language-switcher.tsx` — language selector component
- `next.config.ts` — next-intl plugin integration

**Usage**:

```tsx
// Client Components
"use client";
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('registration.personalInfo');
  return <label>{t('firstName')}</label>; // "First Name" or "Nombre"
}

// Server Components
import { getTranslations } from 'next-intl/server';

async function MyPage() {
  const t = await getTranslations('booking');
  return <h1>{t('success')}</h1>;
}

// With dynamic values
t('greeting', { name: 'Juan' }) // "Hello, Juan!" or "¡Hola, Juan!"
```

**Translation Structure**: Organized by feature domain (registration, booking, healthConditions, etc.). See `I18N_IMPLEMENTATION.md` for full guide.

**IMPORTANT**: Always use i18n for any user-facing text. Import `useTranslations` in client components or `getTranslations` in server components.

## Dev Environment

- **Node 24** (v24.13.0) — `node` and `npm`/`npx` work directly, no aliases needed
- **Prisma CLI**: `npx prisma <command>` works (loads config from `prisma.config.ts`)
- **DB migrations**: use `prisma db push` (NOT `prisma migrate dev` — no shadow DB on free tier)
- **Type check**: `npx tsc --noEmit`
- **Dev server**: `npm run dev`

## Prisma 7 Gotchas

- No `url`/`directUrl` in `schema.prisma` — connection config in `prisma.config.ts` (uses `DIRECT_URL`)
- Uses `@prisma/adapter-pg` with `pg` connection pool in app code (`src/lib/db/prisma.ts`)
- Generated client is ESM, import as: `import { PrismaClient } from "@/generated/prisma/client"`
- `@updatedAt` has no DB-level default — seed scripts must provide `updatedAt` explicitly
- All tables use `@@map("snake_case")`, fields are camelCase in code

## Architecture

### Route Structure
```
middleware.ts               → Auth guard + onboarding redirect (queries Supabase)
src/app/
  ├── layout.tsx            → Root layout with next-intl provider, fonts, Toaster
  ├── (auth)/               → Public auth pages (login, register, password reset)
  ├── (dashboard)/          → Protected teacher dashboard
  │   ├── layout.tsx        → requireAuth() + ensureTeacherExists() + Navigation
  │   ├── dashboard/        → Home (stats, upcoming programs)
  │   ├── onboarding/       → Multi-step onboarding wizard
  │   ├── programs/         → Program CRUD (list, new, [id])
  │   ├── students/         → Student CRM (planned)
  │   └── settings/         → Teacher settings (planned)
  ├── t/[slug]/             → Public teacher pages (no auth required)
  │   ├── page.tsx          → Teacher profile + published programs
  │   ├── register/[programSlug]/ → Student registration form
  │   └── booking/[bookingId]/    → Booking confirmation page
  └── auth/callback/        → OAuth/email callback → teacher-sync → smart redirect

src/lib/
  ├── auth/                 → actions.ts (sign in/up/out), helpers.ts, teacher-sync.ts
  ├── actions/              → Server actions (onboarding.ts, registration.ts, programs.ts)
  ├── validations/          → Zod schemas (onboarding.ts, registration.ts, programs.ts)
  ├── db/prisma.ts          → Prisma singleton with pg adapter
  └── supabase/             → server.ts + client.ts helpers

src/i18n/                   → i18n config and request handler
src/components/
  ├── ui/                   → shadcn/ui components
  ├── registration/         → Multi-step registration form + health form
  └── language-switcher.tsx → Cookie-based language selector

messages/                   → Translation files (en.json, es.json)
```

### Authentication Flow
1. **Middleware** checks JWT on every request
2. **Protected routes** (`/dashboard/*`) require valid session
3. **Teacher sync**: `ensureTeacherExists()` creates Teacher record on first login (race-condition safe)
4. **Smart redirect**: `getPostAuthRedirect()` routes to `/onboarding` or `/dashboard` based on `onboardingCompleted`
5. **OAuth callback**: Google OAuth returns to `/auth/callback` → syncs teacher → redirects

### Data Flow Patterns
- **Server Actions**: All mutations (create/update/delete) use server actions with Zod validation
- **Server Components**: All data fetching happens in Server Components (async/await Prisma)
- **Client Components**: Only for interactivity (forms, language switcher, toasts)
- **Optimistic UI**: Not implemented yet (future enhancement)

## Database Schema

**14 Models, 19 Enums** — see `prisma/schema.prisma` for full schema

### Core Models
- **Teacher**: name, email, slug (unique), bio, photo, city, country, languages, whatsappPhone, onboardingCompleted
- **Student**: firstName, lastName, email, phone, dateOfBirth, gender, emergencyContact (teacher-scoped, no auth)
- **Program**: name, slug, description, type, status, venueType, sessions (JSON), capacity, pricing, requiresHealthForm
- **Booking**: links Student to Program, tracks paymentStatus, paymentMethod, amount, currency
- **HealthForm**: comprehensive health questionnaire (27+ conditions), pregnancy status, consent tracking
- **Venue**: name, address, city, country, coordinates, isShared (for future directory)
- **Payment**: transaction tracking, status, method, amount, currency, externalId (Stripe/Razorpay)

### Support Models
- **ScheduleTemplate**: Pre-seeded program templates (Hatha Yoga Beginner, Bhuta Shuddhi, etc.)
- **StudentPractice**: Track which Isha programs a student has learned
- **Notification**: Email/SMS notification queue and delivery tracking
- **TeacherSubscription**: Subscription tier, billing cycle, Stripe IDs (future)
- **ComplianceRuleset**: Isha branding guidelines versioning (future admin panel)
- **ComplianceAsset**: Logos, images, documents for compliance (future)

### Key Relationships
- Teacher → Programs (1:many)
- Teacher → Students (1:many, isolated per teacher)
- Program → Bookings (1:many)
- Student → Bookings (1:many)
- Booking → HealthForm (1:1, optional)
- Booking → Payment (1:1, optional)

### Important Schema Patterns
- **Enums**: ProgramType, ProgramStatus, VenueType, PaymentMethod, PaymentStatus, Gender, etc.
- **JSON fields**: Program.sessions (array of {date, startTime, endTime, title})
- **Soft deletes**: Not implemented (future consideration)
- **Timestamps**: All models have createdAt, updatedAt
- **UUIDs**: All primary keys are UUIDs
- **snake_case DB**: All table/column names use snake_case (via `@@map()` and `@map()`)

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | 14 models, 19 enums |
| `prisma.config.ts` | Prisma 7 datasource config |
| `prisma/seed.ts` | Seeds 8 schedule templates (uses Supabase client directly) |
| `src/lib/db/prisma.ts` | Prisma singleton with pg adapter |
| `src/lib/auth/actions.ts` | Sign in/up/out server actions |
| `src/lib/auth/helpers.ts` | `requireAuth()`, `getPostAuthRedirect()` |
| `src/lib/auth/teacher-sync.ts` | `ensureTeacherExists()` with race condition handling |
| `middleware.ts` | Route protection + onboarding redirect |
| `I18N_IMPLEMENTATION.md` | Complete i18n implementation guide and usage patterns |
| `messages/en.json`, `messages/es.json` | Translation files for all user-facing text |

## Current Features (Completed)

### 1. Authentication & Authorization
- **Email/Password**: Supabase Auth with secure password reset flow
- **Google OAuth**: One-click sign-in with Google
- **Route Protection**: Middleware-based auth guard for `/dashboard/*` routes
- **Teacher Sync**: Automatic Teacher record creation on first login (race-condition safe)
- **Smart Redirects**: Post-auth routing based on onboarding status

### 2. Teacher Onboarding
- **Multi-step wizard**: Name, slug (with real-time availability check), location, languages, bio
- **Photo upload**: Supabase Storage integration with public URL generation
- **Slug validation**: Client-side debounced availability check via API route
- **Server action**: Atomic save with `onboardingCompleted` flag update

### 3. Dashboard
- **Stats cards**: Programs count, students count, upcoming programs count
- **Upcoming programs**: List view with session details, empty state
- **Navigation**: Responsive nav with Programs, Students, Settings sections
- **Profile menu**: Sign out, settings access

### 4. Program Management
- **Template selection**: Choose from 8 pre-seeded schedule templates
- **Configurable sessions**: Add/remove sessions, edit dates/times/titles
- **Venue setup**: In-person (venue required), online (meeting URL), hybrid
- **Pricing options**: Free or paid (multi-currency support)
- **Health form toggle**: Require health form per program
- **Draft/Publish**: Save as draft, publish when ready
- **Public links**: Copy-to-clipboard links for teacher page and program registration
- **Program editing**: Full CRUD operations (planned: edit/delete)

### 5. Teacher Public Pages
- **SEO-friendly URLs**: `/t/[slug]` for teacher profile
- **Profile display**: Photo, bio, contact info, languages spoken
- **Published programs**: Grid of available programs with registration CTAs
- **Responsive design**: Mobile-first, works on all screen sizes
- **Language switcher**: Cookie-based locale selection (English/Spanish)

### 6. Student Registration
- **Multi-step form**: Personal info → Health form → Payment → Review
- **Personal information**: Name, email, phone, DOB, gender, emergency contact
- **Health questionnaire**: 27+ health conditions, pregnancy status, surgery history, consent
- **Payment method selection**: Online, bank transfer, cash at venue (based on program settings)
- **Student lookup**: Existing students auto-populate based on email (teacher-scoped)
- **Booking creation**: Atomic transaction creating Student + Booking + HealthForm records

### 7. Booking Confirmation
- **Success page**: Booking reference, program details, schedule, venue
- **Payment instructions**: Different messaging based on payment method
- **Important info**: What to bring, preparation instructions
- **Teacher contact**: WhatsApp and email quick links
- **Multi-language**: Fully translated confirmation pages

### 8. Internationalization (i18n)
- **Languages**: English (default), Spanish
- **Cookie-based**: No URL routing changes, `NEXT_LOCALE` cookie
- **Auto-detection**: Browser language preference on first visit
- **Full coverage**: All public-facing text (registration, booking, health form)
- **Type-safe**: TypeScript integration with translation keys
- **Extensible**: Easy to add new languages (structure in place)

## Future Roadmap

### Phase 1 - Remaining MVP Items
1. **Student CRM** (high priority)
   - List all students with search/filter
   - Student detail view with booking history
   - Notes and tags per student
   - Export student list (CSV)

2. **Venue Management** (medium priority)
   - CRUD for teacher's venues
   - Reuse venues across programs
   - Share venues to community directory (optional)

3. **Email Notifications** (medium priority)
   - Booking confirmation emails
   - Program reminder emails (1 week, 1 day before)
   - Manual email to registered students

4. **Program Editing/Deletion** (medium priority)
   - Edit published programs (with booking impact warnings)
   - Cancel programs (refund handling)
   - Duplicate programs (template from existing)

### Phase 2 - Payments Integration
- **Stripe**: Credit/debit card processing
- **Razorpay**: India-specific payments (UPI, cards, net banking)
- **Payment links**: Auto-generated payment links in booking confirmations
- **Refunds**: Manual and automatic refund processing
- **Financial reporting**: Revenue tracking, tax reports

### Phase 3 - Communications
- **WhatsApp Business API**: Automated booking confirmations via WhatsApp
- **Bulk messaging**: Send program updates to all registered students
- **SMS fallback**: For students without WhatsApp
- **Email templates**: Customizable email templates per teacher

### Phase 4 - Advanced Features
- **Student portal**: Optional student accounts to view their bookings
- **Waitlist management**: Automatic promotion when spots open
- **Recurring programs**: Templates for weekly/monthly classes
- **Multi-teacher programs**: Co-teach programs with revenue split
- **Attendance tracking**: Mark attendance per session
- **Certificate generation**: PDF certificates upon completion

### Phase 5 - Platform Features
- **Venue directory**: Public directory of shared venues
- **Teacher directory**: Find teachers by location/language
- **Admin panel**: Manage compliance rules, featured teachers
- **Analytics dashboard**: Insights, trends, growth metrics
- **Mobile apps**: iOS/Android native apps (React Native)
- **Offline mode**: PWA for offline program day operations

### Phase 6 - Business Model
- **Subscription tiers**: Free (1 program), Pro (unlimited), Enterprise (white-label)
- **Revenue share**: Optional commission on paid bookings
- **Stripe Connect**: Marketplace model for payment processing
- **Invoicing**: Automatic invoice generation for subscriptions

## Development Guidelines

### IMPORTANT: Always Use i18n
- **Client components**: Import `useTranslations` from `next-intl`
- **Server components**: Import `getTranslations` from `next-intl/server`
- **Never hardcode user-facing text**: Always use translation keys
- **Add new keys**: Update both `messages/en.json` and `messages/es.json`
- **Dynamic values**: Use `t('key', { variable: value })` syntax

### Code Style
- **TypeScript strict mode**: No `any` types, explicit return types for functions
- **Server Actions**: Prefix with `"use server"`, always validate with Zod
- **Error handling**: Return `{ error: string }` or `{ success: true, data: T }`
- **Loading states**: Use `useTransition()` for client-side loading feedback
- **Async params**: Next.js 16 requires `params: Promise<{ id: string }>`

### Database Operations
- **Use Prisma**: Never write raw SQL unless absolutely necessary
- **Transactions**: Use `prisma.$transaction()` for multi-model operations
- **Race conditions**: Handle concurrent operations (e.g., teacher-sync)
- **Soft deletes**: Not implemented yet (future consideration)
- **Migrations**: Use `npx prisma db push` (no shadow DB on free tier)

### Security
- **Auth required**: Protect all `/dashboard` routes with middleware
- **Teacher isolation**: Always filter by `teacherId` in queries
- **Input validation**: Zod schemas for all user input
- **XSS prevention**: React escapes by default, be careful with `dangerouslySetInnerHTML`
- **SQL injection**: Prisma prevents this automatically
- **Rate limiting**: Not implemented yet (add for production)

### Testing (Future)
- **Vitest setup**: Configured but no tests written yet
- **Unit tests**: Test server actions, validation schemas
- **Integration tests**: Test full user flows (registration, booking)
- **E2E tests**: Playwright for critical paths (future)

## shadcn/ui Components Installed

avatar, badge, button, card, dialog, dropdown-menu, input, label, select, separator, sheet, sonner, table, textarea

**To add more**: `npx shadcn@latest add <component-name>`

## Common Issues & Troubleshooting

### Prisma Client Out of Sync
**Symptoms**: "Unknown argument" errors, missing fields in TypeScript autocomplete

**Fix**:
```bash
npx prisma generate  # Regenerate client
npx prisma db push   # Sync schema to database
```

### NEXT_REDIRECT Error in Server Actions
**Cause**: Catching Next.js internal redirect signals in try/catch blocks

**Fix**: Re-throw `NEXT_REDIRECT` and `NEXT_NOT_FOUND` errors:
```tsx
try {
  // ... your code
  redirect('/somewhere');
} catch (error) {
  if (error instanceof Error &&
      (error.message === "NEXT_REDIRECT" || error.message === "NEXT_NOT_FOUND")) {
    throw error;
  }
  return { error: "Something went wrong" };
}
```

### next-intl Context Not Found
**Symptoms**: "No intl context found" error in client components

**Fix**: Ensure root `layout.tsx` wraps children with `NextIntlClientProvider` (already implemented)

### Supabase Storage 403 Errors
**Cause**: Incorrect bucket policies or RLS rules

**Fix**: Check Supabase dashboard → Storage → teacher-photos bucket → Policies

### TypeScript Errors After Schema Changes
**Always run after schema changes**:
```bash
npx prisma generate
npx tsc --noEmit  # Check for type errors
```

## Git Workflow

### Repository
- **Email**: `joanvidalmezquita@gmail.com`
- **Repo**: https://github.com/joanet501/Shala.git (private)
- **Main branch**: `main`
- **No branch protection yet** (add when team grows)

### Commit Practices
- **Atomic commits**: One logical change per commit
- **Descriptive messages**: Use conventional commits format
  - `feat: add student registration flow`
  - `fix: resolve NEXT_REDIRECT error in program creation`
  - `docs: update CLAUDE.md with i18n guidelines`
  - `refactor: extract health form to separate component`
- **Co-authored commits**: Include when AI assisted:
  ```
  feat: implement i18n for registration flow

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```

### Pre-commit Checklist
- [ ] Run `npx tsc --noEmit` (no TypeScript errors)
- [ ] Run `npm run dev` and test changed features
- [ ] Update `STATUS.md` if completing a major feature
- [ ] Update `CLAUDE.md` if changing architecture or adding guidelines

### Current Status
- **See `STATUS.md`** for detailed progress and next priorities
- **Uncommitted work**: Most recent changes ready to commit
- **Active development**: Phase 1 MVP completion

## Quick Reference

### Start Development
```bash
npm run dev                    # Start dev server (localhost:3000)
npx prisma studio             # Open Prisma Studio (DB GUI)
npx prisma db push            # Push schema changes to DB
npx prisma generate           # Regenerate Prisma client
npx tsc --noEmit              # Type check
```

### Common Commands
```bash
npx shadcn@latest add <name>  # Add shadcn component
npx prisma db seed            # Seed schedule templates
npm run build                 # Build for production
```

### Environment Variables Required
```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DIRECT_URL=  # Supabase connection string
```

### Key URLs
- **Dashboard**: http://localhost:3000/dashboard
- **Onboarding**: http://localhost:3000/onboarding
- **Public teacher page**: http://localhost:3000/t/{slug}
- **Prisma Studio**: http://localhost:5555

---

**Last updated**: 2026-01-31
**Next milestone**: Complete Student CRM and Venue Management for Phase 1 MVP
