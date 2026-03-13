# Issues — Phase 6

## Issue 1: Codex stopped to ask a clarifying question

- **Problem:** First Codex run triggered a brainstorming gate and stopped to ask about avatar link destination (`/@username` vs `/settings`).
- **Root Cause:** The prompt didn't explicitly decide the avatar link behavior, so Codex treated it as ambiguous.
- **Solution:** Re-fired with the decision stated explicitly ("avatar links to `/@username`") and "no questions — implement directly."
- **Learning:** **Codex brainstorming gate:** If the prompt leaves behavioral decisions open, Codex will stop to ask. State every decision explicitly in the prompt. Add "no clarifying questions" to suppress the gate.

## Issue 2: focus trap not implemented by Codex (Gemini HIGH)

- **Problem:** Gemini pre-code rated focus trapping as HIGH — keyboard users could tab into background content when mobile nav was open. Codex implemented close-on-Escape and close-on-outside-click, but not a Tab key focus cycle.
- **Root Cause:** Codex implemented close behaviors but did not implement the full Tab/Shift-Tab focus trap loop.
- **Solution:** Claude added `tabIndex={-1}` to the panel and a `focus()` call on open/close. The linter then added the complete Tab key cycling implementation (focusable element query + first/last element wrapping).
- **Learning:** **Mobile nav focus trap:** Close-on-Escape alone is insufficient. A proper focus trap requires querying focusable elements and cycling Tab/Shift-Tab within the panel. The linter (`oh-my-claudecode`) can fill this gap automatically.

## Issue 3: layout.tsx modified by linter during post-code review

- **Problem:** While Claude was preparing to apply the Gemini post-code HIGH item (OG/Twitter metadata), the linter had already applied a more complete version to `layout.tsx`, causing the Edit tool to fail with "file modified since read."
- **Root Cause:** The linter auto-applied changes faster than the manual edit workflow.
- **Solution:** Re-read the file, confirmed the linter's version was more complete (`summary_large_image`, full title/description templates), and kept it as-is.
- **Learning:** **Linter race condition:** Always re-read modified files before editing. When the linter applies a more complete version of a planned change, prefer the linter's output over the manual edit.

## Issue 4: `transition-all` performance anti-pattern in mobile nav

- **Problem:** Codex used `transition-all duration-200` on the nav panel. Gemini post-code flagged this as a performance issue — `transition-all` triggers layout recalculations for every CSS property.
- **Root Cause:** Codex defaulted to the catch-all transition class.
- **Solution:** Linter replaced with `transition-[transform,opacity]` targeting only the two animated properties.
- **Learning:** **CSS transitions:** Prefer `transition-[transform,opacity]` over `transition-all` for animated overlays. Only transition the properties that actually change.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Codex stopped for clarifying question | Re-fired with explicit decision + "no questions" instruction |
| 2 | Focus trap missing (Gemini HIGH) | Tab key cycling added by Claude + linter |
| 3 | Linter beat Claude to OG metadata edit | Re-read file, kept linter's more complete version |
| 4 | `transition-all` performance anti-pattern | Linter replaced with `transition-[transform,opacity]` |
