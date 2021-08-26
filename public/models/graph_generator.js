class GraphGenerator {
	constructor(){

	}
	static get(params){
		let type = params.type;
		let generator;
		switch (type){
			case "CROSS GRID":
				generator = new CrossGridGenerator(params);
				break;
			case "GRID":
			    generator = new GridGenerator(params);
				break;
			case "HEX":
			    generator = new HexGenerator(params);
				break;
			case "STAR":
				generator = new StarGenerator(params);
				break;
			default:
				console.error("Unknown graph type:",type);
				break;
		}
		return generator.get();
	}


}



class GridGenerator {
	constructor(params){
		this.rows = params.rows;
		this.cols = params.cols;
		this.graph_links = [];
		this.graph_nodes_dict = {};
	}
	get_index(i,j){
		return j + i*this.cols;
	}
	first_row_first_column(i,j,total_index){

	}
	first_row_other_column(i,j,total_index){
		this.graph_links.push({source:total_index, target:total_index-1}); //horizontal line
	}
	first_row_last_column(i,j,total_index){
		this.first_row_other_column(i,j,total_index);
	}
	other_row_first_column(i,j,total_index){
		this.graph_links.push({source:total_index, target:this.get_index(i-1,j)}); //vertical up
	}
	other_row_last_column(i,j,total_index){
		this.graph_links.push({source:total_index, target:total_index-1}); //horizontal line
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j)}); //vertical up

	}
	other_row_other_column(i,j,total_index){
		this.graph_links.push({source:total_index, target:total_index-1}); //horizontal line
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j)}); //vertical up
	}

	last_row_first_column(i,j,total_index){
		this.other_row_first_column(i,j,total_index);
	}
	last_row_last_column(i,j,total_index){
		this.other_row_last_column(i,j,total_index);
	}
	last_row_other_column(i,j,total_index){
		this.other_row_other_column(i,j,total_index);
	}
	get(){
		

		for (let i in [...Array(this.rows).keys()]){ //rows
		  for (let j in [...Array(this.cols).keys()]){ //colunns
		    i = parseInt(i), j = parseInt(j);
		    let total_index = this.get_index(i,j);
		    let FIRST_ROW = i == 0;
		    let FIRST_COLUMN = j == 0;
		    let LAST_ROW = i == this.rows-1;
		    let LAST_COLUMN = j == this.cols-1;
		    if (FIRST_ROW){
		      if (FIRST_COLUMN){
		        this.first_row_first_column(i,j,total_index);
		      } 
			  else if (LAST_COLUMN){
		        this.first_row_last_column(i,j,total_index);
		      }
		      else {
		        this.first_row_other_column(i,j,total_index);
		      }

		    }
		    else if (LAST_ROW) {
		      if (FIRST_COLUMN){
		        this.last_row_first_column(i,j,total_index);
		      } 
		      else if (LAST_COLUMN){
		        this.last_row_last_column(i,j,total_index);
		      }
		      else {
		        this.last_row_other_column(i,j,total_index);
		      }

		    }
		    else {
		      if (FIRST_COLUMN){
		        this.other_row_first_column(i,j,total_index);
		      } 
		      else if (LAST_COLUMN){
		        this.other_row_last_column(i,j,total_index);
		      }
		      else {
		        this.other_row_other_column(i,j,total_index);
		      }

		    }
		  }
		}

		let graph_nodes = this.render_nodes();

		return {
		  nodes:graph_nodes,
		  links:this.graph_links
		};
	}
	render_nodes(){
		this.graph_nodes_dict = {};
		for (let i in this.graph_links){
			let link = this.graph_links[i];
			link.source = this.graph_nodes_dict[link.source] ||
		        (this.graph_nodes_dict[link.source] = {index:link.source, state:"normal"});
		    link.target = this.graph_nodes_dict[link.target] ||
		        (this.graph_nodes_dict[link.target] = {index:link.target, state:"normal"});
		}

		let graph_nodes = [];
		for (let key in this.graph_nodes_dict){
		  let node = this.graph_nodes_dict[key];
		  graph_nodes.push(node);
		}
		return graph_nodes;
	}
}

class CrossGridGenerator extends GridGenerator {
	constructor(params){
		super(params);
	}
	first_row_first_column(i,j,total_index){
		super.first_row_first_column(i,j,total_index);

	}
	first_row_other_column(i,j,total_index){
		super.first_row_other_column(i,j,total_index);
	}
	other_row_first_column(i,j,total_index){
		super.other_row_first_column(i,j,total_index);
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j+1)}); //vertical forward
	}
	other_row_last_column(i,j,total_index){
		super.other_row_last_column(i,j,total_index);
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j-1)}); //vertical backward
	}
	other_row_other_column(i,j,total_index){
		super.other_row_other_column(i,j,total_index);
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j-1)}); //vertical backward
        this.graph_links.push({source:total_index, target:this.get_index(i-1,j+1)}); //vertical forward
	}
}

class HexGenerator extends GridGenerator {
	constructor(params){
		super(params);
	}
	odd_row(i){
		return i%2 == 1;
	}
	new_j(j){
		return j*2; // 1-->2, 2 -->4, 3-->6, 4-->8, ..
	}
	new_index(i,j){
		let modifier = 0;
		if (i!= 0 && i%2==0){//even
			modifier = -3;
		}
		return 2*j + i*(2*this.cols-1)+Math.floor(i/2)*4 + modifier;
	}
	first_row_first_column(i,j,total_index){
		//skip
	}
	first_row_other_column(i,j,total_index){
		let new_j = this.new_j(j);

		this.graph_links.push({source:new_j, target:new_j-1}); //horizontal line
		this.graph_links.push({source:new_j-1, target:new_j-2}); //horizontal line

	}
	//first_row_last_column(i,j,total_index){}
	other_row_first_column(i,j,total_index){
		let new_index = this.new_index(i,j);
		let new_j = this.new_j(j);
		if (this.odd_row(i)){
			if (i == 1){ //first odd row
				this.graph_links.push({source:new_index, target:this.new_index(i-1,j)}); //vertical line
			}
			else {
				this.graph_links.push({source:new_index, target:this.new_index(i-1,j)+1}); //vertical line
			}
		}
		else {
			this.graph_links.push({source:new_index,target:new_index-1}); // vert 1
			this.graph_links.push({source:new_index-1,target:this.new_index(i-1,j)}); // vert 2
		}
	}
	other_row_last_column(i,j,total_index){
		let new_index = this.new_index(i,j);
		this.other_row_other_column(i,j,total_index);
		if (this.odd_row(i)){
		}
		else {
			this.graph_links.push({source:new_index,target:new_index+1}); // rhs hex 1
			this.graph_links.push({source:new_index+1,target:new_index+2}); // rhs hex 2
			this.graph_links.push({source:new_index+2,target:new_index+3}); // rhs hex 3
			this.graph_links.push({source:new_index+3,target:this.new_index(i-1,j)}); // rhs hex 4
		}
	}
	other_row_other_column(i,j,total_index){
		let new_index = this.new_index(i,j);
		if (this.odd_row(i)){
			if (i == 1){ //first odd row
				this.graph_links.push({source:new_index, target:this.new_index(i-1,j)}); //vertical line
				
			}
			else {
				this.graph_links.push({source:new_index, target:this.new_index(i-1,j)+1}); //vertical line
			}
		}
		else {
			this.graph_links.push({source:new_index, target:this.new_index(i-1,j)-1}); //vertical line
			
		}
		this.graph_links.push({source:new_index, target:new_index-1}); //horizontal line
		this.graph_links.push({source:new_index-1, target:new_index-2}); //horizontal line
	}

	last_row_first_column(i,j,total_index){
		//TODO if even, do not put extra item
		
		this.other_row_first_column(i,j,total_index);
		
	}

}
