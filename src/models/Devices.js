const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  var Device = sequelize.define('devices', {
    email: {
      type: DataTypes.STRING(254)
    },
    deviceid: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    settings: {
      type: DataTypes.STRING(2000),
      defaultValue: JSON.stringify(
        {
          TriggerEvents: {
            ErrorLog: false,
            WarningLog: false,
            Matchcase: '',
            Regex: ''
          },
          PushNotifications: {
            Email: false,
            Browser: false
          }
        }
      )
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email', 'deviceid']
      },
      {
        unique: true,
        fields: ['email', 'name']
      }
    ]
  })
  Device.sync({ alter: true })
  return Device
}