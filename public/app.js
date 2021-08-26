var width = window.innerWidth;
var height = window.innerHeight;

var color = d3.scaleOrdinal(d3.schemeCategory10);
STARTED = false;
let graph_type = "HEX";
let algo_type = "BFS";

function get_algorithm(link, node, algo_type) {
	let my_links = new Adjacencies(link._groups[0]),
		my_nodes = new Nodes(node._groups[0]);

	let algorithm =  AlgorithmGenerator.Get(my_links,my_nodes,algo_type);
	return algorithm;
}

function Init(graph_type, algo_type) {
	let rows = 12;
	let cols = 8;

	let strength = -1000;
	let distance = 20;
	let link_strength = 1;


	switch (graph_type) {
		case "GRID":
			strength = -800;
			distance = 16;
			break;
		case "HEX":
			strength = -1500;
			distance = 10;
			link_strength = 2;
			rows = 8;
			cols = 6;
			break;
	}
	let svg = d3.select("#viz")
	svg.selectAll("*").remove();
	let graph = GraphGenerator.get({type: graph_type, rows: rows, cols: cols});
	let graphLayout = d3.forceSimulation(graph.nodes)
		.force("link", d3.forceLink(graph.links).id(function (d) {
			return d.id;
		}).distance(distance).strength(link_strength))
		.on("tick", ticked);
	graphLayout
		.force("charge", d3.forceManyBody().strength(strength)) //-2000
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("x", d3.forceX(width / 2).strength(0.5))
		.force("y", d3.forceY(height / 2).strength(0.5))
	

	svg
		.attr("height", height)
		.on('contextmenu', () => {
			d3.event.preventDefault();
		})
	let container = svg.append("g");

	svg.call(
		d3.zoom()
			.scaleExtent([.1, 4])
			.on("zoom", function () {
				container.attr("transform", d3.event.transform);
			})
	);

	let link = container.append("g").attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter()
		.append("line")
		.attr("class", "link")


	let node = container.append("g").attr("class", "nodes")
		.selectAll("g")
		.data(graph.nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 10)

	node.on("mouseover", focus).on("mouseout", unfocus);

	node.call(
		d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
	);

	let selected_nodes = new SelectNodes(),
		mousedown_node = null,
		mouseup_node = null,
		dragging = false;

	let algorithm = get_algorithm(link, node, algo_type);

	d3.select(window)
		.on("keydown", keydown);
	node.on("mouseover", focus).on("mouseout", unfocus);

	return {graphLayout, container, link, node, selected_nodes, mousedown_node, dragging, algorithm};
}

var {graphLayout, container, link, node, selected_nodes, mousedown_node, dragging, algorithm} = Init(graph_type,algo_type);

function ticked() {
	if (node === undefined || link === undefined)return;
    node.call(updateNode);
    link.call(updateLink);

}



function resetMouseVars() {
  dragging = false;
  mousedown_node = null;
  mouseup_node = null;
}
function focus(d) {
}

function unfocus() {
}

function fixna(x) {
    if (isFinite(x)) return x;
    return 0;
}

function updateLink(link) {
    link.attr("x1", function(d) { return fixna(d.source.x); })
        .attr("y1", function(d) { return fixna(d.source.y); })
        .attr("x2", function(d) { return fixna(d.target.x); })
        .attr("y2", function(d) { return fixna(d.target.y); })
        .classed("link_visited", function(d) { return d.state === "visited"})
        .classed("link_chosen", function(d) { return d.state === "chosen"});
}

function updateNode(node) {
    node.attr("transform", function(d) {
        return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    })
    .classed("node_visited", function(d) { return d.state === "visited" })
    .classed("node_chosen", function(d) { return d.state === "chosen" })
    .classed("node_selected", function(d) { return selected_nodes.includes(d); })
    .classed("node_collided", function(d) { return d.state === "collided"});
}

function dragstarted(d) {
    if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
    mousedown_node = d;


}

function dragged(d) {
    let dist = Math.abs(mousedown_node.x - d3.mouse(this)[0]) + Math.abs(mousedown_node.y - d3.mouse(this)[1]);
    if (dist > 20){
      dragging = true;
      d.fx = d3.event.x;
      d.fy = d3.event.y;

    }


  }

  function svg_drag(d){
	var r = {
        x: d3.event.x,
        y: d3.event.y
    };
    container.attr("transform","rotate("+r.x+","+origin.x+","+origin.y+")");

  }


function dragended(d) {
    if (!d3.event.active) graphLayout.alphaTarget(0);
    d.fx = null;
    d.fy = null;

    if (d.id == mousedown_node.id) {
      if (d != null && !dragging && !STARTED){
        selected_nodes.push(d);
      }
    }
    ticked();
    resetMouseVars();
}


async function start_demo(){
	if (STARTED) return;
	STARTED = true;
	await algorithm.run(selected_nodes);
    STARTED = false;
}
async function keydown() {
	switch (d3.event.keyCode) {
	    case 13: { // enter
	    	start_demo();
	    	break;
	    }
	    case 27: { //escape
			if (STARTED) return;
				selected_nodes.clear();
				ticked();
			break;
	    }
	}
}

demo_modal = document.getElementById("demo-modal");
async function close_demo_modal(){
	demo_modal.style.display = "none";
}

async function open_demo_modal(){
	demo_modal.style.display = "block";
}


let select_structure = document.getElementById("select-structure");
let select_algorithm = document.getElementById("select-algorithm");



function demo_select_structure(graph_type){
	let algo_type = select_algorithm.innerHTML;
	select_structure.innerHTML = graph_type; //update text

	console.log("NODE:",node);
	var obj = Init(graph_type,algo_type);
	console.log(node);
	graphLayout = obj.graphLayout;
	container = obj.container;
	link = obj.link;
	node = obj.node;
	selected_nodes = obj.selected_nodes;
	mousedown_node = obj.mousedown_node;
	dragging = obj.dragging;
	algorithm = obj.algorithm;
}


function demo_select_algorithm(algo_type){
	select_algorithm.innerHTML = algo_type; //update text

	algorithm = get_algorithm(link,node, algo_type);

}

