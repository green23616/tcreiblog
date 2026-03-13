import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MetaLabel } from "@/components/meta-label";
import { TagPill } from "@/components/tag-pill";
import { getPost } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface PostPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { username, slug } = await params;
  const supabase = await createClient();
  const result = await getPost(supabase, username, slug);

  if (!result) {
    notFound();
  }

  const { post, profile } = result;
  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const tags = post.post_tags
    .map((postTag) => postTag.tags?.name ?? "")
    .filter((tag): tag is string => Boolean(tag));
  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-layout px-4 py-12 md:px-8">
      <div className="lg:grid lg:grid-cols-layout lg:gap-8">
        <aside className="mb-8 space-y-6 lg:sticky lg:top-20 lg:mb-0 lg:self-start">
          <div className="space-y-1">
            <MetaLabel>Published</MetaLabel>
            <p className="text-sm text-foreground">{formattedDate}</p>
          </div>

          <div className="space-y-1">
            <MetaLabel>Author</MetaLabel>
            <Link
              href={`/@${profile.username}`}
              className="text-sm text-foreground transition-colors hover:text-muted-foreground"
            >
              @{profile.username}
            </Link>
          </div>

          {tags.length > 0 ? (
            <div className="space-y-2">
              <MetaLabel>Tags</MetaLabel>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-1">
            <MetaLabel>Reading Time</MetaLabel>
            <p className="text-sm text-foreground">{readingTime} min read</p>
          </div>
        </aside>

        <article className="prose max-w-reading">
          <h1 className="not-prose mb-8 text-3xl font-black tracking-display">
            {post.title}
          </h1>
          <MarkdownRenderer content={post.content} />
        </article>
      </div>
    </main>
  );
}
