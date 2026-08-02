import seedProperties from "@/data/properties.json";
import { getDb, isMongoConfigured } from "@/lib/mongodb";

export type PropertyStatus = "for-sale" | "for-rent";

export interface Property {
  listingId: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  propertyType: string;
  status: PropertyStatus;
  buildingAreaSqM: number;
  landAreaSqM: number;
  buildingDimensions: number[];
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  price: {
    amount: number;
    currency: "IRR";
    displayUnit: "toman";
    billingPeriod: "monthly" | "total";
  };
  yearBuilt: {
    solarHijri: number;
    gregorianApprox: number;
  };
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    geo: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  features: string[];
  images: string[];
  featured: boolean;
  our_project: boolean;
}

export interface PropertyFilters {
  type?: string;
  city?: string;
  query?: string;
}

const fallbackProperties = seedProperties as unknown as Property[];

function filterProperties(properties: Property[], filters: PropertyFilters) {
  const type = filters.type?.trim().toLowerCase();
  const city = filters.city?.trim().toLowerCase();
  const query = filters.query?.trim().toLowerCase();

  return properties.filter((property) => {
    if (type && property.propertyType.toLowerCase() !== type) return false;
    if (city && property.location.city.toLowerCase() !== city) return false;
    if (
      query &&
      ![
        property.title,
        property.summary,
        property.location.address,
        String(property.listingId),
      ].some((value) => value.toLowerCase().includes(query))
    ) {
      return false;
    }
    return true;
  });
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  if (!isMongoConfigured()) return filterProperties(fallbackProperties, filters);

  try {
    const db = await getDb();
    const query: Record<string, unknown> = {};
    if (filters.type) query.propertyType = filters.type.toLowerCase();
    if (filters.city) query["location.city"] = filters.city;
    if (filters.query) {
      const safeQuery = filters.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: safeQuery, $options: "i" } },
        { summary: { $regex: safeQuery, $options: "i" } },
        { "location.address": { $regex: safeQuery, $options: "i" } },
      ];
    }

    const documents = await db
      .collection<Property>("properties")
      .find(query, { projection: { _id: 0 } })
      .sort({ featured: -1, listingId: 1 })
      .toArray();

    return documents.length ? documents : filterProperties(fallbackProperties, filters);
  } catch (error) {
    console.error("MongoDB property query failed; using bundled fallback data.", error);
    return filterProperties(fallbackProperties, filters);
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (!isMongoConfigured()) {
    return fallbackProperties.find((property) => property.slug === slug) ?? null;
  }

  try {
    const db = await getDb();
    const property = await db.collection<Property>("properties").findOne(
      { slug },
      { projection: { _id: 0 } },
    );
    return property ?? fallbackProperties.find((item) => item.slug === slug) ?? null;
  } catch (error) {
    console.error("MongoDB property lookup failed; using bundled fallback data.", error);
    return fallbackProperties.find((property) => property.slug === slug) ?? null;
  }
}

export async function getOurProjects(): Promise<Property[]> {
  const fallback = fallbackProperties.filter((property) => property.our_project);
  if (!isMongoConfigured()) return fallback;

  try {
    const db = await getDb();
    const projects = await db
      .collection<Property>("properties")
      .find({ our_project: true }, { projection: { _id: 0 } })
      .sort({ featured: -1, listingId: 1 })
      .toArray();
    return projects.length ? projects : fallback;
  } catch (error) {
    console.error("MongoDB project query failed; using bundled fallback data.", error);
    return fallback;
  }
}

export function getFallbackProperties(): Property[] {
  return fallbackProperties;
}
