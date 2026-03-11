-- Fix handle_new_user: sanitize OAuth usernames before inserting into profiles.
-- GitHub usernames can contain uppercase letters; Google names can contain spaces
-- and special chars. Without sanitization these violate the username check constraint,
-- causing the trigger to throw and silently failing signup.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
  clean_username text;
  final_username text;
begin
  -- Pull preferred_username (GitHub) or user_name, fall back to empty string
  raw_username := coalesce(
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'user_name',
    ''
  );

  -- Sanitize to match constraint: ^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$
  clean_username := lower(raw_username);
  clean_username := regexp_replace(clean_username, '[^a-z0-9-]', '-', 'g'); -- invalid chars -> hyphen
  clean_username := regexp_replace(clean_username, '-+', '-', 'g');          -- collapse repeated hyphens
  clean_username := regexp_replace(clean_username, '^-+|-+$', '', 'g');      -- trim leading/trailing hyphens
  clean_username := left(clean_username, 28);                                 -- cap length (room for suffix)
  clean_username := regexp_replace(clean_username, '-+$', '', 'g');          -- re-trim after truncation

  -- Fall back if still too short (constraint requires >= 3 chars)
  if length(clean_username) < 3 then
    clean_username := 'user-' || substr(new.id::text, 1, 8);
  end if;

  -- Handle uniqueness: try clean name first, then append UUID suffix
  final_username := clean_username;
  if exists (select 1 from public.profiles where username = final_username) then
    final_username := left(clean_username, 21) || '-' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;
