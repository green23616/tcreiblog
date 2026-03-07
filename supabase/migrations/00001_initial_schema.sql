-- supabase/migrations/00001_initial_schema.sql

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
  ),
  display_name text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  website_url text not null default '',
  created_at timestamptz not null default now()
);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  content text not null default '',
  excerpt text not null default '',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, slug)
);

create index posts_author_id_idx on public.posts(author_id);
create index posts_published_at_idx on public.posts(published_at desc);

-- Tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name ~ '^[a-z0-9-]+$')
);

-- Post-Tags junction
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index post_tags_tag_id_idx on public.post_tags(tag_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

-- Profiles: anyone reads, owner updates
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Posts: anyone reads, author CRUDs own
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

-- Tags: anyone reads, authenticated inserts
create policy "tags_select" on public.tags for select using (true);
create policy "tags_insert" on public.tags for insert with check (auth.uid() is not null);

-- Post-Tags: anyone reads, post author manages
create policy "post_tags_select" on public.post_tags for select using (true);
create policy "post_tags_insert" on public.post_tags for insert
  with check (
    exists (select 1 from public.posts where id = post_id and author_id = auth.uid())
  );
create policy "post_tags_delete" on public.post_tags for delete
  using (
    exists (select 1 from public.posts where id = post_id and author_id = auth.uid())
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'user_name',
      'user-' || substr(new.id::text, 1, 8)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      ''
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.update_updated_at();
