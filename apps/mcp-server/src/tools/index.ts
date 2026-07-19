import { ToolDef } from "../toolRegistry";
import { vendorTools } from "./vendors";
import { orderTools } from "./orders";
import { walletTools } from "./wallet";
import { paymentTools } from "./payments";

export const allTools: ToolDef[] = [...vendorTools, ...orderTools, ...walletTools, ...paymentTools];
