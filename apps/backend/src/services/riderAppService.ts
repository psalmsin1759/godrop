import { prisma } from "../lib/prisma";
import { RiderGuarantor } from "./riderService";

export async function getRiderProfile(riderId: string) {
  return prisma.rider.findUniqueOrThrow({ where: { id: riderId } });
}

export async function updateRiderProfile(
  riderId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    streetAddress?: string | null;
    city?: string | null;
    state?: string | null;
    landmark?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    guarantors?: RiderGuarantor[] | null;
  }
) {
  return prisma.rider.update({
    where: { id: riderId },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth === null ? null : data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      guarantors: data.guarantors === null ? null : data.guarantors ? (data.guarantors as any) : undefined,
    },
  });
}

export async function submitKyc(
  riderId: string,
  data: {
    vehicleType?: string;
    vehiclePlate?: string;
    vehicleColor?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    driverLicenseNumber?: string;
    driverLicenseExpiry?: string;
    vehicleInsuranceExpiry?: string;
    bvn?: string;
    nin?: string;
    guarantors?: RiderGuarantor[];
    documents?: Record<string, string>;
  }
) {
  return prisma.rider.update({
    where: { id: riderId },
    data: {
      ...data,
      driverLicenseExpiry: data.driverLicenseExpiry ? new Date(data.driverLicenseExpiry) : undefined,
      vehicleInsuranceExpiry: data.vehicleInsuranceExpiry ? new Date(data.vehicleInsuranceExpiry) : undefined,
      guarantors: data.guarantors ? (data.guarantors as any) : undefined,
      documents: data.documents ? (data.documents as any) : undefined,
      kycStatus: "SUBMITTED",
    },
  });
}

export async function updateBankAccount(
  riderId: string,
  data: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }
) {
  return prisma.rider.update({ where: { id: riderId }, data });
}

export async function updateAvatarUrl(riderId: string, avatarUrl: string) {
  return prisma.rider.update({ where: { id: riderId }, data: { avatarUrl } });
}

export async function setAvailability(riderId: string, isAvailable: boolean) {
  return prisma.rider.update({ where: { id: riderId }, data: { isAvailable } });
}

export async function updateLocation(riderId: string, lat: number, lng: number) {
  return prisma.rider.update({ where: { id: riderId }, data: { lat, lng } });
}

export async function registerPushToken(riderId: string, token: string, platform: string) {
  return prisma.riderPushToken.upsert({
    where: { riderId_token: { riderId, token } },
    update: { updatedAt: new Date() },
    create: { riderId, token, platform },
  });
}

export async function removePushToken(riderId: string, token: string) {
  await prisma.riderPushToken.deleteMany({ where: { riderId, token } });
}

export async function listNotifications(riderId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.riderNotification.findMany({
      where: { riderId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.riderNotification.count({ where: { riderId } }),
  ]);
  return { data, total, page, limit };
}

export async function getUnreadCount(riderId: string) {
  return prisma.riderNotification.count({ where: { riderId, isRead: false } });
}

export async function markNotificationRead(riderId: string, notificationId: string) {
  const n = await prisma.riderNotification.findUnique({ where: { id: notificationId } });
  if (!n || n.riderId !== riderId) throw new Error("Notification not found");
  return prisma.riderNotification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllNotificationsRead(riderId: string) {
  await prisma.riderNotification.updateMany({ where: { riderId, isRead: false }, data: { isRead: true } });
}
