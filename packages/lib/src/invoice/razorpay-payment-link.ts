export interface RazorpayPaymentLinkResult {
  id: string;
  shortUrl: string;
}

/**
 * Creates a Razorpay Payment Link (amount in paise).
 * @see https://razorpay.com/docs/api/payment-links/create-standard/
 */
export async function createRazorpayPaymentLink(params: {
  amountPaise: number;
  referenceId: string;
  description: string;
  customerName: string;
  customerContact: string;
}): Promise<RazorpayPaymentLinkResult | null> {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  const contactDigits = params.customerContact.replace(/\D/g, "");
  if (!keyId || !keySecret || params.amountPaise < 100 || contactDigits.length < 10) {
    return null;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      accept_partial: false,
      reference_id: params.referenceId.slice(0, 40),
      description: params.description.slice(0, 255),
      customer: {
        name: params.customerName.slice(0, 80),
        contact: contactDigits.slice(-10),
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[razorpay payment_link]", res.status, text);
    return null;
  }

  const data = (await res.json()) as { id?: string; short_url?: string };
  if (!data.id || !data.short_url) return null;
  return { id: data.id, shortUrl: data.short_url };
}
