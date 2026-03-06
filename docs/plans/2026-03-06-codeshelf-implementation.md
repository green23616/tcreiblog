# CodeShelf Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a developer blog platform for ~10 authors with OAuth auth, markdown posts, tags, and a monochrome Shadcn-based design system.

**Architecture:** Next.js 16 App Router with Server Components for all public pages, Client Components only for editor/toggles. Supabase handles auth (Google/GitHub OAuth), PostgreSQL database with RLS, and file storage. No API routes — Server Actions for mutations.

**Tech Stack:** Next.js 16, React 19, Supabase SSR, Tailwind CSS 3.4, Shadcn/ui, Geist fonts, EasyMDE, react-markdown, Playwright, pnpm

**Design docs:**
- `docs/plans/2026-03-06-codeshelf-blog-design.md` — full design spec
- `docs/DESIGN_TOKENS.md` — CSS variables, Tailwind config, component usage reference

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

**Step 1: Initialize project**

```bash
cd /Users/jwk/Documents/workspace2
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack
```

Accept defaults. If prompted about overwriting, accept (CLAUDE.md will be preserved by git).

**Step 2: Install all dependencies**

```bash
pnpm add @supabase/ssr@^0.5.0 @supabase/supabase-js@^2.45.0 class-variance-authority@^0.7.0 clsx@^2.1.0 date-fns@^4.1.0 easymde@^2.20.0 highlight.js@^11.11.1 lucide-react@^0.460.0 react-markdown@^9.0.0 react-simplemde-editor@^5.2.0 rehype-highlight@^7.0.0 rehype-sanitize@^6.0.0 remark-gfm@^4.0.0 slugify@^1.6.6 tailwind-merge@^2.5.0 zod@^3.23.0
```

```bash
pnpm add -D @tailwindcss/typography@^0.5.19 @playwright/test@^1.58.2
```

**Step 3: Install Geist font**

```bash
pnpm add geist
```

**Step 4: Verify it builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with dependencies"
```

---

### Task 2: Configure Design Tokens + Tailwind

**Files:**
- Modify: `tailwind.config.ts` (replace entirely)
- Modify: `src/app/globals.css` (replace entirely)
- Modify: `src/app/layout.tsx` (add Geist font)

**Step 1: Replace `tailwind.config.ts`**

Copy the full Tailwind config from `docs/DESIGN_TOKENS.md` section "tailwind.config.ts". Ensure it includes:
- Custom screens: `sm`, `md`, `lg`, `fhd`, `qhd`, `uhd`
- Shadcn color mappings using `hsl(var(--...))` pattern
- `fontFamily.sans` → Geist, `fontFamily.mono` → Geist Mono
- `fontWeight.black: "900"`
- `letterSpacing.label` and `letterSpacing.display`
- `gridTemplateColumns.layout`, `maxWidth.reading`, `maxWidth.layout`
- `borderWidth.active`
- `@tailwindcss/typography` plugin with prose overrides

**Step 2: Replace `src/app/globals.css`**

Copy the full CSS variable block from `docs/DESIGN_TOKENS.md` section "globals.css — CSS Variable Layer". Must include:
- `:root` block with all Shadcn tokens + blog extensions
- `.dark` block with dark mode overrides
- `@tailwind base; @tailwind components; @tailwind utilities;` at top
- Base styles:

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 3: Configure Geist font in layout.tsx**

```tsx
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata = {
  title: "CodeShelf",
  description: "Developer blog platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
```

**Step 4: Create a test page to verify tokens**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="mx-auto max-w-layout px-4 py-16">
      <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
        DESIGN TOKEN TEST
      </span>
      <h1 className="mt-2 text-4xl font-black tracking-display">
        CodeShelf
      </h1>
      <p className="mt-4 text-muted-foreground">
        If you can read this with correct styling, tokens are working.
      </p>
      <div className="mt-8 border-t border-border pt-8">
        <span className="border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
          TAG-TEST
        </span>
      </div>
    </div>
  );
}
```

**Step 5: Verify build + dev server**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

**Step 6: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: configure design tokens, Tailwind, and Geist fonts"
```

---

### Task 3: Initialize Shadcn/ui

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx` (first component to verify)

**Step 1: Initialize Shadcn**

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Zinc
- CSS variables: Yes
- CSS file: `src/app/globals.css` (it should detect the existing vars — do NOT let it overwrite your globals.css)
- Tailwind config: `tailwind.config.ts`
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

**Important:** After init, verify `src/app/globals.css` still contains your custom CSS variables from Task 2. If Shadcn overwrote them, restore from `docs/DESIGN_TOKENS.md`.

**Step 2: Add base components**

```bash
pnpm dlx shadcn@latest add button input textarea label separator
```

**Step 3: Verify button renders with sharp corners**

Update `src/app/page.tsx` — add below the existing content:

```tsx
import { Button } from "@/components/ui/button";
// ...inside component:
<Button className="mt-4">Sharp Corners Button</Button>
```

**Step 4: Build to verify**

```bash
pnpm build
```

Expected: Passes. Button should have 0 border-radius per `--radius: 0rem`.

**Step 5: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui/
git commit -m "feat: initialize Shadcn/ui with base components"
```

---

### Task 4: Supabase Schema + RLS

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`

**Step 1: Create migration file**

```bash
mkdir -p supabase/migrations
```

**Step 2: Write the schema**

```sql
-- supabase/migrations/00001_initial_schema.sql

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
  ),
  display_name text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  website_url text not null default '',
  created_at timestamptz not null default now()
);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  content text not null default '',
  excerpt text not null default '',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, slug)
);

create index posts_author_id_idx on public.posts(author_id);
create index posts_published_at_idx on public.posts(published_at desc);

-- Tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name ~ '^[a-z0-9-]+$')
);

-- Post-Tags junction
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index post_tags_tag_id_idx on public.post_tags(tag_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

-- Profiles: anyone reads, owner updates
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Posts: anyone reads, author CRUDs own
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

-- Tags: anyone reads, authenticated inserts
create policy "tags_select" on public.tags for select using (true);
create policy "tags_insert" on public.tags for insert with check (auth.uid() is not null);

-- Post-Tags: anyone reads, post author manages
create policy "post_tags_select" on public.post_tags for select using (true);
create policy "post_tags_insert" on public.post_tags for insert
  with check (
    exists (select 1 from public.posts where id = post_id and author_id = auth.uid())
  );
create policy "post_tags_delete" on public.post_tags for delete
  using (
    exists (select 1 from public.posts where id = post_id and author_id = auth.uid())
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'user_name',
      'user-' || substr(new.id::text, 1, 8)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      ''
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.update_updated_at();
```

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema, RLS policies, and triggers"
```

**Note:** Apply this migration to your Supabase project via the dashboard SQL editor or `supabase db push` if using CLI.

---

### Task 5: Supabase Client Helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `.env.local` (not committed)

**Step 1: Create `.env.local`**

```bash
touch .env.local
```

Add (fill in real values from Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Verify `.env.local` is in `.gitignore`.

**Step 2: Server client (for Server Components + Server Actions)**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignored
          }
        },
      },
    }
  );
}
```

**Step 3: Browser client (for Client Components)**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 4: Middleware helper**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

**Step 5: Create root middleware**

```typescript
// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = ["/write", "/edit", "/settings"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return Response.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 6: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: add Supabase client helpers and auth middleware"
```

---

## Phase 2: Auth

### Task 6: Login Page + OAuth

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`

**Step 1: Login page**

```tsx
// src/app/login/page.tsx
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Sign in to CodeShelf</h1>
      <p className="mt-2 text-muted-foreground">Continue with your account</p>
      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
```

**Step 2: Login form (Client Component)**

```tsx
// src/app/login/login-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Github } from "lucide-react";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const supabase = createClient();

  const signIn = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${
          redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
        }`,
      },
    });
  };

  return (
    <div className="mt-8 flex w-full flex-col gap-3">
      <Button variant="outline" className="w-full" onClick={() => signIn("github")}>
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      <Button variant="outline" className="w-full" onClick={() => signIn("google")}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
```

**Step 3: Auth callback route**

```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
```

**Step 4: Build to verify**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add src/app/login/ src/app/auth/
git commit -m "feat: add login page with Google/GitHub OAuth and callback"
```

---

## Phase 3: Shared Components

### Task 7: Layout Shell — Header, Nav, Container

**Files:**
- Create: `src/components/site-header.tsx`
- Create: `src/components/theme-toggle.tsx`
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/user-nav.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Install next-themes for dark mode**

```bash
pnpm add next-themes
```

**Step 2: Theme provider**

```tsx
// src/components/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**Step 3: Theme toggle**

```tsx
// src/components/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

**Step 4: User nav (shows avatar or login link)**

```tsx
// src/components/user-nav.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function UserNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Sign in
      </Link>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex items-center gap-3">
      <Link href="/write" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Write
      </Link>
      <Link href={`/@${profile?.username}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username || ""}
            className="h-7 w-7 rounded-full"
          />
        ) : (
          profile?.username
        )}
      </Link>
    </div>
  );
}
```

**Step 5: Site header**

```tsx
// src/components/site-header.tsx
import Link from "next/link";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-layout items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold uppercase tracking-label">
            CodeShelf
          </Link>
          <Link href="/tags" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tags
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <UserNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

**Step 6: Update root layout**

```tsx
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata = {
  title: "CodeShelf",
  description: "Developer blog platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main className="mx-auto max-w-layout px-4 py-8 md:px-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 7: Build to verify**

```bash
pnpm build
```

**Step 8: Commit**

```bash
git add src/components/ src/app/layout.tsx package.json pnpm-lock.yaml
git commit -m "feat: add site header, dark mode toggle, and user nav"
```

---

### Task 8: Shared UI Components — PostCard, MetaLabel, TagPill

**Files:**
- Create: `src/components/post-card.tsx`
- Create: `src/components/meta-label.tsx`
- Create: `src/components/tag-pill.tsx`

**Step 1: MetaLabel**

```tsx
// src/components/meta-label.tsx
export function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
      {children}
    </span>
  );
}
```

**Step 2: TagPill**

```tsx
// src/components/tag-pill.tsx
import Link from "next/link";

export function TagPill({ name }: { name: string }) {
  return (
    <Link
      href={`/tags/${name}`}
      className="border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
    >
      {name}
    </Link>
  );
}
```

**Step 3: PostCard**

```tsx
// src/components/post-card.tsx
import Link from "next/link";
import { format } from "date-fns";
import { TagPill } from "./tag-pill";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  authorUsername: string;
  tags: string[];
  showAuthor?: boolean;
}

export function PostCard({
  title,
  slug,
  excerpt,
  publishedAt,
  authorUsername,
  tags,
  showAuthor = true,
}: PostCardProps) {
  return (
    <article className="border-t border-border py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {tags.map((tag) => (
            <TagPill key={tag} name={tag} />
          ))}
        </div>
        <span className="text-xs font-medium uppercase tracking-label text-muted-foreground whitespace-nowrap">
          {format(new Date(publishedAt), "MMM d, yyyy")}
        </span>
      </div>
      <Link href={`/@${authorUsername}/${slug}`} className="group mt-3 block">
        <h2 className="text-xl font-bold group-hover:text-muted-foreground transition-colors">
          {title}
        </h2>
        <p className="mt-1 text-muted-foreground line-clamp-2">{excerpt}</p>
      </Link>
      {showAuthor && (
        <Link
          href={`/@${authorUsername}`}
          className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          @{authorUsername}
        </Link>
      )}
    </article>
  );
}
```

**Step 4: Build to verify**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add src/components/post-card.tsx src/components/meta-label.tsx src/components/tag-pill.tsx
git commit -m "feat: add PostCard, MetaLabel, and TagPill components"
```

---

## Phase 4: Public Pages

### Task 9: Homepage `/`

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/lib/queries.ts` (shared DB queries)

**Step 1: Create shared queries**

```typescript
// src/lib/queries.ts
import { createClient } from "@/lib/supabase/server";

export async function getRecentPosts(page = 1, perPage = 20) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, published_at,
      profiles!inner(username, display_name, avatar_url),
      post_tags(tags(name))
    `, { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);

  return {
    posts: data ?? [],
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function getPostsByAuthor(username: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, published_at,
      post_tags(tags(name))
    `)
    .eq("author_id", profile.id)
    .order("published_at", { ascending: false });

  return { profile, posts: posts ?? [] };
}

export async function getPost(username: string, slug: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, title, slug, content, excerpt, published_at, updated_at, author_id,
      post_tags(tags(name))
    `)
    .eq("author_id", profile.id)
    .eq("slug", slug)
    .single();

  if (!post) return null;

  return { profile, post };
}

export async function getPostsByTag(tagName: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, published_at,
      profiles!inner(username, display_name, avatar_url),
      post_tags!inner(tags!inner(name))
    `)
    .eq("post_tags.tags.name", tagName)
    .order("published_at", { ascending: false });

  return data ?? [];
}

export async function getAllTags() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tags")
    .select("name, post_tags(count)")
    .order("name");

  return data ?? [];
}
```

**Step 2: Homepage page**

```tsx
// src/app/page.tsx
import { getRecentPosts } from "@/lib/queries";
import { PostCard } from "@/components/post-card";
import { MetaLabel } from "@/components/meta-label";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { posts, total, perPage } = await getRecentPosts(page);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <MetaLabel>Recent Posts</MetaLabel>

      <div className="mt-4">
        {posts.map((post: any) => (
          <PostCard
            key={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            publishedAt={post.published_at}
            authorUsername={post.profiles.username}
            tags={post.post_tags?.map((pt: any) => pt.tags.name) ?? []}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          {page > 1 ? (
            <Link href={`/?page=${page - 1}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Older
            </Link>
          ) : <span />}
          {page < totalPages ? (
            <Link href={`/?page=${page + 1}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Newer →
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Build to verify**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add src/lib/queries.ts src/app/page.tsx
git commit -m "feat: add homepage with recent posts and pagination"
```

---

### Task 10: Author Page `/@[username]`

**Files:**
- Create: `src/app/@[username]/page.tsx` — **Note:** Next.js uses `(...)` for route groups. The `@` prefix in URLs requires a workaround. Use `src/app/[username]/page.tsx` with middleware or catch-all. Better approach: use `src/app/%40[username]/page.tsx` or handle via dynamic segment.

**Important:** Next.js doesn't natively support `@` prefix in route folders (it's reserved for parallel routes). Use `src/app/(public)/[username]/page.tsx` with a rewrite, or simpler: just use `/[username]` routing and check for `@` in the URL via middleware rewrite.

Simplest approach: use a catch-all at `src/app/[...slug]/page.tsx` or use Next.js rewrites.

**Recommended:** Use Next.js rewrites in `next.config.ts`:

```typescript
// next.config.ts — add rewrites
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/user/:username",
      },
      {
        source: "/@:username/:slug",
        destination: "/user/:username/:slug",
      },
    ];
  },
};
export default nextConfig;
```

Then create pages at `src/app/user/[username]/page.tsx` and `src/app/user/[username]/[slug]/page.tsx`.

**Step 1: Add rewrites to next.config.ts**

Add the rewrites above to `next.config.ts`.

**Step 2: Author page**

```tsx
// src/app/user/[username]/page.tsx
import { notFound } from "next/navigation";
import { getPostsByAuthor } from "@/lib/queries";
import { PostCard } from "@/components/post-card";
import { MetaLabel } from "@/components/meta-label";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPostsByAuthor(username);

  if (!data) notFound();

  const { profile, posts } = data;

  return (
    <div>
      {/* Author header */}
      <div className="flex items-start gap-4">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            className="h-16 w-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          {profile.bio && <p className="mt-1 text-muted-foreground">{profile.bio}</p>}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {profile.website_url.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Post list */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <MetaLabel>Posts</MetaLabel>
        <MetaLabel>{posts.length} total</MetaLabel>
      </div>

      {posts.map((post: any) => (
        <PostCard
          key={post.id}
          title={post.title}
          slug={post.slug}
          excerpt={post.excerpt}
          publishedAt={post.published_at}
          authorUsername={username}
          tags={post.post_tags?.map((pt: any) => pt.tags.name) ?? []}
          showAuthor={false}
        />
      ))}
    </div>
  );
}
```

**Step 3: Build and commit**

```bash
pnpm build
git add src/app/user/ next.config.ts
git commit -m "feat: add author page with profile header and post list"
```

---

### Task 11: Post Detail Page `/@[username]/[slug]`

**Files:**
- Create: `src/app/user/[username]/[slug]/page.tsx`
- Create: `src/components/markdown-renderer.tsx`

**Step 1: Markdown renderer**

```tsx
// src/components/markdown-renderer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-neutral dark:prose-invert max-w-reading"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSanitize]}
    >
      {content}
    </ReactMarkdown>
  );
}
```

**Step 2: Post detail page**

```tsx
// src/app/user/[username]/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getPost } from "@/lib/queries";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MetaLabel } from "@/components/meta-label";
import { TagPill } from "@/components/tag-pill";

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getPost(username, slug);

  if (!data) notFound();

  const { profile, post } = data;
  const tags = post.post_tags?.map((pt: any) => pt.tags.name) ?? [];
  const readingTime = estimateReadingTime(post.content);

  return (
    <div className="lg:grid lg:grid-cols-layout lg:gap-8">
      {/* Sidebar — metadata */}
      <aside className="mb-8 lg:mb-0">
        <div className="lg:sticky lg:top-8 space-y-6">
          <div>
            <MetaLabel>Published</MetaLabel>
            <p className="mt-1 text-sm">{format(new Date(post.published_at), "MMM d, yyyy")}</p>
          </div>
          <div>
            <MetaLabel>Author</MetaLabel>
            <Link
              href={`/@${profile.username}`}
              className="mt-1 flex items-center gap-2"
            >
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full" />
              )}
              <span className="text-sm hover:text-muted-foreground transition-colors">
                {profile.display_name || profile.username}
              </span>
            </Link>
          </div>
          {tags.length > 0 && (
            <div>
              <MetaLabel>Tags</MetaLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <TagPill key={tag} name={tag} />
                ))}
              </div>
            </div>
          )}
          <div>
            <MetaLabel>Reading Time</MetaLabel>
            <p className="mt-1 text-sm">{readingTime} min</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <article>
        <h1 className="text-4xl font-black tracking-display">{post.title}</h1>
        <div className="mt-8">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>
    </div>
  );
}
```

**Step 3: Build and commit**

```bash
pnpm build
git add src/app/user/[username]/[slug]/ src/components/markdown-renderer.tsx
git commit -m "feat: add post detail page with 2-column layout and markdown rendering"
```

---

### Task 12: Tags Pages

**Files:**
- Create: `src/app/tags/page.tsx` (tag index)
- Create: `src/app/tags/[tag]/page.tsx` (posts by tag)

**Step 1: Tag index — lists all tags**

```tsx
// src/app/tags/page.tsx
import { getAllTags } from "@/lib/queries";
import { MetaLabel } from "@/components/meta-label";
import Link from "next/link";

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div>
      <MetaLabel>All Tags</MetaLabel>
      <div className="mt-4 flex flex-wrap gap-3">
        {tags.map((tag: any) => (
          <Link
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="border border-border px-3 py-1.5 text-sm font-medium uppercase tracking-label text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          >
            {tag.name}
            <span className="ml-2 text-xs">({tag.post_tags?.[0]?.count ?? 0})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Posts by tag**

```tsx
// src/app/tags/[tag]/page.tsx
import { notFound } from "next/navigation";
import { getPostsByTag } from "@/lib/queries";
import { PostCard } from "@/components/post-card";
import { MetaLabel } from "@/components/meta-label";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <div>
      <MetaLabel>Tag</MetaLabel>
      <h1 className="mt-2 text-2xl font-bold uppercase">{tag}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{posts.length} posts</p>

      <div className="mt-6">
        {posts.map((post: any) => (
          <PostCard
            key={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            publishedAt={post.published_at}
            authorUsername={post.profiles.username}
            tags={post.post_tags?.map((pt: any) => pt.tags.name) ?? []}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Build and commit**

```bash
pnpm build
git add src/app/tags/
git commit -m "feat: add tag index and tag filter pages"
```

---

## Phase 5: Protected Pages

### Task 13: Write Page `/write`

**Files:**
- Create: `src/app/write/page.tsx`
- Create: `src/components/post-editor.tsx`
- Create: `src/components/tag-input.tsx`
- Create: `src/lib/actions.ts` (Server Actions)

**Step 1: Server Actions for post CRUD**

```typescript
// src/lib/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).max(5),
});

export async function createPost(formData: { title: string; content: string; tags: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = PostSchema.parse(formData);
  const slug = slugify(parsed.title, { lower: true, strict: true });
  const excerpt = parsed.content.replace(/[#*`\[\]]/g, "").slice(0, 160).trim();

  // Insert post
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: parsed.title,
      slug,
      content: parsed.content,
      excerpt,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Upsert tags and link
  for (const tagName of parsed.tags) {
    const name = tagName.toLowerCase().trim();
    if (!name) continue;

    const { data: tag } = await supabase
      .from("tags")
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single();

    if (tag) {
      await supabase.from("post_tags").insert({ post_id: post.id, tag_id: tag.id });
    }
  }

  // Get username for redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/");
  revalidatePath(`/@${profile?.username}`);
  redirect(`/@${profile?.username}/${slug}`);
}

export async function updatePost(
  postId: string,
  formData: { title: string; content: string; tags: string[] }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = PostSchema.parse(formData);
  const slug = slugify(parsed.title, { lower: true, strict: true });
  const excerpt = parsed.content.replace(/[#*`\[\]]/g, "").slice(0, 160).trim();

  const { error } = await supabase
    .from("posts")
    .update({ title: parsed.title, slug, content: parsed.content, excerpt })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) throw new Error(error.message);

  // Replace tags: delete existing, re-insert
  await supabase.from("post_tags").delete().eq("post_id", postId);

  for (const tagName of parsed.tags) {
    const name = tagName.toLowerCase().trim();
    if (!name) continue;

    const { data: tag } = await supabase
      .from("tags")
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single();

    if (tag) {
      await supabase.from("post_tags").insert({ post_id: postId, tag_id: tag.id });
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/");
  revalidatePath(`/@${profile?.username}`);
  revalidatePath(`/@${profile?.username}/${slug}`);
  redirect(`/@${profile?.username}/${slug}`);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);

  revalidatePath("/");
  revalidatePath(`/@${profile?.username}`);
  redirect(`/@${profile?.username}`);
}

export async function updateProfile(formData: {
  username: string;
  display_name: string;
  bio: string;
  website_url: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      username: formData.username.toLowerCase().trim(),
      display_name: formData.display_name,
      bio: formData.bio,
      website_url: formData.website_url,
      avatar_url: formData.avatar_url,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/@${formData.username}`);
  revalidatePath("/settings");
  redirect("/settings");
}
```

**Step 2: Tag input component**

```tsx
// src/components/tag-input.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}

export function TagInput({ value, onChange, max = 5 }: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("tags")
      .select("name")
      .ilike("name", `${input}%`)
      .limit(5)
      .then(({ data }) => setSuggestions(data?.map((t) => t.name) ?? []));
  }, [input]);

  const addTag = (tag: string) => {
    const name = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (name && !value.includes(name) && value.length < max) {
      onChange([...value, name]);
    }
    setInput("");
    setSuggestions([]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground"
          >
            {tag}
            <button onClick={() => onChange(value.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length < max && (
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(input);
              }
            }}
            placeholder="Add tag..."
            className="w-32 border-none bg-transparent px-0 text-xs uppercase tracking-label focus-visible:ring-0"
          />
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="mt-1 border border-border bg-card p-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="block w-full px-2 py-1 text-left text-xs uppercase tracking-label text-muted-foreground hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Post editor component**

```tsx
// src/components/post-editor.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/tag-input";
import { MetaLabel } from "@/components/meta-label";
import Link from "next/link";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

interface PostEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onSubmit: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  submitLabel: string;
}

export function PostEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  onSubmit,
  submitLabel,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ title, content, tags });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </Link>
        <Button onClick={handleSubmit} disabled={loading || !title.trim() || !content.trim()}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <MetaLabel>Title</MetaLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mt-2 text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <MetaLabel>Tags</MetaLabel>
          <div className="mt-2">
            <TagInput value={tags} onChange={setTags} />
          </div>
        </div>

        <div>
          <MetaLabel>Content</MetaLabel>
          <div className="mt-2">
            <SimpleMDE value={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Write page**

```tsx
// src/app/write/page.tsx
import { PostEditor } from "@/components/post-editor";
import { createPost } from "@/lib/actions";

export default function WritePage() {
  return (
    <PostEditor
      onSubmit={createPost}
      submitLabel="Publish"
    />
  );
}
```

**Step 5: Build and commit**

```bash
pnpm build
git add src/lib/actions.ts src/components/post-editor.tsx src/components/tag-input.tsx src/app/write/
git commit -m "feat: add write page with markdown editor, tag input, and server actions"
```

---

### Task 14: Edit Page `/edit/[id]`

**Files:**
- Create: `src/app/edit/[id]/page.tsx`

**Step 1: Edit page**

```tsx
// src/app/edit/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/post-editor";
import { updatePost, deletePost } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*, post_tags(tags(name))")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (!post) notFound();

  const tags = post.post_tags?.map((pt: any) => pt.tags.name) ?? [];

  const handleUpdate = async (data: { title: string; content: string; tags: string[] }) => {
    "use server";
    await updatePost(id, data);
  };

  const handleDelete = async () => {
    "use server";
    await deletePost(id);
  };

  return (
    <div>
      <PostEditor
        initialTitle={post.title}
        initialContent={post.content}
        initialTags={tags}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />
      <div className="mt-8 border-t border-border pt-6">
        <form action={handleDelete}>
          <Button variant="destructive" type="submit">
            Delete post
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Build and commit**

```bash
pnpm build
git add src/app/edit/
git commit -m "feat: add edit page with update and delete actions"
```

---

### Task 15: Settings Page `/settings`

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/settings-form.tsx`
- Create: `src/lib/actions.ts` — already has `updateProfile`

**Step 1: Settings form (Client Component)**

```tsx
// src/app/settings/settings-form.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MetaLabel } from "@/components/meta-label";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/lib/actions";

interface SettingsFormProps {
  profile: {
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string;
    website_url: string;
  };
  email: string;
  provider: string;
}

export function SettingsForm({ profile, email, provider }: SettingsFormProps) {
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-0">
      <MetaLabel>Account Settings</MetaLabel>

      <Separator className="my-6" />

      <div className="space-y-1">
        <MetaLabel>Avatar</MetaLabel>
        {form.avatar_url && (
          <img src={form.avatar_url} alt="" className="mt-2 h-16 w-16 rounded-full" />
        )}
        <p className="text-xs text-muted-foreground">Avatar is synced from your OAuth provider.</p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-1">
        <Label htmlFor="username"><MetaLabel>Username</MetaLabel></Label>
        <Input
          id="username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">codeshelf.app/@{form.username}</p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-1">
        <Label htmlFor="display_name"><MetaLabel>Display Name</MetaLabel></Label>
        <Input
          id="display_name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
      </div>

      <Separator className="my-6" />

      <div className="space-y-1">
        <Label htmlFor="bio"><MetaLabel>Bio</MetaLabel></Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
        />
      </div>

      <Separator className="my-6" />

      <div className="space-y-1">
        <Label htmlFor="website"><MetaLabel>Website</MetaLabel></Label>
        <Input
          id="website"
          value={form.website_url}
          onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          placeholder="https://"
        />
      </div>

      <Separator className="my-6" />

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>

      <Separator className="my-6" />

      <div className="space-y-1">
        <MetaLabel>Connected Account</MetaLabel>
        <p className="text-sm">
          {provider === "github" ? "GitHub" : "Google"} — {email}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Settings page (Server Component)**

```tsx
// src/app/settings/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <SettingsForm
      profile={{
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        website_url: profile.website_url,
      }}
      email={user.email ?? ""}
      provider={user.app_metadata?.provider ?? ""}
    />
  );
}
```

**Step 3: Build and commit**

```bash
pnpm build
git add src/app/settings/
git commit -m "feat: add settings page with profile form"
```

---

## Phase 6: Polish

### Task 16: Mobile Responsive Nav

**Files:**
- Modify: `src/components/site-header.tsx` (add mobile hamburger)
- Create: `src/components/mobile-nav.tsx`

**Step 1: Mobile nav component**

```tsx
// src/components/mobile-nav.tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileNav({ isLoggedIn, username }: { isLoggedIn: boolean; username?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b border-border bg-background p-4">
          <nav className="flex flex-col gap-3">
            <Link href="/tags" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Tags</Link>
            {isLoggedIn ? (
              <>
                <Link href="/write" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Write</Link>
                <Link href={`/@${username}`} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Profile</Link>
                <Link href="/settings" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Settings</Link>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update site-header.tsx**

Add `MobileNav` to header. Desktop links hidden on mobile (`hidden md:flex`), `MobileNav` hidden on desktop (`md:hidden`). Pass auth state from `UserNav` server component.

**Step 3: Build and commit**

```bash
pnpm build
git add src/components/mobile-nav.tsx src/components/site-header.tsx
git commit -m "feat: add responsive mobile navigation"
```

---

### Task 17: SEO Metadata

**Files:**
- Modify: `src/app/layout.tsx` (global metadata)
- Add `generateMetadata` to: `src/app/user/[username]/page.tsx`, `src/app/user/[username]/[slug]/page.tsx`

**Step 1: Add `generateMetadata` to post detail page**

```typescript
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string; slug: string }> }): Promise<Metadata> {
  const { username, slug } = await params;
  const data = await getPost(username, slug);
  if (!data) return {};

  return {
    title: `${data.post.title} — CodeShelf`,
    description: data.post.excerpt,
    openGraph: {
      title: data.post.title,
      description: data.post.excerpt,
      type: "article",
      authors: [data.profile.display_name || data.profile.username],
    },
  };
}
```

**Step 2: Add `generateMetadata` to author page**

```typescript
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const data = await getPostsByAuthor(username);
  if (!data) return {};

  return {
    title: `${data.profile.display_name || data.profile.username} — CodeShelf`,
    description: data.profile.bio || `Posts by ${data.profile.username}`,
  };
}
```

**Step 3: Build and commit**

```bash
pnpm build
git add src/app/user/ src/app/layout.tsx
git commit -m "feat: add SEO metadata to post and author pages"
```

---

### Task 18: E2E Tests with Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e-critical-flows.spec.ts`

**Step 1: Playwright config**

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

**Step 2: Critical flow tests**

```typescript
// tests/e2e-critical-flows.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=CodeShelf")).toBeVisible();
  });

  test("tags page loads", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.locator("text=All Tags")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Sign in to CodeShelf")).toBeVisible();
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/write");
    await expect(page).toHaveURL(/\/login/);
  });
});
```

**Step 3: Install Playwright browsers**

```bash
pnpm exec playwright install chromium
```

**Step 4: Run tests**

```bash
pnpm test:e2e
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "feat: add Playwright E2E tests for critical flows"
```

---

### Task 19: Update CLAUDE.md

**Files:**
- Modify: `/Users/jwk/Documents/workspace2/CLAUDE.md`

**Step 1: Update CLAUDE.md with project context**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CodeShelf — a developer blog platform. Next.js 16 App Router + Supabase + Tailwind + Shadcn/ui.

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — run ESLint
- `pnpm typecheck` — TypeScript check
- `pnpm test` — Playwright security tests
- `pnpm test:e2e` — Playwright E2E tests

## Architecture

- **Server Components** for all public pages (/, /@user, post detail, tags)
- **Client Components** only for: markdown editor, dark mode toggle, mobile nav, tag autocomplete
- **Server Actions** in `src/lib/actions.ts` for all mutations
- **Supabase RLS** enforces author-only writes — no middleware auth needed for data
- **Design tokens** in `docs/DESIGN_TOKENS.md` — Shadcn-first with blog extensions

## Key Paths

- `src/lib/supabase/` — Supabase client helpers (server.ts, client.ts, middleware.ts)
- `src/lib/queries.ts` — shared DB queries for Server Components
- `src/lib/actions.ts` — Server Actions for post/profile CRUD
- `src/components/` — shared components (post-card, tag-pill, meta-label, etc.)
- `supabase/migrations/` — database schema

## Design System

- Monochrome Zinc palette, no brand colors
- Use Shadcn semantic classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`
- Blog extensions: `tracking-label`, `tracking-display`, `font-black`, `max-w-reading`, `grid-cols-layout`
- Sharp corners globally (`--radius: 0rem`), `rounded-full` preserved for avatars
- No shadows — use borders for hierarchy
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with project context and architecture"
```

---

## Task Summary

| Phase | Task | Description |
|-------|------|-------------|
| 1 | 1 | Scaffold Next.js project + deps |
| 1 | 2 | Design tokens + Tailwind config |
| 1 | 3 | Shadcn/ui initialization |
| 1 | 4 | Supabase schema + RLS |
| 1 | 5 | Supabase client helpers + middleware |
| 2 | 6 | Login page + OAuth callback |
| 3 | 7 | Layout shell — header, nav, dark mode |
| 3 | 8 | PostCard, MetaLabel, TagPill |
| 4 | 9 | Homepage with pagination |
| 4 | 10 | Author page |
| 4 | 11 | Post detail with 2-col layout |
| 4 | 12 | Tags pages |
| 5 | 13 | Write page with editor |
| 5 | 14 | Edit page |
| 5 | 15 | Settings page |
| 6 | 16 | Mobile responsive nav |
| 6 | 17 | SEO metadata |
| 6 | 18 | E2E tests |
| 6 | 19 | Update CLAUDE.md |
