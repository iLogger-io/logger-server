const WebSocket = require('ws')
const encryption = require('./lib/encryption')
const wssRoute = require('./routes/wssRoute')
const globalVar = require('./lib/globalVar')
const convert = require('./lib/convert')

// setInterval(() => {
//   console.log(Object.keys(globalVar.wssClientStorage))
// }, 5000)
const init = function (server) {
  const wss = new WebSocket.Server({ server })
  wss.getUniqueID = function () {
    return encryption.genid()
  }

  wss.on('connection', function connection (ws) {
    ws.id = wss.getUniqueID()
    globalVar.wssClientStorage[ws.id] = ws
    ws.isAlive = true
    ws.on('pong', function () {
      this.isAlive = true
    })

    ws.on('message', function incoming (message) {
      if (Buffer.isBuffer(message)) {
        const JsonLength = convert.buf2num(message.slice(0, 2))
        const WssJson = JSON.parse(message.slice(2, JsonLength + 2))
        const dataLength = message.length - JsonLength - 2
        if (dataLength > 0) {
          ws.dataBuf = (message.slice(JsonLength + 2, message.length)).toString('utf8')
        }
        wssRoute(WssJson, ws)
      } else if (typeof (message) === 'string') {
        wssRoute(JSON.parse(message), ws)
      }
    })

    // ws.send('s:something')

    ws.on('close', function close () {
      console.log('close', ws.id)
      delete globalVar.wssClientStorage[ws.id]
    })
  })

  const interval = setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) {
        console.log('ws.isAlive: false', ws.id)
        delete globalVar.wssClientStorage[ws.id]
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(function () {})
    })
  }, 30000)

  wss.on('close', function close () {
    console.log('wss.on close')
    clearInterval(interval)
  })
}

const SendMessageToClient = function (ws, message) {
  ws.send(JSON.stringify(message))
}

module.exports.init = init
module.exports.SendMessageToClient = SendMessageToClient
