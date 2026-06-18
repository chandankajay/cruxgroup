"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useLabels } from "@repo/ui/dictionary-provider";

const ease = [0.16, 1, 0.3, 1] as const;

interface SetPinStepProps {
  readonly mode: "setup" | "reset";
  readonly onSubmit: (pin: string, confirmPin: string) => void;
  readonly isLoading: boolean;
  readonly error?: string;
}

function PinCells({
  cells,
  onChange,
  onPaste,
  disabled,
  label,
}: {
  readonly cells: string[];
  readonly onChange: (index: number, value: string) => void;
  readonly onPaste: (e: React.ClipboardEvent) => void;
  readonly disabled: boolean;
  readonly label: string;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((i: number) => {
    inputsRef.current[i]?.focus();
  }, []);

  useEffect(() => {
    focusIndex(0);
  }, [focusIndex]);

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !cells[index] && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      onChange(index - 1, "");
    }
  }

  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: "#9a9490",
          marginBottom: 10,
        }}
      >
        {label}
      </legend>
      <div
        onPaste={onPaste}
        style={{ display: "flex", justifyContent: "center", gap: 10 }}
      >
        {cells.map((val, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => onChange(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            style={{
              width: 44,
              height: 54,
              borderRadius: 10,
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "#0f0e0d",
              border: `1.5px solid ${val ? "#d45800" : "#2a2825"}`,
              color: "#f5f0eb",
              outline: "none",
              opacity: disabled ? 0.5 : 1,
            }}
            aria-label={`${label} digit ${i + 1}`}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function SetPinStep({ mode, onSubmit, isLoading, error }: SetPinStepProps) {
  const t = useLabels();
  const [pinCells, setPinCells] = useState(() => Array.from({ length: 4 }, () => ""));
  const [confirmCells, setConfirmCells] = useState(() => Array.from({ length: 4 }, () => ""));

  useEffect(() => {
    if (!error) return;
    setPinCells(Array.from({ length: 4 }, () => ""));
    setConfirmCells(Array.from({ length: 4 }, () => ""));
  }, [error]);

  function updateCells(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handlePaste(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    e: React.ClipboardEvent,
  ) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    setter(Array.from({ length: 4 }, (_, i) => pasted[i] ?? ""));
  }

  const pin = pinCells.join("");
  const confirmPin = confirmCells.join("");
  const canSubmit = pin.length === 4 && confirmPin.length === 4 && !isLoading;

  return (
    <motion.div
      key="set-pin-step"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: "#9a9490",
          marginBottom: 16,
        }}
      >
        {mode === "reset" ? t("LOGIN_SET_PIN") : t("LOGIN_SET_PIN")}
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          background: "rgba(212,88,0,0.08)",
          border: "1px solid rgba(212,88,0,0.25)",
        }}
      >
        <AlertTriangle size={16} color="#d45800" style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "#9a9490" }}>
          {t("LOGIN_SHARED_DEVICE_WARNING")}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PinCells
          cells={pinCells}
          label={t("LOGIN_SET_PIN")}
          disabled={isLoading}
          onChange={(i, v) => updateCells(setPinCells, i, v)}
          onPaste={(e) => handlePaste(setPinCells, e)}
        />
        <PinCells
          cells={confirmCells}
          label={t("LOGIN_CONFIRM_PIN")}
          disabled={isLoading}
          onChange={(i, v) => updateCells(setConfirmCells, i, v)}
          onPaste={(e) => handlePaste(setConfirmCells, e)}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 12,
          }}
        >
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{error}</span>
        </motion.div>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit(pin, confirmPin)}
        style={{
          width: "100%",
          height: 54,
          background: "linear-gradient(135deg, #d45800 0%, #b84a00 100%)",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontSize: "0.95rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          marginTop: 20,
          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.5,
        }}
      >
        {isLoading ? "Saving…" : "Continue →"}
      </button>
    </motion.div>
  );
}
