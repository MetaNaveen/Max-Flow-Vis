function bfs(res, s, t) {
    var bfs_queue = new Queue();
    var parent_map = new Map();
    var visited = new Array(res.length);
    for(var i = 0; i < res.length; i++) visited[i] = false;
    bfs_queue.enqueue(s);
    visited[s] = true;
    parent_map.set(s, -1);
    while(!bfs_queue.isEmpty()) {
        var current = bfs_queue.front();
        bfs_queue.dequeue();
        for(var i = 0; i < res[current].length; i++) {
            if(res[current][i] > 0 && !visited[i]) {
                if(i == t) {
                    parent_map.set(i,current);
                    return parent_map;
                }
                bfs_queue.enqueue(i);
                visited[i] = true;
                parent_map.set(i,current);
            }
        }
    }
    return parent_map;
}

function init_residual() {
    var N = allNodes.length;
    var residual = new Array(N);
    for(var i = 0; i < N; i++) {
        residual[i] = new Array(N);
    }
    for(var i = 0; i < N; i++) {
        for(var j = 0; j <  N; j++) {
            residual[i][j] = inputGraph[i][j];
        }
    }
    return residual;
}

function init_flows() {
    var N = inputGraph.length;
    var current_flows = new Array(N);
    for (var i = 0; i < N; i++) current_flows[i] = new Array(N);
    for(var i = 0; i < N; i++) 
        for(var j = 0; j < N; j++) {
            current_flows[i][j] = 0;
        }
    return current_flows;
}

function edmonds_karp(inputGraph, s, t) {
    var current_flows = init_flows();
    var res = init_residual();
    algoStates.push([JSON.parse(JSON.stringify(current_flows)), JSON.parse(JSON.stringify(res)),                    new Map()]);
    var max_flow = 0;
    console.log(res, s, t);
    debugger;
    var parent_map = bfs(res, s, t);
    while(parent_map.has(t)) {
        var bottleneck = Number.MAX_SAFE_INTEGER;
        var v = t;
        while(parent_map.get(v) != -1) {
            var u = parent_map.get(v);
            bottleneck = Math.min(bottleneck, res[u][v]);
            v = u;
        }
        v = t;
        while(parent_map.get(v) != -1) {
            var u = parent_map.get(v);
            res[u][v] -= bottleneck;
            res[v][u] += bottleneck;
            if(inputGraph[u][v] > 0) current_flows[u][v] = inputGraph[u][v] - res[u][v];
            if(inputGraph[v][u] > 0) current_flows[v][u] = inputGraph[v][u] - res[v][u];
            v = u;
        }
        algoStates.push([JSON.parse(JSON.stringify(current_flows)), JSON.parse(JSON.stringify(res)),                    parent_map]); 
        augPaths.push(parent_map);
        max_flow += bottleneck;
        parent_map = bfs(res, s, t);
    }
    return max_flow;
}