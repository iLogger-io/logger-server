import { Sequelize, DataTypes } from "sequelize";

export = (sequelize: Sequelize) => {
  var Device = sequelize.define(
    "devices",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(254),
      },
      deviceid: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      settings: {
        type: DataTypes.STRING(2000),
        defaultValue: JSON.stringify({
          TriggerEvents: {
            ErrorLog: false,
            WarningLog: false,
            Matchcase: "",
            Regex: "",
          },
          PushNotifications: {
            Email: false,
            Browser: false,
          },
        }),
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email", "deviceid"],
        },
        {
          unique: true,
          fields: ["email", "name"],
        },
      ],
    },
  );
  Device.sync({ alter: true });
  return Device;
};
