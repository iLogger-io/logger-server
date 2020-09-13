function msleep (ms) {
  return new Promise((resolve, reject) => {
    if (isNaN(ms) || ms < 0) {
      reject('invalid_ms')
      return
    }
    setTimeout(resolve, ms)
  })
}

function convertVNtoEN (str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

function MatchRegex (regex, text) {
  return text.match(regex)
}

module.exports.msleep = msleep
module.exports.convertVNtoEN = convertVNtoEN
module.exports.MatchRegex = MatchRegex
