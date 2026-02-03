# DEV NOTES (concise)

## Quick audit (2026-02-03)
- **Fixed**: hardcoded `teacherId` in health-forms page/actions → now uses `requireAuth()`.
- **Fixed**: direct `new PrismaClient()` in health-forms page/actions → now uses shared `prisma` singleton.
- **Fixed**: invalid `params: Promise<{id}>` type in health-forms page.

## Checks run
- `npx tsc --noEmit` ✅ (no errors)
- `npm run build` ❌ — Next.js prerender bug on `/_not-found` (known issue w/ Next 16 + next-intl).

## Notes
- i18n keys for `healthForms` exist in both `messages/en.json` + `messages/es.json`.
- Health-forms components accept `programId` but don’t use it (ok, but can remove if unused).
