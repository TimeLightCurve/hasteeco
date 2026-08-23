import { getDb } from "@/lib/mongodb";
import type { ServiceInput } from "@/lib/service-schema";
import defaultServices from "@/data/services.json";

export type Service = ServiceInput & {
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_SERVICES = defaultServices as Service[];

export async function getServices(): Promise<Service[]> {
  const db = await getDb();
  const services = await db
    .collection<Service>("services")
    .find({}, { projection: { _id: 0 } })
    .sort({ order: 1, title: 1 })
    .toArray();

  return services.length ? services : DEFAULT_SERVICES;
}

export async function getActiveServices(): Promise<Service[]> {
  const db = await getDb();
  const services = await db
    .collection<Service>("services")
    .find({ active: true }, { projection: { _id: 0 } })
    .sort({ order: 1, title: 1 })
    .toArray();

  return services.length ? services : DEFAULT_SERVICES;
}

export async function upsertService(serviceType: ServiceInput["serviceType"], input: ServiceInput) {
  const db = await getDb();
  const now = new Date().toISOString();
  const document: Service = { ...input, updatedAt: now, createdAt: now };
  await db.collection<Service>("services").updateOne(
    { serviceType },
    { $set: document, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
  return document;
}
