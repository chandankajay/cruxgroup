"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Dialog, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import {
  downloadEmployeePayslipAction,
  loadEmployeePayrollMonthAction,
  saveEmployeePayrollAction,
  upsertEmployeeAction,
  type EmployeePayrollRow,
  type EmployeeRow,
} from "../employee-actions";

function istNowYearMonth(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value ?? new Date().getFullYear());
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  return { year, month };
}

function paiseToInrInput(paise: number): string {
  return (paise / 100).toFixed(2);
}

function parseInrToPaise(raw: string): number | null {
  const n = Number(raw.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

type EditablePayrollRow = EmployeePayrollRow & {
  incentivesInr: string;
  deductionsInr: string;
};

export function EmployeePayrollClient({
  initialEmployees,
}: {
  readonly initialEmployees: EmployeeRow[];
}) {
  const router = useRouter();
  const { year: defaultYear, month: defaultMonth } = istNowYearMonth();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [employees, setEmployees] = useState(initialEmployees);
  const [rows, setRows] = useState<EditablePayrollRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeRow | null>(null);
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [doj, setDoj] = useState("");
  const [baseSalaryInr, setBaseSalaryInr] = useState("");
  const [pending, startTransition] = useTransition();

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }),
      })),
    []
  );

  const loadMonth = useCallback(() => {
    startTransition(async () => {
      const res = await loadEmployeePayrollMonthAction({ year, month });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setRows(
        res.rows.map((r) => ({
          ...r,
          incentivesInr: paiseToInrInput(r.incentivesPaise),
          deductionsInr: paiseToInrInput(r.deductionsPaise),
        }))
      );
    });
  }, [year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const openAddDialog = () => {
    setEditEmployee(null);
    setName("");
    setEmpId("");
    setDoj("");
    setBaseSalaryInr("");
    setDialogOpen(true);
  };

  const openEditDialog = (employee: EmployeeRow) => {
    setEditEmployee(employee);
    setName(employee.name);
    setEmpId(employee.empId);
    setDoj(employee.dateOfJoiningIso.slice(0, 10));
    setBaseSalaryInr(paiseToInrInput(employee.baseSalaryPaise));
    setDialogOpen(true);
  };

  const saveEmployee = () => {
    startTransition(async () => {
      const res = await upsertEmployeeAction({
        ...(editEmployee ? { id: editEmployee.id } : {}),
        name,
        empId,
        dateOfJoining: doj,
        baseSalaryInr,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editEmployee ? "Employee updated" : "Employee added");
      setDialogOpen(false);
      const listRes = await loadEmployeePayrollMonthAction({ year, month });
      if (listRes.ok) {
        setRows(
          listRes.rows.map((r) => ({
            ...r,
            incentivesInr: paiseToInrInput(r.incentivesPaise),
            deductionsInr: paiseToInrInput(r.deductionsPaise),
          }))
        );
        setEmployees(
          listRes.rows.map((r) => ({
            id: r.id,
            name: r.name,
            empId: r.empId,
            dateOfJoiningIso: r.dateOfJoiningIso,
            baseSalaryPaise: r.baseSalaryPaise,
          }))
        );
      }
      router.refresh();
    });
  };

  const updateRowField = (
    employeeId: string,
    field: "incentivesInr" | "deductionsInr",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== employeeId) return r;
        const next = { ...r, [field]: value };
        const incentives = parseInrToPaise(next.incentivesInr) ?? 0;
        const deductions = parseInrToPaise(next.deductionsInr) ?? 0;
        next.netPayPaise = r.baseSalaryPaise + incentives - deductions;
        return next;
      })
    );
  };

  const savePayroll = () => {
    startTransition(async () => {
      const payload = rows.map((r) => {
        const incentivesPaise = parseInrToPaise(r.incentivesInr);
        const deductionsPaise = parseInrToPaise(r.deductionsInr);
        if (incentivesPaise === null || deductionsPaise === null) {
          return null;
        }
        return {
          employeeId: r.id,
          incentivesPaise,
          deductionsPaise,
        };
      });
      if (payload.some((p) => p === null)) {
        toast.error("Enter valid INR amounts for incentives and deductions");
        return;
      }
      const res = await saveEmployeePayrollAction({
        year,
        month,
        rows: payload as NonNullable<(typeof payload)[number]>[],
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Monthly payroll saved");
      loadMonth();
      router.refresh();
    });
  };

  const downloadPayslip = (employeeId: string) => {
    startTransition(async () => {
      const res = await downloadEmployeePayslipAction({ year, month, employeeId });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const bytes = Uint8Array.from(atob(res.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Payslip downloaded");
      loadMonth();
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">Employees</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add staff with employee ID, date of joining, and monthly base salary.
            </p>
          </div>
          <Button type="button" onClick={openAddDialog}>
            Add employee
          </Button>
        </div>

        {employees.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No employees yet. Add your first employee to run payroll.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Emp ID</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead className="text-right">Base salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.empId}</TableCell>
                    <TableCell>{new Date(e.dateOfJoiningIso).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{paiseToInrInput(e.baseSalaryPaise)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(e)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Monthly payroll</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Year</span>
            <input
              type="number"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={year}
              min={2020}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Month</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button type="button" variant="secondary" disabled={pending} onClick={loadMonth}>
              Load month
            </Button>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Add employees above, then load a month to enter incentives and deductions.
          </p>
        ) : (
          <>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Incentives</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net pay</TableHead>
                    <TableHead className="text-right">Payslip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.empId}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{paiseToInrInput(r.baseSalaryPaise)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="font-mono text-right"
                          value={r.incentivesInr}
                          onChange={(e) => updateRowField(r.id, "incentivesInr", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="font-mono text-right"
                          value={r.deductionsInr}
                          onChange={(e) => updateRowField(r.id, "deductionsInr", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ₹{paiseToInrInput(Math.max(0, r.netPayPaise))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() => downloadPayslip(r.id)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Button type="button" disabled={pending} onClick={savePayroll}>
                Save monthly payroll
              </Button>
            </div>
          </>
        )}
      </section>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editEmployee ? "Edit employee" : "Add employee"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="emp-name">Name</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-id">Employee ID</Label>
            <Input id="emp-id" value={empId} onChange={(e) => setEmpId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-doj">Date of joining</Label>
            <Input id="emp-doj" type="date" value={doj} onChange={(e) => setDoj(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-salary">Base salary (INR / month)</Label>
            <Input
              id="emp-salary"
              type="text"
              inputMode="decimal"
              value={baseSalaryInr}
              onChange={(e) => setBaseSalaryInr(e.target.value)}
            />
          </div>
          <Button type="button" className="w-full" disabled={pending} onClick={saveEmployee}>
            {pending ? "Saving…" : "Save employee"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
