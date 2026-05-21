"use client";

import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { NavigationHeader } from "./navigation-header";

export function ConditionalHeaderClient({
  session,
}: {
  readonly session: Session | null;
}) {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  if (pathname?.startsWith("/operator")) return null;
  return <NavigationHeader session={session} />;
}
