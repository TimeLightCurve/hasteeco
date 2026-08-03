import { z } from "zod";

export const propertyInputSchema = z.object({
  listingId: z.number().int().positive(),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3).max(160),
  titleFa: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(400),
  description: z.string().trim().min(1).max(5000),
  propertyType: z.enum(["villa", "apartment", "house", "land", "commercial"]),
  status: z.enum(["for-sale", "for-rent"]),
  buildingAreaSqM: z.number().nonnegative(),
  landAreaSqM: z.number().nonnegative(),
  buildingDimensions: z.array(z.number().nonnegative()).min(2).max(3),
  rooms: z.number().int().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  parkingSpaces: z.number().int().nonnegative(),
  price: z.object({
    amount: z.number().nonnegative(),
    currency: z.literal("IRR"),
    displayUnit: z.literal("toman"),
    billingPeriod: z.enum(["monthly", "total"]),
  }),
  yearBuilt: z.object({
    solarHijri: z.number().int().min(1200).max(1600),
    gregorianApprox: z.number().int().min(1800).max(2400),
  }),
  location: z.object({
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(2).max(100),
    province: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    geo: z.object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    }),
  }),
  features: z.array(z.string().trim().min(1).max(120)).max(40),
  images: z.array(z.string().trim().min(2).max(500).startsWith("/", "Image paths must start with /" )).min(1).max(30),
  featured: z.boolean(),
  our_project: z.boolean(),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;

export type PropertyValidationIssue = {
  field: string;
  message: string;
};

export function propertyValidationIssues(error: z.ZodError): PropertyValidationIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: propertyValidationIssueMessage(issue),
  }));
}

function propertyValidationIssueMessage(issue: z.core.$ZodIssue): string {
  if (issue.code === "too_small") {
    if (Number(issue.minimum) === 1) return "این فیلد الزامی است."
    return `مقدار باید حداقل ${issue.minimum} باشد.`
  }
  if (issue.code === "too_big") return `مقدار باید حداکثر ${issue.maximum} باشد.`
  if (issue.code === "invalid_type") return "مقدار وارد نشده یا نوع آن نادرست است."
  if (issue.code === "invalid_value") return "یکی از مقادیر مجاز را انتخاب کنید."
  if (issue.code === "invalid_format" && issue.path.join(".") === "slug") {
    return "Slug باید فقط شامل حروف کوچک انگلیسی، عدد و خط تیره باشد."
  }
  if (issue.code === "invalid_format") return "قالب مقدار واردشده معتبر نیست."
  return issue.message
}
