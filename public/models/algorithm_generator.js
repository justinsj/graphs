class AlgorithmGenerator {

    static Get(adj,nodes,algo_type){
        let algorithm;
        switch (algo_type){
            case "BFS":
                algorithm = new BFSAlgorithm(adj,nodes);
                break;
            case "DFS":
                algorithm = new DFSAlgorithm(adj,nodes);
                break;
            default:
                console.error("Unknown algo type" + algo_type);
                break;
        }
        return algorithm;
    }
}