# EXECUTION PLAN — tcrei blog

> **Guideline:** Check this file first to see the current task before looking into other docs.


## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project
- **Status:** `[x]`
- **Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Actions:** `pnpm create next-app@latest`, install all dependencies per `docs/SPEC.md` tech stack, install Geist font
- **Acceptance:** `pnpm build` passes
- **Commit:** `feat: scaffold Next.js 16 project with dependencies`

### Task 2: Configure Design Tokens + Tailwind
- **Status:** `[x]`
- **Files:** `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
- **Actions:** Copy CSS variables and Tailwind config from `docs/DESIGN_TOKENS.md`. Configure Geist font in layout. Create test page to verify tokens.
- **Acceptance:** `pnpm build` passes, token classes (`bg-background`, `text-muted-foreground`, `tracking-label`, `max-w-reading`) resolve correctly
- **Commit:** `feat: configure design tokens, Tailwind, and Geist fonts`

### Task 3: Initialize Shadcn/ui
- **Status:** `[x]`
- **Files:** `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- **Actions:** `pnpm dlx shadcn@latest init`, add button/input/textarea/label/separator. Verify globals.css not overwritten.
- **Acceptance:** Button renders with sharp corners (`--radius: 0rem`)
- **Commit:** `feat: initialize Shadcn/ui with base components`

### Task 4: Supabase Schema + RLS
- **Status:** `[x]`
- **Files:** `supabase/migrations/00001_initial_schema.sql`
- **Actions:** SQL already written — apply to Supabase via dashboard SQL editor or `supabase db push`. Verify per `docs/SCHEMA.md`.
- **Acceptance:** All 4 tables created, RLS policies active, trigger creates profile on signup
- **Commit:** `feat: add Supabase schema, RLS policies, and triggers`

### Task 5: Supabase Client Helpers
- **Status:** `[x]`
- **Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `.env.local`
- **Actions:** Create server/client/middleware Supabase helpers per `@supabase/ssr` docs. Create root middleware that protects `/write`, `/edit`, `/settings`.
- **Acceptance:** `pnpm build` passes, protected routes redirect to `/login`
- **Commit:** `feat: add Supabase client helpers and auth middleware`

#### Phase 1 Notes

> **Scaffolding:** `create-next-app` refuses non-whitelisted files in target dir. Use a temp directory and `cp -r` when the project already has files. Always use `--no-git` in an existing repo.

> **Shadcn v4:** Defaults to `base-nova` style (`@base-ui/react`). For Radix UI, use `--base radix`. Every `shadcn init` overwrites `globals.css` — restore HSL tokens afterward. Remove `@import "tw-animate-css"` and `@import "shadcn/tailwind.css"` (incompatible with Tailwind v3).

> **Sharp corners:** `--radius: 0rem` alone is insufficient — Shadcn components use hardcoded `rounded-lg`. Map all `borderRadius` values in `tailwind.config.ts` to CSS variables (`var(--radius-lg)`, etc.) set to `0rem`.

> **Full issue log:** `docs/issues/Issues_Phase_1.md`

---

## Phase 2: Auth

### Task 6: Login Page + OAuth
- **Status:** `[x]`
- **Files:** `src/app/login/page.tsx`, `src/app/login/login-form.tsx`, `src/app/auth/callback/route.ts`
- **Actions:** Server component checks if logged in (redirects to `/`). Client form with Google + GitHub buttons via `supabase.auth.signInWithOAuth`. Callback route exchanges code for session.
- **Acceptance:** OAuth flow completes, profile auto-created, user redirected
- **Commit:** `feat: add login page with Google/GitHub OAuth and callback`

#### Phase 2 Notes

> **Next.js 16 searchParams:** In Next.js 15+, `searchParams` and `params` in Server Components are Promises. Always type as `Promise<{...}>` and await before reading.

> **CCG + Codex for code writing:** Codex's TDD skill will stop to ask about tests if Playwright isn't configured. Be explicit: "write implementation only, no tests" when Playwright is not yet set up (added in Task 18).

> **web-design-guidelines workflow:** Complete in one pass — fetch URL, read files, output `file:line` findings. The persistent-mode stop hook fires until all three steps are done in the same response.

> **Full issue log:** `docs/issues/Issues_Phase_2.md`

---

## Phase 3: Shared Components

### Task 7: Layout Shell — Header, Nav, Dark Mode
- **Status:** `[x]`
- **Files:** `src/components/site-header.tsx`, `src/components/theme-toggle.tsx`, `src/components/theme-provider.tsx`, `src/components/user-nav.tsx`, `src/app/layout.tsx`
- **Dependencies:** Install `next-themes`
- **Actions:** ThemeProvider wrapping app, header with logo + Tags link + UserNav + ThemeToggle. UserNav shows avatar/write link when logged in, "Sign in" when not.
- **Acceptance:** Header renders, dark mode toggles, nav shows auth state
- **Commit:** `feat: add site header, dark mode toggle, and user nav`

### Task 8: PostCard, MetaLabel, TagPill
- **Status:** `[x]`
- **Files:** `src/components/post-card.tsx`, `src/components/meta-label.tsx`, `src/components/tag-pill.tsx`
- **Actions:** Build per component usage patterns in `docs/DESIGN_TOKENS.md`. PostCard: hairline border-top, tags + date row, title, excerpt, optional author handle. MetaLabel: uppercase tracking-label text-muted-foreground. TagPill: border pill linking to `/tags/[name]`.
- **Acceptance:** Components render with correct token classes
- **Commit:** `feat: add PostCard, MetaLabel, and TagPill components`

#### Phase 3 Notes

> **ThemeToggle pattern:** Use dual-icon CSS animation (`scale-0/scale-100` + `rotate` Tailwind transitions for Sun/Moon) instead of a `mounted` state check. Both icons stay in the DOM; Tailwind `dark:` variants control visibility. No hydration flash, no state needed.

> **next-themes toggle:** Use `resolvedTheme` (not `theme`) for toggle condition. `theme` returns `"system"` when using system preference — `resolvedTheme` returns the actual applied value (`"light"` or `"dark"`).

> **TagPill URLs:** Always `encodeURIComponent(tag)` in the href. Tag values are user-generated and may contain spaces or special characters.

> **CCG flow with slow Codex:** Codex scans the actual codebase before responding (~5–6 min). When spec is clear and Gemini has reviewed, implement in parallel rather than blocking. Use Codex output as a post-hoc validator — it catches fine-grained details (encoding, resolvedTheme) worth reviewing even after files are written.

> **Full issue log:** `docs/issues/Issues_Phase_3.md`

---

## Phase 4: Public Pages

### Task 9: Homepage `/`
- **Status:** `[x]`
- **Files:** `src/app/page.tsx`, `src/lib/queries.ts`
- **Actions:** Create shared queries module. Homepage fetches recent posts with author + tags, renders PostCards, adds pagination.
- **Acceptance:** Posts display in reverse chronological order, pagination works
- **Commit:** `feat: add homepage with recent posts and pagination`

### Task 10: Author Page `/@[username]`
- **Status:** `[x]`
- **Files:** `next.config.ts`, `src/app/user/[username]/page.tsx`
- **Actions:** Add Next.js rewrites (`/@:username` → `/user/:username`). Create author page with profile header + post list.
- **Acceptance:** `/@username` URL resolves, shows author profile + their posts
- **Commit:** `feat: add author page with profile header and post list`

### Task 11: Post Detail `/@[username]/[slug]`
- **Status:** `[x]`
- **Files:** `src/app/user/[username]/[slug]/page.tsx`, `src/components/markdown-renderer.tsx`
- **Actions:** Create markdown renderer with react-markdown + remark-gfm + rehype-highlight + rehype-sanitize. Build 2-column layout (sidebar metadata + main prose). Add reading time estimate.
- **Acceptance:** Markdown renders with syntax highlighting, 2-col layout on lg+, collapses on mobile
- **Commit:** `feat: add post detail page with 2-column layout and markdown rendering`

### Task 12: Tags Pages
- **Status:** `[x]`
- **Files:** `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`
- **Actions:** Tag index shows all tags with post counts. Tag filter page shows posts for that tag using PostCard.
- **Acceptance:** `/tags` lists all tags, `/tags/[name]` shows filtered posts
- **Commit:** `feat: add tag index and tag filter pages`

#### Phase 4 Notes

> **Supabase join type mismatch:** Supabase infers `profiles` (many-to-one join) as an array in TypeScript even though it returns a single object at runtime. Define `RawPostRow` with `profiles` typed as `object | Array<object> | null` and a `normalizePost()` function to normalize both shapes. Never use `as unknown as Post[]` — the linter removes `unknown`.

> **Supabase `.in()` requires an array:** `.in('id', queryBuilder)` fails — `.in()` does not accept a Supabase query builder. Use a two-query pattern: first fetch IDs as `string[]`, then pass the array to `.in()`.

> **Supabase PGRST116:** Error code `"PGRST116"` means no rows found (`.single()` with no match). Use a named constant + `isNoRowsError()` helper to distinguish from real errors and avoid throwing on 404s.

> **`!inner` join for filtering:** To filter posts by tag, use `from('post_tags').select('post_id, tags!inner(name)').eq('tags.name', tagName)` — `!inner` makes the join required, which enables the `.eq()` filter on the related table.

> **MetaLabel `as` prop:** The linter always strips the `as` prop from MetaLabel. For block-level or semantic headings, wrap with a native element: `<h1 className="mb-8"><MetaLabel>...</MetaLabel></h1>`.

> **`next/image` for OAuth avatars:** Use `<Image unoptimized>` for OAuth avatar URLs — no domain whitelist config needed, and linter replaces `<img>` with `<Image>` automatically.

> **Website URL safety:** Always guard external links: `href={url.startsWith('http') ? url : 'https://' + url}`. Without this, bare `example.com` values produce broken relative links.

> **`sr-only` h1 on headingless pages:** Pages without a visible primary heading (homepage, tags index) need `<h1 className="sr-only">...</h1>` for accessibility and heading hierarchy.

> **Full issue log:** `docs/issues/Issues_Phase_4.md`

---

## Phase 5: Protected Pages

### Task 13: Write Page `/write`
- **Status:** `[x]`
- **Files:** `src/app/write/page.tsx`, `src/components/post-editor.tsx`, `src/components/tag-input.tsx`, `src/lib/actions.ts`
- **Actions:** Create Server Actions for createPost (slug generation, excerpt auto-generation, tag upsert). Build PostEditor client component with EasyMDE (dynamic import, no SSR). Build TagInput with autocomplete. Wire write page.
- **Acceptance:** Can create a post with title, content, tags. Post appears on homepage and author page. Tags created if new.
- **Commit:** `feat: add write page with markdown editor, tag input, and server actions`

### Task 14: Edit Page `/edit/[id]`
- **Status:** `[x]`
- **Files:** `src/app/edit/[id]/page.tsx`
- **Actions:** Load existing post (verify ownership), reuse PostEditor with initial values. Add updatePost and deletePost server actions.
- **Acceptance:** Can edit title/content/tags, can delete post. RLS prevents editing others' posts.
- **Commit:** `feat: add edit page with update and delete actions`

### Task 15: Settings Page `/settings`
- **Status:** `[x]`
- **Files:** `src/app/settings/page.tsx`, `src/app/settings/settings-form.tsx`
- **Actions:** Server component loads profile, client form for editing. Add updateProfile server action. Show connected OAuth provider (read-only).
- **Acceptance:** Can update username, display name, bio, website. Username uniqueness enforced.
- **Commit:** `feat: add settings page with profile form`

#### Phase 5 Notes

> **EasyMDE SSR guard:** Don't wrap a `"use client"` component in `dynamic({ ssr: false })` from a Server Component — build will fail. If the component guards browser-only code in `useEffect`, a direct import is sufficient.

> **Supabase nested join casts:** Always use `as unknown as TargetType` when casting nested join results (e.g. `post_tags(tags(name))`). Direct `as TargetType` fails TypeScript's overlap check.

> **Write page username guard:** Redirect to `/settings` on `/write` if the user has no username. The `createPost` action needs a username for the redirect URL — publishing without one breaks the flow.

> **EasyMDE dark mode:** Override `.CodeMirror`, `.editor-toolbar`, `.editor-preview`, and `.editor-preview-side` in `globals.css` using `hsl(var(--background))` etc. EasyMDE injects hardcoded light-theme styles that ignore Tailwind's dark mode.

> **CCG role assignment:** Claude is command center only — Codex writes all implementation code. If Codex fails, ask the user; do not self-implement. `execute-next-phase` skill and memory updated.

> **Full issue log:** `docs/issues/Issues_Phase_5.md`

---

## Phase 6: Polish

### Task 16: Mobile Responsive Nav
- **Status:** `[x]`
- **Files:** `src/components/mobile-nav.tsx`, `src/components/site-header.tsx`
- **Actions:** Hamburger menu on mobile (`md:hidden`), full nav on desktop (`hidden md:flex`).
- **Acceptance:** Nav collapses to hamburger on mobile, all links accessible
- **Commit:** `feat: add responsive mobile navigation`

### Task 17: SEO Metadata
- **Status:** `[x]`
- **Files:** `src/app/user/[username]/page.tsx`, `src/app/user/[username]/[slug]/page.tsx`, `src/app/layout.tsx`
- **Actions:** Add `generateMetadata` to post detail and author pages. Include OpenGraph tags.
- **Acceptance:** Page titles and descriptions correct, OG tags present
- **Commit:** `feat: add SEO metadata to post and author pages`

### Task 18: E2E Tests
- **Status:** `[x]`
- **Files:** `playwright.config.ts`, `tests/e2e-critical-flows.spec.ts`
- **Actions:** Configure Playwright. Test: homepage loads, tags page loads, login page loads, protected routes redirect.
- **Acceptance:** `pnpm test:e2e` passes
- **Commit:** `feat: add Playwright E2E tests for critical flows`

### Task 19: Finalize CLAUDE.md
- **Status:** `[x]`
- **Files:** `CLAUDE.md`
- **Actions:** Update with actual build commands, verified key paths, and architecture summary.
- **Acceptance:** New Claude Code session can orient using CLAUDE.md alone
- **Commit:** `docs: finalize CLAUDE.md with project context`

#### Phase 6 Notes

> **Codex brainstorming gate:** If the prompt leaves behavioral decisions open (e.g. "where does the avatar link?"), Codex stops to ask. State every UX decision explicitly and add "no clarifying questions" to suppress the gate.

> **Mobile nav focus trap:** Close-on-Escape alone is insufficient for accessibility. A proper focus trap needs Tab/Shift-Tab cycling within the panel using a focusable-element query. The linter can fill this gap, but plan for it explicitly in the Codex prompt.

> **CSS transitions:** Use `transition-[transform,opacity]` instead of `transition-all` for animated overlays. `transition-all` triggers layout recalculations for every property.

> **Linter race on concurrent edits:** After Gemini post-code review, the linter may apply changes faster than a manual edit. Always re-read a file before editing. If the linter's version is more complete, keep it.

> **`transition-all` performance:** Codex defaults to `transition-all` on overlays. Always scope transitions to the specific animated properties (`transform`, `opacity`).

> **Full issue log:** `docs/issues/Issues_Phase_6.md`
