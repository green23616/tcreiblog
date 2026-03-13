"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isLoggedIn: boolean;
  username: string;
}

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
}

function MobileNavLink({ href, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function MobileNav({ isLoggedIn, username }: MobileNavProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const isOpen = openPathname === pathname;

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPathname(null);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) {
          return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === panelRef.current) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    }

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpenPathname(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  const avatarHref = username ? `/@${username}` : "/settings";
  const avatarInitial = (username.charAt(0) || "u").toUpperCase();

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() =>
          setOpenPathname((currentPathname) =>
            currentPathname === pathname ? null : pathname
          )
        }
        className="inline-flex size-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Menu className="size-4" aria-hidden="true" />
      </button>

      <div
        ref={panelRef}
        tabIndex={-1}
        aria-hidden={!isOpen}
        className={cn(
          "fixed left-0 right-0 top-14 z-40 border-b border-border bg-background transition-[transform,opacity] duration-200",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-layout flex-col gap-6 px-4 py-4 md:px-8">
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpenPathname(null)}
              className="inline-flex size-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 pb-2">
            <MobileNavLink href="/tags">Tags</MobileNavLink>

            {isLoggedIn ? (
              <>
                <Link
                  href={avatarHref}
                  className="flex size-9 items-center justify-center rounded-full bg-primary font-mono text-xs uppercase text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <span aria-hidden="true">{avatarInitial}</span>
                  <span className="sr-only">Profile</span>
                </Link>
                <MobileNavLink href="/write">Write</MobileNavLink>
                <MobileNavLink href="/settings">Settings</MobileNavLink>
              </>
            ) : (
              <MobileNavLink href="/login">Sign in</MobileNavLink>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
