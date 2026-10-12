"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { LocationPicker } from "../../../../../components/location-picker";
import {
  addPassivePartnerEquipmentAction,
  createPassivePartnerAction,
  type PassivePartnerRow,
} from "../actions";

type CatalogRow = { id: string; name: string; category: string };

export function PassivePartnersClient({
  partners,
  catalog,
}: {
  readonly partners: PassivePartnerRow[];
  readonly catalog: CatalogRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState(17.385);
  const [lng, setLng] = useState(78.4867);
  const [radius, setRadius] = useState(25);
  const [notes, setNotes] = useState("");
  const [gstin, setGstin] = useState("");
  const [fleetPartnerId, setFleetPartnerId] = useState("");
  const [catalogId, setCatalogId] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorPhone, setOperatorPhone] = useState("");
  const [hourlyRate, setHourlyRate] = useState(2500);
  const [dailyRate, setDailyRate] = useState(18000);

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createPassivePartnerAction({
        companyName,
        contactPhone,
        address,
        lat,
        lng,
        maxServiceRadiusKm: radius,
        internalNotes: notes,
        gstNumber: gstin,
      });
      if (res.ok) {
        toast.success("Passive partner created");
        setCompanyName("");
        setContactPhone("");
        setAddress("");
        setNotes("");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleAddFleet = () => {
    if (!fleetPartnerId || !catalogId) {
      toast.error("Select partner and catalog type");
      return;
    }
    startTransition(async () => {
      const res = await addPassivePartnerEquipmentAction(fleetPartnerId, {
        catalogId,
        operatorName,
        operatorPhone,
        hourlyRate: Math.round(hourlyRate * 100),
        dailyRate: Math.round(dailyRate * 100),
      });
      if (res.ok) toast.success("Fleet row added");
      else toast.error(res.error);
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <header>
        <h1 className="text-2xl font-semibold text-charcoal">Passive partners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Offline fleet owners in geo search. Phone required for WhatsApp magic links.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Create passive partner</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact phone (WhatsApp)</Label>
            <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address / base location</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="radius">Service radius (km)</Label>
            <Input
              id="radius"
              type="number"
              min={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN (optional)</Label>
            <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <LocationPicker
              defaultValue={{ lat, lng }}
              prefillAddress={address || null}
              onChange={(v) => {
                setLat(v.lat);
                setLng(v.lng);
                if (v.address) setAddress(v.address);
                if (v.pincode) setPincode(v.pincode);
              }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" disabled={pending} onClick={handleCreate}>
          Create passive partner
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Attach fleet equipment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fleetPartner">Partner</Label>
            <select
              id="fleetPartner"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={fleetPartnerId}
              onChange={(e) => setFleetPartnerId(e.target.value)}
            >
              <option value="">Select…</option>
              {partners.map((p) => (
                <option key={p.partnerId} value={p.partnerId}>
                  {p.companyName} · {p.contactPhone}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catalogId">Catalog type</Label>
            <select
              id="catalogId"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={catalogId}
              onChange={(e) => setCatalogId(e.target.value)}
            >
              <option value="">Select…</option>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Operator name</Label>
            <Input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Operator phone</Label>
            <Input value={operatorPhone} onChange={(e) => setOperatorPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hourly rate (₹)</Label>
            <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Daily rate (₹)</Label>
            <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(Number(e.target.value))} />
          </div>
        </div>
        <Button className="mt-4" variant="outline" disabled={pending} onClick={handleAddFleet}>
          Add equipment row
        </Button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Registered passive partners</h2>
        <ul className="space-y-2">
          {partners.length === 0 ? (
            <li className="text-sm text-muted-foreground">No passive partners yet.</li>
          ) : (
            partners.map((p) => (
              <li
                key={p.partnerId}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-charcoal">{p.companyName}</p>
                    <p className="text-muted-foreground">{p.contactPhone}</p>
                    <p className="text-muted-foreground">{p.address}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                      Passive
                    </span>
                    <p className="mt-1">{p.equipmentCount} machines · {p.maxServiceRadiusKm} km</p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
