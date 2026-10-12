import { NextRequest, NextResponse } from "next/server";
import { deliverInvoiceViaWhatsApp } from "../../../../../lib/invoice-whatsapp-delivery";
import { sendInvoiceWhatsAppBodySchema } from "../../../../(dashboard)/jobs/invoice-whatsapp-schema";

export const dynamic = "force-dynamic";

/**
 * POST /api/invoices/[tripId]/whatsapp
 * Super Admin only — sends invoice PDF link + payment URL via AiSensy.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  const { tripId } = await context.params;

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text.trim()) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sendInvoiceWhatsAppBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 }
    );
  }

  const result = await deliverInvoiceViaWhatsApp({
    tripId,
    destinationPhone: parsed.data.destinationPhone,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
