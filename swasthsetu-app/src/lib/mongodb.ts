import { MongoClient, type Db } from 'mongodb';

type MongoCache = {
  uri?: string;
  clientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __swasthsetuMongo?: MongoCache;
};

function getMongoUri(): string | null {
  return process.env.MONGODB_URI ?? null;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_DB_NAME);
}

async function getMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const cache = globalForMongo.__swasthsetuMongo;
  if (cache?.clientPromise && cache.uri === uri) {
    return cache.clientPromise;
  }

  const client = new MongoClient(uri);
  const clientPromise = client.connect();
  globalForMongo.__swasthsetuMongo = { uri, clientPromise };
  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB_NAME;
  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not configured.');
  }

  const client = await getMongoClient();
  return client.db(dbName);
}
