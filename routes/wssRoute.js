const wssBrowser = require('./wssBrowser')
const wssDevice = require('./wssDevice')

const wsrouter = function (parseMsg, ws) {
  console.log(parseMsg)
  if (parseMsg.path === '/token' || parseMsg.path === '/registerDeviceID') {
    wssBrowser(parseMsg, ws)
  } else if (parseMsg.path === '/DeviceSendData' || parseMsg.path === '/DeviceSendDataIoT' || parseMsg.path === '/registerDevice') {
    wssDevice(parseMsg, ws)
  }
}

module.exports = wsrouter
