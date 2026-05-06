import axios from "axios";
import { prisma } from "../lib/prisma";

const OTP_EXPIRY_MINUTES = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ expiresIn: number }> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  // Remove any previous OTPs for this phone before issuing a new one
  await prisma.otp.deleteMany({ where: { phone } });

  await prisma.otp.create({ data: { phone, code, expiresAt } });
  // Log after DB write so the code is guaranteed to be stored
  console.log(`[OTP] ${phone} → ${code} (expires ${expiresAt.toISOString()})`);

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
