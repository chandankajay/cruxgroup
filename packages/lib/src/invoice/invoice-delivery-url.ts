import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signingSecret(): string {
  const s =
    process.env.INVOICE_DELIVERY_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error(
      "Set INVOICE_DELIVERY_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET for signed invoice PDF URLs.",
    );
  }
  return s || "dev-only-invoice-delivery-secret";
}

type InvoiceDeliveryPayload = {
  invoiceId: string;
  exp: number;
};

/**
 * HTTPS origin AiSensy uses to fetch invoice PDFs via `/api/invoices/view/[token]`.
 * For local WhatsApp tests, set `ADMIN_PUBLIC_URL` to your ngrok / Cloudflare tunnel URL.
 */
export function resolveAdminPublicOrigin(): string {
  const tunnel =
    process.env.ADMIN_PUBLIC_URL?.trim() ||
    process.env.INVOICE_DELIVERY_PUBLIC_ORIGIN?.trim();
  if (tunnel) return tunnel.replace(/\/$/, "");

  const nextauth = process.env.NEXTAUTH_URL?.trim();
  if (nextauth && !/localhost|127\.0\.0\.1/i.test(nextauth)) {
    return nextauth.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return (nextauth || "http://localhost:3001").replace(/\/$/, "");
}

export function isLocalAdminOrigin(origin: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(origin);
}

export function createInvoiceDeliveryToken(
  invoiceId: string,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const payload = Buffer.from(
    JSON.stringify({ invoiceId, exp: Date.now() + ttlMs } satisfies InvoiceDeliveryPayload),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseInvoiceDeliveryToken(token: string): { invoiceId: string } | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0 || lastDot >= token.length - 1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const o = JSON.parse(raw) as Partial<InvoiceDeliveryPayload>;
    if (!o.invoiceId || typeof o.exp !== "number") return null;
    if (Date.now() > o.exp) return null;
    return { invoiceId: o.invoiceId };
  } catch {
    return null;
  }
}

/** Token-gated proxy URL — safe to send to AiSensy instead of raw Blob URLs. */
export function buildSignedInvoicePdfUrl(invoiceId: string): string {
  const origin = resolveAdminPublicOrigin();
  if (isLocalAdminOrigin(origin)) {
    console.warn(
      "[invoice] WhatsApp cannot fetch PDFs from localhost. Run `pnpm dev:tunnel` in apps/admin, " +
        "set ADMIN_PUBLIC_URL=https://….ngrok-free.app in .env, restart dev server.",
    );
  }
  const token = createInvoiceDeliveryToken(invoiceId);
  return `${origin}/api/invoices/view/${encodeURIComponent(token)}`;
}
