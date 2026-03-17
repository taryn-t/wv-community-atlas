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
  variables: string[];
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