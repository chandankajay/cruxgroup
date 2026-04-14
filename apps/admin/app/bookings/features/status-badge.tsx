import type { BookingStatus } from "@repo/api";

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  PENDING: {
    label: "Pending",
    bg: "#FFF7ED",
    text: "#C2410C",
    dot: "#F97316",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "#F0FDF4",
    text: "#15803D",
    dot: "#22C55E",
  },
  DISPATCHED: {
    label: "Dispatched",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    dot: "#3B82F6",
  },
  COMPLETED: {
    label: "Completed",
    bg: "#F8FAFC",
    text: "#475569",
    dot: "#94A3B8",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "#FEF2F2",
    text: "#B91C1C",
    dot: "#EF4444",
  },
};

interface StatusBadgeProps {
  readonly status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.text,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
