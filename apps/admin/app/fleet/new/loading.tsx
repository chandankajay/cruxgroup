export default function FleetNewLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse pb-16">
      <div className="mb-6 h-4 w-36 rounded bg-muted" />
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="h-7 w-48 rounded bg-muted sm:h-8" />
        <div className="mt-2 h-4 w-full max-w-md rounded bg-muted" />
        <div className="mt-8 space-y-5">
          <div className="h-10 w-full rounded-md bg-muted" />
          <div className="h-10 w-full rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-10 rounded-md bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
