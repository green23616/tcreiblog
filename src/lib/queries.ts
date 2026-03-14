import type { SupabaseClient } from "@supabase/supabase-js";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  content: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
  post_tags: Array<{ tags: { name: string } | null }>;
};

export type Profile = {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website_url: string;
};

export type Tag = {
  name: string;
  count: number;
};

type ProfileRecord = Profile & { id: string };
type RawPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  content: string;
  profiles:
    | {
        username: string;
        display_name: string;
        avatar_url: string;
      }
    | Array<{
        username: string;
        display_name: string;
        avatar_url: string;
      }>
    | null;
  post_tags:
    | Array<{
        tags:
          | {
              name: string;
            }
          | Array<{
              name: string;
            }>
          | null;
      }>
    | null;
};
type TagCountRow = {
  name: string;
  post_tags: Array<{ count: number | null }> | null;
};
type TaggedPostRow = {
  post_id: string;
};

const POST_SELECT = `
  id, title, slug, excerpt, published_at, content,
  profiles:author_id(username, display_name, avatar_url),
  post_tags(tags(name))
` as const;

const PROFILE_SELECT = "id, username, display_name, bio, avatar_url, website_url";
const NO_ROWS_ERROR_CODE = "PGRST116";

function isNoRowsError(error: { code?: string } | null) {
  return error?.code === NO_ROWS_ERROR_CODE;
}

function toProfile(profile: ProfileRecord): Profile {
  return {
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    website_url: profile.website_url,
  };
}

function normalizePost(row: RawPostRow): Post {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    published_at: row.published_at,
    content: row.content,
    profiles: profile ?? null,
    post_tags: (row.post_tags ?? []).map((postTag) => ({
      tags: Array.isArray(postTag.tags) ? postTag.tags[0] ?? null : postTag.tags ?? null,
    })),
  };
}

export async function getRecentPosts(
  supabase: SupabaseClient,
  { before, limit = 20 }: { before?: string; limit?: number } = {}
): Promise<{ posts: Post[]; hasMore: boolean }> {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("published_at", { ascending: false })
    .limit(limit + 1);

  if (before) {
    query = query.lt("published_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as RawPostRow[]).map(normalizePost);
  const hasMore = rows.length > limit;

  return {
    posts: hasMore ? rows.slice(0, limit) : rows,
    hasMore,
  };
}

export async function getPostsByAuthor(
  supabase: SupabaseClient,
  username: string
): Promise<{ profile: Profile; posts: Post[] } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("username", username)
    .single();

  if (profileError) {
    if (isNoRowsError(profileError)) {
      return null;
    }

    throw profileError;
  }

  if (!profile) {
    return null;
  }

  const profileRecord = profile as ProfileRecord;

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", profileRecord.id)
    .order("published_at", { ascending: false });

  if (postsError) {
    throw postsError;
  }

  return {
    profile: toProfile(profileRecord),
    posts: ((posts ?? []) as RawPostRow[]).map(normalizePost),
  };
}

export async function getPost(
  supabase: SupabaseClient,
  username: string,
  slug: string
): Promise<{ post: Post; profile: Profile } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("username", username)
    .single();

  if (profileError) {
    if (isNoRowsError(profileError)) {
      return null;
    }

    throw profileError;
  }

  if (!profile) {
    return null;
  }

  const profileRecord = profile as ProfileRecord;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", profileRecord.id)
    .eq("slug", slug)
    .single();

  if (postError) {
    if (isNoRowsError(postError)) {
      return null;
    }

    throw postError;
  }

  if (!post) {
    return null;
  }

  return {
    post: normalizePost(post as RawPostRow),
    profile: toProfile(profileRecord),
  };
}

export async function getAllTags(supabase: SupabaseClient): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("name, post_tags(count)");

  if (error) {
    throw error;
  }

  return ((data ?? []) as TagCountRow[]).map((row) => ({
    name: row.name,
    count: Number(row.post_tags?.[0]?.count ?? 0),
  }));
}

export async function getPostsByTag(
  supabase: SupabaseClient,
  tagName: string
): Promise<Post[]> {
  const { data: taggedPosts, error: taggedPostsError } = await supabase
    .from("post_tags")
    .select("post_id, tags!inner(name)")
    .eq("tags.name", tagName);

  if (taggedPostsError) {
    throw taggedPostsError;
  }

  const postIds = Array.from(
    new Set(((taggedPosts ?? []) as TaggedPostRow[]).map((row) => row.post_id))
  );

  if (postIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("id", postIds)
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as RawPostRow[]).map(normalizePost);
}
