"use client";

import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, ClipboardList, User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", icon: Home, label: "Equipment" },
  { href: "/dashboard", icon: ClipboardList, label: "My Bookings" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

interface SideDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly session: Session | null;
}

export function SideDrawer({ isOpen, onClose, session }: SideDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              backgroundColor: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(2px)",
            }}
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 300,
              backgroundColor: "#ffffff",
              zIndex: 70,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Image
                src="/logo.png"
                alt="Crux Group"
                width={130}
                height={65}
                unoptimized
                style={{ objectFit: "contain", mixBlendMode: "multiply" }}
              />
              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
                aria-label="Close menu"
              >
                <X size={20} color="#475569" />
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ padding: "16px 12px", flex: 1 }}>
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    textDecoration: "none",
                    marginBottom: 4,
                    color: "#475569",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff0e8";
                    e.currentTarget.style.color = "#d45800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Sign out */}
            {session?.user && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0" }}>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#ef4444",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
