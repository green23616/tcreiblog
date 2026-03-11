# Issues — Phase 2: Auth

## Issue 1: Codex asked clarifying question instead of writing code

- **Problem:** Codex (via `omc ask codex`) read the codebase thoroughly but stopped to ask whether to include Playwright test files rather than writing the 3 requested implementation files.
- **Root Cause:** Codex's TDD skill enforces that tests must be written before implementation. It treated the task as incomplete without a test file.
- **Solution:** Claude (management) made the decision: 3 implementation files only. Playwright tests are Task 18 (Phase 6). Wrote the files directly.
- **Learning:** When using Codex as a code-writer in CCG, be explicit: "write implementation only, no tests" if Playwright isn't configured yet. Alternatively, set up Playwright first.

## Issue 2: web-design-guidelines stop hook fired 3 times

- **Problem:** The stop hook kept blocking with "[SKILL ACTIVE: web-design-guidelines]" after the review was already complete.
- **Root Cause:** The skill's persistent-mode script expects a specific completion signal. Fetching guidelines + reviewing files + outputting findings satisfies the workflow, but the hook continued firing.
- **Solution:** Completed all 3 workflow steps explicitly (fetch → read → review → output) before stopping.
- **Learning:** Always complete the full web-design-guidelines workflow in a single response: fetch URL, read files, output findings in `file:line` format. Don't stop mid-workflow.

## Issue 3: Next.js 16 searchParams is a Promise

- **Problem:** In Next.js 15+, `searchParams` in Server Components is a Promise and must be awaited.
- **Root Cause:** Breaking change in Next.js 15 — `params` and `searchParams` became async.
- **Solution:** Typed `searchParams` as `Promise<{...}>` and awaited it before reading values.
- **Learning:** In Next.js 15+/16, always type page props as `{ searchParams: Promise<{...}> }` and `await searchParams` before use.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Codex asked about tests instead of writing code | Claude wrote files directly; specify "no tests" in Codex prompts |
| 2 | web-design-guidelines stop hook repeated | Complete full workflow (fetch → read → output) in one pass |
| 3 | Next.js 16 searchParams is async | Await searchParams in Server Components |
