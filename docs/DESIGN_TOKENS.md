# Design Tokens — tcrei-blog

> Approach C: Shadcn-first with blog extensions.
> Extracted from ref1.jpg (Motion Music) + ref2.jpg (RSC/NASA), corrected per review.md findings.

## Table of Contents

- [globals.css — CSS Variable Layer](#globalscss--css-variable-layer)
  - [Base Layer Rules](#base-layer-rules)
- [tailwind.config.ts](#tailwindconfigts)
- [Component Usage Quick Reference](#component-usage-quick-reference)

---

## globals.css — CSS Variable Layer

```css
@layer base {
  :root {
    /* ── Shadcn Core Tokens (HSL without hsl() wrapper) ── */
    --background: 240 5% 96%;          /* #F4F4F5 — Zinc 100 */
    --foreground: 240 6% 3%;           /* #09090B — Zinc 950 */

    --card: 0 0% 100%;                 /* #FFFFFF — Zinc 0 */
    --card-foreground: 240 6% 3%;      /* #09090B */

    --popover: 0 0% 100%;
    --popover-foreground: 240 6% 3%;

    --primary: 240 6% 3%;              /* #09090B */
    --primary-foreground: 0 0% 100%;   /* #FFFFFF */

    --secondary: 240 5% 90%;           /* #E4E4E7 — Zinc 200 */
    --secondary-foreground: 240 6% 3%;

    --muted: 240 5% 96%;               /* #F4F4F5 — Zinc 100 */
    --muted-foreground: 240 4% 46%;    /* #71717A — Zinc 500 (4.4:1 contrast ✓) */

    --accent: 240 5% 90%;              /* #E4E4E7 — hover bg */
    --accent-foreground: 240 6% 3%;

    --destructive: 0 84% 60%;          /* #EF4444 */
    --destructive-foreground: 0 0% 100%;

    --border: 240 6% 90%;              /* #E4E4E7 — Zinc 200, hairlines */
    --input: 240 6% 90%;
    --ring: 240 6% 3%;                 /* #09090B — focus ring */

    --radius: 0rem;                    /* Sharp corners globally (rounded-full stays 9999px) */

    /* ── Blog Extensions ── */
    --border-strong: 240 6% 3%;        /* #09090B — active nav, prominent dividers */
    --border-active-width: 2px;        /* Nav active underline */

    --reading-width: 65ch;
    --sidebar-width: 280px;
    --layout-max: 1280px;

    --tracking-label: 0.1em;           /* ALL-CAPS metadata labels */
    --tracking-display: -0.02em;       /* Display headings */
  }

  .dark {
    --background: 240 6% 3%;           /* #09090B — Zinc 950 */
    --foreground: 0 0% 98%;            /* #FAFAFA — Zinc 50 */

    --card: 240 4% 10%;                /* #18181B — Zinc 900 */
    --card-foreground: 0 0% 98%;

    --popover: 240 4% 10%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 0% 98%;               /* #FAFAFA */
    --primary-foreground: 240 6% 3%;   /* #09090B */

    --secondary: 240 4% 16%;           /* #27272A — Zinc 800 */
    --secondary-foreground: 0 0% 98%;

    --muted: 240 4% 16%;               /* #27272A */
    --muted-foreground: 240 5% 65%;    /* #A1A1AA — Zinc 400 (7.8:1 contrast ✓) */

    --accent: 240 4% 16%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 4% 16%;              /* #27272A — Zinc 800 */
    --input: 240 4% 16%;
    --ring: 0 0% 98%;

    /* Blog Extensions (dark overrides) */
    --border-strong: 0 0% 98%;         /* #FAFAFA */
  }
}
```

### Base Layer Rules

Add these after the CSS variables in `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      fhd: "1440px",
      qhd: "2560px",
      uhd: "3840px",
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        label: "var(--tracking-label)",     // 0.1em — metadata labels
        display: "var(--tracking-display)", // -0.02em — display headings
      },
      fontWeight: {
        black: "900", // Ref 2 "STS-63 LAUNCH" level headings
      },
      gridTemplateColumns: {
        layout: "var(--sidebar-width) 1fr",
      },
      maxWidth: {
        reading: "var(--reading-width)",
        layout: "var(--layout-max)",
      },
      borderWidth: {
        active: "var(--border-active-width)", // 2px nav underline
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-links": "hsl(var(--foreground))",
            "--tw-prose-bold": "hsl(var(--foreground))",
            "--tw-prose-code": "hsl(var(--foreground))",
            "--tw-prose-pre-bg": "hsl(var(--card))",
            "--tw-prose-pre-code": "hsl(var(--foreground))",
            "--tw-prose-borders": "hsl(var(--border))",
            "--tw-prose-hr": "hsl(var(--border))",
            maxWidth: "var(--reading-width)",
            code: {
              fontFamily: "Geist Mono, JetBrains Mono, monospace",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
```

## Component Usage Quick Reference

```tsx
{/* Metadata label (Ref 2: "TARGET", "PUBLISHED") */}
<span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
  PUBLISHED
</span>

{/* Display heading (Ref 2: "STS-63 LAUNCH") */}
<h1 className="text-4xl font-black tracking-display">
  Building Type-Safe APIs
</h1>

{/* Post card separator */}
<div className="border-t border-border" />

{/* Active nav underline */}
<a className="border-b-active border-border-strong text-foreground">
  Posts
</a>

{/* Inactive nav */}
<a className="text-muted-foreground hover:text-foreground transition-colors">
  Tags
</a>

{/* Post detail: 2-column layout */}
<div className="lg:grid lg:grid-cols-layout lg:gap-8">
  <aside>{/* metadata sidebar */}</aside>
  <article className="prose max-w-reading">{/* markdown */}</article>
</div>

{/* Tag pill */}
<span className="border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors">
  NEXT-JS
</span>

{/* Page container */}
<div className="mx-auto max-w-layout px-4 md:px-8">
  {children}
</div>
```
