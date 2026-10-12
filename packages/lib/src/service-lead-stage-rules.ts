import type { ServiceLeadStageId } from "./service-leads";

const EARLY_STAGES: readonly ServiceLeadStageId[] = [
  "NEW",
  "SITE_VISIT_SCHEDULED",
  "SITE_VISIT_DONE",
  "LOST",
];

const POST_QUOTATION_STAGES: readonly ServiceLeadStageId[] = [
  "QUOTATION_SENT",
  "QUOTE_ACCEPTED",
  "ADVANCE_RECEIVED",
  "COMPLETED",
];

export function canSalesMoveToStage(
  stage: ServiceLeadStageId,
  canSendQuotes: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (stage === "QUOTATION_SENT") {
    return {
      ok: false,
      reason: "Use “Mark quotation sent” to record a quote.",
    };
  }
  if (!canSendQuotes && POST_QUOTATION_STAGES.includes(stage)) {
    return {
      ok: false,
      reason: "You cannot advance past site visit without quote permission.",
    };
  }
  if (!canSendQuotes && !EARLY_STAGES.includes(stage)) {
    return {
      ok: false,
      reason: "This stage change is not allowed for your role.",
    };
  }
  return { ok: true };
}
