import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { AdminRole, AdminType, UserStatus, VendorStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { sendEmail, systemAdminInviteEmail, vendorApprovedEmail, vendorRejectedEmail } from "./emailService";

const SALT_ROUNDS = 12;

// ─── Auth ─────────────────────────────────────────────────────

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { vendor: true },
  });
  if (!admin || !admin.isActive) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const expiresIn = admin.type === AdminType.VENDOR ? "7d" : "8h";
  const token = jwt.sign(
    { adminId: admin.id, type: "admin" },
    process.env.JWT_SECRET!,
    { expiresIn }
  );

  const { password: _pw, ...adminSafe } = admin;
  return { token, admin: adminSafe };
}

// ─── System Admin Profile ─────────────────────────────────────

export async function changeAdminPassword(adminId: string, currentPassword: string, newPassword: string) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) throw new Error("Current password is incorrect");
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });
}

export async function updateAdminProfile(
  adminId: string,
  data: { firstName?: string; lastName?: string; email?: string }
) {
  if (data.email) {
    const conflict = await prisma.admin.findFirst({ where: { email: data.email, NOT: { id: adminId } } });
    if (conflict) throw new Error("Email is already in use");
  }
  return prisma.admin.update({
    where: { id: adminId },
    data,
    select: { id: true, type: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });
}

const DEFAULT_SYSTEM_SETTINGS = { emailNotifications: true, weeklyReport: true };

// ─── Platform Settings (global, singleton) ───────────────────────────────────

export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", riderEarningRate: 0.8 },
  });
}

export async function updatePlatformSettings(data: {
  riderEarningRate?: number;
  coverageRadiusKm?: number;
  vendorPlatformFeeRate?: number;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
}) {
  if (data.riderEarningRate !== undefined && (data.riderEarningRate < 0 || data.riderEarningRate > 1)) {
    throw new Error("riderEarningRate must be between 0 and 1");
  }
  if (data.coverageRadiusKm !== undefined && (data.coverageRadiusKm < 1 || data.coverageRadiusKm > 500)) {
    throw new Error("coverageRadiusKm must be between 1 and 500");
  }
  if (data.vendorPlatformFeeRate !== undefined && (data.vendorPlatformFeeRate < 0 || data.vendorPlatformFeeRate > 1)) {
    throw new Error("vendorPlatformFeeRate must be between 0 and 1");
  }
  return prisma.platformSettings.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", riderEarningRate: data.riderEarningRate ?? 0.8, coverageRadiusKm: data.coverageRadiusKm ?? 15 },
  });
}

export async function getAdminSettings(adminId: string) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId }, select: { settings: true } });
  return { ...DEFAULT_SYSTEM_SETTINGS, ...(admin.settings as object | null ?? {}) };
}

export async function updateAdminSettings(
  adminId: string,
  data: { emailNotifications?: boolean; weeklyReport?: boolean }
) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId }, select: { settings: true } });
  const merged = { ...DEFAULT_SYSTEM_SETTINGS, ...(admin.settings as object | null ?? {}), ...data };
  await prisma.admin.update({ where: { id: adminId }, data: { settings: merged } });
  return merged;
}

// ─── System Admin Management ──────────────────────────────────

export async function createSystemAdmin(data: {
  email: string;
  firstName: string;
  lastName: string;
  role?: Extract<AdminRole, "SUPER_ADMIN" | "ADMIN">;
}) {
  const existing = await prisma.admin.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("An admin with this email already exists");

  const tempPassword = nanoid(12);
  const hashed = await bcrypt.hash(tempPassword, SALT_ROUNDS);
  const admin = await prisma.admin.create({
    data: {
      type: AdminType.SYSTEM,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashed,
      role: data.role ?? AdminRole.ADMIN,
    },
  });

  await sendEmail(systemAdminInviteEmail({
    firstName: data.firstName,
    email: data.email,
    role: admin.role,
    temporaryPassword: tempPassword,
  }));

  const { password: _pw, ...safe } = admin;
  return safe;
}

export async function listSystemAdmins(page: number, limit: number) {
  const { skip } = paginate(page, limit);
  const [data, total] = await prisma.$transaction([
    prisma.admin.findMany({
      where: { type: AdminType.SYSTEM },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        receiveVendorEmails: true,
        receiveRiderEmails: true,
        createdAt: true,
      },
    }),
    prisma.admin.count({ where: { type: AdminType.SYSTEM } }),
  ]);
  return { data, total, page, limit };
}

export async function updateSystemAdmin(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    role?: Extract<AdminRole, "SUPER_ADMIN" | "ADMIN">;
    receiveVendorEmails?: boolean;
    receiveRiderEmails?: boolean;
  }
) {
  return prisma.admin.update({
    where: { id },
    data,
    select: {
      id: true,
      type: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      receiveVendorEmails: true,
      receiveRiderEmails: true,
    },
  });
}

export async function updateAdminEmailPrefs(
  id: string,
  data: { receiveVendorEmails?: boolean; receiveRiderEmails?: boolean }
) {
  return prisma.admin.update({
    where: { id, type: AdminType.SYSTEM },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      receiveVendorEmails: true,
      receiveRiderEmails: true,
    },
  });
}

// ─── Vendor Management ────────────────────────────────────────

export async function listVendors(opts: {
  status?: VendorStatus;
  type?: string;
  search?: string;
  page: number;
  limit: number;
}) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.type) where.type = opts.type;
  if (opts.search) where.name = { contains: opts.search, mode: "insensitive" };

  const [data, total] = await prisma.$transaction([
    prisma.vendor.findMany({
      where,
      skip,
      take: opts.limit,
      include: {
        admins: {
          where: { role: AdminRole.OWNER },
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        _count: { select: { orders: true, categories: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendor.count({ where }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getVendorDetail(vendorId: string) {
  return prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    include: {
      admins: {
        select: {
          id: true,
          type: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      _count: { select: { orders: true, categories: true } },
    },
  });
}

export async function approveVendor(vendorId: string) {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  if (vendor.status === VendorStatus.APPROVED) throw new Error("Vendor is already approved");

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.APPROVED, isActive: true, rejectionReason: null },
  });

  const owner = await prisma.admin.findFirst({
    where: { vendorId, role: AdminRole.OWNER },
  });
  if (owner) {
    await sendEmail(
      vendorApprovedEmail({
        firstName: owner.firstName,
        vendorName: vendor.name,
        email: owner.email,
      })
    );
  }

  return updated;
}

export async function rejectVendor(vendorId: string, reason: string) {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  if (vendor.status === VendorStatus.REJECTED) throw new Error("Vendor is already rejected");

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.REJECTED, isActive: false, rejectionReason: reason },
  });

  const owner = await prisma.admin.findFirst({ where: { vendorId, role: AdminRole.OWNER } });
  if (owner) {
    await sendEmail(
      vendorRejectedEmail({
        firstName: owner.firstName,
        vendorName: vendor.name,
        email: owner.email,
        reason,
      })
    );
  }

  return updated;
}

export async function suspendVendor(vendorId: string, reason?: string) {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  if (vendor.status === VendorStatus.SUSPENDED) throw new Error("Vendor is already suspended");

  return prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.SUSPENDED, isActive: false, rejectionReason: reason ?? null },
  });
}

export async function reinstateVendor(vendorId: string) {
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.APPROVED, isActive: true, rejectionReason: null },
  });
}

// ─── Customer Management ──────────────────────────────────────

export async function listCustomers(opts: {
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where.OR = [
      { firstName: { contains: opts.search, mode: "insensitive" } },
      { lastName: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search } },
      { email: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        avatarUrl: true,
        isVerified: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
        wallet: { select: { balanceKobo: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getCustomerDetail(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      avatarUrl: true,
      referralCode: true,
      isVerified: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { orders: true, addresses: true } },
      wallet: { select: { id: true, balanceKobo: true, createdAt: true } },
    },
  });
}

export async function getCustomerOrders(
  userId: string,
  opts: { status?: string; page: number; limit: number }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { customerId: userId };
  if (opts.status) where.status = opts.status;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: { select: { id: true, name: true, type: true } },
        items: true,
        events: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function updateCustomerStatus(userId: string, status: UserStatus) {
  await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function getCustomerWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } },
  });
  return wallet;
}

export async function getCustomerWalletTransactions(
  userId: string,
  opts: { type?: string; page: number; limit: number }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return { data: [], total: 0, page: opts.page, limit: opts.limit };

  const where: any = { walletId: wallet.id };
  if (opts.type) where.type = opts.type;

  const [data, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

// ─── Audit Logs ───────────────────────────────────────────────

export async function listAuditLogs(opts: {
  vendorId?: string;
  adminId?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.vendorId) where.vendorId = opts.vendorId;
  if (opts.adminId) where.adminId = opts.adminId;
  if (opts.action) where.action = { contains: opts.action, mode: "insensitive" };
  if (opts.entity) where.entity = { contains: opts.entity, mode: "insensitive" };
  if (opts.from || opts.to) {
    where.createdAt = {};
    if (opts.from) where.createdAt.gte = new Date(opts.from);
    if (opts.to) where.createdAt.lte = new Date(opts.to);
  }

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: opts.limit,
      include: {
        admin: { select: { id: true, type: true, email: true, firstName: true, lastName: true } },
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}
