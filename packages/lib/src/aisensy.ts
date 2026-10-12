/**
 * AiSensy WhatsApp campaign API helpers (server-only usage recommended).
 * @see https://faq.aisensy.com/en/articles/11501840-api-documentation
 */

import { buildCustomerReviewLink } from "./review-link";

const AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";

export interface AisensyButtonParam {
  type: "button";
  sub_type: "url" | "quick_reply";
  index: string;
  parameters: { type: "text"; text: string }[];
}

export interface AisensyMediaAttachment {
  url: string;
  filename: string;
}

export interface AisensyCampaignPayload {
  destination: string;
  campaignName: string;
  templateParams: string[];
  buttons?: AisensyButtonParam[];
  media?: AisensyMediaAttachment;
}

/** Normalize to +E.164 for India-first flows. */
export function normalizeWhatsAppDestination(raw: string): string {
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* ignore */
  }
  s = s.replace(/\s/g, "");
  const digits = s.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (s.startsWith("+") && digits.length >= 10) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return s.startsWith("+") ? s : `+${digits}`;
}

function maskDestinationForLog(dest: string): string {
  const d = dest.replace(/\D/g, "");
  if (d.length <= 4) return "(short)";
  return `…${d.slice(-4)}`;
}

/**
 * Generic WhatsApp template send (AiSensy campaign API).
 * If `AISENSY_API_KEY` is missing, logs the full payload and returns `true` (local dev).
 */
export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  params: string[],
  buttons?: AisensyButtonParam[],
  media?: AisensyMediaAttachment,
): Promise<boolean> {
  const apiKey = process.env["AISENSY_API_KEY"];
  const destination = normalizeWhatsAppDestination(phone);

  const payload: Record<string, unknown> = {
    campaignName: templateName,
    destination,
    userName: "Crux Group",
    templateParams: params,
  };
  if (buttons?.length) {
    payload.buttons = buttons;
  }
  if (media?.url?.trim() && media.filename?.trim()) {
    payload.media = { url: media.url.trim(), filename: media.filename.trim() };
  }

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log("[aisensy] sendWhatsAppMessage (no AISENSY_API_KEY):", {
      ...payload,
      apiKeyPresent: false,
    });
    return true;
  }

  if (!destination || destination.length < 8) {
    return true;
  }

  try {
    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        ...payload,
      }),
    });

    if (!res.ok) {
      let bodyPreview = "";
      try {
        bodyPreview = (await res.text()).slice(0, 500);
      } catch {
        /* ignore */
      }
      console.error("[aisensy] campaign request failed", {
        status: res.status,
        statusText: res.statusText,
        campaignName: templateName,
        destination: maskDestinationForLog(destination),
        bodyPreview: bodyPreview || undefined,
      });
      return false;
    }

    return true;
  } catch (e) {
    console.error("[aisensy] campaign fetch error", {
      campaignName: templateName,
      destination: maskDestinationForLog(destination),
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

/**
 * Send a named WhatsApp template campaign.
 * Delegates to {@link sendWhatsAppMessage} (logs payload when API key is absent).
 */
export async function sendAisensyCampaign(
  payload: AisensyCampaignPayload
): Promise<boolean> {
  return sendWhatsAppMessage(
    payload.destination,
    payload.campaignName,
    payload.templateParams,
    payload.buttons,
    payload.media,
  );
}

/** Build a copy-code (URL-type) button param for OTP templates. */
export function buildCopyCodeButton(otp: string, index = 0): AisensyButtonParam {
  return {
    type: "button",
    sub_type: "url",
    index: String(index),
    parameters: [{ type: "text", text: otp }],
  };
}

/** OTP template — uses `AISENSY_TEMPLATE_LOGIN_CODE` (falls back to legacy `AISENSY_TEMPLATE_NAME`). */
export async function sendWhatsAppOtp(params: {
  phone: string;
  otp: string;
}): Promise<boolean> {
  const campaignName =
    process.env["AISENSY_TEMPLATE_LOGIN_CODE"] ??
    process.env["AISENSY_TEMPLATE_NAME"];
  if (!campaignName) return true;
  return sendWhatsAppMessage(
    params.phone,
    campaignName,
    [params.otp],
    [buildCopyCodeButton(params.otp)],
  );
}

/**
 * Operator magic link + job context. Set `AISENSY_OPERATOR_LINK_TEMPLATE` to a template
 * whose params match: [jobLabel, magicLinkUrl, startOtp] (adjust order in AiSensy to match).
 */
export async function sendOperatorMagicLink(params: {
  operatorPhone: string;
  jobLabel: string;
  magicLinkUrl: string;
  startOtp: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_OPERATOR_LINK_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.operatorPhone,
    campaignName,
    templateParams: [params.jobLabel, params.magicLinkUrl, params.startOtp],
  });
}

/**
 * Customer booking confirmation. Set `AISENSY_BOOKING_CONFIRM_TEMPLATE` with params
 * e.g. [customerName, equipmentName, siteAddress, scheduledIstLabel, totalInrLabel].
 */
export async function sendBookingConfirmationWhatsApp(params: {
  customerPhone: string;
  customerName: string;
  equipmentName: string;
  siteAddress: string;
  scheduledIstLabel: string;
  totalInrLabel: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_BOOKING_CONFIRM_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.customerPhone,
    campaignName,
    templateParams: [
      params.customerName,
      params.equipmentName,
      params.siteAddress,
      params.scheduledIstLabel,
      params.totalInrLabel,
    ],
  });
}

/**
 * Partner alert when a job is flagged OVERRUN (expected end + 1h exceeded).
 * Set `AISENSY_PARTNER_OVERRUN_TEMPLATE` with params e.g.
 * [companyName, jobLabel, expectedEndIstLabel, machineName, customerName].
 */
export async function sendPartnerJobOverrunAlert(params: {
  partnerPhone: string;
  companyName: string;
  jobLabel: string;
  expectedEndIstLabel: string;
  machineName: string;
  customerName: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_PARTNER_OVERRUN_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.partnerPhone,
    campaignName,
    templateParams: [
      params.companyName,
      params.jobLabel,
      params.expectedEndIstLabel,
      params.machineName,
      params.customerName,
    ],
  });
}

function resolveInvoiceWhatsAppCampaignName(): string | undefined {
  return (
    process.env["AISENSY_WA_INVOICE_CAMPAIGN"]?.trim() ||
    process.env["AISENSY_INVOICE_PAYMENT_TEMPLATE"]?.trim() ||
    undefined
  );
}

function isPublicHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Invoice receipt template — FILE header (PDF) + one body variable (ratings link).
 * Campaign: `AISENSY_WA_INVOICE_CAMPAIGN`. Body param {{1}} = customer review URL.
 */
export async function sendInvoiceReceiptWhatsApp(params: {
  destinationPhone: string;
  pdfUrl: string;
  pdfFilename: string;
  ratingsLink: string;
}): Promise<boolean> {
  const campaignName = resolveInvoiceWhatsAppCampaignName();
  if (!campaignName) return true;

  const pdfUrl = params.pdfUrl.trim();
  const ratingsLink = params.ratingsLink.trim();
  if (!isPublicHttpsUrl(pdfUrl) || !isPublicHttpsUrl(ratingsLink)) {
    console.error("[aisensy] sendInvoiceReceiptWhatsApp invalid urls", {
      pdfOk: isPublicHttpsUrl(pdfUrl),
      ratingsOk: isPublicHttpsUrl(ratingsLink),
    });
    return false;
  }

  return sendAisensyCampaign({
    destination: params.destinationPhone,
    campaignName,
    templateParams: [ratingsLink],
    media: { url: pdfUrl, filename: params.pdfFilename.trim() || "Crux-Invoice.pdf" },
  });
}

/** @deprecated Use {@link sendInvoiceReceiptWhatsApp} via `dispatchInvoiceReceiptWhatsApp`. */
export async function sendInvoiceWithPaymentLinkWhatsApp(params: {
  customerPhone: string;
  invoiceNumber: string;
  pdfUrl: string;
  reviewToken: string;
}): Promise<boolean> {
  return sendInvoiceReceiptWhatsApp({
    destinationPhone: params.customerPhone,
    pdfUrl: params.pdfUrl,
    pdfFilename: `Crux-Invoice-${params.invoiceNumber.replace(/[^\w.-]+/g, "_")}.pdf`,
    ratingsLink: buildCustomerReviewLink(params.reviewToken),
  });
}

/** Super-admin confirmation when a manual invoice is sent to a customer. */
export async function sendManualInvoiceAdminNotifyWhatsApp(params: {
  invoiceNumber: string;
  customerName: string;
  grandTotalInr: string;
  pdfUrl: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_WA_INVOICE_ADMIN_NOTIFY_CAMPAIGN"]?.trim();
  const adminPhone = process.env["CRUX_SUPER_ADMIN_NOTIFY_PHONE"]?.trim();
  if (!campaignName || !adminPhone) return true;

  const pdfUrl = params.pdfUrl.trim();
  if (!isPublicHttpsUrl(pdfUrl)) {
    console.error("[aisensy] sendManualInvoiceAdminNotifyWhatsApp invalid pdf url");
    return false;
  }

  return sendAisensyCampaign({
    destination: adminPhone,
    campaignName,
    templateParams: [params.invoiceNumber, params.customerName, params.grandTotalInr],
    media: {
      url: pdfUrl,
      filename: `Crux-Invoice-${params.invoiceNumber.replace(/[^\w.-]+/g, "_")}.pdf`,
    },
  });
}

/** Super-admin manual invoice delivery — PDF attachment + ratings link only. */
export async function sendSuperAdminInvoiceWhatsApp(params: {
  destinationPhone: string;
  pdfUrl: string;
  pdfFilename: string;
  ratingsLink: string;
}): Promise<boolean> {
  return sendInvoiceReceiptWhatsApp(params);
}

/**
 * Overdue payment ladder. `AISENSY_INVOICE_OVERDUE_REMINDER_TEMPLATE` params:
 * [invoiceNumber, stage, amountInrLabel, paymentUrl].
 */
export async function sendInvoiceOverdueReminderWhatsApp(params: {
  customerPhone: string;
  invoiceNumber: string;
  stage: "D+3" | "D+7" | "D+15";
  amountInrLabel: string;
  paymentUrl: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_INVOICE_OVERDUE_REMINDER_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.customerPhone,
    campaignName,
    templateParams: [
      params.invoiceNumber,
      params.stage,
      params.amountInrLabel,
      params.paymentUrl,
    ],
  });
}

/**
 * Operator salary slip (PDF on Blob). Set `AISENSY_PAYSLIP_TEMPLATE` with params
 * e.g. [periodLabel, operatorName, netInrLabel, pdfUrl] (match order in AiSensy).
 */
export async function sendOperatorSalarySlipWhatsApp(params: {
  operatorPhone: string;
  periodLabel: string;
  operatorName: string;
  netInrLabel: string;
  pdfUrl: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_PAYSLIP_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.operatorPhone,
    campaignName,
    templateParams: [
      params.periodLabel,
      params.operatorName,
      params.netInrLabel,
      params.pdfUrl,
    ],
  });
}

/**
 * Partner alert: preventive service window approaching (hour meter).
 * `AISENSY_PARTNER_SERVICE_DUE_TEMPLATE` params e.g.
 * [companyName, machineName, totalHoursLabel, hoursUntilDueLabel].
 */
export async function sendPartnerMachineServiceDueWhatsApp(params: {
  partnerPhone: string;
  companyName: string;
  machineName: string;
  totalHoursLabel: string;
  hoursUntilDueLabel: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_PARTNER_SERVICE_DUE_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.partnerPhone,
    campaignName,
    templateParams: [
      params.companyName,
      params.machineName,
      params.totalHoursLabel,
      params.hoursUntilDueLabel,
    ],
  });
}

/** Customer booking progress tracker stages — one template per stage for Meta approval. */
export type BookingProgressWhatsAppStage =
  | "BOOKING_RECEIVED"
  | "BOOKING_CONFIRMED"
  | "MACHINE_ASSIGNED"
  | "ON_SITE"
  | "JOB_COMPLETED";

const BOOKING_PROGRESS_TEMPLATE_ENV: Record<BookingProgressWhatsAppStage, string> = {
  BOOKING_RECEIVED: "AISENSY_PROGRESS_BOOKING_RECEIVED_TEMPLATE",
  BOOKING_CONFIRMED: "AISENSY_PROGRESS_BOOKING_CONFIRMED_TEMPLATE",
  MACHINE_ASSIGNED: "AISENSY_PROGRESS_MACHINE_ASSIGNED_TEMPLATE",
  ON_SITE: "AISENSY_PROGRESS_ON_SITE_TEMPLATE",
  JOB_COMPLETED: "AISENSY_PROGRESS_JOB_COMPLETED_TEMPLATE",
};

/**
 * Customer progress notification at each booking stage.
 * Template body copy (submit each to Meta for approval):
 *
 * 1. BOOKING_RECEIVED — "Your booking request for {{machineType}} on {{date}} has been received. We will confirm shortly."
 * 2. BOOKING_CONFIRMED — "Good news! Your booking for {{machineType}} on {{date}} is confirmed."
 * 3. MACHINE_ASSIGNED — "Machine and operator assigned for your booking. {{operatorName}} will be your operator."
 * 4. ON_SITE — "Your machine has arrived on site. Work is starting now."
 * 5. JOB_COMPLETED — "Job completed! Thank you for using Crux. Your invoice will be sent shortly."
 */
export async function sendBookingProgressWhatsApp(params: {
  customerPhone: string;
  stage: BookingProgressWhatsAppStage;
  machineType: string;
  date: string;
  operatorName: string;
}): Promise<boolean> {
  const envKey = BOOKING_PROGRESS_TEMPLATE_ENV[params.stage];
  const campaignName = process.env[envKey];
  if (!campaignName) return true;

  const templateParams =
    params.stage === "MACHINE_ASSIGNED"
      ? [params.machineType, params.operatorName]
      : params.stage === "ON_SITE" || params.stage === "JOB_COMPLETED"
        ? [params.machineType]
        : [params.machineType, params.date];

  return sendAisensyCampaign({
    destination: params.customerPhone,
    campaignName,
    templateParams,
  });
}
