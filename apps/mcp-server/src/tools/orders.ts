import { z } from "zod";
import { api, toolError } from "../apiClient";
import { defineTool } from "../toolRegistry";
import { VERTICAL_NAMES } from "../verticals";

const verticalEnum = z.enum(VERTICAL_NAMES as [string, ...string[]]);

const createOrder = defineTool({
  name: "create_order",
  title: "Create an order",
  description:
    "Place an order with a vendor. This only creates the order (paymentStatus stays PENDING) — call pay_for_order " +
    "afterwards with the returned orderId to actually charge the customer via wallet or Paystack card.",
  schema: z.object({
    vertical: verticalEnum,
    vendorId: z.string().min(1),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive(),
        })
      )
      .min(1)
      .describe("Items to order, from get_vendor_menu results"),
    deliveryAddress: z.string().min(1),
    paymentMethod: z
      .enum(["cash", "card", "wallet", "wallet_card"])
      .describe("Intended payment method — still requires a separate pay_for_order call except for cash"),
  }),
  handler: async ({ vertical, vendorId, items, deliveryAddress, paymentMethod }) => {
    try {
      const { data } = await api().post(`/${vertical}/checkout`, {
        vendorId,
        items,
        deliveryAddress,
        paymentMethod,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const getOrder = defineTool({
  name: "get_order",
  title: "Get order status",
  description: "Fetch the current status, payment status, and tracking info for a single order by id.",
  schema: z.object({ orderId: z.string().min(1) }),
  handler: async ({ orderId }) => {
    try {
      const { data } = await api().get(`/orders/${orderId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const listOrders = defineTool({
  name: "list_orders",
  title: "List orders",
  description: "List the customer's past and current orders.",
  schema: z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }),
  handler: async ({ page, limit }) => {
    try {
      const { data } = await api().get(`/orders`, { params: { page, limit } });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

export const orderTools = [createOrder, getOrder, listOrders];
