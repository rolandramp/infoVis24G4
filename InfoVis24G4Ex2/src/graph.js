//graph.js
import "./style.css";
import * as d3 from "d3";
import {fetchArtistExhibitionLink, fetchBasicArtistInfos, fetchBasicExhbitionInfos} from "./queries";

export async function artistExhibitionGraph() {

    // Random data:
    let graph = {nodes: [], links: []}
    const width = 800;
    const height = 600;

    async function randomizeData(
        graph,
        birthdate_from,
        birthdate_to,
        deathdate_from,
        deathdate_to,
        solo = true,
        group = true,
        auction = true,
        male = true,
        female = true) {
        // generate nodes:
        let n = Math.floor(Math.random() * 10) + 6;


        console.log("Load Graph Data ..");
        const exhibitions = await fetchBasicExhbitionInfos(
            birthdate_from,
            birthdate_to,
            deathdate_from,
            deathdate_to,
            solo,
            group,
            auction,
            male,
            female);
        const artists = await fetchBasicArtistInfos(
            birthdate_from,
            birthdate_to,
            deathdate_from,
            deathdate_to,
            solo,
            group,
            auction,
            male,
            female
        );
        const artistExhibitionlinks = await fetchArtistExhibitionLink(
            birthdate_from,
            birthdate_to,
            deathdate_from,
            deathdate_to,
            solo,
            group,
            auction,
            male,
            female
        );

        console.log("Nr. Exhibitions ", exhibitions.numRows, "Nr. Artists ", artists.numRows, "Nr. Links ", artistExhibitionlinks.numRows);
        console.log("Exhibitions ", exhibitions);
        console.log("Artists ", artists);
        console.log("Links ", artistExhibitionlinks);


        let newNodes = [];

        for (const exhibit of exhibitions) {
            // if (graph.nodes[i]) newNodes.push(graph.nodes[i]);
            // else
            newNodes.push({
                id: exhibit['e.id'],
                name: exhibit['e.title'],
                type: mapTypeToColor(exhibit['e.type']),
                exhObjects: 0
            });
        }

        for (const artist of artists) {
            newNodes.push({
                id: artist['a.id'],
                name: artist['a.lastname'] + ' ' + artist['a.firstname'],
                type: mapTypeToColor('artist'),
                exhObjects: 0
            });
        }

        // generate links
        let newLinks = [];
        for (const artistExhibitonLink of artistExhibitionlinks) {
            newLinks.push({
                source: artistExhibitonLink['e.id'],
                target: artistExhibitonLink['a.id']
            });
        }

        console.log("New Nodes ", newNodes, "New Links ", newLinks);
        return {nodes: newNodes, links: newLinks}
    }

    console.log("------ BIN DA 1-------");

// On with main code:

// Set up the structure:
    let svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }).strength(0.004))
        .force("charge", d3.forceManyBody())
        // to attract nodes to center, use forceX and forceY:
        .force("x", d3.forceX().x(width / 2).strength(0.01))
        .force("y", d3.forceY().y(height / 2).strength(0.01));

    console.log("------ BIN DA 2------- ", graph);

    const nodeG = svg.append("g").attr("class", "nodes")
    const linkG = svg.append("g").attr("class", "links")

// Two variables to hold our links and nodes - declared outside the update function so that the tick function can access them.
    var links;
    var nodes;

// Update based on data:
    function update() {

        nodes = nodeG.selectAll("g").data(graph.nodes, d => d.id); // Bind based on unique ID
        nodes.exit().remove(); // Remove old

        let newnodes = nodes
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        newnodes.append("circle")
            .attr("r", function (d) {
                return (10)
            })
            .attr("fill", function (d) {
                return d.type;
            })

        newnodes.append("text")
            .text(function (d) {
                return d.name;
            })
            .attr('x', 6)
            .attr('y', 3)
            .style("font-size", "15px");

        nodes = newnodes.merge(nodes); // Combine old + new

        links = linkG.selectAll("line").data(graph.links, d => `${d.source}-${d.target}`); // Unique ID for links
        links.exit().remove(); // Remove old
        let newlinks = links.enter().append("line"); // Add visuals for links
        links = newlinks.merge(links); // Combine old + new

        // Restart the simulation with new data
        simulation.nodes(graph.nodes).on("tick", ticked);
        simulation.force("link").links(graph.links);

        simulation.alpha(1).restart(); // Refresh layout
    }

    function mapTypeToColor(type) {
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

    console.log("------ BIN DA 3-------");

    function ticked() {
        links // the selection of all links:
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

        nodes
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    console.log("------ BIN DA 4-------");

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    console.log("------ BIN DA 5-------");

    async function renderNewGraph(
        birthdate_from,
        birthdate_to,
        deathdate_from,
        deathdate_to,
        solo,
        group,
        auction,
        male,
        female) {
        console.log("Render New Graph");
        graph = await randomizeData(graph,
            birthdate_from,
            birthdate_to,
            deathdate_from,
            deathdate_to,
            solo,
            group,
            auction,
            male,
            female);
        console.log("Render New Graph 2");
        update();
    }

    console.log("------ BIN DA 6-------");

    console.log("SVG Node: ", svg.node());
    return {element: svg.node(), renderNewGraph: renderNewGraph};
}

