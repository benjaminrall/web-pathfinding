let gridSize = 50;
let totalNodes = gridSize * gridSize;
let grid = document.getElementById("node-container");
let startButton = document.getElementById("start-button");
let pauseButton = document.getElementById("pause-button");
pauseButton.disabled = true;
let clearButton = document.getElementById("clear-button");
let algorithmSelect = document.getElementById("algorithm-select");
let heuristicSelect = document.getElementById("heuristic-select");
let heuristicMode = -1
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
let blockedNodes = [];
let pathfinding = false;
let paused = false;
let pathfindingDone = false;
let pauseDelay = 8

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

    resetValues(){
        this.g = null;
        this.h = null;
        this.f = null;
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
    let bi = blockedNodes.indexOf(node)
    if (oi > -1){
        openNodes.splice(oi, 1);
    } else if (ci > -1){
        closedNodes.splice(ci, 1);
    } else if (pi > -1){
        pathNodes.splice(pi, 1);
    } else if (bi > -1){
        blockedNodes.splice(bi, 1);
    }
    node.state = "empty"
    getNodeDiv(node).style.backgroundColor = "var(--empty-node)"
}

function setBlocked(node){
    node.state = "blocked"
    getNodeDiv(node).style.backgroundColor = "var(--blocked-node)"
    blockedNodes.push(node)
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
    if (pathfinding || pathfindingDone){
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

function distanceBetween(n1, n2){
    xDiff = Math.abs(n1.x - n2.x)
    yDiff = Math.abs(n1.y - n2.y)

    let distance = 0;

    while (xDiff > 0 && yDiff > 0){
        xDiff--;
        yDiff--;
        if (heuristicMode == 0){
            distance += 14;
        } else if (heuristicMode == 1){
            distance += 20
        }
        
    }

    while (xDiff > 0){
        xDiff--;
        distance += 10
    }

    while (yDiff > 0){
        yDiff--;
        distance += 10
    }

    return distance
}

function heuristic(node){
    return distanceBetween(node, endNode)
}

function setNeighbours(node){
    let neighbours = []
    for (let row = -1; row < 2; row++){
        for (let col = -1; col < 2; col++){
            let x = node.x + col
            let y = node.y + row
            if (x >= 0 && y >= 0 && x < gridSize && y < gridSize && !(row === 0 && col === 0)){
                let neighbour = getNodeCoord(x, y)
                if (neighbour.state !== "blocked"){
                    if (row === 0  || col === 0){
                        neighbours.push(neighbour)
                    } else {
                        if ( row < 0 && col < 0){
                            if (!(getNodeCoord(x + 1, y).state === "blocked" && getNodeCoord(x, y + 1).state === "blocked"))
                            {
                                neighbours.push(neighbour)
                            }
                        } else if (row < 0 && col > 0){
                            if (!(getNodeCoord(x - 1, y).state === "blocked" && getNodeCoord(x, y + 1).state === "blocked"))
                            {
                                neighbours.push(neighbour)
                            }
                        } else if (row > 0 && col < 0){
                            if (!(getNodeCoord(x + 1, y).state === "blocked" && getNodeCoord(x, y - 1).state === "blocked"))
                            {
                                neighbours.push(neighbour)
                            }
                        } else if (row > 0 && col > 0){
                            if (!(getNodeCoord(x - 1, y).state === "blocked" && getNodeCoord(x, y - 1).state === "blocked"))
                            {
                                neighbours.push(neighbour)
                            }
                        }
                    }
                }
            }
        }
    }
    node.neighbours = neighbours
}

async function setHeuristic(){
    switch (heuristicSelect.value) {
        case "0":
            heuristicMode = 0;
            break;
        case "1":
            heuristicMode = 1;
            break;
        default:
            alert("Please select a heuristic")
            heuristicMode = -1;
            algorithmSelect.disabled = false;
            heuristicSelect.disabled = false;
            pathfinding = false;
            break;
    }
}

async function startSearch(){

    if (pathfinding){
        startButton.disabled = true;
        startButton.disabled = false;
        pathfinding = false;
        algorithmSelect.disabled = false;
        heuristicSelect.disabled = false;
        return
    }

    if (pathfindingDone){
        startButton.disabled = true;
        startButton.disabled = false;
        startButton.innerHTML = "Start"
        pathfindingDone = false;
        algorithmSelect.disabled = false;
        heuristicSelect.disabled = false;
        stopSearch()
        return
    }

    startButton.disabled = true;
    startButton.disabled = false;

    algorithmSelect.disabled = true;
    heuristicSelect.disabled = true;
    startButton.innerHTML = "Stop";
    pauseButton.disabled = false;


    switch (algorithmSelect.value) {
        case "0":
            pathfinding = true;
            setHeuristic()
            pauseDelay = 8
            if (heuristicMode >= 0){
                await aStar()
            }
            break;
        case "1":
            pathfinding = true;
            setHeuristic()
            pauseDelay = 5
            if (heuristicMode >= 0){
                await djikstras()
            }
            break;
        case "2":
            pathfinding = true;
            setHeuristic()
            pauseDelay = 5
            if (heuristicMode >= 0){
                await breadthFirst()
            }
            break
        case "3":
            pathfinding = true;
            setHeuristic()
            pauseDelay = 8
            if (heuristicMode >= 0){
                await bestFirst()
            }
            break
        default:
            alert("Please select an algorithm");
            algorithmSelect.disabled = false;
            heuristicSelect.disabled = false;
            break;
    }

    pathfinding = false;

    pauseButton.disabled = true;
    pauseButton.innerHTML = "Pause"
    paused = false;

    if (pathfindingDone){
        startButton.innerHTML = "Restart";
    } else {
        startButton.innerHTML = "Start";
    }
}

async function pauseSearch(){
    pauseButton.disabled = true;
    if (paused){
        
        paused = false;
        pauseButton.innerHTML = "Pause"
    } else {
        paused = true;
        pauseButton.innerHTML = "Resume"
    }
    pauseButton.disabled = false;
}

async function stopSearch(){
    pathfinding = false;
    startNode.resetValues()
    endNode.resetValues()
    
    for (let i = openNodes.length - 1; i >= 0; i--){
        if (openNodes[i] !== startNode && openNodes[i] !== endNode){
            openNodes[i].resetValues()
            setEmpty(openNodes[i])
        }
    }
    for (let i = closedNodes.length - 1; i >= 0; i--){
        if (closedNodes[i] !== startNode && closedNodes[i] !== endNode){
            closedNodes[i].resetValues()
            setEmpty(closedNodes[i])
        }
        
    }
    for (let i = pathNodes.length - 1; i >= 0; i--){
        if (pathNodes[i] !== startNode && pathNodes[i] !== endNode){
            pathNodes[i].resetValues()
            setEmpty(pathNodes[i])
        }
    }
    openNodes = []
    closedNodes = []
    pathNodes = []
}

async function clearBlocked(){
    clearButton.disabled = true;
    stopSearch();
    for (let i = blockedNodes.length - 1; i >= 0; i--){
        setEmpty(blockedNodes[i])
    }
    if (pathfindingDone){
        pathfindingDone = false;
        startButton.innerHTML = "Start"
        algorithmSelect.disabled = false;
        heuristicSelect.disabled = false;
    } else {
        algorithmSelect.disabled = false;
        heuristicSelect.disabled = false;
    }
    clearButton.disabled = false;
}

async function aStar(){
    startNode.g = 0
    startNode.h = heuristic(startNode)
    startNode.f = startNode.h
    openNodes.push(startNode)
    while (pathfinding && openNodes.length > 0) {
        let current = await aStarGetCurrent()
        if (current === endNode){
            while (current !== startNode){
                if (current !== endNode){
                    setPath(current)
                }
                current = current.previousNode
            }
            break
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

        openNodes.splice(openNodes.indexOf(current), 1)
        if (current !== startNode && current !== endNode) {
            setClosed(current)
        } else {
            closedNodes.push(current)
        }

        setNeighbours(current)
        for (let i = 0; i < current.neighbours.length; i++){
            let neighbour = current.neighbours[i]
            let tempG = current.g + distanceBetween(current, neighbour)
            if (neighbour.g === null || tempG < neighbour.g){
                if (neighbour.g === null){
                    if (neighbour !== startNode && neighbour !== endNode) {
                        setOpen(neighbour)
                    } else {
                        openNodes.push(neighbour)
                    }
                }
                neighbour.previousNode = current
                neighbour.g = tempG
                neighbour.h = heuristic(neighbour)
                neighbour.f = neighbour.g + neighbour.h
            }
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }
    }
    if (pathfinding){
        pathfindingDone = true;
    } else {
        stopSearch()
    }
}

async function djikstras(){
    startNode.g = 0
    openNodes.push(startNode)

    while (pathfinding && openNodes.length > 0){

        let current = await djikstrasGetCurrent()
        if (current === endNode){
            while (current !== startNode){
                if (current !== endNode){
                    setPath(current)
                }
                current = current.previousNode
            }
            break
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

        openNodes.splice(openNodes.indexOf(current), 1)
        if (current !== startNode && current !== endNode) {
            setClosed(current)
        } else {
            closedNodes.push(current)
        }

        setNeighbours(current)
        for (let i = 0; i < current.neighbours.length; i++){
            let neighbour = current.neighbours[i]
            let tempG = current.g + distanceBetween(current, neighbour)
            if (neighbour.g === null || tempG < neighbour.g){
                if (neighbour.g === null){
                    if (neighbour !== startNode && neighbour !== endNode) {
                        setOpen(neighbour)
                    } else {
                        openNodes.push(neighbour)
                    }
                }
                neighbour.previousNode = current
                neighbour.g = tempG
            }
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

    }
    if (pathfinding){
        pathfindingDone = true;
    } else {
        stopSearch()
    }
}

async function breadthFirst(){
    startNode.g = 0
    openNodes.push(startNode)

    while (pathfinding && openNodes.length > 0){
        let current = openNodes.shift()
        if (current === endNode){
            while (current !== startNode){
                if (current !== endNode){
                    setPath(current)
                }
                current = current.previousNode
            }
            break
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

            if (current !== startNode && current !== endNode) {
            setClosed(current)
        } else {
            closedNodes.push(current)
        }

        setNeighbours(current)
        for (let i = 0; i < current.neighbours.length; i++){
            let neighbour = current.neighbours[i]
            let tempG = current.g + distanceBetween(current, neighbour)
            if (neighbour.g === null || tempG < neighbour.g){
                if (neighbour.g === null){
                    if (neighbour !== startNode && neighbour !== endNode) {
                        setOpen(neighbour)
                    } else {
                        openNodes.push(neighbour)
                    }
                }
                neighbour.previousNode = current
                neighbour.g = tempG
            }
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }
    }
    if (pathfinding){
        pathfindingDone = true;
    } else {
        stopSearch()
    }
}

async function bestFirst(){
    startNode.g = 0
    startNode.h = heuristic(startNode)
    openNodes.push(startNode)

    while (pathfinding && openNodes.length > 0){

        let current = await bestFirstGetCurrent()
        if (current === endNode){
            while (current !== startNode){
                if (current !== endNode){
                    setPath(current)
                }
                current = current.previousNode
            }
            break
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

        openNodes.splice(openNodes.indexOf(current), 1)
        if (current !== startNode && current !== endNode) {
            setClosed(current)
        } else {
            closedNodes.push(current)
        }

        setNeighbours(current)
        for (let i = 0; i < current.neighbours.length; i++){
            let neighbour = current.neighbours[i]
            let tempG = current.g + distanceBetween(current, neighbour)
            if (neighbour.g === null || tempG < neighbour.g){
                if (neighbour.g === null){
                    if (neighbour !== startNode && neighbour !== endNode) {
                        setOpen(neighbour)
                    } else {
                        openNodes.push(neighbour)
                    }
                }
                neighbour.previousNode = current
                neighbour.g = tempG
                neighbour.h = heuristic(neighbour)
            }
        }

        await pause(pauseDelay)

        while (paused && pathfinding){
            await pause(100)
        }

    }
    if (pathfinding){
        pathfindingDone = true;
    } else {
        stopSearch()
    }
}

async function aStarGetCurrent(){
    let minNode = openNodes[0];
    for (let i = 0; i < openNodes.length; i++){
        if (openNodes[i].f < minNode.f){
            minNode = openNodes[i]
        } else if (openNodes[i].f === minNode.f && openNodes[i].h < minNode.h){
            minNode = openNodes[i]
        }
    }
    return minNode
}

async function djikstrasGetCurrent(){
    let minNode = openNodes[0];
    for (let i = 0; i < openNodes.length; i++){
        if (openNodes[i].g < minNode.g){
            minNode = openNodes[i]
        } else if (openNodes[i].g === minNode.g && heuristic(openNodes[i]) === 0){
            minNode = openNodes[i]
        }
    }
    return minNode
}

async function bestFirstGetCurrent(){
    let minNode = openNodes[0];
    for (let i = 0; i < openNodes.length; i++){
        if (openNodes[i].h < minNode.h){
            minNode = openNodes[i]
        }
    }
    return minNode
}

function reset(){
    pathfinding = false;
    pathfindingDone = false;
    makeGrid()
    pathNodes = []
    openNodes = []
    closedNodes = []
    startButton.innerHTML = "Start"
    algorithmSelect.disabled = false;
    heuristicSelect.disabled = false;
    clearBlocked()
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

function pause(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("");
        }, ms);
    });
}

function detectMinScreen(x) {
    if (x.matches) {
        gridSize = 20
        reset()
    }
}

function detectMidScreen(x) {
    if (x.matches) {
        gridSize = 30
        reset()
    }
}

function detectMaxScreen(x){
    if (x.matches){
        gridSize = 40
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