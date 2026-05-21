"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import type { MyBookingCardData } from "../data";
import { BookingCard } from "./booking-card";

export function MyBookingsDashboard({
  active,
  past,
}: {
  readonly active: MyBookingCardData[];
  readonly past: MyBookingCardData[];
}) {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 sm:max-w-lg">
        <TabsTrigger value="active" className="text-xs sm:text-sm">
          Active / upcoming
          {active.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy sm:text-xs">
              {active.length}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="past" className="text-xs sm:text-sm">
          Past rentals
          {past.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy sm:text-xs">
              {past.length}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="space-y-4">
        {active.length === 0 ? (
          <EmptyTab message="No active or upcoming bookings. Book equipment from the home page." />
        ) : (
          active.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </TabsContent>
      <TabsContent value="past" className="space-y-4">
        {past.length === 0 ? (
          <EmptyTab message="No completed or cancelled rentals yet." />
        ) : (
          past.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyTab({ message }: { readonly message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-brand-navy/[0.03] px-4 py-12 text-center text-sm font-medium text-brand-navy/65">
      {message}
    </div>
  );
}
