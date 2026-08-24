import { z } from "zod";
import { sanitizeTourScenes } from "@/lib/tour-config";
import type { TourScene } from "@/lib/tour-data";

export const DEFAULT_VIRTUAL_TOUR_IFRAME_URL = "https://hasteeco.optictour.ir";
export type VirtualTourDisplayMode = "native" | "iframe";

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
  displayMode: z.enum(["native", "iframe"]).optional(),
  iframeUrl: z.string().trim().max(2048).nullable().optional(),
  scenes: z.unknown(),
});

export type VirtualTourProjectInput = {
  slug: string;
  name: string;
  propertySlug: string | null;
  displayMode: VirtualTourDisplayMode;
  iframeUrl: string;
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

  const displayMode = parsed.data.displayMode ?? "native";
  const iframeUrl = parsed.data.iframeUrl || DEFAULT_VIRTUAL_TOUR_IFRAME_URL;
  if (!isSafeIframeUrl(iframeUrl)) {
    return { success: false, error: "The iframe URL must be a valid HTTPS address." };
  }

  try {
    return {
      success: true,
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        propertySlug: parsed.data.propertySlug ?? null,
        displayMode,
        iframeUrl,
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

function isSafeIframeUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
