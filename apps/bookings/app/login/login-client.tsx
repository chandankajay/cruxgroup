"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useLabels } from "@repo/ui/dictionary-provider";
import {
  checkLoginStepAction,
  resetPinAfterOtpAction,
  sendOtpAction,
  setPinAction,
  signInWithCredentialsAction,
  signInWithPinAction,
} from "./actions";
import { PhoneStep } from "./features/phone-step";
import { OtpStep } from "./features/otp-step";
import { PinStep } from "./features/pin-step";
import { SetPinStep } from "./features/set-pin-step";

type Step = "phone" | "otp" | "pin" | "set_pin";
type OtpMode = "login" | "reset_pin";

const emptyDigits = () => Array.from({ length: 4 }, () => "");

interface LoginPageClientProps {
  readonly initialStep?: Step;
}

export function LoginPageClient({ initialStep = "phone" }: LoginPageClientProps) {
  const t = useLabels();
  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState("");
  const [otpMode, setOtpMode] = useState<OtpMode>("login");
  const [pinMode, setPinMode] = useState<"setup" | "reset">("setup");
  const [pinCells, setPinCells] = useState(emptyDigits);
  const [newPinCells, setNewPinCells] = useState(emptyDigits);
  const [confirmPinCells, setConfirmPinCells] = useState(emptyDigits);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lockout, setLockout] = useState(false);
  const [success, setSuccess] = useState(false);
  const otpSubmitLock = useRef(false);
  const pinSubmitLock = useRef(false);

  useEffect(() => {
    if (step === "set_pin") {
      setError(undefined);
      setNewPinCells(emptyDigits());
      setConfirmPinCells(emptyDigits());
    }
    if (step === "pin") {
      setError(undefined);
      setPinCells(emptyDigits());
    }
  }, [step]);

  function goToSetPin(mode: "setup" | "reset") {
    setError(undefined);
    setPinMode(mode);
    setStep("set_pin");
    setIsLoading(false);
  }

  async function handlePhoneContinue(phoneNumber: string) {
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
    setPhone(phoneNumber);

    const { step: loginStep } = await checkLoginStepAction(phoneNumber);
    if (loginStep === "pin") {
      setStep("pin");
      setIsLoading(false);
      return;
    }

    const sent = await sendOtpAction(phoneNumber);
    setIsLoading(false);
    if (!sent.success) {
      setError(sent.error === "ACCOUNT_LOCKED"
        ? "Too many failed attempts. Please wait 15 minutes before requesting a new code."
        : t("LOGIN_ERROR_SEND"));
      if (sent.error === "ACCOUNT_LOCKED") setLockout(true);
      return;
    }
    setOtpMode("login");
    setStep("otp");
  }

  async function handleSendOtpForReset() {
    setIsLoading(true);
    setError(undefined);
    const sent = await sendOtpAction(phone);
    setIsLoading(false);
    if (!sent.success) {
      setError(sent.error === "ACCOUNT_LOCKED"
        ? "Too many attempts. Try again after 15 minutes."
        : t("LOGIN_ERROR_SEND"));
      return;
    }
    setOtpMode("reset_pin");
    setStep("otp");
  }

  async function handleVerifyOtp(code: string) {
    if (otpSubmitLock.current) return;
    otpSubmitLock.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await signInWithCredentialsAction(phone, code);
      if (!result.ok) {
        setError(t("LOGIN_ERROR_VERIFY"));
        return;
      }
      if (otpMode === "reset_pin") {
        goToSetPin("reset");
        return;
      }
      if (result.needsPinSetup) {
        goToSetPin("setup");
        return;
      }
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      window.location.assign("/");
    } finally {
      otpSubmitLock.current = false;
      setIsLoading(false);
    }
  }

  async function handleVerifyPin(pin: string) {
    if (pinSubmitLock.current) return;
    pinSubmitLock.current = true;
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
    try {
      const result = await signInWithPinAction(phone, pin);
      if (!result.ok) {
        setError(result.errorCode === "LOCKED"
          ? "Too many attempts. Try again after 15 minutes."
          : "Incorrect PIN. Try again or use Forgot PIN.");
        if (result.errorCode === "LOCKED") setLockout(true);
        return;
      }
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      window.location.assign("/");
    } finally {
      pinSubmitLock.current = false;
      setIsLoading(false);
    }
  }

  async function handleSetPin(pin: string, confirmPin: string) {
    setIsLoading(true);
    setError(undefined);
    const action = pinMode === "reset" ? resetPinAfterOtpAction : setPinAction;
    const result = await action(pin, confirmPin);
    if (!result.ok) {
      setError(
        result.error === "MISMATCH" ? "PINs do not match."
          : result.error === "WEAK_PIN" ? "Choose a stronger PIN — avoid sequences like 1234."
            : "Could not save PIN. Please try again.",
      );
      setIsLoading(false);
      return;
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    window.location.assign("/");
  }

  if (success) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f0e0d" }}>
        <p style={{ color: "#f5f0eb", fontWeight: 800 }}>Success! Loading…</p>
      </div>
    );
  }

  const isDev = process.env["NEXT_PUBLIC_NODE_ENV"] === "development";

  return (
    <div style={{ minHeight: "100dvh", display: "flex", backgroundColor: "#0f0e0d", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "url('/loginbg.jpg')", backgroundSize: "cover" }} />
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to bottom, rgba(15,14,13,0.9), rgba(15,14,13,0.95))" }} />

      <div className="w-full" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10, padding: "40px 20px", minHeight: "100dvh" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="md:hidden" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Image src="/logo.png" alt="Crux Group" width={140} height={70} priority unoptimized style={{ mixBlendMode: "lighten" }} />
          </div>

          <div style={{ backgroundColor: "#1a1917", border: "1px solid #2a2825", borderRadius: 16, padding: "28px 24px" }}>
            {isDev && step !== "set_pin" && (
              <div style={{ marginBottom: 16, fontSize: "0.82rem", color: "#d45800" }}>Dev OTP: <strong>4242</strong></div>
            )}

            <AnimatePresence mode="wait">
              {step === "phone" && (
                <PhoneStep key="phone" onSubmit={handlePhoneContinue} isLoading={isLoading} error={error} lockout={lockout} />
              )}
              {step === "otp" && (
                <OtpStep key="otp" phone={phone} onSubmit={handleVerifyOtp} onBack={() => { setStep(otpMode === "reset_pin" ? "pin" : "phone"); setError(undefined); }} isLoading={isLoading} error={error} lockout={lockout} />
              )}
              {step === "pin" && (
                <PinStep key="pin" phone={phone} cells={pinCells} setCells={setPinCells} onSubmit={handleVerifyPin} onBack={() => { setStep("phone"); setError(undefined); }} onForgotPin={() => void handleSendOtpForReset()} isLoading={isLoading} error={error} lockout={lockout} />
              )}
              {step === "set_pin" && (
                <SetPinStep
                  key="set_pin"
                  pinCells={newPinCells}
                  setPinCells={setNewPinCells}
                  confirmCells={confirmPinCells}
                  setConfirmCells={setConfirmPinCells}
                  onSubmit={(p, c) => void handleSetPin(p, c)}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </AnimatePresence>
          </div>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.72rem" }}>
            <Link href="/legal/privacy-policy" style={{ color: "#9a9490" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
