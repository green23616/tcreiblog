import Image from "next/image";
import { notFound } from "next/navigation";
import { MetaLabel } from "@/components/meta-label";
import { PostCard } from "@/components/post-card";
import { getPostsByAuthor } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const result = await getPostsByAuthor(supabase, username);

  if (!result) {
    notFound();
  }

  const { profile, posts } = result;
  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase() || "U";

  return (
    <main className="mx-auto max-w-layout px-4 py-12 md:px-8">
      <header className="mb-12 border-b border-border pb-8">
        <div className="flex items-start gap-4 md:gap-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              width={64}
              height={64}
              unoptimized
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xl text-primary-foreground">
              {initial}
            </div>
          )}

          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-black tracking-display md:text-3xl">
              {profile.display_name || profile.username}
            </h1>
            {profile.bio ? <p className="text-sm text-muted-foreground">{profile.bio}</p> : null}
            {profile.website_url ? (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
              >
                {profile.website_url.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <MetaLabel>{posts.length} posts</MetaLabel>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <MetaLabel>No posts yet.</MetaLabel>
        </div>
      ) : (
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
                authorUsername={profile.username}
                publishedAt={post.published_at}
                tags={tags}
                showAuthor={false}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
