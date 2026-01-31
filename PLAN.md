# Shala — Implementation Plan

> Senior engineer: Shankaran Pillai 🐍
> Last updated: 2026-01-31
> Approach: Incremental sprints, each one shippable. Tests + i18n on every feature.

---

## Current State

**Committed:** Auth (Supabase email/password + Google OAuth)
**Uncommitted (working):** Onboarding, dashboard (basic), program creation, teacher public page, student registration + health form, booking confirmation, i18n (en/es), navigation

**First action:** Commit all uncommitted work as baseline before building anything new.

---

## Sprint 0 — Housekeeping (Before Building)
> Goal: Clean foundation. No new features.

- [ ] **0.1** Commit all uncommitted work (proper atomic commits)
- [ ] **0.2** Run `npx tsc --noEmit` — fix any TypeScript errors
- [ ] **0.3** Run `npm run build` — ensure production build works
- [ ] **0.4** Audit i18n coverage — verify all user-facing strings use `useTranslations`/`getTranslations`
- [ ] **0.5** Add missing shadcn/ui components we'll need: `tabs`, `checkbox`, `popover`, `command` (for combobox search), `pagination`, `tooltip`, `switch`, `calendar`
- [ ] **0.6** Create shared utility: `formatDate()`, `formatCurrency()` (locale-aware)
- [ ] **0.7** Create reusable `<EmptyState>` and `<LoadingState>` components

**Tests:**
- [ ] Validation schema tests for existing Zod schemas (programs, registration, onboarding)

---

## Sprint 1 — Student CRM
> Goal: Teachers can view, search, and manage their students.

### 1A. Student List Page (`/dashboard/students`)
- [ ] **1A.1** Server component: fetch all students for teacher (with booking count, last program date)
- [ ] **1A.2** Search bar: search by name, email, phone (server-side query)
- [ ] **1A.3** Filter by: tag, program attended, date range
- [ ] **1A.4** Sortable table: name, email, programs attended, last booking, tags
- [ ] **1A.5** Pagination (20 per page)
- [ ] **1A.6** Empty state for new teachers with no students yet
- [ ] **1A.7** CSV export button (server action → stream download)

### 1B. Student Detail Page (`/dashboard/students/[id]`)
- [ ] **1B.1** Contact info card: name, email, phone, WhatsApp, emergency contact, DOB, gender
- [ ] **1B.2** Edit contact info (inline or modal)
- [ ] **1B.3** Booking history: table of all bookings with program name, date, status, payment
- [ ] **1B.4** Health forms: list of all submitted forms, expandable to view details
- [ ] **1B.5** Practice tracking: which practices student has been initiated into
- [ ] **1B.6** Tags: add/remove tags (with autocomplete from existing tags)
- [ ] **1B.7** Teacher notes: rich text area, auto-saves

### 1C. Server Actions & Validations
- [ ] **1C.1** `getStudents()` — paginated, filtered, sorted query
- [ ] **1C.2** `getStudentById()` — full student with bookings, health forms, practices
- [ ] **1C.3** `updateStudent()` — edit contact info
- [ ] **1C.4** `updateStudentTags()` — add/remove tags
- [ ] **1C.5** `updateStudentNotes()` — save teacher notes
- [ ] **1C.6** `exportStudentsCSV()` — generate CSV
- [ ] **1C.7** Zod validations for all mutations

**i18n:** All labels, empty states, column headers, filter labels, export button
**Tests:** Validation schemas, CSV export format

---

## Sprint 2 — Enhanced Dashboard
> Goal: Dashboard focused on next upcoming program with action items.

### 2A. Next Program Focus
- [ ] **2A.1** Query next published program by earliest session date
- [ ] **2A.2** Hero card: program name, dates, venue, registration count vs capacity
- [ ] **2A.3** Stats row: registered / pending payments / health forms to review / spots left
- [ ] **2A.4** Progress indicators (visual bars)

### 2B. Action Items
- [ ] **2B.1** Unreviewed health forms count + link to review
- [ ] **2B.2** Pending payments count + link to view
- [ ] **2B.3** Cancellation requests count + link to manage
- [ ] **2B.4** Waitlisted students count (when waitlist exists)

### 2C. Quick Actions & Activity
- [ ] **2C.1** Quick action buttons: New Program, Message Students, Export Data
- [ ] **2C.2** Recent activity feed: latest bookings, payments, cancellations (last 10)
- [ ] **2C.3** "No upcoming programs" state with CTA to create one

### 2D. Overall Stats
- [ ] **2D.1** Total programs (all time), total students, total revenue
- [ ] **2D.2** Programs by status breakdown (draft/published/completed)

**i18n:** All dashboard text, stat labels, action items, activity descriptions
**Tests:** Dashboard data aggregation queries

---

## Sprint 3 — Program Editing, Duplication & Custom Templates
> Goal: Full CRUD lifecycle for programs.

### 3A. Program Editing
- [ ] **3A.1** Edit page reusing `program-form.tsx` (pre-filled)
- [ ] **3A.2** Validation: warn if program has existing bookings (sessions/venue changes)
- [ ] **3A.3** Status transitions: Draft→Published, Published→Cancelled (with confirmation)
- [ ] **3A.4** "Mark as Completed" action (after all sessions done)

### 3B. Program Duplication
- [ ] **3B.1** "Duplicate" button on program detail/list
- [ ] **3B.2** Creates copy as DRAFT with dates cleared, keeps everything else
- [ ] **3B.3** Opens in edit mode for date adjustment

### 3C. Custom Templates
- [ ] **3C.1** "Save as Template" action on any program
- [ ] **3C.2** Creates ScheduleTemplate with `teacherId` set (not platform template)
- [ ] **3C.3** Show custom templates alongside platform templates in program creation
- [ ] **3C.4** Manage templates page (edit/delete custom templates)

### 3D. Program Deletion
- [ ] **3D.1** Delete draft programs (hard delete, no bookings possible)
- [ ] **3D.2** Cancel published programs (soft: status→CANCELLED, notify students)

**i18n:** Edit form labels, status transition confirmations, duplication messaging
**Tests:** Status transition logic, duplication server action

---

## Sprint 4 — Venue Management
> Goal: CRUD for venues, reusable across programs.

- [ ] **4.1** Venue list page (`/dashboard/venues`) — name, city, country, capacity, program count
- [ ] **4.2** Create venue form (name, address, city, country, capacity, notes)
- [ ] **4.3** Edit venue (inline or dedicated page)
- [ ] **4.4** Delete venue (only if no active programs using it)
- [ ] **4.5** "Share with community" checkbox (`isShared` flag)
- [ ] **4.6** Program form integration: dropdown of saved venues + "Add new venue" inline
- [ ] **4.7** Server actions + Zod validations for all CRUD
- [ ] **4.8** Navigation: add "Venues" to sidebar

**i18n:** Venue form labels, list headers, empty states
**Tests:** Venue validation schemas, delete-with-active-programs guard

---

## Sprint 5 — Waitlist & Cancellations
> Goal: Capacity management and teacher-controlled cancellation flow.

### 5A. Waitlist
- [ ] **5A.1** Registration flow: if program full → create booking with `WAITLISTED` status
- [ ] **5A.2** Waitlist UI on student-facing registration: "You're on the waitlist" confirmation
- [ ] **5A.3** Teacher dashboard: see waitlisted students per program
- [ ] **5A.4** "Offer spot" action → changes status to `WAITLIST_OFFERED`, notifies student
- [ ] **5A.5** Student-facing: accept/decline offered spot (via booking link)

### 5B. Cancellations
- [ ] **5B.1** Student-facing: "Request Cancellation" button on booking page
- [ ] **5B.2** Creates `CANCELLATION_REQUESTED` status
- [ ] **5B.3** Teacher dashboard: cancellation requests list with approve/decline
- [ ] **5B.4** Approve: sets status to `CANCELLED`, optionally records refund info
- [ ] **5B.5** Decline: restores to previous status with optional message
- [ ] **5B.6** Cancellation policy text display on program pages (from `cancellationPolicyText`)

**i18n:** Waitlist messaging, cancellation request flow, teacher action labels
**Tests:** Waitlist capacity logic, status transition validations

---

## Sprint 6 — Health Form Review + Custom Questions
> Goal: Teachers can review health forms efficiently and add custom questions.

- [ ] **6.1** Health form review page per program (`/dashboard/programs/[id]/health-forms`)
- [ ] **6.2** List of submissions: student name, status (reviewed/unreviewed), flags (pregnancy, surgery, etc.)
- [ ] **6.3** "Mark as reviewed" action
- [ ] **6.4** Health form detail view with all answers formatted clearly
- [ ] **6.5** Dashboard badge: unreviewed health forms count
- [ ] **6.6** Custom questions: teacher settings to add extra questions (stored as JSON in Teacher or Program)
- [ ] **6.7** Custom questions rendered dynamically in registration health form

**i18n:** Health form review UI, custom question builder labels
**Tests:** Custom question rendering, review status toggling

---

## Sprint 7 — Practice Tracking & Correction Sessions
> Goal: Mark students as initiated, create correction sessions for alumni.

### 7A. Practice Tracking
- [ ] **7A.1** After program: "Mark as Initiated" button per student (on booking detail)
- [ ] **7A.2** Creates `StudentPractice` record with practice name from program
- [ ] **7A.3** Student CRM: practices tab shows all initiations with dates
- [ ] **7A.4** Bulk "Mark All as Initiated" for a program

### 7B. Correction Sessions
- [ ] **7B.1** Program creation: "Correction Session" toggle + select parent program
- [ ] **7B.2** Registration restriction: only students who completed parent program can register
- [ ] **7B.3** Prerequisite check in registration flow (ADVISORY vs REQUIRED modes)
- [ ] **7B.4** Teacher can see eligible students list for correction sessions

**i18n:** Initiation labels, correction session messaging, prerequisite warnings
**Tests:** Prerequisite validation logic, eligible student filtering

---

## Sprint 8 — Booking Enhancements
> Goal: Calendar invites, improved confirmations, booking management.

- [ ] **8.1** Generate `.ics` calendar invite on booking confirmation
- [ ] **8.2** Attach .ics to confirmation email (when email is ready)
- [ ] **8.3** Booking detail page: add venue map embed (Google Maps static)
- [ ] **8.4** "What to bring" and "Preparation" sections on confirmation
- [ ] **8.5** Online programs: show meeting link only to confirmed bookings
- [ ] **8.6** Teacher-side booking management: view all bookings for a program, change payment status

**i18n:** Calendar invite text, map labels, preparation instructions
**Tests:** .ics file generation, meeting link visibility logic

---

## Sprint 9 — Email Notifications
> Goal: Core transactional emails working.

- [ ] **9.1** Email service setup (Resend, SendGrid, or Supabase built-in)
- [ ] **9.2** Booking confirmation email template (HTML)
- [ ] **9.3** Payment received email
- [ ] **9.4** Program reminder (48h before) — cron job or scheduled function
- [ ] **9.5** Program reminder (2h before)
- [ ] **9.6** Cancellation confirmation email
- [ ] **9.7** Teacher reminders: 48h before (registration summary) + morning of (checklist)
- [ ] **9.8** Email templates fully i18n (student's preferred language)

**Tests:** Email template rendering, schedule logic

---

## Sprint 10 — Online Programs (Zoom/Meet)
> Goal: Meeting link management for online programs.

- [ ] **10.1** Program form: meeting URL field + provider selector (Zoom/Google Meet/Custom)
- [ ] **10.2** Auto-paste integration (manual URL for MVP — API integration Phase 2)
- [ ] **10.3** Meeting link visible only to confirmed students on booking page
- [ ] **10.4** Meeting link included in confirmation email + reminder emails
- [ ] **10.5** Public program page: shows "Online" badge, no link until registered

**i18n:** Online program labels, provider names
**Tests:** Link visibility based on booking status

---

## Future (Post-MVP — Not in current plan)

- **Payment integration** (Stripe + Razorpay) — Sprint 11+
- **WhatsApp Business integration** — Sprint 12+
- **40-Day Mandala reminders** — Sprint 13+ (requires WhatsApp Business)
- **Visual themes for public pages** — Sprint 14
- **Custom domain support** — Sprint 15
- **Teacher directory** — Sprint 16
- **Mobile PWA** — Sprint 17

---

## Cross-Cutting Standards (Every Sprint)

### i18n
- Every user-facing string in `messages/en.json` + `messages/es.json`
- Use `useTranslations` (client) / `getTranslations` (server)
- Test: spot-check Spanish translation renders correctly

### Testing
- Zod validation schemas: unit tests
- Server actions: input validation + authorization (teacher isolation)
- Key UI logic: prerequisite checks, waitlist capacity, status transitions

### Code Quality
- `npx tsc --noEmit` passes before every commit
- `npm run build` passes before every sprint merge
- Atomic commits with conventional commit messages

### Security
- Every query filtered by `teacherId` (teacher isolation)
- All mutations validated with Zod
- No raw SQL
- Auth checked on all protected routes

---

## Execution Order Summary

```
Sprint 0  → Clean foundation, fix issues, prep components
Sprint 1  → Student CRM (biggest gap in current MVP)
Sprint 2  → Enhanced Dashboard (daily driver for teachers)
Sprint 3  → Program Edit/Duplicate/Templates (complete CRUD)
Sprint 4  → Venue Management (supports program creation)
Sprint 5  → Waitlist & Cancellations (registration lifecycle)
Sprint 6  → Health Form Review + Custom Questions
Sprint 7  → Practice Tracking & Correction Sessions
Sprint 8  → Booking Enhancements (.ics, maps, meeting links)
Sprint 9  → Email Notifications
Sprint 10 → Online Programs (Zoom/Meet)
```

Each sprint is independently deployable. No sprint depends on a later one.
