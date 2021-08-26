class AdjacencyDict {
	constructor(links){
		this.dict = {};
		for (let i in links){
			let link = links[i];
			//console.log("LINK DATA:",link.__data__);
			this.set(link.__data__.source.index,link.__data__.target.index,link);
		}
	}

	includes(link){
		let start_index = link.__data__.source.index;
		let end_index = link.__data__.target.index;
		return this.get(start_index,end_index) != false || this.get(end_index,start_index) != false;
	}

	get(start,end){
		//console.log("ADJ:",this.dict);
		//state check
		if (start === undefined) return;
		if (this.dict[start] === undefined){
			this.dict[start] = {};
		}

		//state get
		if (end === undefined){
			return this.dict[start];
		}
		else {
			if (this.dict[start][end] === undefined){
				return false;
			} 
			return this.dict[start][end];
		}

	}
	set(start,end,val){
		let d = this.get(start);
		let d_rev = this.get(end);
		if (val != false){ // set to true
			d[end] = val;
			d_rev[start] = val;
		}
		else {
			delete d[end];
			delete d_rev[start];
			console.log("D remaining:",Object.keys(d).length);
			if (Object.keys(d).length == 0){
				delete this.dict[start];
			}
			if (Object.keys(d_rev).length == 0){
				delete this.dict[end];
			}
		}

	}
	push(link){
		let start_index = link.__data__.source.index;
		let end_index = link.__data__.target.index;

		this.set(start_index,end_index,link);
		this.set(end_index,start_index,link);
	}
	remove(link){
		let start_index = link.__data__.source.index;
		let end_index = link.__data__.target.index;
		this.set(start_index,end_index,false);
		this.set(end_index,start_index,false);
	}
}

class Adjacencies {
	constructor(links){
		this.links = links;
		this.adj = new AdjacencyDict(links);
	}
	push(link, force){ //{source, target}


		console.log("CHECKING:", link, " IN:",this.links);
		if (force != undefined && force){
			this.adj.push(link);
			this.links.push(link);
			return true;
		}
		
		
		if (!this.adj.includes(link)){
			this.push(link,true);
		}
		

		return false;
	}
	filter(fn){
		return this.links.filter(fn);
	}
	splice(link){
		let index = this.links.indexOf(link);
		this.adj.remove(link);
		this.links.splice(index, 1);
		
	}

	//remove(link){

		//return true;
		//return false;

	//}
	get(){
		return this.links;
	}
	//TODO perform undos
	reset(){
		this.links.forEach( link =>{
			link.__data__.state = "normal";
		})
		ticked();
	}

}