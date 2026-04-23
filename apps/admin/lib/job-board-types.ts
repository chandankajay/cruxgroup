/** Invoice row for a completed trip (from DB); null if not generated yet. */
export type LiveTripInvoiceDto = {
  id: string;
  invoiceNumber: string;
  pdfUrl: string | null;
  paymentLinkUrl: string | null;
};

export interface LiveTripJobDto {
  id: string;
  /** Present when the trip is tied to a booking (e.g. walk-in); used for reschedule deep-link. */
  bookingId: string | null;
  status: string;
  scheduledDate: string;
  expectedEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  machine: { name: string; category: string };
  operator: { name: string; phone: string };
  customer: { name: string; phone: string };
  partnerCompany: string;
  locationLabel: string;
  /** Populated for completed trips when an invoice exists (or null for manual generate). */
  invoice: LiveTripInvoiceDto | null;
}

export interface LiveJobsPayload {
  live: LiveTripJobDto[];
  recentCompleted: LiveTripJobDto[];
}
