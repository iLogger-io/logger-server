const Reset = '\x1b[0m'
// const Bright = '\x1b[1m'
// const Dim = '\x1b[2m'
// const Underscore = '\x1b[4m'
// const Blink = '\x1b[5m'
// const Reverse = '\x1b[7m'
// const Hidden = '\x1b[8m'

// const FgBlack = '\x1b[30m'
const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'
const FgYellow = '\x1b[33m'
const FgBlue = '\x1b[34m'
const FgMagenta = '\x1b[35m'
const FgCyan = '\x1b[36m'
const FgWhite = '\x1b[37m'

// const BgBlack = '\x1b[40m'
// const BgRed = '\x1b[41m'
// const BgGreen = '\x1b[42m'
// const BgYellow = '\x1b[43m'
// const BgBlue = '\x1b[44m'
// const BgMagenta = '\x1b[45m'
// const BgCyan = '\x1b[46m'
// const BgWhite = '\x1b[47m'

const ColorArray = [FgRed, FgYellow, FgWhite, FgBlue, FgGreen, FgCyan, FgMagenta]
// const ColorArray = [BgWhite, BgBlue, BgGreen, BgCyan, BgMagenta, BgRed, BgYellow]

/* Constructor */
function InitLog (InitLevel) {
  this.level = InitLevel
  this.ColorMap = {}
  for (const i in InitLevel) {
    if (i < ColorArray.length) {
      this.ColorMap[InitLevel[i]] = ColorArray[i % ColorArray.length]
    } else {
      this.ColorMap[InitLevel[i]] = ColorArray[2] // FgWhite
    }
  }
}

/* class methods */
InitLog.prototype.log = function log () {
  var level = arguments['0']

  for (var _level in this.level) {
    if (this.level[_level] === 0) { return }
    if (level === this.level[_level]) {
      // let args = Array.prototype.slice.call(arguments, 1);
      // console.log.apply( this, args );
      arguments['0'] = `${this.ColorMap[level]}${arguments['0']}${Reset}`
      console.log.apply(this, arguments)
    }
  }
}
/* export the class */
module.exports = InitLog
