var augPaths = [];
function getBfsPath(t, parent_map) {
    var path = [];
    var v = t;
    while (v != -1) {
        path.push(v);
        v = parent_map.get(v);
    }
    return path.reverse();
}

function animate(path, i) {
    if (i == path.length - 1) return;
    var edge = cy2.edges().getElementById(path[i] + "_" + path[i + 1]);
    console.log(edge);
    edge.addClass('highlighted');
    setTimeout(() => { animate(path, i + 1) }, 1000);
}

/*
function animate_path(path) {
    // [1,3,4,5]
    for(var i = 0; i < path.length - 1; i++) {
        var edge = cy2.edges().getElementById("#" + path[i] + "_" + path[i+1]);
        edge.addClass('highlighted');
        setTimeout({}, 1000);
    }
}
*/