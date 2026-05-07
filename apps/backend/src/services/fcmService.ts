import admin from "firebase-admin";
import { prisma } from "../lib/prisma";

let messaging: admin.messaging.Messaging | null = null;

function parsePrivateKey(raw: string): string {
  // Railway and some CI systems store the key with literal \n sequences.
  // Others store it with real newlines. Handle both, and strip surrounding
  // quotes that some platforms add when the value contains special characters.
  let key = raw.trim().replace(/^["']|["']$/g, ""); // strip wrapping quotes
  key = key.replace(/\\n/g, "\n");                  // literal \n → real newline
  return key;
}

function getMessaging(): admin.messaging.Messaging | null {
  if (messaging) return messaging;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.warn("[FCM] Missing credentials (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)");
    return null;
  }

  const privateKey = parsePrivateKey(rawKey);

  if (!privateKey.includes("-----BEGIN")) {
    console.error("[FCM] FIREBASE_PRIVATE_KEY does not look like a PEM key — check Railway env var formatting");
    return null;
  }

  const app = admin.apps.length
    ? admin.apps[0]!
    : admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });

  messaging = admin.messaging(app);
  console.log("[FCM] Initialized | project=%s | clientEmail=%s", projectId, clientEmail);
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
      if (code === "app/invalid-credential") {
        console.error("[FCM] INVALID CREDENTIAL — check FIREBASE_PRIVATE_KEY on Railway. Reset messaging instance.");
        messaging = null; // force re-init on next call in case env var is fixed at runtime
      } else {
        console.warn("[FCM] Token failed | type=%s | code=%s", type, code);
      }
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

// ─── Startup credential check ─────────────────────────────────

export function validateFcmCredentials(): void {
  const fcm = getMessaging();
  if (!fcm) {
    console.error("[FCM] Startup check FAILED — push notifications are disabled");
  } else {
    console.log("[FCM] Startup check OK — credentials loaded");
  }
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
