import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function UserNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : null;
  const avatarCharacter = (user.email ?? displayName ?? "u").charAt(0) || "u";

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs uppercase text-primary-foreground">
        {avatarCharacter}
      </div>
      <Link
        href="/write"
        className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
      >
        Write
      </Link>
    </div>
  );
}
