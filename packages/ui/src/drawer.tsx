"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./lib/utils";

interface DrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

function DrawerPortal({ children }: { readonly children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

export function Drawer({ open, onClose, children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <DrawerPortal>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[90] bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close drawer"
      />

      {/* Content — pinned to bottom of viewport */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100]",
          "mx-auto w-full max-w-lg",
          "max-h-[85vh] overflow-y-auto",
          "rounded-t-2xl bg-background p-6 shadow-xl",
          "animate-slideUp",
          className
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        {children}
      </div>
    </DrawerPortal>
  );
}
