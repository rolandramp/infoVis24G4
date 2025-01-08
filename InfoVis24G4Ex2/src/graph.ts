import "./style.css";
import * as d3 from "d3";


// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);


// append the svg object to the body of the page
const svg = d3.select("#app")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);
const data  = {
    nodes: [
        { id: "MAK_191008", name: "MAK", type: "group", exhObjects: 0},
        { id: "Guggenheim_190001",name: "Guggenheim", type: "solo", exhObjects: 0},
        { id: "Dorotheum_189508", name: "Dorotheum", type: "auction", exhObjects: 0},
        { id: "Louvre_190907", name: "Louvre", type: "group", exhObjects: 0},
        { id: "Louvre_189911", name: "Louvre", type: "group", exhObjects: 0},
        { id: "MOMA_189911", name: "MOMA", type: "solo", exhObjects: 0},
        { id: "Joe", name: "Joe", type: "artist", exhObjects: 5 },
        { id: "Alexander", name: "Alexander", type: "artist", exhObjects: 30},
        { id: "Letitia", name: "Letitia", type: "artist", exhObjects: 30},
        { id: "Gustav", name: "Gustav", type: "artist", exhObjects: 30},
        { id: "Ann", name: "Ann", type: "artist", exhObjects: 10}
    ],
    links:[
        { source: "MAK_191008", target: "Joe"},
        { source: "MAK_191008", target: "Ann"},
        { source: "Guggenheim_190001", target: "Joe"},
        { source: "Louvre_190907", target: "Joe"},
        { source: "Louvre_190907", target: "Letitia"},
        { source: "Louvre_189911", target: "Letitia"},
        { source: "Louvre_189911", target: "Joe"},
        { source: "Louvre_189911", target: "Alexander"},
        { source: "Louvre_189911", target: "Ann"},
        { source: "MOMA_189911", target: "Gustav"},
        { source: "Dorotheum_189508", target: "Alexander"}
    ]
};

const links = data.links.map(d => ({...d}));
const nodes = data.nodes.map(d => ({...d}));

// Create a simulation with several forces.
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);


// Add a line for each link, and a circle for each node.
const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", d => d.source.length*100);


const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 15)
    .attr("fill", d => color(d.type));

const nodeTexts = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text(d => d.name);

node.append("title")
    .text(d => d.id);

// Add a drag behavior.
node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

simulation.gravity(0);
// d3.json(data).then( function( data) {

    // Initialize the links
    // const link = svg
    //     .selectAll("line")
    //     .data(data.links)
    //     .join("line")
    //     .style("stroke", "#aaa")

    // Initialize the nodes
    // const node = svg
    //     .selectAll("circle")
    //     .data(data.nodes)
    //     .join("circle")
    //     .attr("r", 20)
    //     .style("fill", "#69b3a2")

    //Let's list the force we wanna apply on the network
    // const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
    //     .force("link", d3.forceLink()                               // This force provides links between nodes
    //         .id(function(d) { return d.id; })                     // This provide  the id of a node
    //         .links(data.links)                                    // and this the list of links
    //     )
    //     .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    //     .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
    //     .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        nodeTexts.attr("x", d => d.x);
        nodeTexts.attr("y", d => d.y);

        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function (d) { return d.x+6; })
            .attr("cy", function(d) { return d.y-6; });
    }

// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

// When this cell is re-run, stop the previous simulation. (This doesn’t
// really matter since the target alpha is zero and the simulation will
// stop naturally, but it’s a good practice.)
invalidation.then(() => simulation.stop());




