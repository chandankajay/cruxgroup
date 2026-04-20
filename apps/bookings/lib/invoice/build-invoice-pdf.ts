import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface InvoicePdfInput {
  invoiceNumber: string;
  issuedAtIso: string;
  sacCode: string;
  partnerGstin: string | null;
  customerGstin: string | null;
  amountPaise: number;
  lineDescription: string;
  customerName: string;
  partnerName: string;
}

function paiseToInrLabel(paise: number): string {
  const r = paise / 100;
  return r.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function buildInvoicePdfBytes(input: InvoicePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 72;
  const left = 56;
  const lineGap = 14;

  const draw = (text: string, size = 11, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(text, {
      x: left,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= lineGap;
  };

  draw("Crux Group — Tax Invoice", 18, true);
  y -= 6;
  draw(`Invoice No: ${input.invoiceNumber}`, 11, true);
  draw(`Issued (UTC): ${input.issuedAtIso}`);
  draw(`SAC: ${input.sacCode}`);
  draw(`Partner GSTIN: ${input.partnerGstin ?? "—"}`);
  draw(`Customer GSTIN: ${input.customerGstin ?? "—"}`);
  y -= 8;
  draw(`Bill to: ${input.customerName}`);
  draw(`Billed by: ${input.partnerName}`);
  y -= 8;
  draw("Description", 11, true);
  draw(input.lineDescription);
  y -= 8;
  draw(
    `Amount (INR): Rs. ${paiseToInrLabel(input.amountPaise)} (${input.amountPaise.toString()} paise)`,
    12,
    true,
    rgb(0, 0.35, 0.15)
  );
  y -= 24;
  draw("This is a computer-generated invoice for GST compliance.", 9, false, rgb(0.35, 0.35, 0.35));
  draw("Page 1", 8, false, rgb(0.6, 0.6, 0.6));

  return doc.save();
}
