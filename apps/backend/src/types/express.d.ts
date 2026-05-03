import { User, Admin, Vendor, Rider } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Admin & { vendor: Vendor | null };
      rider?: Rider;
    }
  }
}

export {};
