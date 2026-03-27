import { getDb } from "./mongodb";

 const ACS_YEARS = [2019,2020,2021,2022, 2023, 2024] as const;

export type IndicatorYearMap = {
  [year: number]: string[];
};

export type IndicatorConfig = {
  key: string;
  name: string;
  category: string;
  dataset: "acs5";
  yearConfigs: IndicatorYearMap;
  type: "direct" | "derived";
  transform?: (
    row: Record<string, string>,
    year: number,
    indicator: IndicatorConfig
  ) => number | null;
};

function sameVarsForAllYears(variables: string[]): IndicatorYearMap {
  return Object.fromEntries(ACS_YEARS.map((year) => [year, variables]));
}

export function getVariablesForYear(
  indicator: IndicatorConfig,
  year: number
): string[] {
  const variables = indicator.yearConfigs[year];

  if (!variables) {
    throw new Error(
      `No variables defined for indicator ${indicator.key} in year ${year}`
    );
  }

  return variables;
}

export function supportsYear(
  indicator: IndicatorConfig,
  year: number
): boolean {
  return year in indicator.yearConfigs;
}

const toNumber = (value: string | undefined): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const ratioPct = (
  numerator: number | null,
  denominator: number | null
): number | null => {
  if (numerator === null || denominator === null || denominator === 0) {
    return null;
  }

  return (numerator / denominator) * 100;
};

function makeDirectTransform() {
  return (
    row: Record<string, string>,
    year: number,
    indicator: IndicatorConfig
  ): number | null => {
    const [valueKey] = getVariablesForYear(indicator, year);
    return toNumber(row[valueKey]);
  };
}

function makeRatioTransform() {
  return (
    row: Record<string, string>,
    year: number,
    indicator: IndicatorConfig
  ): number | null => {
    const [numeratorKey, denominatorKey] = getVariablesForYear(indicator, year);

    return ratioPct(
      toNumber(row[numeratorKey]),
      toNumber(row[denominatorKey])
    );
  };
}

function makeSumRatioTransform(numeratorCount: number) {
  return (
    row: Record<string, string>,
    year: number,
    indicator: IndicatorConfig
  ): number | null => {
    const variables = getVariablesForYear(indicator, year);
    const numeratorKeys = variables.slice(0, numeratorCount);
    const denominatorKey = variables[numeratorCount];

    const numeratorValues = numeratorKeys.map((key) => toNumber(row[key]));
    const denominator = toNumber(row[denominatorKey]);

    if (
      numeratorValues.some((value) => value === null) ||
      denominator === null ||
      denominator === 0
    ) {
      return null;
    }

    const numeratorSum = numeratorValues.reduce(
      (sum, value) => (sum as number) + (value ?? 0),
      0
    );

    return ((numeratorSum as number) / denominator) * 100;
  };
}

export const indicators: IndicatorConfig[] = [
  {
    key: "median_income",
    name: "Median Household Income",
    category: "Economic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B19013_001E"]),
    type: "direct",
    transform: makeDirectTransform(),
  },
  {
    key: "unemployment_rate",
    name: "Unemployment Rate",
    category: "Employment",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B23025_005E", "B23025_003E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "poverty_rate_pct",
    name: "Population Below Poverty Line (%)",
    category: "Economic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B17001_002E", "B17001_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "median_home_value",
    name: "Median Home Value",
    category: "Economic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B25077_001E"]),
    type: "direct",
    transform: makeDirectTransform(),
  },
  {
    key: "median_rent",
    name: "Median Gross Rent",
    category: "Economic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B25064_001E"]),
    type: "direct",
    transform: makeDirectTransform(),
  },
  {
    key: "median_age",
    name: "Median Age",
    category: "Demographic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B01002_001E"]),
    type: "direct",
    transform: makeDirectTransform(),
  },
  {
    key: "total_pop",
    name: "Population",
    category: "Demographic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B01001_001E"]),
    type: "direct",
    transform: makeDirectTransform(),
  },
  {
  key: "pct_high_school_equ",
  name: "High School Graduate or Higher (% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_017E",
    "B15003_018E",
    "B15003_019E",
    "B15003_020E",
    "B15003_021E",
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
    "B15003_001E"
  ]),
  type: "derived",
  transform: makeSumRatioTransform(9),
},
{
  key: "pct_some_college_lt_1yr",
  name: "Some College, Less Than 1 Year or Higher (% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_019E",
    "B15003_020E",
    "B15003_021E", 
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
     "B15003_001E"
    ]),
  type: "derived",
  transform: makeSumRatioTransform(7),
},
{
  key: "pct_some_college_1plus_no_degree",
  name: "Some College, 1+ Years, No Degree or Higher(% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_020E",
    "B15003_021E", 
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
     "B15003_001E"
    ]),
  type: "derived",
  transform: makeSumRatioTransform(6),
},
{
  key: "pct_associates",
  name: "Associate's Degree or Higher(% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_021E", 
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
    "B15003_001E"
  ]),
  type: "derived",
  transform: makeSumRatioTransform(5),
},
{
  key: "pct_bachelors_or_higher",
  name: "Bachelor’s Degree or Higher (% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
    "B15003_001E",
  ]),
  type: "derived",
  transform: makeSumRatioTransform(4),
},
{
  key: "pct_masters_or_higher",
  name: "Master's Degree or Higher (% >= 25yo)",
  category: "Education",
  dataset: "acs5",
  yearConfigs: sameVarsForAllYears([
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
    "B15003_001E",
  ]),
  type: "derived",
  transform: makeSumRatioTransform(3),
  },
  {
    key: "pct_prof_or_higher",
    name: "Professional Degree or Higher (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears([
      "B15003_024E",
      "B15003_025E",
      "B15003_001E",
    ]),
    type: "derived",
    transform: makeSumRatioTransform(2),
  },
  {
    key: "pct_doc_or_higher",
    name: "Doctorate Degree (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears([
      "B15003_025E",
      "B15003_001E",
    ]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "pct_broadband",
    name: "Broadband Subscription (%)",
    category: "Infrastructure",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B28002_004E", "B28002_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "occu_manufacturing",
    name: "Employed in Manufacturing (%)",
    category: "Industry",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["C24050_004E", "C24030_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "occu_construction",
    name: "Employed in Construction (%)",
    category: "Industry",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["C24050_003E", "C24030_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "occu_health_edu_social",
    name: "Employed in Healthcare, Education, Social Services (%)",
    category: "Industry",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["C24050_011E", "C24030_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "occu_pub_admin",
    name: "Employed in Public Administration (%)",
    category: "Industry",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["C24050_014E", "C24030_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
  {
    key: "labor_force_participation",
    name: "Labor Force Participation (% >= 16yo)",
    category: "Economic",
    dataset: "acs5",
    yearConfigs: sameVarsForAllYears(["B23025_003E", "B23025_001E"]),
    type: "derived",
    transform: makeRatioTransform(),
  },
];

export async function syncIndicators() {
  const db = await getDb();

  for (const indicator of indicators) {
    await db.collection("indicators").updateOne(
      { key: indicator.key },
      {
        $set: {
          key: indicator.key,
          name: indicator.name,
          category: indicator.category,
          dataset: indicator.dataset,
          type: indicator.type,
          yearConfigs: indicator.yearConfigs,
          availableYears: Object.keys(indicator.yearConfigs).map(Number),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }
}