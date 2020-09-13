const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('../config/user.json')
const secret = config.jwt_secret

console.log('config', config.jwt_secret)

function sign (payload) {
  return jwt.sign(payload, secret)
}

function verifyToken (req) {
  if ((req.headers.authorization && req.headers.authorization.split(' ')[0]) === 'Token' ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      return jwt.verify(token, secret)
    } catch (err) {
      return null
    }
  }
  return null
}

function validPassword (user, password) {
  var hash = crypto
    .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
    .toString('hex')
  return user.password === hash
}

function verifyTokenRaw (token) {
  try {
    return jwt.verify(token, secret)
  } catch (err) {
    return null
  }
}

function generateJWT (user) {
  var today = new Date()
  var exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000)
    }
  )
}

function toAuthJSON (user) {
  return {
    username: user.username,
    email: user.email,
    token: generateJWT(user),
    bio: user.bio,
    image: user.image
  }
}

module.exports.sign = sign
module.exports.verifyToken = verifyToken
module.exports.verifyTokenRaw = verifyTokenRaw
module.exports.validPassword = validPassword
module.exports.generateJWT = generateJWT
module.exports.toAuthJSON = toAuthJSON
