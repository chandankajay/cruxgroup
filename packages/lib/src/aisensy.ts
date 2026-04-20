/**
 * AiSensy WhatsApp campaign API helpers (server-only usage recommended).
 * @see https://faq.aisensy.com/en/articles/11501840-api-documentation
 */

const AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";

export interface AisensyCampaignPayload {
  destination: string;
  campaignName: string;
  templateParams: string[];
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
 * Send a named WhatsApp template campaign.
 * No-ops (returns `true`) when API key or destination is missing.
 * On HTTP errors or network failure, logs without leaking full PII and returns `false`.
 */
export async function sendAisensyCampaign(
  payload: AisensyCampaignPayload
): Promise<boolean> {
  const apiKey = process.env["AISENSY_API_KEY"];
  if (!apiKey) return true;

  const destination = normalizeWhatsAppDestination(payload.destination);
  if (!destination || destination.length < 8) return true;

  try {
    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        campaignName: payload.campaignName,
        destination,
        userName: "Crux Group",
        templateParams: payload.templateParams,
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
        campaignName: payload.campaignName,
        destination: maskDestinationForLog(destination),
        bodyPreview: bodyPreview || undefined,
      });
      return false;
    }

    return true;
  } catch (e) {
    console.error("[aisensy] campaign fetch error", {
      campaignName: payload.campaignName,
      destination: maskDestinationForLog(destination),
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

/** OTP template — matches legacy `AISENSY_TEMPLATE_NAME` usage. */
export async function sendWhatsAppOtp(params: {
  phone: string;
  otp: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_TEMPLATE_NAME"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.phone,
    campaignName,
    templateParams: [params.otp],
  });
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

/**
 * Invoice PDF + Razorpay pay link. `AISENSY_INVOICE_PAYMENT_TEMPLATE` params:
 * [customerName, invoiceNumber, amountInrLabel, pdfUrl, paymentUrl].
 */
export async function sendInvoiceWithPaymentLinkWhatsApp(params: {
  customerPhone: string;
  customerName: string;
  invoiceNumber: string;
  amountInrLabel: string;
  pdfUrl: string;
  paymentUrl: string;
}): Promise<boolean> {
  const campaignName = process.env["AISENSY_INVOICE_PAYMENT_TEMPLATE"];
  if (!campaignName) return true;
  return sendAisensyCampaign({
    destination: params.customerPhone,
    campaignName,
    templateParams: [
      params.customerName,
      params.invoiceNumber,
      params.amountInrLabel,
      params.pdfUrl,
      params.paymentUrl,
    ],
  });
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
