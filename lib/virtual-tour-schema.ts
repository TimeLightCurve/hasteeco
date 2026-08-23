import { z } from "zod";
import { sanitizeTourScenes } from "@/lib/tour-config";
import type { TourScene } from "@/lib/tour-data";

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const projectMetadataSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(3).max(160),
  propertySlug: slugSchema.nullable().optional(),
  scenes: z.unknown(),
});

export type VirtualTourProjectInput = {
  slug: string;
  name: string;
  propertySlug: string | null;
  scenes: TourScene[];
};

export type VirtualTourProject = VirtualTourProjectInput & {
  createdAt?: string;
  updatedAt?: string;
};

export type VirtualTourProjectParseResult =
  | { success: true; data: VirtualTourProjectInput }
  | { success: false; error: string };

export function parseVirtualTourProjectInput(input: unknown): VirtualTourProjectParseResult {
  const parsed = projectMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Project name, slug, or property assignment is invalid." };
  }

  try {
    return {
      success: true,
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        propertySlug: parsed.data.propertySlug ?? null,
        scenes: sanitizeTourScenes(parsed.data.scenes),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "The room configuration is invalid.",
    };
  }
}
