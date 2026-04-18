"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface OtpStepProps {
  readonly phone: string;
  readonly onSubmit: (code: string) => void;
  readonly onBack: () => void;
  readonly isLoading: boolean;
  readonly error?: string;
}

/** e.g. +919182054293 → "+91 91820 54293" for display */
function formatVerifyLine(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-12);
  if (digits.length >= 10) {
    const local = digits.slice(-10);
    return `Verify +91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `Verify ${phone}`;
}

export function OtpStep({
  phone,
  onSubmit,
  onBack,
  isLoading,
  error,
}: OtpStepProps) {
  const [cells, setCells] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => ""),
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((i: number) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    focusIndex(0);
  }, [focusIndex]);

  useEffect(() => {
    if (!error) return;
    setCells(Array.from({ length: 6 }, () => ""));
    queueMicrotask(() => focusIndex(0));
  }, [error, focusIndex]);

  function setCellAt(index: number, char: string) {
    setCells((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (digit) {
      setCells((prev) => {
        const next = [...prev];
        next[index] = digit;
        const full = next.join("");
        if (full.length === 6) {
          queueMicrotask(() => {
            onSubmit(full);
          });
        }
        return next;
      });
      if (index < 5) focusIndex(index + 1);
      return;
    }
    setCellAt(index, "");
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !cells[index] && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      setCellAt(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    setCells(next);
    const last = Math.min(pasted.length, 5);
    focusIndex(last);
    if (pasted.length === 6) {
      queueMicrotask(() => onSubmit(pasted));
    }
  }

  return (
    <motion.div
      key="otp-step"
      initial={{ x: 56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 56, opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="text-base font-semibold tracking-tight text-white">
          {formatVerifyLine(phone)}
        </p>
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="self-start text-sm font-semibold text-amber-400 underline-offset-2 transition-colors hover:text-amber-300 hover:underline disabled:opacity-50 sm:self-auto"
        >
          Edit
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">Enter 6-digit verification code</legend>
        <div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
          onPaste={handlePaste}
        >
          {cells.map((val, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isLoading}
              className="h-14 w-12 rounded-lg border border-white/20 bg-white/10 text-center text-2xl font-bold tabular-nums text-white outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              aria-label={`Digit ${i + 1} of 6`}
            />
          ))}
        </div>
      </fieldset>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm font-medium text-red-400"
        >
          {error}
        </motion.p>
      )}

      {isLoading && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-400">
          <span
            className="inline-block size-4 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"
            aria-hidden
          />
          Verifying…
        </p>
      )}
    </motion.div>
  );
}
