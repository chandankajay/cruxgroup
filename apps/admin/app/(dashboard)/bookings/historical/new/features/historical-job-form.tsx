"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { MasterCatalogFormRow } from "../../../../../fleet/catalog-types";
import {
  buildFleetPickerLabel,
  PartnerFleetPicker,
  type PartnerFleetOption,
} from "../../../../../../components/partner-fleet-picker";
import { LocationPicker, type LocationPickerValue } from "../../../../../../components/location-picker";
import { fetchPartnerFleetOptions } from "../../../admin-walk-in/actions";
import { createHistoricalJobAction } from "../actions";

type Partner = { id: string; companyName: string; contactPhone: string; kind: string };
type Customer = { id: string; name: string; phone: string; gstin: string | null };

function fmtInrPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function HistoricalJobForm({
  partners,
  customers: initialCustomers,
  catalog,
}: {
  readonly partners: Partner[];
  readonly customers: Customer[];
  readonly catalog: MasterCatalogFormRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customers] = useState(initialCustomers);
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? "");
  const [catalogId, setCatalogId] = useState(catalog[0]?.id ?? "");
  const [fleet, setFleet] = useState<PartnerFleetOption[]>([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [siteAddress, setSiteAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState(17.385);
  const [lng, setLng] = useState(78.4867);
  const [actualStartLocal, setActualStartLocal] = useState("");
  const [actualEndLocal, setActualEndLocal] = useState("");
  const [assignMode, setAssignMode] = useState<"DIRECT" | "PARTNER_REQUEST">("DIRECT");
  const [pricingUnit, setPricingUnit] = useState<"hourly" | "daily">("hourly");
  const [duration, setDuration] = useState(8);

  const selectedCatalog = catalog.find((c) => c.id === catalogId);
  const selectedPartner = partners.find((p) => p.id === partnerId);

  const loadPartnerFleet = async (id: string) => {
    setEquipmentId("");
    const rows = await fetchPartnerFleetOptions(id);
    const options: PartnerFleetOption[] = rows.map((r) => ({
      ...r,
      label: buildFleetPickerLabel(r),
    }));
    setFleet(options);
  };

  useEffect(() => {
    if (partnerId) void loadPartnerFleet(partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPartnerChange = async (id: string) => {
    setPartnerId(id);
    await loadPartnerFleet(id);
  };

  const submit = () => {
    if (!catalogId) {
      toast.error("Select a machine type from the master catalog.");
      return;
    }
    if (!actualStartLocal || !actualEndLocal) {
      toast.error("Enter actual start and end times.");
      return;
    }
    if (actualEndLocal <= actualStartLocal) {
      toast.error("Actual end must be after actual start.");
      return;
    }

    startTransition(async () => {
      const res = await createHistoricalJobAction({
        mode: "existing",
        customerId,
        partnerId,
        catalogId,
        equipmentId: equipmentId || undefined,
        siteAddress,
        pincode,
        lat,
        lng,
        pricingUnit,
        duration,
        startLocal: actualStartLocal,
        endLocal: actualEndLocal,
        actualStartLocal,
        actualEndLocal,
        assignMode,
        newName: "",
        newPhone: "",
      });
      if (res.ok) {
        toast.success("Past job recorded (no notifications sent)");
        router.push(`/invoices/compose?tripId=${res.tripId}`);
      } else toast.error(res.error);
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Partner</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={partnerId}
            onChange={(e) => void onPartnerChange(e.target.value)}
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.companyName} · {p.contactPhone} ({p.kind})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="catalogId">Machine type (master catalog)</Label>
          <select
            id="catalogId"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={catalogId}
            onChange={(e) => setCatalogId(e.target.value)}
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.category} · {fmtInrPaise(c.minHourlyRate)}–
                {fmtInrPaise(c.maxHourlyRate)}/hr
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Used for past records when the partner has no fleet row yet. A fleet entry is created
            automatically if needed.
          </p>
        </div>

        {fleet.length > 0 ? (
          <div className="sm:col-span-2">
            <PartnerFleetPicker
              id="equipmentIdOptional"
              options={fleet}
              value={equipmentId}
              onChange={setEquipmentId}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Optional — pick a specific fleet row for {selectedPartner?.companyName ?? "partner"}.
              Leave blank to use catalog only.
            </p>
          </div>
        ) : selectedCatalog ? (
          <p className="sm:col-span-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            No active fleet for this partner — using catalog:{" "}
            <span className="font-medium text-foreground">{selectedCatalog.name}</span>
          </p>
        ) : null}

        <div className="space-y-2">
          <Label>Customer</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Pricing unit</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={pricingUnit}
            onChange={(e) => setPricingUnit(e.target.value as "hourly" | "daily")}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <Input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label>Assign mode</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={assignMode}
            onChange={(e) => setAssignMode(e.target.value as "DIRECT" | "PARTNER_REQUEST")}
          >
            <option value="DIRECT">Direct (record only)</option>
            <option value="PARTNER_REQUEST">Partner request (no notify for historical)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Actual start (IST)</Label>
          <Input
            type="datetime-local"
            value={actualStartLocal}
            onChange={(e) => setActualStartLocal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Actual end (IST)</Label>
          <Input
            type="datetime-local"
            value={actualEndLocal}
            onChange={(e) => setActualEndLocal(e.target.value)}
          />
        </div>
      </div>

      <LocationPicker
        defaultValue={{ lat, lng }}
        prefillAddress={siteAddress || null}
        onChange={(v: LocationPickerValue) => {
          setLat(v.lat);
          setLng(v.lng);
          setSiteAddress(v.address);
          if (v.pincode) setPincode(v.pincode);
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} onClick={submit}>
          Save past job record
        </Button>
        <Link
          href="/invoices"
          className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium"
        >
          Send invoices
        </Link>
      </div>
    </motion.div>
  );
}
