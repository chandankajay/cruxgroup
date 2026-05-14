import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCALES = ["en", "te"] as const;

function pathnameHasLocale(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function withPathname(request: NextRequest, pathname: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return withPathname(request, pathname);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return withPathname(request, pathname);
  }

  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/i.test(pathname)) {
    return withPathname(request, pathname);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  if (!pathnameHasLocale(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  return withPathname(request, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
