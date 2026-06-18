"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  fetchNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationRow,
} from "../sales/actions";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const data = await fetchNotifications();
    if (data) {
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function markRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      await load();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      await load();
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={markAllRead}
                className="text-xs font-medium text-amber-600 hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  disabled={pending}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "block w-full border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50",
                    !n.read && "bg-amber-500/5",
                  )}
                >
                  <p className={cn("text-foreground", !n.read && "font-medium")}>
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("en-IN")}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
