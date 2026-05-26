"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface OtpStepProps {
  readonly phone: string;
  readonly onSubmit: (code: string) => void;
  readonly onBack: () => void;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly lockout?: boolean;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 2)}****${digits.slice(6)}`;
  }
  return phone;
}

export function OtpStep({
  phone,
  onSubmit,
  onBack,
  isLoading,
  error,
  lockout,
}: OtpStepProps) {
  const [cells, setCells] = useState<string[]>(() =>
    Array.from({ length: 4 }, () => ""),
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
    setCells(Array.from({ length: 4 }, () => ""));
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
        if (full.length === 4) {
          queueMicrotask(() => {
            onSubmit(full);
          });
        }
        return next;
      });
      if (index < 3) focusIndex(index + 1);
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
    if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const next = Array.from({ length: 4 }, (_, i) => pasted[i] ?? "");
    setCells(next);
    const last = Math.min(pasted.length, 3);
    focusIndex(last);
    if (pasted.length === 4) {
      queueMicrotask(() => onSubmit(pasted));
    }
  }

  const disabled = isLoading || lockout;

  return (
    <motion.div
      key="otp-step"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      {/* Header: back arrow + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          aria-label="Go back to phone entry"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#2a2825",
            color: "#f5f0eb",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#9a9490",
              margin: 0,
            }}
          >
            Verify OTP
          </p>
          <p style={{ fontSize: "0.78rem", color: "#9a9490", marginTop: 2, marginBottom: 0 }}>
            Code sent to{" "}
            <span style={{ color: "#f5f0eb" }}>{maskPhone(phone)}</span>
          </p>
        </div>
      </div>

      {/* Lockout alert */}
      {lockout && error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <Lock size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: "0.78rem", lineHeight: 1.4, color: "#ef4444" }}>
            {error}
          </span>
        </motion.div>
      )}

      {/* OTP digit boxes */}
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend className="sr-only">Enter 4-digit verification code</legend>
        <div
          onPaste={handlePaste}
          style={{ display: "flex", justifyContent: "center", gap: 10 }}
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
              disabled={disabled}
              style={{
                width: 44,
                height: 54,
                borderRadius: 10,
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                background: "#0f0e0d",
                border: `1.5px solid ${val ? "#d45800" : "#2a2825"}`,
                color: "#f5f0eb",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                opacity: disabled ? 0.5 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#d45800";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,88,0,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = val ? "#d45800" : "#2a2825";
                e.currentTarget.style.boxShadow = "none";
              }}
              aria-label={`Digit ${i + 1} of 4`}
            />
          ))}
        </div>
      </fieldset>

      {/* Error below OTP (non-lockout) */}
      {error && !lockout && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 12,
          }}
        >
          <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>
            {error}
          </span>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#9a9490",
          }}
        >
          <span
            className="animate-spin"
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid rgba(212,88,0,0.3)",
              borderTopColor: "#d45800",
            }}
            aria-hidden
          />
          Verifying…
        </p>
      )}

      {/* Resend link */}
      {!isLoading && (
        <p style={{ marginTop: 16, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => onBack()}
            style={{
              fontSize: "0.78rem",
              color: "#9a9490",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f5f0eb";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9a9490";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Resend OTP
          </button>
        </p>
      )}
    </motion.div>
  );
}
