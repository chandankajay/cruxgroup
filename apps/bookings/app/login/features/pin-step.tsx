"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { DigitCodeInput } from "./digit-code-input";

const ease = [0.16, 1, 0.3, 1] as const;

interface PinStepProps {
  readonly phone: string;
  readonly onSubmit: (pin: string) => void;
  readonly onBack: () => void;
  readonly onForgotPin: () => void;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly lockout?: boolean;
  readonly cells: string[];
  readonly setCells: React.Dispatch<React.SetStateAction<string[]>>;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) return `+91 ${digits.slice(0, 2)}****${digits.slice(6)}`;
  return phone;
}

export function PinStep({
  phone,
  onSubmit,
  onBack,
  onForgotPin,
  isLoading,
  error,
  lockout,
  cells,
  setCells,
}: PinStepProps) {
  const disabled = isLoading || lockout;

  return (
    <motion.div key="pin-step" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ duration: 0.3, ease }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button type="button" onClick={onBack} disabled={isLoading} aria-label="Go back" style={{ width: 36, height: 36, borderRadius: 8, border: "none", backgroundColor: "#2a2825", color: "#f5f0eb", cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a9490", margin: 0 }}>Enter PIN</p>
          <p style={{ fontSize: "0.78rem", color: "#9a9490", marginTop: 2 }}>{maskPhone(phone)}</p>
        </div>
      </div>

      {lockout && error && (
        <div style={{ display: "flex", gap: 10, borderRadius: 8, padding: 12, marginBottom: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <Lock size={16} color="#ef4444" />
          <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{error}</span>
        </div>
      )}

      <DigitCodeInput
        cells={cells}
        setCells={setCells}
        onComplete={onSubmit}
        disabled={disabled}
        resetKey={error}
      />

      {error && !lockout && (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{error}</span>
        </div>
      )}

      {!isLoading && (
        <p style={{ marginTop: 16, textAlign: "center" }}>
          <button type="button" onClick={onForgotPin} style={{ fontSize: "0.78rem", color: "#d45800", background: "none", border: "none", cursor: "pointer" }}>
            Forgot PIN?
          </button>
        </p>
      )}
    </motion.div>
  );
}
