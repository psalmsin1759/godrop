import { z } from "zod";
import { VendorType } from "@prisma/client";

export const onboardVendorSchema = z.object({
  // Vendor details
  name: z.string().min(2).max(100),
  type: z.nativeEnum(VendorType),
  description: z.string().max(500).optional(),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().regex(/^\+234\d{10}$/, "Phone must be +234XXXXXXXXXX"),
  email: z.string().email(),
  cuisines: z.array(z.string()).optional().default([]),
  openingHours: z.record(z.any()).optional(),

  // Owner account
  ownerFirstName: z.string().min(1).max(50),
  ownerLastName: z.string().min(1).max(50),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type OnboardVendorInput = z.infer<typeof onboardVendorSchema>;
