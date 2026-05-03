import { prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";

export async function createAdminNotification(data: {
  adminId: string;
  type: string;
  title: string;
  body: string;
  data?: object;
}) {
  return prisma.adminNotification.create({ data });
}

export async function createNotificationsForAllSystemAdmins(data: {
  type: string;
  title: string;
  body: string;
  data?: object;
}) {
  const admins = await prisma.admin.findMany({
    where: { type: "SYSTEM", isActive: true },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.adminNotification.createMany({
    data: admins.map((a) => ({ adminId: a.id, ...data })),
  });
}

export async function createNotificationsForVendorAdmins(
  vendorId: string,
  data: { type: string; title: string; body: string; data?: object }
) {
  const admins = await prisma.admin.findMany({
    where: { vendorId, type: "VENDOR", isActive: true },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.adminNotification.createMany({
    data: admins.map((a) => ({ adminId: a.id, ...data })),
  });
}

export async function listAdminNotifications(
  adminId: string,
  opts: { unreadOnly?: boolean; page: number; limit: number }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { adminId };
  if (opts.unreadOnly) where.isRead = false;

  const [data, total, unreadCount] = await prisma.$transaction([
    prisma.adminNotification.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.adminNotification.count({ where }),
    prisma.adminNotification.count({ where: { adminId, isRead: false } }),
  ]);

  return { data, total, unreadCount, page: opts.page, limit: opts.limit };
}

export async function getUnreadCount(adminId: string) {
  return prisma.adminNotification.count({ where: { adminId, isRead: false } });
}

export async function markNotificationRead(id: string, adminId: string) {
  const notification = await prisma.adminNotification.findFirst({ where: { id, adminId } });
  if (!notification) throw new Error("Notification not found");
  return prisma.adminNotification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllNotificationsRead(adminId: string) {
  await prisma.adminNotification.updateMany({
    where: { adminId, isRead: false },
    data: { isRead: true },
  });
}
