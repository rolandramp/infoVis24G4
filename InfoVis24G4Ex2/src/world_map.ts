import * as d3 from "d3"
import {legendColor} from "d3-svg-legend"
import { init_db, fetchDataByCityAndCountry, fetchCountriesWithExhibitions, translate_iso_to_geojson, fetchMaxPaintings } from "./queries";
import { fetchExhibitionsByCityAndCountry } from "./queries";
interface GeoJson {
  type: string;
  features: {
    type: string;
    properties: {
      name: string;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
}

export async function world_map() {
  // Initialize the database
  init_db();

  const width = 800;
  const height = 600;

  // max number of paintings at location
  const max_paintings = await fetchMaxPaintings()

  // Create a scale for the circle radius based on the exhibition count
  const radiusScale = d3.scaleSqrt()
    .domain([0, Number(max_paintings) || 0])
    .range([0.5, 7]); // Adjust the range as needed

  let svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .on("click", reset);

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

  const path = d3.geoPath().projection(projection);

  const g = svg.append("g");

  const countries = g.append("g");

  const countryNames = new Map<string, number>();
  const exhibitionCounts = new Map<string, number>();
  const soloCounts = new Map<string, number>();
  const groupCounts = new Map<string, number>();
  const auctionCounts = new Map<string, number>();
  const paintingsCounts = new Map<string, number>();
  const artistCounts = new Map<string, number>();
  const malePercs = new Map<string, number>();
  const femalePercs = new Map<string, number>();
  const earliest_year = new Map<string, number>();
  const latest_year = new Map<string, number>();
  // Fetch the exhibition data
  const countriesWithExhibitions = await fetchCountriesWithExhibitions();

  for (const row of countriesWithExhibitions) {
    countryNames.set(translate_iso_to_geojson(row['country']), row['country']);
    exhibitionCounts.set(translate_iso_to_geojson(row['country']), row['exhibition_count']);
    soloCounts.set(translate_iso_to_geojson(row['country']), row['solo_count']);
    groupCounts.set(translate_iso_to_geojson(row['country']), row['group_count']);
    auctionCounts.set(translate_iso_to_geojson(row['country']), row['auction_count']);
    paintingsCounts.set(translate_iso_to_geojson(row['country']), row['paintings_count']);
    artistCounts.set(translate_iso_to_geojson(row['country']), row['artist_count']);
    malePercs.set(translate_iso_to_geojson(row['country']), row['male_percentage']);
    femalePercs.set(translate_iso_to_geojson(row['country']), row['female_percentage']);
    earliest_year.set(translate_iso_to_geojson(row['country']), row['earliest_year']);
    latest_year.set(translate_iso_to_geojson(row['country']), row['latest_year']);
  }


  console.log('exhibitionCounts',Array.from(exhibitionCounts.values()))
  console.log('array Max',d3.max(Array.from(exhibitionCounts.values())))

  // Create a color scale
  const color_c = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(Array.from(exhibitionCounts.values()).map(v => Number(v))) || 0]);

  d3.json<GeoJson>("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(function(data) {
      if (data) {
        countries.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
            .on("click", clicked)
            .attr("d", d => path(d as any) || "")
            .attr("fill", d => {
              const count = exhibitionCounts.get(d.id) || 0;
              return color_c(Number(count));
            })
          .attr("stroke", "#fff")
      }

      updateCountryTooltips(countries, countryNames, exhibitionCounts, soloCounts, groupCounts,
         auctionCounts, paintingsCounts, artistCounts, malePercs, femalePercs, earliest_year, latest_year);
  })

  svg.call(zoom);

  // Append the legend
  const legend = legendColor()
    .scale(color_c)
    .shapeWidth(200)
    .orient("horizontal")
    .labelFormat(d3.format(".0f"));

  svg.append("g")
    .attr("transform", "translate(10,20)")
    .call(legend);

  function reset() {
    countries.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    countries.transition().style("fill", null);
    d3.select(this).transition().style("fill", "red");
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, svg.node())
    );
  }

  function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }


  /**
   * Updates the map with new city coordinates.
   *
   * @param {Array<{ latitude: number, longitude: number, city: string, country: string }>} data -
   *        An array of objects containing the latitude, longitude, city, and country information.
   */
  function update(data: { latitude: number, longitude: number, city: string, country: string, exhibition_count: number }[]) {


    const circles = countries.selectAll('circle')
      .data(data, d => `${d.latitude},${d.longitude}`);

    // Remove old circles
    circles.exit().remove();

    // Update existing circles
    circles
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1])

    // Add new circles
    const newCircles = circles.enter()
      .append('circle')
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1])
      .attr('r', d => radiusScale(d.exhibition_count))
      // .attr('r', 2)
      .attr('fill', 'green')
      .attr('opacity', 0.5);
  }

  // Function to update coordinates based on selected city and country
  async function update_coordinates(city: string = 'Vienna', country: string = 'AT') {
    try {
      // Fetch data by city and country
      const data = await fetchDataByCityAndCountry(city, country);
      const latitudes = data.getChild("e.latitude")!.toJSON();
      const longitudes = data.getChild("e.longitude")!.toJSON();
      const exhibition_count = data.getChild("exhibition_count")!.toJSON();

      // Map the latitude and longitude values into an array of objects
      const coordinates = latitudes.map((lat, index) => ({
        latitude: lat,
        longitude: longitudes[index],
        city: city,
        country: country,
        exhibition_count: exhibition_count
      }));

      // Update the world map with all the new coordinates
      update(coordinates);
    } catch (error) {
      // Handle any errors that occur during the fetch or update process
      console.error("Error updating coordinates:", error);
    }
  }

  /**
   * Updates the city tooltips with exhibition data based on the provided filters.
   *
   * @param {bigint} exhibition_start_date - The start year for the exhibition filter.
   * @param {bigint} exhibition_end_date - The end year for the exhibition filter.
   * @param {Date} birthdate_from - The start date for the birthdate filter.
   * @param {Date} birthdate_to - The end date for the birthdate filter.
   * @param {Date} deathdate_from - The start date for the deathdate filter.
   * @param {Date} deathdate_to - The end date for the deathdate filter.
   * @param {boolean} solo - Filter for solo exhibitions.
   * @param {boolean} group - Filter for group exhibitions.
   * @param {boolean} auction - Filter for auction exhibitions.
   * @param {boolean} male - Filter for male artists.
   * @param {boolean} female - Filter for female artists.
   *
   * @returns {Promise<void>} - A promise that resolves when the city tooltips update is complete.
   */
  async function updateCityTooltips(exhibition_start_date: bigint = 1902n,
                                    exhibition_end_date: bigint = 1916n,
                                    birthdateFrom: Date,
                                    birthdateTo: Date,
                                    deathdateFrom: Date,
                                    deathdateTo: Date,
                                    solo: boolean = true,
                                    group: boolean = true,
                                    auction: boolean = true,
                                    male: boolean = true,
                                    female: boolean = true
  ) {
    console.log('updateCityTooltips',solo,group,auction)
    const citiesWithExhibitions = await fetchExhibitionsByCityAndCountry(
      exhibition_start_date,
      exhibition_end_date,
      birthdateFrom,
      birthdateTo,
      deathdateFrom,
      deathdateTo,
      solo,
      group,
      auction,
      male,
      female);
    const exhibitionCounts = new Map<string, number>();
    const soloCounts = new Map<string, number>();
    const groupCounts = new Map<string, number>();
    const auctionCounts = new Map<string, number>();
    const paintingsCounts = new Map<string, number>();
    const artistCounts = new Map<string, number>();
    const malePercs = new Map<string, number>();
    const femalePercs = new Map<string, number>();
    const earliest_year = new Map<string, number>();
    const latest_year = new Map<string, number>();
  
    for (const row of citiesWithExhibitions) {
      exhibitionCounts.set(row['city'], row['exhibition_count']);
      soloCounts.set(row['city'], row['solo_count']);
      groupCounts.set(row['city'], row['group_count']);
      auctionCounts.set(row['city'], row['auction_count']);
      paintingsCounts.set(row['city'], row['paintings_count']);
      artistCounts.set(row['city'], row['artist_count']);
      malePercs.set(row['city'], row['male_percentage']);
      femalePercs.set(row['city'], row['female_percentage']);
      earliest_year.set(row['city'], row['earliest_year']);
      latest_year.set(row['city'], row['latest_year']);
    }
    console.log('exhibitionCounts',exhibitionCounts);
    console.log('artistCounts',artistCounts);
    console.log('malePercentages',malePercs);
    
    attachTooltip(
      countries.selectAll("circle"),
      d => {
        const exhibitionCount = exhibitionCounts.get(d.city) || 0;
        const soloCount = soloCounts.get(d.city) || 0;
        const groupCount = groupCounts.get(d.city) || 0;
        const auctionCount = auctionCounts.get(d.city) || 0;
        const paintingsCount = paintingsCounts.get(d.city) || 0;
        const artistCount = artistCounts.get(d.city) || 0;
        const malePerc = malePercs.get(d.city) || 0;
        const femalePerc = femalePercs.get(d.city) || 0;
        const earliest = earliest_year.get(d.city) || undefined;
        const latest = latest_year.get(d.city) || undefined;
        return `<strong>City:</strong> ${d.city}<br>
      <strong>Exhibitions:</strong> ${exhibitionCount} (<strong>Solo:</strong> ${soloCount} | <strong>Group:</strong> ${groupCount} | <strong>Auction:</strong> ${auctionCount})<br>
      <strong>Paintings:</strong> ${paintingsCount}<br>
      <strong>Artists:</strong> ${artistCount} (<strong>Male:</strong> ${malePerc}% | <strong>Female:</strong> ${femalePerc}%)<br>
      <strong>Earliest:</strong> ${earliest} <strong>Latest:</strong> ${latest}<br>`
      }
    ); 
  }

  /**
   * Updates the choropleth map with exhibition data based on the provided filters.
   *
   * @param {bigint} exhibition_start_date - The start year for the exhibition filter.
   * @param {bigint} exhibition_end_date - The end year for the exhibition filter.
   * @param {Date} birthdate_from - The start date for the birthdate filter.
   * @param {Date} birthdate_to - The end date for the birthdate filter.
   * @param {Date} deathdate_from - The start date for the deathdate filter.
   * @param {Date} deathdate_to - The end date for the deathdate filter.
   * @param {boolean} solo - Filter for solo exhibitions.
   * @param {boolean} group - Filter for group exhibitions.
   * @param {boolean} auction - Filter for auction exhibitions.
   * @param {boolean} male - Filter for male artists.
   * @param {boolean} female - Filter for female artists.
   *
   * @returns {Promise<void>} - A promise that resolves when the choropleth map update is complete.
   */
  async function updateChoroplethMap(exhibition_start_date: bigint = 1902n,
                                     exhibition_end_date: bigint = 1916n,
                                     birthdate_from: Date,
                                     birthdate_to: Date,
                                     deathdate_from: Date,
                                     deathdate_to: Date,
                                     solo: boolean = true,
                                     group: boolean = true,
                                     auction: boolean = true,
                                     male: boolean = true,
                                     female: boolean = true) {
    console.log('updateChoroplethMap',exhibition_start_date, exhibition_end_date, solo,group,auction)
    const countriesWithExhibitions = await fetchCountriesWithExhibitions(
      exhibition_start_date,
      exhibition_end_date,
      birthdate_from,
      birthdate_to,
      deathdate_from,
      deathdate_to,
      solo,
      group,
      auction,
      male,
      female);
    
      const countryNames = new Map<string, number>();
      const exhibitionCounts = new Map<string, number>();
      const soloCounts = new Map<string, number>();
      const groupCounts = new Map<string, number>();
      const auctionCounts = new Map<string, number>();
      const paintingsCounts = new Map<string, number>();
      const artistCounts = new Map<string, number>();
      const malePercs = new Map<string, number>();
      const femalePercs = new Map<string, number>();
      const earliest_year = new Map<string, number>();
      const latest_year = new Map<string, number>();

    for (const row of countriesWithExhibitions) {
      countryNames.set(translate_iso_to_geojson(row['country']), row['country']);
      exhibitionCounts.set(translate_iso_to_geojson(row['country']), row['exhibition_count']);
      soloCounts.set(translate_iso_to_geojson(row['country']), row['solo_count']);
      groupCounts.set(translate_iso_to_geojson(row['country']), row['group_count']);
      auctionCounts.set(translate_iso_to_geojson(row['country']), row['auction_count']);
      paintingsCounts.set(translate_iso_to_geojson(row['country']), row['paintings_count']);
      artistCounts.set(translate_iso_to_geojson(row['country']), row['artist_count']);
      malePercs.set(translate_iso_to_geojson(row['country']), row['male_percentage']);
      femalePercs.set(translate_iso_to_geojson(row['country']), row['female_percentage']);
      earliest_year.set(translate_iso_to_geojson(row['country']), row['earliest_year']);
      latest_year.set(translate_iso_to_geojson(row['country']), row['latest_year']);
    }

    const color_c = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(Array.from(exhibitionCounts.values()).map(v => Number(v))) || 0]);

    countries.selectAll("path")
      .attr("fill", d => {
        const count = exhibitionCounts.get(d.id) || 0;
        return color_c(Number(count));
      });

      updateCountryTooltips(countries, countryNames, exhibitionCounts, soloCounts, groupCounts,
        auctionCounts, paintingsCounts, artistCounts, malePercs, femalePercs, earliest_year, latest_year);

    // Update the legend
    svg.select("g.legend").remove();
    svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(10,20)")
      .call(legendColor()
        .scale(color_c)
        .shapeWidth(200)
        .orient("horizontal")
        .labelFormat(d3.format(".0f")));
  }

  return {
    element: svg.node()!,
    update,
    update_coordinates,
    updateChoroplethMap,
    updateCityTooltips
  };

}

/**
 * Attaches tooltip behavior to a D3 selection.
 * Enables displaying dynamic tooltips when a user hovers over elements in a D3 visualization.
 *
 * @param {d3.Selection<d3.BaseType, any, any, any>} selection - 
 *        The D3 selection to which the tooltip behavior will be attached. 
 *        This selection represents SVG elements (e.g., `path`, `circle`, `rect`) 
 *        that respond to mouse events.
 * 
 * @param {function(any): string} onMouseOverHtml - 
 *        A callback function that generates the HTML content for the tooltip.
 *        Takes the data object (`d`) bound to the hovered element as input
 *        and returns a string containing the tooltip's HTML.
 * 
 * Behavior:
 * - Mouse Events:
 *   - `mouseover`: 
 *        Updates the tooltip content using the `onMouseOverHtml` function and makes it visible.
 *   - `mousemove`: 
 *        Dynamically positions the tooltip near the mouse cursor.
 *   - `mouseout`: 
 *        Hides the tooltip when the mouse leaves the element.
 * - Tooltip Styling:
 *   - Tooltip position is dynamically adjusted based on the mouse cursor's `pageX` and `pageY`.
 *   - Tooltip visibility and content are managed through inline styles and HTML updates.
 */
function attachTooltip(
  selection: d3.Selection<d3.BaseType, any, any, any>,
  onMouseOverHtml: (d: any) => string
) {
  const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("border", "1px solid black")
  .style("padding", "5px")
  .style("border-radius", "5px")
  .style("visibility", "hidden")
  .style("pointer-events", "none");

  selection
    .on("mouseover", (event, d) => {
      tooltip
        .html(onMouseOverHtml(d))
        .style("visibility", "visible");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", `${event.pageY + 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
}

function updateCountryTooltips(countries: d3.Selection<d3.SVGElement, any, any, any>,
  countryNames: Map<string, number>,
  exhibitionCounts: Map<string, number>,
  soloCounts: Map<string, number>,
  groupCounts: Map<string, number>,
  auctionCounts: Map<string, number>,
  paintingsCounts: Map<string, number>,
  artistCounts: Map<string, number>,
  malePercs: Map<string, number>,
  femalePercs: Map<string, number>,
  earliest_year: Map<string, number>,
  latest_year: Map<string, number>
) {
  attachTooltip(
    countries.selectAll("path"),
    d => {
      const country = countryNames.get(d.id) || 0;
      const exhibitionCount = exhibitionCounts.get(d.id) || 0;
      const soloCount = soloCounts.get(d.id) || 0;
      const groupCount = groupCounts.get(d.id) || 0;
      const auctionCount = auctionCounts.get(d.id) || 0;
      const paintingsCount = paintingsCounts.get(d.id) || 0;
      const artistCount = artistCounts.get(d.id) || 0;
      const malePerc = malePercs.get(d.id) || 0;
      const femalePerc = femalePercs.get(d.id) || 0;
      const earliest = earliest_year.get(d.id) || undefined;
      const latest = latest_year.get(d.id) || undefined;
      return `<strong>Country:</strong> ${country}<br>
    <strong>Exhibitions:</strong> ${exhibitionCount} (<strong>Solo:</strong> ${soloCount} | <strong>Group:</strong> ${groupCount} | <strong>Auction:</strong> ${auctionCount})<br>
    <strong>Paintings:</strong> ${paintingsCount}<br>
    <strong>Artists:</strong> ${artistCount} (<strong>Male:</strong> ${malePerc}% | <strong>Female:</strong> ${femalePerc}%)<br>
    <strong>Earliest:</strong> ${earliest} <strong>Latest:</strong> ${latest}<br>`
    }
  );
}
