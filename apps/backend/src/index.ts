import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "js-yaml";

import authRouter from "./routes/auth";
import configRouter from "./routes/config";
import meRouter from "./routes/me";
import foodRouter from "./routes/food";
import groceryRouter from "./routes/grocery";
import retailRouter from "./routes/retail";
import pharmacyRouter from "./routes/pharmacy";
import parcelRouter from "./routes/parcel";
import truckRouter from "./routes/truck";
import ordersRouter from "./routes/orders";
import paymentsRouter from "./routes/payments";
import promotionsRouter from "./routes/promotions";
import vendorOnboardingRouter from "./routes/vendorOnboarding";
import vendorAdminRouter from "./routes/vendorAdmin";
import systemAdminRouter from "./routes/systemAdmin";
import riderAppRouter from "./routes/riderApp";
import { errorHandler } from "./middleware/errorHandler";
import * as orderService from "./services/orderService";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(express.json());
app.use(morgan("dev"));
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 200,
//     message: { success: false, error: "Too many requests, slow down." },
//   })
// );

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/config", configRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/grocery", groceryRouter);
app.use("/api/v1/retail", retailRouter);
app.use("/api/v1/pharmacy", pharmacyRouter);
app.use("/api/v1/parcel", parcelRouter);
app.use("/api/v1/truck", truckRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/promotions", promotionsRouter);
app.use("/api/v1/vendor", vendorOnboardingRouter);
app.use("/api/v1/vendor-admin", vendorAdminRouter);
app.use("/api/v1/admin", systemAdminRouter);
app.use("/api/v1/rider", riderAppRouter);

// ─── Docs ─────────────────────────────────────────────────────
const openApiSpec = YAML.load(
  fs.readFileSync(path.join(__dirname, "../openapi.yaml"), "utf8")
) as object;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/openapi.yaml", (_req, res) =>
  res.sendFile(path.join(__dirname, "../openapi.yaml"))
);

// ─── Health ───────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, service: "godrop-backend", status: "ok" });
});

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

// ─── HTTP + WebSocket server ──────────────────────────────────
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

// Map of orderId → Set of connected clients (customer order tracking)
const trackingClients = new Map<string, Set<WebSocket>>();

// Set of rider clients listening for new available orders
const jobClients = new Set<WebSocket>();

wss.on("connection", (ws, req) => {
  const url = req.url ?? "";

  // /ws/orders/:orderId/tracking — customer live tracking
  const trackingMatch = url.match(/^\/ws\/orders\/([^/]+)\/tracking/);
  if (trackingMatch) {
    const orderId = trackingMatch[1];
    if (!trackingClients.has(orderId)) trackingClients.set(orderId, new Set());
    trackingClients.get(orderId)!.add(ws);
    console.log("[WS] Customer connected | order=%s | clients=%d", orderId, trackingClients.get(orderId)!.size);
    ws.on("close", () => {
      trackingClients.get(orderId)?.delete(ws);
      console.log("[WS] Customer disconnected | order=%s | clients=%d", orderId, trackingClients.get(orderId)?.size ?? 0);
    });
    return;
  }

  // /ws/rider/jobs — rider new-order stream
  if (url === "/ws/rider/jobs") {
    jobClients.add(ws);
    console.log("[WS] Rider connected | jobClients=%d", jobClients.size);
    ws.on("close", () => {
      jobClients.delete(ws);
      console.log("[WS] Rider disconnected | jobClients=%d", jobClients.size);
    });
    return;
  }

  console.warn("[WS] Unknown path rejected: %s", url);
  ws.close(1008, "Invalid path");
});

// Export so internal services can push updates
export function broadcastTracking(orderId: string, payload: object) {
  const clients = trackingClients.get(orderId);
  if (!clients || clients.size === 0) return;
  const msg = JSON.stringify(payload);
  const type = (payload as any).type ?? "location";
  let sent = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) { client.send(msg); sent++; }
  }
  console.log("[WS] broadcastTracking | order=%s | type=%s | sent=%d/%d", orderId, type, sent, clients.size);
}

export function broadcastNewOrder(order: object) {
  const msg = JSON.stringify({ type: "NEW_ORDER", order });
  const trackingCode = (order as any).trackingCode ?? "?";
  let sent = 0;
  for (const client of jobClients) {
    if (client.readyState === WebSocket.OPEN) { client.send(msg); sent++; }
  }
  console.log("[WS] broadcastNewOrder | order=%s | sent=%d/%d riders", trackingCode, sent, jobClients.size);
}

// ─── Start ────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Godrop backend running on port ${PORT}`);
});

// Validate FCM credentials at startup so a bad private key is caught immediately
import("./services/fcmService").then(({ validateFcmCredentials }) => {
  validateFcmCredentials();
});

export default app;
