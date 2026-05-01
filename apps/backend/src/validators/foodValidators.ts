import { z } from "zod";

export const listRestaurantsSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  isOpen: z.coerce.boolean().optional(),
});

export const menuItemsSchema = z.object({
  categoryId: z.string().optional(),
});

export const searchFoodSchema = z.object({
  q: z.string().min(1),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export const reviewsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
