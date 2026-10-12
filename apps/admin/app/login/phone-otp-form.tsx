"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import {
  checkLoginStepAction,
  resetPinAfterOtpAction,
  sendAdminOtpAction,
  setPinAction,
  signInPartnerPhoneAction,
  signInWithPinAction,
} from "./actions";

type Step = "phone" | "otp" | "pin" | "set_pin";
type OtpMode = "login" | "reset_pin";
type PinSetupMode = "setup" | "reset";

const isDev = process.env.NODE_ENV === "development";
const OTP_LEN = 4;

function formatVerifyLine(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-12);
  if (digits.length >= 10) {
    const local = digits.slice(-10);
    return `Verify +91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `Verify ${phone}`;
}

function DigitCells({
  cells,
  setCells,
  onComplete,
  disabled,
  masked,
}: {
  readonly cells: string[];
  readonly setCells: React.Dispatch<React.SetStateAction<string[]>>;
  readonly onComplete: (code: string) => void;
  readonly disabled: boolean;
  readonly masked?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((i: number) => {
    inputsRef.current[i]?.focus();
  }, []);

  useEffect(() => {
    focusIndex(0);
  }, [focusIndex]);

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
        if (full.length === OTP_LEN) {
          queueMicrotask(() => onComplete(full));
        }
        return next;
      });
      if (index < OTP_LEN - 1) focusIndex(index + 1);
      return;
    }
    setCellAt(index, "");
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!pasted) return;
    setCells(Array.from({ length: OTP_LEN }, (_, i) => pasted[i] ?? ""));
    if (pasted.length === OTP_LEN) {
      queueMicrotask(() => onComplete(pasted));
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {cells.map((val, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          disabled={disabled}
          className="h-14 w-12 rounded-lg border border-input bg-muted/60 text-center text-2xl font-bold tabular-nums text-foreground outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          aria-label={`Digit ${i + 1} of ${OTP_LEN}`}
        />
      ))}
    </div>
  );
}

interface PhoneOtpFormProps {
  readonly callbackUrl?: string;
  readonly initialStep?: Step;
  readonly initialPinMode?: PinSetupMode;
}

export function PhoneOtpForm({
  callbackUrl = "/",
  initialStep = "phone",
  initialPinMode = "setup",
}: PhoneOtpFormProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [digits, setDigits] = useState("");
  const [otpCells, setOtpCells] = useState(() => Array.from({ length: OTP_LEN }, () => ""));
  const [pinCells, setPinCells] = useState(() => Array.from({ length: OTP_LEN }, () => ""));
  const [otpMode, setOtpMode] = useState<OtpMode>("login");
  const [pinMode, setPinMode] = useState<PinSetupMode>(initialPinMode);
  const [pinSetupCells, setPinSetupCells] = useState(() => Array.from({ length: OTP_LEN }, () => ""));
  const [confirmPinCells, setConfirmPinCells] = useState(() => Array.from({ length: OTP_LEN }, () => ""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lockout, setLockout] = useState(false);
  const submitLock = useRef(false);

  const phoneNumber = `+91${digits.replace(/\D/g, "")}`;
  const phoneValid = digits.replace(/\D/g, "").length === 10;

  async function handlePhoneContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid || isLoading) return;
    setError(undefined);
    setLockout(false);
    setIsLoading(true);

    const { step: loginStep } = await checkLoginStepAction(phoneNumber);
    if (loginStep === "pin") {
      setOtpMode("login");
      setStep("pin");
      setIsLoading(false);
      return;
    }

    try {
      const result = await sendAdminOtpAction(phoneNumber);
      if (!result.success) {
        setError(
          result.error === "ACCOUNT_LOCKED"
            ? "Too many attempts. Try again after 15 minutes."
            : "Failed to send OTP. Please try again.",
        );
        return;
      }
      setOtpCells(Array.from({ length: OTP_LEN }, () => ""));
      setOtpMode("login");
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendOtpForReset() {
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await sendAdminOtpAction(phoneNumber);
      if (!result.success) {
        setError(
          result.error === "ACCOUNT_LOCKED"
            ? "Too many attempts. Try again after 15 minutes."
            : "Failed to send OTP. Please try again.",
        );
        return;
      }
      setOtpCells(Array.from({ length: OTP_LEN }, () => ""));
      setOtpMode("reset_pin");
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitOtp(full: string) {
    if (full.length !== OTP_LEN || submitLock.current) return;
    submitLock.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await signInPartnerPhoneAction(phoneNumber, full);
      if (!result.ok) {
        setError(
          result.errorCode === "CredentialsSignin"
            ? "Invalid OTP — check the code and try again."
            : "Sign-in failed. Please try again.",
        );
        return;
      }
      if (otpMode === "reset_pin") {
        setPinMode("reset");
        setStep("set_pin");
        return;
      }
      if (result.needsPinSetup) {
        setPinMode("setup");
        setStep("set_pin");
        return;
      }
      window.location.assign(callbackUrl || "/");
    } finally {
      submitLock.current = false;
      setIsLoading(false);
    }
  }

  async function submitPin(full: string) {
    if (full.length !== OTP_LEN || submitLock.current) return;
    submitLock.current = true;
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
    try {
      const result = await signInWithPinAction(phoneNumber, full);
      if (!result.ok) {
        if (result.errorCode === "LOCKED") {
          setLockout(true);
          setError("Too many attempts. Try again after 15 minutes.");
        } else {
          setError("Incorrect PIN. Try again or use Forgot PIN.");
        }
        setPinCells(Array.from({ length: OTP_LEN }, () => ""));
        return;
      }
      window.location.assign(callbackUrl || "/");
    } finally {
      submitLock.current = false;
      setIsLoading(false);
    }
  }

  async function handleSetPinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pin = pinSetupCells.join("");
    const confirm = confirmPinCells.join("");
    if (pin.length !== OTP_LEN || confirm.length !== OTP_LEN || isLoading) return;

    setIsLoading(true);
    setError(undefined);
    const action = pinMode === "reset" ? resetPinAfterOtpAction : setPinAction;
    const result = await action(pin, confirm);
    if (!result.ok) {
      if (result.error === "MISMATCH") {
        setError("PINs do not match.");
      } else if (result.error === "WEAK_PIN") {
        setError("Choose a stronger PIN — avoid sequences like 1234.");
      } else {
        setError("Could not save PIN. Please try again.");
      }
      setPinSetupCells(Array.from({ length: OTP_LEN }, () => ""));
      setConfirmPinCells(Array.from({ length: OTP_LEN }, () => ""));
      setIsLoading(false);
      return;
    }
    window.location.assign(callbackUrl || "/");
  }

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.div key="phone-step" initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -28, opacity: 0 }}>
          <form onSubmit={handlePhoneContinue} className="space-y-6">
            <div>
              <label htmlFor="admin-phone-input" className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                WhatsApp Number
              </label>
              <div className="flex overflow-hidden rounded-xl border border-input bg-background/50 py-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500">
                <span className="flex shrink-0 items-center px-3 text-sm font-semibold tabular-nums text-muted-foreground sm:px-4">+91</span>
                <input
                  id="admin-phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={digits}
                  onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="min-w-0 flex-1 bg-transparent py-4 pr-3 text-base font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground sm:pr-4 sm:text-lg"
                  required
                />
              </div>
              {isDev && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Dev OTP <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-amber-500/90">4242</code>
                </p>
              )}
            </div>
            {error && <p className="text-center text-sm font-medium text-red-400">{error}</p>}
            <button type="submit" disabled={!phoneValid || isLoading} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-black uppercase tracking-tighter text-primary-foreground shadow-lg disabled:opacity-50">
              {isLoading ? "Please wait…" : "Continue"}
            </button>
          </form>
        </motion.div>
      ) : step === "otp" ? (
        <motion.div key="otp-step" initial={{ x: 56, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 56, opacity: 0 }}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-base font-semibold text-foreground">{formatVerifyLine(phoneNumber)}</p>
            <button
              type="button"
              onClick={() => {
                setStep(otpMode === "reset_pin" ? "pin" : "phone");
                setError(undefined);
              }}
              className="text-sm font-semibold text-amber-400 hover:underline"
            >
              Edit
            </button>
          </div>
          <DigitCells cells={otpCells} setCells={setOtpCells} onComplete={(c) => void submitOtp(c)} disabled={isLoading} />
          {error && <p className="mt-4 text-center text-sm font-medium text-red-400">{error}</p>}
          {isLoading && <p className="mt-4 text-center text-sm text-muted-foreground">Verifying…</p>}
        </motion.div>
      ) : step === "pin" ? (
        <motion.div key="pin-step" initial={{ x: 56, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 56, opacity: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">Enter your PIN</p>
            <button type="button" onClick={() => { setStep("phone"); setError(undefined); }} className="text-sm font-semibold text-amber-400 hover:underline">
              Edit
            </button>
          </div>
          <DigitCells cells={pinCells} setCells={setPinCells} onComplete={(c) => void submitPin(c)} disabled={isLoading || lockout} masked />
          {error && <p className="mt-4 text-center text-sm font-medium text-red-400">{error}</p>}
          {!isLoading && (
            <p className="mt-4 text-center">
              <button type="button" onClick={() => void handleSendOtpForReset()} className="text-sm font-semibold text-amber-400 hover:underline">
                Forgot PIN?
              </button>
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div key="set-pin-step" initial={{ x: 56, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 56, opacity: 0 }}>
          <form onSubmit={handleSetPinSubmit} className="space-y-5">
            <p className="text-base font-semibold text-foreground">Set your 4-digit PIN</p>
            <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              Don&apos;t set a PIN if others also use this phone or browser. Anyone who knows your PIN can access your account.
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">New PIN</p>
              <DigitCells cells={pinSetupCells} setCells={setPinSetupCells} onComplete={() => {}} disabled={isLoading} masked />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Confirm PIN</p>
              <DigitCells cells={confirmPinCells} setCells={setConfirmPinCells} onComplete={() => {}} disabled={isLoading} masked />
            </div>
            {error && <p className="text-center text-sm font-medium text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || pinSetupCells.join("").length !== OTP_LEN || confirmPinCells.join("").length !== OTP_LEN}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-black uppercase tracking-tighter text-primary-foreground shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Saving…" : "Save PIN & Continue"}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
