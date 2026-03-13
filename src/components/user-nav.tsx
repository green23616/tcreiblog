import Link from "next/link";

interface UserNavProps {
  avatarCharacter: string;
  isLoggedIn: boolean;
}

export function UserNav({ avatarCharacter, isLoggedIn }: UserNavProps) {
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs uppercase text-primary-foreground">
        {avatarCharacter}
      </div>
      <Link
        href="/write"
        className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Write
      </Link>
    </div>
  );
}
