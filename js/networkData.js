"use strict";

var s = null;
var t = null;
var allNodes = [];
var allEdges = [];
var algoStates = [];
var currentStep = 1;
var isNodeClicked = false;
var isEdgeClicked = false;
var isEdgeHandled = false;
var isOuterClicked = false;
var edgePoint1 = null;
var edgePoint2 = null;
// Input for algorithm
var inputGraph = [];
var source = null, sink = null;
var cy1 = null;
var cy2 = null;
var cyStyle = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            'background-color': 'red',
            label: 'data(id)',
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'lightblue',
            "text-valign": "center",
            "text-halign": "center"
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'label': 'data(customLabel)',
            'text-background-color': 'lightyellow',
            'text-background-opacity': 1,
            'width': '3px',
            'target-arrow-shape': 'triangle',
            'control-point-step-size': '70px'
        }
    },
    {
        selector: ':selected',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'blue'
        }
    },
    {
        selector: '.highlighted',
        style: {
            'background-color': '#5ebed6',
            'line-color': '#5ebed6',
            'target-arrow-color': '#5ebed6',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '2.0s'
        }
    }
]

function getNode(id) {
    // console.log(allNodes.length);
    for (var i = 0; i < allNodes.length; i++) {
        if (allNodes[i].id == id) {
            return allNodes[i];
        }
    }
    return null;
}

function getEdge(id) {
    for (var i = 0; i < allEdges.length; i++) {
        // console.log(allEdges);
        if (allEdges[i].id == id) {
            return allEdges[i];
        }
    }
    return null;
}

// Creates a new node with new ID (incremented)
function createNode(position) {
    if (isEdgeClicked || isNodeClicked) return;
    var newID = allNodes[allNodes.length - 1] ? +(allNodes[allNodes.length - 1].id) + 1 : 0;
    var data = {
        id: newID.toString(),
        x: position.x,
        y: position.y
    };
    var node = new Node(data);
    allNodes.push(node);
    return node;
}

// Creates edge between provided 2 node points
function createEdge(node1, node2) {
    console.log(node1, node2);
    if (node1.id === node2.id) return null;
    var id = node1.id + "_" + node2.id.toString();
    var existingEdge = getEdge(id);
    if (existingEdge) return null;
    var data = {
        id: id,
        source: node1.id.toString(),
        target: node2.id.toString(),
    };
    var edge = new Edge(data);
    console.log(edge);
    allEdges.push(edge);
    return edge;
}

function clearEdgePoints() {
    edgePoint1 = edgePoint2 = null;
}

function getInput(msg = "", defaultValue = "") {
    var input = prompt(msg, defaultValue);
    // alertify.alert('Ready!');
    return (input ? input : "");
}

function clearListeners() {
    cy1.removeListener("vclick");
    cy1.removeListener("vclick", "node");
    cy1.removeListener("vclick", "edge");
}

function finalizeGraph() {
    console.log(allNodes);
    console.log(allEdges);
    inputGraph = generateInputGraph();
    console.log(inputGraph);
    clearListeners();

    let source_id = "";
    let sink_id = "";
    Swal.fire({
        title: 'Source and Sink',
        input: 'text',
        inputPlaceholder: 'Enter source and sink node IDs',
        inputValue: "",

        inputValidator: (value) => {
            let error = "";
            let values = value.split(",");
            if (values.length !== 2) error = "Only two nodes are allowed!"
            source_id = values[0];
            sink_id = values[1];
            if (!error && source_id < 0) error = "Source node ID value should be positive";
            if (!error && sink_id < 0) error = "Sink node ID value should be positive";
            if (!error && !getNode(source_id)) error = "Invalid source node ID";
            if (!error && !getNode(sink_id)) error = "Invalid sink node ID";
            if (!error && !validateSourceAndSink(+source_id, +sink_id)) error = "Source/Sink should not have incoming/outgoing routes";
            return new Promise((resolve) => {
                if (error) {
                    resolve(error);
                } else {
                    resolve();
                }
            });
        },
        backdrop: true,
        showCancelButton: true,
    }).then((result) => {
        console.log(result);
        if (result.dismiss) {
            return;
        }
        if (result.value) {
            cy2 = cytoscape({
                container: document.getElementById('cy2'),
                elements: [],
                layout: {
                    name: 'preset'
                },
                style: cyStyle,
                wheelSensitivity: 0.5,
                userZoomingEnabled: true,
                minZoom: 0.1,
                maxZoom: 3,
            });

            allNodes.forEach(e => {
                var node = {
                    group: "nodes",
                    data: {
                        id: e.id.toString()
                    },
                    position: {
                        x: e.position.x,
                        y: e.position.y
                    }
                };
                cy2.add(node);
            });

            allEdges.forEach(e => {
                var edge = {
                    group: "edges",
                    data: {
                        id: e.id.toString(),
                        source: e.source,
                        target: e.target,
                        customLabel: e.totalCapacity
                    }
                };
                cy2.add(edge)
            });

            s = +source_id;
            t = +sink_id;
            var maxflow = edmonds_karp(inputGraph, s, t);
            console.log(maxflow);
            console.log(algoStates);
            document.getElementsByClassName("cy2buttons")[0].style.visibility = "visible";
        }
    });
}

function updateEdgeLabel(edgeId, label, cyObj = "cy1") {
    var elem = null;
    if (cyObj == "cy1") {
        elem = cy1.edges().getElementById(edgeId);
    }
    else {
        elem = cy2.edges().getElementById(edgeId);
    }
    elem.data().customLabel = label;
    elem.select();
    elem.unselect();
}

function addEdgeToGraph(edge) {
    var edgeData = {
        group: "edges",
        data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            customLabel: edge.totalCapacity
        }
    };
    cy2.add(edgeData);
}

function nextStep() {
    if (currentStep == algoStates.length) return;
    var current_state = algoStates[currentStep];
    var flows = current_state[0];
    var res = current_state[1];
    var parent_map = current_state[2];
    var prev_res = algoStates[currentStep - 1][1];
    var path = getBfsPath(parent_map);
    animate(path, 0);
    for (var i = 0; i < path.length - 1; i++) {
        let u = path[i];
        let v = path[i + 1];
        if (inputGraph[u][v] > 0) updateEdgeLabel(u + "_" + v, flows[u][v] + "/" + inputGraph[u][v]);
        if (inputGraph[v][u] > 0) updateEdgeLabel(v + "_" + u, flows[v][u] + "/" + inputGraph[v][u]);
    }
    setTimeout(() => {
        for (var i = 0; i < path.length - 1; i++) {
            let u = path[i];
            let v = path[i + 1];
            let uv = cy2.edges().getElementById(u + "_" + v);
            let vu = cy2.edges().getElementById(v + "_" + u);
            uv.removeClass("highlighted");
            if (res[u][v] == 0) uv.remove();
            else {
                updateEdgeLabel(u + "_" + v, "" + res[u][v], "cy2");
            }
            if (prev_res[v][u] > 0) updateEdgeLabel(v + "_" + u, res[v][u], "cy2");
            else {
                let edge = createEdge(getNode("" + v), getNode("" + u));
                addEdgeToGraph(edge);
            }
        }
    }, 5000);

    currentStep++;
}

function finalState() {
    cy2.edges().remove();
    console.log(cy2.edges());
    var finalState = algoStates[algoStates.length - 1];
    var final_flows = finalState[0];
    var final_res = finalState[1];
    allEdges = [];
    for (var i = 0; i < allNodes.length; i++) {
        for (var j = 0; j < allNodes.length; j++) {
            if (final_res[i][j] > 0) {
                var e = createEdge(getNode("" + i), getNode("" + j));
                var edge = {
                    group: "edges",
                    data: {
                        id: e.id.toString(),
                        source: e.source,
                        target: e.target,
                        customLabel: final_res[i][j]
                    }
                };
                cy2.add(edge);
            }
        }
    }
    for (var i = 0; i < allNodes.length; i++) {
        for (var j = 0; j < allNodes.length; j++) {
            if (inputGraph[i][j] > 0) {
                updateEdgeLabel(i + "_" + j, final_flows[i][j] + "/" + inputGraph[i][j], "cy1");
            }
        }
    }

}

function validateSourceAndSink(sourceNode, sinkNode) {
    console.log(sourceNode, sinkNode);
    for (var i = 0; i < allNodes.length; i++) {
        if (inputGraph[i][sourceNode] > 0) return false;
    }
    for (var j = 0; j < allNodes.length; j++) {
        if (inputGraph[sinkNode][j] > 0) return false;
    }
    return true;
}

function generateInputGraph() {
    // TODO: Make 2D matrix with 'allNodes' and 'allEdges' data in the format the algorithm requires.
    var N = allNodes.length;
    var graph = new Array(N);

    for (var i = 0; i < graph.length; i++) graph[i] = new Array(N);

    for (var i = 0; i < N; i++)
        for (var j = 0; j < N; j++)
            graph[i][j] = 0;

    for (var i = 0; i < allEdges.length; i++) {
        var edge = allEdges[i];
        var source = parseInt(edge.id[0], 10);
        var target = parseInt(edge.id[2], 10);
        graph[source][target] = edge.totalCapacity;
    }
    return graph;
}

function graphClick(event) {
    console.log("Cy object clicked");
    if (event.target !== cy1) return; // return, if the clicked position is not the graph region itself.
    console.log("Cy object processing...");
    if (isEdgeClicked) {
        console.log("Cancelling Cy processing as EDGE is clicked");
        isEdgeClicked = false;
        return;
    }
    if (isNodeClicked) {
        console.log("Cancelling Cy processing as NODE is clicked");
        isNodeClicked = false;
        clearEdgePoints();
        return;
    }
    console.log(event);
    clearEdgePoints();
    console.log("Position: ", event.position.x, ",", event.position.y);
    var node1 = createNode(event.position);
    if (node1) {
        var node1Data = {
            group: "nodes",
            data: {
                id: node1.id.toString()
            },
            position: {
                x: node1.position.x,
                y: node1.position.y
            }
        };
        var n = cy1.add(node1Data);
        console.log(n);
        // var layout = cy1.layout({
        //     name: 'grid'
        // });
        // layout.run();
        // console.log(cy1.nodes());

        // cy1.elements().qtip({
        //     content: function(){ return 'Example qTip on ele ' + this.id() },
        //     // position: {
        //     //     my: 'top center',
        //     //     at: 'bottom center'
        //     // },
        //     // style: {
        //     //     classes: 'qtip-bootstrap',
        //     //     tip: {
        //     //         width: 16,
        //     //         height: 8
        //     //     }
        //     // }
        // });
    }
}

function nodeClick(event) {
    console.log("Node clicked");
    console.log(edgePoint1, edgePoint2);
    var id = event.target.data().id;
    var elem = cy1.nodes().getElementById(id);
    // console.log(elem._private.selected);
    // if (elem._private.selected) {
    //     elem._private.selected = false;
    //     console.log("SELECTED");
    //     return;
    // }
    console.log(event, elem);
    if (event.target !== elem) return; // return, if the clicked position is not in Node element
    console.log("Node processing...");
    isNodeClicked = true;
    // Sets first and second node
    if (edgePoint1 == null) edgePoint1 = getNode(id);
    else {
        if (edgePoint2 == null) {
            edgePoint2 = getNode(id);
            var newEdge = createEdge(edgePoint1, edgePoint2);
            console.log(newEdge);
            if (edgePoint1.id === edgePoint2.id) {
                console.log("Edge cannot be created for same nodes.");
                edgePoint2 = null;
                return;
            }
            var capacity = "1"; // getInput("Capacity", 1);
            if (!capacity || capacity === "0" || capacity[0] === "-") capacity = 1;
            if (newEdge) {
                var edgeData = {
                    group: "edges",
                    data: {
                        id: newEdge.id,
                        source: newEdge.source,
                        target: newEdge.target,
                        customLabel: capacity ? "0/" + capacity : newEdge.customLabel
                    }
                };
                cy1.add(edgeData);
            }
            clearEdgePoints();
            cy1.nodes().forEach(element => {
                element.unselect();
            });
        } else {
            // resetting for new edge creation
            edgePoint2 = null;
            edgePoint1 = getNode(id);
        }
    }
    console.log(edgePoint1, edgePoint2);
}

function edgeClick(event) {
    // var capacity = getInput("Capacity", 1);
    // swal
    console.log("Edge clicked");
    var id = event.target.data().id;
    var elem = cy1.edges().getElementById(id);
    console.log(event, elem);
    if (event.target !== elem) return; // return, if the clicked position is not in Edge element
    console.log("Edge processing...");
    isEdgeClicked = true;

    var e = getEdge(id);
    Swal.fire({
        title: 'Capacity',
        input: 'text',
        inputPlaceholder: 'Enter Capacity',
        inputValue: e.totalCapacity,

        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (!value || value <= 0) {
                    resolve('Please enter positive integer value!');
                } else {
                    resolve();
                }
            });
        },
        backdrop: true,
        showCancelButton: true,
    }).then((result) => {
        console.log(result);
        if (result.dismiss) {
            return;
        }
        if (result.value) {
            if (e.totalCapacity != result.value) {
                console.log(elem.data());
                e.totalCapacity = parseInt(result.value, 10);
                e.customLabel = e.usedCapacity + "/" + e.totalCapacity;
                elem.data().customLabel = e.customLabel;
                console.log(e);
                console.log(elem.data());
                elem.unselect();
            }
        }
    });
}

function resetGraph() {

    allNodes = [];
    allEdges = [];
    algoStates = [];
    currentStep = 1;
    isNodeClicked = false;
    isEdgeClicked = false;
    isEdgeHandled = false;
    isOuterClicked = false;
    edgePoint1 = null;
    edgePoint2 = null;
    // Input for algorithm
    inputGraph = [];
    source = null, sink = null;
    let elem = document.getElementsByClassName("cy2buttons")[0].style;
    elem.visibility = "hidden";
    setTimeout(() => {
        clearListeners();
        cy1.on("vclick", graphClick);
        cy1.on("vclick", "node", nodeClick);
        cy1.on("vclick", "edge", edgeClick);
        cy1.elements().remove();
        if (cy2) cy2.elements().remove();
    }, 10);

}

document.addEventListener("DOMContentLoaded", function () {
    cy1 = cytoscape({
        container: document.getElementById('cy1'), // container to render in 
        // elements: [
        //     // nodes
        //     { data: { id: 'a' } },
        //     { data: { id: 'b' } },
        //     { data: { id: 'c' } },
        //     { data: { id: 'd' } },
        //     { data: { id: 'e' } },
        //     { data: { id: 'f' } },
        //     // edges
        //     {
        //         data: {
        //             id: 'ab',
        //             source: 'a',
        //             target: 'b'
        //         }
        //     },
        //     {
        //         data: {
        //             id: 'cd',
        //             source: 'c',
        //             target: 'd'
        //         }
        //     },
        //     {
        //         data: {
        //             id: 'ef',
        //             source: 'e',
        //             target: 'f'
        //         }
        //     },
        //     {
        //         data: {
        //             id: 'ac',
        //             source: 'a',
        //             target: 'c'
        //         }
        //     },
        //     {
        //         data: {
        //             id: 'be',
        //             source: 'b',
        //             target: 'e'
        //         }
        //     }
        // ],
        elements: allNodes,
        layout: {
            name: 'preset'
        },
        style: cyStyle,
        wheelSensitivity: 0.5,
        userZoomingEnabled: true,
        minZoom: 0.1,
        maxZoom: 3,
    });

    // Click event on Graph (ie.,. entire region used by cy1)
    cy1.on("vclick", graphClick);

    // Click event on Node element
    cy1.on("vclick", "node", nodeClick);

    // Click event on Edge element
    cy1.on("vclick", "edge", edgeClick);

    // Cy2
    // var cy2 = cytoscape({
    //     container: document.getElementById('cy2'), // container to render in 
    //     elements: allNodes,
    //     layout: {
    //         name: 'preset'
    //     },
    //     style: [
    //         {
    //             selector: 'node',
    //             style: {
    //                 shape: 'ellipse',
    //                 'background-color': 'red',
    //                 label: 'data(id)',
    //                 'border-width': 3,
    //                 'border-style': 'solid',
    //                 'border-color': 'lightblue'

    //             }
    //         },
    //         {
    //             selector: 'edge',
    //             style: {
    //                 'curve-style': 'bezier',
    //                 'label': 'data(customLabel)',
    //                 'text-background-color': 'lightyellow',
    //                 'text-background-opacity': 1,
    //                 'width': '6px',
    //                 'target-arrow-shape': 'triangle',
    //                 'control-point-step-size': '140px'
    //             }
    //         },
    //         {
    //             selector: ':selected',
    //             style: {
    //               'border-width': 3,
    //               'border-style': 'solid',
    //               'border-color': 'blue'
    //             }
    //           }
    //     ],
    //     wheelSensitivity: 0.5,
    //     userZoomingEnabled: true,
    //     minZoom: 0.1,
    //     maxZoom: 3,
    // });

    var testdata = test1();

    allNodes = testdata.nodes;
    allEdges = testdata.edges;
    allNodes.forEach(e => {
        var node = {
            group: "nodes",
            data: {
                id: e.id.toString()
            },
            position: {
                x: e.position.x,
                y: e.position.y
            }
        };
        cy1.add(node);
    });

    allEdges.forEach(e => {
        var edge = {
            group: "edges",
            data: {
                id: e.id.toString(),
                source: e.source,
                target: e.target,
                customLabel: "0/" + e.totalCapacity
            }
        };
        cy1.add(edge);
    });
});