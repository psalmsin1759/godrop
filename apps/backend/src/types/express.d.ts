import { User, Admin, Vendor, Rider, Investor, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Admin & { vendor: Vendor | null; role: Role };
      rider?: Rider;
      investor?: Investor;
    }
  }
}

export {};
