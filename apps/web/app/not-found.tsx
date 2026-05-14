import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function NotFound(): React.ReactElement {
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
      <h1 className="text-2xl font-bold text-offwhite">Page not found</h1>
      <p className="mt-2 max-w-md text-muted">
        The page you are looking for does not exist or was moved.
      </p>
      <div className="mt-8">
        <Button href="/en" variant="primary" size="md">
          Back to home
        </Button>
      </div>
    </div>
  );
}
