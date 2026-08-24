import { tourScenes, type TourScene } from "@/lib/tour-data";

export const TOUR_CONFIG_STORAGE_KEY = "hasteeco-tour-config-v1";

const zones = new Set<TourScene["zone"]>(["Exterior", "Ground floor", "Upper floor"]);

const cloneDefaults = () => structuredClone(tourScenes);

function normalizeAngle(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function sanitizeView(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const view = value as { yaw?: unknown; pitch?: unknown };
  if (!Number.isFinite(view.yaw) || !Number.isFinite(view.pitch)) return undefined;
  return {
    yaw: normalizeAngle(Number(view.yaw)),
    pitch: Math.max(-85, Math.min(85, Number(view.pitch))),
  };
}

export function sanitizeTourScenes(input: unknown): TourScene[] {
  if (!Array.isArray(input) || input.length === 0) throw new Error("The tour must contain at least one room.");

  const scenes = input.map((value, position): TourScene => {
    if (!value || typeof value !== "object") throw new Error(`Room ${position + 1} is invalid.`);
    const item = value as Partial<TourScene>;
    const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : `scene-${position + 1}`;
    const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : `Room ${position + 1}`;
    const panorama = typeof item.panorama === "string" && item.panorama.trim() ? item.panorama.trim() : "/panos/p1.webp";
    const thumbnail = typeof item.thumbnail === "string" && item.thumbnail.trim() ? item.thumbnail.trim() : panorama;
    const zone = item.zone && zones.has(item.zone) ? item.zone : "Ground floor";
    const rawArrivalViews = item.arrivalViews && typeof item.arrivalViews === "object"
      ? item.arrivalViews as { forward?: unknown; backward?: unknown }
      : undefined;
    const forwardView = sanitizeView(rawArrivalViews?.forward);
    const backwardView = sanitizeView(rawArrivalViews?.backward);

    return {
      id,
      index: position + 1,
      name,
      sourceLabel: typeof item.sourceLabel === "string" ? item.sourceLabel : name,
      zone,
      panorama,
      thumbnail,
      initialYaw: Number.isFinite(item.initialYaw) ? normalizeAngle(Number(item.initialYaw)) : 0,
      initialPitch: Number.isFinite(item.initialPitch) ? Math.max(-85, Math.min(85, Number(item.initialPitch))) : 0,
      arrivalViews: forwardView || backwardView
        ? { ...(forwardView && { forward: forwardView }), ...(backwardView && { backward: backwardView }) }
        : undefined,
      links: Array.isArray(item.links)
        ? item.links.flatMap((link) => {
            if (!link || typeof link !== "object") return [];
            const candidate = link as {
              nodeId?: unknown;
              yaw?: unknown;
              pitch?: unknown;
              placement?: unknown;
              action?: unknown;
              direction?: unknown;
            };
            if (typeof candidate.nodeId !== "string" || !Number.isFinite(candidate.yaw)) return [];
            return [{
              nodeId: candidate.nodeId,
              yaw: normalizeAngle(Number(candidate.yaw)),
              pitch: Math.max(-85, Math.min(85, Number.isFinite(candidate.pitch) ? Number(candidate.pitch) : -18)),
              placement: candidate.placement === "wall" || candidate.placement === "air" ? candidate.placement : "ground",
              action: candidate.action === "light" ? "light" : "move",
              direction: candidate.direction === "forward" || candidate.direction === "backward"
                ? candidate.direction
                : undefined,
            }];
          })
        : [],
    };
  });

  const ids = new Set(scenes.map((scene) => scene.id));
  if (ids.size !== scenes.length) throw new Error("Every room must have a unique ID.");

  return scenes.map((scene) => ({
    ...scene,
    links: scene.links.filter((link) => ids.has(link.nodeId) && link.nodeId !== scene.id),
  }));
}

export function loadTourScenes(): TourScene[] {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const stored = window.localStorage.getItem(TOUR_CONFIG_STORAGE_KEY);
    return stored ? sanitizeTourScenes(JSON.parse(stored)) : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function saveTourScenes(scenes: TourScene[]) {
  const cleanScenes = sanitizeTourScenes(scenes);
  window.localStorage.setItem(TOUR_CONFIG_STORAGE_KEY, JSON.stringify(cleanScenes));
  window.dispatchEvent(new CustomEvent("tour-config-changed"));
  return cleanScenes;
}

export function resetTourScenes() {
  window.localStorage.removeItem(TOUR_CONFIG_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("tour-config-changed"));
  return cloneDefaults();
}
