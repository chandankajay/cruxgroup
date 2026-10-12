"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  buildFleetPickerLabel,
  PartnerFleetPicker,
  type PartnerFleetOption,
} from "../../../../../components/partner-fleet-picker";
import { LocationPicker } from "../../../../../components/location-picker";
import { createAdminWalkInBookingAction } from "../actions";

type Partner = { id: string; companyName: string; contactPhone: string; kind: string };
type Customer = { id: string; name: string; phone: string; gstin: string | null };

export function AdminWalkInForm({
  partners,
  customers,
  loadFleet,
}: {
  readonly partners: Partner[];
  readonly customers: Customer[];
  readonly loadFleet: (partnerId: string) => Promise<
    {
      id: string;
      name: string;
      category: string;
      catalogName: string | null;
      operatorPhone: string;
      operatorName: string;
      partnerBaseLocation: string | null;
      hourlyBase: number;
      dailyBase: number;
      partnerId: string;
    }[]
  >;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? "");
  const [fleet, setFleet] = useState<PartnerFleetOption[]>([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [siteAddress, setSiteAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState(17.385);
  const [lng, setLng] = useState(78.4867);
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [assignMode, setAssignMode] = useState<"DIRECT" | "PARTNER_REQUEST">("DIRECT");
  const [pricingUnit, setPricingUnit] = useState<"hourly" | "daily">("hourly");
  const [duration, setDuration] = useState(8);

  const reloadFleet = async (id: string) => {
    setPartnerId(id);
    setEquipmentId("");
    const rows = await loadFleet(id);
    const options = rows.map((r) => ({ ...r, label: buildFleetPickerLabel(r) }));
    setFleet(options);
    if (options[0]) setEquipmentId(options[0].id);
  };

  useEffect(() => {
    if (partnerId) void reloadFleet(partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    startTransition(async () => {
      const res = await createAdminWalkInBookingAction({
        mode: "existing",
        customerId,
        partnerId,
        equipmentId,
        siteAddress,
        pincode,
        lat,
        lng,
        pricingUnit,
        duration,
        startLocal,
        endLocal,
        assignMode,
        newName: "",
        newPhone: "",
      });
      if (res.ok) {
        toast.success(
          res.notifyFailed ? "Booking saved — some WhatsApp alerts failed" : "Walk-in booking created",
        );
        router.push("/bookings");
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
            onChange={(e) => void reloadFleet(e.target.value)}
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.companyName} · {p.contactPhone} ({p.kind})
              </option>
            ))}
          </select>
        </div>
        <PartnerFleetPicker options={fleet} value={equipmentId} onChange={setEquipmentId} />
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
          <Label>Assign mode</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={assignMode}
            onChange={(e) => setAssignMode(e.target.value as "DIRECT" | "PARTNER_REQUEST")}
          >
            <option value="DIRECT">Direct assign (confirmed + operator link)</option>
            <option value="PARTNER_REQUEST">Send partner accept/reject link</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Start (IST)</Label>
          <Input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End (IST)</Label>
          <Input type="datetime-local" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Pricing</Label>
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
          <Input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
      </div>
      <LocationPicker
        defaultValue={{ lat, lng }}
        prefillAddress={siteAddress || null}
        onChange={(v) => {
          setLat(v.lat);
          setLng(v.lng);
          setSiteAddress(v.address);
          if (v.pincode) setPincode(v.pincode);
        }}
      />
      <Button disabled={pending} onClick={submit}>
        Create admin walk-in
      </Button>
    </motion.div>
  );
}
