"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";

export function ThemeToggle({ className }: { readonly className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("shrink-0 text-foreground", className)}
        disabled
        aria-hidden
      >
        <Sun
          className="size-5 text-muted-foreground"
          strokeWidth={2}
          aria-hidden
        />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0 text-foreground", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun
          className="size-5"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <Moon
          className="size-5"
          strokeWidth={2}
          aria-hidden
        />
      )}
    </Button>
  );
}
