import { z } from "zod";
import { api, toolError } from "../apiClient";
import { defineTool } from "../toolRegistry";

const payForOrder = defineTool({
  name: "pay_for_order",
  title: "Pay for an order",
  description:
    "Charge a previously created order. method='wallet' debits the wallet and completes immediately (result includes " +
    "paid: true). method='card' charges via Paystack — the result includes a paystackAuthUrl the customer must open " +
    "to complete payment in a browser; the order is NOT paid yet, follow up with verify_payment once they're done. " +
    "method='wallet_card' deducts whatever wallet balance is available and charges the remainder via Paystack " +
    "(also returns a paystackAuthUrl if there's a remainder). method='cash' marks the order for cash-on-delivery.",
  schema: z.object({
    orderId: z.string().min(1),
    method: z.enum(["wallet", "card", "cash", "wallet_card"]),
  }),
  handler: async ({ orderId, method }) => {
    try {
      const { data } = await api().post(`/payments/initialize`, { orderId, method });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const verifyPayment = defineTool({
  name: "verify_payment",
  title: "Verify a Paystack order payment",
  description:
    "Confirm a Paystack card payment for an order completed (after the customer used the paystackAuthUrl from " +
    "pay_for_order), and mark the order PAID. Safe to call more than once.",
  schema: z.object({
    reference: z.string().min(1).describe("Reference returned by pay_for_order"),
  }),
  handler: async ({ reference }) => {
    try {
      const { data } = await api().post(`/payments/verify`, { reference });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

export const paymentTools = [payForOrder, verifyPayment];
