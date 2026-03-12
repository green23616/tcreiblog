import Link from "next/link";
import { MetaLabel } from "@/components/meta-label";
import { TagPill } from "@/components/tag-pill";

export interface PostCardProps {
  title: string;
  excerpt: string;
  slug: string;
  authorUsername: string;
  publishedAt: string;
  tags: string[];
  showAuthor?: boolean;
}

export function PostCard({
  title,
  excerpt,
  slug,
  authorUsername,
  publishedAt,
  tags,
  showAuthor = false,
}: PostCardProps) {
  const postUrl = `/@${authorUsername}/${slug}`;

  return (
    <article className="space-y-2 border-t border-border pt-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagPill key={`${slug}-${tag}`} tag={tag} />
          ))}
        </div>
        <MetaLabel className="shrink-0 text-right">{publishedAt}</MetaLabel>
      </div>
      <h2>
        <Link
          href={postUrl}
          className="text-xl font-bold tracking-display hover:text-muted-foreground transition-colors"
        >
          {title}
        </Link>
      </h2>
      <p className="max-w-reading text-sm text-muted-foreground">{excerpt}</p>
      {showAuthor ? <MetaLabel>@{authorUsername}</MetaLabel> : null}
    </article>
  );
}
