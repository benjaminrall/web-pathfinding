let gridSize = 50;
let totalNodes = gridSize * gridSize;
let grid = document.getElementById("node-container");
let nodes = []
let lastInteraction = -1;
let hoveringNode = null;
let mouseDown = [false, false, false, false, false, false, false, false, false]
let nodeDivs = document.querySelectorAll(".node")

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

makeGrid()

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

}

function setBlocked(node){
    node.state = "blocked"
    getNodeDiv(node).style.backgroundColor = "var(--blocked-node)"
}

function setStart(node){
    node.state = "start"
    getNodeDiv(node).style.backgroundColor = "var(--start-node)"
}

function setEnd(node){
    node.state = "end"
    getNodeDiv(node).style.backgroundColor = "var(--end-node)"
}

function setOpen(node){

}

function setClosed(node){

}

function swapNode(node){
    if (node.state === "empty" && (lastInteraction === -1 || lastInteraction === 0)){
        node.state = "blocked"
        getNodeDiv(node).style.backgroundColor = "var(--blocked-node)"
        lastInteraction = 0
    } else if (node.state === "blocked" && (lastInteraction === -1 || lastInteraction === 1)){
        node.state = "empty"
        getNodeDiv(node).style.backgroundColor = "var(--empty-node)"
        lastInteraction = 1
    }
}

function resetValues(){
    totalNodes = gridSize * gridSize;
    hoveringNode = null;
    nodeDivs = document.querySelectorAll(".node")
    for (let i = 0; i < nodeDivs.length; i++) {
        console.log()
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
        makeGrid()
        resetValues()
    }
}

function detectMidScreen(x) {
    if (x.matches) {
        gridSize = 35
        makeGrid()
        resetValues()
    }
}

function detectMaxScreen(x){
    if (x.matches){
        gridSize = 50
        makeGrid()
        resetValues()
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

document.body.onmousedown = function(evt) { 
    mouseDown[evt.button] = true;
    if (evt.button === 0 && hoveringNode !== null){
        swapNode(getNode(hoveringNode.id))
    }
}
document.body.onmouseup = function(evt) {
    mouseDown[evt.button] = false;
    lastInteraction = -1
}   