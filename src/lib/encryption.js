const crypto = require('crypto')
const { v4: uuidv4, validate } = require('uuid')
const config = require('../config/user.json')

const password = Buffer.from(config.crypto_password)
const iv = Buffer.from(config.crypto_iv)

function genid () {
  return uuidv4()
}

function validateid (uuid) {
  return validate(uuid)
}

function sha1 (input) {
  return crypto.createHash('sha1').update(input).digest()
}

function PasswordDeriveBytes (password, salt, iterations, len) {
  var key = Buffer.from(password + salt)
  for (var i = 0; i < iterations; i++) {
    key = sha1(key)
  }
  if (key.length < len) {
    var hx = PasswordDeriveBytes(password, salt, iterations - 1, 20)
    for (var counter = 1; key.length < len; ++counter) {
      key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))])
    }
  }
  return Buffer.alloc(len, key)
}

async function encrypt (string) {
  var key = PasswordDeriveBytes(password, '', 100, 32)
  var cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv))
  var part1 = cipher.update(string, 'utf8')
  var part2 = cipher.final()
  const encrypted = Buffer.concat([part1, part2]).toString('base64')
  return encrypted
}

async function decrypt (string) {
  var key = PasswordDeriveBytes(password, '', 100, 32)
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv))
  var decrypted = decipher.update(string, 'base64', 'utf8')
  decrypted += decipher.final()
  return decrypted
}

module.exports.validateid = validateid
module.exports.genid = genid
module.exports.encrypt = encrypt
module.exports.decrypt = decrypt
