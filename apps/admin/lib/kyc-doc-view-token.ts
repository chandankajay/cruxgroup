import { createHmac, timingSafeEqual } from "node:crypto";

const DOC_KINDS = ["pan", "aadhaar", "cheque"] as const;
export type KycDocKind = (typeof DOC_KINDS)[number];

function signingSecret(): string {
  const s =
    process.env["KYC_DOC_VIEW_SECRET"]?.trim() ||
    process.env["AUTH_SECRET"]?.trim() ||
    process.env["NEXTAUTH_SECRET"]?.trim();
  if (!s && process.env["NODE_ENV"] === "production") {
    throw new Error(
      "Set KYC_DOC_VIEW_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET for signed KYC document URLs."
    );
  }
  return s || "dev-only-kyc-doc-view-secret";
}

/**
 * Opaque, signed token for `/api/kyc/view/[docId]` — does not expose raw Blob URLs in the UI.
 */
export function createKycDocViewToken(partnerId: string, kind: KycDocKind): string {
  const payload = Buffer.from(JSON.stringify({ partnerId, kind }), "utf8").toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseKycDocViewToken(token: string): { partnerId: string; kind: KycDocKind } | null {
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
    const o = JSON.parse(raw) as { partnerId?: string; kind?: string };
    if (!o.partnerId || !o.kind) return null;
    if (!DOC_KINDS.includes(o.kind as KycDocKind)) return null;
    return { partnerId: o.partnerId, kind: o.kind as KycDocKind };
  } catch {
    return null;
  }
}
