const status = require('../lib/status')
const { Notification } = require('../lib/db')
const wssSendMessage = require('./wssSendMessage')

const TYPE = {
  USER: 0,
  ERROR: 1,
  WARNING: 2,
  MATCHCASE: 3,
  REGEX: 4
}

function save (email, type, data) {
  return new Promise(async (resolve, reject) => {
    var ret = {
      status: status.SUCCESS,
      msg: 'OK'
    }

    data.type = type
    const notification = new Notification()
    notification.email = email
    notification.messages = JSON.stringify(data)
    await notification.save()

    ret = {
      status: status.SUCCESS,
      msg: 'Save notification successfully',
      id: notification.id
    }
    resolve(ret)
    return ret
  })
}

async function push (id, deviceid) {
  let ret = {
    status: status.SUCCESS,
    msg: 'OK'
  }
  const notification = await Notification.findOne({ where: { id: id } })
  if (notification === null) {
    ret = {
      status: status.UNKNOWN,
      msg: 'id not found'
    }
    console.log(ret)
    return ret
  }
  const wssdata = {
    command: 'pushNotification',
    messages: JSON.parse(notification.messages),
    deviceid: deviceid
  }
  wssSendMessage.sendBrowserEmail(notification.email, wssdata)
  return ret
}

module.exports.save = save
module.exports.push = push
module.exports.type = TYPE
