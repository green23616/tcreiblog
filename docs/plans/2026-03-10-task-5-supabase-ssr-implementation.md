# Task 5 Supabase SSR Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Supabase SSR client helpers and root route protection so protected routes redirect unauthenticated users to `/login`.

**Architecture:** Use `@supabase/ssr` with a browser client, a server client built from `next/headers` cookies, and a request/response-aware middleware helper used by the root Next.js middleware. Keep auth checks server-side and protect only `/write`, `/edit`, and `/settings`, preserving the original destination in a `redirect` query param.

**Tech Stack:** Next.js 16 App Router, `@supabase/ssr`, `@supabase/supabase-js`, TypeScript, Playwright Test, ESLint

---

### Task 1: Add redirect verification surface

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/auth-redirect.spec.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Create a Playwright spec that imports the auth guard entry point, passes an unauthenticated `/write` request, and asserts the response is a redirect to `/login?redirect=%2Fwrite`.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/auth-redirect.spec.ts`
Expected: FAIL because no Playwright config exists and the auth guard entry point does not exist yet.

**Step 3: Write minimal implementation support**

Add Playwright config for repository tests plus `test:e2e` and `test:e2e:ui` scripts.

**Step 4: Run test to verify it still fails for the right reason**

Run: `pnpm exec playwright test tests/auth-redirect.spec.ts`
Expected: FAIL because unauthenticated `/write` requests are not redirected to `/login` yet.

**Step 5: Commit**

```bash
git add package.json playwright.config.ts tests/auth-redirect.spec.ts
git commit -m "test: add auth redirect e2e coverage"
```

### Task 2: Implement Supabase SSR helpers and middleware

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`

**Step 1: Write the failing test**

Use the Task 1 Playwright spec as the failing behavior test for this task.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/auth-redirect.spec.ts`
Expected: FAIL because unauthenticated `/write` requests are not redirected yet.

**Step 3: Write minimal implementation**

Create the server and browser Supabase clients from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, implement a middleware session updater using `createServerClient`, and add root middleware that redirects unauthenticated requests for `/write`, `/edit`, and `/settings` to `/login` with a `redirect` query param. Keep the redirect decision testable via a small exported auth-guard function.

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test tests/auth-redirect.spec.ts`
Expected: PASS with unauthenticated `/write` landing on `/login?redirect=%2Fwrite`.

**Step 5: Commit**

```bash
git add src/lib/supabase/server.ts src/lib/supabase/client.ts src/lib/supabase/middleware.ts src/middleware.ts
git commit -m "feat: add supabase ssr helpers and auth middleware"
```

### Task 3: Verify Task 5 and review roadmap state

**Files:**
- Modify: `docs/EXECUTION_PLAN.md`
- Modify: `CLAUDE.md`

**Step 1: Run verification**

Run:
- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm exec playwright test tests/auth-redirect.spec.ts`

Expected:
- Lint passes
- TypeScript passes
- Auth redirect E2E passes

**Step 2: Review plan status**

Compare actual repository state against Phases 1-5 in `docs/EXECUTION_PLAN.md`, then update statuses and notes so the next task is accurate.

**Step 3: Review agent guide**

Update `CLAUDE.md` if any commands or key paths are now inaccurate.

**Step 4: Commit**

```bash
git add docs/EXECUTION_PLAN.md CLAUDE.md
git commit -m "docs: update execution status after task 5"
```
