import { prisma } from "../lib/prisma";
import { sendSms } from "./sms";

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export class OtpCooldownError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("OTP_COOLDOWN");
    this.retryAfter = retryAfter;
  }
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createOtp(phone: string, issuedVia: "SMS" | "ADMIN") {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  // Remove any previous OTPs for this phone before issuing a new one
  await prisma.otp.deleteMany({ where: { phone } });
  await prisma.otp.create({ data: { phone, code, expiresAt, issuedVia } });
  // Log after DB write so the code is guaranteed to be stored
  console.log(`[OTP] ${phone} → ${code} (expires ${expiresAt.toISOString()}, via ${issuedVia})`);
  return { code, expiresAt };
}

export async function sendOtp(phone: string): Promise<{ expiresIn: number }> {
  // Cheap abuse/cost guard: don't let a client re-trigger an SMS send faster
  // than the app's own resend countdown allows.
  const recent = await prisma.otp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const secondsSinceLastSend = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      throw new OtpCooldownError(Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend));
    }
  }

  const { code } = await createOtp(phone, "SMS");

  // Fire-and-forget: onboarding must not wait on the SMS provider's
  // round-trip. The code is already persisted, so verification works
  // regardless of whether the SMS itself is delayed or fails outright — the
  // user can still fall back to "resend" or the call-customer-service flow.
  sendSms(
    phone,
    `Your Godrop verification code is ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`
  ).catch((err) => {
    console.error(`[OTP] SMS send failed for ${phone}:`, err instanceof Error ? err.message : err);
  });

  return { expiresIn: OTP_EXPIRY_MINUTES * 60 };
}

// Lets a SUPER_ADMIN generate a valid code for a phone number without
// sending an SMS, to read aloud to a user who called customer service
// because they never received (or can't receive) the automated text.
export async function issueAdminOtp(phone: string): Promise<{ code: string; expiresIn: number }> {
  const { code } = await createOtp(phone, "ADMIN");
  return { code, expiresIn: OTP_EXPIRY_MINUTES * 60 };
}

// Sends a real SMS in the exact OTP format/copy, so an admin can confirm
// SMS delivery is working end-to-end — but doesn't touch the `Otp` table,
// so it can't be used to actually log in and doesn't disturb a real
// in-flight OTP session for that phone number.
export async function sendTestOtpSms(phone: string): Promise<{ code: string }> {
  const code = generateCode();
  await sendSms(
    phone,
    `Your Godrop verification code is ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`
  );
  return { code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: { phone, code },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    console.log(`[OTP verify] No OTP found for phone=${phone}`);
    return false;
  }
  if (otp.expiresAt <= new Date()) {
    console.log(`[OTP verify] OTP expired for phone=${phone}, expired at ${otp.expiresAt.toISOString()}`);
    await prisma.otp.delete({ where: { id: otp.id } });
    return false;
  }

  await prisma.otp.delete({ where: { id: otp.id } });
  return true;
}
