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
  /** Defaults to tax invoice title when omitted. */
  documentTitle?: string;
  /** Top banner: QUOTATION | PAID | PARTIALLY PAID */
  statusRibbon?: string | null;
  subtotalPaise?: number;
  discountPaise?: number;
  gstPercent?: number;
  gstPaise?: number;
  logoPngBytes?: Uint8Array;
}

function paiseToInrLabel(paise: number): string {
  const r = paise / 100;
  return r.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** StandardFonts (Helvetica) only support WinAnsi — replace common Unicode punctuation. */
function winAnsiSafe(text: string): string {
  return text
    .replace(/\u2212/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u20B9/g, "Rs.")
    .replace(/\u00A0/g, " ");
}

export async function buildInvoicePdfBytes(input: InvoicePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let y = height - 56;
  const left = 56;
  const right = width - 56;
  const lineGap = 14;

  const draw = (
    text: string,
    size = 11,
    bold = false,
    color = rgb(0.1, 0.1, 0.1),
    x = left,
  ) => {
    page.drawText(winAnsiSafe(text), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= lineGap;
  };

  if (input.logoPngBytes?.length) {
    try {
      const logo = await doc.embedPng(input.logoPngBytes);
      const logoW = 72;
      const scale = logoW / logo.width;
      const logoH = logo.height * scale;
      page.drawImage(logo, { x: left, y: y - logoH + 8, width: logoW, height: logoH });
    } catch {
      /* skip bad logo bytes */
    }
  }

  if (input.statusRibbon) {
    const ribbon = input.statusRibbon.toUpperCase();
    const ribbonW = fontBold.widthOfTextAtSize(ribbon, 10) + 16;
    page.drawRectangle({
      x: right - ribbonW,
      y: y - 2,
      width: ribbonW,
      height: 18,
      color: rgb(0.18, 0.53, 0.78),
    });
    page.drawText(winAnsiSafe(ribbon), {
      x: right - ribbonW + 8,
      y: y + 2,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  y -= 8;
  draw(input.documentTitle ?? "Crux Group — Tax Invoice", 16, true);
  y -= 4;
  draw(`Invoice No: ${input.invoiceNumber}`, 11, true);
  draw(`Issued (UTC): ${input.issuedAtIso}`);
  draw(`SAC: ${input.sacCode}`);
  draw(`Partner GSTIN: ${input.partnerGstin ?? "—"}`);
  draw(`Customer GSTIN: ${input.customerGstin ?? "—"}`);
  y -= 8;
  draw(`Bill to: ${input.customerName}`);
  draw(`Billed by: ${input.partnerName}`);
  y -= 8;
  draw("Booking detail", 11, true);
  for (const line of input.lineDescription.split("\n").slice(0, 8)) {
    draw(line.trim() || "—");
  }
  y -= 8;

  const subtotal = input.subtotalPaise ?? input.amountPaise;
  const discount = input.discountPaise ?? 0;
  const gstPct = input.gstPercent ?? 0;
  const gstAmt = input.gstPaise ?? 0;

  draw(`Subtotal: Rs. ${paiseToInrLabel(subtotal)}`);
  if (discount > 0) {
    draw(`Discount: - Rs. ${paiseToInrLabel(discount)}`);
  }
  if (gstPct > 0) {
    draw(`GST (${gstPct}%): Rs. ${paiseToInrLabel(gstAmt)}`);
  }
  draw(
    `Grand total: Rs. ${paiseToInrLabel(input.amountPaise)}`,
    12,
    true,
    rgb(0, 0.35, 0.15),
  );
  y -= 24;
  draw("This is a computer-generated invoice for GST compliance.", 9, false, rgb(0.35, 0.35, 0.35));
  draw("Page 1", 8, false, rgb(0.6, 0.6, 0.6));

  return doc.save();
}
