import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { AdminRole, AdminType, VendorType, OrderStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { sendEmail, vendorTeamInviteEmail, vendorWelcomeEmail, adminNewVendorApplicationEmail } from "./emailService";
import { notifyCustomerOrderUpdate } from "./fcmService";
import { broadcastTracking } from "../index";
import { uploadDocument, deleteImageByUrl } from "./cloudinaryService";

const SALT_ROUNDS = 12;

type VendorRole = Extract<AdminRole, "OWNER" | "MANAGER" | "STAFF">;

// ─── Onboarding ───────────────────────────────────────────────

const VENDOR_DOC_FOLDERS = {
  businessRegistration: "godrop/vendor-docs/business-registration",
  governmentId: "godrop/vendor-docs/government-id",
  utilityBill: "godrop/vendor-docs/utility-bill",
} as const;

export async function onboardVendor(data: {
  name: string;
  type: VendorType;
  description?: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  email: string;
  cuisines?: string[];
  openingHours?: object;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
  documentBuffers: {
    businessRegistration: Buffer;
    governmentId: Buffer;
    utilityBill: Buffer;
  };
}) {
  const existingAdmin = await prisma.admin.findUnique({ where: { email: data.email } });
  if (existingAdmin) throw new Error("An account with this email already exists");

  // Upload all three documents to Cloudinary in parallel
  const [businessRegistrationUrl, governmentIdUrl, utilityBillUrl] = await Promise.all([
    uploadDocument(data.documentBuffers.businessRegistration, VENDOR_DOC_FOLDERS.businessRegistration),
    uploadDocument(data.documentBuffers.governmentId, VENDOR_DOC_FOLDERS.governmentId),
    uploadDocument(data.documentBuffers.utilityBill, VENDOR_DOC_FOLDERS.utilityBill),
  ]);

  const hashedPassword = await bcrypt.hash(data.ownerPassword, SALT_ROUNDS);

  const vendor = await prisma.vendor.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      phone: data.phone,
      email: data.email,
      cuisines: data.cuisines ?? [],
      openingHours: data.openingHours,
      documents: { businessRegistrationUrl, governmentIdUrl, utilityBillUrl },
      admins: {
        create: {
          type: AdminType.VENDOR,
          email: data.email,
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          password: hashedPassword,
          role: AdminRole.OWNER,
        },
      },
    },
    include: { admins: true },
  });

  const dashboardUrl = process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng";
  const reviewUrl = `${dashboardUrl}/vendors/${vendor.id}`;
  const submittedAt = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

  // Email to vendor owner
  await sendEmail(
    vendorWelcomeEmail({
      firstName: data.ownerFirstName,
      vendorName: data.name,
      email: data.email,
    })
  );

  // Emails to all active system admins opted in to vendor notifications
  const adminRecipients = await prisma.admin.findMany({
    where: { type: AdminType.SYSTEM, isActive: true, receiveVendorEmails: true },
    select: { id: true, firstName: true, email: true },
  });

  await Promise.allSettled(
    adminRecipients.map((admin) =>
      sendEmail(
        adminNewVendorApplicationEmail({
          adminFirstName: admin.firstName,
          adminEmail: admin.email,
          vendorName: data.name,
          vendorType: data.type,
          ownerName: `${data.ownerFirstName} ${data.ownerLastName}`,
          ownerEmail: data.email,
          vendorAddress: data.address,
          submittedAt,
          reviewUrl,
          documents: { businessRegistration: true, governmentId: true, utilityBill: true },
        })
      )
    )
  );

  const { admins, ...vendorSafe } = vendor;
  const { password: _pw, ...ownerSafe } = admins[0];
  return { vendor: vendorSafe, admin: ownerSafe };
}

// ─── Categories ───────────────────────────────────────────────

export async function createCategory(
  vendorId: string,
  data: { name: string; description?: string; imageUrl?: string; isActive?: boolean; sortOrder?: number }
) {
  return prisma.productCategory.create({ data: { vendorId, ...data } });
}

export async function getCategory(id: string, vendorId: string) {
  const cat = await prisma.productCategory.findFirst({
    where: { id, vendorId },
    include: { _count: { select: { products: true } } },
  });
  if (!cat) throw new Error("Category not found");
  return cat;
}

export async function updateCategory(
  id: string,
  vendorId: string,
  data: { name?: string; description?: string | null; imageUrl?: string | null; sortOrder?: number }
) {
  const cat = await prisma.productCategory.findFirst({ where: { id, vendorId } });
  if (!cat) throw new Error("Category not found");
  if (cat.imageUrl && data.imageUrl !== undefined && data.imageUrl !== cat.imageUrl) {
    await deleteImageByUrl(cat.imageUrl);
  }
  return prisma.productCategory.update({ where: { id }, data });
}

export async function toggleCategoryActive(id: string, vendorId: string, isActive: boolean) {
  const cat = await prisma.productCategory.findFirst({ where: { id, vendorId } });
  if (!cat) throw new Error("Category not found");
  return prisma.productCategory.update({ where: { id }, data: { isActive } });
}

export async function deleteCategory(id: string, vendorId: string) {
  const cat = await prisma.productCategory.findFirst({ where: { id, vendorId } });
  if (!cat) throw new Error("Category not found");
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) throw new Error("Cannot delete a category that has products");
  if (cat.imageUrl) await deleteImageByUrl(cat.imageUrl);
  await prisma.productCategory.delete({ where: { id } });
}

export async function listCategories(vendorId: string) {
  return prisma.productCategory.findMany({
    where: { vendorId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

// ─── Products ─────────────────────────────────────────────────

export async function getProduct(id: string, vendorId: string) {
  const product = await prisma.product.findFirst({
    where: { id, category: { vendorId } },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) throw new Error("Product not found");
  return product;
}

export async function createProduct(
  vendorId: string,
  data: {
    categoryId: string;
    name: string;
    description?: string;
    priceKobo: number;
    imageUrl?: string;
    isAvailable?: boolean;
    stock?: number;
  }
) {
  const cat = await prisma.productCategory.findFirst({ where: { id: data.categoryId, vendorId } });
  if (!cat) throw new Error("Category not found");
  return prisma.product.create({ data });
}

export async function updateProduct(
  id: string,
  vendorId: string,
  data: {
    categoryId?: string;
    name?: string;
    description?: string | null;
    priceKobo?: number;
    imageUrl?: string | null;
    isAvailable?: boolean;
    stock?: number | null;
  }
) {
  const product = await prisma.product.findFirst({
    where: { id, category: { vendorId } },
  });
  if (!product) throw new Error("Product not found");

  if (data.categoryId) {
    const cat = await prisma.productCategory.findFirst({
      where: { id: data.categoryId, vendorId },
    });
    if (!cat) throw new Error("Category not found");
  }

  if (product.imageUrl && data.imageUrl !== undefined && data.imageUrl !== product.imageUrl) {
    await deleteImageByUrl(product.imageUrl);
  }

  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string, vendorId: string) {
  const product = await prisma.product.findFirst({
    where: { id, category: { vendorId } },
  });
  if (!product) throw new Error("Product not found");
  if (product.imageUrl) await deleteImageByUrl(product.imageUrl);
  await prisma.product.delete({ where: { id } });
}

export async function toggleProductAvailability(id: string, vendorId: string, isAvailable: boolean) {
  const product = await prisma.product.findFirst({
    where: { id, category: { vendorId } },
  });
  if (!product) throw new Error("Product not found");
  return prisma.product.update({ where: { id }, data: { isAvailable } });
}

export async function listProducts(
  vendorId: string,
  opts: { categoryId?: string; page?: number; limit?: number }
) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = { category: { vendorId } };
  if (opts.categoryId) where.categoryId = opts.categoryId;

  const [data, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);
  return { data, total, page, limit };
}

// ─── Orders ───────────────────────────────────────────────────

export async function listVendorOrders(
  vendorId: string,
  opts: { status?: OrderStatus; page?: number; limit?: number }
) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = { vendorId };
  if (opts.status) where.status = opts.status;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: true,
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);
  return { data, total, page, limit };
}

export async function getVendorOrder(orderId: string, vendorId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, vendorId },
    include: {
      items: { include: { product: true } },
      customer: { select: { firstName: true, lastName: true, phone: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) throw new Error("Order not found");
  return order;
}

const VENDOR_STATUS_NOTIFICATIONS: Partial<Record<OrderStatus, { title: string; body: (trackingCode: string) => string; type: string }>> = {
  [OrderStatus.ACCEPTED]:        { title: "Order confirmed",    body: (t) => `Your order #${t} has been confirmed and will be prepared shortly.`, type: "ORDER_ACCEPTED" },
  [OrderStatus.PREPARING]:       { title: "Order being prepared", body: (t) => `Your order #${t} is now being prepared.`, type: "ORDER_PREPARING" },
  [OrderStatus.READY_FOR_PICKUP]:{ title: "Order ready",        body: (t) => `Your order #${t} is ready and a rider is being assigned.`, type: "ORDER_READY_FOR_PICKUP" },
  [OrderStatus.CANCELLED]:       { title: "Order cancelled",    body: (t) => `Your order #${t} has been cancelled.`, type: "ORDER_CANCELLED" },
};

async function transitionOrder(
  orderId: string,
  vendorId: string,
  newStatus: OrderStatus,
  allowedFromStatuses: OrderStatus[],
  description: string
) {
  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId } });
  if (!order) throw new Error("Order not found");
  if (!allowedFromStatuses.includes(order.status)) {
    throw new Error(`Cannot transition order from ${order.status} to ${newStatus}`);
  }
  const result = await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: newStatus } }),
    prisma.orderEvent.create({ data: { orderId, status: newStatus, description } }),
  ]);

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: newStatus });

  const notif = VENDOR_STATUS_NOTIFICATIONS[newStatus];
  if (notif) {
    notifyCustomerOrderUpdate(
      order.customerId, orderId, order.trackingCode,
      notif.title,
      notif.body(order.trackingCode),
      notif.type
    ).catch(() => {});
  }

  return result;
}

export async function acceptOrder(orderId: string, vendorId: string) {
  return transitionOrder(orderId, vendorId, OrderStatus.ACCEPTED, [OrderStatus.PENDING], "Order accepted by vendor");
}

export async function markOrderReady(orderId: string, vendorId: string) {
  return transitionOrder(orderId, vendorId, OrderStatus.READY_FOR_PICKUP, [OrderStatus.ACCEPTED, OrderStatus.PREPARING], "Order ready for pickup");
}

export async function markOrderPreparing(orderId: string, vendorId: string) {
  return transitionOrder(orderId, vendorId, OrderStatus.PREPARING, [OrderStatus.ACCEPTED], "Order is being prepared");
}

export async function rejectOrder(orderId: string, vendorId: string, reason?: string) {
  return transitionOrder(orderId, vendorId, OrderStatus.CANCELLED, [OrderStatus.PENDING], reason ?? "Order rejected by vendor");
}

// ─── Settings ─────────────────────────────────────────────────

export async function getVendorSettings(vendorId: string) {
  return prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
}

export async function updateVendorSettings(
  vendorId: string,
  data: {
    name?: string;
    description?: string | null;
    phone?: string;
    email?: string;
    deliveryFeeKobo?: number;
    estimatedMinutes?: number;
    isOpen?: boolean;
    openingHours?: object;
  }
) {
  return prisma.vendor.update({ where: { id: vendorId }, data });
}

// ─── Team ─────────────────────────────────────────────────────

export async function listTeamMembers(vendorId: string) {
  return prisma.admin.findMany({
    where: { vendorId, type: AdminType.VENDOR },
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
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteTeamMember(
  vendorId: string,
  data: { email: string; firstName: string; lastName: string; role: VendorRole }
) {
  const existing = await prisma.admin.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("An account with this email already exists");

  const tempPassword = nanoid(12);
  const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const member = await prisma.admin.create({
    data: {
      type: AdminType.VENDOR,
      vendorId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      role: data.role,
    },
  });

  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  await sendEmail(
    vendorTeamInviteEmail({
      firstName: data.firstName,
      vendorName: vendor.name,
      email: data.email,
      role: data.role,
      temporaryPassword: tempPassword,
    })
  );

  const { password: _pw, ...memberSafe } = member;
  return memberSafe;
}

export async function updateTeamMemberRole(memberId: string, vendorId: string, role: VendorRole) {
  const member = await prisma.admin.findFirst({ where: { id: memberId, vendorId } });
  if (!member) throw new Error("Team member not found");
  if (member.role === AdminRole.OWNER) throw new Error("Cannot change the role of the owner");
  return prisma.admin.update({
    where: { id: memberId },
    data: { role },
    select: { id: true, type: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });
}

export async function removeTeamMember(memberId: string, vendorId: string, requesterId: string) {
  if (memberId === requesterId) throw new Error("Cannot remove yourself");
  const member = await prisma.admin.findFirst({ where: { id: memberId, vendorId } });
  if (!member) throw new Error("Team member not found");
  if (member.role === AdminRole.OWNER) throw new Error("Cannot remove the owner");
  await prisma.admin.update({ where: { id: memberId }, data: { isActive: false } });
}

export async function changePassword(adminId: string, currentPassword: string, newPassword: string) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) throw new Error("Current password is incorrect");
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });
}

export async function getProfile(adminId: string) {
  return prisma.admin.findUniqueOrThrow({
    where: { id: adminId },
    select: {
      id: true,
      type: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      vendorId: true,
      createdAt: true,
      vendor: true,
    },
  });
}

export async function updateProfile(
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
    select: {
      id: true,
      type: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      vendorId: true,
    },
  });
}

const DEFAULT_VENDOR_SETTINGS = { emailNotifications: true, orderAlerts: true };

export async function getSettings(adminId: string) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId }, select: { settings: true } });
  return { ...DEFAULT_VENDOR_SETTINGS, ...(admin.settings as object | null ?? {}) };
}

export async function updateSettings(
  adminId: string,
  data: { emailNotifications?: boolean; orderAlerts?: boolean }
) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId }, select: { settings: true } });
  const merged = { ...DEFAULT_VENDOR_SETTINGS, ...(admin.settings as object | null ?? {}), ...data };
  await prisma.admin.update({ where: { id: adminId }, data: { settings: merged } });
  return merged;
}
