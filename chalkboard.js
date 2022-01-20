let color = "#000000";
let curserver = 'server1';
let con;
let UUID = 0;

let socket = new WebSocket("ws://192.168.1.2:8081");


function makeBoard(width, height) {
	let inHTML = "";
	for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
			  console.log(i + " " + j)
		    inHTML += `<div class="cell ${j}/${i}" style="background-color: ${matrix[j][i]}">&nbsp;</div>`;
			}
	}
				
   let wi = "";
   for (let i = 0; i < width; i++) {
			wi += "10px "
   }
 document.getElementById("drawing-table").style.gridTemplateColumns = wi;
 
 document.getElementById("drawing-table").innerHTML = inHTML;
}

document.getElementById("drawing-table").addEventListener("click", (e) => {
		e.target.style.backgroundColor = color
    let splitAr = e.target.classList.item(1).split("/");
    console.log(color);
    matrix[splitAr[0]][splitAr[1]] = color;
    socket.send(JSON.stringify({com: "update", material: color, locx: splitAr[0], locy: splitAr[1], server: curserver}))
});

socket.onopen = function (e) {
  socket.send(JSON.stringify({com: "init", server: curserver}));
};

socket.onclose = function (e) {
  alert("Connection to the server has been lost, please refresh your web page");
};

socket.onmessage = function (e) {
  e = JSON.parse(e.data);
  if (e.firstTime != undefined) {
    UUID = e.uuid;
    con = e.connection;
    matrix = e.matrix;
    makeBoard(70, 30);
  }
  else {
    if (e.server == curserver) {
      document.getElementsByClassName(`${e.locx}/${e.locy}`)[0].style.backgroundColor = e.material;
    }
  }
};

function swapServers(server) {
  socket.send(JSON.stringify({id: UUID, prevserv: curserv, newserv: server, con: con, com: "serverswap"}));
}

function changeColor(clr) {
  color = clr;
  alert(clr);
}