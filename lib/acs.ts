export async function fetchAcsRows(year: number, variables: string[]) {
  const params = new URLSearchParams({
    get: ["NAME", ...variables].join(","),
    for: "county:*",
    in: "state:54",
  });

  if (process.env.CENSUS_API_KEY) {
    params.set("key", process.env.CENSUS_API_KEY);
  }

  const url = `https://api.census.gov/data/${year}/acs/acs5?${params.toString()}`;
  console.log("ACS request URL:", url);

  const response = await fetch(url, { cache: "no-store" });
  console.log("ACS response status:", response.status);

  if (!response.ok) {
    const text = await response.text();
    console.log("ACS error body:", text);
    throw new Error(`ACS fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as string[][];
  console.log("ACS raw row count:", data.length);

  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Invalid ACS response");
  }

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });
}