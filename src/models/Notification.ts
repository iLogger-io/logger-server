import { Sequelize, DataTypes } from "sequelize";

export = (sequelize: Sequelize) => {
  let Notification: any = sequelize.define("notifications", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(254),
    },
    messages: {
      type: DataTypes.STRING(200),
    },
  });
  Notification.sync({ alter: true });
  return Notification;
};
