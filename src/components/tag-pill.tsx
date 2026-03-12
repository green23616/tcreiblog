import Link from "next/link";
import { cn } from "@/lib/utils";

interface TagPillProps {
  tag: string;
  className?: string;
}

export function TagPill({ tag, className }: TagPillProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className={cn(
        "border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
        className
      )}
    >
      {tag}
    </Link>
  );
}
