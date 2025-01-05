import * as d3 from "d3"
import {legendColor} from "d3-svg-legend"

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

export function world_map() {
  const width = 800;
  const height = 600;

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

  d3.json<GeoJson>("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(data) {
    if (data) {
      countries.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .on("click", clicked)
        .attr("d", d => path(d as any) || "")
        .attr("fill", "#67a598")
        .attr("stroke", "#fff");

    }
  })



  svg.call(zoom);

  // Append the legend.
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  svg.append("g")
    .attr("transform", "translate(10,20)")
    .call(legendColor().scale(color).title("Exibitions").shapeWidth(30).orient("vertical"));

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

  function update(data: { latitude: number, longitude: number }[]) {
    console.log(data);
    const circles = countries.selectAll('circle')
      .data(data, d => `${d.latitude},${d.longitude}`);

    // Remove old circles
    circles.exit().remove();

    // Update existing circles
    circles
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1]);

    // Add new circles
    circles.enter()
      .append('circle')
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1])
      .attr('r', 2)
      .attr('fill', 'blue');
  }

  return {
    element: svg.node()!,
    update
  };

}