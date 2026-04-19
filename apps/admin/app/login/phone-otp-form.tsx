"use client";

import { useState } from "react";
import { signInPartnerPhoneAction } from "./actions";

type Step = "phone" | "otp";

// ── colours ────────────────────────────────────────────────────────────────
const AMBER = "#D97706";
const AMBER_DARK = "#B45309";
const AMBER_BG = "#FFFBEB";
const AMBER_BORDER = "#FDE68A";

const isDev = process.env.NODE_ENV === "development";

export function PhoneOtpForm() {
  const [step, setStep] = useState<Step>("phone");
  const [digits, setDigits] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const phoneNumber = `+91${digits.replace(/\D/g, "")}`;
  const phoneValid = digits.replace(/\D/g, "").length === 10;
  const otpValid = code.length === 6;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid) return;
    setError(undefined);
    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpValid) return;
    setIsLoading(true);
    setError(undefined);
    const result = await signInPartnerPhoneAction(phoneNumber, code);
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
  }

  function handleBack() {
    setStep("phone");
    setCode("");
    setError(undefined);
  }

  if (step === "phone") {
    return (
      <form
        onSubmit={handleSendOtp}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <label
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#78716C",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Partner Phone Number
        </label>

        {/* +91 prefix row */}
        <div
          style={{
            display: "flex",
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            overflow: "hidden",
            background: "#FAFAFA",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 12px",
              background: "#FFF",
              borderRight: "1.5px solid #E5E7EB",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "#374151",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "1rem" }}>🇮🇳</span>
            <span>+91</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={digits}
            onChange={(e) =>
              setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            style={{
              flex: 1,
              background: "transparent",
              padding: "10px 12px",
              fontSize: "0.875rem",
              color: "#1C1917",
              outline: "none",
              border: "none",
            }}
            required
          />
        </div>

        {isDev && (
          <p
            style={{
              fontSize: "0.7rem",
              color: "#64748b",
              margin: 0,
              textAlign: "center",
            }}
          >
            Dev: OTP{" "}
            <code
              style={{
                background: "#f1f5f9",
                padding: "2px 6px",
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              112233
            </code>
            . Any 10-digit number works — missing users are created as PARTNER;
            existing USER rows are promoted to PARTNER (dev only).
          </p>
        )}

        <button
          type="submit"
          disabled={!phoneValid}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 10,
            background: phoneValid ? AMBER : "#D1D5DB",
            color: phoneValid ? "#fff" : "#9CA3AF",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "none",
            cursor: phoneValid ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          Get OTP →
        </button>
      </form>
    );
  }

  // OTP step
  const displayPhone = phoneNumber.replace(
    /(\+\d{2})(\d{5})(\d{5})/,
    "$1 ••••• $3",
  );

  return (
    <form
      onSubmit={handleVerifyOtp}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Sent-to banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: AMBER_BG,
          border: `1px solid ${AMBER_BORDER}`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: AMBER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.875rem",
            flexShrink: 0,
          }}
        >
          📱
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", color: "#92400E", margin: 0 }}>
            OTP sent to
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#78350F",
              margin: 0,
            }}
          >
            {displayPhone}
          </p>
        </div>
      </div>

      <label
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#78716C",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        6-digit OTP
      </label>
      <input
        type="text"
        inputMode="numeric"
        placeholder="• • • • • •"
        value={code}
        onChange={(e) =>
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        autoFocus
        style={{
          width: "100%",
          padding: "14px 12px",
          borderRadius: 10,
          border: `1.5px solid ${error ? "#FCA5A5" : "#E5E7EB"}`,
          background: error ? "#FEF2F2" : "#FAFAFA",
          fontFamily: "monospace",
          fontSize: "1.5rem",
          fontWeight: 700,
          letterSpacing: "0.4em",
          textAlign: "center",
          color: "#1C1917",
          outline: "none",
          boxSizing: "border-box",
        }}
        required
      />

      {error && (
        <p style={{ fontSize: "0.8rem", color: "#DC2626", margin: 0 }}>
          ⚠ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!otpValid || isLoading}
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: 10,
          background: otpValid && !isLoading ? AMBER : "#D1D5DB",
          color: otpValid && !isLoading ? "#fff" : "#9CA3AF",
          fontWeight: 600,
          fontSize: "0.875rem",
          border: "none",
          cursor: otpValid && !isLoading ? "pointer" : "not-allowed",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          if (otpValid && !isLoading)
            (e.currentTarget as HTMLButtonElement).style.background = AMBER_DARK;
        }}
        onMouseLeave={(e) => {
          if (otpValid && !isLoading)
            (e.currentTarget as HTMLButtonElement).style.background = AMBER;
        }}
      >
        {isLoading ? "Verifying…" : "Verify & Sign In ✓"}
      </button>

      <button
        type="button"
        onClick={handleBack}
        style={{
          background: "none",
          border: "none",
          fontSize: "0.8125rem",
          color: "#78716C",
          cursor: "pointer",
          padding: 0,
          textAlign: "center",
        }}
      >
        ← Change phone number
      </button>
    </form>
  );
}
