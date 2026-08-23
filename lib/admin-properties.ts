import { getDb } from "@/lib/mongodb";
import type { Property } from "@/lib/properties";
import type { PropertyInput } from "@/lib/property-schema";

export type ManagedProperty = Property & {
  createdAt?: string;
  updatedAt?: string;
};

export async function getManagedProperties(): Promise<ManagedProperty[]> {
  const db = await getDb();
  return db
    .collection<ManagedProperty>("properties")
    .find({}, { projection: { _id: 0 } })
    .sort({ featured: -1, listingId: -1 })
    .toArray();
}

export async function createManagedProperty(input: PropertyInput) {
  const db = await getDb();
  const now = new Date().toISOString();
  const document: ManagedProperty = { ...input, createdAt: now, updatedAt: now };
  await db.collection<ManagedProperty>("properties").insertOne(document);
  return document;
}

export async function updateManagedProperty(listingId: number, input: PropertyInput) {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  const result = await db.collection<ManagedProperty>("properties").findOneAndUpdate(
    { listingId },
    { $set: { ...input, updatedAt } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return result;
}

export async function deleteManagedProperty(listingId: number) {
  const db = await getDb();
  return db.collection<ManagedProperty>("properties").deleteOne({ listingId });
}

export async function getDashboardMetrics() {
  const db = await getDb();
  const collection = db.collection<ManagedProperty>("properties");
  const [total, forSale, forRent, featured, projects] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ status: "for-sale" }),
    collection.countDocuments({ status: "for-rent" }),
    collection.countDocuments({ featured: true }),
    collection.countDocuments({ our_project: true }),
  ]);
  return { total, forSale, forRent, featured, projects };
}
