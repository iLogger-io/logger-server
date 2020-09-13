const { Sequelize } = require('sequelize')
const config = require('../config/user.json')
const status = require('./status')
const UserModel = require('../models/Users')
const DeviceModel = require('../models/Devices')
const NotificationModel = require('../models/Notifications')

const LOG_ERROR = 'LOG_ERROR'
const LOG_WARNING = 'LOG_WARNING'
const LOG_COMMON = 'LOG_COMMON'
const myconsole = new (require('./console_log'))([LOG_ERROR, LOG_WARNING, LOG_COMMON])

let DBoptions = {}

if (process.env.NODE_ENV === 'development') {
  DBoptions = {
    user: config.DBusername,
    host: 'localhost',
    database: config.DBname,
    password: config.DBpassword,
    port: 5432
  }
} else if (process.env.NODE_ENV === 'production') {
  DBoptions = {
    user: config.DBusername,
    host: config.hostIP,
    database: config.DBname,
    password: config.DBpassword,
    port: 5432
  }
}

const sequelize = new Sequelize(DBoptions.database, DBoptions.user, DBoptions.password, {
  host: DBoptions.host,
  dialect: 'postgres',
  logging: false
})

const User = UserModel(sequelize)
const Device = DeviceModel(sequelize)
const Notification = NotificationModel(sequelize)

User.hasMany(Device, {
  foreignKey: {
    name: 'email',
    allowNull: false
  },
  onDelete: 'cascade',
  hooks: true
})

User.hasMany(Notification, {
  foreignKey: {
    name: 'email',
    allowNull: false
  },
  onDelete: 'cascade',
  hooks: true
})

sequelize.sync({ alter: true })

module.exports = {
  User,
  Device,
  Notification
}
