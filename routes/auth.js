const express = require('express')
const passport = require('passport')
const router = express.Router()
const { User } = require('../lib/db')
const status = require('../lib/status')
const encryption = require('../lib/encryption')
const mail = require('../lib/mail')
const config = require('../config/user.json')
const jwttoken = require('../lib/token')

router.post('/signup', async function (req, res) {
  const checkuser = await User.findOne({ where: { email: req.body.email } })

  if (checkuser !== null) {
    if (checkuser.emailVerified) {
      return res.json({
        status: status.UNKNOWN,
        msg: 'Email already exists and register successfully'
      })
    } else {
      await checkuser.destroy()
    }
  }

  const emailVerifiedId = encryption.genid()
  const user = new User()
  user.username = req.body.username
  user.email = req.body.email
  user.password = req.body.password
  user.emailVerifiedId = emailVerifiedId

  await user.save()
  const content = `
  <h2 style="color: #2e6c80;">Click on this link to verify your email:</h2>
  <p><strong>&nbsp;<a href="https://${config.domain}/verifyemail?id=${emailVerifiedId}">https://${config.domain}/verifyemail?id=${emailVerifiedId}</a></strong></p>
    `
  mail.send(req.body.email, 'iLogger Email Verification Code', content)

  if (checkuser !== null && checkuser.emailVerified === false) {
    return res.json({
      status: status.UNKNOWN,
      msg: 'Email already exists but has not been verified, please check your mailbox'
    })
  } else {
    return res.json({
      status: status.SUCCESS,
      msg: 'Signup successfully, please check your mailbox to verify your email'
    })
  }
})

router.post('/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) { return next(err) }
    if (user.emailVerified === false) {
      return res.json({
        status: status.UNKNOWN,
        msg: 'Email already exists but has not been verified, please check your mailbox'
      })
    } else if (user) {
      user.token = jwttoken.generateJWT(user)
      return res.json({
        status: status.SUCCESS,
        msg: 'Login successfully',
        user: jwttoken.toAuthJSON(user)
      })
    } else {
      return res.json({
        status: status.UNKNOWN,
        msg: info.message
      })
    }
  })(req, res, next)
})

router.post('/verifyemail', async function (req, res) {
  const user = await User.findOne({ where: { emailVerifiedId: req.body.VerifyEmailId } })

  if (user === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: 'Email verification id has expired'
    })
  }

  if (user.emailVerified === true) {
    return res.json({
      status: status.SUCCESS,
      msg: 'Email has been verified'
    })
  }

  user.emailVerified = true
  await user.save()

  return res.json({
    status: status.SUCCESS,
    msg: 'Email verification done'
  })
})

module.exports = router
