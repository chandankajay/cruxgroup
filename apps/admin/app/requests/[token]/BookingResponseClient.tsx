"use client";

import { useState, useEffect, useCallback } from "react";

type Status = "idle" | "loading" | "accepted" | "declined" | "error" | "confirm-decline";

interface BookingResponseClientProps {
  token: string;
  expiresAt: string;
  partnerName: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentImage: string | null;
  customerName: string;
  locationAddress: string;
  startDate: string;
  duration: string;
}

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsUrgent(true);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m remaining`);
      setIsUrgent(hours < 1);
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return { timeLeft, isUrgent };
}

export default function BookingResponseClient({
  token,
  expiresAt,
  partnerName,
  equipmentName,
  equipmentCategory,
  equipmentImage,
  customerName,
  locationAddress,
  startDate,
  duration,
}: BookingResponseClientProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { timeLeft, isUrgent } = useCountdown(expiresAt);

  const handleResponse = useCallback(
    async (action: "ACCEPTED" | "DECLINED") => {
      setStatus("loading");
      try {
        const res = await fetch("/api/booking-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        setStatus(action === "ACCEPTED" ? "accepted" : "declined");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
        setStatus("error");
      }
    },
    [token],
  );

  if (status === "accepted") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ fontSize: 56, marginBottom: 16, textAlign: "center" as const }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#d45800", textAlign: "center" as const, marginBottom: 8 }}>
            Booking Accepted!
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", textAlign: "center" as const, lineHeight: 1.6, marginBottom: 24 }}>
            The customer will be notified. Our team will be in touch to schedule the trip.
          </p>
          <a href="/login" style={styles.portalLink}>View in Partner Portal →</a>
        </div>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ fontSize: 56, marginBottom: 16, textAlign: "center" as const }}>—</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", textAlign: "center" as const, marginBottom: 8 }}>
            Booking Declined
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", textAlign: "center" as const, lineHeight: 1.6 }}>
            We&apos;ll offer the booking to another partner.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ fontSize: 56, marginBottom: 16, textAlign: "center" as const }}>⚠</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#dc2626", textAlign: "center" as const, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", textAlign: "center" as const, lineHeight: 1.6, marginBottom: 24 }}>
            {errorMsg}
          </p>
          <button onClick={() => setStatus("idle")} style={styles.acceptBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#d45800", letterSpacing: -0.5 }}>
            CRUX GROUP
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", textAlign: "center" as const, margin: 0 }}>
          New Booking Request
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", textAlign: "center" as const, marginTop: 4, marginBottom: 20 }}>
          for {partnerName}
        </p>

        {/* Equipment image */}
        {equipmentImage && (
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden" }}>
            <img
              src={equipmentImage}
              alt={equipmentName}
              style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Details card */}
        <div style={styles.card}>
          <DetailRow emoji="🚜" label="Equipment" value={`${equipmentName} (${equipmentCategory})`} />
          <DetailRow emoji="👤" label="Customer" value={customerName} />
          <DetailRow emoji="📍" label="Location" value={locationAddress} />
          <DetailRow emoji="📅" label="Date" value={startDate} />
          <DetailRow emoji="⏱" label="Duration" value={duration} isLast />
        </div>

        {/* Countdown */}
        <div
          style={{
            textAlign: "center" as const,
            fontSize: 13,
            fontWeight: 600,
            color: isUrgent ? "#dc2626" : "#94a3b8",
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          ⏳ {timeLeft}
        </div>

        {/* Actions */}
        {status === "confirm-decline" ? (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: "#475569", textAlign: "center" as const, marginBottom: 12, fontWeight: 600 }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleResponse("DECLINED")}
                disabled={isLoading}
                style={{ ...styles.declineBtn, flex: 1 }}
              >
                Confirm Decline
              </button>
              <button
                onClick={() => setStatus("idle")}
                style={{ ...styles.declineBtn, flex: 1, borderColor: "#d45800", color: "#d45800" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => handleResponse("ACCEPTED")}
              disabled={isLoading}
              style={{ ...styles.acceptBtn, opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? "Processing…" : "✓ Accept Booking"}
            </button>
            <button
              onClick={() => setStatus("confirm-decline")}
              disabled={isLoading}
              style={{ ...styles.declineBtn, marginTop: 10, opacity: isLoading ? 0.6 : 1 }}
            >
              ✗ Decline
            </button>
          </>
        )}

        {/* Footer */}
        <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" as const, marginTop: 24 }}>
          Questions? Call us: +91 90000 90000
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  emoji,
  label,
  value,
  isLast = false,
}: {
  emoji: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        paddingBottom: isLast ? 0 : 14,
        marginBottom: isLast ? 0 : 14,
        borderBottom: isLast ? "none" : "1px solid #f1f5f9",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
        {emoji} {value}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    padding: 16,
  } as React.CSSProperties,
  container: {
    maxWidth: 440,
    width: "100%",
    padding: "0 4px",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: 20,
  } as React.CSSProperties,
  acceptBtn: {
    width: "100%",
    height: 54,
    background: "#d45800",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,
  declineBtn: {
    width: "100%",
    height: 54,
    background: "#fff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,
  portalLink: {
    display: "block",
    textAlign: "center" as const,
    fontSize: 14,
    color: "#d45800",
    textDecoration: "underline",
    fontWeight: 600,
  } as React.CSSProperties,
};
