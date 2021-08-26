class AlgoThread {


	/*static get VISIT_LINK_DELAY(){
		return this._VISIT_LINK_DELAY;
	}
	static get VISIT_DELAY(){
		return this._VISIT_DELAY;
	}
	static get CHOOSE_DELAY(){
		return this._CHOOSE_DELAY;
	}
	static get COLLIDE_DELAY(){
		return this.COLLIDE_DELAY;
	}*/

	constructor(head, adj, nodes){
		this.VISIT_LINK_DELAY = 25;
		this.VISIT_DELAY = 50;
		this.CHOOSE_DELAY = 50;
		this.COLLIDE_DELAY = 500;


		this.adj = adj;
		this.nodes = nodes;

		head.state = "visited";
		head.base = head;
		head.depth = 0;
		this.queue = [head];
		this.head = head;
		this.completed = false;
		this.current_depth = 0;
		this.best_end_node = null;
	}

	get_total_length(node){
		if (node === undefined || node == null) return Infinity;
		let total = 0;
		for (let i in node.parents){
			let parent = node.parents[i];
			total += 1 + parent.depth;
		}
		console.log("TOTAL LENGTH:",total);
		return total;
	}
	visit(node,from_node){
		if (node.__data__ != undefined) node = node.__data__;
		if (from_node.__data__ != undefined) from_node = from_node.__data__;
		node.depth = from_node.depth + 1;
		node.parents.push(from_node);
		node.base = from_node.base;

		let link = this.adj.adj.get(from_node.index,node.index);
		link.__data__.state = "visited";
	}
	get_node_by_index(index){
		return this.nodes.get_by_index(index);
	}
	get_adjacent_nodes(index){
		let d = this.adj.adj.get(index);
		let arr = [];

		for (let key in d){
			let link = d[key];
			let other_node_index = link.__data__.target.index == index ? link.__data__.source.index : link.__data__.target.index;
			arr.push(this.get_node_by_index(other_node_index));
		}
		return arr;
	}
	async select_path(node){
		return new Promise( async (resolve, reject) => {
			let promises = [];
			if (node === undefined) return;
			if (node.__data__ != undefined) node = node.__data__;
			node.state = "chosen";
			ticked();
			await sleep(this.CHOOSE_DELAY);
			for (let i in node.parents){
				let parent = node.parents[i];
				let link = this.adj.adj.get(parent.index,node.index);
				link.__data__.state = "chosen";
			}

			ticked();
			await sleep(this.CHOOSE_DELAY);
			for (let i in node.parents){
				let parent = node.parents[i];

				promises.push(this.select_path(parent));
			}
			node = node.parent;

			await Promise.all(promises).then(() => {
				resolve(true);
			})
		});
	}
}
class BFSThread extends AlgoThread {

	async bfs_one_level(bfs_queues){
		return new Promise( async (resolve, reject) => {
			while(this.queue.length > 0 && !this.completed){
				if (this.queue[0].depth > this.current_depth){
					this.current_depth+=1;
					return resolve(true);
				}

				let n = this.queue.shift();
				if (n.__data__ != undefined) n = n.__data__;
				//get adjacent nodes
				let adjacent_nodes = shuffle(this.get_adjacent_nodes(n.index));
				for (let i in adjacent_nodes){
					if (this.completed) break;

					let node = adjacent_nodes[i];
					if (node.__data__ != undefined) node = node.__data__;
					//console.log("MY NODE:",node);
					if (node.state === undefined){
						node.state = "normal";
					}
					if (node.state != "visited"){
						this.visit(node,n);
						ticked();
						await sleep(this.VISIT_LINK_DELAY);

						this.queue.push(node);
						node.state = "visited";
						ticked();
						await sleep(this.VISIT_DELAY);
					}
					else{ //visited, check if it is visited by another base
						if (node.base != n.base){
							//TO DO, maintain best intersection nodes

							let update_queue = bfs_queues[node.base.index];
							if (update_queue.completed) return resolve(true);
							update_queue.completed = true;
							this.best_end_node = node;

							node.parents.push(n);
							if (!this.completed){
								this.completed = true;
								let link = this.adj.adj.get(n.index,node.index);
								link.__data__.state = "visited";
							}




							//TODO only set completed on multi if allowed


							ticked();
							node.state = "collided";
							await sleep(this.VISIT_DELAY);
							ticked();
							await sleep(this.COLLIDE_DELAY);
							ticked();


							return resolve(true);
						}
					}
				}
			}
			this.completed = true;
			return resolve(true);
		});

	}


}

class DFSThread extends AlgoThread{
	constructor(head, adj, nodes){
		super(head,adj,nodes);
		this.VISIT_LINK_DELAY = this.VISIT_LINK_DELAY*2;
		this.VISIT_DELAY = this.VISIT_DELAY*2;
	}


	async dfs(n, threads){
		return new Promise( async (resolve, reject) => {
			if (n != undefined && n.__data__ != undefined) n = n.__data__;
			if (n === undefined) return;
			if (this.completed) return resolve(true);
			this.current_node = n;

			//get adjacent nodes
			let adjacent_nodes = shuffle(this.get_adjacent_nodes(n.index));
			for (let i in adjacent_nodes) {
				if (this.completed) break;


				let node = adjacent_nodes[i];
				if (node.state != "visited") {
					this.visit(node, n);
					ticked();
					await sleep(this.VISIT_LINK_DELAY);
					node.state = "visited";
					ticked();
					await sleep(this.VISIT_DELAY);
					if (this.completed) break;
					await this.dfs(node, threads);
				} else {
					if (node.base != n.base) {
						let update_thread = threads[node.base.index];
						if (update_thread.completed) return resolve(true);
						update_thread.completed = true;
						this.best_end_node = node;

						node.parents.push(n);
						if (!this.completed) {
							this.completed = true;
							let link = this.adj.adj.get(n.index, node.index);
							link.__data__.state = "visited";
						}

						ticked();
						node.state = "collided";
						await sleep(this.VISIT_DELAY);
						ticked();
						await sleep(this.COLLIDE_DELAY);

						return resolve(true);
					}
				}
			}
			if (n == this.head) this.completed = true;
			return resolve(true);

		});
	}
}