import { MetaLabel } from "@/components/meta-label";
import { PostCard } from "@/components/post-card";
import { getPostsByTag } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const supabase = await createClient();
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(supabase, decodedTag);

  return (
    <main className="mx-auto max-w-layout px-4 py-12 md:px-8">
      <h1 className="mb-8">
        <MetaLabel>Posts tagged</MetaLabel>
        <span className="ml-2 text-xs font-medium uppercase tracking-label text-foreground">
          {decodedTag}
        </span>
      </h1>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <MetaLabel>No posts with this tag.</MetaLabel>
        </div>
      ) : (
        <div>
          {posts.map((post) => {
            const tags = post.post_tags
              .map((postTag) => postTag.tags?.name ?? "")
              .filter((value): value is string => Boolean(value));

            return (
              <PostCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt}
                slug={post.slug}
                authorUsername={post.profiles?.username ?? ""}
                publishedAt={post.published_at}
                tags={tags}
                showAuthor
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
