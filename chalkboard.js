let color = "#000000";
let curserver = 'server1';
let con;
let matrix = [];
let UUID = 0;
let socket = new WebSocket("ws://192.168.1.2:8081");

function makeBoard(width, height) {
	let inHTML = "";
	for (let i = 0; i < height; i++) {
	    inHTML += `<div class="cell ${j}/${i}" style="background-color: ${matrix[j][i]}">&nbsp;</div>`;
			for (let j = 0; j < width; j++) {
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
		e.target.style.backgroundColor = ccolor
    let splitAr = e.target.classList.item(1).split("/");
    matrix[splitAr[0]][splitAr[1]] = color;
    socket.send(JSON.stringify({com: "update", material: matrix}))
});

socket.onopen = function (e) {
  socket.send(JSON.stringify({com: "init", server: curserver}));
  alert("dum4");
};

/*socket.onclose = function (e) {
  alert("Connection to the server has been lost, please refresh your web page");
};*/

socket.onmessage = function (e) {
  alert(JSON.stringify(e));
  if (e.data.firstTime != undefined) {
    UUID = e.data.uuid;
    con = e.data.connection;
    matrix = e.data.matrix;
    makeBoard(70, 30);
  }
  else {
    matrix = e.data.matrix;
    makeBoard(70, 30);
  }
};

function swapServers(server) {
  socket.send(JSON.stringify({id: UUID, prevserv: curserv, newserv: server, con: con, com: "serverswap"}));
}
