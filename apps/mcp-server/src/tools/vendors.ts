import { z } from "zod";
import { api, toolError } from "../apiClient";
import { defineTool } from "../toolRegistry";
import { VERTICAL_NAMES, VERTICALS } from "../verticals";

const verticalEnum = z.enum(VERTICAL_NAMES as [string, ...string[]]);

const listVendors = defineTool({
  name: "list_vendors",
  title: "List vendors",
  description:
    "List restaurants (food) or stores (grocery/retail/pharmacy) a customer can order from, optionally filtered by search term and open-now status.",
  schema: z.object({
    vertical: verticalEnum.describe("Which category of vendor to list: food, grocery, retail, or pharmacy"),
    search: z.string().optional().describe("Free-text search term"),
    isOpen: z.boolean().optional().describe("Only return vendors currently open"),
    lat: z.number().optional().describe("Customer latitude, for distance-aware results"),
    lng: z.number().optional().describe("Customer longitude, for distance-aware results"),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }),
  handler: async ({ vertical, search, isOpen, lat, lng, page, limit }) => {
    const { listSegment } = VERTICALS[vertical as keyof typeof VERTICALS];
    try {
      const { data } = await api().get(`/${vertical}/${listSegment}`, {
        params: { search, isOpen, lat, lng, page, limit },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const getVendorMenu = defineTool({
  name: "get_vendor_menu",
  title: "Get vendor menu or product list",
  description:
    "Get the menu items (food) or products (grocery/retail/pharmacy) for a specific vendor, including productId values needed to place an order.",
  schema: z.object({
    vertical: verticalEnum,
    vendorId: z.string().min(1),
    categoryId: z.string().optional().describe("Optional category filter"),
  }),
  handler: async ({ vertical, vendorId, categoryId }) => {
    const { listSegment, itemsSegment } = VERTICALS[vertical as keyof typeof VERTICALS];
    try {
      const { data } = await api().get(`/${vertical}/${listSegment}/${vendorId}/${itemsSegment}`, {
        params: { categoryId },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

export const vendorTools = [listVendors, getVendorMenu];
