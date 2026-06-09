"use server";

import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../../lib/auth";
import { buildEmployeePayslipPdfBytes } from "../../../lib/payroll/employee-payslip-pdf";

type EmployeePayrollActor = {
  readonly userId: string;
  readonly partnerId: string;
};

async function requireEmployeePayrollActor(): Promise<EmployeePayrollActor | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "PARTNER") return null;
  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!partner) return null;
  return { userId, partnerId: partner.id };
}

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  empId: z.string().trim().min(1, "Employee ID is required"),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  baseSalaryInr: z.string().min(1, "Base salary is required"),
});

const monthParams = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

const payrollRowSchema = z.object({
  employeeId: z.string().min(1),
  incentivesPaise: z.number().int().min(0),
  deductionsPaise: z.number().int().min(0),
});

const savePayrollSchema = monthParams.extend({
  rows: z.array(payrollRowSchema),
});

function parseInrToPaise(raw: string): number | null {
  const n = Number(raw.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function monthLabel(month1: number): string {
  return new Date(2000, month1 - 1, 1).toLocaleString("en-IN", { month: "long" });
}

export type EmployeeRow = {
  id: string;
  name: string;
  empId: string;
  dateOfJoiningIso: string;
  baseSalaryPaise: number;
};

export type EmployeePayrollRow = EmployeeRow & {
  incentivesPaise: number;
  deductionsPaise: number;
  netPayPaise: number;
  pdfUrl: string | null;
  recordId: string | null;
};

export async function listEmployeesAction(): Promise<EmployeeRow[] | null> {
  const actor = await requireEmployeePayrollActor();
  if (!actor) return null;

  const rows = await prisma.employee.findMany({
    where: { partnerId: actor.partnerId },
    orderBy: { name: "asc" },
  });

  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    empId: e.empId,
    dateOfJoiningIso: e.dateOfJoining.toISOString(),
    baseSalaryPaise: e.baseSalary,
  }));
}

export async function upsertEmployeeAction(
  raw: z.infer<typeof employeeSchema> & { id?: string }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await requireEmployeePayrollActor();
  if (!actor) return { ok: false, error: "Forbidden" };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const baseSalary = parseInrToPaise(parsed.data.baseSalaryInr);
  if (baseSalary === null) return { ok: false, error: "Enter a valid base salary" };

  const dateOfJoining = new Date(parsed.data.dateOfJoining);
  if (Number.isNaN(dateOfJoining.getTime())) {
    return { ok: false, error: "Invalid date of joining" };
  }

  try {
    if (raw.id) {
      const existing = await prisma.employee.findFirst({
        where: { id: raw.id, partnerId: actor.partnerId },
      });
      if (!existing) return { ok: false, error: "Employee not found" };

      const updated = await prisma.employee.update({
        where: { id: raw.id },
        data: {
          name: parsed.data.name,
          empId: parsed.data.empId,
          dateOfJoining,
          baseSalary,
        },
      });
      revalidatePath("/payroll");
      return { ok: true, id: updated.id };
    }

    const created = await prisma.employee.create({
      data: {
        partnerId: actor.partnerId,
        name: parsed.data.name,
        empId: parsed.data.empId,
        dateOfJoining,
        baseSalary,
      },
    });
    revalidatePath("/payroll");
    return { ok: true, id: created.id };
  } catch {
    return { ok: false, error: "Could not save employee. Check that the employee ID is unique." };
  }
}

export async function loadEmployeePayrollMonthAction(
  raw: z.infer<typeof monthParams>
): Promise<{ ok: true; rows: EmployeePayrollRow[] } | { ok: false; error: string }> {
  const actor = await requireEmployeePayrollActor();
  if (!actor) return { ok: false, error: "Forbidden" };

  const parsed = monthParams.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid period" };

  const { year, month } = parsed.data;

  const employees = await prisma.employee.findMany({
    where: { partnerId: actor.partnerId },
    orderBy: { name: "asc" },
    include: {
      payrollRecords: {
        where: { year, month },
        take: 1,
      },
    },
  });

  const rows: EmployeePayrollRow[] = employees.map((e) => {
    const record = e.payrollRecords[0] ?? null;
    const incentivesPaise = record?.incentives ?? 0;
    const deductionsPaise = record?.deductions ?? 0;
    const basicPay = record?.basicPay ?? e.baseSalary;
    const netPayPaise = record?.netPay ?? basicPay + incentivesPaise - deductionsPaise;

    return {
      id: e.id,
      name: e.name,
      empId: e.empId,
      dateOfJoiningIso: e.dateOfJoining.toISOString(),
      baseSalaryPaise: e.baseSalary,
      incentivesPaise,
      deductionsPaise,
      netPayPaise,
      pdfUrl: record?.pdfUrl ?? null,
      recordId: record?.id ?? null,
    };
  });

  return { ok: true, rows };
}

export async function saveEmployeePayrollAction(
  raw: z.infer<typeof savePayrollSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireEmployeePayrollActor();
  if (!actor) return { ok: false, error: "Forbidden" };

  const parsed = savePayrollSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month, rows } = parsed.data;

  for (const row of rows) {
    const employee = await prisma.employee.findFirst({
      where: { id: row.employeeId, partnerId: actor.partnerId },
    });
    if (!employee) return { ok: false, error: "Employee not found" };

    const netPay = employee.baseSalary + row.incentivesPaise - row.deductionsPaise;
    if (netPay < 0) return { ok: false, error: "Net pay cannot be negative" };

    await prisma.payrollRecord.upsert({
      where: {
        employeeId_year_month: {
          employeeId: row.employeeId,
          year,
          month,
        },
      },
      create: {
        employeeId: row.employeeId,
        year,
        month,
        basicPay: employee.baseSalary,
        incentives: row.incentivesPaise,
        deductions: row.deductionsPaise,
        netPay,
      },
      update: {
        basicPay: employee.baseSalary,
        incentives: row.incentivesPaise,
        deductions: row.deductionsPaise,
        netPay,
      },
    });
  }

  revalidatePath("/payroll");
  return { ok: true };
}

export async function downloadEmployeePayslipAction(
  raw: z.infer<typeof monthParams> & { employeeId: string }
): Promise<
  | { ok: true; pdfBase64: string; filename: string }
  | { ok: false; error: string }
> {
  const actor = await requireEmployeePayrollActor();
  if (!actor) return { ok: false, error: "Forbidden" };

  const parsed = monthParams
    .extend({ employeeId: z.string().min(1) })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { year, month, employeeId } = parsed.data;

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, partnerId: actor.partnerId },
  });
  if (!employee) return { ok: false, error: "Employee not found" };

  const record = await prisma.payrollRecord.findUnique({
    where: {
      employeeId_year_month: { employeeId, year, month },
    },
  });

  const basicPay = record?.basicPay ?? employee.baseSalary;
  const incentives = record?.incentives ?? 0;
  const deductions = record?.deductions ?? 0;
  const netPay = record?.netPay ?? basicPay + incentives - deductions;

  const pdfBytes = await buildEmployeePayslipPdfBytes({
    employeeName: employee.name,
    empId: employee.empId,
    monthLabel: monthLabel(month),
    year,
    basicPayPaise: basicPay,
    incentivesPaise: incentives,
    deductionsPaise: deductions,
    netPayPaise: netPay,
  });

  const blobPath = `payroll/employees/${year}/${month}/${employeeId}/payslip.pdf`;
  let pdfUrl: string | null = record?.pdfUrl ?? null;
  try {
    const blob = await put(blobPath, new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), {
      access: "public",
      contentType: "application/pdf",
    });
    pdfUrl = blob.url;
  } catch (e) {
    console.error("[employee-payroll] blob upload failed", e);
  }

  await prisma.payrollRecord.upsert({
    where: {
      employeeId_year_month: { employeeId, year, month },
    },
    create: {
      employeeId,
      year,
      month,
      basicPay,
      incentives,
      deductions,
      netPay,
      pdfUrl,
    },
    update: {
      basicPay,
      incentives,
      deductions,
      netPay,
      ...(pdfUrl ? { pdfUrl } : {}),
    },
  });

  revalidatePath("/payroll");

  const filename = `payslip-${employee.empId}-${year}-${String(month).padStart(2, "0")}.pdf`;
  return {
    ok: true,
    pdfBase64: Buffer.from(pdfBytes).toString("base64"),
    filename,
  };
}
