"use client";

import { motion } from "framer-motion";
import { Home, ClipboardList, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { href: "/", icon: Home, label: "Equipment" },
  { href: "/dashboard", icon: ClipboardList, label: "My Bookings" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;
  if (pathname?.startsWith("/operator")) return null;

  return (
    <nav
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
              flex: 1,
              padding: "8px 0",
              position: "relative",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                style={{
                  position: "absolute",
                  top: 6,
                  width: 40,
                  height: 32,
                  backgroundColor: "rgba(212,88,0,0.1)",
                  borderRadius: 10,
                  zIndex: 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              size={22}
              style={{
                position: "relative",
                zIndex: 1,
                color: isActive ? "#d45800" : "#94a3b8",
                transition: "color 0.2s",
              }}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#d45800" : "#94a3b8",
                letterSpacing: "0.01em",
                transition: "color 0.2s",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
