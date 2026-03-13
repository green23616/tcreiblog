import Link from "next/link";
import { MetaLabel } from "@/components/meta-label";
import { PostCard } from "@/components/post-card";
import { getRecentPosts } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface HomePageProps {
  searchParams: Promise<{ before?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { before } = await searchParams;
  const supabase = await createClient();
  const { posts, hasMore } = await getRecentPosts(supabase, {
    before,
    limit: 20,
  });
  const oldestPost = posts[posts.length - 1];

  return (
    <main className="mx-auto max-w-layout px-4 py-12 md:px-8">
      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <MetaLabel>No posts yet.</MetaLabel>
        </div>
      ) : (
        <>
          <div>
            {posts.map((post) => {
              const tags = post.post_tags
                .map((postTag) => postTag.tags?.name ?? "")
                .filter((tag): tag is string => Boolean(tag));

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

          <div className="mt-12 flex justify-between border-t border-border pt-6">
            {before ? (
              <Link
                href="/"
                className="text-xs uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
              >
                Newer
              </Link>
            ) : (
              <span />
            )}
            {hasMore && oldestPost ? (
              <Link
                href={`/?before=${encodeURIComponent(oldestPost.published_at)}`}
                className="text-xs uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
              >
                Older
              </Link>
            ) : (
              <span />
            )}
          </div>
        </>
      )}
    </main>
  );
}
