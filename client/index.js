const { spawn } = require("child_process");
const WebSocket = require("ws");

/*
node ilogger.js file.log kxTZb3kojMsabMu8o1yzrhhlT3TV8J+aC1WYGsdNvLQSQnyxLiLvhX25mli3g8uP
*/

(function main() {
  let checkStartLogFirstTime = false;
  // const ws = new WebSocket("wss://api.ilogger.io");
  const ws = new WebSocket("ws://localhost:3000");

  const filename = process.argv[2];
  const clientId = process.argv[3];

  const logStream = spawn("tail", ["-f", filename]);

  ws.on("open", function open() {
    const wsMsg = {
      topic: "register_client",
      payload: {
        clientid: clientId,
      },
    };
    ws.send(JSON.stringify(wsMsg));
  });

  ws.on("message", function incoming(data) {
    console.log(data);
  });

  logStream.stdout.on("data", (data) => {
    if (checkStartLogFirstTime) {
      const wsMsg = {
        topic: "client_log",
        payload: {
          data: data.toString("utf8"),
        },
      };
      ws.send(JSON.stringify(wsMsg));
    } else {
      checkStartLogFirstTime = true;
    }
  });
})();
