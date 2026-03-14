import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    username = typeof profile?.username === "string" ? profile.username : "";
  }

  const displayName =
    typeof user?.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "";
  const avatarCharacter = (username || user?.email || displayName || "u")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-layout items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-mono text-sm font-bold uppercase tracking-label">
          tcrei
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/tags"
            className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Tags
          </Link>
          <UserNav avatarCharacter={avatarCharacter} isLoggedIn={Boolean(user)} />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav isLoggedIn={Boolean(user)} username={username} />
        </div>
      </div>
    </header>
  );
}
