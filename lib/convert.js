function num2buf (num) {
  const b = new ArrayBuffer(2)
  new DataView(b).setUint16(0, num)
  return Buffer.from(b)
}

function buf2num (buf) {
  return parseInt(buf.toString('hex'), 16)
}

module.exports.num2buf = num2buf
module.exports.buf2num = buf2num
