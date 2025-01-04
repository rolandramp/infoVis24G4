import { Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./../data/artvis.parquet?url";


export async function init_db():Promise<void> {
  const res = await fetch(parquet);
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

export async function fetchCities(): Promise<Table<{ city: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.city"
    FROM artvis.parquet
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
  return await conn.query(`
    SELECT DISTINCT "e.latitude", "e.longitude"
    FROM artvis.parquet
    WHERE "e.city" = '${city}' AND "e.country" = '${country}'
  `);
}