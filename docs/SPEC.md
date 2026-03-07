# SPEC — System Architecture & Technical Design

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Decisions](#architecture-decisions)
- [Routes](#routes)
- [Page Layouts](#page-layouts)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Key File Paths](#key-file-paths)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database + Auth | Supabase (PostgreSQL, OAuth, RLS, Storage) |
| Styling | Tailwind CSS 3.4 + Shadcn/ui |
| Fonts | Geist (sans) + Geist Mono (code) |
| Markdown | EasyMDE (editor) + react-markdown + rehype-highlight + remark-gfm + rehype-sanitize |
| Package manager | pnpm |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Playwright |

## Architecture Decisions

1. **Server Components by default** — all public/read pages. No client JS for reading.
2. **Client Components only for** — markdown editor, dark mode toggle, mobile nav, tag autocomplete.
3. **No API routes** — Supabase SSR client talks to DB directly. Server Actions for mutations.
4. **Supabase RLS as auth layer** — no middleware auth checks needed for data access.
   - Middleware sets a `redirect` query param when redirecting to `/login`, so the callback can return users to their original destination.
5. **Aggressive caching** — 500 total posts. `revalidatePath` on create/edit/delete.
6. **`@username` URL routing** — Next.js rewrites `/@:username` → `/user/:username` and `/@:username/:slug` → `/user/:username/:slug` because `@` prefix is reserved for parallel routes in the App Router.

## Routes

| Route | Purpose | Auth | Rendering |
|-------|---------|------|-----------|
| `/` | Homepage — recent posts, paginated | Public | Server Component |
| `/@[username]` | Author blog page (rewrites to `/user/[username]`) | Public | Server Component |
| `/@[username]/[slug]` | Post detail (rewrites to `/user/[username]/[slug]`) | Public | Server Component |
| `/tags` | Tag index — all tags with counts | Public | Server Component |
| `/tags/[tag]` | Posts filtered by tag | Public | Server Component |
| `/write` | New post editor | Protected | Client Component |
| `/edit/[id]` | Edit own post | Protected | Client Component |
| `/settings` | Profile settings | Protected | Client Component |
| `/login` | OAuth login (Google + GitHub) | Public | Server Component |
| `/auth/callback` | Supabase OAuth callback (exchanges code, honors `redirect` param) | System | Route Handler |

## Page Layouts

### Homepage `/`

- Single column, `max-w-layout` (1280px), centered
- Post cards: no background fill, separated by `border-t border-border`
- Each card: tag labels (uppercase, tracked) + date right-aligned, title bold, excerpt in muted-foreground, author handle
- Cursor-based pagination (Older / Newer)

### Author Page `/@[username]`

- Author header: avatar + display name + bio + website link
- Post list: same card pattern as homepage, without author handle
- Post count shown as metadata label

### Post Detail `/@[username]/[slug]`

- 2-column layout at `lg+`: `280px` sidebar + `65ch` main content
- Sidebar: metadata labels (PUBLISHED, AUTHOR, TAGS, READING TIME) — sticky
- Main: rendered markdown with `prose` class from `@tailwindcss/typography`
- Collapses to single column on mobile/tablet — metadata moves above article

### Write/Edit `/write`, `/edit/[id]`

- Title input (sharp corners, border-input)
- Tag input with autocomplete from existing tags
- EasyMDE markdown editor with minimal toolbar
- Preview toggle (eye icon)
- Cancel + Publish/Update buttons in header
- Edit page includes Delete button

### Settings `/settings`

- Form sections separated by hairline borders
- Fields: avatar (from OAuth), username, display name, bio, website
- Connected accounts section (read-only)
- Username validation: lowercase, alphanumeric + hyphens, 3-30 chars, unique

## Responsive Breakpoints

| Token | Width | Behavior |
|-------|-------|----------|
| `sm` | `< 768px` | Single column, hamburger nav, metadata above content |
| `md` | `768–1023px` | Single column, full horizontal nav |
| `lg` | `1024–1439px` | 2-column post detail starts |
| `fhd` | `1440–2559px` | Full HD, content centered within max-w-layout |
| `qhd` | `2560–3839px` | QHD, generous margins around centered content |
| `uhd` | `3840px+` | 4K, same layout, more whitespace |

## Key File Paths

| Path | Purpose |
|------|---------|
| `src/lib/supabase/server.ts` | Supabase server client (Server Components + Actions) |
| `src/lib/supabase/client.ts` | Supabase browser client (Client Components) |
| `src/lib/supabase/middleware.ts` | Session refresh middleware helper |
| `src/middleware.ts` | Route protection (redirects to /login) |
| `src/lib/queries.ts` | Shared DB queries for Server Components |
| `src/lib/actions.ts` | Server Actions for post/profile CRUD |
| `src/components/` | Shared components (post-card, tag-pill, meta-label, etc.) |
| `src/app/globals.css` | CSS variables (design tokens) |
| `tailwind.config.ts` | Tailwind configuration |
| `supabase/migrations/` | Database schema |
