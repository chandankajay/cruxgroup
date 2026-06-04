import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { OrgJsonLd } from "../components/seo/org-json-ld";
import { SITE_URL } from "../lib/env";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Crux Group", template: "%s — Crux Group" },
  description: "Telangana's largest heavy equipment rental network",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Crux Group",
    description: "Telangana's largest heavy equipment rental network",
    siteName: "Crux Group",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
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
