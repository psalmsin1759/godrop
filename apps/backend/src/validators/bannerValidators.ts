import { z } from "zod";

export const createBannerSchema = z.object({
  imageUrl: z.string().url().optional(),
  badge: z.string().max(60).optional(),
  title: z.string().max(200).optional(),
  ctaLabel: z.string().max(80).optional(),
  linkType: z.string().max(50).optional(),
  linkValue: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateBannerSchema = z.object({
  imageUrl: z.string().url().nullish(),
  badge: z.string().max(60).nullish(),
  title: z.string().max(200).nullish(),
  ctaLabel: z.string().max(80).nullish(),
  linkType: z.string().max(50).nullish(),
  linkValue: z.string().max(500).nullish(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
