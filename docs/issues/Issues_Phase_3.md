# Issues — Phase 3: Shared Components

## Issue 1: ThemeToggle hydration — mounted state vs CSS animation

- **Problem:** Initial implementation used a `mounted` state check to avoid SSR/CSR mismatch (render nothing until mounted, then show the correct icon). Gemini flagged this as necessary.
- **Root Cause:** The `mounted` approach introduces a visual flash (blank button → icon) on initial render.
- **Solution:** Codex implemented the CSS animation trick instead: render both Sun and Moon icons simultaneously, use `scale-0/scale-100` + `rotate` Tailwind transitions to show/hide them. Dark mode CSS handles which icon is visible, so there is no state-dependent rendering at all.
- **Learning:** **ThemeToggle pattern:** Prefer the dual-icon CSS animation approach over `mounted` state check. Both icons in DOM, Tailwind `dark:` variants control visibility. No hydration flash, no state needed.

## Issue 2: `resolvedTheme` vs `theme` in useTheme

- **Problem:** My initial ThemeToggle used `theme` from `useTheme()`, which returns `"system"` when the user has system preference selected. Toggling from `"system"` to `"light"` doesn't behave as expected.
- **Root Cause:** `theme` = the stored setting. `resolvedTheme` = the actual applied theme after resolving system preference.
- **Solution:** Use `resolvedTheme` for the toggle condition: `resolvedTheme === "dark" ? "light" : "dark"`. This correctly detects the current display state regardless of system preference.
- **Learning:** **next-themes toggle:** Always use `resolvedTheme` (not `theme`) to determine current state in toggle logic. `theme` can be `"system"`, which breaks conditional rendering.

## Issue 3: TagPill missing `encodeURIComponent`

- **Problem:** Initial TagPill used bare `/tags/${tag}` in the href. Tags with spaces or special chars (e.g., `c++`, `react native`) would produce broken URLs.
- **Root Cause:** Oversight — tag values come from user input and are not guaranteed to be URL-safe.
- **Solution:** Codex caught this: use `/tags/${encodeURIComponent(tag)}`.
- **Learning:** **TagPill:** Always `encodeURIComponent(tag)` in the href. Tag values are user-generated and may contain spaces or special characters.

## Issue 4: Codex latency in CCG flow

- **Problem:** Codex took ~6 minutes to respond vs Gemini's ~1 minute. Since I had the full spec and Gemini's guidance, I implemented all 8 files while Codex was still running. When Codex landed, its output was identical to what the linter had already refined.
- **Root Cause:** Codex reads the actual codebase (scans files, runs shell commands) before producing output — thorough but slow.
- **Solution:** Proceeded with implementation in parallel. Verified Codex alignment post-hoc.
- **Learning:** **CCG flow:** Don't block implementation on Codex when spec is clear and Gemini has already reviewed. Implement in parallel, compare Codex output when it lands. Codex acts as a second opinion and catches details (encodeURIComponent, resolvedTheme) rather than being the primary blocker.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | ThemeToggle mounted flash | Use dual-icon CSS animation (scale-0/scale-100), not mounted state |
| 2 | `theme` vs `resolvedTheme` | Use `resolvedTheme` for toggle condition in next-themes |
| 3 | TagPill unencoded URLs | Use `encodeURIComponent(tag)` in href |
| 4 | Codex latency in CCG | Implement in parallel with spec; use Codex as post-hoc validator |
