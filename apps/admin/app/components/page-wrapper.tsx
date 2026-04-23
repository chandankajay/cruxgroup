"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function PageWrapper({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: easeOut },
        }}
        exit={{
          opacity: 0,
          y: 12,
          transition: { duration: 0.2, ease: "easeIn" },
        }}
        className="min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
