import { User, Admin, Vendor, Rider, Investor } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Admin & { vendor: Vendor | null };
      rider?: Rider;
      investor?: Investor;
    }
  }
}

export {};
