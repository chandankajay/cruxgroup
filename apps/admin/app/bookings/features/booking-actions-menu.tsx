"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@repo/ui/button";
import type { BookingStatus } from "@repo/api";

interface StatusAction {
  label: string;
  status: BookingStatus;
  color: string;
}

const STATUS_ACTIONS: StatusAction[] = [
  { label: "Confirm Booking", status: "CONFIRMED", color: "#15803D" },
  { label: "Mark Dispatched", status: "DISPATCHED", color: "#1D4ED8" },
  { label: "Mark Completed", status: "COMPLETED", color: "#475569" },
  { label: "Cancel Booking", status: "CANCELLED", color: "#B91C1C" },
];

interface BookingActionsMenuProps {
  readonly bookingId: string;
  readonly currentStatus: BookingStatus;
  readonly onViewSite: () => void;
  readonly onStatusChange: (id: string, status: BookingStatus) => void;
  readonly isUpdating: boolean;
}

export function BookingActionsMenu({
  bookingId,
  currentStatus,
  onViewSite,
  onStatusChange,
  isUpdating,
}: BookingActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableActions = STATUS_ACTIONS.filter(
    (a) => a.status !== currentStatus
  );

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <Button
        size="sm"
        variant="outline"
        disabled={isUpdating}
        onClick={() => setOpen((prev) => !prev)}
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        Actions
        <span style={{ fontSize: "0.6rem", marginTop: 1 }}>▼</span>
      </Button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            zIndex: 50,
            minWidth: 180,
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              onViewSite();
              setOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "9px 14px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#1e3a8a",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f1f5f9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            📍 View Site Details
          </button>

          <div style={{ borderTop: "1px solid #f1f5f9" }} />

          {availableActions.map((action) => (
            <button
              key={action.status}
              onClick={() => {
                onStatusChange(bookingId, action.status);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: action.color,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
