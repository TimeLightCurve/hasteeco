import "server-only";

import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { tourScenes, type TourScene } from "@/lib/tour-data";
import type { VirtualTourProject, VirtualTourProjectInput } from "@/lib/virtual-tour-schema";

export const DEFAULT_VIRTUAL_TOUR_SLUG = "shahrak-iranian-vt";
export const DEFAULT_VIRTUAL_TOUR_PROPERTY_SLUG = "shahrak-iranian-136";

const defaultProject = (): VirtualTourProject => ({
  slug: DEFAULT_VIRTUAL_TOUR_SLUG,
  name: "Shahrak Iranian Virtual Tour",
  propertySlug: DEFAULT_VIRTUAL_TOUR_PROPERTY_SLUG,
  scenes: structuredClone(tourScenes),
});

const fallbackProjects = () => [defaultProject()];

async function ensureDefaultProjectSeeded() {
  const db = await getDb();
  const migrations = db.collection<{ key: string; completedAt: string }>("app_migrations");
  const migrationKey = "seed-shahrak-iranian-virtual-tour-v1";
  if (await migrations.findOne({ key: migrationKey })) return;

  const now = new Date().toISOString();
  const project = { ...defaultProject(), createdAt: now, updatedAt: now };
  const collection = db.collection<VirtualTourProject>("virtual_tours");
  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ propertySlug: 1 });
  await collection.updateOne(
    { slug: project.slug },
    { $setOnInsert: project },
    { upsert: true },
  );
  await migrations.updateOne(
    { key: migrationKey },
    { $setOnInsert: { key: migrationKey, completedAt: now } },
    { upsert: true },
  );
}

export async function getVirtualTourBySlug(slug: string): Promise<VirtualTourProject | null> {
  if (!isMongoConfigured()) {
    return fallbackProjects().find((project) => project.slug === slug) ?? null;
  }

  try {
    await ensureDefaultProjectSeeded();
    const db = await getDb();
    return await db.collection<VirtualTourProject>("virtual_tours").findOne(
      { slug },
      { projection: { _id: 0 } },
    );
  } catch (error) {
    console.error("MongoDB virtual tour lookup failed; using bundled fallback data.", error);
    return fallbackProjects().find((project) => project.slug === slug) ?? null;
  }
}

export async function getVirtualToursForProperty(propertySlug: string): Promise<VirtualTourProject[]> {
  if (!isMongoConfigured()) {
    return fallbackProjects().filter((project) => project.propertySlug === propertySlug);
  }

  try {
    await ensureDefaultProjectSeeded();
    const db = await getDb();
    return await db
      .collection<VirtualTourProject>("virtual_tours")
      .find({ propertySlug }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  } catch (error) {
    console.error("MongoDB property virtual tour query failed; using bundled fallback data.", error);
    return fallbackProjects().filter((project) => project.propertySlug === propertySlug);
  }
}

export async function getManagedVirtualTours(): Promise<VirtualTourProject[]> {
  await ensureDefaultProjectSeeded();
  const db = await getDb();
  return db
    .collection<VirtualTourProject>("virtual_tours")
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1, name: 1 })
    .toArray();
}

export async function createManagedVirtualTour(input: VirtualTourProjectInput) {
  const db = await getDb();
  const now = new Date().toISOString();
  const project: VirtualTourProject = { ...input, createdAt: now, updatedAt: now };
  await db.collection<VirtualTourProject>("virtual_tours").insertOne(project);
  return project;
}

export async function updateManagedVirtualTour(currentSlug: string, input: VirtualTourProjectInput) {
  const db = await getDb();
  return db.collection<VirtualTourProject>("virtual_tours").findOneAndUpdate(
    { slug: currentSlug },
    { $set: { ...input, updatedAt: new Date().toISOString() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
}

export async function deleteManagedVirtualTour(slug: string) {
  const db = await getDb();
  return db.collection<VirtualTourProject>("virtual_tours").deleteOne({ slug });
}

export function createEmptyVirtualTourScene(): TourScene {
  return {
    id: "scene-1",
    index: 1,
    name: "First room",
    sourceLabel: "First room",
    zone: "Ground floor",
    panorama: "/panos/p1.webp",
    thumbnail: "/panos/p1-thumb.webp",
    initialYaw: 0,
    initialPitch: 0,
    links: [],
  };
}
