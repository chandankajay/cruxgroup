import { dispatchInvoicePaymentReminders } from "../../../../lib/invoice/payment-reminders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env["CRON_SECRET"];
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const counts = await dispatchInvoicePaymentReminders();
  return Response.json({ ok: true, ...counts });
}
