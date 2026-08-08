import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AdminType, BusinessStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { sendEmail, businessOwnerWelcomeEmail } from "./emailService";
import { getDefaultRole } from "./roleService";

const SALT_ROUNDS = 12;
const ROLE_SELECT = { select: { id: true, name: true, type: true, permissions: true } } as const;

async function requireBusinessRole(roleId: string, businessId: string) {
  const role = await prisma.role.findFirst({
    where: { id: roleId, type: AdminType.BUSINESS, OR: [{ isDefault: true }, { businessId }] },
  });
  if (!role) throw new Error("Invalid role for this business");
  return role;
}

// ─── Shared business profile fields ──────────────────────────

export interface BusinessProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cacRegistrationNumber?: string;
  tin?: string;
  yearEstablished?: number;
  ownerFullName?: string;
  ownerPhoneNumber?: string;
  ownerEmail?: string;
  ownerNIN?: string;
  ownerBVN?: string;
  serviceAreas?: string[];
  cacCertificateUrl?: string;
  driversLicenseUrl?: string;
  insuranceDocumentUrl?: string;
  utilityBillUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

// ─── Business CRUD (used by system admin) ────────────────────

export async function createBusiness(data: BusinessProfileData & { name: string }) {
  const business = await prisma.business.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      cacRegistrationNumber: data.cacRegistrationNumber,
      tin: data.tin,
      yearEstablished: data.yearEstablished,
      ownerFullName: data.ownerFullName,
      ownerPhoneNumber: data.ownerPhoneNumber,
      ownerEmail: data.ownerEmail,
      ownerNIN: data.ownerNIN,
      ownerBVN: data.ownerBVN,
      serviceAreas: data.serviceAreas ?? [],
      cacCertificateUrl: data.cacCertificateUrl,
      driversLicenseUrl: data.driversLicenseUrl,
      insuranceDocumentUrl: data.insuranceDocumentUrl,
      utilityBillUrl: data.utilityBillUrl,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      wallet: { create: { balanceKobo: 0 } },
    },
    include: {
      wallet: true,
      _count: { select: { riders: true, admins: true } },
    },
  });
  return business;
}

export async function listBusinesses(opts: { search?: string; status?: BusinessStatus; page: number; limit: number }) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { email: { contains: opts.search, mode: "insensitive" } },
      { ownerFullName: { contains: opts.search, mode: "insensitive" } },
      { ownerPhoneNumber: { contains: opts.search } },
    ];
  }
  const [data, total] = await prisma.$transaction([
    prisma.business.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      include: {
        wallet: { select: { balanceKobo: true } },
        _count: { select: { riders: true, admins: true } },
      },
    }),
    prisma.business.count({ where }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      wallet: true,
      _count: { select: { riders: true, admins: true } },
    },
  });
  if (!business) throw new Error("Business not found");
  return business;
}

export async function updateBusiness(id: string, data: BusinessProfileData & { status?: BusinessStatus }) {
  const exists = await prisma.business.findUnique({ where: { id } });
  if (!exists) throw new Error("Business not found");
  return prisma.business.update({ where: { id }, data });
}

// ─── Business Owner creation (system admin) ──────────────────

export async function createBusinessOwner(
  businessId: string,
  data: { email: string; firstName: string; lastName: string; password: string }
) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Business not found");

  const conflict = await prisma.admin.findUnique({ where: { email: data.email } });
  if (conflict) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  const ownerRole = await getDefaultRole(AdminType.BUSINESS, "Owner");
  const admin = await prisma.admin.create({
    data: {
      type: AdminType.BUSINESS,
      roleId: ownerRole.id,
      isOwner: true,
      businessId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashed,
    },
    select: { id: true, type: true, role: ROLE_SELECT, email: true, firstName: true, lastName: true, businessId: true, isActive: true, createdAt: true },
  });

  sendEmail(businessOwnerWelcomeEmail({
    firstName: data.firstName,
    email: data.email,
    businessName: business.name,
    temporaryPassword: data.password,
  })).catch(() => {});

  return admin;
}

// ─── Business Admin self-service ─────────────────────────────

export async function getMyBusiness(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      wallet: { select: { balanceKobo: true } },
      _count: { select: { riders: true, admins: true } },
    },
  });
  if (!business) throw new Error("Business not found");
  return business;
}

export async function updateMyBusiness(businessId: string, data: BusinessProfileData) {
  const exists = await prisma.business.findUnique({ where: { id: businessId } });
  if (!exists) throw new Error("Business not found");
  return prisma.business.update({
    where: { id: businessId },
    data,
    include: {
      wallet: { select: { balanceKobo: true } },
      _count: { select: { riders: true, admins: true } },
    },
  });
}

export async function uploadBusinessDocument(
  businessId: string,
  field: "cacCertificateUrl" | "driversLicenseUrl" | "insuranceDocumentUrl" | "utilityBillUrl",
  url: string
) {
  return prisma.business.update({
    where: { id: businessId },
    data: { [field]: url },
    select: { id: true, cacCertificateUrl: true, driversLicenseUrl: true, insuranceDocumentUrl: true, utilityBillUrl: true },
  });
}

// ─── Rider Management ─────────────────────────────────────────

export async function listBusinessRiders(businessId: string, opts: { page: number; limit: number; search?: string }) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { businessId };
  if (opts.search) {
    where.OR = [
      { firstName: { contains: opts.search, mode: "insensitive" } },
      { lastName: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search } },
    ];
  }
  const [data, total] = await prisma.$transaction([
    prisma.rider.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, phone: true, email: true,
        vehicleType: true, vehiclePlate: true, kycStatus: true,
        isAvailable: true, isActive: true, rating: true, ratingCount: true,
        createdAt: true, _count: { select: { orders: true } },
      },
    }),
    prisma.rider.count({ where }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}

export async function assignRiderToBusiness(businessId: string, riderId: string) {
  const rider = await prisma.rider.findUnique({ where: { id: riderId } });
  if (!rider) throw new Error("Rider not found");
  if (rider.businessId && rider.businessId !== businessId) throw new Error("Rider belongs to another business");
  return prisma.rider.update({ where: { id: riderId }, data: { businessId } });
}

export async function removeRiderFromBusiness(businessId: string, riderId: string) {
  const rider = await prisma.rider.findUnique({ where: { id: riderId } });
  if (!rider) throw new Error("Rider not found");
  if (rider.businessId !== businessId) throw new Error("Rider does not belong to this business");
  return prisma.rider.update({ where: { id: riderId }, data: { businessId: null } });
}

export async function getRiderOrders(businessId: string, riderId: string, opts: { page: number; limit: number }) {
  const { skip } = paginate(opts.page, opts.limit);
  const rider = await prisma.rider.findUnique({ where: { id: riderId } });
  if (!rider || rider.businessId !== businessId) throw new Error("Rider not found in this business");

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { riderId },
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, trackingCode: true, type: true, status: true,
        pickupAddress: true, dropoffAddress: true,
        deliveryFeeKobo: true, totalKobo: true, paymentMethod: true,
        createdAt: true,
        earnings: { select: { amountKobo: true, status: true } },
      },
    }),
    prisma.order.count({ where: { riderId } }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}

// ─── Business Wallet ─────────────────────────────────────────

export async function getWallet(businessId: string) {
  let wallet = await prisma.businessWallet.findUnique({ where: { businessId } });
  if (!wallet) {
    wallet = await prisma.businessWallet.create({ data: { businessId, balanceKobo: 0 } });
  }
  return wallet;
}

export async function listWalletTransactions(businessId: string, opts: { page: number; limit: number }) {
  const { skip } = paginate(opts.page, opts.limit);
  const wallet = await prisma.businessWallet.findUnique({ where: { businessId } });
  if (!wallet) return { data: [], total: 0, page: opts.page, limit: opts.limit };

  const [data, total] = await prisma.$transaction([
    prisma.businessWalletTransaction.findMany({
      where: { walletId: wallet.id },
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.businessWalletTransaction.count({ where: { walletId: wallet.id } }),
  ]);
  return { data, total, page: opts.page, limit: opts.limit };
}

// ─── Business Team Management ─────────────────────────────────

export async function listBusinessAdmins(businessId: string) {
  return prisma.admin.findMany({
    where: { businessId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: ROLE_SELECT, isOwner: true, isActive: true, createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createBusinessAdmin(
  businessId: string,
  data: { email: string; firstName: string; lastName: string; password: string; roleId: string }
) {
  const conflict = await prisma.admin.findUnique({ where: { email: data.email } });
  if (conflict) throw new Error("Email already exists");
  const role = await requireBusinessRole(data.roleId, businessId);

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  return prisma.admin.create({
    data: {
      type: AdminType.BUSINESS,
      roleId: role.id,
      businessId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashed,
    },
    select: { id: true, type: true, role: ROLE_SELECT, email: true, firstName: true, lastName: true, businessId: true, isActive: true, createdAt: true },
  });
}

export async function updateBusinessAdmin(
  businessId: string,
  adminId: string,
  data: { firstName?: string; lastName?: string; isActive?: boolean; roleId?: string }
) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || admin.businessId !== businessId) throw new Error("Admin not found in this business");
  if (admin.isOwner) throw new Error("Cannot modify the business owner through this endpoint");

  const { roleId, ...rest } = data;
  const role = roleId ? await requireBusinessRole(roleId, businessId) : undefined;

  return prisma.admin.update({
    where: { id: adminId },
    data: { ...rest, ...(role ? { roleId: role.id } : {}) },
    select: { id: true, type: true, role: ROLE_SELECT, email: true, firstName: true, lastName: true, isActive: true },
  });
}

// ─── Credit business wallet (called from riderEarningService) ─

export async function creditBusinessWalletForEarning(riderId: string, amountKobo: number, orderId: string) {
  const rider = await prisma.rider.findUnique({ where: { id: riderId }, select: { businessId: true } });
  if (!rider?.businessId) return;

  const wallet = await prisma.businessWallet.upsert({
    where: { businessId: rider.businessId },
    update: { balanceKobo: { increment: amountKobo } },
    create: { businessId: rider.businessId, balanceKobo: amountKobo },
  });

  await prisma.businessWalletTransaction.create({
    data: {
      walletId: wallet.id,
      riderId,
      type: "RIDER_EARNING",
      amountKobo,
      reference: `earning-${orderId}`,
      description: `Earning from order ${orderId}`,
    },
  });
}
