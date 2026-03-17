export type IndicatorConfig = {
  key: string;
  name: string;
  category: string;
  dataset: "acs5";
  variables: string[];
  type: "direct" | "derived";
  transform?: (row: Record<string, string>) => number | null;
};

export const indicators: IndicatorConfig[] = [
  {
    key: "median_income",
    name: "Median Household Income",
    category: "Economic",
    dataset: "acs5",
    variables: ["B19013_001E"],
    type: "direct",
    transform: (row) => {
      const value = Number(row.B19013_001E);
      return Number.isFinite(value) ? value : null;
    },
  },
  {
    key: "unemployment_rate",
    name: "Unemployment Rate",
    category: "Employment",
    dataset: "acs5",
    variables: ["B23025_005E", "B23025_003E"],
    type: "derived",
    transform: (row) => {
      const unemployed = Number(row.B23025_005E);
      const laborForce = Number(row.B23025_003E);
      if (!Number.isFinite(unemployed) || !Number.isFinite(laborForce) || laborForce === 0) {
        return null;
      }
      return (unemployed / laborForce) * 100;
    },
  },
];