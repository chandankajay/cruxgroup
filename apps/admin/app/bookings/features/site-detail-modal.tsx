"use client";

import type { BookingRow } from "../actions";

interface SiteDetailModalProps {
  readonly booking: BookingRow | null;
  readonly onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export function SiteDetailModal({ booking, onClose }: SiteDetailModalProps) {
  if (!booking) return null;

  const { location, pricing, startDate, endDate, createdAt } = booking;

  const formatDate = (d: Date | string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: 2 }}>
              Booking #{booking.id.slice(-6).toUpperCase()}
            </p>
            <h2 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
              Site Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "4px 24px 24px" }}>
          <DetailRow label="Equipment" value={booking.equipment.name} />
          <DetailRow
            label="Customer"
            value={booking.user.name ?? "—"}
          />
          <DetailRow
            label="Phone"
            value={booking.user.phoneNumber ?? "—"}
          />
          <DetailRow label="Site Address" value={location.address} />
          <DetailRow label="Pincode" value={location.pincode} />
          <DetailRow
            label="Coordinates"
            value={
              location.coordinates.lat !== 0 || location.coordinates.lng !== 0
                ? `${location.coordinates.lat.toFixed(5)}, ${location.coordinates.lng.toFixed(5)}`
                : "Not captured"
            }
          />
          <DetailRow label="Start Date" value={formatDate(startDate)} />
          <DetailRow label="End Date" value={formatDate(endDate)} />
          <DetailRow
            label="Duration"
            value={`${pricing.duration} day${pricing.duration !== 1 ? "s" : ""}`}
          />
          <DetailRow
            label="Total Price"
            value={`₹${(pricing.total / 100).toLocaleString("en-IN")}`}
          />
          <DetailRow label="Requested On" value={formatDate(createdAt)} />
        </div>
      </div>
    </div>
  );
}
