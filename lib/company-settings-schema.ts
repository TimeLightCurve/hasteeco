import { z } from "zod";

export const companySettingsInputSchema = z.object({
  companyName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  phoneDisplay: z.string().trim().min(7).max(40),
  email: z.email().max(200),
  address: z.string().trim().min(3).max(300),
  workingHours: z.string().trim().min(3).max(200),
  instagram: z.url().max(500),
  telegram: z.url().max(500),
  whatsapp: z.url().max(500),
  linkedin: z.url().max(500),
});

export type CompanySettingsInput = z.infer<typeof companySettingsInputSchema>;
