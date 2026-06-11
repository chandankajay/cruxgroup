import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { OrgJsonLd } from "../components/seo/org-json-ld";
import { metaDescription } from "../lib/seo/metadata-helpers";
import { SITE_URL } from "../lib/env";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "JCB & Equipment Rental Telangana | Crux Group", template: "%s | Crux Group" },
  description: metaDescription(
    "Hire JCB, crane, excavator and post hole digger across Telangana. Verified operators, WhatsApp booking and GST invoices. Hyderabad, Kokapet, Shadnagar and 30+ areas.",
  ),
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "JCB & Equipment Rental Telangana | Crux Group",
    description: metaDescription(
      "Hire JCB, crane, excavator and post hole digger across Telangana. Verified operators, WhatsApp booking and GST invoices. Hyderabad, Kokapet, Shadnagar and 30+ areas.",
    ),
    siteName: "Crux Group",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/en";
  const m = pathname.match(/^\/(en|te)(?:\/|$)/);
  const lang = m?.[1] === "te" ? "te" : "en";

  return (
    <html
      lang={lang}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${geist.className} min-h-screen antialiased`}>
        <OrgJsonLd />
        {children}
      </body>
    </html>
  );
}
