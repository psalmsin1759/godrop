import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Prisma, Rider } from "@prisma/client";
import { sendEmail, riderPasswordResetEmail } from "./emailService";

const ACCESS_TTL = "1y"; // TODO: restore to "15m" before production
const REFRESH_TTL_DAYS = 30;

function accessToken(riderId: string): string {
  return jwt.sign({ riderId, type: "rider" }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL });
}

async function createRefreshToken(riderId: string): Promise<string> {
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);
  await prisma.riderRefreshToken.create({ data: { token, riderId, expiresAt } });
  return token;
}

export async function issueTokens(rider: Rider) {
  const [access, refresh] = await Promise.all([
    Promise.resolve(accessToken(rider.id)),
    createRefreshToken(rider.id),
  ]);
  return { accessToken: access, refreshToken: refresh };
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.riderRefreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }
  await prisma.riderRefreshToken.delete({ where: { id: record.id } });
  const rider = await prisma.rider.findUniqueOrThrow({ where: { id: record.riderId } });
  return issueTokens(rider);
}

export async function revokeRefreshToken(token: string) {
  await prisma.riderRefreshToken.deleteMany({ where: { token } });
}

export async function deactivateAccount(riderId: string): Promise<void> {
  await prisma.$transaction([
    prisma.rider.update({
      where: { id: riderId },
      data: {
        isActive: false,
        phone: `deleted_${riderId}`,
        email: null,
        firstName: "Deleted",
        lastName: "Rider",
        avatarUrl: null,
        dateOfBirth: null,
        gender: null,
        streetAddress: null,
        city: null,
        state: null,
        landmark: null,
        vehicleType: null,
        vehiclePlate: null,
        vehicleColor: null,
        vehicleModel: null,
        vehicleYear: null,
        driverLicenseNumber: null,
        driverLicenseExpiry: null,
        vehicleInsuranceExpiry: null,
        bankName: null,
        bankCode: null,
        accountNumber: null,
        accountName: null,
        bvn: null,
        nin: null,
        kycNotes: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        emergencyContactRelationship: null,
        guarantors: Prisma.JsonNull,
        documents: Prisma.JsonNull,
      },
    }),
    prisma.riderRefreshToken.deleteMany({ where: { riderId } }),
    prisma.riderPushToken.deleteMany({ where: { riderId } }),
  ]);
}

export async function loginWithPassword(identifier: string, password: string): Promise<Rider | null> {
  const rider = await prisma.rider.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
      isActive: true,
    },
  });
  if (!rider || !rider.passwordHash) return null;
  const valid = await bcrypt.compare(password, rider.passwordHash);
  return valid ? rider : null;
}

export async function setInitialPassword(riderId: string, password: string): Promise<Rider | null> {
  const rider = await prisma.rider.findUnique({ where: { id: riderId } });
  if (!rider || !rider.isActive || rider.passwordHash) return null;
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.rider.update({ where: { id: riderId }, data: { passwordHash } });
}

export async function sendPasswordReset(email: string): Promise<void> {
  const rider = await prisma.rider.findUnique({ where: { email } });
  if (!rider) throw new Error("EMAIL_NOT_FOUND");

  const rawToken = nanoid(64);
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.rider.update({
    where: { id: rider.id },
    data: { passwordResetToken: hashedToken, passwordResetExpiry: expiry },
  });

  const resetUrl = `${process.env.APP_DOMAIN ?? "https://naijagodrop.com"}/riders/reset-password?token=${rawToken}`;
  try {
    await sendEmail(
      riderPasswordResetEmail({ firstName: rider.firstName, email, resetLink: resetUrl })
    );
  } catch (err) {
    throw new Error("EMAIL_SEND_FAILED");
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const rider = await prisma.rider.findFirst({
    where: { passwordResetToken: hashedToken, passwordResetExpiry: { gt: new Date() } },
  });
  if (!rider) return false;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.rider.update({
    where: { id: rider.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  });
  return true;
}
