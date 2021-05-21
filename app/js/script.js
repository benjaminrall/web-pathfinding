let gridSize = 50;
let totalNodes = gridSize * gridSize;
let grid = document.getElementById("node-container");
let nodes = []
let lastInteraction = -1;
let hoveringNode = null;
let mouseDown = [false, false, false, false, false, false, false, false, false]
let nodeDivs = document.querySelectorAll(".node")
let startNode = null;
let endNode = null;
let openNodes = [];
let closedNodes = [];
let pathNodes = [];
let pathfinding = false;

class GridNode {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.state = "empty";
        this.g = null;
        this.h = null;
        this.f = null;
        this.neighbours = []
        this.previousNode = null;
    }
}

reset()

function makeGrid(){
    grid.innerHTML = "";

    nodes = []
    for (let row = 0; row < gridSize; row++){
        for (let col = 0; col < gridSize; col++){
            nodes.push(new GridNode(col, row))
        }
    }

    for (let row = 0; row < gridSize; row++){

        let nodeRow = document.createElement("div")

        nodeRow.classList.add("node-row")
        nodeRow.setAttribute("id", `R${row}`)
        nodeRow.style.width = "100%"
        nodeRow.style.height = `${(1 / gridSize) * 100}%`
        grid.appendChild(nodeRow)

        for (let col = 0; col < gridSize; col++){

            let node = document.createElement("div")

            node.classList.add("node")
            node.setAttribute("id", `N${col},${row}`)
            node.style.width = `${(1 / gridSize) * 100}%`
            node.style.height = "100%"
            nodeRow.appendChild(node)
        }
    }

    startNode = null;
    endNode = null;
    setStart(getNodeCoord(2, 2))
    setEnd(getNodeCoord(gridSize - 3, gridSize - 3))

    // console.log(`Made new grid of size ${gridSize}`)
}

function getNodeDivCoord(x, y){
    return document.getElementById(`N${x},${y}`)
}

function getNodeDiv(node){
    return document.getElementById(`N${node.x},${node.y}`)
}

function getNodeCoord(x, y){
    return nodes[(y * gridSize) + x]
}

function getNode(id){
    let pos = id.substring(1).split(",");
    let x = parseInt(pos[0]);
    let y = parseInt(pos[1]);
    return nodes[(y * gridSize) + x]
}

function setEmpty(node){
    let oi = openNodes.indexOf(node)
    let ci = closedNodes.indexOf(node)
    let pi = pathNodes.indexOf(node)
    if (oi > -1){
        openNodes.splice(oi, 1);
    } else if (ci > -1){
        closedNodes.splice(ci, 1);
    } else if (pi > -1){
        pathNodes.splice(pi, 1);
    }
    node.state = "empty"
    getNodeDiv(node).style.backgroundColor = "var(--empty-node)"
}

function setBlocked(node){
    node.state = "blocked"
    getNodeDiv(node).style.backgroundColor = "var(--blocked-node)"
}

function setStart(node){
    if (startNode !== null)
        setEmpty(startNode)
    node.state = "start"
    getNodeDiv(node).style.backgroundColor = "var(--start-node)"
    startNode = node
}

function setEnd(node){
    if (endNode !== null)
        setEmpty(endNode)
    node.state = "end"
    getNodeDiv(node).style.backgroundColor = "var(--end-node)"
    endNode = node
}

function setOpen(node){
    node.state = "open"
    getNodeDiv(node).style.backgroundColor = "var(--open-node)"
    openNodes.push(node)
}

function setClosed(node){
    node.state = "closed"
    getNodeDiv(node).style.backgroundColor = "var(--closed-node)"
    closedNodes.push(node)
}

function setPath(node){
    node.state = "path"
    getNodeDiv(node).style.backgroundColor = "var(--path-node)"
    pathNodes.push(node)
}

function swapNode(node){
    if (pathfinding){
        return
    }
    if (node.state === "empty" && (lastInteraction === -1 || lastInteraction === 0)){
        setBlocked(node)
        lastInteraction = 0
    } else if (node.state === "blocked" && (lastInteraction === -1 || lastInteraction === 1)){
        setEmpty(node)
        lastInteraction = 1
    } else if (node.state === "start" && lastInteraction === -1){
        lastInteraction = 2
    } else if (node.state === "empty" && lastInteraction === 2){
        setStart(node)
    } else if (node.state === "end" && lastInteraction === -1){
        lastInteraction = 3
    } else if (node.state === "empty" && lastInteraction === 3){
        setEnd(node)
    }
}

function reset(){
    makeGrid()
    totalNodes = gridSize * gridSize;
    hoveringNode = null;
    lastInteraction = -1
    openNodes = []
    closedNodes = []
    nodeDivs = document.querySelectorAll(".node")
    for (let i = 0; i < nodeDivs.length; i++) {
        nodeDivs[i].addEventListener('mouseenter', function (e) {
            hoveringNode = document.querySelector('.node:hover');
            if (mouseDown[0]){
                swapNode(getNode(hoveringNode.id))
            }
        });
    }
}

function detectMinScreen(x) {
    if (x.matches) {
        gridSize = 20
        reset()
    }
}

function detectMidScreen(x) {
    if (x.matches) {
        gridSize = 35
        reset()
    }
}

function detectMaxScreen(x){
    if (x.matches){
        gridSize = 50
        reset()
    }
}

let maxSize = window.matchMedia("(min-width: 1297px)")
let midSize = window.matchMedia("(max-width: 1296px) and (min-width: 769px)")
let minSize = window.matchMedia("(max-width: 768px)")
detectMinScreen(minSize)
detectMidScreen(midSize)
detectMaxScreen(maxSize)
minSize.addListener(detectMinScreen)
midSize.addListener(detectMidScreen)
maxSize.addListener(detectMaxScreen)

grid.onmousedown = function(evt) { 
    mouseDown[evt.button] = true;
    if (evt.button === 0 && hoveringNode !== null){
        swapNode(getNode(hoveringNode.id))
    } else if (evt.button === 1){
        reset()
    }
}
document.body.onmouseup = function(evt) {
    mouseDown[evt.button] = false;
    lastInteraction = -1
}   