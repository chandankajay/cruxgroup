"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Shield } from "lucide-react";
import { useLabels } from "@repo/ui/dictionary-provider";
import { sendOtpAction, signInWithCredentialsAction } from "./actions";
import { PhoneStep } from "./features/phone-step";
import { OtpStep } from "./features/otp-step";

type Step = "phone" | "otp";

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

export default function LoginPage() {
  const t = useLabels();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lockout, setLockout] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSendOtp(phoneNumber: string) {
    setIsLoading(true);
    setError(undefined);
    setLockout(false);
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
    setPhone(phoneNumber);
    setStep("otp");
  }

  async function handleVerifyOtp(code: string) {
    setIsLoading(true);
    setError(undefined);
    const result = await signInWithCredentialsAction(phone, code);
    if (!result.ok) {
      setError(t("LOGIN_ERROR_VERIFY"));
      setIsLoading(false);
    } else {
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      window.location.assign("/");
    }
  }

  function handleBack() {
    setStep("phone");
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
            backgroundRepeat: "no-repeat",
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
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
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
          <p
            style={{
              color: "#f5f0eb",
              fontSize: "1.125rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              textAlign: "center",
            }}
          >
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
      {/* Background image */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/loginbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(to bottom, rgba(15,14,13,0.85) 0%, rgba(15,14,13,0.75) 50%, rgba(15,14,13,0.92) 100%)",
        }}
      />

      {/* LEFT PANEL — desktop only (md+) */}
      <div className="hidden md:flex" style={{
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 64px",
        width: "50%",
        position: "relative",
        zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
          style={{ marginBottom: 40 }}
        >
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
          transition={{ duration: 0.5, delay: 0.1, ease }}
          style={{
            fontSize: "clamp(2.5rem, 4vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#f5f0eb",
          }}
        >
          <span style={{ color: "#d45800" }}>Book</span> Your Equipment.
          <br />
          Built for Builders.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          style={{
            color: "#9a9490",
            fontSize: "1.1rem",
            marginTop: "1rem",
            maxWidth: 420,
          }}
        >
          Telangana&apos;s most trusted heavy equipment platform. JCBs, Cranes,
          Excavators — on demand.
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            listStyle: "none",
            padding: 0,
          }}
        >
          {FEATURES.map((item) => (
            <li
              key={item.text}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                color: "#9a9490",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#d45800", fontWeight: 700 }}>
                {item.icon}
              </span>
              {item.text}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* RIGHT PANEL — login form (full on mobile, half on desktop) */}
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
        {/* Logo — mobile only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
          className="md:hidden"
          style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
        >
          <Image
            src="/logo.png"
            alt="Crux Group"
            width={140}
            height={70}
            priority
            unoptimized
            style={{ mixBlendMode: "lighten", objectFit: "contain" }}
          />
        </motion.div>

        {/* Mobile headline — hidden on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="md:hidden"
          style={{ textAlign: "left", width: "100%", maxWidth: 400, marginBottom: 24 }}
        >
          <h1
            style={{
              fontSize: "clamp(1.8rem, 8vw, 2.4rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#f5f0eb",
            }}
          >
            <span style={{ color: "#d45800" }}>Book</span> Your
            Equipment.
            <br />
            Built for Builders.
          </h1>
          <p
            style={{
              color: "#9a9490",
              fontSize: "0.88rem",
              marginTop: "0.5rem",
            }}
          >
            Telangana&apos;s most trusted heavy equipment platform.
          </p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          style={{
            backgroundColor: "#1a1917",
            border: "1px solid #2a2825",
            borderRadius: 16,
            padding: "28px 24px",
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 0 0 1px rgba(212,88,0,0.06), 0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Dev OTP notice */}
          {isDev && (
            <div
              style={{
                backgroundColor: "rgba(212,88,0,0.1)",
                border: "1px solid rgba(212,88,0,0.25)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
                fontSize: "0.82rem",
                fontFamily: "monospace",
                color: "#d45800",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Dev OTP: <strong>4242</strong>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <PhoneStep
                key="phone"
                onSubmit={handleSendOtp}
                isLoading={isLoading}
                error={error}
                lockout={lockout}
              />
            ) : (
              <OtpStep
                key="otp"
                phone={phone}
                onSubmit={handleVerifyOtp}
                onBack={handleBack}
                isLoading={isLoading}
                error={error}
                lockout={lockout}
              />
            )}
          </AnimatePresence>

          <TrustBadges />
        </motion.div>

        {/* Terms links */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease }}
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: "0.72rem",
          }}
        >
          <Link
            href="/legal/terms-and-conditions"
            style={{ color: "#9a9490", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Terms and Conditions
          </Link>
          <span style={{ color: "#9a9490" }} aria-hidden>
            {" · "}
          </span>
          <Link
            href="/legal/privacy-policy"
            style={{ color: "#9a9490", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
