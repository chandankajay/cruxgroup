/** When false (default), operator trip completion does not auto-generate invoices. */
export function isAutoInvoiceOnTripComplete(): boolean {
  const raw = process.env["AUTO_INVOICE_ON_TRIP_COMPLETE"] ?? process.env["AUTO_INVOICE_ON_COMPLETE"];
  if (raw == null || raw.trim() === "") return false;
  return raw.trim().toLowerCase() === "true";
}
