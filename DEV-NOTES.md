# DEV NOTES (concise)

## Quick audit (2026-02-03)
- **Fixed**: hardcoded `teacherId` in health-forms page/actions → now uses `requireAuth()`.
- **Fixed**: direct `new PrismaClient()` in health-forms page/actions → now uses shared `prisma` singleton.
- **Fixed**: invalid `params: Promise<{id}>` type in health-forms page.

## Remaining checks
- Run `npx tsc --noEmit` and `npm run build` to surface any other errors.
- Review i18n coverage (strings for health-forms already present).

## Notes
- Health-forms components accept `programId` but don’t use it (ok, but can remove if unused).
