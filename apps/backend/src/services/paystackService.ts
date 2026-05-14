import axios from "axios";
import { prisma } from "../lib/prisma";

const baseURL = "https://api.paystack.co";

async function secretKey(): Promise<string> {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "global" } });
  return settings?.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY ?? "";
}

async function headers() {
  return { Authorization: `Bearer ${await secretKey()}` };
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const { data } = await axios.post(
    `${baseURL}/transaction/initialize`,
    {
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    },
    { headers: await headers() }
  );
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{
  status: string;
  amountKobo: number;
  reference: string;
  authorization?: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bank: string;
    email: string;
    reusable: boolean;
  };
}> {
  const { data } = await axios.get(`${baseURL}/transaction/verify/${reference}`, {
    headers: await headers(),
  });
  return {
    status: data.data.status,
    amountKobo: data.data.amount,
    reference: data.data.reference,
    authorization: data.data.authorization,
  };
}

export async function chargeAuthorization(params: {
  authorizationCode: string;
  email: string;
  amountKobo: number;
  reference: string;
  metadata?: Record<string, unknown>;
}): Promise<{ status: string; reference: string }> {
  const { data } = await axios.post(
    `${baseURL}/transaction/charge_authorization`,
    {
      authorization_code: params.authorizationCode,
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      metadata: params.metadata,
    },
    { headers: await headers() }
  );
  return {
    status: data.data.status,
    reference: data.data.reference,
  };
}

export async function initiateTransfer(params: {
  amountKobo: number;
  recipient: string;
  reference: string;
  reason?: string;
}): Promise<{ status: string; reference: string }> {
  const { data } = await axios.post(
    `${baseURL}/transfer`,
    {
      source: "balance",
      amount: params.amountKobo,
      recipient: params.recipient,
      reference: params.reference,
      reason: params.reason,
    },
    { headers: await headers() }
  );
  return { status: data.data.status, reference: data.data.reference };
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<string> {
  const { data } = await axios.post(
    `${baseURL}/transferrecipient`,
    { type: "nuban", name: params.name, account_number: params.accountNumber, bank_code: params.bankCode, currency: "NGN" },
    { headers: await headers() }
  );
  return data.data.recipient_code;
}

export async function listBanks(): Promise<Array<{ name: string; code: string; slug: string }>> {
  const { data } = await axios.get(`${baseURL}/bank?country=nigeria&use_cursor=false&perPage=200`, {
    headers: await headers(),
  });
  return (data.data as Array<{ name: string; code: string; slug: string }>).map(({ name, code, slug }) => ({
    name,
    code,
    slug,
  }));
}

export async function resolveAccountNumber(params: {
  accountNumber: string;
  bankCode: string;
}): Promise<{ accountName: string; accountNumber: string }> {
  const { data } = await axios.get(
    `${baseURL}/bank/resolve?account_number=${params.accountNumber}&bank_code=${params.bankCode}`,
    { headers: await headers() }
  );
  return {
    accountName: data.data.account_name,
    accountNumber: data.data.account_number,
  };
}
