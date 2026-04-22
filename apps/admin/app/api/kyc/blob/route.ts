import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

const BLOB_HOST_SUFFIX = "blob.vercel-storage.com";

function isTrustedKycBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith(BLOB_HOST_SUFFIX)) return false;
    return u.pathname.includes("/kyc/");
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl || !isTrustedKycBlobUrl(rawUrl)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const role = (session.user as { role?: string }).role;
  const userId = session.user.id;

  if (role === "PARTNER") {
    if (!rawUrl.includes(`/kyc/${userId}/`)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } else if (role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
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
    console.error("[api/kyc/blob] get failed", e);
    return new NextResponse("Bad gateway", { status: 502 });
  }
}
