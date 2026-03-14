import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost, deletePost } from "@/lib/actions";
import { PostEditor } from "@/components/post-editor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, author_id, profiles:author_id(username), post_tags(tags(name))"
    )
    .eq("id", id)
    .single();

  if (!post || post.author_id !== user.id) redirect("/");

  const profile = Array.isArray(post.profiles)
    ? post.profiles[0]
    : post.profiles;
  const username = (profile as { username: string } | null)?.username ?? "";

  const initialTags = (
    post.post_tags as unknown as Array<{ tags: { name: string } | null }>
  )
    .map((pt) => pt.tags?.name)
    .filter((n): n is string => Boolean(n));

  const { data: tagRows } = await supabase
    .from("tags")
    .select("name")
    .order("name");
  const allTags = tagRows?.map((t) => t.name) ?? [];

  const updateAction = updatePost.bind(null, id);
  const deleteAction = deletePost.bind(null, id, username);

  return (
    <>
      <h1 className="sr-only">Edit Post</h1>
      <PostEditor
        initialTitle={post.title}
      initialContent={post.content}
      initialTags={initialTags}
      allTags={allTags}
      action={updateAction}
      deleteAction={deleteAction}
      cancelHref={`/@${username}/${post.slug}`}
      submitLabel="Update"
    />
    </>
  );
}
