import { IndicatorYearMap } from "@/lib/indicators";
import { LargeNumberLike } from "crypto";

export type County = {
  fips: string;
  name: string;
  state: string;
  updatedAt: Date;
};

export type Indicator = {
  key: string;
  name: string;
  category: string;
  dataset: "acs5";
  yearConfigs: IndicatorYearMap[];
  source: string;
  updatedAt: Date;
};

export type Measurement = {
  countyFips: string;
  indicatorKey: string;
  year: number;
  value: number | null;
  source: string;
  updatedAt: Date;
};

export type User = {
  email: string;
  password: string;
  token: string
};

export type SavedView = {
  svId: number;
  name: string;
  countyFips: string[];
  indicatorKeys: string[];
  yearRange: Object;
  createdAt: Date;
  user: string;
}

export type Summary = {
  countyFips: string;
  indicatorKey: string;

  baselineYear: number | null;
  baselineValue: number | null;

  latestYear: number | null;
  latestValue: number | null;

  maxValue: number | null;
  minValue: number | null;

  pctChangeSinceBaseline: number | null;
  absChangeSinceBaseline: number | null;

  latestRank: number | null;
  totalCounties: number | null;
  trend?: "increasing" | "decreasing" | "flat" | "unknown";
};