let gridSize = 50;
let totalNodes = gridSize * gridSize;
let grid = document.getElementById("node-container");

class GridNode {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.g = null;
        this.h = null;
        this.f = null;
        this.neighbours = []
        this.previousNode = null;
    }
}

function makeGrid(){
    grid.innerHTML = "";

    let nodes = []
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

    getNodeDiv(2, 2).style.backgroundColor = "var(--start-node)"
    getNodeDiv(gridSize - 3, gridSize - 3).style.backgroundColor = "var(--end-node)"

    console.log(`Made new grid of size ${gridSize}`)
}

function getNodeDiv(x, y){
    return document.getElementById(`N${x},${y}`)
}

function detectMinScreen(x) {
    if (x.matches) {
        gridSize = 20
        makeGrid()
    }
}

function detectMidScreen(x) {
    if (x.matches) {
        gridSize = 35
        makeGrid()
    }
}

function detectMaxScreen(x){
    if (x.matches){
        gridSize = 50
        makeGrid()
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

makeGrid()

//let 