"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-4 text-center">
      <Link href="/en" className="mb-8">
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={220}
          height={52}
          className="h-10 w-auto max-w-[min(220px,85vw)] object-contain"
        />
      </Link>
      <h1 className="text-2xl font-bold text-offwhite">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">
        Please try again. If the problem continues, return to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" size="md" onClick={() => reset()}>
          Reload
        </Button>
        <Button href="/en" variant="outline" size="md">
          Go home
        </Button>
      </div>
    </div>
  );
}
