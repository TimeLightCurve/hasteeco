import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "hasteeco";
const adminEmail = (process.env.ADMIN_EMAIL || "admin@hasteeco.com").trim().toLowerCase();
const adminName = (process.env.ADMIN_NAME || "Hasteeco Admin").trim();
const adminPassword = process.env.ADMIN_PASSWORD || "";

if (!uri) {
  throw new Error("Set MONGODB_URI before running the property seed script.");
}

if (adminPassword.length < 12) {
  throw new Error("Set ADMIN_PASSWORD to a strong password with at least 12 characters.");
}

const properties = JSON.parse(
  await readFile(new URL("../data/properties.json", import.meta.url), "utf8"),
);
const companySettings = JSON.parse(
  await readFile(new URL("../data/company-settings.json", import.meta.url), "utf8"),
);

const services = [
  {
    serviceType: "villa",
    relatedPropertyType: "villa",
    title: "خرید و فروش انواع ویلا",
    description: "ویلاهای لوکس، باغ‌ویلاها و گزینه‌های سرمایه‌گذاری مناسب برای خرید یا فروش.",
    image: "/images/properties/villa-130-exterior.png",
    order: 1,
    active: true,
  },
  {
    serviceType: "apartment",
    relatedPropertyType: "apartment",
    title: "آپارتمان و مجتمع مسکونی",
    description: "آپارتمان‌های نوساز و مجتمع‌های مسکونی برای زندگی شهری و سرمایه‌گذاری.",
    image: "/images/properties/villa-130-interior.png",
    order: 2,
    active: true,
  },
  {
    serviceType: "land",
    relatedPropertyType: "land",
    title: "زمین مسکونی و تجاری",
    description: "زمین‌های مناسب ساخت‌وساز، توسعه پروژه و کاربری‌های مسکونی یا تجاری.",
    image: "/images/properties/villa-130-twilight.png",
    order: 3,
    active: true,
  },
  {
    serviceType: "commercial",
    relatedPropertyType: "commercial",
    title: "مستغلات تجاری و اداری",
    description: "ملک‌های تجاری، اداری و سرمایه‌ای برای کسب‌وکار و بهره‌برداری بلندمدت.",
    image: "/images/properties/villa-130-exterior.png",
    order: 4,
    active: true,
  },
  {
    serviceType: "decoration",
    relatedPropertyType: "commercial",
    title: "خدمات دکوراسیون",
    description: "طراحی داخلی، چیدمان و اجرای فضاهای لوکس با رویکرد حرفه‌ای و شخصی‌سازی‌شده.",
    image: "/images/properties/villa-130-interior.png",
    order: 5,
    active: true,
  },
  {
    serviceType: "renovation",
    relatedPropertyType: "commercial",
    title: "خدمات بازسازی و نوسازی",
    description: "بازسازی کامل، نوسازی اصولی و ارتقای ارزش ملک با تیم اجرایی متخصص.",
    image: "/images/properties/villa-130-twilight.png",
    order: 6,
    active: true,
  },
];

const propertyValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "listingId",
      "slug",
      "title",
      "titleFa",
      "propertyType",
      "status",
      "buildingAreaSqM",
      "landAreaSqM",
      "rooms",
      "bedrooms",
      "bathrooms",
      "parkingSpaces",
      "price",
      "yearBuilt",
      "location",
      "images",
      "our_project",
    ],
    properties: {
      listingId: { bsonType: ["int", "long", "double"] },
      slug: { bsonType: "string" },
      title: { bsonType: "string" },
      titleFa: { bsonType: "string" },
      propertyType: { enum: ["villa", "apartment", "house", "land", "commercial"] },
      status: { enum: ["for-sale", "for-rent"] },
      buildingAreaSqM: { bsonType: ["int", "double"], minimum: 0 },
      landAreaSqM: { bsonType: ["int", "double"], minimum: 0 },
      rooms: { bsonType: ["int", "long", "double"], minimum: 0 },
      bedrooms: { bsonType: ["int", "long", "double"], minimum: 0 },
      bathrooms: { bsonType: ["int", "long", "double"], minimum: 0 },
      parkingSpaces: { bsonType: ["int", "long", "double"], minimum: 0 },
      images: { bsonType: "array", items: { bsonType: "string" } },
      our_project: { bsonType: "bool" },
      location: {
        bsonType: "object",
        required: ["city", "province", "country", "coordinates", "geo"],
      },
      price: {
        bsonType: "object",
        required: ["amount", "currency", "displayUnit", "billingPeriod"],
      },
    },
  },
};

const serviceValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["serviceType", "relatedPropertyType", "title", "description", "image", "order", "active"],
    properties: {
      serviceType: { enum: ["villa", "apartment", "land", "commercial", "decoration", "renovation"] },
      relatedPropertyType: { enum: ["villa", "apartment", "house", "land", "commercial", null] },
      title: { bsonType: "string" },
      description: { bsonType: "string" },
      image: { bsonType: "string" },
      order: { bsonType: ["int", "long", "double"], minimum: 0 },
      active: { bsonType: "bool" },
    },
  },
};

const userValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "passwordHash", "role", "active", "createdAt", "updatedAt"],
    properties: {
      name: { bsonType: "string", minLength: 2 },
      email: { bsonType: "string" },
      passwordHash: { bsonType: "string", minLength: 50 },
      role: { enum: ["admin", "editor"] },
      active: { bsonType: "bool" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      lastLoginAt: { bsonType: "date" },
    },
  },
};

const settingsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["key", "companyName", "phone", "phoneDisplay", "email", "address", "workingHours", "instagram", "telegram", "whatsapp", "linkedin"],
    properties: {
      key: { enum: ["company"] },
      companyName: { bsonType: "string" },
      phone: { bsonType: "string" },
      phoneDisplay: { bsonType: "string" },
      email: { bsonType: "string" },
      address: { bsonType: "string" },
      workingHours: { bsonType: "string" },
      instagram: { bsonType: "string" },
      telegram: { bsonType: "string" },
      whatsapp: { bsonType: "string" },
      linkedin: { bsonType: "string" },
    },
  },
};

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(databaseName);
  const collectionNames = (await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name);

  if (!collectionNames.includes("properties")) {
    await db.createCollection("properties", { validator: propertyValidator });
  } else {
    await db.command({ collMod: "properties", validator: propertyValidator, validationLevel: "moderate" });
  }

  const propertiesCollection = db.collection("properties");
  await propertiesCollection.createIndex({ listingId: 1 }, { unique: true });
  await propertiesCollection.createIndex({ slug: 1 }, { unique: true });
  await propertiesCollection.createIndex({ "location.geo": "2dsphere" });
  await propertiesCollection.createIndex({ propertyType: 1, status: 1, "location.city": 1 });

  for (const property of properties) {
    await propertiesCollection.updateOne(
      { listingId: property.listingId },
      { $set: property },
      { upsert: true },
    );
  }

  if (!collectionNames.includes("services")) {
    await db.createCollection("services", { validator: serviceValidator });
  } else {
    await db.command({ collMod: "services", validator: serviceValidator, validationLevel: "moderate" });
  }

  const servicesCollection = db.collection("services");
  await servicesCollection.createIndex({ serviceType: 1 }, { unique: true });
  await servicesCollection.createIndex({ order: 1 });

  for (const service of services) {
    await servicesCollection.updateOne({ serviceType: service.serviceType }, { $set: service }, { upsert: true });
  }

  if (!collectionNames.includes("settings")) {
    await db.createCollection("settings", { validator: settingsValidator });
  } else {
    await db.command({ collMod: "settings", validator: settingsValidator, validationLevel: "moderate" });
  }
  const settingsCollection = db.collection("settings");
  await settingsCollection.createIndex({ key: 1 }, { unique: true });
  await settingsCollection.updateOne(
    { key: "company" },
    { $setOnInsert: companySettings },
    { upsert: true },
  );

  if (!collectionNames.includes("users")) {
    await db.createCollection("users", { validator: userValidator });
  } else {
    await db.command({ collMod: "users", validator: userValidator, validationLevel: "strict" });
  }

  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  const now = new Date();
  await users.updateOne(
    { email: adminEmail },
    {
      $set: {
        name: adminName,
        email: adminEmail,
        passwordHash: await hash(adminPassword, 12),
        role: "admin",
        active: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  console.log(
    `Seeded ${properties.length} property document(s), ${services.length} service document(s), company settings, and admin ${adminEmail} into ${databaseName}.`,
  );
} finally {
  await client.close();
}
