import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { DictionaryProvider } from "@repo/ui/dictionary-provider";
import { NavigationHeader } from "./components/navigation-header";
import { PageTransition } from "./components/page-transition";
import { getBookingLabels } from "./lib/get-labels";

const geist = Geist({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crux Group Bookings",
  description: "Book construction equipment with Crux Group",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const labels = await getBookingLabels();

  return (
    <html lang="en">
      <body className={geist.className}>
        <DictionaryProvider labels={labels}>
          <NavigationHeader />
          <PageTransition>{children}</PageTransition>
          <Toaster position="top-center" richColors closeButton />
        </DictionaryProvider>
      </body>
    </html>
  );
}
