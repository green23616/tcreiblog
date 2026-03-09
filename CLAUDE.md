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
- **Canonical SQL**: `supabase/migrations/00001_initial_schema.sql`

**Guideline**: Always check `docs/SPEC.md` and `docs/EXECUTION_PLAN.md` first to see the current task before looking into other docs.

## Build Commands

```bash
pnpm install          # install dependencies
pnpm dev              # dev server (Turbopack)
pnpm build            # production build
pnpm test:e2e         # Playwright E2E tests
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
| `src/lib/queries.ts` | Shared DB queries |
| `src/lib/actions.ts` | Server Actions (CRUD) |
| `src/components/` | Shared components |
| `src/app/globals.css` | CSS variables (design tokens) |
| `tailwind.config.ts` | Tailwind configuration |
