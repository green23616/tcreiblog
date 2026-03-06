# Design Tokens — codeshelf-nextjs
> Approach C: Shadcn-first with blog extensions.
> Extracted from ref1.jpg (Motion Music) + ref2.jpg (RSC/NASA), corrected per review.md findings.

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

## Design Token TypeScript Reference

```typescript
/**
 * ============================================================================
 * MASTER DESIGN TOKENS — codeshelf-nextjs
 * ============================================================================
 * AI INSTRUCTION:
 * Use Shadcn semantic classes: bg-background, text-foreground, bg-card,
 * text-muted-foreground, border-border, etc.
 * Use blog extension classes for layout: max-w-reading, max-w-layout,
 * grid-cols-layout, tracking-label, tracking-display, font-black.
 * Do NOT use raw hex codes. Do NOT use zinc-* palette names.
 */

// ── Types ──
export type ThemeMode = "light" | "dark";
export type Breakpoint = "sm" | "md" | "lg" | "fhd" | "qhd" | "uhd";

// ── Primitive Palette (reference only — use CSS vars in components) ──
const palette = {
  zinc: {
    0:   "#FFFFFF",
    50:  "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },
} as const;

// ── Semantic Mapping (documents which primitives map to which Shadcn vars) ──
export const themeMap = {
  light: {
    "--background":           palette.zinc[100],
    "--foreground":           palette.zinc[950],
    "--card":                 palette.zinc[0],
    "--card-foreground":      palette.zinc[950],
    "--primary":              palette.zinc[950],
    "--primary-foreground":   palette.zinc[0],
    "--secondary":            palette.zinc[200],
    "--secondary-foreground": palette.zinc[950],
    "--muted":                palette.zinc[100],
    "--muted-foreground":     palette.zinc[500],  // 4.4:1 contrast ✓
    "--accent":               palette.zinc[200],
    "--accent-foreground":    palette.zinc[950],
    "--border":               palette.zinc[200],
    "--border-strong":        palette.zinc[950],
    "--input":                palette.zinc[200],
    "--ring":                 palette.zinc[950],
  },
  dark: {
    "--background":           palette.zinc[950],
    "--foreground":           palette.zinc[50],
    "--card":                 palette.zinc[900],
    "--card-foreground":      palette.zinc[50],
    "--primary":              palette.zinc[50],
    "--primary-foreground":   palette.zinc[950],
    "--secondary":            palette.zinc[800],
    "--secondary-foreground": palette.zinc[50],
    "--muted":                palette.zinc[800],
    "--muted-foreground":     palette.zinc[400],  // 7.8:1 contrast ✓
    "--accent":               palette.zinc[800],
    "--accent-foreground":    palette.zinc[50],
    "--border":               palette.zinc[800],
    "--border-strong":        palette.zinc[50],
    "--input":                palette.zinc[800],
    "--ring":                 palette.zinc[50],
  },
} as const;

// ── Layout Constants ──
export const layout = {
  maxWidth:     "1280px",
  sidebarWidth: "280px",
  readingWidth: "65ch",
  gridGap:      "2rem",
} as const;

// ── Spacing (8px baseline grid) ──
export const spacing = {
  xs:   "0.25rem",  //  4px
  sm:   "0.5rem",   //  8px
  md:   "1rem",     // 16px
  lg:   "1.5rem",   // 24px
  xl:   "2rem",     // 32px
  "2xl": "3rem",    // 48px
  "3xl": "4rem",    // 64px
  "4xl": "6rem",    // 96px
  "5xl": "8rem",    // 128px
} as const;

// ── Typography ──
export const typography = {
  fonts: {
    sans: "Geist, Inter, system-ui, sans-serif",
    mono: "Geist Mono, JetBrains Mono, monospace",
  },
  weights: {
    normal:    "400",
    medium:    "500",
    semibold:  "600",
    bold:      "700",
    extrabold: "800",
    black:     "900",  // Ref 2 display headings
  },
} as const;

// ── Breakpoints ──
export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  fhd: "1440px",
  qhd: "2560px",
  uhd: "3840px",
} as const;
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
