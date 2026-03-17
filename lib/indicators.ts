import { Indicator } from "@/types/db";

export type IndicatorConfig = {
  key: string;
  name: string;
  category: string;
  dataset: "acs5";
  variables: string[];
  type: "direct" | "derived";
  transform?: (row: Record<string, string>) => number | null;
};
export type IndicatorKeyString = "median_income" | "unemployment_rate" | "poverty_rate_pct" | "median_home_value" | "median_rent" | "median_age" |
                           "total_pop" | "pct_high_school_equ" | "pct_bachelors_or_higher"| "pct_masters_or_higher" | "pct_prof_or_higher" | "pct_doc_or_higher" |
                           "pct_broadband" | "occu_manufacturing" | "occu_construction" | "occu_health_edu_social" | "occu_pub_admin" | "labor_force_participation";

export type IndicatorAPIResponse = {indicators: Indicator[]}
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
  {
    key: "poverty_rate_pct",
    name: "Population Below Poverty Line (%)",
    category: "Economic",
    dataset: "acs5",
    variables: ["B17001_002E", "B17001_001E"],
    type: "derived",
    transform: (row) => {
      const popBelowPov = Number(row.B17001_002E);
      const totalPop = Number(row.B17001_001E);
      if (!Number.isFinite(popBelowPov) || !Number.isFinite(popBelowPov) || totalPop === 0) {
        return null;
      }
      return (popBelowPov / totalPop) * 100;
    },   
  },
  {
    key: "median_home_value",
    name: "Median Home Value",
    category: "Economic",
    dataset: "acs5",
    variables: ["B25077_001E"],
    type: "direct",
    transform: (row) => {
      const value = Number(row.B25077_001E);
      return Number.isFinite(value) ? value : null;
    },
  },
    {
    key: "median_rent",
    name: "Median Gross Rent",
    category: "Economic",
    dataset: "acs5",
    variables: ["B25064_001E"],
    type: "direct",
    transform: (row) => {
      const value = Number(row.B25064_001E);
      return Number.isFinite(value) ? value : null;
    },
  },
  {
    key: "median_age",
    name: "Median Age",
    category: "Demographic",
    dataset: "acs5",
    variables: ["B01002_001E"],
    type: "direct",
    transform: (row) => {
      const value = Number(row.B01002_001E);
      return Number.isFinite(value) ? value : null;
    },
  },
  {
    key: "total_pop",
    name: "Population",
    category: "Demographic",
    dataset: "acs5",
    variables: ["B01001_001E"],
    type: "direct",
    transform: (row) => {
      const value = Number(row.B01001_001E );
      return Number.isFinite(value) ? value : null;
    },
  },
  {
    key: "pct_high_school_equ",
    name: "High School Graduate or Higher (%)",
    category: "Education",
    dataset: "acs5",
    variables: ["B15003_017E", "B15003_018E"],
    type: "derived",
    transform: (row) => {
      const diploma = Number(row.B15003_017E);
      const total25 = Number(row.B15003_018E);
      if (!Number.isFinite(diploma) || !Number.isFinite(total25)) {
        return null;
      }
      return (diploma / total25) * 100;
    },   
  },
  {
    key: "pct_bachelors_or_higher",
    name: "Bachelor’s Degree or Higher (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    variables: ["B15003_022E", "B15003_023E", "B15003_024E", "B15003_025E","B15003_001E"],
    type: "derived",
    transform: (row) => {
      const bach = Number(row.B15003_022E);
      const mast = Number(row.B15003_023E);
      const prof = Number(row.B15003_024E);
      const doc = Number(row.B15003_025E);
      const total25 = Number(row.B15003_001E);
      if (!Number.isFinite(bach) || !Number.isFinite(mast)|| !Number.isFinite(prof)|| !Number.isFinite(doc) || total25 == 0) {
        return null;
      }
      return ((bach + mast + prof + doc) / total25) * 100;
    },   
  },
  {
    key: "pct_masters_or_higher",
    name: "Master's Degree or Higher (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    variables: ["B15003_023E", "B15003_024E", "B15003_025E","B15003_001E"],
    type: "derived",
    transform: (row) => {
      const mast = Number(row.B15003_023E);
      const prof = Number(row.B15003_024E);
      const doc = Number(row.B15003_025E);
      const total25 = Number(row.B15003_001E);
      if (!Number.isFinite(mast)|| !Number.isFinite(prof)|| !Number.isFinite(doc) || total25 == 0) {
        return null;
      }
      return ((mast + prof + doc) / total25) * 100;
    },   
  },
  {
    key: "pct_prof_or_higher",
    name: "Professional Degree or Higher (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    variables: [ "B15003_024E", "B15003_025E","B15003_001E"],
    type: "derived",
    transform: (row) => {
      const prof = Number(row.B15003_024E);
      const doc = Number(row.B15003_025E);
      const total25 = Number(row.B15003_001E);
      if ( !Number.isFinite(prof)|| !Number.isFinite(doc) || total25 == 0) {
        return null;
      }
      return ((prof + doc) / total25) * 100;
    },   
  },
  {
    key: "pct_doc_or_higher",
    name: "Doctorate Degree (% >= 25yo)",
    category: "Education",
    dataset: "acs5",
    variables: [ "B15003_025E","B15003_001E"],
    type: "derived",
    transform: (row) => {
      const doc = Number(row.B15003_025E);
      const total25 = Number(row.B15003_001E);
      if (!Number.isFinite(doc) || total25 == 0) {
        return null;
      }
      return (doc / total25) * 100;
    },   
  },
  {
    key: "pct_broadband",
    name: "Broadband Subscription (%)",
    category: "Infrastructure",
    dataset: "acs5",
    variables: [ "B28002_004E", "B28002_001E"],
    type: "derived",
    transform: (row) => {
      const withB = Number(row.B28002_004E);
      const woutB = Number(row.B28002_001E);
      if ( !Number.isFinite(withB)|| !Number.isFinite(woutB) || woutB == 0) {
        return null;
      }
      return (withB / woutB) * 100;
    },   
  },
  {
    key: "occu_manufacturing",
    name: "Employed in Manufacturing (%)",
    category: "Industry",
    dataset: "acs5",
    variables: [ "C24050_004E", "C24030_001E"],
    type: "derived",
    transform: (row) => {
      const emp = Number(row.C24050_004E);
      const total = Number(row.C24030_001E);
      if ( !Number.isFinite(emp)|| !Number.isFinite(total) || total == 0) {
        return null;
      }
      return (emp / total) * 100;
    },   
  },
  {
    key: "occu_construction",
    name: "Employed in Construction (%)",
    category: "Industry",
    dataset: "acs5",
    variables: [ "C24050_004E", "C24030_001E"],
    type: "derived",
    transform: (row) => {
      const emp = Number(row.C24050_003E);
      const total = Number(row.C24030_001E);
      if ( !Number.isFinite(emp)|| !Number.isFinite(total) || total == 0) {
        return null;
      }
      return (emp / total) * 100;
    },   
  },
  {
    key: "occu_health_edu_social",
    name: "Employed in Healthcare, Education, Social Services (%)",
    category: "Industry",
    dataset: "acs5",
    variables: [ "C24050_011E", "C24030_001E"],
    type: "derived",
    transform: (row) => {
      const emp = Number(row.C24050_011E);
      const total = Number(row.C24030_001E);
      if ( !Number.isFinite(emp)|| !Number.isFinite(total) || total == 0) {
        return null;
      }
      return (emp / total) * 100;
    },   
  },
    {
    key: "occu_pub_admin",
    name: "Employed in Public Administration (%)",
    category: "Industry",
    dataset: "acs5",
    variables: [ "C24050_014E", "C24030_001E"],
    type: "derived",
    transform: (row) => {
      const emp = Number(row.C24050_011E);
      const total = Number(row.C24030_001E);
      if ( !Number.isFinite(emp)|| !Number.isFinite(total) || total == 0) {
        return null;
      }
      return (emp / total) * 100;
    },   
  },
    {
    key: "labor_force_participation",
    name: "Labor Force Participation (% >= 16yo)",
    category: "Economic",
    dataset: "acs5",
    variables: [ "B23025_003E", "B23025_001E"],
    type: "derived",
    transform: (row) => {
      const emp = Number(row.B23025_003E);
      const total = Number(row.B23025_001E);
      if ( !Number.isFinite(emp)|| !Number.isFinite(total) || total == 0) {
        return null;
      }
      return (emp / total) * 100;
    },   
  },
];