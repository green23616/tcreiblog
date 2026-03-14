"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function generateExcerpt(content: string): string {
  return content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/[*_]/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 160);
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && /^[a-z0-9-]+$/.test(t));
}

async function upsertTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  tags: string[]
) {
  if (tags.length === 0) return;

  const { data: tagRows, error: tagError } = await supabase
    .from("tags")
    .upsert(
      tags.map((name) => ({ name })),
      { onConflict: "name" }
    )
    .select("id, name");

  if (tagError) throw tagError;
  if (!tagRows || tagRows.length === 0) return;

  const { error: linkError } = await supabase.from("post_tags").insert(
    tagRows.map((tag) => ({ post_id: postId, tag_id: tag.id }))
  );

  if (linkError) throw linkError;
}

export async function createPost(formData: FormData): Promise<never> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";

  if (!title) redirect("/write");

  const slug = generateSlug(title);
  const excerpt = generateExcerpt(content);
  const tags = parseTags(tagsRaw);

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ title, slug, content, excerpt, author_id: user.id })
    .select("id, slug")
    .single();

  if (postError) throw postError;

  await upsertTags(supabase, post.id, tags);

  revalidatePath("/");
  revalidatePath(`/@${profile.username}`);
  revalidatePath("/tags");
  redirect(`/@${profile.username}/${post.slug}`);
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<never> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("posts")
    .select("id, slug, author_id, profiles:author_id(username)")
    .eq("id", postId)
    .single();

  if (!existing || existing.author_id !== user.id) redirect("/");

  const profile = Array.isArray(existing.profiles)
    ? existing.profiles[0]
    : existing.profiles;
  const username = (profile as { username: string } | null)?.username ?? "";

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";

  const slug = generateSlug(title);
  const excerpt = generateExcerpt(content);
  const tags = parseTags(tagsRaw);

  const { error: updateError } = await supabase
    .from("posts")
    .update({ title, slug, content, excerpt })
    .eq("id", postId);

  if (updateError) throw updateError;

  // Replace tags: delete existing links, re-insert
  await supabase.from("post_tags").delete().eq("post_id", postId);
  await upsertTags(supabase, postId, tags);

  revalidatePath("/");
  revalidatePath(`/@${username}`);
  revalidatePath(`/@${username}/${slug}`);
  revalidatePath("/tags");
  redirect(`/@${username}/${slug}`);
}

export async function deletePost(
  postId: string,
  authorUsername: string
): Promise<never> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath(`/@${authorUsername}`);
  revalidatePath("/tags");
  redirect(`/@${authorUsername}`);
}

export async function updateProfile(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const username = (formData.get("username") as string | null)?.trim() ?? "";
  const display_name =
    (formData.get("display_name") as string | null)?.trim() ?? "";
  const bio = (formData.get("bio") as string | null)?.trim() ?? "";
  const website_url =
    (formData.get("website_url") as string | null)?.trim() ?? "";

  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)) {
    return {
      error:
        "Username must be 3–30 characters: lowercase letters, numbers, and hyphens only.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, display_name, bio, website_url })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath(`/@${username}`);
  revalidatePath("/settings");
  return {};
}
