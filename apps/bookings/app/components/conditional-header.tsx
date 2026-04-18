"use client";

import { usePathname } from "next/navigation";
import { NavigationHeader } from "./navigation-header";

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  if (pathname?.startsWith("/operator")) return null;
  return <NavigationHeader />;
}
