# SCHEMA — Data Model & Access Control

> Canonical SQL source: `supabase/migrations/00001_initial_schema.sql`


## Tables

### profiles

Extends Supabase `auth.users`. Auto-created on signup via trigger.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, references `auth.users(id)` ON DELETE CASCADE |
| `username` | `text` | UNIQUE, regex: `^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$` |
| `display_name` | `text` | NOT NULL, default `''` |
| `bio` | `text` | NOT NULL, default `''` |
| `avatar_url` | `text` | NOT NULL, default `''` (OAuth or Supabase Storage) |
| `website_url` | `text` | NOT NULL, default `''` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

### posts

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `author_id` | `uuid` | FK → profiles, ON DELETE CASCADE |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE with `(author_id, slug)` |
| `content` | `text` | NOT NULL, default `''` (raw markdown) |
| `excerpt` | `text` | NOT NULL, default `''` (auto-generated, ~160 chars) |
| `published_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` (auto-updated via trigger) |

Indexes: `posts_author_id_idx`, `posts_published_at_idx` (DESC)

### tags

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | UNIQUE, NOT NULL, regex: `^[a-z0-9-]+$` |

### post_tags (junction)

| Column | Type | Constraints |
|--------|------|-------------|
| `post_id` | `uuid` | FK → posts, ON DELETE CASCADE |
| `tag_id` | `uuid` | FK → tags, ON DELETE CASCADE |
| PK | composite | `(post_id, tag_id)` |

Index: `post_tags_tag_id_idx`

## Row Level Security

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Anyone | — (trigger) | Own row (`auth.uid() = id`) | — |
| `posts` | Anyone | Own (`auth.uid() = author_id`) | Own | Own |
| `tags` | Anyone | Authenticated | — | — |
| `post_tags` | Anyone | Post author | — | Post author |

Post author check for `post_tags`: `EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())`

## Triggers

1. **`on_auth_user_created`** — after INSERT on `auth.users`, creates a `profiles` row with username from OAuth metadata (falls back to `user-{id_prefix}`)
2. **`posts_updated_at`** — before UPDATE on `posts`, sets `updated_at = now()`

## Key Queries

| Query | Used by | Pattern |
|-------|---------|---------|
| Recent posts (paginated) | Homepage `/` | `posts` ORDER BY `published_at` DESC, join profiles + tags, RANGE |
| Posts by author | `/@[username]` | `posts` WHERE author matches username lookup |
| Single post + metadata | `/@[username]/[slug]` | Single post + profile + tags |
| Posts by tag | `/tags/[tag]` | `posts` via `post_tags` join WHERE tag name matches |
| All tags with counts | `/tags` | `tags` with `post_tags(count)` |
