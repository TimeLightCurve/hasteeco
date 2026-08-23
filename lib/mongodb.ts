import { MongoClient, Db } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

  if (clientPromise) return clientPromise;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectMongoClient(uri);
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = connectMongoClient(uri);
  }

  return clientPromise;
}

function connectMongoClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
  });
  const connection = client.connect();

  void connection.catch(async () => {
    if (clientPromise === connection) clientPromise = undefined;
    if (global._mongoClientPromise === connection) global._mongoClientPromise = undefined;
    await client.close().catch(() => undefined);
  });
  return connection;
}

export async function getDb(dbName?: string): Promise<Db> {
  const mongoClient = await getClientPromise();
  return mongoClient.db(dbName ?? process.env.MONGODB_DB ?? "hasteeco");
}
