import { z } from "zod";
import { api, toolError } from "../apiClient";
import { defineTool } from "../toolRegistry";

const getWalletBalance = defineTool({
  name: "get_wallet_balance",
  title: "Get wallet balance",
  description: "Get the customer's current GoDrop wallet balance (in kobo).",
  schema: z.object({}),
  handler: async () => {
    try {
      const { data } = await api().get(`/me/wallet`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const topupWallet = defineTool({
  name: "topup_wallet",
  title: "Top up wallet",
  description:
    "Start a wallet top-up via Paystack. Returns a paystackAuthUrl the customer must open in a browser to complete " +
    "payment, plus a reference. Call verify_wallet_topup with that reference once they've paid.",
  schema: z.object({
    amountKobo: z.number().int().positive().describe("Amount to add, in kobo (100 kobo = ₦1)"),
  }),
  handler: async ({ amountKobo }) => {
    try {
      const { data } = await api().post(`/me/wallet/topup`, { amountKobo });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

const verifyWalletTopup = defineTool({
  name: "verify_wallet_topup",
  title: "Verify wallet top-up",
  description: "Confirm a Paystack wallet top-up completed and credit the wallet. Safe to call more than once.",
  schema: z.object({
    reference: z.string().min(1).describe("Reference returned by topup_wallet"),
  }),
  handler: async ({ reference }) => {
    try {
      const { data } = await api().post(`/me/wallet/topup/verify`, { reference });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: toolError(err) }], isError: true };
    }
  },
});

export const walletTools = [getWalletBalance, topupWallet, verifyWalletTopup];
