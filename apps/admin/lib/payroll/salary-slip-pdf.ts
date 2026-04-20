import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface SalarySlipPdfInput {
  operatorName: string;
  monthLabel: string;
  year: number;
  month: number;
  daysWorked: number;
  dailyRatePaise: number;
  grossPayPaise: number;
  deductionPaise: number;
  advanceRecoveryPaise: number;
  netPayablePaise: number;
  pfApplicable: boolean;
}

function inr(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function buildSalarySlipPdfBytes(input: SalarySlipPdfInput): Promise<Uint8Array> {
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

  line("Crux Group — Salary slip (Contract Labour compliance)", 14, bold);
  y -= 4;
  line(`Period: ${input.monthLabel} ${input.year}`, 12, bold);
  line(`Operator: ${input.operatorName}`);
  line(`Working days (OTP job completions): ${input.daysWorked}`);
  line(`Daily rate: Rs. ${inr(input.dailyRatePaise)}`);
  line(`Gross pay: Rs. ${inr(input.grossPayPaise)}`);
  line(`Deductions: Rs. ${inr(input.deductionPaise)}`);
  line(`Advance recovery: Rs. ${inr(input.advanceRecoveryPaise)}`);
  line(`PF applicable (record): ${input.pfApplicable ? "Yes" : "No"}`);
  y -= 6;
  line(`Net payable: Rs. ${inr(input.netPayablePaise)}`, 13, bold, rgb(0, 0.35, 0.12));
  y -= 12;
  line("Generated from OTP-verified trip start/end times.", 9, font, rgb(0.4, 0.4, 0.4));

  return doc.save();
}
