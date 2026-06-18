"use client";

import { useCallback, useEffect, useState } from "react";
import type { BookingProgressStage } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import {
  BookingProgressTracker,
  type ProgressHistoryEntry,
} from "../../../components/BookingProgressTracker";

type ProgressPayload = {
  progressStage: BookingProgressStage;
  bookingStatus?: string;
  progressHistory: ProgressHistoryEntry[];
};

const POLL_INTERVAL_MS = 15_000;

export function BookingProgressPoller(props: {
  bookingId: string;
  bookingStatus?: string;
  initial: ProgressPayload;
}) {
  const [data, setData] = useState<ProgressPayload>(props.initial);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${props.bookingId}/progress`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as ProgressPayload;
      setData(json);
    } catch {
      /* ignore transient poll errors */
    }
  }, [props.bookingId]);

  const bookingStatus = data.bookingStatus ?? props.bookingStatus;

  useEffect(() => {
    void fetchProgress();
    const id = window.setInterval(fetchProgress, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchProgress]);

  return (
    <Card className="border-brand-navy/10 shadow-md">
      <CardHeader className="border-b border-brand-navy/8 bg-gradient-to-br from-amber-50/60 to-white pb-4">
        <CardTitle className="text-xl text-brand-navy">Booking progress</CardTitle>
        <CardDescription className="text-brand-navy/70">
          Track your booking from request to completion
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <BookingProgressTracker
          progressStage={data.progressStage}
          progressHistory={data.progressHistory}
          bookingStatus={bookingStatus}
        />
      </CardContent>
    </Card>
  );
}
