import "./style.css";
import * as d3 from "d3";
import {fetchArtistExhibitionLink, fetchBasicArtistInfos, fetchBasicExhbitionInfos} from "./queries";


interface Node {
    id: string;
    name: string;
    type: string;
    exhObjects: number;
}

interface Link {
    source: string;
    target: string;
}

interface Data {
    nodes: Node[];
    links: Link[];
}


export async function grahp_map() {
// set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

// Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
    let svg = d3
        .create("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

    function mapTypeToColor(type: string): string {
        switch (type) {
            case "artist":
                return "blue";
            case "solo":
                return "grey";
            case "auction":
                return "orange";
            case "group":
                return "yellow";
            default:
                console.log("Tpye ColConv", type);
                throw new Error(`Unknown type: ${type}`);
        }
    }

    async function loadGraphData(): Promise<Data> {
        try{
            const exhibitions =  await fetchBasicExhbitionInfos();
            const artists =  await fetchBasicArtistInfos();
            const artistExhibitionlinks = await fetchArtistExhibitionLink();

            let nodeList : Node[] = [];
            let linkList : Link[] = [];
            let dataContainer : Data = {
                nodes: nodeList,
                links: linkList
            }

            console.log("Nr. Exhibitions ", exhibitions.numRows, "Nr. Artists ", artists.numRows, "Nr. Links ", artistExhibitionlinks.numRows);

            for (const exhibit of exhibitions) {
                let singleNode : Node = {
                    id : exhibit['e.id'],
                    name : exhibit['e.title'],
                    type : mapTypeToColor(exhibit['e.type']),
                    exhObjects : 0
                }
                nodeList.push(singleNode);
            }

            for (const artist of artists) {
                let singleNode : Node = {
                    id : artist['a.id'],
                    name : artist['a.lastname'] + ' ' + artist['a.firstname'] ,
                    type : mapTypeToColor('artist'),
                    exhObjects : 0
                }
                nodeList.push(singleNode);
            }

            for (const artistExhibitonLink of artistExhibitionlinks) {
                let singleLink : Link = {
                    source : artistExhibitonLink['e.id'],
                    target : artistExhibitonLink['a.id']
                }
                linkList.push(singleLink);
            }

            dataContainer = {
                nodes: nodeList,
                links: linkList
            }
            return dataContainer;
        } catch (error) {
            console.error("Error loading graph data: ", error);
            throw error;
        }
    }

    const data = await loadGraphData();
    console.log("data ", data);

    const links = data.links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));

// Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    svg.append("g");

// Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", d => d.source.length * 100);

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

    //simulation.gravity(0);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        nodeTexts.attr("x", d => d.x);
        nodeTexts.attr("y", d => d.y);

        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("cx", function (d) {
                return d.x + 6;
            })
            .attr("cy", function (d) {
                return d.y - 6;
            });
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
    //   invalidation.then(() => simulation.stop());

    return {
        element: svg.node()!
    };
}


