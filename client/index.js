const { spawn } = require("child_process");
const WebSocket = require("ws");

(function main() {
  let checkStartLogFirstTime = false;
  const ws = new WebSocket("ws://localhost:3000");

  const filename = process.argv[2];
  const logStream = spawn("tail", ["-f", filename]);

  ws.on("open", function open() {
    const wsMsg = {
      topic: "register_client",
      payload: {
        clientid: "kyC2L/WTsr/djoXs8elQQkW6YnTZ4a+/dl/a3+RZBceTZBqxUMFOZLIjifiCUUMH",
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
