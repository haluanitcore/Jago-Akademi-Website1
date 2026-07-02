# Dependency Compatibility Matrix

> Tracks the bleeding-edge stack and critical dependencies pinned to **exact** versions (TASK-003). Fresh `npm install` must be reproducible and match `npm ci` against the committed lockfile. See [ADR-0001](./adr/0001-frontend-stack.md).
> Last verified: 2 Juli 2026 — build + typecheck + 256 tests green on these versions.

## Critical Pinned Versions

| Package | Pinned | Scope | Notes |
|---------|--------|-------|-------|
| next | 16.2.0 | web | App Router + RSC. Bleeding-edge (RISK-T1). |
| react | 19.2.7 | web | Ref-as-prop, `use()`, form actions available. |
| react-dom | 19.2.7 | web | Must match react exactly. |
| @types/react | 19.2.2 | web | Must track react major. |
| @types/react-dom | 19.2.2 | web | Must track react-dom major. |
| framer-motion | 12.40.0 | web | Verified working with React 19. |
| @prisma/client | 5.22.0 | api | Must match `prisma` CLI exactly. |
| prisma | 5.22.0 | api | Migration engine; keep in lockstep with client. |
| express | 4.22.2 | api | Stable 4.x line. |
| zod | 3.25.76 | api/web | Validation at boundaries (§9.5). |
| typescript | 5.9.2 | all | Repo-wide, already exact. |
| vitest | 4.1.9 | api | Test runner + v8 coverage. |

## Compatibility Notes (React 19 / Next 16)

| Library | Status | Evidence |
|---------|--------|----------|
| @radix-ui/* (accordion, dialog, dropdown, navigation-menu, slot) | ✅ Works | web build + typecheck green |
| framer-motion 12 | ✅ Works | build green; used in home/animation |
| @playwright/test 1.61 | ✅ Works | E2E specs compile |
| lucide-react | ✅ Works | icons render in build |
| tailwindcss 4 + @tailwindcss/postcss | ✅ Works | build green |

## Upgrade Policy

- **No passive `^` bumps** on the critical list — versions are exact. Bump deliberately in a dedicated PR with full validation (§9.11) and `npm audit`.
- When bumping react, bump react-dom + @types/react + @types/react-dom **together** to the same major/minor.
- When bumping prisma, bump @prisma/client to the **same** version and run `prisma generate`.
- Record any compat regression here + open a BACKLOG item.

## Fallback

If a hard React 19 / Next 16 blocker appears, follow the fallback in [ADR-0001](./adr/0001-frontend-stack.md) (Next 15 / React 18 LTS).
