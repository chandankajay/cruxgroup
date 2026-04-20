import { prisma } from "@repo/db";
import { OperatorJobClient, type OperatorTripPayload } from "./operator-job-client";
import { parseJobLocationCoords } from "../../lib/parse-job-location";

function maskCustomerPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  if (local.length < 5) return "—";
  if (local.length < 10) {
    return `${local.slice(0, 5)}${"X".repeat(Math.max(0, local.length - 5))}`;
  }
  return `${local.slice(0, 5)}XXXXX`;
}

function LinkExpired() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Link expired</h1>
      <p className="mt-6 max-w-sm text-xl font-semibold text-neutral-400">
        This link is invalid or no longer works. Ask dispatch for a new link if you still need access.
      </p>
    </div>
  );
}

function InactiveJobMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-6 max-w-md text-xl font-semibold text-neutral-400">{body}</p>
    </div>
  );
}

export default async function OperatorMagicLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw).trim();
  if (!token) return <LinkExpired />;

  const trip = await prisma.trip.findUnique({
    where: { operatorToken: token },
    include: {
      user: { select: { phoneNumber: true } },
      equipment: { select: { name: true, category: true } },
    },
  });

  if (!trip) return <LinkExpired />;

  if (trip.status === "SCHEDULED") {
    return (
      <InactiveJobMessage
        title="Job not ready"
        body="This trip has not been confirmed yet. Check back after the customer confirms the booking."
      />
    );
  }

  if (trip.status === "CANCELLED" || trip.status === "DISPUTED") {
    return <LinkExpired />;
  }

  const coords = parseJobLocationCoords(trip.jobLocation);
  const mapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : null;

  const jobLabel = `${trip.equipment.category} ${trip.equipment.name}`.trim();
  const payload: OperatorTripPayload = {
    token,
    status: trip.status,
    isOverrun: trip.status === "OVERRUN",
    jobLabel,
    customerMasked: maskCustomerPhone(trip.user.phoneNumber),
    mapsUrl,
    actualStartTimeIso: trip.actualStartTime?.toISOString() ?? null,
    totalBilledHours: trip.totalBilledHours,
  };

  return <OperatorJobClient initial={payload} />;
}
