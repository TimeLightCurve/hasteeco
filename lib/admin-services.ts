import { getDb } from "@/lib/mongodb";
import { DEFAULT_SERVICES, type Service } from "@/lib/services";
import type { ServiceInput } from "@/lib/service-schema";

export type ManagedService = Service & {
  createdAt?: string;
  updatedAt?: string;
};

export async function getManagedServices(): Promise<ManagedService[]> {
  const db = await getDb();
  const services = await db
    .collection<ManagedService>("services")
    .find({}, { projection: { _id: 0 } })
    .sort({ order: 1, serviceType: 1 })
    .toArray();

  return services.length ? services : DEFAULT_SERVICES;
}

export async function upsertManagedService(serviceType: ServiceInput["serviceType"], input: ServiceInput) {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.collection<ManagedService>("services").findOneAndUpdate(
    { serviceType },
    { $set: { ...input, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after", projection: { _id: 0 } },
  );
  return result;
}
