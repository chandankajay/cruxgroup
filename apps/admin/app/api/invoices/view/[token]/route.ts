import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { blobGetOptions } from "@repo/lib/blob-storage";
import { isTrustedInvoiceBlobUrl } from "@repo/lib/invoice";
import { parseInvoiceDeliveryToken } from "@repo/lib/invoice";

export const dynamic = "force-dynamic";

/**
 * Public, token-gated PDF proxy for WhatsApp delivery links.
 * Does not require a session — the signed token is the credential (short TTL).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token: rawToken } = await context.params;
  const token = decodeURIComponent(rawToken);
  const parsed = parseInvoiceDeliveryToken(token);
  if (!parsed) {
    return new NextResponse("Link expired or invalid", { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.invoiceId },
    select: { pdfUrl: true, invoiceNumber: true },
  });
  if (!invoice?.pdfUrl || !isTrustedInvoiceBlobUrl(invoice.pdfUrl)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const { access, token: blobToken } = blobGetOptions(invoice.pdfUrl);
    const result = await get(invoice.pdfUrl, { access, token: blobToken });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber.replace(/[^\w.-]+/g, "_")}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[GET /api/invoices/view] blob get failed", e);
    return new NextResponse("Bad gateway", { status: 502 });
  }
}
