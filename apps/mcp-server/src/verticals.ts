export const VERTICALS = {
  food: { listSegment: "restaurants", itemsSegment: "menu" },
  grocery: { listSegment: "stores", itemsSegment: "products" },
  retail: { listSegment: "stores", itemsSegment: "products" },
  pharmacy: { listSegment: "stores", itemsSegment: "products" },
} as const;

export type Vertical = keyof typeof VERTICALS;
export const VERTICAL_NAMES = Object.keys(VERTICALS) as Vertical[];
