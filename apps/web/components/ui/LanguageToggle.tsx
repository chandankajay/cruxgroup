"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/cn";
import type { Locale } from "../../lib/locale";
import { useLang } from "./LanguageProvider";

export function LanguageToggle(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();

  function flip(): void {
    const next: Locale = lang === "en" ? "te" : "en";
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "en" || segments[0] === "te") {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }
    router.push(`/${segments.join("/")}`);
  }

  return (
    <button
      type="button"
      onClick={flip}
      className={cn(
        "flex rounded-full border border-border bg-surface/80 px-1 py-0.5 text-xs font-medium text-offwhite backdrop-blur",
        "hover:border-brand/60"
      )}
      aria-label="Toggle language"
    >
      <span
        className={cn(
          "rounded-full px-2 py-0.5",
          lang === "en" ? "bg-brand text-offwhite" : "text-muted"
        )}
      >
        EN
      </span>
      <span className="px-0.5 text-muted">|</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5",
          lang === "te" ? "bg-brand text-offwhite" : "text-muted"
        )}
      >
        తె
      </span>
    </button>
  );
}
