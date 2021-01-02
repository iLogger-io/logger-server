const mongoose = require('mongoose')

var LogsSchema = new mongoose.Schema(
  {
    deviceid: {
      type: String,
      required: true
    },
    log: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('logs', LogsSchema)
