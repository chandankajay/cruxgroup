"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Shield } from "lucide-react";
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
type PinSetupMode = "setup" | "reset";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  { icon: "✓", text: "Verified machines & trained operators" },
  { icon: "✓", text: "Book in under 2 minutes" },
  { icon: "✓", text: "Available across Telangana" },
];

function TrustBadges() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px solid #2a2825",
      }}
    >
      {[
        { Icon: Shield, label: "Verified Fleet" },
        { Icon: Clock, label: "2hr Response" },
        { Icon: MapPin, label: "Pan Telangana" },
      ].map(({ Icon, label }) => (
        <div
          key={label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon size={20} color="#d45800" strokeWidth={1.75} aria-hidden />
          <span style={{ fontSize: "0.7rem", color: "#9a9490", textAlign: "center" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface LoginPageClientProps {
  readonly initialStep?: Step;
  readonly initialPinMode?: PinSetupMode;
}

export function LoginPageClient({
  initialStep = "phone",
  initialPinMode = "setup",
}: LoginPageClientProps) {
  const t = useLabels();
  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState("");
  const [otpMode, setOtpMode] = useState<OtpMode>("login");
  const [pinMode, setPinMode] = useState<PinSetupMode>(initialPinMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lockout, setLockout] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePhoneContinue(phoneNumber: string) {
    setIsLoading(true);
    setError(undefined);
    setLockout(false);

    const { step: loginStep } = await checkLoginStepAction(phoneNumber);
    setPhone(phoneNumber);

    if (loginStep === "pin") {
      setOtpMode("login");
      setIsLoading(false);
      setStep("pin");
      return;
    }

    const sent = await sendOtpAction(phoneNumber);
    setIsLoading(false);
    if (!sent.success) {
      if (sent.error === "ACCOUNT_LOCKED") {
        setLockout(true);
        setError(
          "Too many failed attempts. Please wait 15 minutes before requesting a new code.",
        );
      } else {
        setError(t("LOGIN_ERROR_SEND"));
      }
      return;
    }
    setOtpMode("login");
    setStep("otp");
  }

  async function handleSendOtpForReset() {
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
    const sent = await sendOtpAction(phone);
    setIsLoading(false);
    if (!sent.success) {
      if (sent.error === "ACCOUNT_LOCKED") {
        setLockout(true);
        setError(t("LOGIN_PIN_LOCKED"));
      } else {
        setError(t("LOGIN_ERROR_SEND"));
      }
      return;
    }
    setOtpMode("reset_pin");
    setStep("otp");
  }

  async function handleVerifyOtp(code: string) {
    setIsLoading(true);
    setError(undefined);
    const result = await signInWithCredentialsAction(phone, code);
    if (!result.ok) {
      setError(t("LOGIN_ERROR_VERIFY"));
      setIsLoading(false);
      return;
    }

    if (otpMode === "reset_pin") {
      setPinMode("reset");
      setStep("set_pin");
      setIsLoading(false);
      return;
    }
    if (result.needsPinSetup) {
      setPinMode("setup");
      setStep("set_pin");
      setIsLoading(false);
      return;
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    window.location.assign("/");
  }

  async function handleVerifyPin(pin: string) {
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
    const result = await signInWithPinAction(phone, pin);
    if (!result.ok) {
      if (result.errorCode === "LOCKED") {
        setLockout(true);
        setError(t("LOGIN_PIN_LOCKED"));
      } else {
        setError(t("LOGIN_ERROR_VERIFY"));
      }
      setIsLoading(false);
      return;
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    window.location.assign("/");
  }

  async function handleSetPin(pin: string, confirmPin: string) {
    setIsLoading(true);
    setError(undefined);
    const action = pinMode === "reset" ? resetPinAfterOtpAction : setPinAction;
    const result = await action(pin, confirmPin);
    if (!result.ok) {
      if (result.error === "MISMATCH") {
        setError(t("LOGIN_PIN_MISMATCH"));
      } else if (result.error === "WEAK_PIN") {
        setError(t("LOGIN_PIN_WEAK"));
      } else {
        setError("Could not save PIN. Please try again.");
      }
      setIsLoading(false);
      return;
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    window.location.assign("/");
  }

  function handleBackToPhone() {
    setStep("phone");
    setError(undefined);
    setLockout(false);
    setOtpMode("login");
  }

  function handleBackFromOtp() {
    if (otpMode === "reset_pin") {
      setStep("pin");
    } else {
      handleBackToPhone();
    }
    setError(undefined);
    setLockout(false);
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0e0d",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            backgroundImage: "url('/loginbg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            backgroundColor: "#1a1917",
            border: "1px solid #2a2825",
            borderRadius: 16,
            padding: "48px 40px",
          }}
        >
          <div
            className="animate-spin"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(212,88,0,0.3)",
              borderTopColor: "#d45800",
            }}
          />
          <p style={{ color: "#f5f0eb", fontSize: "1.125rem", fontWeight: 800 }}>
            Success! Loading Fleet…
          </p>
        </div>
      </div>
    );
  }

  const isDev = process.env["NEXT_PUBLIC_NODE_ENV"] === "development";

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        position: "relative",
        display: "flex",
        backgroundColor: "#0f0e0d",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/loginbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(to bottom, rgba(15,14,13,0.85) 0%, rgba(15,14,13,0.75) 50%, rgba(15,14,13,0.92) 100%)",
        }}
      />

      <div
        className="hidden md:flex"
        style={{
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 64px",
          width: "50%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 40 }}>
          <Image
            src="/logo.png"
            alt="Crux Group"
            width={180}
            height={90}
            priority
            unoptimized
            style={{ mixBlendMode: "lighten", objectFit: "contain" }}
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "clamp(2.5rem, 4vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#f5f0eb",
          }}
        >
          <span style={{ color: "#d45800" }}>Book</span> Your Equipment.
          <br />
          Built for Builders.
        </motion.h1>
      </div>

      <div
        className="w-full md:w-1/2"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
          padding: "40px 20px",
          minHeight: "100dvh",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            backgroundColor: "#1a1917",
            border: "1px solid #2a2825",
            borderRadius: 16,
            padding: "28px 24px",
            width: "100%",
            maxWidth: 400,
          }}
        >
          {isDev && step !== "set_pin" && (
            <div
              style={{
                backgroundColor: "rgba(212,88,0,0.1)",
                border: "1px solid rgba(212,88,0,0.25)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
                fontSize: "0.82rem",
                color: "#d45800",
              }}
            >
              Dev OTP: <strong>4242</strong>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "phone" && (
              <PhoneStep
                key="phone"
                onSubmit={handlePhoneContinue}
                isLoading={isLoading}
                error={error}
                lockout={lockout}
              />
            )}
            {step === "otp" && (
              <OtpStep
                key="otp"
                phone={phone}
                onSubmit={handleVerifyOtp}
                onBack={handleBackFromOtp}
                isLoading={isLoading}
                error={error}
                lockout={lockout}
              />
            )}
            {step === "pin" && (
              <PinStep
                key="pin"
                phone={phone}
                onSubmit={handleVerifyPin}
                onBack={handleBackToPhone}
                onForgotPin={() => void handleSendOtpForReset()}
                isLoading={isLoading}
                error={error}
                lockout={lockout}
              />
            )}
            {step === "set_pin" && (
              <SetPinStep
                key="set_pin"
                mode={pinMode}
                onSubmit={(pin, confirm) => void handleSetPin(pin, confirm)}
                isLoading={isLoading}
                error={error}
              />
            )}
          </AnimatePresence>

          <TrustBadges />
        </motion.div>

        <motion.p style={{ marginTop: 24, textAlign: "center", fontSize: "0.72rem" }}>
          <Link href="/legal/terms-and-conditions" style={{ color: "#9a9490", textDecoration: "none" }}>
            Terms and Conditions
          </Link>
          <span style={{ color: "#9a9490" }} aria-hidden>
            {" · "}
          </span>
          <Link href="/legal/privacy-policy" style={{ color: "#9a9490", textDecoration: "none" }}>
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
