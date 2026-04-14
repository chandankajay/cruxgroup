"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { useLabels } from "@repo/ui/dictionary-provider";

interface BookingSuccessProps {
  readonly onDismiss: () => void;
}

export function BookingSuccess({ onDismiss }: BookingSuccessProps) {
  const t = useLabels();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange/10"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="h-10 w-10 text-brand-orange"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-2xl font-bold text-foreground"
      >
        {t("BOOKING_SUCCESS_TITLE")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-muted-foreground"
      >
        {t("BOOKING_SUCCESS_MESSAGE")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <Button onClick={onDismiss} variant="outline">
          {t("BOOKING_SUCCESS_BACK")}
        </Button>
      </motion.div>
    </motion.div>
  );
}
