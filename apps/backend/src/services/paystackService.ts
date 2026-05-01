import axios from "axios";

const baseURL = "https://api.paystack.co";

function headers() {
  return { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` };
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
    { headers: headers() }
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
}> {
  const { data } = await axios.get(`${baseURL}/transaction/verify/${reference}`, {
    headers: headers(),
  });
  return {
    status: data.data.status,
    amountKobo: data.data.amount,
    reference: data.data.reference,
  };
}
