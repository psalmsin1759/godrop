import { prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { RiderKycStatus } from "@prisma/client";

export interface RiderGuarantor {
  name: string;
  phone: string;
  relationship: string;
  address?: string;
  occupation?: string;
}

export async function listRiders(opts: {
  search?: string;
  kycStatus?: RiderKycStatus;
  isActive?: boolean;
  page: number;
  limit: number;
}) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.kycStatus) where.kycStatus = opts.kycStatus;
  if (typeof opts.isActive === "boolean") where.isActive = opts.isActive;
  if (opts.search) {
    where.OR = [
      { firstName: { contains: opts.search, mode: "insensitive" } },
      { lastName: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search } },
      { email: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.rider.findMany({
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
        vehicleType: true,
        vehiclePlate: true,
        kycStatus: true,
        isAvailable: true,
        isActive: true,
        rating: true,
        ratingCount: true,
        city: true,
        state: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.rider.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getRiderDetail(id: string) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");
  return rider;
}

export async function createRider(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  landmark?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  driverLicenseNumber?: string;
  driverLicenseExpiry?: string;
  vehicleInsuranceExpiry?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  bvn?: string;
  nin?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  guarantors?: RiderGuarantor[];
}) {
  const existing = await prisma.rider.findUnique({ where: { phone: data.phone } });
  if (existing) throw new Error("A rider with this phone number already exists");
  if (data.email) {
    const emailConflict = await prisma.rider.findUnique({ where: { email: data.email } });
    if (emailConflict) throw new Error("A rider with this email already exists");
  }

  return prisma.rider.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      driverLicenseExpiry: data.driverLicenseExpiry ? new Date(data.driverLicenseExpiry) : undefined,
      vehicleInsuranceExpiry: data.vehicleInsuranceExpiry ? new Date(data.vehicleInsuranceExpiry) : undefined,
      guarantors: data.guarantors ? (data.guarantors as any) : undefined,
    },
  });
}

export async function updateRider(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    streetAddress?: string | null;
    city?: string | null;
    state?: string | null;
    landmark?: string | null;
    vehicleType?: string | null;
    vehiclePlate?: string | null;
    vehicleColor?: string | null;
    vehicleModel?: string | null;
    vehicleYear?: number | null;
    driverLicenseNumber?: string | null;
    driverLicenseExpiry?: string | null;
    vehicleInsuranceExpiry?: string | null;
    bankName?: string | null;
    bankCode?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    bvn?: string | null;
    nin?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    guarantors?: RiderGuarantor[] | null;
    isActive?: boolean;
  }
) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");

  if (data.phone && data.phone !== rider.phone) {
    const conflict = await prisma.rider.findUnique({ where: { phone: data.phone } });
    if (conflict) throw new Error("A rider with this phone number already exists");
  }
  if (data.email && data.email !== rider.email) {
    const conflict = await prisma.rider.findUnique({ where: { email: data.email } });
    if (conflict) throw new Error("A rider with this email already exists");
  }

  return prisma.rider.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth === null ? null : data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      driverLicenseExpiry:
        data.driverLicenseExpiry === null ? null : data.driverLicenseExpiry ? new Date(data.driverLicenseExpiry) : undefined,
      vehicleInsuranceExpiry:
        data.vehicleInsuranceExpiry === null ? null : data.vehicleInsuranceExpiry ? new Date(data.vehicleInsuranceExpiry) : undefined,
      guarantors: data.guarantors === null ? null : data.guarantors ? (data.guarantors as any) : undefined,
    },
  });
}

export async function updateRiderKyc(id: string, status: RiderKycStatus, notes?: string) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");
  return prisma.rider.update({
    where: { id },
    data: { kycStatus: status, kycNotes: notes ?? null },
  });
}

export async function toggleRiderActive(id: string, isActive: boolean) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");
  return prisma.rider.update({ where: { id }, data: { isActive } });
}
