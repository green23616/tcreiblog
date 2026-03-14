# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

tcrei blog — a developer blog platform for ~10 authors. Next.js 16 App Router + Supabase + Tailwind CSS + Shadcn/ui.

## Documentation Map

- **What we are building**: `docs/PRD.md`
- **How it's structured**: `docs/SPEC.md` (tech stack, routes, page layouts, architecture decisions)
- **Data blueprint**: `docs/SCHEMA.md` (tables, RLS policies, triggers)
- **Design system**: `docs/DESIGN_TOKENS.md` (CSS variables, Tailwind config, component usage)
- **Current progress**: `docs/EXECUTION_PLAN.md` (task list with status checkboxes)
- **Canonical SQL**: `supabase/migrations/*`

**Guideline**: Always check `docs/SPEC.md` and `docs/EXECUTION_PLAN.md` first to see the current task before starting a task.

## Build Commands

```bash
pnpm install          # install dependencies
pnpm dev              # dev server
pnpm build            # production build
pnpm lint             # run ESLint
pnpm test:e2e         # Playwright E2E tests
pnpm test:e2e:ui      # Playwright UI mode
```

## Key Architecture Rules

- Server Components by default. Client Components only for: markdown editor, dark mode toggle, mobile nav, tag autocomplete.
- No API routes. Use Server Actions for mutations.
- Supabase RLS is the auth layer for data access. Middleware only protects route access (`/write`, `/edit`, `/settings`).
- `@username` URLs use Next.js rewrites: `/@:username` -> `/user/:username`.
- Use Shadcn semantic classes (`bg-background`, `text-muted-foreground`, `border-border`). Never use raw hex codes or `zinc-*` palette names.
- `--radius: 0rem` for sharp corners globally. `rounded-full` is preserved for pills/avatars.

## Key Paths

| Path | Purpose |
|------|---------|
| `src/lib/supabase/server.ts` | Supabase server client |
| `src/lib/supabase/client.ts` | Supabase browser client |
| `src/lib/supabase/middleware.ts` | Session refresh helper |
| `src/middleware.ts` | Route protection |
| `src/lib/queries.ts` | Shared read queries for posts, profiles, and tags |
| `src/lib/actions.ts` | Server Actions for posts and profile mutations |
| `src/components/` | Shared components |
| `src/components/mobile-nav.tsx` | Mobile nav overlay for signed-in and signed-out states |
| `src/components/site-header.tsx` | Sticky header shell with desktop and mobile nav variants |
| `src/components/user-nav.tsx` | Desktop auth-aware nav fragment |
| `src/app/globals.css` | CSS variables (design tokens) |
| `tailwind.config.ts` | Tailwind configuration |
| `playwright.config.ts` | Playwright runner configuration |
| `tests/e2e-critical-flows.spec.ts` | Critical-path browser smoke tests |

## Architecture Learnings

- Next.js 16: `params` and `searchParams` are `Promise<{...}>` in App Router server entries. Always await them before reading fields.
- Supabase nested join casts need `as unknown as TargetType` when TypeScript overlap checks reject the direct cast.
- EasyMDE: do not use `dynamic({ ssr: false })` in Server Components. Import the client component normally and guard browser-only setup in `useEffect`.
- Supabase join types: profile joins often type as arrays even when the runtime response is singular. Normalize them through the existing `normalizePost()` pattern.
- Sharp corners: `--radius: 0rem` is global, and every Tailwind border radius token in `tailwind.config.ts` should map back to those CSS variables so components stay square by default.
