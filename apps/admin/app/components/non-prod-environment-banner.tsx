import { getAppEnv } from "@repo/env";

export function NonProdEnvironmentBanner() {
  const appEnv = getAppEnv();
  if (appEnv === "prod") {
    return null;
  }

  const label = appEnv === "ci" ? "CI" : "DEV";

  return (
    <div
      role="status"
      className="sticky top-0 z-[100] w-full bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-black"
    >
      {label} environment — not production. Actions here do not affect live customers.
    </div>
  );
}
