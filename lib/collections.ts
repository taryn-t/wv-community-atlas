import { getDb } from "./mongodb";
import { County, Indicator, Measurement } from "@/types/db";
import { Collection } from "mongodb";

export async function countiesCollection(): Promise<Collection<County>> {
  const db = await getDb();
  return db.collection<County>("counties");
}

export async function indicatorsCollection(): Promise<Collection<Indicator>> {
  const db = await getDb();
  return db.collection<Indicator>("indicators");
}

export async function measurementsCollection(): Promise<Collection<Measurement>> {
  const db = await getDb();
  return db.collection<Measurement>("measurements");
}