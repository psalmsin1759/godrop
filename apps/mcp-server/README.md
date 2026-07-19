# @godrop/mcp-server

MCP (Model Context Protocol) server that lets an LLM place GoDrop orders and pay for them by wallet or
Paystack, on behalf of one customer. It's a thin stdio wrapper around the existing `apps/backend` REST API —
no backend logic is duplicated here, and no database is touched directly.

## Scope

Single-customer, local-first. The server authenticates every backend call with **one** JWT read from
`CUSTOMER_JWT` at startup — it does not support multiple customers or session-based login yet (see
"Next steps" below). This is intentionally the simplest thing that works for local testing via Claude
Desktop / Claude Code.

## Setup

1. Make sure `apps/backend` is running locally (`pnpm dev` in that directory) and its database is migrated/seeded.
2. Get a JWT for a test customer:
   ```bash
   curl -X POST http://localhost:4000/api/v1/auth/login \
     -H 'content-type: application/json' \
     -d '{"phone":"<test customer phone>","password":"<password>"}'
   ```
   Copy the `accessToken` from the response.
3. In `apps/mcp-server`:
   ```bash
   cp .env.example .env
   # edit .env: set BACKEND_API_URL and paste the token into CUSTOMER_JWT
   pnpm install
   pnpm build
   ```

## Running it from an MCP client

Add it as a stdio MCP server, e.g. in Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "godrop": {
      "command": "node",
      "args": ["/absolute/path/to/apps/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_API_URL": "http://localhost:4000/api/v1",
        "CUSTOMER_JWT": "<paste token>"
      }
    }
  }
}
```

For local iteration you can also run `pnpm dev` (tsx watch) and point a client at
`node --import tsx src/index.ts` instead of the built `dist/index.js`.

## Tools

| Tool | Purpose |
|---|---|
| `list_vendors` | List restaurants/stores for a vertical (`food`, `grocery`, `retail`, `pharmacy`) |
| `get_vendor_menu` | Get menu items / products (and `productId`s) for a vendor |
| `create_order` | Place an order (`checkout`) — leaves it `PENDING` until paid |
| `get_order` | Fetch an order's status/payment status/tracking |
| `list_orders` | List the customer's orders |
| `get_wallet_balance` | Read wallet balance (kobo) |
| `topup_wallet` | Start a Paystack wallet top-up, returns a checkout URL |
| `verify_wallet_topup` | Confirm a top-up and credit the wallet |
| `pay_for_order` | Charge an order via `wallet`, `card` (Paystack), `wallet_card`, or `cash` |
| `verify_payment` | Confirm a Paystack card payment and mark the order `PAID` |

### Card/Paystack flow

Paystack charges require a hosted checkout page — an LLM can't complete that itself. The expected flow is:

1. `create_order(...)` → get `orderId`.
2. `pay_for_order(orderId, method: "card")` → get `paystackAuthUrl` + `reference`. Model should surface the
   URL to the human and ask them to complete payment in a browser.
3. Once the human confirms, `verify_payment(reference)` → order becomes `PAID`.

Wallet payments (`method: "wallet"`) are synchronous — no second step needed.

### Known gap

The backend has no Paystack webhook — payment confirmation relies entirely on the client (this MCP server)
calling `verify_payment`/`verify_wallet_topup`. If nobody ever calls it, a card-paid order can be stuck
`PENDING` even though Paystack charged the customer. Fine for local testing; before using this for real
customer traffic, add a webhook route in `apps/backend` (`POST /api/v1/payments/webhook`, validating
`x-paystack-signature`) that calls the same verification logic server-side.

## Next steps for production/multi-customer use

- Replace the static `CUSTOMER_JWT` with a per-session `login` tool or a token passed in on connection, so
  the server can act as whichever customer is actually using it.
- Switch to the Streamable HTTP transport if this needs to be reached by a remote/hosted chat client instead
  of a local MCP client.
- Add the Paystack webhook mentioned above.
- Add rate limiting / a confirmation step before `pay_for_order` executes, since wallet debits aren't
  reversible without a manual refund.
