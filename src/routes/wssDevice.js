const encryption = require('../lib/encryption')
const status = require('../lib/status')
const { msleep } = require('../lib/helper')
const { Device } = require('../lib/db')
const Log = require('../models/Logs')
const wssSendMessage = require('../controllers/wssSendMessage')
const globalVar = require('../lib/globalVar')
const notiController = require('../controllers/notifications')
const mail = require('../lib/mail')

function EventChecking (log, TriggerEventSettings) {
  for (const key in TriggerEventSettings) {
    if ((TriggerEventSettings[key] !== false) &&
    (TriggerEventSettings[key] !== '')) {
      switch (key) {
        case 'ErrorLog': {
          const RedCode = ['[0;31m', '[1;31m']
          for (const i in RedCode) {
            if (log.indexOf(RedCode[i]) >= 0) {
              return { Event: key }
            }
          }
          break
        }
        case 'WarningLog': {
          const YellowCode = ['[0;33m', '[01;33m']
          for (const i in YellowCode) {
            if (log.indexOf(YellowCode[i]) >= 0) {
              return { Event: key }
            }
          }
          break
        }
        case 'Matchcase':
          if (log.indexOf(TriggerEventSettings[key]) >= 0) {
            return { Event: key }
          }
          break
        case 'Regex': {
          const regex = new RegExp(TriggerEventSettings[key], 'g')
          const match = log.match(regex)
          if (match !== null) {
            return { Event: key }
          }
          break
        }
      }
    }
  }
  return false
}

async function DeviceSendData (parseMsg, ws) {
  console.log('Path', parseMsg.path)

  var ret = {
    status: status.SUCCESS,
    msg: 'OK'
  }

  let StringData = ws.dataBuf
  StringData = StringData.replace(/\r\n/g, '\n')
  StringData = StringData.replace(/\n\r/g, '\n')
  StringData = StringData.replace(/\r/g, '\n')
  var logs = StringData.split('\n')

  if ((ws.dataLogRemain !== undefined) && (ws.dataLogRemain !== null)) {
    logs[0] = ws.dataLogRemain + logs[0]
    ws.dataLogRemain = null
  }

  if (logs[logs.length - 1] !== '') {
    ws.dataLogRemain = logs[logs.length - 1]
  }
  logs.pop()

  if ((logs.length === 1) && logs[0] === '') {
    console.log('Space log')
  }

  /* Remove space in logs */
  logs = logs.filter(i => i !== ' ')
  logs = logs.filter(i => i !== '')
  console.log('logs', logs)

  if (logs.length === 0) {
    return
  }

  var DeviceidDecrypted
  try {
    DeviceidDecrypted = await encryption.decrypt(parseMsg.deviceid)
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: 'Wrong device id'
    }
    console.log(ret)
    return
  }

  const device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } })

  if (ret.status !== status.SUCCESS) {
    console.log(ret)
    return
  }

  if (device === null) {
    ret = {
      status: status.UNKNOWN,
      msg: 'Wrong device id'
    }
    console.log(ret)
    return
  }

  const DeviceSettings = JSON.parse(device.settings)
  let checkSaveLog = false
  for (const i in logs) {
    if (logs[i].length === 0) {
      continue
    }

    checkSaveLog = true
    var log = new Log()
    log.deviceid = device.deviceid
    log.log = logs[i]
    await log.save(async function (err, _log) {
      if (err) {
        console.log(err.code)
        ret = {
          status: status.UNKNOWN,
          msg: err.message
        }
      }
      log = _log
    })
    if (ret.status !== status.SUCCESS) {
      return
    }

    const TriggerEvents = EventChecking(logs[i], DeviceSettings.TriggerEvents)
    if (TriggerEvents !== false) {
      let type
      switch (TriggerEvents.Event) {
        case 'ErrorLog':
          type = notiController.type.ERROR
          break
        case 'WarningLog':
          type = notiController.type.WARNING
          break
        case 'Matchcase':
          type = notiController.type.MATCHCASE
          break
        case 'Regex':
          type = notiController.type.REGEX
          break
      }
      const notiRet = await notiController.save(device.email, type, { msg: `Found ${TriggerEvents.Event}`, data: logs[i] })
      notiController.push(notiRet.id, parseMsg.deviceid)
      if (DeviceSettings.PushNotifications.Email) {
        const content = `
        <h2 style="padding-left: 30px;">Found&nbsp; ${TriggerEvents.Event}</h2>
        <ul>
        <li>Device id: ${parseMsg.deviceid}</li>
        <li>log: ${log.log}</li>
        <li>datetime: ${log.createdAt}</li>
        </ul>`
        mail.send(device.email, 'iLogger Notifications', content)
      }
    }
    await msleep(2)
  }
  if (checkSaveLog) {
    const newupdate = {
      command: 'pushlog',
      db: 'logs',
      // _id: log._id,
      // createdAt: log.createdAt,
      deviceid: parseMsg.deviceid
    }
    wssSendMessage.sendBrowserDeviceid(DeviceidDecrypted, newupdate)
    ret = {
      status: status.SUCCESS,
      msg: 'Push log successfully'
    }
    console.log(ret)
    return ret
  }
}

async function registerDevice (deviceid, ws) {
  const DeviceidDecrypted = await encryption.decrypt(deviceid)
  var ret = {
    status: status.SUCCESS,
    msg: 'OK'
  }
  if (encryption.validateid(DeviceidDecrypted)) {
    const device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } })

    if (device === null) {
      ret = {
        status: status.UNKNOWN,
        msg: 'Wrong device id'
      }
      delete globalVar.wssClientStorage[ws.id]
      ws.terminate()
      return console.log(ret)
    }

    ws.device = deviceid

    return console.log({
      status: status.SUCCESS,
      msg: 'Register device successfully'
    })
  }
}

const wsrouter = function (parseMsg, ws) {
  switch (parseMsg.path) {
    case '/DeviceSendData':
      ws.dataBuf = parseMsg.data
      DeviceSendData(parseMsg, ws)
      break
    case '/DeviceSendDataIoT':
      DeviceSendData(parseMsg, ws)
      break
    case '/registerDevice':
      registerDevice(parseMsg.deviceid, ws)
      break
  }
}

module.exports = wsrouter
