"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signInPartnerPhoneAction } from "./actions";

type Step = "phone" | "otp";

const isDev = process.env.NODE_ENV === "development";

/** e.g. +919182054293 → display line for OTP step */
function formatVerifyLine(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-12);
  if (digits.length >= 10) {
    const local = digits.slice(-10);
    return `Verify +91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `Verify ${phone}`;
}

export function PhoneOtpForm() {
  const [step, setStep] = useState<Step>("phone");
  const [digits, setDigits] = useState("");
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: 6 }, () => ""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const submitLock = useRef(false);

  const phoneNumber = `+91${digits.replace(/\D/g, "")}`;
  const phoneValid = digits.replace(/\D/g, "").length === 10;
  const code = cells.join("");
  const otpValid = code.length === 6;

  const focusIndex = useCallback((i: number) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (step === "otp") {
      queueMicrotask(() => focusIndex(0));
    }
  }, [step, focusIndex]);

  useEffect(() => {
    if (!error) return;
    setCells(Array.from({ length: 6 }, () => ""));
    queueMicrotask(() => focusIndex(0));
  }, [error, focusIndex]);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid) return;
    setError(undefined);
    setCells(Array.from({ length: 6 }, () => ""));
    setStep("otp");
  }

  async function submitOtp(full: string) {
    if (full.length !== 6 || submitLock.current) return;
    submitLock.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await signInPartnerPhoneAction(phoneNumber, full);
      if (!result.ok) {
        setError(
          result.errorCode === "CredentialsSignin"
            ? "Sign-in failed. Use the master OTP and a valid 10-digit Indian mobile (+91). If this persists, contact support."
            : "Invalid OTP — check the code and try again.",
        );
        setIsLoading(false);
      } else {
        window.location.assign("/");
      }
    } finally {
      submitLock.current = false;
    }
  }

  function setCellAt(index: number, char: string) {
    setCells((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
  }

  function handleCellChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (digit) {
      setCells((prev) => {
        const next = [...prev];
        next[index] = digit;
        const full = next.join("");
        if (full.length === 6) {
          queueMicrotask(() => {
            void submitOtp(full);
          });
        }
        return next;
      });
      if (index < 5) focusIndex(index + 1);
      return;
    }
    setCellAt(index, "");
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
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
      queueMicrotask(() => void submitOtp(pasted));
    }
  }

  function handleBack() {
    setStep("phone");
    setCells(Array.from({ length: 6 }, () => ""));
    setError(undefined);
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpValid || isLoading) return;
    await submitOtp(code);
  }

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.div
          key="phone-step"
          initial={{ x: -28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -28, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label
                htmlFor="admin-phone-input"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                WhatsApp Number
              </label>

              <div className="flex overflow-hidden rounded-xl border border-input bg-background/50 py-1 transition-all focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500">
                <span className="flex shrink-0 items-center px-3 text-sm font-semibold tabular-nums text-muted-foreground sm:px-4">
                  +91
                </span>
                <input
                  id="admin-phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={digits}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setDigits(raw);
                  }}
                  className="min-w-0 flex-1 bg-transparent py-4 pr-3 text-base font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground sm:pr-4 sm:text-lg"
                  required
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                We&apos;ll send a one-time code to WhatsApp (data rates may apply).
              </p>

              {isDev && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Dev OTP{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-amber-500/90">112233</code>
                  . Any 10-digit number works — missing users are created as PARTNER; existing USER rows are promoted to
                  PARTNER (dev only).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!phoneValid}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-center font-black uppercase tracking-tighter text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              GET OTP
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="otp-step"
          initial={{ x: 56, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 56, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <p className="text-base font-semibold tracking-tight text-foreground">{formatVerifyLine(phoneNumber)}</p>
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="self-start text-sm font-semibold text-amber-400 underline-offset-2 transition-colors hover:text-amber-300 hover:underline disabled:opacity-50 sm:self-auto"
              >
                Edit
              </button>
            </div>

            <fieldset>
              <legend className="sr-only">Enter 6-digit verification code</legend>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
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
                    onChange={(e) => handleCellChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isLoading}
                    className="h-14 w-12 rounded-lg border border-input bg-muted/60 text-center text-2xl font-bold tabular-nums text-foreground outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                    aria-label={`Digit ${i + 1} of 6`}
                  />
                ))}
              </div>
            </fieldset>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm font-medium text-red-400"
              >
                {error}
              </motion.p>
            )}

            {isLoading && (
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <span
                  className="inline-block size-4 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"
                  aria-hidden
                />
                Verifying…
              </p>
            )}

            <button
              type="submit"
              disabled={!otpValid || isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-center font-black uppercase tracking-tighter text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? "Verifying…" : "Verify & Sign In"}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
