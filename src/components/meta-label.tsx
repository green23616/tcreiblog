import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetaLabelProps {
  children: ReactNode;
  className?: string;
}

export function MetaLabel({ children, className }: MetaLabelProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-label text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
