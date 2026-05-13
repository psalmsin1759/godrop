import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { User, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmail } from "./emailService";

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
  data: { firstName: string; lastName: string; email?: string; referralCode?: string; password?: string }
): Promise<User> {
  const referralCode = `GD${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const updateData: any = { ...data, referralCode };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updateData.password;
  }
  return prisma.user.update({ where: { phone }, data: updateData });
}

export async function loginWithPassword(identifier: string, password: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
      status: UserStatus.ACTIVE,
    },
  });
  if (!user || !user.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silent — no enumeration
  const token = nanoid(64);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  });
  const resetUrl = `${process.env.APP_DOMAIN ?? "https://naijagodrop.com"}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your GoDrop password",
    html: `<p>Hi ${user.firstName ?? "there"},</p><p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`,
    text: `Reset your GoDrop password: ${resetUrl}`,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token, passwordResetExpiry: { gt: new Date() } },
  });
  if (!user) return false;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  });
  return true;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.passwordHash) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error("WRONG_PASSWORD");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deactivateAccount(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: UserStatus.DEACTIVATED } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
}
