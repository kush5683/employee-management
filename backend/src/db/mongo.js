import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

let cachedClient;
let cachedDb;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(env.mongoUri);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export function getDb() {
  if (!cachedDb) {
    throw new Error('Database connection is not initialised. Call connectToDatabase first.');
  }

  return cachedDb;
}
