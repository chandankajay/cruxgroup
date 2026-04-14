"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  readonly children: ReactNode;
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
} as const;

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.main
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
