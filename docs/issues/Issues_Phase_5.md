# Issues — Phase 5

## Issue 1: `ssr: false` not allowed in Server Components

- **Problem:** Used `next/dynamic` with `{ ssr: false }` in `write/page.tsx` and `edit/[id]/page.tsx` (both Server Components). Build failed with: "`ssr: false` is not allowed with `next/dynamic` in Server Components."
- **Root Cause:** `ssr: false` is a Client Component–only option. Server Components are always server-rendered; disabling SSR only makes sense in Client context.
- **Solution:** Removed `dynamic()` wrapper entirely and imported `PostEditor` directly. `PostEditor` is already `"use client"`, and EasyMDE is guarded inside `useEffect` + dynamic `import("easymde")`, so it never runs on the server.
- **Learning:** **EasyMDE SSR guard:** Don't wrap a `"use client"` component in `dynamic({ ssr: false })` from a Server Component. If the client component already guards browser-only code in `useEffect`, direct import is sufficient.

## Issue 2: Supabase nested join type inference requires `as unknown as`

- **Problem:** TypeScript rejected the cast `post.post_tags as Array<{ tags: { name: string } | null }>` in `edit/[id]/page.tsx`. Error: *"Conversion of type may be a mistake because neither type sufficiently overlaps."*
- **Root Cause:** Supabase infers nested joins (e.g., `post_tags(tags(name))`) as `{ tags: { name: any }[] }[]` — an array of arrays — not the expected `{ tags: { name: string } | null }[]` shape.
- **Solution:** Cast via `as unknown as Array<...>` to escape the overlap check.
- **Learning:** **Supabase nested join casts:** Always use `as unknown as TargetType` when casting Supabase nested join results. Direct `as TargetType` fails the TypeScript overlap check.

## Issue 3: Codex task failed with exit code 1

- **Problem:** The Codex implementation task (`be929p4nm`) failed with exit code 1. No artifact was produced for Phase 5.
- **Root Cause:** Unknown — likely a Codex CLI authentication or quota issue at the time of the run.
- **Solution:** Phase was implemented by Claude as fallback (pre-skill-update behavior).
- **Learning:** **Codex fallback policy updated:** The `execute-next-phase` skill now says: if Codex fails, stop and ask the user — do not self-implement. Claude is command center only; Codex writes all code.

## Issue 4: `execute-next-phase` skill had wrong role assignment

- **Problem:** The skill described Claude as the primary implementer with Codex as a post-hoc validator. User's intent was the opposite: Claude = command center, Codex = sole code writer.
- **Root Cause:** Skill was written without user input on role preference.
- **Solution:** Updated `execute-next-phase/SKILL.md` — Claude waits for Codex, never self-implements, asks user if Codex fails. Added memory entry `feedback_codex_writes_code.md`.
- **Learning:** **CCG role clarity:** Always confirm role assignments with the user before finalizing a workflow skill. The distinction between "Claude implements with Codex as validator" vs "Codex implements with Claude as reviewer" is significant.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | `ssr: false` in Server Component | Remove `dynamic()`, import `PostEditor` directly |
| 2 | Supabase nested join type cast | Use `as unknown as TargetType` |
| 3 | Codex task failed (exit 1) | Claude wrote fallback code; skill updated for future |
| 4 | Wrong CCG role assignment in skill | Skill and memory updated — Codex writes all code |
