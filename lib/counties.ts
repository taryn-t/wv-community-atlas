export function buildCountyDocument(row: Record<string, string>) {
  const countyFips = `${row.state}${row.county}`;

  return {
    fips: countyFips,
    name: row.NAME,
    state: "WV",
    updatedAt: new Date(),
  };
}

export function buildCountyUpsertOp(row: Record<string, string>) {
  const county = buildCountyDocument(row);

  return {
    updateOne: {
      filter: { fips: county.fips },
      update: { $set: county },
      upsert: true,
    },
  };
}