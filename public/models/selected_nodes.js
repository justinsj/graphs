class SelectNodes {
	static get MAX_NODES(){
		return 2;
	}
	constructor(){
		this.queue = [];
	}
	includes(obj){
		return this.queue.includes(obj);
	}
	get length(){
		return this.queue.length;
	}
	push(obj){
		if (obj == null) return;
		if (!this.queue.includes(obj)){
	      this.queue.push(obj);
	      if (this.queue.length > SelectNodes.MAX_NODES){
	        this.queue.shift(); // removes first obj
	      } 
	    }
	    else { // obj is already there, try to remove
	    	this.queue.splice(this.queue.indexOf(obj), 1);
	    }
	}
	shift(){
		return this.queue.shift();
	}
	pop(){
		return this.queue.pop();
	}
	get(){
		return this.queue;
	}
	clear(){
		this.queue = [];
	}
	is_empty(){
		return this.queue.length == 0;
	}
	is_full(){
		return this.queue.length == SelectNodes.MAX_NODES;
	}
}