import { Sequelize, DataTypes } from "sequelize";
import { Client } from "../types/db";

export = (sequelize: Sequelize) => {
  Client.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(254),
      },
      clientid: {
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
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "clients",
      indexes: [
        {
          unique: true,
          fields: ["email", "clientid"],
        },
        {
          unique: true,
          fields: ["email", "name"],
        },
      ],
    },
  );
  Client.sync({ alter: true });
  return Client;
};
