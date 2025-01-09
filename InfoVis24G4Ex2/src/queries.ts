import { Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./../data/artvis.parquet?url";


const isoToGeoJsonMap: { [key: string]: string } = {
  "AF": "AFG",
  "AL": "ALB",
  "DZ": "DZA",
  "AS": "ASM",
  "AD": "AND",
  "AO": "AGO",
  "AI": "AIA",
  "AQ": "ATA",
  "AG": "ATG",
  "AR": "ARG",
  "AM": "ARM",
  "AW": "ABW",
  "AU": "AUS",
  "AT": "AUT",
  "AZ": "AZE",
  "BS": "BHS",
  "BH": "BHR",
  "BD": "BGD",
  "BB": "BRB",
  "BY": "BLR",
  "BE": "BEL",
  "BZ": "BLZ",
  "BJ": "BEN",
  "BM": "BMU",
  "BT": "BTN",
  "BO": "BOL",
  "BA": "BIH",
  "BW": "BWA",
  "BR": "BRA",
  "BN": "BRN",
  "BG": "BGR",
  "BF": "BFA",
  "BI": "BDI",
  "CV": "CPV",
  "KH": "KHM",
  "CM": "CMR",
  "CA": "CAN",
  "KY": "CYM",
  "CF": "CAF",
  "TD": "TCD",
  "CL": "CHL",
  "CN": "CHN",
  "CO": "COL",
  "KM": "COM",
  "CG": "COG",
  "CD": "COD",
  "CR": "CRI",
  "CI": "CIV",
  "HR": "HRV",
  "CU": "CUB",
  "CY": "CYP",
  "CZ": "CZE",
  "DK": "DNK",
  "DJ": "DJI",
  "DM": "DMA",
  "DO": "DOM",
  "EC": "ECU",
  "EG": "EGY",
  "SV": "SLV",
  "GQ": "GNQ",
  "ER": "ERI",
  "EE": "EST",
  "SZ": "SWZ",
  "ET": "ETH",
  "FJ": "FJI",
  "FI": "FIN",
  "FR": "FRA",
  "GA": "GAB",
  "GM": "GMB",
  "GE": "GEO",
  "DE": "DEU",
  "GH": "GHA",
  "GR": "GRC",
  "GD": "GRD",
  "GT": "GTM",
  "GN": "GIN",
  "GW": "GNB",
  "GY": "GUY",
  "HT": "HTI",
  "HN": "HND",
  "HU": "HUN",
  "IS": "ISL",
  "IN": "IND",
  "ID": "IDN",
  "IR": "IRN",
  "IQ": "IRQ",
  "IE": "IRL",
  "IL": "ISR",
  "IT": "ITA",
  "JM": "JAM",
  "JP": "JPN",
  "JO": "JOR",
  "KZ": "KAZ",
  "KE": "KEN",
  "KI": "KIR",
  "KP": "PRK",
  "KR": "KOR",
  "KW": "KWT",
  "KG": "KGZ",
  "LA": "LAO",
  "LV": "LVA",
  "LB": "LBN",
  "LS": "LSO",
  "LR": "LBR",
  "LY": "LBY",
  "LI": "LIE",
  "LT": "LTU",
  "LU": "LUX",
  "MG": "MDG",
  "MW": "MWI",
  "MY": "MYS",
  "MV": "MDV",
  "ML": "MLI",
  "MT": "MLT",
  "MH": "MHL",
  "MR": "MRT",
  "MU": "MUS",
  "MX": "MEX",
  "FM": "FSM",
  "MD": "MDA",
  "MC": "MCO",
  "MN": "MNG",
  "ME": "MNE",
  "MA": "MAR",
  "MZ": "MOZ",
  "MM": "MMR",
  "NA": "NAM",
  "NR": "NRU",
  "NP": "NPL",
  "NL": "NLD",
  "NZ": "NZL",
  "NI": "NIC",
  "NE": "NER",
  "NG": "NGA",
  "NO": "NOR",
  "OM": "OMN",
  "PK": "PAK",
  "PW": "PLW",
  "PA": "PAN",
  "PG": "PNG",
  "PY": "PRY",
  "PE": "PER",
  "PH": "PHL",
  "PL": "POL",
  "PT": "PRT",
  "QA": "QAT",
  "RO": "ROU",
  "RU": "RUS",
  "RW": "RWA",
  "KN": "KNA",
  "LC": "LCA",
  "VC": "VCT",
  "WS": "WSM",
  "SM": "SMR",
  "ST": "STP",
  "SA": "SAU",
  "SN": "SEN",
  "RS": "SRB",
  "SC": "SYC",
  "SL": "SLE",
  "SG": "SGP",
  "SK": "SVK",
  "SI": "SVN",
  "SB": "SLB",
  "SO": "SOM",
  "ZA": "ZAF",
  "SS": "SSD",
  "ES": "ESP",
  "LK": "LKA",
  "SD": "SDN",
  "SR": "SUR",
  "SE": "SWE",
  "CH": "CHE",
  "SY": "SYR",
  "TW": "TWN",
  "TJ": "TJK",
  "TZ": "TZA",
  "TH": "THA",
  "TL": "TLS",
  "TG": "TGO",
  "TO": "TON",
  "TT": "TTO",
  "TN": "TUN",
  "TR": "TUR",
  "TM": "TKM",
  "TV": "TUV",
  "UG": "UGA",
  "UA": "UKR",
  "AE": "ARE",
  "GB": "GBR",
  "US": "USA",
  "UY": "URY",
  "UZ": "UZB",
  "VU": "VUT",
  "VE": "VEN",
  "VN": "VNM",
  "YE": "YEM",
  "ZM": "ZMB",
  "ZW": "ZWE"
};

export async function init_db():Promise<void> {
  const res = await fetch(parquet);
  console.log('res',res)
  await db.registerFileBuffer("artvis.parquet", new Uint8Array(await res.arrayBuffer()));
}


export async function fetchCoordinates(venue: string): Promise<Table<{ latitude: Utf8; longitude: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.latitude", "e.longitude"
    FROM artvis.parquet
    WHERE "e.venue" = '${venue}'
  `);
}

export async function fetchCities(country: string = ''): Promise<Table<{ city: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.city"
    FROM artvis.parquet
    WHERE "e.country" = '${country}'
    ORDER BY "e.city"
  `);
}

export async function fetchCountries(): Promise<Table<{ country: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.country"
    FROM artvis.parquet
    ORDER BY "e.country"
  `);
}

export async function fetchDataByCityAndCountry(city: string = 'Vienna', country: string = 'AT'): Promise<Table<{ latitude: Utf8; longitude: Utf8 }>> {
  const conn = await db.connect();
  let query = `
    SELECT DISTINCT "e.latitude", "e.longitude"
    FROM artvis.parquet
    WHERE 1=1
  `;
  if (city) {
    query += ` AND "e.city" = '${city}'`;
  }
  if (country) {
    query += ` AND "e.country" = '${country}'`;
  }
  const result = await conn.query(query);
  console.log('fetchDataByCityAndCountry ',result)
  return result;
}

export async function fetchCountriesWithExhibitions(
  start_date: bigint = 1902n,
  end_date: bigint = 1916n,
  solo: boolean = true,
  group: boolean = true,
  auction: boolean = true,
  male: boolean = true,
  female: boolean = true
): Promise<Table<{ country: Utf8, exhibition_count: number }>> {
  console.log('fetchCountriesWithExhibitions',solo,group,auction)
  const conn = await db.connect();
  let query = `
      SELECT "e.country" as country, COUNT(*) as exhibition_count
      FROM artvis.parquet
      WHERE 1=1
  `;

  if (start_date) {
    query += ` AND "e.startdate" >= ${start_date}`;
  }

  if (!solo || !group || !auction) {
    query += ` AND "e.type" IN (`;
    const types = [];
    if (solo) types.push("'solo'");
    if (group) types.push("'group'");
    if (auction) types.push("'auction'");
    query += types.join(", ");
    query += `)`;
  }

  if (!male || !female ) {
    query += ` AND "a.gender" IN (`;
    const genders = [];
    if (male) genders.push("'M'");
    if (female) genders.push("'F'");
    query += genders.join(", ");
    query += `)`;
  }

  query += `
    GROUP BY "e.country"
    ORDER BY exhibition_count DESC
  `;
  return await conn.query(query);
}

export function translate_iso_to_geojson(iso: string): string {
  return isoToGeoJsonMap[iso];
}

export async function describeArtvisTable(): Promise<void> {
  const conn = await db.connect();
  const result = await conn.query(`
    SELECT * FROM artvis.parquet LIMIT 1
  `);

  console.log("Description of artvis.parquet table:",result);
  //result.forEach((row: any) => {
  //  console.log(`Column: ${row.name}, Type: ${row.type}`);
  //});
}