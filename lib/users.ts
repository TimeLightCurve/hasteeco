import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type UserRole = "admin" | "editor";

export interface AdminUser {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const db = await getDb();
  return db.collection<AdminUser>("users").findOne({ email: email.trim().toLowerCase() });
}

export async function recordUserLogin(email: string) {
  const db = await getDb();
  await db.collection<AdminUser>("users").updateOne(
    { email: email.trim().toLowerCase() },
    { $set: { lastLoginAt: new Date(), updatedAt: new Date() } },
  );
}
