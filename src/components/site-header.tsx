import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-layout items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-mono text-sm font-bold uppercase tracking-label">
          tcrei
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/tags"
            className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground"
          >
            Tags
          </Link>
          <UserNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
