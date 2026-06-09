import { redirect } from "next/navigation";
import { listPayrollOperators } from "./actions";
import { listEmployeesAction } from "./employee-actions";
import { EmployeePayrollClient } from "./features/employee-payroll-client";
import { PayrollLedgerClient } from "./features/payroll-ledger-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const [operators, employees] = await Promise.all([
    listPayrollOperators(),
    listEmployeesAction(),
  ]);
  if (operators === null || employees === null) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Payroll</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage employees, monthly incentives and deductions, and operator trip-based payroll.
        </p>
      </div>
      <EmployeePayrollClient initialEmployees={employees} />
      <div className="my-10 border-t border-border" />
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Operator payroll</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Working days come from COMPLETED trips with OTP-verified start/end times on equipment whose
          operator phone matches the operator profile.
        </p>
      </div>
      <PayrollLedgerClient operators={operators} />
    </div>
  );
}
