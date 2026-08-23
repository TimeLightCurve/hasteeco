import { z } from "zod";

export const serviceInputSchema = z.object({
  serviceType: z.enum(["villa", "apartment", "land", "commercial", "decoration", "renovation"]),
  relatedPropertyType: z.enum(["villa", "apartment", "house", "land", "commercial"]).nullable(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(1000),
  image: z.string().trim().min(2).max(500).startsWith("/"),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
