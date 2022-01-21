let color = "#000000";
let curserver = 'server1';
let con;
let UUID = 0;
let gridON = true;
let changes = [];

let socket = new WebSocket("ws://nullsmc.ddns.net:8029");



function makeBoard(width, height) {
    let inHTML = "";
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            inHTML += `<div class="cell ${j}/${i}" style="background-color: ${matrix[j][i]}"> </div>`;
        }
    }

    let wi = "";
    for (let i = 0; i < width; i++) {
        wi += "10px "
    }
    document.getElementById("drawing-table").style.gridTemplateColumns = wi;

    document.getElementById("drawing-table").innerHTML = inHTML;
}

function updateColor(colo) {
    color = colo;
}

document.getElementById("drawing-table").addEventListener("click", (e) => {
    if (!e.target.classList.contains("cell")) return;
    e.target.style.backgroundColor = color
    let splitAr = e.target.classList.item(1).split("/");
    matrix[splitAr[0]][splitAr[1]] = color;
    socket.send(JSON.stringify({ com: "update", materials: [{ material: color, locx: splitAr[0], locy: splitAr[1], server: curserver }] }));
});

function dragOn(e) {
    if (!e.target.classList.contains("cell")) return;

    e.target.style.backgroundColor = color
    let splitAr = e.target.classList.item(1).split("/");
    matrix[splitAr[0]][splitAr[1]] = color;
    changes.unshift({ com: "update", material: color, locx: splitAr[0], locy: splitAr[1], server: curserver });
}

document.getElementById("drawing-table").addEventListener("mousedown", () => {
    document.getElementById("drawing-table").addEventListener("mousemove", dragOn);
});
document.addEventListener("mouseup", () => {
    document.getElementById("drawing-table").removeEventListener("mousemove", dragOn);
    socket.send(JSON.stringify({ com: "update", materials: changes }));
    changes = [];
});

socket.onopen = function(e) {
    socket.send(JSON.stringify({ com: "init", server: curserver }));
};

socket.onclose = function(e) {
    alert("Connection to the server has been lost, please refresh your web page");
};

socket.onmessage = function(e) {
    e = JSON.parse(e.data);
    if (e.firstTime != undefined) {
        UUID = e.uuid;
        con = e.connection;
        matrix = e.matrix;
        makeBoard(190, 40);
    } else {
        if (e.server == curserver) {
            for (dat of e.materials) {
                document.getElementsByClassName(`${dat.data.locx}/${dat.data.locy}`)[0].style.backgroundColor = dat.data.material;
            }
        }
    }
};

function swapServers(server) {
    socket.send(JSON.stringify({ id: UUID, prevserv: curserv, newserv: server, con: con, com: "serverswap" }));
}


function showGrid() {
    if (!gridON) {
        document.getElementById("tGrid").style.backgroundColor = "rgba(48, 96, 191, 0.5)";
        document.getElementById("tGrid").style.border = "2px solid rgb(17, 78, 199)";
        const items = document.getElementsByClassName("cell");
        for (ind of items) {
            ind.style.borderLeft = "1px solid #6b6b6b";
            ind.style.borderBottom = "1px solid #6b6b6b";
        }
        gridON = true;
    } else {
        const items = document.getElementsByClassName("cell");
        for (ind of items) {
            ind.style.borderLeft = "none";
            ind.style.borderBottom = "none";
        }
        document.getElementById("tGrid").style.backgroundColor = "transparent";
        document.getElementById("tGrid").style.border = "2px solid transparent";
        gridON = false;
    }
}

function addBorder(elem) {
    document.getElementById("tGrid").style.border = "2px solid rgb(17, 78, 199)";
}

function removeBorder(elem) {
    if (!gridON) {
        document.getElementById("tGrid").style.border = "2px solid transparent";
    }
}