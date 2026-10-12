import { sendInvoiceReceiptWhatsApp } from "../aisensy";
import { buildCustomerReviewLink } from "../review-link";

export function invoicePdfFilename(invoiceNumber: string): string {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, "_").slice(0, 80);
  return `Crux-Invoice-${safe || "receipt"}.pdf`;
}

/**
 * WhatsApp invoice receipt: PDF file header + single body param (ratings/review link).
 * Invoice number, amount, and payment details live only in the generated PDF.
 */
export async function dispatchInvoiceReceiptWhatsApp(params: {
  customerPhone: string;
  pdfUrl: string;
  invoiceNumber: string;
  reviewToken: string;
}): Promise<boolean> {
  return sendInvoiceReceiptWhatsApp({
    destinationPhone: params.customerPhone,
    pdfUrl: params.pdfUrl,
    pdfFilename: invoicePdfFilename(params.invoiceNumber),
    ratingsLink: buildCustomerReviewLink(params.reviewToken),
  });
}
