import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { Prisma, Rider } from "@prisma/client";

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
