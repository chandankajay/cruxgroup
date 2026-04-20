import { redirect } from "next/navigation";
import { listPayrollOperators } from "./actions";
import { PayrollLedgerClient } from "./features/payroll-ledger-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const operators = await listPayrollOperators();
  if (operators === null) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Operator payroll</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Working days come from COMPLETED trips with OTP-verified start/end times on equipment whose
          operator phone matches the operator profile. Amounts are stored in paise; net pay is gross
          minus deductions and advance recovery.
        </p>
      </div>
      <PayrollLedgerClient operators={operators} />
    </div>
  );
}
