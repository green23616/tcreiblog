# tcrei Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full `tcrei blog` application from the current partial scaffold to a working Supabase-backed blog with auth, public reading pages, authoring flows, and baseline E2E coverage.

**Architecture:** Treat `docs/PRD.md`, `docs/SPEC.md`, `docs/SCHEMA.md`, and `docs/DESIGN_TOKENS.md` as canonical product docs, but do not trust `docs/EXECUTION_PLAN.md` status markers because the repository already contains some Phase 1 work. Build on the existing Next.js 16 scaffold, keep public pages as Server Components, isolate client code to auth UI, theme controls, markdown editing, and tag autocomplete, and use `@supabase/ssr` middleware plus RLS-backed Server Actions for authenticated mutations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3.4, Shadcn/ui, Supabase SSR/Auth/Postgres, Zod, EasyMDE, React Markdown, Playwright

---

### Task 1: Reconcile the current baseline and lock toolchain commands

**Files:**
- Modify: `package.json`
- Modify: `CLAUDE.md`
- Modify: `docs/EXECUTION_PLAN.md`
- Create: `playwright.config.ts`
- Create: `tests/smoke-homepage.spec.ts`

**Step 1: Write the failing test**

Create `tests/smoke-homepage.spec.ts` that loads `/` and asserts the page shows the `tcrei blog` heading from the current homepage shell.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/smoke-homepage.spec.ts`
Expected: FAIL because Playwright config and `test:e2e` wiring are not committed yet.

**Step 3: Write minimal implementation**

Add:
- `playwright.config.ts` with `testDir: "./tests"` and a `webServer` using `pnpm dev`
- `package.json` scripts: `test:e2e`, `test:e2e:ui`, `typecheck`
- `CLAUDE.md` command list updates
- `docs/EXECUTION_PLAN.md` notes that scaffold, tokens, shadcn setup, and SQL migration already exist in the repo

Do not broaden the scope beyond making the current baseline verifiable.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/smoke-homepage.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Smoke test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add package.json CLAUDE.md docs/EXECUTION_PLAN.md playwright.config.ts tests/smoke-homepage.spec.ts
git commit -m "chore: reconcile project baseline and test commands"
```

### Task 2: Implement Supabase SSR helpers and protected-route middleware

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `tests/auth-redirect.spec.ts`

**Step 1: Write the failing test**

Create `tests/auth-redirect.spec.ts` that requests `/write` without a session and asserts a redirect to `/login?redirect=%2Fwrite`.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/auth-redirect.spec.ts`
Expected: FAIL because no middleware exists to protect `/write`.

**Step 3: Write minimal implementation**

Implement:
- browser client with `createBrowserClient`
- server client with `createServerClient` and `next/headers` cookies
- middleware session refresher that uses request and response cookies together
- root middleware that protects `/write`, `/edit/:path*`, and `/settings`, preserving the original destination in `redirect`

Use `getUser()` in middleware for authorization decisions, not `getSession()`.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/auth-redirect.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Redirect test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/lib/supabase/server.ts src/lib/supabase/client.ts src/lib/supabase/middleware.ts src/middleware.ts tests/auth-redirect.spec.ts
git commit -m "feat: add supabase ssr helpers and auth middleware"
```

### Task 3: Build the login page and OAuth callback flow

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/login-form.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `tests/login-page.spec.ts`

**Step 1: Write the failing test**

Create `tests/login-page.spec.ts` that:
- loads `/login`
- asserts Google and GitHub sign-in buttons are visible
- verifies an already authenticated user is redirected away from `/login`

Stub the authenticated case with a deterministic cookie/session setup if needed.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/login-page.spec.ts`
Expected: FAIL because `/login` and `/auth/callback` do not exist.

**Step 3: Write minimal implementation**

Implement:
- server-rendered `/login` page
- client login form using `supabase.auth.signInWithOAuth`
- callback route that exchanges the code for a session and redirects to the `redirect` param or `/`

Keep the login UI minimal and aligned to the monochrome design system.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/login-page.spec.ts`
- `pnpm exec playwright test tests/auth-redirect.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Login test passes
- Redirect test still passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/login/login-form.tsx src/app/auth/callback/route.ts tests/login-page.spec.ts
git commit -m "feat: add login page and oauth callback"
```

### Task 4: Add the shared layout shell, theme provider, and authenticated nav

**Files:**
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/theme-toggle.tsx`
- Create: `src/components/site-header.tsx`
- Create: `src/components/user-nav.tsx`
- Modify: `src/app/layout.tsx`
- Create: `tests/layout-shell.spec.ts`

**Step 1: Write the failing test**

Create `tests/layout-shell.spec.ts` that asserts:
- the global header renders on `/`
- the Tags link exists
- the theme toggle exists
- unauthenticated state shows a sign-in entry

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/layout-shell.spec.ts`
Expected: FAIL because the shared shell is not implemented.

**Step 3: Write minimal implementation**

Implement the app shell using:
- `next-themes` provider
- header with site title and tags navigation
- user nav that shows sign-in when logged out and account/write links when logged in

Do not implement mobile nav yet. Keep desktop structure in place first.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/layout-shell.spec.ts`
- `pnpm exec playwright test tests/login-page.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Layout shell test passes
- Existing auth test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/components/theme-provider.tsx src/components/theme-toggle.tsx src/components/site-header.tsx src/components/user-nav.tsx src/app/layout.tsx tests/layout-shell.spec.ts
git commit -m "feat: add site shell and theme controls"
```

### Task 5: Build reusable presentation components for posts and metadata

**Files:**
- Create: `src/components/meta-label.tsx`
- Create: `src/components/tag-pill.tsx`
- Create: `src/components/post-card.tsx`
- Create: `tests/post-card.spec.ts`

**Step 1: Write the failing test**

Create `tests/post-card.spec.ts` against a minimal fixture page or route that renders the component contract:
- title
- excerpt
- tags
- published date
- optional author handle

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/post-card.spec.ts`
Expected: FAIL because the components and fixture route do not exist.

**Step 3: Write minimal implementation**

Implement the three shared components exactly as described in `docs/DESIGN_TOKENS.md` and `docs/SPEC.md`:
- metadata labels use uppercase tracked mono-style treatment
- tag pills link to `/tags/[name]`
- post cards render border-top separation and optional author handle

If needed, create a temporary private fixture route under `src/app/dev/post-card/page.tsx` and remove it once real pages consume the component.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/post-card.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Post card test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/components/meta-label.tsx src/components/tag-pill.tsx src/components/post-card.tsx tests/post-card.spec.ts
git commit -m "feat: add reusable post presentation components"
```

### Task 6: Implement the shared read-query layer and homepage

**Files:**
- Create: `src/lib/queries.ts`
- Modify: `src/app/page.tsx`
- Create: `tests/homepage-empty-and-list.spec.ts`

**Step 1: Write the failing test**

Create `tests/homepage-empty-and-list.spec.ts` that covers:
- empty state when no posts exist
- ordered post list rendering when fixture data exists
- presence of pagination controls when the query returns more than one page

Start with the empty-state path if fixture data setup is not ready.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/homepage-empty-and-list.spec.ts`
Expected: FAIL because the homepage still renders only a placeholder heading.

**Step 3: Write minimal implementation**

Implement `src/lib/queries.ts` for:
- recent posts with author and tags
- optional pagination cursor support

Update the homepage to:
- fetch posts server-side
- render `PostCard`
- show a calm empty state when there are no posts
- reserve pagination UI for when cursors exist

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/homepage-empty-and-list.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Homepage test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/lib/queries.ts src/app/page.tsx tests/homepage-empty-and-list.spec.ts
git commit -m "feat: add homepage data query and rendering"
```

### Task 7: Add author routing, author page, tags index, and tag filter pages

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/user/[username]/page.tsx`
- Create: `src/app/tags/page.tsx`
- Create: `src/app/tags/[tag]/page.tsx`
- Create: `tests/author-and-tags-pages.spec.ts`

**Step 1: Write the failing test**

Create `tests/author-and-tags-pages.spec.ts` that asserts:
- `/@username` rewrites to the author page successfully
- `/tags` renders the tag index
- `/tags/[tag]` renders a filtered post list or empty state

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/author-and-tags-pages.spec.ts`
Expected: FAIL because rewrites and pages do not exist.

**Step 3: Write minimal implementation**

Implement:
- `@username` rewrites in `next.config.ts`
- author page with profile header and post list
- tags index with counts
- tag filter page using the shared post-card layout

Extend `src/lib/queries.ts` only with the exact queries needed for these pages.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/author-and-tags-pages.spec.ts`
- `pnpm exec playwright test tests/homepage-empty-and-list.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Author/tags tests pass
- Homepage test still passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add next.config.ts src/app/user/[username]/page.tsx src/app/tags/page.tsx src/app/tags/[tag]/page.tsx tests/author-and-tags-pages.spec.ts
git commit -m "feat: add author and tag browsing pages"
```

### Task 8: Build markdown rendering and the post detail page

**Files:**
- Create: `src/components/markdown-renderer.tsx`
- Create: `src/app/user/[username]/[slug]/page.tsx`
- Create: `tests/post-detail.spec.ts`

**Step 1: Write the failing test**

Create `tests/post-detail.spec.ts` that asserts:
- the post title and metadata render
- code fences receive syntax-highlighted markup
- sidebar metadata collapses into the main flow on smaller viewports

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/post-detail.spec.ts`
Expected: FAIL because the post detail page and markdown renderer do not exist.

**Step 3: Write minimal implementation**

Implement:
- markdown renderer with `react-markdown`, `remark-gfm`, `rehype-highlight`, `rehype-sanitize`
- post detail page using the sidebar + reading column layout from `docs/SPEC.md`
- reading time estimate derived from content word count

Do not add client-side reading interactions.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/post-detail.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Post detail test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/components/markdown-renderer.tsx src/app/user/[username]/[slug]/page.tsx tests/post-detail.spec.ts
git commit -m "feat: add post detail page and markdown renderer"
```

### Task 9: Implement server actions plus the write and edit flows

**Files:**
- Create: `src/lib/actions.ts`
- Create: `src/components/post-editor.tsx`
- Create: `src/components/tag-input.tsx`
- Create: `src/app/write/page.tsx`
- Create: `src/app/edit/[id]/page.tsx`
- Create: `tests/write-and-edit-flow.spec.ts`

**Step 1: Write the failing test**

Create `tests/write-and-edit-flow.spec.ts` that covers:
- unauthenticated `/write` redirect remains intact
- authenticated author can create a post
- authenticated author can edit and delete their own post

Use a dedicated test account and Supabase test data cleanup strategy before relying on the happy path.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/write-and-edit-flow.spec.ts`
Expected: FAIL because the editor, actions, and protected pages do not exist.

**Step 3: Write minimal implementation**

Implement:
- Server Actions for create, update, delete
- slug creation and collision handling per author
- excerpt generation from markdown
- tag upsert and post-tag synchronization
- `PostEditor` using dynamic import for EasyMDE
- `TagInput` with existing tag suggestions
- write and edit pages with ownership enforcement

Keep server authorization checks inside every action even though RLS exists.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/write-and-edit-flow.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Write/edit flow test passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/lib/actions.ts src/components/post-editor.tsx src/components/tag-input.tsx src/app/write/page.tsx src/app/edit/[id]/page.tsx tests/write-and-edit-flow.spec.ts
git commit -m "feat: add writing and editing flows"
```

### Task 10: Build the settings page and profile update flow

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/settings-form.tsx`
- Modify: `src/lib/actions.ts`
- Create: `tests/settings-page.spec.ts`

**Step 1: Write the failing test**

Create `tests/settings-page.spec.ts` that covers:
- unauthenticated redirect to `/login`
- authenticated profile form render
- successful profile update
- username validation error for an invalid or duplicate username

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/settings-page.spec.ts`
Expected: FAIL because `/settings` and the profile action do not exist.

**Step 3: Write minimal implementation**

Implement:
- server-rendered settings page
- client settings form
- profile update action with Zod validation
- username uniqueness enforcement
- read-only connected-provider display if provider data is available

Keep the form layout aligned to the hairline-border design spec.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test tests/settings-page.spec.ts`
- `pnpm exec playwright test tests/write-and-edit-flow.spec.ts`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Settings test passes
- Write/edit flow still passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/app/settings/page.tsx src/app/settings/settings-form.tsx src/lib/actions.ts tests/settings-page.spec.ts
git commit -m "feat: add settings page and profile updates"
```

### Task 11: Finish responsive nav, metadata, and critical-flow E2E coverage

**Files:**
- Create: `src/components/mobile-nav.tsx`
- Modify: `src/components/site-header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/user/[username]/page.tsx`
- Modify: `src/app/user/[username]/[slug]/page.tsx`
- Create: `tests/e2e-critical-flows.spec.ts`
- Modify: `docs/EXECUTION_PLAN.md`
- Modify: `CLAUDE.md`

**Step 1: Write the failing test**

Create `tests/e2e-critical-flows.spec.ts` that covers the production-critical baseline:
- homepage load
- login page load
- unauthenticated redirect for protected routes
- mobile nav opens on narrow viewport

Add metadata assertions for post and author pages if seeded content is available.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/e2e-critical-flows.spec.ts`
Expected: FAIL because mobile nav and final critical-flow coverage are not implemented yet.

**Step 3: Write minimal implementation**

Implement:
- mobile nav for small screens
- `generateMetadata` for author and post pages
- final docs updates so `docs/EXECUTION_PLAN.md` and `CLAUDE.md` match reality

Do not add extra polish not required by the PRD.

**Step 4: Run verification**

Run:
- `pnpm exec playwright test`
- `pnpm lint`
- `pnpm exec tsc --noEmit`

Expected:
- Full Playwright suite passes
- Lint passes
- TypeScript passes

**Step 5: Commit**

```bash
git add src/components/mobile-nav.tsx src/components/site-header.tsx src/app/layout.tsx src/app/user/[username]/page.tsx src/app/user/[username]/[slug]/page.tsx tests/e2e-critical-flows.spec.ts docs/EXECUTION_PLAN.md CLAUDE.md
git commit -m "feat: finish responsive nav metadata and critical e2e coverage"
```
