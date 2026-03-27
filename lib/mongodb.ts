import { MongoClient } from "mongodb";
import {
  countiesCollection,
  indicatorsCollection,
  measurementsCollection,
  savedViewsCollection,
  summariesCollection,
  usersCollection
} from "./collections";

const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}
export const dbCollections = {
  counties: () => countiesCollection(),
  indicators: () => indicatorsCollection(),
  measurements: () => measurementsCollection(),
  summaries: () => summariesCollection(),
  users: () => usersCollection(),
  savedViews: () => savedViewsCollection(),
};

export async function getDb() {
  const client = await clientPromise;

  return client.db(process.env.MONGODB_DB_NAME || "wv-community-atlas");
}

export async function initDb() {
  const counties = await dbCollections.counties();
  const indicators = await dbCollections.indicators();
  const measurements = await dbCollections.measurements();

  await counties.createIndex({ fips: 1 }, { unique: true });

  await indicators.createIndex({ key: 1 }, { unique: true });

  await measurements.createIndex(
    { countyFips: 1, indicatorKey: 1, year: 1 },
    { unique: true }
  );

  await measurements.createIndex({ indicatorKey: 1, year: 1 });
  return { message: "Indexes created/verified" };
}