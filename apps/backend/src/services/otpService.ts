import axios from "axios";
import { prisma } from "../lib/prisma";

const OTP_EXPIRY_MINUTES = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ expiresIn: number }> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  console.log(`Generated OTP for ${phone}: ${code} (expires at ${expiresAt.toISOString()})`);
  // Invalidate previous OTPs for this phone
  await prisma.otp.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  await prisma.otp.create({ data: { phone, code, expiresAt } });

  // Send via Termii
  /* if (process.env.TERMII_API_KEY) {
    await axios.post("https://api.ng.termii.com/api/sms/send", {
      to: phone,
      from: process.env.TERMII_SENDER_ID || "Godrop",
      sms: `Your Godrop verification code is ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
      type: "plain",
      api_key: process.env.TERMII_API_KEY,
      channel: "generic",
    });
  } else {
    // Dev fallback: log to console
    console.log(`[OTP] ${phone} → ${code}`);
  } */

  return { expiresIn: OTP_EXPIRY_MINUTES * 60 };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });
  return true;
}
