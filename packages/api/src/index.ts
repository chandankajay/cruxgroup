import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root";

export { appRouter, createCaller } from "./root";
export type { AppRouter };
/** Stable public inference surface for consumers (avoids TS2742 leaking Prisma runtime paths). */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type EquipmentListOutput = RouterOutputs["equipment"]["list"];
export type NearbyEquipmentOutput = RouterOutputs["equipment"]["getNearby"];
export type { NearbyEquipmentItem } from "./services/equipment-service";
export { partnerEquipmentOwnerWhere } from "./services/equipment-service";
export { getLabelsForApp } from "./services/dictionary-service";
export {
  verifyOtp,
  DEV_MASTER_OTP,
  sendBookingsOtpWithWhatsApp,
  sendAdminOtpWithWhatsApp,
  type VerifyOtpResult,
} from "./services/otp-service";
export {
  resolveLoginStep,
  verifyPin,
  setPin,
  resetPinAfterOtp,
  clearPinLockout,
  isPinLocked,
  hashPin,
  validatePinForSet,
  isWeakPin,
  WEAK_PINS,
  type LoginStep,
  type PinVerifyError,
  type PinValidationError,
} from "./services/pin-service";
export type { BookingStatus } from "./services/booking-service";
