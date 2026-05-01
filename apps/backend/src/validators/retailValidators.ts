import { z } from "zod";

export const listRetailStoresSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export const productsQuerySchema = z.object({
  categoryId: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});
