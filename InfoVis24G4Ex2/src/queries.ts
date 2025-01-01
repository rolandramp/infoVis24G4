import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./../data/artvis.parquet?url";


export async function init_db():Promise<void> {
  const res = await fetch(parquet);
  await db.registerFileBuffer("artvis.parquet", new Uint8Array(await res.arrayBuffer()));
}


export async function fetchData(venue: string): Promise<Table<{ venue: Utf8; cnt: Int32 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT "e.venue", count(*)::INT as cnt
    FROM artvis.parquet
    WHERE "e.venue" = '${venue}'
    GROUP BY "e.venue"
    ORDER BY cnt DESC
  `);
}

export async function fetchCoordinates(venue: string): Promise<Table<{ latitude: Utf8; longitude: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.latitude", "e.longitude"
    FROM artvis.parquet
    WHERE "e.venue" = '${venue}'
  `);
}

export async function fetchVenues(): Promise<Table<{ venue: Utf8 }>> {
  const conn = await db.connect();
  return await conn.query(`
    SELECT DISTINCT "e.venue"
    FROM artvis.parquet
    ORDER BY "e.venue"
  `);
}