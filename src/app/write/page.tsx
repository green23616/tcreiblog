import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/lib/actions";
import { PostEditor } from "@/components/post-editor";

export default async function WritePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Gemini HIGH: users without a username can't publish — send to settings first
  if (!profile?.username) redirect("/settings");

  const { data: tagRows } = await supabase
    .from("tags")
    .select("name")
    .order("name");

  const allTags = tagRows?.map((t) => t.name) ?? [];

  return (
    <>
      <h1 className="sr-only">New Post</h1>
      <PostEditor
        allTags={allTags}
        action={createPost}
        cancelHref={`/@${profile.username}`}
        submitLabel="Publish"
      />
    </>
  );
}
