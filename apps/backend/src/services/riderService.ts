import { prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { RiderKycStatus } from "@prisma/client";

export interface RiderGuarantor {
  name: string;
  phone: string;
  address: string;
  governmentIdUrl?: string;
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

export async function getRiderStats() {
  const [total, active, available, kycBreakdown] = await prisma.$transaction([
    prisma.rider.count(),
    prisma.rider.count({ where: { isActive: true } }),
    prisma.rider.count({ where: { isAvailable: true, isActive: true } }),
    prisma.rider.groupBy({ by: ["kycStatus"], orderBy: { kycStatus: "asc" }, _count: true }),
  ]);

  const byKycStatus = Object.fromEntries(
    kycBreakdown.map((r) => [r.kycStatus, r._count])
  );

  return { total, active, available, byKycStatus };
}

export async function getRiderOrders(
  id: string,
  opts: { page: number; limit: number; status?: string }
) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");

  const skip = (opts.page - 1) * opts.limit;
  const where: any = { riderId: id };
  if (opts.status) where.status = opts.status;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingCode: true,
        type: true,
        status: true,
        pickupAddress: true,
        dropoffAddress: true,
        deliveryFeeKobo: true,
        totalKobo: true,
        paymentMethod: true,
        createdAt: true,
        vendor: { select: { id: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getRiderEarnings(id: string, opts: { page: number; limit: number }) {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw new Error("Rider not found");

  const skip = (opts.page - 1) * opts.limit;
  const [data, total, aggregate] = await prisma.$transaction([
    prisma.riderEarning.findMany({
      where: { riderId: id },
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, trackingCode: true, type: true, createdAt: true } },
      },
    }),
    prisma.riderEarning.count({ where: { riderId: id } }),
    prisma.riderEarning.aggregate({ where: { riderId: id }, _sum: { amountKobo: true } }),
  ]);

  return {
    data,
    total,
    page: opts.page,
    limit: opts.limit,
    totalEarnedKobo: aggregate._sum.amountKobo ?? 0,
  };
}

export async function assignOrderToRider(orderId: string, riderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (!["PENDING", "ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Order cannot be assigned at this stage");
  }

  const rider = await prisma.rider.findUnique({ where: { id: riderId } });
  if (!rider) throw new Error("Rider not found");
  if (!rider.isActive) throw new Error("Rider is not active");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { riderId },
  });

  await prisma.orderEvent.create({
    data: {
      orderId,
      status: updated.status,
      description: `Rider assigned: ${rider.firstName} ${rider.lastName}`,
    },
  });

  return updated;
}

export async function listAvailableRiders(lat?: number, lng?: number) {
  const riders = await prisma.rider.findMany({
    where: { isAvailable: true, isActive: true, kycStatus: "VERIFIED" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      vehicleType: true,
      vehiclePlate: true,
      lat: true,
      lng: true,
      rating: true,
      ratingCount: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return riders;
}

export async function processWithdrawal(
  withdrawalId: string,
  action: "approve" | "reject",
  notes?: string
) {
  const withdrawal = await prisma.riderWithdrawal.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) throw new Error("Withdrawal not found");
  if (withdrawal.status !== "PENDING") throw new Error("Withdrawal is not pending");

  const status = action === "approve" ? "PROCESSING" : "FAILED";

  const updated = await prisma.riderWithdrawal.update({
    where: { id: withdrawalId },
    data: { status, notes: notes ?? null, processedAt: new Date() },
  });

  if (action === "approve") {
    await prisma.riderEarning.updateMany({
      where: { riderId: withdrawal.riderId, status: "PENDING" },
      data: { status: "SETTLED", settledAt: new Date() },
    });
  }

  return updated;
}
