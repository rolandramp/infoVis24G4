import "./style.css";
import * as d3 from "d3";

import { barChart } from "./bar-chart";
import { world_map } from "./world_map";
import { fetchData, fetchCoordinates, fetchVenues, init_db } from "./queries";

const app = document.querySelector("#app")!;

// Create the chart. The specific code here makes some assumptions that may not hold for you.
const chart = barChart();
const worldMap = world_map();

async function update(venue: string) {
  const data = await fetchData(venue);
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
  const data = await fetchCoordinates(venue);
  const lati = data.getChild("e.latitude")!.toJSON().map((d) => d);
  const longi= data.getChild("e.longitude")!.toJSON().map((d) => d);

  worldMap.update([{ longitude: longi[0], latitude: lati[0] }]);

}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.

await init_db();


const venue = await fetchVenues();



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
