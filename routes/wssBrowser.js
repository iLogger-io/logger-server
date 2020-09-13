const encryption = require('../lib/encryption')
const jwttoken = require('../lib/token')

function verifytoken (_token, ws) {
  if ((_token === null) || (_token === undefined) || (_token === '')) {
    return
  }
  const token = jwttoken.verifyTokenRaw(_token)
  ws.token = token
  ws.email = token.email
  ws.deviceids = []
}

async function registerDeviceID (deviceid, ws) {
  const DeviceidDecrypted = await encryption.decrypt(deviceid)
  if (!ws.deviceids.includes(DeviceidDecrypted)) {
    ws.deviceids.push(DeviceidDecrypted)
  }
}

const wsrouter = function (parseMsg, ws) {
  if (parseMsg.path !== '/token' && ws.token === undefined) {
    return
  }

  switch (parseMsg.path) {
    case '/token':
      verifytoken(parseMsg.token, ws)
      break

    case '/registerDeviceID':
      registerDeviceID(parseMsg.deviceid, ws)
      break
  }
}

module.exports = wsrouter
