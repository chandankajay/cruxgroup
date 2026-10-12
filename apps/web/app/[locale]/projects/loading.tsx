export default function ProjectsLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-9 w-64 rounded bg-zinc-800" />
        <div className="h-4 w-full max-w-xl rounded bg-zinc-800" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-4 aspect-video w-full rounded-xl bg-zinc-800" />
              <div className="h-5 w-3/4 rounded bg-zinc-800" />
              <div className="mt-2 h-4 w-1/2 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
