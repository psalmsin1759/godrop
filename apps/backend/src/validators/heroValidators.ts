import { z } from "zod";

export const createHeroSchema = z.object({
  badge: z.string().max(100).optional(),
  heading: z.string().min(1).max(200),
  subheading: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  align: z.enum(["left", "center"]).default("left"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  ctaLabel: z.string().max(80).optional(),
  ctaLink: z.string().max(500).optional(),
});

export const updateHeroSchema = z.object({
  badge: z.string().max(100).nullish(),
  heading: z.string().min(1).max(200).optional(),
  subheading: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().nullish(),
  align: z.enum(["left", "center"]).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  ctaLabel: z.string().max(80).nullish(),
  ctaLink: z.string().max(500).nullish(),
});

export type CreateHeroInput = z.infer<typeof createHeroSchema>;
export type UpdateHeroInput = z.infer<typeof updateHeroSchema>;
