import { z } from "zod";

const notificationBase = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string()).optional(),
});

export const sendToSingleSchema = notificationBase;

export const sendToCustomerBatchSchema = notificationBase.extend({
  customerIds: z.array(z.string().cuid()).min(1, "Provide at least one customerId"),
});

export const sendToRiderBatchSchema = notificationBase.extend({
  riderIds: z.array(z.string().cuid()).min(1, "Provide at least one riderId"),
});

export const broadcastSchema = notificationBase;
