import { getDb } from "./mongodb";
import { County, Indicator, Measurement, SavedView, User } from "@/types/db";
import { Collection } from "mongodb";
import { PreSaveMiddlewareFunction } from "mongoose";
import { Summary } from "motion";

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

export async function usersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function summariesCollection(): Promise<Collection<Summary>> {
  const db = await getDb();
  return db.collection<Summary>("summaries");
}

export async function savedViewsCollection(): Promise<Collection<SavedView>> {
  const db = await getDb();
  return db.collection<SavedView>("savedViews");
}