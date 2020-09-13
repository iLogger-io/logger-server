const express = require('express')
const router = express.Router()
const status = require('../common/status')
const Notification = require('../models/Notifications')
const jwttoken = require('../common/token')

router.post('/getnotifications', async function (req, res) {
  const Url = req.protocol + '://' + req.get('host') + req.originalUrl
  console.log('Url', Url)

  const token = jwttoken.verifyToken(req)
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: 'Token has expired'
    })
  }

  return res.json({
    status: status.SUCCESS,
    msg: 'OK'
  })
})
