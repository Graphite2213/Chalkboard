const password = require("./creds.json").password;
const Keyv = require("keyv");
const keyv = new Keyv(`mysql://root:${password}@localhost:3306/website3`);
const http = require('http');
const ws = require('ws');
const { v4: uuidv4 } = require('uuid');

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
connectionss4 = [];
connectionss5 = [];
const wss = new ws.WebSocketServer({ port: 8081 });

wss.on('connection', (con) => {
  con.on('message', async (data) => {
    data = JSON.parse(data.toString());
    let table = await keyv.get("main");
    if (data.com == "init") {
      retobj = {
        uuid: uuidv4(),
        server: data.server,
        connection: con,
        matrix: table[data.server],
        firstTime: 1,
      };
      getSS(data.server).unshift({connection: con, uuid: retobj.uuid});
      con.send(JSON.stringify(retobj));
    }
    else if (data.com == "update") {
      table[data.server][data.locx][data.locy] = data.material;
      console.log(data.material);
      keyv.set("main", table);
      wss.clients.forEach(function each(client) {
      if (client !== con && client.readyState === ws.WebSocket.OPEN) {
        client.send(JSON.stringify({material: data.material, locx: data.locx, locy: data.locy, server: data.server}), { binary: false });
        }
      });
    }
    else if (data.com == "serverswap") {
      getSS(data.prevserv).splice(getSS(data.prevserv).findIndex({connection: data.con, uuid: data.id}));
      getSS(data.newserv).unshift({connection: data.con, uuid: data.id});
      data.con.send(JSON.stringify({matrix: table[data.newserv]}));
    }
  });
  
  
  con.on('close', (las) => {
    let fullar = [connectionss1, connectionss2, connectionss3, connectionss4, connectionss5];
    
    for (item of fullar) {
      for (let i = 0; i < item.length; i++) { 
        if (item[i].connection._socket == las._socket) {
          item.splice(i, 1);
        }
      }
    }
    connectionss1 = fullar[0];
    connectionss2 = fullar[1];
    connectionss3 = fullar[2];
    connectionss4 = fullar[3];
    connectionss5 = fullar[4];
});
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