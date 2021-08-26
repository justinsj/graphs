function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}



class Algorithm {
	constructor(adj,nodes){
		this.adj = adj;
		this.nodes = nodes;
	}
	get_random_node(){
		return this.nodes.get_random_node();
	}

	get_thread(head, adj, nodes){
		console.error("Called abstract function get_thread");
	}

	async process_single(head){
		console.error("Called abstract process_single in Algorithm");
	}

	async process_threads(keys, threads){
		console.error("Called abstract process_threads in Algorithm");
	}


	async run(selected_nodes){
		if (selected_nodes.is_empty()){
			while (!selected_nodes.is_full()){
				selected_nodes.push(algorithm.get_random_node());
			}
		}
		if (selected_nodes.length > 1){
			await this.multi_run(selected_nodes.get());
		}
		else {
			await this.single_run(selected_nodes.get()[0]);
		}
	}

	async multi_run(selected_nodes) {
		return new Promise(async (resolve, reject) => {
			this.nodes.reset();
			this.adj.reset();

			let {threads, keys} = this.get_threads(selected_nodes);

			await this.process_threads(keys, threads);

			//print result
			await this.process_results(keys, threads, resolve);

		});

	}

	async single_run(head){
		this.nodes.reset();
		this.adj.reset();

		await this.process_single(head);
	}

	get_threads(selected_nodes) {
		let threads = {};
		let keys = [];
		selected_nodes.forEach(node => {
			keys.push(node.index);
			threads[node.index] = this.get_thread(node, this.adj, this.nodes);
		})
		return {threads, keys};
	}

	async process_results(keys, threads, resolve) {
		let promises = [];
		for (let i in keys) {
			let key = keys[i];
			let thread = threads[key];
			if (thread.best_end_node != undefined) {
				promises.push(thread.select_path(thread.best_end_node));
			}
		}
		await Promise.all(promises).then(() => {
			resolve(true);
		})
	}
}

class DFSAlgorithm extends Algorithm {

	get_thread(head,adj,nodes){
		return new DFSThread(head,adj,nodes);
	}

	async process_threads(keys, threads) {
		let promises = [];
		for (let i in keys) {
			let key = keys[i];
			let thread = threads[key];
			promises.push(thread.dfs(thread.head, threads));
		}
		await Promise.all(promises);
	}

	async process_single(head) {
		let t = this.get_thread(head, this.adj, this.nodes);
		await t.dfs(head, [t]);
	}
}
class BFSAlgorithm extends Algorithm {

	get_thread(head,adj,nodes){
		return new BFSThread(head,adj,nodes);
	}

	async process_threads(keys, threads){
		while( !this.all_completed(threads)){
			await this.apply_bfs_queues_one_level(threads,keys);
		}
	}

	async apply_bfs_queues_one_level(threads,keys){
		return new Promise( async (resolve, reject) => {
			for (let i in keys){
				let key = keys[i];
				let thread = threads[key];
				await this.apply_bfs_one_level(thread,threads);
				
			}
			resolve(true);
		});
	}
	async apply_bfs_one_level(thread,threads){
		return new Promise( async (resolve, reject) => {
			await thread.bfs_one_level(threads);
			
			resolve(true);
		});
	}


	async process_single(node) {
		let thread = this.get_thread(node, this.adj, this.nodes);
		while (!thread.completed) {
			await thread.bfs_one_level();
		}
	}

	all_completed(threads){
		return Object.values(threads).reduce((t, obj)=>{
			return t && obj.completed;
		},true);
	}
}

