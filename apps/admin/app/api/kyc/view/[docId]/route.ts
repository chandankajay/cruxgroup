import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { auth } from "../../../../../lib/auth";
import { parseKycDocViewToken, type KycDocKind } from "../../../../../lib/kyc-doc-view-token";

export const dynamic = "force-dynamic";

function blobUrlForKind(
  partner: {
    panDocUrl: string | null;
    aadhaarDocUrl: string | null;
    cancelledChequeUrl: string | null;
  },
  kind: KycDocKind
): string | null {
  if (kind === "pan") return partner.panDocUrl;
  if (kind === "aadhaar") return partner.aadhaarDocUrl;
  return partner.cancelledChequeUrl;
}

function isTrustedKycBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("blob.vercel-storage.com")) return false;
    return u.pathname.includes("/kyc/");
  } catch {
    return false;
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ docId: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { docId: rawDocId } = await context.params;
  const docId = decodeURIComponent(rawDocId);
  const parsed = parseKycDocViewToken(docId);
  if (!parsed) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const partner = await prisma.partner.findUnique({
    where: { id: parsed.partnerId },
    select: {
      panDocUrl: true,
      aadhaarDocUrl: true,
      cancelledChequeUrl: true,
    },
  });
  if (!partner) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rawUrl = blobUrlForKind(partner, parsed.kind);
  if (!rawUrl || !isTrustedKycBlobUrl(rawUrl)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = process.env["BLOB_READ_WRITE_TOKEN"]?.trim();
  if (!token) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const isPrivate = rawUrl.includes(".private.blob.");
  const access = isPrivate ? "private" : "public";

  try {
    const result = await get(rawUrl, { access, token });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[api/kyc/view] blob get failed", e);
    return new NextResponse("Bad gateway", { status: 502 });
  }
}
