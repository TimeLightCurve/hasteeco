import defaults from "@/data/company-settings.json";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import type { CompanySettingsInput } from "@/lib/company-settings-schema";
import { connection } from "next/server";

export type CompanySettings = CompanySettingsInput & {
  key: "company";
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_COMPANY_SETTINGS = defaults as CompanySettings;

export async function getCompanySettings(): Promise<CompanySettings> {
  await connection();
  if (!isMongoConfigured()) return DEFAULT_COMPANY_SETTINGS;
  try {
    const db = await getDb();
    return await db.collection<CompanySettings>("settings").findOne(
      { key: "company" },
      { projection: { _id: 0 } },
    ) ?? DEFAULT_COMPANY_SETTINGS;
  } catch (error) {
    console.error("MongoDB company settings query failed; using bundled defaults.", error);
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export async function updateCompanySettings(input: CompanySettingsInput): Promise<CompanySettings> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.collection<CompanySettings>("settings").findOneAndUpdate(
    { key: "company" },
    { $set: { ...input, key: "company", updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after", projection: { _id: 0 } },
  );
  if (!result) throw new Error("Unable to save company settings");
  return result;
}
