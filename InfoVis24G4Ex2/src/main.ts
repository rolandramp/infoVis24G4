import "./style.css";
import * as d3 from "d3";

import { barChart } from "./bar-chart";
import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./../data/artvis.parquet?url";

const app = document.querySelector("#app")!;

// Create the chart. The specific code here makes some assumptions that may not hold for you.
const chart = barChart();

async function update(birthplace: string) {
  // Query DuckDB for the data we want to visualize.
  const data: Table<{ birthplace: Utf8; cnt: Int32 }> = await conn.query(`
  SELECT "a.birthplace", count(*)::INT as cnt
  FROM artvis.parquet
  WHERE "a.birthplace" = '${birthplace}'
  GROUP BY "a.birthplace"
  ORDER BY cnt DESC`);

  // Get the X and Y columns for the chart. Instead of using Parquet, DuckDB, and Arrow, we could also load data from CSV or JSON directly.
  const X = data.getChild("cnt")!.toArray();
  const Y = data
    .getChild("a.birthplace")!
    .toJSON()
    .map((d) => `${d}`);

  chart.update(X, Y);
}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.
const res = await fetch(parquet);
await db.registerFileBuffer(
  "artvis.parquet",
  new Uint8Array(await res.arrayBuffer())
);

// Query DuckDB for the locations.
const conn = await db.connect();

const birthplace: Table<{ birthplace: Utf8 }> = await conn.query(`
SELECT DISTINCT "a.birthplace"
FROM artvis.parquet
ORDER BY "a.birthplace"`);


// Create a select element for the locations.
const select = d3.select(app).append("select");
for (const location of birthplace) {
  select.append("option").text(location["a.birthplace"]);
}

select.on("change", () => {
  const birthplace = select.property("value");
  update(birthplace);
});

// Update the chart with the first location.
update("Brno");

// Add the chart to the DOM.
app.appendChild(chart.element);
