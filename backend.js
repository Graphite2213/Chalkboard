const password = "qH5wLEAtsgmPLqS3bzghdkteMjWa5jnS46DzQtmVDpVJy9mks93s9dWuzMPVdE8j";
const Keyv = require("keyv");
const keyv = new Keyv(`mysql://root:${password}@localhost:3306/website3`);
const http = require('http');
const ws = require('ws');
// const { v4: uuidv4 } = require('uuid');

async function firstTime() {
  let table = await keyv.get("main");
  let empty = [];
  for (let i = 0; i < 70; i++) {
    empty[i] = [];
    let boi = empty[i];
    for (let j = 0; j < 30; j++) {
      boi[j] = '#FFFFFF';
    }
  }
  table.server1 = empty;
  table.server2 = empty;
  table.server3 = empty;
  table.server4 = empty;
  table.server5 = empty;
  table.glob = 0;
  keyv.set("main", table);
  console.log("Finished first time setup");
}

connectionss1 = [];
connectionss2 = [];
connectionss3 = [];
connectionss2 = [];
connectionss5 = [];
const wss = new ws.WebSocketServer({ port: 8081 });

wss.on('connection', (con) => {
  con.on('message', async (data) => {
    let table = await keyv.get("main");
    if (data.com == "init") {
      retobj = {
        uuid: uuidv4(),
        server: data.server,
        connection: con,
        matrix: table[data.server]
      };
      getSS(data.server).unshift({connection: con, uuid: retobj.uuid});
      con.send(retobj);
    }
    else if (data.com == "update") {
      table[data.server] = data.matrix;
      for (let i = 0; i < getSS(data.server).length(); i++) {
        getSS(data.server).connection.send({matrix: table[data.server]});
      }
    }
    else if (data.com == "serverswap") {
      getSS(data.prevserv).splice(getSS(data.prevserv).findIndex({connection: data.con, uuid: data.id}));
      getSS(data.newserv).unshift({connection: data.con, uuid: data.id});
      data.con.send({matrix: table[data.newserv]});
    }
  });
});

const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("My first server!");
};

const server = http.createServer(requestListener);
server.listen(8088, "192.168.1.2", () => {
    console.log(`Server is running on http://localhost:${8088}`);
});
function getSS (server) {
  switch (server) {
        case "server1":
           return connectionss1;
           break;
      
        case "server2":
           return connectionss2;
           break;
           
        case "server3":
           return connectionss3;
           break;
        
        case "server4":
           return connectionss4;
           break;
           
       case "server5":
           return connectionss5;
           break;
      }
}

console.log("Listening...");