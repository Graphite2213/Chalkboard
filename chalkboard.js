let color = "#000000";
let curserver = 'server1';
let con;
let user = 'Default';
let tool = "brush";
let size = 1;
let UUID = 0;
let gridON = true;
let changes = [];

let socket = new WebSocket("wss://nullsmc.ddns.net:8029");

user = prompt("Please enter your preferred username:");

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
    let splitAr = e.target.classList.item(1).split("/");
    switch (tool) {
        case 'brush':
            console.log(`${parseInt(splitAr[0] + 1)}/${splitAr[1]}`);
            switch (size) {
                case 1:
                    e.target.style.backgroundColor = color;
                    socket.send(JSON.stringify({ com: "update", materials: [{ material: color, locx: splitAr[0], locy: splitAr[1], server: curserver }] }));
                    break;

                case 2:
                    e.target.style.backgroundColor = color;
                    document.getElementsByClassName(`${parseInt(splitAr[0]) + 1}/${splitAr[1]}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${parseInt(splitAr[0]) - 1}/${splitAr[1]}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${splitAr[0]}/${parseInt(splitAr[1]) + 1}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${splitAr[0]}/${parseInt(splitAr[1]) - 1}`)[0].style.backgroundColor = color;
                    socket.send(JSON.stringify({ com: "update", materials: [{ material: color, locx: splitAr[0], locy: splitAr[1], server: curserver }, { material: color, locx: parseInt(splitAr[0]) + 1, locy: splitAr[1], server: curserver }, { material: color, locx: parseInt(splitAr[0]) - 1, locy: splitAr[1], server: curserver }, { material: color, locx: splitAr[0], locy: parseInt(splitAr[1]) + 1, server: curserver }, { material: color, locx: splitAr[0], locy: parseInt(splitAr[1]) - 1, server: curserver }] }));
                    break;
            }
            break;

        case 'square':
            drawSquare(splitAr[0], splitAr[1]);
            break;
    }
});

function dragOn(e) {
    if (!e.target.classList.contains("cell")) return;
    let splitAr = e.target.classList.item(1).split("/");
    switch (tool) {
        case 'brush':
            console.log(size);
            switch (size) {
                case 1:
                    e.target.style.backgroundColor = color
                    changes.unshift({ com: "update", material: color, locx: splitAr[0], locy: splitAr[1], server: curserver });
                    break;

                case 2:
                    e.target.style.backgroundColor = color;
                    document.getElementsByClassName(`${parseInt(splitAr[0]) + 1}/${splitAr[1]}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${parseInt(splitAr[0]) - 1}/${splitAr[1]}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${splitAr[0]}/${parseInt(splitAr[1]) + 1}`)[0].style.backgroundColor = color;
                    document.getElementsByClassName(`${splitAr[0]}/${parseInt(splitAr[1]) - 1}`)[0].style.backgroundColor = color;
                    changes.unshift({ material: color, locx: splitAr[0], locy: splitAr[1], server: curserver }, { material: color, locx: `${parseInt(splitAr[0]) + 1}`, locy: splitAr[1], server: curserver }, { material: color, locx: `${parseInt(splitAr[0]) - 1}`, locy: splitAr[1], server: curserver }, { material: color, locx: splitAr[0], locy: `${parseInt(splitAr[1]) + 1}`, server: curserver }, { material: color, locx: splitAr[0], locy: `${parseInt(splitAr[1]) - 1}`, server: curserver });
                    break;
            }

            break;
    }
}

document.getElementById("drawing-table").addEventListener("mousedown", () => {
    document.getElementById("drawing-table").addEventListener("mousemove", dragOn);
});
document.addEventListener("mouseup", () => {
    document.getElementById("drawing-table").removeEventListener("mousemove", dragOn);
    const unique = Array.from(new Set(changes.map(a => `${a.locx}/${a.locy}`)))
        .map(id => {
            return changes.find(a => `${a.locx}/${a.locy}` === id)
        })
    socket.send(JSON.stringify({ com: "update", materials: unique }));
    changes = [];
});

socket.onopen = function(e) {
    socket.send(JSON.stringify({ com: "init", server: curserver }));
};

function changeServers() {
    curserver = document.getElementById("serverpicker").value;
    socket.send(JSON.stringify({ com: "init", server: curserver }));
}

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
    } else if (e.msg != undefined) {
        if (e.server == curserver) {
            addMessage(e.msg, e.user);
        }
    } else {
        if (e.server == curserver) {
            for (dat of e.materials) {
                document.getElementsByClassName(`${dat.data.locx}/${dat.data.locy}`)[0].style.backgroundColor = dat.data.material;
            }
        }
    }
};


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

function switchTO(item, elem) {
    tool = item;
    elem.style.backgroundColor = "rgba(48, 96, 191, 0.5)";
    elem.style.border = "2px solid rgb(17, 78, 199)";
}

function drawSquare(locx, locy) {
    console.log(locx, locy)
    switch (size) {
        case 1:
            document.getElementsByClassName(`${locx}/${locy}`)[0].style.backgroundColor = color;
            document.getElementsByClassName(`${locx - 1}/${locy}`)[0].style.backgroundColor = color;
            document.getElementsByClassName(`${locx}/${locy - 1}`)[0].style.backgroundColor = color;
            document.getElementsByClassName(`${locx - 1}/${locy - 1}`)[0].style.backgroundColor = color;
            socket.send(JSON.stringify({ com: "update", materials: [{ material: color, locx: locx, locy: locy, server: curserver }, { material: color, locx: locx - 1, locy: locy, server: curserver }, { material: color, locx: locx, locy: locy - 1, server: curserver }, { material: color, locx: locx - 1, locy: locy - 1, server: curserver }] }));
            break;
    }
}

function changeSizes() {
    size = parseInt(document.getElementById("sizepicker").value);
}

document.addEventListener('keypress', sendOnKeypress);

function sendOnKeypress(e) {
    if (e.code == "Enter") sendMessage();
}

function sendMessage() {
    let msg = document.getElementById("chatinput").value;
    if (msg == "") return;
    addMessage(msg, user);
    socket.send(JSON.stringify({ com: "message", msg: msg, user: user, server: curserver }));
    document.getElementById("chatinput").value = "";
}

function addMessage(m, u) {
    let fustr = `<br>${u} >> ${m}`;
    let addr = document.getElementById("chatbody").innerHTML.concat(fustr).substring(document.getElementById("chatbody").innerHTML.concat(`${fustr}`).length - 850, document.getElementById("chatbody").innerHTML.concat(fustr).length);
    document.getElementById("chatbody").innerHTML = addr;
}