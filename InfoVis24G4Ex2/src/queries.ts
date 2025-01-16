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

/**
 * Initializes the database by fetching the Parquet file and registering it with DuckDB.
 *
 * @returns {Promise<void>} - A promise that resolves when the database initialization is complete.
 */
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

/**
 * Fetches the list of distinct cities from the database for a given country.
 *
 * @param {string} [country=''] - The ISO 3166-1 alpha-2 country code. If not provided, fetches cities for all countries.
 * @returns {Promise<Table<{ city: Utf8 }>>} - A promise that resolves to a Table containing the distinct cities.
 */
export async function fetchCities(country: string = ''): Promise<Table<{ city: Utf8 }>> {
  const conn = await db.connect();
  let query = `
    SELECT DISTINCT "e.city"
    FROM artvis.parquet
  `;
  if (country !== 'All') {
    query += ` WHERE "e.country" = '${country}'`;
  }
  query += ` ORDER BY "e.city"`;
  return await conn.query(query);
}

/**
 * Fetches the list of distinct countries from the database.
 *
 * @returns {Promise<Table<{ country: Utf8 }>>} - A promise that resolves to a Table containing the distinct countries.
 */
export async function fetchCountries(): Promise<Table<{ country: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.country"
    FROM artvis.parquet
    ORDER BY "e.country"
  `);
}

export async function fetchDataByCityAndCountry(city: string = 'All',
                                                country: string = 'All',
                                                start_date: bigint = 1902n,
                                                end_date: bigint = 1916n,
                                                birthdateFrom: Date,
                                                birthdateTo: Date,
                                                deathdateFrom: Date,
                                                deathdateTo: Date,
                                                solo: boolean = true,
                                                group: boolean = true,
                                                auction: boolean = true,
                                                male: boolean = true,
                                                female: boolean = true
): Promise<Table<{ latitude: Utf8; longitude: Utf8 }>> {
  const conn = await db.connect();
  let query = `
      SELECT "e.latitude", "e.longitude", "e.city", "e.country",  SUM("e.paintings") as paintings_count
    FROM artvis.parquet
    WHERE 1=1
  `;
  if (city && city !== 'All') {
    query += ` AND "e.city" = '${city}'`;
  }
  if (country && country !== 'All') {
    query += ` AND "e.country" = '${country}'`;
  }

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
  }

  if (start_date) {
    query += ` AND "e.startdate" >= ${start_date}`;
  }

  if (end_date) {
    query += ` AND "e.startdate" <= ${end_date}`;
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
    GROUP BY "e.latitude", "e.longitude", "e.city", "e.country"
  `;
  const result = await conn.query(query);
  return result;
}

export async function fetchCountriesWithExhibitions(
    start_date: bigint = 1902n,
    end_date: bigint = 1916n,
    birthdateFrom: Date,
    birthdateTo: Date,
    deathdateFrom: Date,
    deathdateTo: Date,
    solo: boolean = true,
    group: boolean = true,
    auction: boolean = true,
    male: boolean = true,
    female: boolean = true
): Promise<Table<{ country: Utf8, exhibition_count: number }>> {
  console.log('fetchCountriesWithExhibitions',solo,group,auction)
  const conn = await db.connect();
  let query = `
    SELECT "e.country" as country, COUNT(*) as exhibition_count,
           SUM("e.paintings") as paintings_count,
           COUNT(DISTINCT CONCAT(COALESCE("a.firstname", ''), ' ', COALESCE("a.lastname", ''))
           ) AS artist_count,
           SUM(CASE WHEN "e.type" = 'solo' THEN 1 ELSE 0 END) AS solo_count,
           SUM(CASE WHEN "e.type" = 'group' THEN 1 ELSE 0 END) AS group_count,
           SUM(CASE WHEN "e.type" = 'auction' THEN 1 ELSE 0 END) AS auction_count,
           ROUND(
               100.0 * COUNT(CASE WHEN "a.gender" = 'M' THEN 1 ELSE NULL END) /
               COUNT(CASE WHEN "a.gender" IN ('M', 'F') THEN 1 ELSE NULL END), 2
           ) AS male_percentage,
           ROUND(
               100.0 * COUNT(CASE WHEN "a.gender" = 'F' THEN 1 ELSE NULL END) /
               COUNT(CASE WHEN "a.gender" IN ('M', 'F') THEN 1 ELSE NULL END), 2
           ) AS female_percentage,
           MIN("e.startdate" % 10000) AS earliest_year,
           MAX("e.startdate" % 10000) AS latest_year
    FROM artvis.parquet
    WHERE 1=1
  `;

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
  }

  if (start_date) {
    query += ` AND "e.startdate" >= ${start_date}`;
  }

  if (end_date) {
    query += ` AND "e.startdate" <= ${end_date}`;
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


export async function fetchExhibitionsByCityAndCountry(
    start_date: bigint = 1902n,
    end_date: bigint = 1916n,
    birthdateFrom: Date,
    birthdateTo: Date,
    deathdateFrom: Date,
    deathdateTo: Date,
    solo: boolean = true,
    group: boolean = true,
    auction: boolean = true,
    male: boolean = true,
    female: boolean = true
): Promise<Table<{ exhibition_count: number }>> {
  console.log('fetchExhibitionsByCityAndCountry', solo, group, auction);

  const conn = await db.connect();
  let query = `
    SELECT "e.country" as country, "e.city" as city, COUNT(*) as exhibition_count,
           SUM("e.paintings") as paintings_count,
           COUNT(DISTINCT CONCAT(COALESCE("a.firstname", ''), ' ', COALESCE("a.lastname", ''))
           ) AS artist_count,
           SUM(CASE WHEN "e.type" = 'solo' THEN 1 ELSE 0 END) AS solo_count,
           SUM(CASE WHEN "e.type" = 'group' THEN 1 ELSE 0 END) AS group_count,
           SUM(CASE WHEN "e.type" = 'auction' THEN 1 ELSE 0 END) AS auction_count,
           ROUND(
               100.0 * COUNT(CASE WHEN "a.gender" = 'M' THEN 1 ELSE NULL END) /
               COUNT(CASE WHEN "a.gender" IN ('M', 'F') THEN 1 ELSE NULL END), 2
           ) AS male_percentage,
           ROUND(
               100.0 * COUNT(CASE WHEN "a.gender" = 'F' THEN 1 ELSE NULL END) /
               COUNT(CASE WHEN "a.gender" IN ('M', 'F') THEN 1 ELSE NULL END), 2
           ) AS female_percentage,
           MIN("e.startdate" % 10000) AS earliest_year,
           MAX("e.startdate" % 10000) AS latest_year
    FROM artvis.parquet
    WHERE 1=1
  `;

  if (start_date) {
    query += ` AND "e.startdate" >= ${start_date}`;
  }

  if (end_date) {
    query += ` AND "e.startdate" <= ${end_date}`;
  }

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
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

  if (!male || !female) {
    query += ` AND "a.gender" IN (`;
    const genders = [];
    if (male) genders.push("'M'");
    if (female) genders.push("'F'");
    query += genders.join(", ");
    query += `)`;
  }

  query += `
    GROUP BY "e.country", "e.city"
    ORDER BY exhibition_count DESC
  `;
  return await conn.query(query);
}

/**
 * Translates a given ISO 3166-1 alpha-2 country code to its corresponding GeoJSON country code.
 *
 * @param {string} iso - The ISO 3166-1 alpha-2 country code.
 * @returns {string} - The corresponding GeoJSON country code.
 */
export function translate_iso_to_geojson(iso: string): string {
  return isoToGeoJsonMap[iso];
}


/**
 * Extracts the date from the result of a database query and converts it to a Date object.
 *
 * @param {Table<any>} result - The result of a database query.
 * @returns {Date} - A Date object representing the extracted date.
 */
function get_date_from_result(result: Table<any>) {
  if (result) {
    return new Date(result.getChild("result_date")!.toArray()[0]);
  } else {
    return new Date();
  }
}

/**
 * Fetches the minimum birthdate from the database.
 *
 * @returns {Promise<Date>} - A promise that resolves to a Date object representing the minimum birthdate.
 */
export async function fetchMinimumBirthdate(): Promise<Date> {
  const conn = await db.connect();
  const result = await conn.query(`
    SELECT MIN("a.birthdate") as result_date
    FROM artvis.parquet
  `);
  return get_date_from_result(result);
}

/**
 * Fetches the maximum birthdate from the database.
 *
 * @returns {Promise<Date>} - A promise that resolves to a Date object representing the maximum birthdate.
 */
export async function fetchMaximumBirthdate(): Promise<Date> {
  const conn = await db.connect();
  const result = await conn.query(`
    SELECT MAX("a.birthdate") as result_date
    FROM artvis.parquet
  `);
  return get_date_from_result(result);
}

/**
 * Fetches the minimum deathdate from the database.
 *
 * @returns {Promise<Date>} - A promise that resolves to a Date object representing the minimum deathdate.
 */
export async function fetchMinimumDeathdate(): Promise<Date> {
  const conn = await db.connect();
  const result = await conn.query(`
    SELECT MIN("a.deathdate") as result_date
    FROM artvis.parquet
  `);
  return get_date_from_result(result);
}

/**
 * Fetches the maximum deathdate from the database.
 *
 * @returns {Promise<Date>} - A promise that resolves to a Date object representing the maximum deathdate.
 */
export async function fetchMaximumDeathdate(): Promise<Date> {
  const conn = await db.connect();
  const result = await conn.query(`
    SELECT MAX("a.deathdate") as result_date
    FROM artvis.parquet
  `);
  return get_date_from_result(result);
}

export async function fetchMaxPaintings(): Promise< number > {
  const conn = await db.connect();
  let query = `
    SELECT "e.latitude", "e.longitude", sum("e.paintings") as paintings_count
    FROM artvis.parquet e
    WHERE 1=1
  `;

  query += `
    GROUP BY "e.latitude", "e.longitude"
  `;

  const result = await conn.query(query);
  const maxPaintingsCountQuery = `
    SELECT MAX(paintings_count) as max_paintings_count
    FROM (${query}) as subquery
  `;
  const maxPaintingsCountResult = await conn.query(maxPaintingsCountQuery);
  const maxPaintingsCount = maxPaintingsCountResult.getChild("max_paintings_count")!.toArray()[0];

  return maxPaintingsCount as number;
}

export async function fetchBasicExhbitionInfos(
    birthdateFrom: Date,
    birthdateTo: Date,
    deathdateFrom: Date,
    deathdateTo: Date,
    solo: boolean = true,
    group: boolean = true,
    auction: boolean = true,
    male: boolean = true,
    female: boolean = true): Promise<Table<{ id: Utf8; title: Utf8; type: Utf8 }>> {
  console.log("FETCH EXHIB START....")

  const conn = await db.connect();
  let query = (`
    SELECT DISTINCT "e.id", "e.title", "e.type"
    FROM artvis.parquet
    WHERE 1 = 1
  `);

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
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

  if (!male || !female) {
    query += ` AND "a.gender" IN (`;
    const genders = [];
    if (male) genders.push("'M'");
    if (female) genders.push("'F'");
    query += genders.join(", ");
    query += `)`;
  }

  return await conn.query(query);
}

export async function fetchBasicArtistInfos(
    birthdateFrom: Date,
    birthdateTo: Date,
    deathdateFrom: Date,
    deathdateTo: Date,
    solo: boolean = true,
    group: boolean = true,
    auction: boolean = true,
    male: boolean = true,
    female: boolean = true): Promise<Table<{ id: Utf8; firstname: Utf8; lastname: Utf8; gender: Utf8 }>> {
  console.log("FETCH ARTIST START....")
  const conn = await db.connect();
  let query = (`
    SELECT DISTINCT "a.id", "a.firstname","a.lastname","a.gender"
    FROM artvis.parquet
    WHERE 1=1
  `);

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
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

  if (!male || !female) {
    query += ` AND "a.gender" IN (`;
    const genders = [];
    if (male) genders.push("'M'");
    if (female) genders.push("'F'");
    query += genders.join(", ");
    query += `)`;
  }
  return await conn.query(query);
}

export async function fetchArtistExhibitionLink(
    birthdateFrom: Date,
    birthdateTo: Date,
    deathdateFrom: Date,
    deathdateTo: Date,
    solo: boolean = true,
    group: boolean = true,
    auction: boolean = true,
    male: boolean = true,
    female: boolean = true
): Promise<Table<{ aid: Utf8; eid: Utf8 }>> {
  console.log("FETCH LINK START....")

  const conn = await db.connect();
  let query = (`SELECT DISTINCT "a.id", "e.id"
                FROM artvis.parquet
                WHERE 1=1
  `);

  if (birthdateFrom && birthdateTo) {
    query += ` AND "a.birthdate" BETWEEN '${birthdateFrom.toISOString().split('T')[0]}' AND '${birthdateTo.toISOString().split('T')[0]}'`;
  }

  if (deathdateFrom && deathdateTo) {
    query += ` AND "a.deathdate" BETWEEN '${deathdateFrom.toISOString().split('T')[0]}' AND '${deathdateTo.toISOString().split('T')[0]}'`;
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

  if (!male || !female) {
    query += ` AND "a.gender" IN (`;
    const genders = [];
    if (male) genders.push("'M'");
    if (female) genders.push("'F'");
    query += genders.join(", ");
    query += `)`;
  }
  return await conn.query(query);
}