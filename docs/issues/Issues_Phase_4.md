# Issues — Phase 4

## Issue 1: Supabase Join Type Mismatch (profiles as array)

- **Problem:** TypeScript error when assigning Supabase query result to `Post[]` — Supabase infers `profiles` as `Array<{...}>` but `Post.profiles` is typed as `{...} | null`.
- **Root Cause:** Supabase's TypeScript inference doesn't know join cardinality. A many-to-one join (`author_id` FK) is inferred as an array even though the runtime value is a single object.
- **Solution:** Defined `RawPostRow` with `profiles` typed as `object | Array<object> | null`, and a `normalizePost()` function that checks `Array.isArray(row.profiles)` and extracts `[0]` if needed. The linter rejected `as unknown as Post[]` — the union type + normalizer is the correct approach.
- **Learning:** Always use `RawPostRow` + `normalizePost()` for Supabase queries that join `profiles`. Never rely on `as unknown as T[]` casts — the linter removes `unknown`.

## Issue 2: Supabase `.in()` Rejects Query Builder Argument

- **Problem:** Initial `getPostsByTag` passed a Supabase subquery builder to `.in('id', ...)`. TypeScript error: `.in()` requires `readonly any[]`, not a query builder object.
- **Root Cause:** Supabase JS v2 does not support subquery composition via `.in()`. Only plain arrays are accepted.
- **Solution:** Two-query pattern — first fetch `post_id` values into a `string[]`, then pass that array to `.in('id', postIds)`. Added `Array.from(new Set(...))` for deduplication.
- **Learning:** Never pass a Supabase query builder to `.in()`. Resolve to an array first. Use `!inner` join syntax to filter by related table values server-side when possible.

## Issue 3: Supabase PGRST116 — No Rows vs. Real Errors

- **Problem:** Using `.single()` on a query with no matching rows throws an error with code `"PGRST116"`. Without handling, this causes a 500 instead of a 404.
- **Root Cause:** Supabase returns an error object (not null data) when `.single()` finds no rows.
- **Solution:** Added `const NO_ROWS_ERROR_CODE = "PGRST116"` constant and `isNoRowsError()` helper. All `.single()` call sites check `isNoRowsError(error)` before throwing, returning `null` for 404s. Pages then call `notFound()` from `next/navigation`.
- **Learning:** Any query using `.single()` needs PGRST116 handling. Pattern: check `isNoRowsError` → return null → call `notFound()` in the page.

## Issue 4: MetaLabel `as` Prop Stripped by Linter

- **Problem:** Using `<MetaLabel as="p">` or `<MetaLabel as="h1">` for semantic HTML — the linter removed the `as` prop on every file write.
- **Root Cause:** MetaLabel is implemented as a plain `span` with no `as` prop in its interface. The linter enforces component API boundaries.
- **Solution:** Wrap MetaLabel with native elements where semantics matter: `<h1 className="mb-8"><MetaLabel>All Tags</MetaLabel></h1>`. For inline use, `<MetaLabel>` as a `span` is fine.
- **Learning:** MetaLabel has no `as` prop — don't add one. Use native HTML wrapper elements for semantic heading/paragraph context.

## Issue 5: `<img>` Swapped to `<Image>` by Linter

- **Problem:** Used native `<img>` for OAuth avatar URLs. The linter replaced `<img>` with `next/image`'s `<Image>` automatically.
- **Root Cause:** Next.js linting rules require `next/image` for all image elements.
- **Solution:** Used `<Image unoptimized>` — avoids domain whitelist config while satisfying the linter. The `unoptimized` prop passes the URL through without Next.js image optimization.
- **Learning:** Always use `<Image unoptimized>` for external avatar/OAuth URLs. Add `width` and `height` props (required by `next/image`).

## Issue 6: rehype Plugin Order

- **Problem:** Initial order was `[rehypeSanitize, rehypeHighlight]` (sanitize first). This causes rehype-sanitize to strip the `className` attributes that rehype-highlight needs to apply syntax highlighting.
- **Root Cause:** rehype-sanitize's default schema does not allowlist `className` on `code` elements — but the default schema used *after* rehype-highlight does allow it (because highlight runs first and sanitize's defaults preserve highlight output).
- **Solution:** `[rehypeHighlight, rehypeSanitize]` — highlight first, sanitize after. The default sanitize schema allows `className` on `code` elements when highlight has already run.
- **Learning:** rehype plugin order is `[rehypeHighlight, rehypeSanitize]`. Always highlight before sanitizing.

## Issue 7: Website URL — Relative Link Bug

- **Problem:** If a user stores `example.com` (no protocol) in `website_url`, using it directly as `href` creates a relative link (`/example.com`) instead of an external link.
- **Root Cause:** Browsers treat hrefs without `http(s)://` as relative paths.
- **Solution:** Guard: `href={url.startsWith('http') ? url : 'https://' + url}`.
- **Learning:** Always guard external URL fields from user input with the `startsWith('http')` check before using as `href`.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Supabase join type mismatch | `RawPostRow` union type + `normalizePost()` function |
| 2 | `.in()` rejects query builder | Two-query pattern — resolve IDs to `string[]` first |
| 3 | PGRST116 treated as real error | `isNoRowsError()` helper + `notFound()` in pages |
| 4 | MetaLabel `as` prop stripped | Native HTML wrapper (`<h1>`, `<p>`) around MetaLabel |
| 5 | `<img>` replaced by linter | `<Image unoptimized>` for OAuth avatar URLs |
| 6 | rehype plugin order wrong | `[rehypeHighlight, rehypeSanitize]` — highlight first |
| 7 | Website URL relative link bug | Guard with `url.startsWith('http') ? url : 'https://' + url` |
