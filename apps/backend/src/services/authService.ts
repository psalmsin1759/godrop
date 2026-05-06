import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { User } from "@prisma/client";

const ACCESS_TTL = "1y"; // TODO: restore to "15m" before production
const REFRESH_TTL_DAYS = 30;


function accessToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL });
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function issueTokens(user: User) {
  const [access, refresh] = await Promise.all([
    Promise.resolve(accessToken(user.id)),
    createRefreshToken(user.id),
  ]);
  return { accessToken: access, refreshToken: refresh };
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }
  await prisma.refreshToken.delete({ where: { id: record.id } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } });
  return issueTokens(user);
}

export async function revokeRefreshToken(token: string): Promise<string | undefined> {
  const record = await prisma.refreshToken.findUnique({ where: { token }, select: { userId: true } });
  await prisma.refreshToken.deleteMany({ where: { token } });
  return record?.userId;
}

export async function findOrCreateUser(phone: string): Promise<{ user: User; isNewUser: boolean }> {
  let user = await prisma.user.findUnique({ where: { phone } });
  const isNewUser = !user;
  if (!user) {
    user = await prisma.user.create({
      data: { phone, isVerified: true },
    });
    // Create wallet
    await prisma.wallet.create({ data: { userId: user.id } });
  }
  return { user, isNewUser };
}

export async function completeRegistration(
  phone: string,
  data: { firstName: string; lastName: string; email?: string; referralCode?: string }
): Promise<User> {
  const referralCode = `GD${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return prisma.user.update({
    where: { phone },
    data: { ...data, referralCode },
  });
}
