//sidebar.ts
import * as d3 from "d3";
import {
  fetchCities,
  fetchCountries,
  init_db,
  fetchMinimumBirthdate,
  fetchMaximumBirthdate,
  fetchMinimumDeathdate,
  fetchMaximumDeathdate,
  fetchBasicArtistInfos
} from "./queries";
import { world_map } from "./world_map";
import { artistExhibitionGraph } from "./graph.js";
import * as querystring from "node:querystring";

const sidebar = document.querySelector("#sidebar")!;
const app = document.querySelector("#app")!;

// Initialize the database
await init_db();

// Create the world map and append it to the app
const worldMap = await world_map();
console.log("WORLD VIEW ", worldMap);

const graphView = await artistExhibitionGraph();
console.log("GRAPH VIEW ", graphView);

app.appendChild(worldMap.element);

let showMapView = true;
let showGraphView = false;

d3.select(sidebar).append("div").attr("id", "buttonContainerId").style("margin-top", "30px");
const showGraphButton = d3.select("#buttonContainerId").append("button").attr("id", "graphViewButtonId")
  .text("Graph View") // Set the button label
  .style("font-weight", "bold")
  .style("color", "black") // Set the text color to black
  .style("width", "40%") // Set the button width to 40px
  .style("height", "20px") // Optionally, set a height for the button
  .style("border", "1px solid #ccc") // Optional: Add a border
  .style("border-radius", "4px") // Optional: Add rounded corners
  .style("background-color", "lightgrey") // Optional: Set the background color
  .style("margin-left", "10px")
  .style("cursor", "pointer")
  .on("click", () => {
    if (!showGraphView) {
      showGraphView = true;
      showMapView = false;
    }
    showGraphButton.style("background-color", showGraphView ? "white" : "lightgrey");
    showMapButton.style("background-color", showMapView ? "white" : "lightgrey");
    d3.select<HTMLHeadingElement, unknown>("#viewTitle").text("Graph View");
    if (document.body.contains(worldMap.element)) {
      app.removeChild(worldMap.element);
    }
    app.appendChild(graphView.element);
    graphView.renderNewGraph(birthdateFrom, birthdateTo, deathdateFrom,
      deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool, selectedArtist);
    // Deactive some sidebar elements on the graph view
    toggleSidebarElementsForGraphView(true);
  });

const showMapButton = d3.select("#buttonContainerId").append("button").attr("id", "mapViewButtonId")
  .style("font-weight", "bold")
  .text("Map View") // Set the button label
  .style("color", "black") // Set the text color to black
  .style("width", "40%") // Set the button width to 40px
  .style("height", "20px") // Optionally, set a height for the button
  .style("border", "1px solid #ccc") // Optional: Add a border
  .style("border-radius", "4px") // Optional: Add rounded corners
  .style("background-color", "white") // Optional: Set the background color
  .style("margin-right", "10px")
  .style("margin-left", "10px")
  .style("cursor", "pointer")
  .on("click", () => {
    if (!showMapView) {
      showGraphView = false;
      showMapView = true;
    }
    showMapButton.style("background-color", showMapView ? "white" : "lightgrey");
    showGraphButton.style("background-color", showGraphView ? "white" : "lightgrey");
    d3.select<HTMLHeadingElement, unknown>("#viewTitle").text("World Map View");
    app.appendChild(worldMap.element);
    app.removeChild(graphView.element);

    // Reactivate some sidebar elements on the graph view
    toggleSidebarElementsForGraphView(false);
  });

let city = "All";
let country = "All";
let solo_bool: boolean = true;
let group_bool: boolean = true;
let auction_bool: boolean = true;
let male_bool: boolean = true;
let female_bool: boolean = true;
let exibition_start_year: bigint = 1902n;
let exibition_end_year: bigint = 1916n;
let birthdateFrom: Date = await fetchMinimumBirthdate();
let birthdateTo: Date = await fetchMaximumBirthdate();
let deathdateFrom: Date = await fetchMinimumDeathdate();
let deathdateTo: Date = await fetchMaximumDeathdate();
let selectedArtist : String;

/**
 * Updates the visuals on the world map and graph view based on the current filter settings.
 *
 * @param {boolean} graph - Indicates whether to update the graph view. Defaults to true.
 */
function do_updates_on_visuals(graph:boolean = true) {
  worldMap.updateChoroplethMap(exibition_start_year, exibition_end_year, birthdateFrom, birthdateTo, deathdateFrom,
    deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool);
  worldMap.updateCityTooltips(exibition_start_year, exibition_end_year, birthdateFrom, birthdateTo, deathdateFrom,
    deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool);
  worldMap.update_coordinates(city, country, exibition_start_year, exibition_end_year, birthdateFrom, birthdateTo, deathdateFrom,
    deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool);
  if (graph) {
    graphView.renderNewGraph(birthdateFrom, birthdateTo, deathdateFrom,
      deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool, selectedArtist);
  }
}

d3.select(sidebar).append("h4").text("Events from / to").style("margin-bottom", "5px");

// Create a slider for the beginning year
const begin_year_slider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", "1902")
  .attr("max", "1916")
  .attr("value", "1902")
  .attr("step", "1")
  .style("width", "100%");

// Create a span to display the begin_year_slider value
const begin_year_silderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(begin_year_slider.property("value"));

// Update the span text when the begin_year_slider value changes
begin_year_slider.on("input", function() {
  let value = parseInt(d3.select(this).property("value"));
  if (value > parseInt(end_year_slider.property("value"))) {
    value = parseInt(end_year_slider.property("value"));
    d3.select(this).property("value", value);
  }
  exibition_start_year = BigInt(value);
  begin_year_silderValue.text(value.toString());
}).on("mouseup", function() {
  do_updates_on_visuals(false)
});

// Create a slider for the end year
const end_year_slider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", "1902")
  .attr("max", "1916")
  .attr("value", "1916")
  .attr("step", "1")
  .style("width", "100%");

// Create a span to display the end_year_slider value
const end_year_silderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(end_year_slider.property("value"));

// Update the span text when the end_year_slider value changes
end_year_slider.on("input", function() {
  let value = parseInt(d3.select(this).property("value"));
  if (value < parseInt(begin_year_slider.property("value"))) {
    value = parseInt(begin_year_slider.property("value"));
    d3.select(this).property("value", value);
  }
  exibition_end_year = BigInt(value);
  end_year_silderValue.text(value.toString());
}).on("mouseup", function() {
  do_updates_on_visuals(false)
});

// Birthdate slider begin
d3.select(sidebar).append("h4").text("Birthdate from / to").style("margin-bottom", "5px");

const birthday_days_span = d3.timeDay.count(birthdateFrom, birthdateTo);

const birthdateTimeScale = d3.scaleTime().domain([birthdateFrom, birthdateTo]).range([0, birthday_days_span]);

// Create a slider for the begin birthdate
const birthdateFromSlider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", birthdateTimeScale.domain()[0].getTime())
  .attr("max", birthdateTimeScale.domain()[1].getTime())
  .attr("value", birthdateTimeScale.domain()[0].getTime())
  .attr("step", "86400000") // One day in milliseconds
  .style("width", "100%");

// Create a span to display the begin_year_slider value
const birthdateFromSliderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(new Date(parseInt(birthdateFromSlider.property("value"))).toISOString().split("T")[0]);

// Update the span text when the begin_year_slider value changes
birthdateFromSlider.on("input", function() {
  let value = new Date(parseInt(d3.select(this).property("value")));
  if (value > birthdateTo) {
    value = birthdateTo;
    d3.select(this).property("value", birthdateTo.getTime());
  }
  birthdateFrom = value;
  updateArtistDatalist();
  birthdateFromSliderValue.text(value.toISOString().split("T")[0]);
}).on("mouseup", function() {
  do_updates_on_visuals();
});


// Create a slider for the ending birthdate
const birthdateToSlider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", birthdateTimeScale.domain()[0].getTime())
  .attr("max", birthdateTimeScale.domain()[1].getTime())
  .attr("value", birthdateTimeScale.domain()[1].getTime())
  .attr("step", "86400000") // One day in milliseconds
  .style("width", "100%");

// Create a span to display the begin_year_slider value
const birthdateToSilderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(new Date(parseInt(birthdateToSlider.property("value"))).toISOString().split("T")[0]);

// Update the span text when the begin_year_slider value changes
birthdateToSlider.on("input", function() {
  let value = new Date(parseInt(d3.select(this).property("value")));
  if (value < birthdateFrom) {
    value = birthdateFrom;
    d3.select(this).property("value", birthdateFrom.getTime());
  }
  birthdateTo = value;
  updateArtistDatalist();
  birthdateToSilderValue.text(value.toISOString().split("T")[0]);
}).on("mouseup", function() {
  do_updates_on_visuals();
});

// Deathdate slider begin
d3.select(sidebar).append("h4").text("Deathdate from / to").style("margin-bottom", "5px");

const deathdateDaysSpan = d3.timeDay.count(deathdateFrom, deathdateTo);

const deathdateTimeScale = d3.scaleTime().domain([deathdateFrom, deathdateTo]).range([0, deathdateDaysSpan]);

// Create a slider for the begin birthdate
const deathdateFromSlider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", deathdateTimeScale.domain()[0].getTime())
  .attr("max", deathdateTimeScale.domain()[1].getTime())
  .attr("value", deathdateTimeScale.domain()[0].getTime())
  .attr("step", "86400000") // One day in milliseconds
  .style("width", "100%");

// Create a span to display the begin_year_slider value
const deathdateFromSliderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(new Date(parseInt(deathdateFromSlider.property("value"))).toISOString().split("T")[0]);



// Update the span text when the begin_year_slider value changes
deathdateFromSlider.on("input", function() {
  let value = new Date(parseInt(d3.select(this).property("value")));
  if (value > deathdateTo) {
    value = deathdateTo;
    d3.select(this).property("value", deathdateTo.getTime());
  }
  deathdateFrom = value;
  updateArtistDatalist();
  deathdateFromSliderValue.text(value.toISOString().split("T")[0]);
}).on("mouseup", function() {
  do_updates_on_visuals();
});


// Create a slider for the ending birthdate
const deathdateToSlider = d3.select(sidebar).append("input")
  .attr("type", "range")
  .attr("min", deathdateTimeScale.domain()[0].getTime())
  .attr("max", deathdateTimeScale.domain()[1].getTime())
  .attr("value", deathdateTimeScale.domain()[1].getTime())
  .attr("step", "86400000") // One day in milliseconds
  .style("width", "100%");

// Create a span to display the begin_year_slider value
const deathdateToSilderValue = d3.select(sidebar).append("span")
  .style("margin-left", "10px")
  .text(new Date(parseInt(deathdateToSlider.property("value"))).toISOString().split("T")[0]);

// Update the span text when the begin_year_slider value changes
deathdateToSlider.on("input", function() {
  let value = new Date(parseInt(d3.select(this).property("value")));
  if (value < deathdateFrom) {
    value = deathdateFrom;
    d3.select(this).property("value", deathdateFrom.getTime());
  }
  deathdateTo = value;
  updateArtistDatalist();
  deathdateToSilderValue.text(value.toISOString().split("T")[0]);
}).on("mouseup", function() {
  do_updates_on_visuals();
});

d3.select(sidebar).append("h4").text("Eventtype").style("margin-bottom", "5px");

// Create a group for the exhibition type checkboxes
const exhibition_type_checkboxGroup = d3.select(sidebar).append("div").attr("id", "exhibition_type_checkboxGroup");

// Create the solo exhibition checkbox
const solo_checkbox = exhibition_type_checkboxGroup.append("input")
  .attr("type", "checkbox")
  .attr("id", "solo_checkbox_id")
  .attr("checked", solo_bool) // Set as checked by default
  .style("margin-left", "10px");
exhibition_type_checkboxGroup.append("label")
  .attr("for", "solo_checkbox_id")
  .text("Solo");

// Create the group exhibition checkbox
const group_checkbox = exhibition_type_checkboxGroup.append("input")
  .attr("type", "checkbox")
  .attr("id", "group_checkbox_id")
  .attr("checked", group_bool) // Set as checked by default
  .style("margin-left", "10px");
exhibition_type_checkboxGroup.append("label")
  .attr("for", "group_checkbox_id")
  .text("Group");

// Create the auction checkbox
const auction_checkbox = exhibition_type_checkboxGroup.append("input")
  .attr("type", "checkbox")
  .attr("id", "auction_checkbox_id")
  .attr("checked", auction_bool) // Set as checked by default
  .style("margin-left", "10px");
exhibition_type_checkboxGroup.append("label")
  .attr("for", "auction_checkbox_id")
  .text("Auction");

// Add event listeners to the exhibition type checkboxes
solo_checkbox.on("change", function() {
  const isChecked = d3.select(this).property("checked");
  solo_bool = isChecked;
  do_updates_on_visuals()
  console.log("Checkbox Solo is checked:", isChecked);
  updateArtistDatalist();
});

group_checkbox.on("change", function() {
  const isChecked = d3.select(this).property("checked");
  group_bool = isChecked;
  do_updates_on_visuals()
  console.log("Checkbox Group is checked:", isChecked);
  updateArtistDatalist();
});

auction_checkbox.on("change", function() {
  const isChecked = d3.select(this).property("checked");
  auction_bool = isChecked;
  do_updates_on_visuals()
  console.log("Checkbox Aution is checked:", isChecked);
  updateArtistDatalist();
});

d3.select(sidebar).append("h4").text("Gender").style("margin-bottom", "5px");

// Create a group for the gender checkboxes
const gender_checkboxGroup = d3.select(sidebar).append("div").attr("id", "gender_checkboxGroup");

// Create the male checkbox
const male_checkbox = gender_checkboxGroup.append("input")
  .attr("type", "checkbox")
  .attr("id", "male_checkbox_id")
  .attr("checked", male_bool) // Set as checked by default
  .style("margin-left", "10px");
gender_checkboxGroup.append("label")
  .attr("for", "male_checkbox_id")
  .text("Male");

// Create the female checkbox
const female_checkbox = gender_checkboxGroup.append("input")
  .attr("type", "checkbox")
  .attr("id", "female_checkbox_id")
  .attr("checked", female_bool) // Set as checked by default
  .style("margin-left", "10px");
gender_checkboxGroup.append("label")
  .attr("for", "female_checkbox_id")
  .text("Female");

// Add event listeners to the gender checkboxes
male_checkbox.on("change", function() {
  const isChecked = d3.select(this).property("checked");
  male_bool = isChecked;
  do_updates_on_visuals()
  console.log("Male checkbox is checked:", isChecked);
  updateArtistDatalist();
});

female_checkbox.on("change", function() {
  const isChecked = d3.select(this).property("checked");
  female_bool = isChecked;
  do_updates_on_visuals()
  console.log("Female checkbox is checked:", isChecked);
  updateArtistDatalist();
});

d3.select(sidebar).append("h4").text("Event location").style("margin-bottom", "5px");


// Create a label for the country select box
d3.select(sidebar).append("label")
  .attr("for", "country_select_box_id")
  .text("Select Country:")
  .style("margin-left", "10px");

// Create a select box for countries
const country_select_box = d3.select(sidebar).append("select")
  .attr("id", "country_select_box_id");

// Fetch and add options to the country select box
const countries = await fetchCountries();
country_select_box.append("option")
  .attr("value", "All")
  .text("All");
for (const country of countries) {
  country_select_box.append("option")
    .attr("value", country["e.country"])
    .text(country["e.country"]);
}

// Add an event listener to the country select box
country_select_box.on("change", async function() {
  country = country_select_box.property("value");

  // Fetch and update the city options based on the selected country
  const cities = await fetchCities(country);
  city_select_box.selectAll("option").remove();
  city_select_box.append("option")
    .attr("value", "All")
    .text("All");
  for (const city of cities) {
    city_select_box.append("option")
      .attr("value", city["e.city"])
      .text(city["e.city"]);
  }
  // const city = city_select_box.property("value");
  // Update coordinates based on the new selection
  await updateCityCircles(city, country, exibition_start_year, exibition_end_year,
    birthdateFrom, birthdateTo, deathdateFrom, deathdateTo,
    solo_bool, group_bool, auction_bool, male_bool, female_bool);
});

d3.select(sidebar).append("br");

// Create a label for the city select box
d3.select(sidebar).append("label")
  .attr("for", "city_select_box_id")
  .text("Select City:")
  .style("margin-left", "10px");

// Create a select box for cities
const city_select_box = d3.select(sidebar).append("select")
  .attr("id", "city_select_box_id");

// Fetch and add options to the city select box
let cities = await fetchCities("All");
for (const city of cities) {
  city_select_box.append("option")
    .attr("value", city["e.city"])
    .text(city["e.city"]);
}

// Add an event listener to the city select box
city_select_box.on("change", async function() {
  city = city_select_box.property("value");
  await updateCityCircles(city, country, exibition_start_year, exibition_end_year,
    birthdateFrom, birthdateTo, deathdateFrom, deathdateTo,
    solo_bool, group_bool, auction_bool, male_bool, female_bool);
});

async function updateCityCircles(city: string = "All",
                                 country: string = "All",
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
                                 female: boolean = true) {
  try {
    // Wait for update_coordinates to complete
    await worldMap.update_coordinates(city, country, start_date, end_date,
      birthdateFrom, birthdateTo, deathdateFrom, deathdateTo,
      solo, group, auction, male, female);

    // Update tooltips after coordinates have been updated
    await worldMap.updateCityTooltips(start_date, end_date, birthdateFrom, birthdateTo, deathdateFrom,
      deathdateTo, solo, group, auction, male, female);
  } catch (error) {
    console.error("Error updating the world map:", error);
  }
}

function toggleSidebarElementsForGraphView(isGraphView: boolean) {

  // Disable all sidebar elements when in graph view
  // or reactive them when not
  var onlyGraph = isGraphView ? true : null;
  
  begin_year_slider.attr("disabled", onlyGraph);
  end_year_slider.attr("disabled", onlyGraph);
  city_select_box.attr("disabled", onlyGraph);
  country_select_box.attr("disabled", onlyGraph);

  //Assumption that only map view and graph view are possible
  var onlyMap = isGraphView ? null : true;
  artistInput.attr("disabled", onlyMap);
}

// Append an input field for artist search
d3.select(sidebar).append("h4").text("Select Artist").style("margin-bottom", "5px");

// Create input field with a datalist
const artistInput = d3.select(sidebar)
  .append("input")
  .attr("type", "text")
  .attr("id", "artistInput")
  .attr("list", "artistList")
  .attr("placeholder", "Search artist...");

// Create datalist element
const artistDatalist = d3.select(sidebar)
  .append("datalist")
  .attr("id", "artistList");

// Fetch and populate the datalist, with the filtered artists
async function updateArtistDatalist() {
  const artists = await fetchBasicArtistInfos(birthdateFrom, birthdateTo, deathdateFrom, deathdateTo,
    solo_bool, group_bool, auction_bool, male_bool, female_bool
  );
  
  // Remove existing options to avoid duplicates
  artistDatalist.selectAll("option").remove();

  artistDatalist.append("option")
      .attr("value", `ALL`)
      .attr("data-id", '-1'); // Store artist ID if needed

  for (const artist of artists) {
    artistDatalist.append("option")
      .attr("value", `${artist["a.firstname"]} ${artist["a.lastname"]}`)
      .attr("data-id", artist["a.id"]); // Store artist ID if needed
  }

  console.log("Artists loaded into datalist.");
}

// Call the function to initialize the datalist
updateArtistDatalist();
//Initially only the map view is shown
//so we deactivate some sidebar elements
toggleSidebarElementsForGraphView(false);

// Handle Selection changes
artistInput.on("change", function () {
  let selectedArtistName = d3.select(this).property("value");

  artistDatalist.selectAll("option")
      .each(function () {
        const option =
            d3.select(this);
        if (option.attr("value") === selectedArtistName) {
          selectedArtist = option.attr("data-id"); // Get the stored artist ID } });
        }
      });
  console.log("Selected artist:", selectedArtist);
 graphView.renderNewGraph(birthdateFrom, birthdateTo, deathdateFrom,
        deathdateTo, solo_bool, group_bool, auction_bool, male_bool, female_bool, selectedArtist);
  // You can process the selected artist here (e.g., filtering visualizations)
});




