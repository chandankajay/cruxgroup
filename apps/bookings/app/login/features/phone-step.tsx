"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Lock } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const defaultGradient = "linear-gradient(135deg, #d45800 0%, #b84a00 100%)";
const hoverGradient = "linear-gradient(135deg, #ff7a2f 0%, #d45800 100%)";

interface PhoneStepProps {
  readonly onSubmit: (phone: string) => void;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly lockout?: boolean;
}

export function PhoneStep({ onSubmit, isLoading, error, lockout }: PhoneStepProps) {
  const [digits, setDigits] = useState("");
  const [focused, setFocused] = useState(false);

  const isValid = digits.replace(/\D/g, "").length === 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid && !lockout) {
      onSubmit(`+91${digits.replace(/\D/g, "")}`);
    }
  }

  return (
    <motion.div
      key="phone-step"
      initial={{ x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -28, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <form onSubmit={handleSubmit}>
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

        <div>
          {/* Label */}
          <label
            htmlFor="phone-input"
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#9a9490",
              marginBottom: 10,
              display: "block",
            }}
          >
            Your WhatsApp Number
          </label>

          {/* Phone input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0f0e0d",
              border: `1.5px solid ${focused ? "#d45800" : "#2a2825"}`,
              borderRadius: 10,
              height: 54,
              overflow: "hidden",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              boxShadow: focused ? "0 0 0 3px rgba(212,88,0,0.15)" : "none",
            }}
          >
            {/* +91 prefix */}
            <span
              style={{
                padding: "0 14px",
                color: "#f5f0eb",
                fontSize: "1rem",
                fontWeight: 600,
                borderRight: "1px solid #2a2825",
                height: "100%",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                backgroundColor: "#1a1917",
              }}
            >
              +91
            </span>
            {/* Number input */}
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={digits}
              disabled={lockout}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                setDigits(raw);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f5f0eb",
                fontSize: "1.05rem",
                padding: "0 14px",
                height: "100%",
                letterSpacing: "0.05em",
                opacity: lockout ? 0.5 : 1,
              }}
              required
            />
          </div>

          {/* Error below input (non-lockout) */}
          {error && !lockout && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
              }}
            >
              <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>
                {error}
              </span>
            </motion.div>
          )}
        </div>

        {/* GET OTP button */}
        <button
          type="submit"
          disabled={!isValid || isLoading || lockout}
          style={{
            width: "100%",
            height: 54,
            background: defaultGradient,
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            cursor: !isValid || isLoading || lockout ? "not-allowed" : "pointer",
            marginTop: 14,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: !isValid || isLoading || lockout ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = hoverGradient;
              e.currentTarget.style.transform = "scale(1.01)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = defaultGradient;
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.transform = "scale(0.99)";
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
          }}
        >
          {isLoading ? (
            <>
              <LoadingDots />
              Sending…
            </>
          ) : (
            "GET OTP →"
          )}
        </button>

        {/* Helper text */}
        <p
          style={{
            color: "#9a9490",
            fontSize: "0.76rem",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          We&apos;ll send a one-time code on WhatsApp
        </p>
      </form>
    </motion.div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-bounce"
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.7)",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
