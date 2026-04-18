"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PhoneStepProps {
  readonly onSubmit: (phone: string) => void;
  readonly isLoading: boolean;
}

export function PhoneStep({ onSubmit, isLoading }: PhoneStepProps) {
  const [digits, setDigits] = useState("");

  const isValid = digits.replace(/\D/g, "").length === 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) {
      onSubmit(`+91${digits.replace(/\D/g, "")}`);
    }
  }

  return (
    <motion.div
      key="phone-step"
      initial={{ x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -28, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="phone-input"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400"
          >
            WhatsApp Number
          </label>

          <div className="flex overflow-hidden rounded-xl border border-white/20 bg-white/5 py-1 transition-all focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500">
            <span className="flex shrink-0 items-center px-3 text-sm font-semibold tabular-nums text-gray-400 sm:px-4">
              +91
            </span>
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={digits}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                setDigits(raw);
              }}
              className="min-w-0 flex-1 bg-transparent py-4 pr-3 text-base font-medium tabular-nums text-white outline-none placeholder:text-gray-500 sm:pr-4 sm:text-lg"
              required
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            We’ll send a one-time code to WhatsApp (data rates may apply).
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-center font-black uppercase tracking-tighter text-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingDots />
              Sending…
            </span>
          ) : (
            "GET OTP"
          )}
        </button>
      </form>
    </motion.div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-black/70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
