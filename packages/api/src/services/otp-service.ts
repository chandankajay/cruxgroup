import { prisma } from "@repo/db";

/** Dev / pre–WhatsApp bypass — must match bookings NextAuth credentials check. */
export const DEV_MASTER_OTP = "112233";

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

function generateCode(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function createOtp(phone: string): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otp.create({
    data: { phone, code, expiresAt },
  });

  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const normalizedCode = code.replace(/\D/g, "");
  if (normalizedCode === DEV_MASTER_OTP) {
    return true;
  }

  const otp = await prisma.otp.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return true;
}
