import { NextRequest } from "next/server";

export function authorizeIngestRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.INGEST_SECRET}`;

  if (!process.env.INGEST_SECRET) {
    throw new Error("INGEST_SECRET is not set");
  }

  if (authHeader !== expected) {
    throw new Error("Unauthorized");
  }
}

export function validateYear(year: number) {
  if (!Number.isInteger(year) || year < 2009 || year > new Date().getFullYear()) {
    throw new Error("Invalid year");
  }
}

export function parseNumericValue(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}