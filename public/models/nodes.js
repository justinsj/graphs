class Nodes {
	constructor(nodes){
		this.graph_nodes = nodes;
		this.nodes = {};
		for (let i in nodes){
			let node = nodes[i];
			//console.log("ADDING:",node);
			if (node.__data__ != undefined) node = node.__data__;
			this.nodes[node.index] = node;
		}
		//console.log("NODES in NODES:",this.nodes);

	}
	get_random_node(){
		let keys = Object.keys(this.nodes);
		return this.get_by_index(keys[Math.floor(Math.random() * keys.length)]);
	}
	get length(){
		return this.graph_nodes.length;
	}
	push(node){
		if (node.__data__ != undefined) node = node.__data__;
		this.nodes[node.index] = node;
		return this.graph_nodes.push(node);
	}
	remove(node){
		if (node.__data__ != undefined) node = node.__data__;
		delete this.nodes[node.index];
	}
	splice(node){
		this.graph_nodes.splice(this.graph_nodes.indexOf(node),1);
		this.remove(node);
	}
	get_by_index(index){
		return this.nodes[index];
	}
	//TODO perform undos
	reset(){

		this.graph_nodes.forEach( node =>{
			if (node.__data__ != undefined) node = node.__data__;
			node.state = "normal";
			node.parents = [];
			node.base = undefined;
		})
		ticked();
	}
}