import "./style.css";
import * as d3 from "d3";

import { barChart } from "./bar-chart";
import { world_map } from "./world_map";
import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./../data/artvis.parquet?url";

const app = document.querySelector("#app")!;

// Create the chart. The specific code here makes some assumptions that may not hold for you.
const chart = barChart();
const worldMap = world_map();

async function update(venue: string) {
  // Query DuckDB for the data we want to visualize.
  const data: Table<{ venue: Utf8; cnt: Int32 }> = await conn.query(`
  SELECT "e.venue", count(*)::INT as cnt
  FROM artvis.parquet
  WHERE "e.venue" = '${venue}'
  GROUP BY "e.venue"
  ORDER BY cnt DESC`);

  // Get the X and Y columns for the chart. Instead of using Parquet, DuckDB, and Arrow, we could also load data from CSV or JSON directly.
  const X = data.getChild("cnt")!.toArray();
  const Y = data
    .getChild("e.venue")!
    .toJSON()
    .map((d) => `${d}`);

  chart.update(X, Y);
}

async function update_coordinates(venue: string) {
  // Query DuckDB for the data we want to visualize.
  const data = await conn.query(`
  SELECT DISTINCT "e.latitude", "e.longitude"
  FROM artvis.parquet
  WHERE "e.venue" = '${venue}'`);
  const lati = data.getChild("e.latitude")!.toJSON().map((d) => d);
  const longi= data.getChild("e.longitude")!.toJSON().map((d) => d);

  worldMap.update([{ longitude: longi[0], latitude: lati[0] }]);



}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.
const res = await fetch(parquet);
await db.registerFileBuffer(
  "artvis.parquet",
  new Uint8Array(await res.arrayBuffer())
);

// Query DuckDB for the locations.
const conn = await db.connect();

const venue: Table<{ venue: Utf8 }> = await conn.query(`
SELECT DISTINCT "e.venue"
FROM artvis.parquet
ORDER BY "e.venue"`);



// Create a select element for the locations.
const select = d3.select(app).append("select");
for (const location of venue) {
  select.append("option").text(location["e.venue"]);
}

select.on("change", () => {
  const venue = select.property("value");
  update(venue);
  update_coordinates(venue)
});


app.appendChild(worldMap.element);
