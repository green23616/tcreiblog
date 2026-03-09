# EXECUTION PLAN — tcrei blog

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Table of Contents

- [Status Legend](#status-legend)
- [Phase 1: Foundation](#phase-1-foundation) — Tasks 1–5
- [Phase 2: Auth](#phase-2-auth) — Task 6
- [Phase 3: Shared Components](#phase-3-shared-components) — Tasks 7–8
- [Phase 4: Public Pages](#phase-4-public-pages) — Tasks 9–12
- [Phase 5: Protected Pages](#phase-5-protected-pages) — Tasks 13–15
- [Phase 6: Polish](#phase-6-polish) — Tasks 16–19

---

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project
- **Status:** `[ ]`
- **Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Actions:** `pnpm create next-app@latest`, install all dependencies per `docs/SPEC.md` tech stack, install Geist font
- **Acceptance:** `pnpm build` passes
- **Commit:** `feat: scaffold Next.js 16 project with dependencies`

### Task 2: Configure Design Tokens + Tailwind
- **Status:** `[ ]`
- **Files:** `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
- **Actions:** Copy CSS variables and Tailwind config from `docs/DESIGN_TOKENS.md`. Configure Geist font in layout. Create test page to verify tokens.
- **Acceptance:** `pnpm build` passes, token classes (`bg-background`, `text-muted-foreground`, `tracking-label`, `max-w-reading`) resolve correctly
- **Commit:** `feat: configure design tokens, Tailwind, and Geist fonts`

### Task 3: Initialize Shadcn/ui
- **Status:** `[ ]`
- **Files:** `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- **Actions:** `pnpm dlx shadcn@latest init`, add button/input/textarea/label/separator. Verify globals.css not overwritten.
- **Acceptance:** Button renders with sharp corners (`--radius: 0rem`)
- **Commit:** `feat: initialize Shadcn/ui with base components`

### Task 4: Supabase Schema + RLS
- **Status:** `[ ]`
- **Files:** `supabase/migrations/00001_initial_schema.sql`
- **Actions:** SQL already written — apply to Supabase via dashboard SQL editor or `supabase db push`. Verify per `docs/SCHEMA.md`.
- **Acceptance:** All 4 tables created, RLS policies active, trigger creates profile on signup
- **Commit:** `feat: add Supabase schema, RLS policies, and triggers`

### Task 5: Supabase Client Helpers
- **Status:** `[ ]`
- **Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `.env.local`
- **Actions:** Create server/client/middleware Supabase helpers per `@supabase/ssr` docs. Create root middleware that protects `/write`, `/edit`, `/settings`.
- **Acceptance:** `pnpm build` passes, protected routes redirect to `/login`
- **Commit:** `feat: add Supabase client helpers and auth middleware`

---

## Phase 2: Auth

### Task 6: Login Page + OAuth
- **Status:** `[ ]`
- **Files:** `src/app/login/page.tsx`, `src/app/login/login-form.tsx`, `src/app/auth/callback/route.ts`
- **Actions:** Server component checks if logged in (redirects to `/`). Client form with Google + GitHub buttons via `supabase.auth.signInWithOAuth`. Callback route exchanges code for session.
- **Acceptance:** OAuth flow completes, profile auto-created, user redirected
- **Commit:** `feat: add login page with Google/GitHub OAuth and callback`

---

## Phase 3: Shared Components

### Task 7: Layout Shell — Header, Nav, Dark Mode
- **Status:** `[ ]`
- **Files:** `src/components/site-header.tsx`, `src/components/theme-toggle.tsx`, `src/components/theme-provider.tsx`, `src/components/user-nav.tsx`, `src/app/layout.tsx`
- **Dependencies:** Install `next-themes`
- **Actions:** ThemeProvider wrapping app, header with logo + Tags link + UserNav + ThemeToggle. UserNav shows avatar/write link when logged in, "Sign in" when not.
- **Acceptance:** Header renders, dark mode toggles, nav shows auth state
- **Commit:** `feat: add site header, dark mode toggle, and user nav`

### Task 8: PostCard, MetaLabel, TagPill
- **Status:** `[ ]`
- **Files:** `src/components/post-card.tsx`, `src/components/meta-label.tsx`, `src/components/tag-pill.tsx`
- **Actions:** Build per component usage patterns in `docs/DESIGN_TOKENS.md`. PostCard: hairline border-top, tags + date row, title, excerpt, optional author handle. MetaLabel: uppercase tracking-label text-muted-foreground. TagPill: border pill linking to `/tags/[name]`.
- **Acceptance:** Components render with correct token classes
- **Commit:** `feat: add PostCard, MetaLabel, and TagPill components`

---

## Phase 4: Public Pages

### Task 9: Homepage `/`
- **Status:** `[ ]`
- **Files:** `src/app/page.tsx`, `src/lib/queries.ts`
- **Actions:** Create shared queries module. Homepage fetches recent posts with author + tags, renders PostCards, adds pagination.
- **Acceptance:** Posts display in reverse chronological order, pagination works
- **Commit:** `feat: add homepage with recent posts and pagination`

### Task 10: Author Page `/@[username]`
- **Status:** `[ ]`
- **Files:** `next.config.ts`, `src/app/user/[username]/page.tsx`
- **Actions:** Add Next.js rewrites (`/@:username` → `/user/:username`). Create author page with profile header + post list.
- **Acceptance:** `/@username` URL resolves, shows author profile + their posts
- **Commit:** `feat: add author page with profile header and post list`

### Task 11: Post Detail `/@[username]/[slug]`
- **Status:** `[ ]`
- **Files:** `src/app/user/[username]/[slug]/page.tsx`, `src/components/markdown-renderer.tsx`
- **Actions:** Create markdown renderer with react-markdown + remark-gfm + rehype-highlight + rehype-sanitize. Build 2-column layout (sidebar metadata + main prose). Add reading time estimate.
- **Acceptance:** Markdown renders with syntax highlighting, 2-col layout on lg+, collapses on mobile
- **Commit:** `feat: add post detail page with 2-column layout and markdown rendering`

### Task 12: Tags Pages
- **Status:** `[ ]`
- **Files:** `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`
- **Actions:** Tag index shows all tags with post counts. Tag filter page shows posts for that tag using PostCard.
- **Acceptance:** `/tags` lists all tags, `/tags/[name]` shows filtered posts
- **Commit:** `feat: add tag index and tag filter pages`

---

## Phase 5: Protected Pages

### Task 13: Write Page `/write`
- **Status:** `[ ]`
- **Files:** `src/app/write/page.tsx`, `src/components/post-editor.tsx`, `src/components/tag-input.tsx`, `src/lib/actions.ts`
- **Actions:** Create Server Actions for createPost (slug generation, excerpt auto-generation, tag upsert). Build PostEditor client component with EasyMDE (dynamic import, no SSR). Build TagInput with autocomplete. Wire write page.
- **Acceptance:** Can create a post with title, content, tags. Post appears on homepage and author page. Tags created if new.
- **Commit:** `feat: add write page with markdown editor, tag input, and server actions`

### Task 14: Edit Page `/edit/[id]`
- **Status:** `[ ]`
- **Files:** `src/app/edit/[id]/page.tsx`
- **Actions:** Load existing post (verify ownership), reuse PostEditor with initial values. Add updatePost and deletePost server actions.
- **Acceptance:** Can edit title/content/tags, can delete post. RLS prevents editing others' posts.
- **Commit:** `feat: add edit page with update and delete actions`

### Task 15: Settings Page `/settings`
- **Status:** `[ ]`
- **Files:** `src/app/settings/page.tsx`, `src/app/settings/settings-form.tsx`
- **Actions:** Server component loads profile, client form for editing. Add updateProfile server action. Show connected OAuth provider (read-only).
- **Acceptance:** Can update username, display name, bio, website. Username uniqueness enforced.
- **Commit:** `feat: add settings page with profile form`

---

## Phase 6: Polish

### Task 16: Mobile Responsive Nav
- **Status:** `[ ]`
- **Files:** `src/components/mobile-nav.tsx`, `src/components/site-header.tsx`
- **Actions:** Hamburger menu on mobile (`md:hidden`), full nav on desktop (`hidden md:flex`).
- **Acceptance:** Nav collapses to hamburger on mobile, all links accessible
- **Commit:** `feat: add responsive mobile navigation`

### Task 17: SEO Metadata
- **Status:** `[ ]`
- **Files:** `src/app/user/[username]/page.tsx`, `src/app/user/[username]/[slug]/page.tsx`, `src/app/layout.tsx`
- **Actions:** Add `generateMetadata` to post detail and author pages. Include OpenGraph tags.
- **Acceptance:** Page titles and descriptions correct, OG tags present
- **Commit:** `feat: add SEO metadata to post and author pages`

### Task 18: E2E Tests
- **Status:** `[ ]`
- **Files:** `playwright.config.ts`, `tests/e2e-critical-flows.spec.ts`
- **Actions:** Configure Playwright. Test: homepage loads, tags page loads, login page loads, protected routes redirect.
- **Acceptance:** `pnpm test:e2e` passes
- **Commit:** `feat: add Playwright E2E tests for critical flows`

### Task 19: Finalize CLAUDE.md
- **Status:** `[ ]`
- **Files:** `CLAUDE.md`
- **Actions:** Update with actual build commands, verified key paths, and architecture summary.
- **Acceptance:** New Claude Code session can orient using CLAUDE.md alone
- **Commit:** `docs: finalize CLAUDE.md with project context`
