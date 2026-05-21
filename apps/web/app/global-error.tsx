"use client";

import { Geist } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-[#0f0e0d] text-[#f5f0eb]`}>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <Link href="/en" className="mb-8">
            <Image
              src="/logo.png"
              alt="Crux Group"
              width={220}
              height={52}
              className="h-10 w-auto max-w-[min(220px,85vw)] object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold">Critical error</h1>
          <p className="mt-2 text-[#9a9490]">
            The application failed to load. Please reload the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-lg bg-[#d45800] px-5 py-2.5 font-semibold text-white"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
