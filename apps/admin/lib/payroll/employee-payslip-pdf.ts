import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface EmployeePayslipPdfInput {
  employeeName: string;
  empId: string;
  monthLabel: string;
  year: number;
  basicPayPaise: number;
  incentivesPaise: number;
  deductionsPaise: number;
  netPayPaise: number;
}

function inr(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function buildEmployeePayslipPdfBytes(
  input: EmployeePayslipPdfInput
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 72;
  const left = 56;
  const gap = 14;

  const line = (t: string, size = 11, f = font, c = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(t, { x: left, y, size, font: f, color: c });
    y -= gap;
  };

  line("Crux Group — Employee payslip", 14, bold);
  y -= 4;
  line(`Period: ${input.monthLabel} ${input.year}`, 12, bold);
  line(`Employee: ${input.employeeName}`);
  line(`Employee ID: ${input.empId}`);
  line(`Basic pay: Rs. ${inr(input.basicPayPaise)}`);
  line(`Incentives: Rs. ${inr(input.incentivesPaise)}`);
  line(`Deductions: Rs. ${inr(input.deductionsPaise)}`);
  y -= 6;
  line(`Net payable: Rs. ${inr(input.netPayPaise)}`, 13, bold, rgb(0, 0.35, 0.12));

  return doc.save();
}
