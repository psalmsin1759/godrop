import { prisma } from "../lib/prisma";
import {
  DisputeCategory,
  DisputeRaisedByType,
  DisputeResolutionType,
  DisputeSenderType,
  DisputeStatus,
} from "@prisma/client";
import { paginate } from "../utils/pagination";
import * as walletService from "./walletService";
import * as fcmService from "./fcmService";

const orderSummarySelect = {
  id: true,
  trackingCode: true,
  type: true,
  status: true,
  totalKobo: true,
  customerId: true,
  vendorId: true,
  riderId: true,
} as const;

const raiserSelect = {
  raisedByCustomer: { select: { id: true, firstName: true, lastName: true, phone: true } },
  raisedByVendor: { select: { id: true, name: true } },
  raisedByRider: { select: { id: true, firstName: true, lastName: true, phone: true } },
} as const;

export async function createDispute(input: {
  orderId: string;
  raisedByType: DisputeRaisedByType;
  raisedByCustomerId?: string;
  raisedByVendorId?: string;
  raisedByRiderId?: string;
  category: DisputeCategory;
  description: string;
  evidenceUrls?: string[];
}) {
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error("Order not found");

  const raiserId =
    input.raisedByType === "CUSTOMER"
      ? input.raisedByCustomerId
      : input.raisedByType === "VENDOR"
      ? input.raisedByVendorId
      : input.raisedByRiderId;
  if (!raiserId) throw new Error(`raisedBy${capitalize(input.raisedByType)}Id is required for this raisedByType`);

  const dispute = await prisma.dispute.create({
    data: {
      orderId: input.orderId,
      raisedByType: input.raisedByType,
      raisedByCustomerId: input.raisedByType === "CUSTOMER" ? raiserId : undefined,
      raisedByVendorId: input.raisedByType === "VENDOR" ? raiserId : undefined,
      raisedByRiderId: input.raisedByType === "RIDER" ? raiserId : undefined,
      category: input.category,
      description: input.description,
      evidenceUrls: input.evidenceUrls ?? [],
      messages: {
        create: {
          senderType: input.raisedByType as unknown as DisputeSenderType,
          senderId: raiserId,
          message: input.description,
          attachmentUrls: input.evidenceUrls ?? [],
        },
      },
    },
    include: { order: { select: orderSummarySelect }, ...raiserSelect },
  });

  return dispute;
}

function capitalize(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export async function listDisputes(opts: {
  status?: DisputeStatus;
  category?: DisputeCategory;
  raisedByType?: DisputeRaisedByType;
  search?: string;
  page: number;
  limit: number;
}) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.category) where.category = opts.category;
  if (opts.raisedByType) where.raisedByType = opts.raisedByType;
  if (opts.search) {
    where.OR = [
      { description: { contains: opts.search, mode: "insensitive" } },
      { order: { trackingCode: { contains: opts.search, mode: "insensitive" } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.dispute.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: orderSummarySelect },
        assignedAdmin: { select: { id: true, firstName: true, lastName: true } },
        ...raiserSelect,
        _count: { select: { messages: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getDisputeDetail(id: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      order: { select: orderSummarySelect },
      assignedAdmin: { select: { id: true, firstName: true, lastName: true } },
      ...raiserSelect,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!dispute) throw new Error("Dispute not found");
  return dispute;
}

export async function addMessage(
  disputeId: string,
  input: {
    senderType: DisputeSenderType;
    senderId: string;
    message: string;
    attachmentUrls?: string[];
    isInternal?: boolean;
  }
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { order: { select: orderSummarySelect } },
  });
  if (!dispute) throw new Error("Dispute not found");
  if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
    throw new Error("This dispute is already closed");
  }

  const message = await prisma.disputeMessage.create({
    data: {
      disputeId,
      senderType: input.senderType,
      senderId: input.senderId,
      message: input.message,
      attachmentUrls: input.attachmentUrls ?? [],
      isInternal: input.isInternal ?? false,
    },
  });

  // Admin replying nudges an untouched ticket into review; the raiser
  // replying back means the ball is back in the admin's court.
  let nextStatus: DisputeStatus | undefined;
  if (input.senderType === "ADMIN" && dispute.status === "OPEN") nextStatus = "UNDER_REVIEW";
  if (input.senderType === dispute.raisedByType && dispute.status === "AWAITING_RESPONSE") {
    nextStatus = "UNDER_REVIEW";
  }
  if (nextStatus) {
    await prisma.dispute.update({ where: { id: disputeId }, data: { status: nextStatus } });
  }

  if (input.senderType === "ADMIN" && !input.isInternal) {
    notifyRaiserNewMessage(dispute).catch(() => {});
  }

  return message;
}

export async function assignDispute(disputeId: string, adminId: string) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error("Dispute not found");

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      assignedAdminId: adminId,
      status: dispute.status === "OPEN" ? "UNDER_REVIEW" : dispute.status,
    },
  });
}

export async function updateStatus(disputeId: string, status: DisputeStatus) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error("Dispute not found");
  if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
    throw new Error("This dispute is already closed");
  }
  return prisma.dispute.update({ where: { id: disputeId }, data: { status } });
}

export async function resolveDispute(
  disputeId: string,
  input: {
    resolutionType: DisputeResolutionType;
    resolutionNotes?: string;
    resolutionAmountKobo?: number;
    adminId: string;
  }
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { order: true },
  });
  if (!dispute) throw new Error("Dispute not found");
  if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
    throw new Error("This dispute is already closed");
  }

  if (input.resolutionType === "REFUND_CUSTOMER") {
    if (!input.resolutionAmountKobo || input.resolutionAmountKobo <= 0) {
      throw new Error("resolutionAmountKobo is required for a customer refund");
    }
    await walletService.credit(
      dispute.order.customerId,
      input.resolutionAmountKobo,
      `Dispute resolution refund for order #${dispute.order.trackingCode}`,
      dispute.order.id
    );
  }

  if (input.resolutionType === "COMPENSATE_RIDER") {
    const riderId = dispute.raisedByRiderId ?? dispute.order.riderId;
    if (!riderId) throw new Error("No rider is associated with this order to compensate");
    if (!input.resolutionAmountKobo || input.resolutionAmountKobo <= 0) {
      throw new Error("resolutionAmountKobo is required for rider compensation");
    }
    await prisma.riderEarning.create({
      data: {
        riderId,
        orderId: dispute.order.id,
        amountKobo: input.resolutionAmountKobo,
        status: "PENDING",
      },
    });
  }

  const status: DisputeStatus = input.resolutionType === "REJECTED" ? "REJECTED" : "RESOLVED";

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status,
      assignedAdminId: dispute.assignedAdminId ?? input.adminId,
      resolutionType: input.resolutionType,
      resolutionNotes: input.resolutionNotes,
      resolutionAmountKobo: input.resolutionAmountKobo,
      resolvedAt: new Date(),
    },
    include: { order: { select: orderSummarySelect }, ...raiserSelect },
  });

  notifyRaiserResolved(updated).catch(() => {});

  return updated;
}

async function notifyRaiserNewMessage(dispute: {
  id: string;
  orderId: string;
  raisedByType: DisputeRaisedByType;
  raisedByCustomerId: string | null;
  raisedByVendorId: string | null;
  raisedByRiderId: string | null;
  order: { trackingCode: string };
}) {
  const title = "New reply on your dispute";
  const body = `Support replied to your report on order #${dispute.order.trackingCode}.`;
  const data = { type: "DISPUTE_REPLY", disputeId: dispute.id, orderId: dispute.orderId };

  if (dispute.raisedByType === "CUSTOMER" && dispute.raisedByCustomerId) {
    const tokens = await prisma.pushToken.findMany({
      where: { userId: dispute.raisedByCustomerId },
      select: { token: true },
    });
    await Promise.all([
      tokens.length > 0
        ? fcmService.sendToCustomerTokens(tokens.map((t) => t.token), { title, body }, data)
        : Promise.resolve(),
      prisma.notification.create({ data: { userId: dispute.raisedByCustomerId, title, body, data } }),
    ]);
  } else if (dispute.raisedByType === "RIDER" && dispute.raisedByRiderId) {
    const tokens = await prisma.riderPushToken.findMany({
      where: { riderId: dispute.raisedByRiderId },
      select: { token: true },
    });
    await Promise.all([
      tokens.length > 0
        ? fcmService.sendToRiderTokens(tokens.map((t) => t.token), { title, body }, data)
        : Promise.resolve(),
      prisma.riderNotification.create({ data: { riderId: dispute.raisedByRiderId, title, body, data } }),
    ]);
  } else if (dispute.raisedByType === "VENDOR" && dispute.raisedByVendorId) {
    const admins = await prisma.admin.findMany({
      where: { vendorId: dispute.raisedByVendorId, type: "VENDOR", isActive: true },
      select: { id: true, pushTokens: { select: { token: true } } },
    });
    const tokens = admins.flatMap((a) => a.pushTokens.map((t) => t.token));
    await Promise.all([
      fcmService.sendToVendorAdminTokens(tokens, { title, body }, data),
      prisma.adminNotification.createMany({
        data: admins.map((a) => ({ adminId: a.id, type: "DISPUTE_REPLY", title, body, data })),
      }),
    ]);
  }
}

async function notifyRaiserResolved(dispute: {
  id: string;
  orderId: string;
  raisedByType: DisputeRaisedByType;
  raisedByCustomerId: string | null;
  raisedByVendorId: string | null;
  raisedByRiderId: string | null;
  resolutionType: DisputeResolutionType | null;
  order: { trackingCode: string };
}) {
  const resolved = dispute.resolutionType !== "REJECTED";
  const title = resolved ? "Your dispute has been resolved" : "Your dispute was reviewed";
  const body = resolved
    ? `We've resolved your report on order #${dispute.order.trackingCode}.`
    : `We've reviewed your report on order #${dispute.order.trackingCode} — no action was taken.`;
  const data = { type: "DISPUTE_RESOLVED", disputeId: dispute.id, orderId: dispute.orderId };

  if (dispute.raisedByType === "CUSTOMER" && dispute.raisedByCustomerId) {
    const tokens = await prisma.pushToken.findMany({
      where: { userId: dispute.raisedByCustomerId },
      select: { token: true },
    });
    await Promise.all([
      tokens.length > 0
        ? fcmService.sendToCustomerTokens(tokens.map((t) => t.token), { title, body }, data)
        : Promise.resolve(),
      prisma.notification.create({ data: { userId: dispute.raisedByCustomerId, title, body, data } }),
    ]);
  } else if (dispute.raisedByType === "RIDER" && dispute.raisedByRiderId) {
    const tokens = await prisma.riderPushToken.findMany({
      where: { riderId: dispute.raisedByRiderId },
      select: { token: true },
    });
    await Promise.all([
      tokens.length > 0
        ? fcmService.sendToRiderTokens(tokens.map((t) => t.token), { title, body }, data)
        : Promise.resolve(),
      prisma.riderNotification.create({ data: { riderId: dispute.raisedByRiderId, title, body, data } }),
    ]);
  } else if (dispute.raisedByType === "VENDOR" && dispute.raisedByVendorId) {
    const admins = await prisma.admin.findMany({
      where: { vendorId: dispute.raisedByVendorId, type: "VENDOR", isActive: true },
      select: { id: true, pushTokens: { select: { token: true } } },
    });
    const tokens = admins.flatMap((a) => a.pushTokens.map((t) => t.token));
    await Promise.all([
      fcmService.sendToVendorAdminTokens(tokens, { title, body }, data),
      prisma.adminNotification.createMany({
        data: admins.map((a) => ({ adminId: a.id, type: "DISPUTE_RESOLVED", title, body, data })),
      }),
    ]);
  }
}

// ─── Self-service (customer/vendor/rider app) ───────────────────
//
// The admin functions above operate on any dispute. These wrap them with an
// ownership check so a customer/vendor/rider can only touch their own
// disputes, and strip internal admin notes out of anything sent back to them.

export type DisputeActor = { type: DisputeRaisedByType; id: string };

async function verifyActorOnOrder(orderId: string, actor: DisputeActor) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  if (actor.type === "CUSTOMER" && order.customerId === actor.id) return order;
  if (actor.type === "VENDOR" && order.vendorId === actor.id) return order;
  if (actor.type === "RIDER") {
    if (order.riderId === actor.id) return order;
    const everInvolved =
      (await prisma.riderEarning.findFirst({ where: { orderId, riderId: actor.id } })) ??
      (await prisma.riderRejection.findFirst({ where: { orderId, riderId: actor.id } }));
    if (everInvolved) return order;
  }
  throw new Error("You are not associated with this order");
}

async function assertOwnership(disputeId: string, actor: DisputeActor) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error("Dispute not found");
  const ownerId =
    actor.type === "CUSTOMER"
      ? dispute.raisedByCustomerId
      : actor.type === "VENDOR"
      ? dispute.raisedByVendorId
      : dispute.raisedByRiderId;
  if (dispute.raisedByType !== actor.type || ownerId !== actor.id) throw new Error("Dispute not found");
  return dispute;
}

export async function createDisputeAsActor(
  actor: DisputeActor,
  input: { orderId: string; category: DisputeCategory; description: string; evidenceUrls?: string[] }
) {
  await verifyActorOnOrder(input.orderId, actor);
  return createDispute({
    orderId: input.orderId,
    raisedByType: actor.type,
    raisedByCustomerId: actor.type === "CUSTOMER" ? actor.id : undefined,
    raisedByVendorId: actor.type === "VENDOR" ? actor.id : undefined,
    raisedByRiderId: actor.type === "RIDER" ? actor.id : undefined,
    category: input.category,
    description: input.description,
    evidenceUrls: input.evidenceUrls,
  });
}

export async function listDisputesForActor(
  actor: DisputeActor,
  opts: { status?: DisputeStatus; page: number; limit: number }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { raisedByType: actor.type };
  if (actor.type === "CUSTOMER") where.raisedByCustomerId = actor.id;
  if (actor.type === "VENDOR") where.raisedByVendorId = actor.id;
  if (actor.type === "RIDER") where.raisedByRiderId = actor.id;
  if (opts.status) where.status = opts.status;

  const [data, total] = await prisma.$transaction([
    prisma.dispute.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      include: { order: { select: orderSummarySelect }, _count: { select: { messages: true } } },
    }),
    prisma.dispute.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getDisputeForActor(disputeId: string, actor: DisputeActor) {
  await assertOwnership(disputeId, actor);
  const dispute = await getDisputeDetail(disputeId);
  return { ...dispute, messages: dispute.messages.filter((m) => !m.isInternal) };
}

export async function addActorMessage(
  disputeId: string,
  actor: DisputeActor,
  input: { message: string; attachmentUrls?: string[] }
) {
  await assertOwnership(disputeId, actor);
  return addMessage(disputeId, {
    senderType: actor.type as unknown as DisputeSenderType,
    senderId: actor.id,
    message: input.message,
    attachmentUrls: input.attachmentUrls,
    isInternal: false,
  });
}
