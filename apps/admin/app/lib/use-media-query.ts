"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to `window.matchMedia`. Returns `undefined` until mounted (SSR).
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Tailwind `lg` breakpoint — mobile-first: `false` until hydrated. */
export function useIsLgUp(): boolean | undefined {
  return useMediaQuery("(min-width: 1024px)");
}
