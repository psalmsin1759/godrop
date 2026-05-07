import admin from "firebase-admin";
import { prisma } from "../lib/prisma";

let messaging: admin.messaging.Messaging | null = null;

function getMessaging(): admin.messaging.Messaging | null {
  if (messaging) return messaging;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  const app = admin.apps.length
    ? admin.apps[0]!
    : admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });

  messaging = admin.messaging(app);
  return messaging;
}

interface SendResult {
  successCount: number;
  failureCount: number;
}

async function dispatch(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; staleTokens: string[] }> {
  const fcm = getMessaging();
  if (!fcm) {
    console.warn("[FCM] Not configured — skipping push to %d token(s)", tokens.length);
    return { successCount: 0, failureCount: tokens.length, staleTokens: [] };
  }

  const type = data?.type ?? "unknown";
  console.log("[FCM] Sending | type=%s | tokens=%d | title=%s", type, tokens.length, notification.title);

  const response = await fcm.sendEachForMulticast({
    tokens,
    notification,
    data,
    android: { priority: "high" },
    apns: { payload: { aps: { contentAvailable: true } } },
  });

  const staleTokens: string[] = [];
  response.responses.forEach((res, i) => {
    if (!res.success) {
      const code = res.error?.code ?? "unknown";
      console.warn("[FCM] Token failed | type=%s | code=%s", type, code);
      if (code === "messaging/registration-token-not-registered") staleTokens.push(tokens[i]);
    }
  });

  console.log("[FCM] Result | type=%s | success=%d | fail=%d | stale=%d",
    type, response.successCount, response.failureCount, staleTokens.length);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    staleTokens,
  };
}

// ─── Rider token dispatch ──────────────────────────────────────

export async function sendToRiderTokens(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const { successCount, failureCount, staleTokens } = await dispatch(tokens, notification, data);

  if (staleTokens.length > 0) {
    await prisma.riderPushToken.deleteMany({ where: { token: { in: staleTokens } } });
  }

  return { successCount, failureCount };
}

// Backward-compat alias used by notifyOnlineRidersNewParcel and internal callers
export async function sendToTokens(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<void> {
  await sendToRiderTokens(tokens, notification, data);
}

// ─── Customer token dispatch ───────────────────────────────────

export async function sendToCustomerTokens(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const { successCount, failureCount, staleTokens } = await dispatch(tokens, notification, data);

  if (staleTokens.length > 0) {
    await prisma.pushToken.deleteMany({ where: { token: { in: staleTokens } } });
  }

  return { successCount, failureCount };
}

// ─── Admin helpers ─────────────────────────────────────────────

export async function sendToCustomers(
  customerIds: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  const records = await prisma.pushToken.findMany({
    where: { userId: { in: customerIds } },
    select: { token: true },
  });
  return sendToCustomerTokens(records.map((r) => r.token), notification, data);
}

export async function sendToAllCustomers(
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  const records = await prisma.pushToken.findMany({ select: { token: true } });
  return sendToCustomerTokens(records.map((r) => r.token), notification, data);
}

export async function sendToRiders(
  riderIds: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  const records = await prisma.riderPushToken.findMany({
    where: { riderId: { in: riderIds } },
    select: { token: true },
  });
  return sendToRiderTokens(records.map((r) => r.token), notification, data);
}

export async function sendToAllRiders(
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<SendResult> {
  const records = await prisma.riderPushToken.findMany({ select: { token: true } });
  return sendToRiderTokens(records.map((r) => r.token), notification, data);
}

// ─── Customer order-status notification ───────────────────────

export async function notifyCustomerOrderUpdate(
  customerId: string,
  orderId: string,
  trackingCode: string,
  title: string,
  body: string,
  type: string
): Promise<void> {
  console.log("[PUSH] Customer update | type=%s | order=%s | customer=%s", type, trackingCode, customerId);
  const data = { type, orderId, trackingCode };

  const tokens = await prisma.pushToken.findMany({
    where: { userId: customerId },
    select: { token: true },
  });

  await Promise.all([
    tokens.length > 0
      ? sendToCustomerTokens(tokens.map((t) => t.token), { title, body }, data)
      : Promise.resolve(),
    prisma.notification.create({
      data: { userId: customerId, title, body, data },
    }),
  ]);
}

// ─── Internal notification helpers ────────────────────────────

export async function notifyOnlineRidersNewParcel(order: {
  id: string;
  trackingCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalKobo: number;
}): Promise<void> {
  const riders = await prisma.rider.findMany({
    where: { isAvailable: true, isActive: true },
    select: { id: true, pushTokens: { select: { token: true } } },
  });

  if (riders.length === 0) return;

  const tokens = riders.flatMap((r) => r.pushTokens.map((t) => t.token));
  const amountNaira = (order.totalKobo / 100).toLocaleString("en-NG");

  await Promise.all([
    sendToTokens(
      tokens,
      {
        title: "New Parcel Order",
        body: `${order.pickupAddress} → ${order.dropoffAddress} • ₦${amountNaira}`,
      },
      {
        type: "NEW_PARCEL_ORDER",
        orderId: order.id,
        trackingCode: order.trackingCode,
      }
    ),
    prisma.riderNotification.createMany({
      data: riders.map((r) => ({
        riderId: r.id,
        title: "New Parcel Order",
        body: `${order.pickupAddress} → ${order.dropoffAddress} • ₦${amountNaira}`,
        data: {
          type: "NEW_PARCEL_ORDER",
          orderId: order.id,
          trackingCode: order.trackingCode,
        },
      })),
    }),
  ]);
}
