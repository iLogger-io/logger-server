const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  var Notification = sequelize.define('notifications', {
    email: {
      type: DataTypes.STRING(254)
    },
    messages: {
      type: DataTypes.STRING(200)
    }
  })
  Notification.sync({ alter: true })
  return Notification
}
