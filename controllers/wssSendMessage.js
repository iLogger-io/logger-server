const globalVar = require('../lib/globalVar')
const wss = require('../wss')

function sendBrowserDeviceid (deviceid, wssdata) {
  for (const key in globalVar.wssClientStorage) {
    if ((globalVar.wssClientStorage[key].token !== undefined) &&
    (globalVar.wssClientStorage[key].deviceids.includes(deviceid))) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata)
    }
  }
}

function sendBrowserEmail (email, wssdata) {
  for (const key in globalVar.wssClientStorage) {
    if ((globalVar.wssClientStorage[key].token !== undefined) &&
    (globalVar.wssClientStorage[key].email === email) &&
    (globalVar.wssClientStorage[key].device === undefined)) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata)
    }
  }
}

function sendDevice (deviceid, wssdata) {
  for (const key in globalVar.wssClientStorage) {
    if ((globalVar.wssClientStorage[key].device !== undefined) &&
      (globalVar.wssClientStorage[key].device === deviceid)) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata)
    }
  }
}

module.exports.sendBrowserDeviceid = sendBrowserDeviceid
module.exports.sendBrowserEmail = sendBrowserEmail
module.exports.sendDevice = sendDevice
