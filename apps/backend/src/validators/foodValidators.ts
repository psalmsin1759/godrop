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

export const checkoutSchema = z.object({
  vendorId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  deliveryAddress: z.string().min(1),
  paymentMethod: z.enum(["cash", "card"]),
});
