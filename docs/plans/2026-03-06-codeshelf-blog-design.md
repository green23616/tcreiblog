# CodeShelf — Developer Blog Platform Design

**Date:** 2026-03-06
**Status:** Approved

---

## Overview

A simple developer blog service for ~10 authors with ~50 posts each. Modern, clean, monochrome aesthetic. Typography-first, no vivid colors or animations.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database + Auth:** Supabase (PostgreSQL, OAuth, RLS, Storage)
- **Styling:** Tailwind CSS 3.4 + Shadcn/ui
- **Fonts:** Geist (sans) + Geist Mono (code)
- **Markdown:** EasyMDE (editor) + react-markdown + rehype-highlight + remark-gfm
- **Package manager:** pnpm
- **Icons:** Lucide React
- **Testing:** Playwright

## Design References

- **ref1.jpg** — Motion Music letterhead: ultra-minimal, monochrome, extreme whitespace, print-media
- **ref2.jpg** — RSC/NASA Mission Overview: technical grid, metadata labels, hairline borders, monospaced data

Combined direction: typography-first, grid-disciplined, generous spacing, monospaced accents, zero shadows, sharp corners.

## Design Tokens

Full token specification in `docs/DESIGN_TOKENS.md`. Key decisions:

- **Approach C: Shadcn-first with blog extensions** — all standard UI tokens use Shadcn-native CSS variable names; blog-specific tokens (`--reading-width`, `--sidebar-width`, `--tracking-label`, etc.) extend the system.
- **Palette:** Zinc monochrome only. No brand colors. Status colors (destructive) included for functional needs only.
- **Radius:** `--radius: 0rem` for sharp corners globally. `rounded-full` preserved for avatars/badges.
- **Shadows:** None. Hierarchy via borders and background contrast only.
- **Contrast:** All text passes WCAG AA — muted-foreground is Zinc 500 (4.4:1 on light), Zinc 400 (7.8:1 on dark).

## Auth

- Self-registration via Google and GitHub OAuth (Supabase Auth)
- No admin role — each author manages their own content
- Profile created on first login via Supabase trigger

## Data Model

### profiles

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | References `auth.users.id` |
| `username` | `text` UNIQUE | 3-30 chars, lowercase alphanumeric + hyphens |
| `display_name` | `text` | |
| `bio` | `text` | |
| `avatar_url` | `text` | OAuth provider or Supabase Storage |
| `website_url` | `text` | Optional |
| `created_at` | `timestamptz` | |

### posts

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `author_id` | `uuid` FK → profiles | |
| `title` | `text` | |
| `slug` | `text` | Generated via `slugify` |
| `content` | `text` | Raw markdown |
| `excerpt` | `text` | Auto-generated, ~160 chars |
| `published_at` | `timestamptz` | Set on creation |
| `updated_at` | `timestamptz` | |

Unique constraint: `(author_id, slug)`

### tags

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `text` UNIQUE | Lowercase, hyphenated |

### post_tags

| Column | Type | Notes |
|--------|------|-------|
| `post_id` | `uuid` FK → posts | |
| `tag_id` | `uuid` FK → tags | |
| PK | `(post_id, tag_id)` | |

### RLS Policies

- `profiles`: SELECT → anyone, UPDATE → own row only
- `posts`: SELECT → anyone, INSERT/UPDATE/DELETE → `author_id = auth.uid()`
- `tags`: SELECT → anyone, INSERT → authenticated
- `post_tags`: SELECT → anyone, INSERT/DELETE → post author only

## Routes

| Route | Purpose | Auth | Rendering |
|-------|---------|------|-----------|
| `/` | Homepage — recent posts | Public | Server Component |
| `/@[username]` | Author blog page | Public | Server Component |
| `/@[username]/[slug]` | Post detail | Public | Server Component |
| `/tags/[tag]` | Posts by tag | Public | Server Component |
| `/write` | New post editor | Protected | Client Component |
| `/edit/[id]` | Edit own post | Protected | Client Component |
| `/settings` | Profile settings | Protected | Client Component |
| `/login` | OAuth login | Public | Server Component |
| `/auth/callback` | Supabase callback | System | Route Handler |

## Page Layouts

### Homepage `/`

- Single column, `max-w-layout` (1280px), centered
- Post cards: no background fill, separated by `border-t border-border`
- Each card: tag labels (uppercase, tracked) + date right-aligned, title bold, excerpt in muted-foreground, author handle
- Cursor-based pagination (Older / Newer)

### Author Page `/@[username]`

- Author header: avatar + display name + bio + website link
- Post list: same card pattern as homepage, without author handle
- Post count shown as "12 total" metadata label

### Post Detail `/@[username]/[slug]`

- 2-column layout at `lg+`: `280px` sidebar + `65ch` main
- Sidebar: metadata labels (PUBLISHED, AUTHOR, TAGS, READING TIME)
- Main: rendered markdown with `prose` class from `@tailwindcss/typography`
- Collapses to single column on mobile/tablet — metadata above article

### Write/Edit `/write`, `/edit/[id]`

- Title input (sharp corners, border-input)
- Tag input with autocomplete from existing tags
- EasyMDE markdown editor with minimal toolbar
- Preview toggle
- Cancel + Publish buttons in header

### Settings `/settings`

- Form sections separated by hairline borders
- Fields: avatar upload, username, display name, bio, website
- Connected accounts section (read-only, shows OAuth providers)
- Username validation: lowercase, alphanumeric + hyphens, 3-30 chars, unique

## Responsive Breakpoints

| Token | Width | Behavior |
|-------|-------|----------|
| `sm` | `< 768px` | Single column, hamburger nav, metadata above content |
| `md` | `768–1023px` | Single column, full nav |
| `lg` | `1024–1439px` | 2-col post detail starts |
| `fhd` | `1440–2559px` | Full HD, content within max-w-layout |
| `qhd` | `2560–3839px` | QHD, generous margins around centered content |
| `uhd` | `3840px+` | 4K, same layout, more whitespace |

## Architecture Decisions

1. **Server Components by default** — all public/read pages. No client JS for reading.
2. **Client Components for** — markdown editor, dark mode toggle, mobile nav, tag autocomplete.
3. **No API routes** — Supabase SSR client talks to DB directly. Server Actions for mutations.
4. **Supabase RLS as auth layer** — no middleware auth checks needed for data access.
5. **Aggressive caching** — 500 total posts. `revalidatePath` on create/edit/delete.
6. **No search** — small scale, not needed.
7. **No comments/reactions** — read-only for visitors.
8. **No drafts** — posts are public immediately on publish.

## Supporting Documents

- `docs/DESIGN_TOKENS.md` — CSS variables, Tailwind config, TypeScript reference, component usage examples
- `docs/DESIGN.md` — Claude's initial token extraction (superseded)
- `docs/DESIGN2.md` — Gemini's token extraction (superseded)
- `docs/review.md` — Gemini + Codex review of DESIGN2.md with corrections applied to DESIGN_TOKENS.md
