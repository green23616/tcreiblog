# Issues & Solutions — Phase 1 (Tasks 1–5)

## Summary
Phase 1 (Foundation) encountered 8 key issues spanning scaffolding, styling, component initialization, and authentication setup. All were resolved with targeted workarounds and configuration adjustments.

---

## Issue 1: `create-next-app` Conflicts with Existing Files

**Problem:**
`pnpm create next-app@latest . --use-pnpm` refused to scaffold into the project root because existing files (`.claude/`, `.omc/`, `CLAUDE.md`, `supabase/`) weren't on the CLI's safe-list.

```
The directory tcrei-a contains files that could conflict:
  .claude/
  .omc/
  CLAUDE.md
  supabase/
```

**Root Cause:**
`create-next-app` has a hardcoded whitelist of "safe" files (`.git`, `.gitignore`, `README.md`, `LICENSE`, etc.). Any unlisted files trigger a safety check to prevent overwriting existing work.

**Solution:**
Scaffold into a sibling temp directory, then copy all Next.js files into the project:
```bash
pnpm create next-app@latest ../tcrei-tmp --use-pnpm --typescript --eslint --app --src-dir --import-alias "@/*" --no-git
cp -r ../tcrei-tmp/. .
rm -rf ../tcrei-tmp
```

**Learning:**
When scaffolding into an existing repo with non-standard files, use a temp directory as an intermediary.

---

## Issue 2: Package Name Incorrect (`tcrei-tmp`)

**Problem:**
After scaffolding from `../tcrei-tmp`, `package.json` had `"name": "tcrei-tmp"` instead of `"name": "tcrei-a"`.

**Root Cause:**
`create-next-app` names the project after the directory passed to it (the temp directory).

**Solution:**
Manually edited `package.json`:
```json
"name": "tcrei-a"
```

**Learning:**
Post-scaffold, always verify package metadata matches your project.

---

## Issue 3: Missing CSS Module Causes Build Failure

**Problem:**
`src/app/page.tsx` imported a deleted CSS module:
```typescript
import styles from "./page.module.css";  // ❌ File doesn't exist
```

Build error:
```
Module not found: Can't resolve './page.module.css'
```

**Root Cause:**
We deleted `page.module.css` (unneeded for a Tailwind-based design), but the scaffold template still referenced it.

**Solution:**
Replaced `page.tsx` with a minimal Tailwind-based placeholder:
```typescript
export default function Home() {
  return (
    <main className="mx-auto max-w-layout px-4 md:px-8 py-8">
      <h1 className="text-4xl font-black tracking-display">tcrei blog</h1>
    </main>
  );
}
```

**Learning:**
Always remove unused imports when deleting files, or create minimal placeholders.

---

## Issue 4: Shadcn v4 Default Style Uses `@base-ui/react` Instead of Radix UI

**Problem:**
`pnpm dlx shadcn@latest init --defaults` installed Shadcn v4 with "base-nova" style, which uses `@base-ui/react` instead of the preferred Radix UI primitives.

**Root Cause:**
Shadcn v4 switched from Radix UI to `@base-ui/react` as its default component library. The `--defaults` flag selects the "base-nova" preset by default.

**Solution:**
Reinitialize with the Radix UI base:
```bash
rm -rf src/components/ui components.json
pnpm remove @base-ui/react shadcn
pnpm dlx shadcn@latest init --base radix --defaults
```

This installs the "radix-nova" style, which uses Radix UI primitives (`radix-ui` package) instead of `@base-ui/react`.

**Learning:**
For Shadcn v4, use `--base radix` to get Radix UI. The `--style` flag doesn't exist — the available options are `--base {radix|base}`.

---

## Issue 5: `--style` Flag Doesn't Exist in Shadcn v4

**Problem:**
Attempted `pnpm dlx shadcn@latest init --style default --defaults` failed:
```
error: unknown option '--style'
```

**Root Cause:**
Shadcn v4's CLI changed; `--style` was removed in favor of `--base` and `--preset`.

**Solution:**
Use `--base radix` instead:
```bash
pnpm dlx shadcn@latest init --base radix --defaults
```

**Learning:**
Check `pnpm dlx shadcn@latest init --help` to see current available flags.

---

## Issue 6: Shadcn Init Overwrites `globals.css` with Incompatible Tokens

**Problem:**
Every `shadcn init` run overwrote `src/app/globals.css` with:
1. oklch color format instead of HSL
2. `@import "tw-animate-css"` and `@import "shadcn/tailwind.css"` (Tailwind v4 CSS imports)
3. `--radius: 0.625rem` instead of `0rem`

**Root Cause:**
Shadcn init is designed to write a complete CSS setup. It doesn't merge with existing configs; it overwrites them.

**Solution:**
After each `shadcn init`, restore `globals.css` with our HSL design tokens from `DESIGN_TOKENS.md`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 5% 96%;
    --foreground: 240 6% 3%;
    /* ... more HSL tokens ... */
    --radius: 0rem;
    --radius-md: 0rem;
    --radius-lg: 0rem;
    /* ... */
  }
  /* ... dark mode overrides ... */
}
```

**Learning:**
After `shadcn init`, always restore your design tokens and remove incompatible CSS imports.

---

## Issue 7: `@import "tw-animate-css"` and `@import "shadcn/tailwind.css"` Unresolvable

**Problem:**
Build failed with module resolution errors:
```
Module not found: Can't resolve 'shadcn/tailwind.css'
Module not found: Can't resolve 'tw-animate-css'
```

**Root Cause:**
Shadcn v4 includes these imports for Tailwind v4 CSS-first configuration. They don't work with Tailwind v3 + Turbopack, which can't resolve npm package CSS imports in `@import` statements.

**Solution:**
Remove both import lines from `globals.css`. Our Tailwind v3 + `@tailwind base/components/utilities` directives handle everything needed:
```css
/* Remove these: */
/* @import "tw-animate-css"; */
/* @import "shadcn/tailwind.css"; */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Learning:**
When using Tailwind v3, skip Tailwind v4-specific CSS imports. The base `@tailwind` directives are sufficient.

---

## Issue 8: Button Uses `rounded-lg` Hardcoded — Ignores `--radius: 0rem`

**Problem:**
Despite setting `--radius: 0rem` in CSS variables, the Shadcn button component used `rounded-lg` (hardcoded to `border-radius: 0.5rem`), ignoring the design token.

```typescript
// button.tsx
const buttonVariants = cva(
  "... rounded-lg ... rounded-[min(var(--radius-md),10px)] ...",
  // ...
);
```

**Root Cause:**
- Base class `rounded-lg` is hardcoded in the component's CVA (class-variance-authority)
- Smaller sizes use `--radius-md` CSS variable, but default size uses the hardcoded Tailwind class

**Solution:**
Override all `borderRadius` values in `tailwind.config.ts` to map to CSS variables (which are set to `0rem`):
```typescript
borderRadius: {
  none: "0px",
  sm: "var(--radius-sm)",
  DEFAULT: "var(--radius)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-xl)",
  "3xl": "var(--radius-xl)",
  full: "9999px",
}
```

This ensures all Tailwind `rounded-*` classes respect the design token, not hardcoded values.

**Learning:**
For consistent design enforcement, map Tailwind utilities to CSS variables in the config. This keeps the component system flexible and design-token-driven.

---

## Summary of Key Learnings

| Issue | Key Takeaway |
|-------|--------------|
| Scaffolding conflicts | Use temp directory for `create-next-app` into existing repos |
| Package naming | Verify post-scaffold; use temp dir names wisely |
| CSS modules | Remove unused imports; use Tailwind-based placeholders |
| Shadcn style selection | Use `--base radix`, not `--style default` (v4 CLI changed) |
| CSS imports | Remove Tailwind v4 CSS imports when using v3 |
| Design tokens | Restore after each Shadcn init; don't let CLI overwrite |
| Border radius | Map all `borderRadius` to CSS variables for consistent enforcement |

---

## Prevention Strategy for Phase 2+

1. **After `shadcn init`:** Always restore `globals.css` with HSL tokens
2. **Before building:** Verify no Tailwind v4 imports in CSS
3. **Design system:** Map all Tailwind config values to CSS variables for design-token consistency
4. **Scaffolding:** Use temp directories for `create-next-app` if the target dir has non-standard files
5. **Component framework choice:** Explicitly specify `--base radix` for Radix UI; confirm via `components.json` style field
