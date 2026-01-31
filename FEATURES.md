# Shala — Feature Spec (from Joan, 2026-01-31)

## 1. Getting Started (Onboarding)
- Step-by-step wizard: profile (name, photo, bio, languages), location (city/country)
- Import templates: official Isha config file import (one click) or manual setup
- Payment setup: Stripe (international) / Razorpay (India) — optional, can do bank/cash manually
- WhatsApp setup: connect own WhatsApp Business number (messages come from teacher, not platform)
- Public page live after onboarding

## 2. Public Page (Teacher Website)
- URL: shala.app/your-name
- Photo, bio, location, practices offered, upcoming programs (auto-updated)
- "Message on WhatsApp" button
- Program detail pages: dates, times, venue, price, "Register" button
- 2-3 visual themes (light, dark, earth tones)
- Multi-language content (auto-detect student language)
- Custom domain (paid plan)

## 3. Creating Programs
- Goal: under 2 minutes from "New Program" to published
- **Ready-made templates:**
  - 2-Day Intensive (Fri evening + Sat + Sun morning)
  - 3-Day Intensive
  - Single Day Workshop
  - Half Day Session
  - Free Offering
  - Online Program (Zoom/Meet link)
  - Correction Session
  - Custom (blank)
- Templates pre-fill: session times, suggested capacity, prep instructions, what-to-bring text
- Everything editable
- Save own templates from created programs
- Duplicate past programs (adjust dates)
- **Online programs:** Zoom / Google Meet integration — auto-generate or paste link, only registered students see it

## 4. Student Registration & Booking
- Visit program page → Register → Details → Health form → Pay → Confirmation
- Confirmation via WhatsApp + email: program details, venue map, prep instructions, calendar invite (.ics)
- Online programs: meeting link included
- **No student login required** — simple form, unique booking link for viewing/cancellation
- **Payment flexibility:**
  - Online (Stripe/Razorpay)
  - Bank transfer (student registers, teacher marks paid)
  - Cash (teacher marks paid at venue)
  - Free
- **Waitlist:** when full, students go on waitlist. Teacher chooses who gets offered spots.

## 5. Health Questionnaire
- **Mandatory, cannot be skipped**
- Covers: age, height, weight, medical conditions/injuries, surgeries (last 2 years), pregnancy, chronic conditions, medications, yoga experience, mental health, consent/liability
- Teacher reviews manually before each program
- Dashboard shows unread health forms per upcoming program
- **Teachers can add custom questions**

## 6. Dashboard
- Focused on **next upcoming program:**
  - Students registered, pending payments, health forms to review, spots left
- **Action items:** unread health forms, pending payments, cancellation requests
- **Quick actions:** create program, message students, export data
- **Recent activity:** latest bookings, payments, cancellations

## 7. Student Management (CRM)
- Private student list per teacher
- **Per student:**
  - Contact info: name, email, phone, WhatsApp
  - Program history: which programs attended, dates, completion
  - Health forms: latest + past submissions
  - Practice tracking: which practices initiated into (→ section 9)
  - Private notes (e.g., "needs knee modifications")
  - Tags (e.g., "regular", "beginner", "needs follow-up")
- **Search & filter:** by program attended, tags, location, date range
- **Export:** CSV
- **Prerequisites:** programs can require completing another program first. Warn or block (teacher chooses)

## 8. Cancellations
- **100% teacher discretion** — NO automatic refunds
- Flow: student requests cancellation → teacher notified → teacher approves/declines
- Platform payments: refund from dashboard
- Bank/cash payments: teacher handles directly, platform tracks
- Cancellation policy text on program pages (informational only)

## 9. After the Program: Mandala Support & Corrections

### 40-Day Mandala Practice Reminders
- Teacher marks student as "initiated" after program
- Student enters 40-day mandala tracking:
  - Daily WhatsApp reminder at chosen time (e.g., "Day 12/40 — Continue your Surya Kriya practice today.")
  - Optional: student confirms daily practice
  - Dashboard shows mandala progress (on track / dropped off)
  - After 40 days: congratulatory message
  - Customizable reminder text

### Correction Sessions
- Shorter focused sessions (1-2 hours)
- Only available to students who completed parent program
- Publishing auto-notifies eligible students via WhatsApp

## 10. Communication & Notifications
- **WhatsApp is primary channel** — from teacher's own WhatsApp Business number
- **Automatic messages:**
  - Booking confirmation
  - Payment received
  - Program reminder (48h before)
  - Program reminder (2h before)
  - Post-program follow-up
  - Mandala daily practice reminder
  - Correction session available
  - Invoice/receipt (via email)
- **Teacher reminders:**
  - 48h before program: registration summary, pending payments, health forms to review
  - Program day morning: student count, checklist
